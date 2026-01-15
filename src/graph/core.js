const {
  Graph,
  NodeEvent,
  EdgeEvent,
  GraphEvent,
  CanvasEvent,
  CommonEvent,
  WindowEvent,
  Layout,
  BaseLayout,
  ExtensionCategory,
  register
} = G6;

import {StaticUtilities} from "../utilities/static.js";
import {replaceColorScale} from "../utilities/color_scale_picker.js";

class GraphCoreManager {
  constructor(cache) {
    this.cache = cache;
    this.BEHAVIOURS = {
      DRAG_ELEMENT: {
        type: 'drag-element',
        cursor: {default: 'default', grab: 'default', grabbing: 'default'},
        shadow: true,
        shadowFill: '#C33D35',
        shadowFillOpacity: 0.5,
        shadowStroke: '#C33D35',
        shadowStrokeOpacity: 1.0,
      },
      DRAG_CANVAS: {
        type: 'drag-canvas',
        key: 'drag-canvas',
        animation: false,
      },
      ZOOM_CANVAS: {
        type: 'zoom-canvas',
        key: 'zoom-canvas',
        animation: false,

      },
      HOVER_ACTIVATE: {
        type: 'hover-activate',
        enable: (event) => {
          return event.targetType === 'node' || event.targetType === 'edge';
        },
        degree: 1,
        state: 'highlight',
        inactiveState: 'dim',
      },
      LASSO_SELECT: {
        type: "lasso-select",
        key: "lasso-select",
        trigger: ["drag"],
        style: {
          fill: '#C33D35',
          fillOpacity: 0.3,
          stroke: '#C33D35'
        },
        enable: (event) => {
          this.cache.ui.debug("LASSO CANVAS CLICK");

          if (!this.cache.CFG.APPLY_BUBBLE_SET_HOTFIX) return true;

          const selected = this.cache.graph.getNodeData().filter(n => n.states?.includes("selected"));

          if (selected.length !== 0) {
            this.cache.ui.debug("PREVENTING LASSO DESELECT EVENT BY REMOVING CANVAS CLICK EVENT");
            const eventHandler = this.cache.graph.getEvents()["canvas:click"];
            this.cache.graph.off("canvas:click");
            setTimeout(() => {
              this.cache.ui.debug("RESTORING CANVAS CLICK EVENT");
              this.cache.graph.on("canvas:click", eventHandler);
            }, 1000);

            return false;
          }
          return true;
        }
      },
      CLICK_SELECT: {
        type: "click-select",
        key: "click-select",
        multiple: true,
        trigger: ["shift"],
      },
    };
  }

  * traverseD4Data(nodeOrEdge) {
    if (!nodeOrEdge.D4Data) return;

    for (let section in nodeOrEdge.D4Data) {
      for (let subsection in nodeOrEdge.D4Data[section]) {
        for (let prop in nodeOrEdge.D4Data[section][subsection]) {
          yield [section, subsection, prop, nodeOrEdge.D4Data[section][subsection][prop]];
        }
      }
    }
  }

  async decideToRenderOrDraw(forceRender = false) {
    await this.cache.ui.showLoading("Loading", "Deciding to render or draw ..");
    await new Promise(resolve => requestAnimationFrame(resolve));

    if (this.cache.EVENT_LOCKS.QUERY_SELECTION_EVENT) {
      this.cache.qm.storeQuery();
    }

    await this.preRenderEvent();
    await this.cache.metrics.updateMetricUI();

    try {
      if (this.cache.bubbleSetChanged || this.cache.styleChanged || this.cache.layoutChanged || forceRender) {
        if (this.cache.styleChanged) {
          await this.cache.ui.showLoading("Loading", "Updating graph ..");
          await new Promise(resolve => requestAnimationFrame(resolve));
          await this.cache.graph.updateData(this.createSimplifiedDataForGraphObject());
          this.cache.styleChanged = false;
          this.cache.labelStyleChanged = false;
        }
        await this.cache.ui.showLoading("Loading", "Rendering graph ..");
        await new Promise(resolve => requestAnimationFrame(resolve));
        return await this.cache.graph.render();
      } else {
        await this.cache.ui.showLoading("Loading", "Redrawing graph ..");
        await new Promise(resolve => requestAnimationFrame(resolve));
        return await this.cache.graph.draw();
      }

      // TODO: might have to move this
      if (this.cache.EVENT_LOCKS.QUERY_SELECTION_EVENT) {
        this.cache.qm.storeQuery();
        this.cache.EVENT_LOCKS.QUERY_SELECTION_EVENT = false;
      }
    } catch (errorMsg) {
      this.cache.ui.error(errorMsg);
      return false;
    } finally {
      await this.cache.ui.hideLoading();
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
  }

  async createGraphInstance() {
    if (this.cache.graph === null) {

      const behaviors = [
        this.BEHAVIOURS.DRAG_CANVAS,
        this.BEHAVIOURS.ZOOM_CANVAS,
        this.BEHAVIOURS.DRAG_ELEMENT
      ];

      if (!this.cache.CFG.DISABLE_HOVER_EFFECT) {
        behaviors.push(this.BEHAVIOURS.HOVER_ACTIVATE);
      }

      const plugins = [
        {
          key: "tooltip",
          type: "tooltip",
          trigger: "click",
          enterable: true,
          getContent: (e, items) => this.cache.toolTips.get(items[0].id),
        },
        {
          key: "minimap",
          type: "minimap",
          position: "bottom-left",
        },
        ...[...this.cache.bs.traverseBubbleSets()].map(group => ({
          key: `bubbleSetPlugin-${group}`,
          type: "bubble-sets",
          members: [],
          avoidMembers: [this.cache.CFG.INVISIBLE_DUMMY_NODE.id],
          // avoidMembers: [...this.cache.nodeRef.keys()],
          ...this.cache.data.bubbleSetStyle[group],
          strokeOpacity: 0,  // hide bubble groups initially (1 node persists due to bug)
          fillOpacity: 0,
          label: false,
        })),
      ];

      this.cache.graph = new Graph({
        container: 'innerGraphContainer',
        autoFit: false,  /* 'view' */
        animation: false,
        autoResize: true,
        padding: 10,
        data: this.createSimplifiedDataForGraphObject(),
        node: {state: {highlight: {fill: '#C33D35', halo: true, lineWidth: 0,}, dim: {fill: '#E4E3EA',},},},
        edge: {state: {highlight: {stroke: '#C33D35',}, selected: {stroke: '#C33D35',}},},
        behaviors: behaviors,
        plugins: plugins,
      })
      ;

      this.cache.graph.on("node:dragend", async () => {
        /**
         * Persist all positions on every drag event
         */
        if (this.cache.EVENT_LOCKS.DRAG_END_RUNNING) return;

        this.cache.ui.debug("DRAG END");
        this.cache.EVENT_LOCKS.DRAG_END_RUNNING = true;
        await this.cache.lm.persistNodePositions();
        this.cache.EVENT_LOCKS.DRAG_END_RUNNING = false;
      })

      this.cache.graph.on("beforelayout", async () => {
        this.cache.ui.debug("BEFORE LAYOUT");
      })

      this.cache.graph.on("afterlayout", async () => {
        /**
         * Applies persisted positions (excel data or after moving nodes) after layouting has finished
         */
        if (this.cache.EVENT_LOCKS.AFTER_LAYOUT_RUNNING) return;

        this.cache.ui.debug("AFTER LAYOUT");
        this.cache.EVENT_LOCKS.AFTER_LAYOUT_RUNNING = true;

        if (this.cache.data.layouts[this.cache.data.selectedLayout].positions.size > 0) {
          this.cache.graph.updateNodeData(Array.from(this.cache.data.layouts[this.cache.data.selectedLayout].positions, ([id, pos]) => ({
            id,
            style: pos.style
          })));
          await this.cache.graph.draw();
        }
        this.cache.EVENT_LOCKS.AFTER_LAYOUT_RUNNING = false;
      })

      this.cache.graph.on("canvas:click", async (event) => {
        this.cache.ui.debug("CANVAS CLICK");
      });

      // this.cache.graph.off("canvas:click");

      this.cache.graph.on("node:click", async (event) => {
        this.cache.ui.debug("NODE CLICK");
      })

      this.cache.graph.on("edge:click", async (event) => {
        this.cache.ui.debug("EDGE CLICK");
      })

      this.cache.graph.on(GraphEvent.BEFORE_DRAW, async (event) => {
        if (this.cache.EVENT_LOCKS.BEFORE_DRAW_RUNNING) return;

        this.cache.EVENT_LOCKS.BEFORE_DRAW_RUNNING = true;
        this.cache.ui.debug("BEFORE DRAW");
        if (this.cache.EVENT_LOCKS.IS_DESELECTING) {
          this.cache.ui.debug("BEFORE DRAW DESELECTION EVENT");
          this.cache.EVENT_LOCKS.IS_DESELECTING = false;
        }
        this.cache.EVENT_LOCKS.BEFORE_DRAW_RUNNING = false;
      });

      this.cache.graph.on(GraphEvent.AFTER_DRAW, async (event) => {
        if (this.cache.EVENT_LOCKS.AFTER_DRAW_RUNNING) return;

        this.cache.EVENT_LOCKS.AFTER_DRAW_RUNNING = true;
        this.cache.ui.debug("AFTER DRAW");
        await this.cache.sm.updateSelectedNodesAndEdges();
        await this.cache.bs.redrawBubbleSets();

        this.cache.EVENT_LOCKS.AFTER_DRAW_RUNNING = false;
        await this.cache.ui.hideLoading();
      });


      this.cache.graph.on(GraphEvent.AFTER_RENDER, async () => {
        this.cache.ui.debug("AFTER RENDER");

        if (this.cache.EVENT_LOCKS.ONCE_AFTER_RENDER_COMPLETED) {
          if (this.cache.EVENT_LOCKS.AFTER_RENDER_RUNNING) return;

          this.cache.EVENT_LOCKS.AFTER_RENDER_RUNNING = true;

          await this.cache.sm.updateSelectedNodesAndEdges();
          await this.cache.bs.redrawBubbleSets();

          this.cache.EVENT_LOCKS.AFTER_RENDER_RUNNING = false;
          await this.cache.ui.hideLoading();
        } else {
          await this.initialAfterRenderEvent();
        }
      });

      let layout = this.cache.data.layouts[this.cache.data.selectedLayout];
      if (!layout.isCustom) {
        await this.cache.graph.setLayout({type: this.cache.data.selectedLayout, ...layout.internals});
      }
    }
  }

  async initialAfterRenderEvent() {
    if (this.cache.EVENT_LOCKS.ONCE_AFTER_RENDER_RUNNING) return;

    try {
      this.cache.ui.debug("ONCE AFTER RENDER");
      await this.cache.ui.showLoading("Post-processing", "Post-processing ..");
      await new Promise(resolve => requestAnimationFrame(resolve));
      this.cache.EVENT_LOCKS.ONCE_AFTER_RENDER_RUNNING = true;

      await this.cache.ui.showLoading("Post-processing", "Registering event listeners ..");
      await new Promise(resolve => requestAnimationFrame(resolve));
      this.registerHotkeyEvents();
      this.registerGlobalEventListeners();
      await this.registerPluginStates();

      // to initially fill caches related to the query/filters, preRenderEvent is called without rendering afterwards
      await this.cache.ui.showLoading("Post-processing", "Pre-render event ..");
      await new Promise(resolve => requestAnimationFrame(resolve));
      await this.preRenderEvent();

      await this.cache.ui.showLoading("Post-processing", "Updating metrics UI ..");
      await new Promise(resolve => requestAnimationFrame(resolve));
      await this.cache.metrics.updateMetricUI();

      await this.cache.ui.showLoading("Post-processing", "Finalizing rendering ..");
      await new Promise(resolve => requestAnimationFrame(resolve));

      if (this.cache.EVENT_LOCKS.TRIGGER_SET_LAYOUT_ONCE) {
        // suppresses the info in case of loading from a json model
        if (this.cache.nodePositionsFromExcelImport.size !== 0) {
          this.cache.ui.info(`Created view "${this.cache.DEFAULTS.CUSTOM_LAYOUT_NAME}". Applying ${this.cache.DEFAULTS.LAYOUT} layout to nodes without coordinates ..`);
        }
        await this.cache.graph.setLayout({type: this.cache.DEFAULTS.LAYOUT, ...this.cache.DEFAULTS.LAYOUT_INTERNALS[this.cache.DEFAULTS.LAYOUT]});
      }

      this.cache.EVENT_LOCKS.ONCE_AFTER_RENDER_COMPLETED = true;
      await this.cache.graph.render();

      if (this.cache.EVENT_LOCKS.TRIGGER_SET_LAYOUT_ONCE) {
        this.cache.ui.debug("Initially persisting custom layout ..");
        await this.cache.lm.persistNodePositions();
        this.cache.EVENT_LOCKS.TRIGGER_SET_LAYOUT_ONCE = false;
      }

      await this.cache.lm.setInitialNodePositions();
    } catch (errorMsg) {
      this.cache.ui.error(`Error in initial AFTER_RENDER: ${errorMsg}`);
      this.cache.ui.error("Graph setup failed. Please check your input data.");
      await this.cache.ui.hideLoading();
    } finally {
      this.cache.EVENT_LOCKS.ONCE_AFTER_RENDER_RUNNING = false;
    }
  }

  async toggleCleanUpDanglingElements(btn) {
    const shouldEnable = btn.classList.contains("red");

    if (shouldEnable) {
      btn.classList.remove("red");
      btn.classList.add("green", "highlight");
      btn.title = "Show all nodes and edges, irrespectively of their connectedness.";
      btn.textContent = "👁";
      await this.hideDanglingElements();
    } else {
      btn.classList.remove("green", "highlight");
      btn.classList.add("red");
      btn.title = "Hide all nodes and edges that are not connected to any other node or edge.";
      btn.textContent = "🚫";
      await this.showDanglingElements();
    }
  }

  nodeHasAVisibleEdge(nodeID) {
    for (const edgeID of this.cache.nodeIDToEdgeIDs.get(nodeID) || []) {
      if (this.cache.edgeIDsToBeShown.has(edgeID) && !this.cache.hiddenDanglingEdgeIDs.has(edgeID)) {
        return true;
      }
    }

    return false;
  }

  edgeIsConnectedToTwoVisibleNodes(edgeID) {
    for (const nodeID of this.cache.edgeIDToNodeIDs.get(edgeID) || []) {
      if (!this.cache.nodeIDsToBeShown.has(nodeID) || this.cache.hiddenDanglingNodeIDs.has(nodeID)) {
        return false;
      }
    }
    return true;
  }

  async hideDanglingElements() {
    let changes;

    do {
      changes = false;

      for (let nodeID of this.cache.nodeIDsToBeShown) {
        if (!this.nodeHasAVisibleEdge(nodeID) && !this.cache.hiddenDanglingNodeIDs.has(nodeID)) {
          this.cache.hiddenDanglingNodeIDs.add(nodeID);
          changes = true;
        }
      }

      for (let edgeID of this.cache.edgeIDsToBeShown) {
        if (!this.edgeIsConnectedToTwoVisibleNodes(edgeID) && !this.cache.hiddenDanglingEdgeIDs.has(edgeID)) {
          this.cache.hiddenDanglingEdgeIDs.add(edgeID);
          changes = true;
        }
      }

    } while (changes);

    await this.cache.fm.handleFilterEvent("Hiding Elements", "Hiding nodes and edges that are not connected to any other node or edge.");
  }

  async showDanglingElements() {
    this.cache.hiddenDanglingNodeIDs.clear();
    this.cache.hiddenDanglingEdgeIDs.clear();

    await this.cache.fm.handleFilterEvent("Showing Elements",
      "Showing all previously hidden nodes and edges that are not connected to any other node or edge.");
  }

  async focusNodes(nodeIDs = undefined) {
    if (!nodeIDs) {
      nodeIDs = this.cache.selectedNodes;
    }
    await this.focusElements(nodeIDs);
  }

  async focusEdges(edgeIDs = undefined) {
    if (!edgeIDs) {
      edgeIDs = this.cache.selectedEdges;
    }
    await this.focusElements(edgeIDs);
  }

  async focusElements(elementIDs, isNode) {
    const zoom = await this.cache.graph.getZoom();
    if (zoom < 2) {
      await this.cache.graph.zoomTo(2);
    }
    await this.cache.graph.focusElement([...elementIDs]);

    const targetMap = isNode ? this.cache.nodeRef : this.cache.edgeRef;
    await this.cache.sm.selectElements(elementIDs, targetMap, "highlight");
    setTimeout(async () => {
      await this.cache.sm.selectElements([], targetMap, "highlight");
    }, 2500);
  }

  async updateEdges(overrides = {}, commands = []) {
    let colorMap = null;
    if (commands.includes("set_continuous_color_scale")) {
      colorMap = await this.cache.picker.pickColors("edges");
      if (!colorMap) {
        this.cache.ui.info("Aborted color picker");
        return;
      }
    }

    for (const edgeID of this.cache.selectedEdges) {
      const edge = this.cache.edgeRef.get(edgeID);

      for (const command of commands) {
        if (command === "label_set_to_id") {
          edge.style.label = true;
          edge.style.labelText = edge.id;
        }
        if (command === "label_set_to_label") {
          edge.style.label = true;
          edge.style.labelText = edge.label;
        }
      }

      // apply overrides
      if (colorMap) {
        const overridesCopy = structuredClone(overrides);
        replaceColorScale(overrides, edgeID, colorMap);
        StaticUtilities.deepMerge(edge, overridesCopy);
      } else {
        StaticUtilities.deepMerge(edge, overrides);
      }
      this.cache.edgeRef.set(edgeID, edge);
    }

    await this.cache.style.handleStyleChangeLoadingEvent("Style", "Updating Edge Styles");
  }

  async updateNodes(overrides = {}, commands = []) {
    let colorMap = null;
    if (commands.includes("set_continuous_color_scale")) {
      colorMap = await this.cache.picker.pickColors("nodes");
      if (!colorMap) {
        ui.info("Aborted color picker");
        return;
      }
    }

    const badgesToAdd = overrides.style?.badges;
    const badgePaletteToAdd = overrides.style?.badgePalette;

    if (commands.includes("badge_add")) {
      delete overrides.style?.badges;
      delete overrides.style?.badgePalette;
    }

    for (const nodeID of this.cache.selectedNodes) {
      const node = this.cache.nodeRef.get(nodeID);

      for (const command of commands) {
        if (command === "badge_clear") {
          node.style.badge = false;
          node.style.badges = [];
          node.style.badgePalette = [];
        }
        if (command === "badge_add") {
          node.style.badge = true;
          node.style.badges = node.style.badges || [];
          node.style.badgePalette = node.style.badgePalette || [];

          if (badgesToAdd) {
            node.style.badges = [
              ...node.style.badges,
              ...(Array.isArray(badgesToAdd) ? badgesToAdd : [badgesToAdd])
            ];
          }

          if (badgePaletteToAdd) {
            node.style.badgePalette = [
              ...node.style.badgePalette,
              ...(Array.isArray(badgePaletteToAdd) ? badgePaletteToAdd : [badgePaletteToAdd])
            ];
          }
        }

        if (command === "label_set_to_id") {
          node.style.label = true;
          node.style.labelText = node.id;
        }
        if (command === "label_set_to_label") {
          node.style.label = true;
          node.style.labelText = node.label;
        }
      }

      // apply overrides
      if (colorMap) {
        const overridesCopy = structuredClone(overrides);
        replaceColorScale(overridesCopy, nodeID, colorMap);
        StaticUtilities.deepMerge(node, overridesCopy);
      } else {
        StaticUtilities.deepMerge(node, overrides);
      }
      this.cache.nodeRef.set(nodeID, node);
    }

    await this.cache.style.handleStyleChangeLoadingEvent("Style", `Updating Node Styles`);
  }

  getTargetNodes(propID) {
    if (!propID) return this.cache.selectedNodes;
    if (!this.cache.propToNodeIDs.has(propID)) {
      return [];
    }
    return [...this.cache.propToNodeIDs.get(propID)].filter((nodeID) =>
      this.cache.nodeIDsToBeShown.has(nodeID)
    );
  }

  getTargetEdges(propID) {
    if (!propID) return this.cache.selectedEdges;
    if (!this.cache.propToEdgeIDs.has(propID)) {
      return [];
    }
    return [...this.cache.propToEdgeIDs.get(propID)].filter((edgeID) =>
      this.cache.edgeIDsToBeShown.has(edgeID)
    );
  }

  createSimplifiedDataForGraphObject(resetToCachedPositions = false) {
    const filterObject = (obj, excludedKeys) => {
      return Object.keys(obj)
        .filter(key => !excludedKeys.includes(key)) // Exclude specified keys
        .reduce((newObj, key) => {
          newObj[key] = obj[key];
          return newObj;
        }, {});
    };

    // Process nodes and exclude their unwanted properties
    const filteredNodes = this.cache.data.nodes
      .map(node => {
        const filteredNode = filterObject(node, [
          "D4Data", "features", "featureValues", "featureWithinThreshold", "originalStyle", "originalType"]);

        // load positions from the layouts position Map
        const position = this.cache.data.layouts[this.cache.data.selectedLayout].positions.get(node.id);

        Object.assign(filteredNode, this.cache.style.getNodeStyleOrDefaults(node));

        if (position) {
          filteredNode.style.x = position.x;
          filteredNode.style.y = position.y;
        }

        if (resetToCachedPositions) {
          const {style: {x, y}} = this.cache.initialNodePositions.get(this.cache.data.selectedLayout).get(node.id);
          Object.assign(filteredNode.style, {x, y});
        }

        return filteredNode;
      });

    // Process edges if provided, and exclude unwanted properties
    const filteredEdges = this.cache.data.edges
      .map(edge => {
        const filteredEdge = filterObject(edge, [
          "D4Data", "features", "featureValues", "featureWithinThreshold", "originalStyle", "originalType"]);

        Object.assign(filteredEdge, this.cache.style.getEdgeStyleOrDefaults(edge));

        return filteredEdge;
      });

    return {
      nodes: [...filteredNodes, this.cache.CFG.INVISIBLE_DUMMY_NODE],
      edges: filteredEdges,
      combos: this.cache.data.combos || [],
    };
  }

  async preRenderEvent() {
    if (this.cache.styleChanged) return;

    // Only reset query if not manually updated AND filters not locked by manual query
    if (!this.cache.EVENT_LOCKS.QUERY_UPDATE_EVENT && !this.cache.EVENT_LOCKS.FILTERS_LOCKED_BY_MANUAL_QUERY) {
      this.cache.qm.resetQuery();
    }

    this.cache.nodeIDsToBeShown = new Set();
    this.cache.propIDsToNodeIDsToBeShown = new Map();  // this is used by the bubble-grouping functionality after rendering
    this.cache.edgeIDsToBeShown = new Set();
    this.cache.propIDsToEdgeIDsToBeShown = new Map();
    this.cache.remainingEdgeRelatedNodes = new Set();
    this.cache.fm.resetFeatureIsWithinThresholdMaps();

    this.cache.bubbleSetChanged = false;
    this.cache.qm.decodeQueryAndBuildAST();

    for (const node of this.cache.nodeRef.values()) {
      if (this.cache.query.ast.testNode(node)) {
        this.cache.nodeIDsToBeShown.add(node.id);
        node.featureIsWithinThreshold.forEach((v, k) => {
          if (v === true) {
            if (!this.cache.propIDsToNodeIDsToBeShown.has(k)) {
              this.cache.propIDsToNodeIDsToBeShown.set(k, new Set());
            }
            this.cache.propIDsToNodeIDsToBeShown.get(k).add(node.id);
          }
        });
      }
      // else ui.debug(`Node ${node.id} did not fulfill filter!`);
    }

    for (const edge of this.cache.edgeRef.values()) {
      const endsOk = this.cache.nodeIDsToBeShown.has(edge.source) &&
        this.cache.nodeIDsToBeShown.has(edge.target);

      if (endsOk && (this.cache.query.ast.testEdge(edge))) {
        this.cache.edgeIDsToBeShown.add(edge.id);
        edge.featureIsWithinThreshold.forEach((v, k) => {
          if (v === true) {
            if (!this.cache.propIDsToEdgeIDsToBeShown.has(k)) {
              this.cache.propIDsToEdgeIDsToBeShown.set(k, new Set());
            }
            this.cache.propIDsToEdgeIDsToBeShown.get(k).add(edge.id);
          }
        });
      }
      // else ui.debug(`Edge ${edge.id} did not fulfill filter!`);
    }

    const nodeIDsToBeHidden = [...this.cache.nodeRef.keys()].filter(nodeID => !this.cache.nodeIDsToBeShown.has(nodeID));
    const edgeIDsToBeHidden = [...this.cache.edgeRef.keys()].filter(edgeID => !this.cache.edgeIDsToBeShown.has(edgeID));

    const idsToShow = [
      ...this.cache.nodeIDsToBeShown,
      ...this.cache.edgeIDsToBeShown
    ];

    const idsToHide = [
      ...nodeIDsToBeHidden,
      ...edgeIDsToBeHidden,
      ...this.cache.hiddenDanglingNodeIDs,
      ...this.cache.hiddenDanglingEdgeIDs
    ];

    await this.cache.fm.updateElementVisibility(idsToShow, idsToHide);
    await this.cache.bs.updateBubbleSetIfChanged();
  }

  resetEventLocks() {
    this.cache.EVENT_LOCKS.BEFORE_DRAW_RUNNING = false;
    this.cache.EVENT_LOCKS.AFTER_DRAW_RUNNING = false;
    this.cache.EVENT_LOCKS.DRAG_END_RUNNING = false;
    this.cache.EVENT_LOCKS.BEFORE_RENDER_RUNNING = false;
    this.cache.EVENT_LOCKS.AFTER_RENDER_RUNNING = false;
    this.cache.EVENT_LOCKS.BEFORE_LAYOUT_RUNNING = false;
    this.cache.EVENT_LOCKS.AFTER_LAYOUT_RUNNING = false;
    this.cache.EVENT_LOCKS.ONCE_AFTER_RENDER_RUNNING = false;
    this.cache.EVENT_LOCKS.ONCE_AFTER_RENDER_COMPLETED = false;
    this.cache.EVENT_LOCKS.IS_DESELECTING = false;
    this.cache.EVENT_LOCKS.BUBBLE_GROUP_REDRAW_RUNNING = false;
    this.cache.EVENT_LOCKS.TRIGGER_SET_LAYOUT_ONCE = false;
  }

  async destroyGraphAndRollBackUI() {
    await this.cache.graph?.destroy();
    this.cache.graph = null;

    // isPositionsDirty = false;
    // syncPositionsDebounced.cancel?.();

    const status = document.getElementById("sidebarStatusContainer");
    status.innerHTML = "";
    status.style.height = "0";
  }


  registerHotkeyEvents() {
    if (this.cache.EVENT_LOCKS.HOTKEY_EVENTS_REGISTERED) return;

    document.addEventListener('keydown', async (event) => {
      const activeElement = document.activeElement;

      // Skip hotkeys if currently focused on an input, textarea, or select element
      if (
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.tagName === "SELECT" ||
        activeElement.isContentEditable
      ) {
        return;
      }

      switch (event.key) {
        case "p":
          await this.cache.io.exportPNG();
          break;
        case "s":
          await this.cache.io.exportGraphAsJSON();
          break;
        case "r":
          await this.cache.lm.resetLayout();
          break;
        case "f":
          await this.cache.graph.fitView();
          break;
        case "e":
          await this.cache.ui.toggleEditMode();
          break;
        case "d":
          await this.cache.ui.toggleDataEditor();
          break;
        case "q":
          this.cache.ui.toggleQueryEditor();
          break;
        case "m":
          this.cache.metrics.toggleUI();
          break;
        default:
          break;
      }
    });

    this.cache.EVENT_LOCKS.HOTKEY_EVENTS_REGISTERED = true;
  }

  registerGlobalEventListeners() {
    if (this.cache.EVENT_LOCKS.GLOBAL_EVENTS_REGISTERED) return;

    ['input', 'keydown', 'keyup', 'mousedown', 'mouseup', 'focus', 'blur', 'scroll', 'selectionchange'].forEach(evt =>
      this.cache.query.text.addEventListener(evt, () => this.cache.qm.moveCaret())
    );

    this.cache.ui.makeBottomBarResizable();
    this.cache.EVENT_LOCKS.GLOBAL_EVENTS_REGISTERED = true;
  }

  async registerPluginStates() {
    this.cache.ui.debug("Registering bubble set plugin instances ..");
    for (const group of this.cache.bs.traverseBubbleSets()) {
      this.cache.INSTANCES.BUBBLE_GROUPS[group] = await this.cache.graph.getPluginInstance(`bubbleSetPlugin-${group}`);
    }
  }
}


export {GraphCoreManager};