import {StaticUtilities} from "../utilities/static.js";

class GraphSelectionManager {
  constructor(cache) {
    this.cache = cache;
  }

  async selectNodes(nodeIDs) {
    await this.selectElements(nodeIDs, this.cache.nodeRef);
  }

  async selectEdges(edgeIDs) {
    await this.selectElements(edgeIDs, this.cache.edgeRef);
  }

  /**
   * Selects given element IDs while deselecting all others
   */
  async selectElements(elementIDs, refMap, stateOverride = "selected") {
    const visibility = {};
    const elementIDsAsSet = new Set(elementIDs);

    for (const elem of refMap.values()) {
      const nodeOrEdgeID = elem.id;
      const state = await this.cache.graph.getElementState(nodeOrEdgeID);
      const shouldSelect = elementIDsAsSet.has(nodeOrEdgeID);

      if (shouldSelect && !state.includes(stateOverride)) state.push(stateOverride);
      if (!shouldSelect && state.includes(stateOverride)) state.splice(state.indexOf(stateOverride), 1);

      visibility[nodeOrEdgeID] = state;
    }

    await this.cache.graph.setElementState(visibility);
  }

  async updateSelectedState(elemData, enable) {
    await this.cache.ui.showLoading(enable ? "Selecting" : "Deselecting", `Modifying selection of ${elemData.length} elements`);
    await new Promise(resolve => requestAnimationFrame(resolve));

    // faster routine than setting each individual setElementState
    const updatedData = [];
    for (const item of elemData) {
      const elem = this.cache.graph.getElementData(item.id);
      this.updateElementSelectedState(elem, enable);
      updatedData.push(elem);
    }
    await this.cache.graph.updateData(updatedData);
    await this.cache.graph.render();

    // Update manual bubble group button state when selection changes
    this.cache.bs.updateManualGroupButtonState();

    await this.cache.ui.hideLoading();
    await new Promise(resolve => requestAnimationFrame(resolve));
  }

  // TODO: is this placed right?
  async getSelectedNodes() {
    return await this.cache.graph.getNodeData().filter(n => n.states?.includes("selected"));
  }

  updateElementSelectedState(element, shouldSelect) {
    if (!element.states) {
      element.states = [];
    }
    if (shouldSelect && !element.states.includes("selected")) {
      element.states.push("selected");
    }
    if (!shouldSelect && element.states.includes("selected")) {
      element.states.splice(element.states.indexOf("selected"), 1);
    }
  }

  async toggleSelectionForAllNodes(enable) {
    const nodes = await this.cache.graph.getNodeData();
    await this.updateSelectedState(nodes, enable);
  }

  async toggleSelectionForAllEdges(enable) {
    const edges = await this.cache.graph.getEdgeData();
    await this.updateSelectedState(edges, enable);
  }

  async syncSelectionCacheAndElementStates() {
    const snapshot = this.cache.selectionMemory[this.cache.selectedMemoryIndex];

    this.cache.selectedNodes = snapshot.nodes;
    this.cache.selectedEdges = snapshot.edges;

    for (const node of this.cache.graph.getNodeData()) {
      this.updateElementSelectedState(node, snapshot.nodes.includes(node.id));
    }
    for (const edge of this.cache.graph.getEdgeData()) {
      this.updateElementSelectedState(edge, snapshot.edges.includes(edge.id));
    }
    await this.cache.graph.render();

    // Update manual bubble group button state when selection is synced (undo/redo)
    this.cache.bs.updateManualGroupButtonState();
  }

  undoSelection() {
    if (this.cache.selectedMemoryIndex > 0) {
      this.cache.selectedMemoryIndex--;
      this.syncSelectionCacheAndElementStates();
    } else {
      this.cache.ui.warning("Cannot undo!");
    }
  }

  redoSelection() {
    if (this.cache.selectionMemory.length > this.cache.selectedMemoryIndex + 1) {
      this.cache.selectedMemoryIndex++;
      this.syncSelectionCacheAndElementStates();
    } else {
      this.cache.ui.warning("Cannot redo!");
    }
  }

  async addNodeOrEdgeIDsToSelectionWrapper(elementIDs, isNode) {
    const shouldAdd = isNode
      ? !document.getElementById("selectByNodeIDsSwitch").checked
      : !document.getElementById("selectByEdgeIDsSwitch").checked;
    const elementIDsAsArray = elementIDs ? elementIDs.split(",") : [];

    await this.addNodeOrEdgeIDsToSelection(elementIDsAsArray, isNode, shouldAdd);
  }

  async addNodeOrEdgeLabelsToSelectionWrapper(elementLabels, isNode) {
    const elementLabelsAsArray = elementLabels ? elementLabels.split(",") : [];

    const elementIDs = elementLabelsAsArray.flatMap(label => {
      const set = isNode
        ? this.cache.nodeLabelToNodeIDs.get(label)
        : this.cache.edgeLabelToEdgeIDs.get(label);
      return set ? Array.from(set) : [];
    });

    const shouldAdd = isNode
      ? !document.getElementById("selectByNodeLabelsSwitch").checked
      : !document.getElementById("selectByEdgeLabelsSwitch").checked;

    await this.addNodeOrEdgeIDsToSelection(elementIDs, isNode, shouldAdd);
  }

  async addNodeOrEdgeIDsToSelection(elementIDs, isNode, shouldAdd) {

    const elemDescription = isNode ? "Node" : "Edge";

    const visibleElements = isNode ? this.cache.nodeIDsToBeShown : this.cache.edgeIDsToBeShown;
    const existingElements = isNode ? this.cache.nodeRef.keys().toArray() : this.cache.edgeRef.keys().toArray();
    const selectedElements = isNode ? this.cache.selectedNodes : this.cache.selectedEdges;
    const ref = isNode ? this.cache.nodeRef : this.cache.edgeRef;

    for (const elemID of elementIDs) {
      if (!existingElements.includes(elemID)) {
        this.cache.ui.error(`${elemDescription} with ID: '${elemID}' does not exist!`);
        continue;
      }

      if (!visibleElements.has(elemID)) {
        this.cache.ui.warning(`Cannot update selection of ${elemDescription} with ID: '${elemID}' as it is not visible.`);
        continue;
      }

      const elementsToUpdate = [];
      if (!selectedElements.includes(elemID) || !shouldAdd) {
        elementsToUpdate.push(ref.get(elemID));
      }

      if (elementsToUpdate.length > 0) {
        await this.updateSelectedState(elementsToUpdate, shouldAdd);
      }
    }
  }

  async toggleSelectionByNeighbors(mode) {
    const edgesToShow = [];
    const edgesToHide = [];
    const nodesToShow = [];
    const nodesToHide = [];

    function isOuterNodeInSelection(nodeID) {
      let neighborsInSelection = 0;

      for (const edgeID of this.cache.nodeIDToEdgeIDs.get(nodeID) || []) {
        const edge = this.cache.edgeRef.get(edgeID);
        if (!edge) continue;

        const neighbor = edge.source === nodeID ? edge.target : edge.source;

        if (this.cache.selectedNodes.includes(neighbor)) {
          neighborsInSelection++;
          if (neighborsInSelection > 1) {
            return false;
          }
        }
      }

      return neighborsInSelection <= 1;
    }

    async function update() {
      if (edgesToShow.length > 0) await this.updateSelectedState(edgesToShow, true);
      if (edgesToHide.length > 0) await this.updateSelectedState(edgesToHide, false);
      if (nodesToShow.length > 0) await this.updateSelectedState(nodesToShow, true);
      if (nodesToHide.length > 0) await this.updateSelectedState(nodesToHide, false);
    }

    switch (mode) {

      case "expand-edges":
        for (let nodeID of this.cache.selectedNodes) {
          for (let edgeID of this.cache.nodeIDToEdgeIDs.get(nodeID) || []) {
            edgesToShow.push(this.cache.edgeRef.get(edgeID));
          }
        }
        break;

      case "reduce-edges":
        for (let edgeID of this.cache.selectedEdges) {
          const edge = this.cache.edgeRef.get(edgeID);
          const connectingNodesAreSelected = this.cache.selectedNodes.includes(edge.source)
            && this.cache.selectedNodes.includes(edge.target);
          connectingNodesAreSelected ? edgesToShow.push(edge) : edgesToHide.push(edge);
        }
        break;

      case "expand-neighbors":
        for (let nodeID of this.cache.selectedNodes) {
          for (let edgeID of this.cache.nodeIDToEdgeIDs.get(nodeID) || []) {
            const edge = this.cache.edgeRef.get(edgeID);
            edgesToShow.push(edge);

            nodesToShow.push(this.cache.nodeRef.get(edge.source));
            nodesToShow.push(this.cache.nodeRef.get(edge.target));
          }
        }
        break;

      case "reduce-neighbors":
        for (const nodeID of this.cache.selectedNodes.filter(isOuterNodeInSelection)) {
          nodesToHide.push(this.cache.nodeRef.get(nodeID));

          for (const edgeID of this.cache.nodeIDToEdgeIDs.get(nodeID) || []) {
            edgesToHide.push(this.cache.edgeRef.get(edgeID));
          }
        }
        break;

      default:
        break;
    }

    await update();
  }

  updateSelectionCache() {
    const {selectedNodes, selectedEdges, selectionMemory, selectedMemoryIndex} = cache;

    // this should never be triggered; in case no snapshot is available, create an empty one
    if (selectionMemory.length === 0) {
      selectionMemory.push({nodes: [], edges: []});
      this.cache.selectedMemoryIndex = 0;
    }

    const currentSnapshot = selectionMemory[selectedMemoryIndex];

    const nodesChanged = !StaticUtilities.arraysAreEqual(currentSnapshot.nodes, selectedNodes);
    const edgesChanged = !StaticUtilities.arraysAreEqual(currentSnapshot.edges, selectedEdges);

    if (nodesChanged || edgesChanged) {

      // In case the user goes back in memory & then changes the selection, clear all memories after the current selection
      if (selectedMemoryIndex < selectionMemory.length - 1) {
        selectionMemory.splice(selectedMemoryIndex + 1);
      }

      // if the memory limit is reached, clear the first entry
      if (selectionMemory.length === this.cache.CFG.MAX_SELECTION_MEMORY) {
        selectionMemory.shift();
        this.cache.selectedMemoryIndex = selectionMemory.length - 1;
      }

      // push new memory, increment index
      selectionMemory.push({
        nodes: [...selectedNodes],
        edges: [...selectedEdges],
      });

      this.cache.selectedMemoryIndex = selectionMemory.length - 1;
    }
  }

  updateEnabledStateUndoRedoSelectionButtons() {
    const {selectionMemory, selectedMemoryIndex} = this.cache;
    const canUndo = (selectedMemoryIndex > 0);
    const canRedo = (selectedMemoryIndex < selectionMemory.length - 1);

    this.cache.ui.toggleDisabledElements(["undoSelectionBtn"], canUndo);
    this.cache.ui.toggleDisabledElements(["redoSelectionBtn"], canRedo);
  }

  async updateSelectedNodesAndEdges() {
    this.cache.selectedNodes = await this.cache.graph.getNodeData()
      .filter((n) => n.states?.includes("selected") && this.cache.nodeIDsToBeShown.has(n.id))
      .map((n) => n.id);
    this.cache.selectedEdges = await this.cache.graph.getEdgeData()
      .filter((e) => e.states?.includes("selected") && this.cache.edgeIDsToBeShown.has(e.id))
      .map((e) => e.id);

    const selectedNodesCount = this.cache.selectedNodes?.length || 0;
    const selectedEdgesCount = this.cache.selectedEdges?.length || 0;

    document.getElementById("selectedNodes").textContent = `${selectedNodesCount}`;
    document.getElementById("selectedEdges").textContent = `${selectedEdgesCount}`;

    const atLeastOneNodeSelected = selectedNodesCount > 0;
    const atLeastOneEdgeSelected = selectedEdgesCount > 0;
    const atLeastOneNodeOrEdgeSelected = atLeastOneNodeSelected || atLeastOneEdgeSelected;
    const moreThanOneNodeSelected = selectedNodesCount > 1;

    if (atLeastOneNodeOrEdgeSelected || this.cache.selectionMemory.length > 1) {
      document.getElementById("selectedElementsContainer").classList.remove("hidden");
    } else {
      document.getElementById("selectedElementsContainer").classList.add("hidden");
    }

    this.cache.ui.toggleStyleElementsThatRequireAtLeastOneSelectedNode(atLeastOneNodeSelected);
    this.cache.ui.toggleStyleElementsThatRequireAtLeastOneSelectedEdge(atLeastOneEdgeSelected);
    this.cache.ui.toggleStyleElementsThatRequireAtLeastOneSelectedNodeOrEdge(atLeastOneNodeOrEdgeSelected);
    this.cache.ui.toggleStyleElementsThatRequireMoreThanOneSelectedNode(moreThanOneNodeSelected);

    this.updateSelectionCache();
    this.updateEnabledStateUndoRedoSelectionButtons();

    if (typeof this.cache.dataTable !== 'undefined' && this.cache.dataTable.fileData) {
      if (this.cache.dataTable.currentTab === 'selectedNodes'
        || this.cache.dataTable.currentTab === 'selectedEdges'
        || this.cache.dataTable.currentTab === 'selectedElements') {
        this.cache.dataTable.refreshCurrentTab();
      }
    }
  }

}

export {GraphSelectionManager}