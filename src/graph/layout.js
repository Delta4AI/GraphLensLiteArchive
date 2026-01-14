import {Popup} from "../utilities/popup.js";

class GraphLayoutManager {
  constructor(cache) {
    this.cache = cache;
  }

  async handleLayoutChangeLoadingEvent(header, text) {
    await this.cache.ui.showLoading(header, text);
    this.cache.layoutChanged = true;
    await this.cache.gcm.decideToRenderOrDraw();
    this.cache.ui.debug(`Graph updated after layout event with message ${header} ${text}`);
  }

  async changeLayout() {
    this.cache.data.selectedLayout = document.getElementById('selectView').value;
    await this.cache.ui.showLoading("Switching View", this.cache.data.selectedLayout);
    await new Promise(resolve => requestAnimationFrame(resolve));
    let layout = this.cache.data.layouts[this.cache.data.selectedLayout];

    if (!layout.isCustom) {
      await this.cache.graph.setLayout({type: this.cache.data.selectedLayout, ...layout.internals});
      await this.cache.graph.layout();
    }

    this.cache.ui.buildFilterUI();
    this.cache.ui.clearActivePropsCacheOnLayoutChange();

    await this.cache.metrics.updateMetricUI();

    this.cache.EVENT_LOCKS.ONCE_AFTER_RENDER_COMPLETED = false;

    await this.cache.gcm.decideToRenderOrDraw(true);

    // Update manual bubble group status after layout change
    this.cache.bs.updateManualGroupStatus();
    this.cache.bs.updateManualGroupButtonState();

    this.cache.ui.info(`Switched to view: ${this.cache.data.selectedLayout}`);
  }

  async addLayout() {
    let layoutName = await Popup.prompt("Enter View Name: ");
    if (!layoutName) {
      this.cache.ui.info("Creating view canceled");
      return;
    }

    let existing = Object.keys(this.cache.data.layouts);

    if (existing.includes(layoutName)) {
      this.cache.ui.error(`View with name "${layoutName}" already exists.`);
      return;
    }

    const currentLayout = this.cache.data.layouts[this.cache.data.selectedLayout];

    // create new layout object by copying positions and filters from current one
    this.cache.data.layouts[layoutName] = {
      internals: null,
      positions: structuredClone(currentLayout.positions),
      filters: structuredClone(currentLayout.filters),
      isCustom: true
    };
    for (let group of this.cache.bs.traverseBubbleSets()) {
      this.cache.data.layouts[layoutName][`${group}Props`] = structuredClone(currentLayout[`${group}Props`]);
      this.cache.data.layouts[layoutName][`${group}ManualMembers`] = structuredClone(currentLayout[`${group}ManualMembers`] || new Set());
    }

    this.cache.ui.buildDropdownOptions();
    document.getElementById('selectView').value = layoutName;
    await this.cache.lm.changeLayout();
    this.cache.ui.info(`Created view ${layoutName}`);
  }

  async removeSelectedLayout() {
    if (!this.cache.data.layouts[this.cache.data.selectedLayout].isCustom) {
      this.cache.ui.error("Cannot delete default layout.");
      return;
    }

    const confirmed = await Popup.confirm(`Are you sure you want to delete view "${this.cache.data.selectedLayout}"?`);
    if (!confirmed) return false;

    delete this.cache.data.layouts[this.cache.data.selectedLayout];
    this.cache.ui.buildDropdownOptions();

    document.getElementById('selectView').value = this.cache.DEFAULTS.LAYOUT;
    await this.changeLayout();
  }

  async resetLayout() {
    await this.restoreInitialNodePositions();
  }

  async getPos() {
    const zoom = await this.cache.graph.getZoom();
    const pos = await this.cache.graph.getPosition();
    console.log(`Zoom: ${zoom}`);
    console.log(`Position: ${pos}`);
  }

  async setInitialNodePositions(override = false) {
    if (!this.cache.initialNodePositions.has(this.cache.data.selectedLayout) || override) {
      this.cache.ui.debug(`Setting initial node positions for layout "${this.cache.data.selectedLayout}" ..`);
      this.cache.initialNodePositions.set(this.cache.data.selectedLayout, new Map());
      for (const nodeID of this.cache.nodeRef.keys()) {
        const pos = await this.cache.graph.getElementPosition(nodeID);
        this.cache.initialNodePositions.get(this.cache.data.selectedLayout).set(nodeID, {style: {x: pos[0], y: pos[1]}});
      }
    }
  }

  async restoreInitialNodePositions(selectedNodesOnly = false) {
    for (const nodeID of this.cache.nodeRef.keys()) {
      if (selectedNodesOnly && !this.cache.selectedNodes.includes(nodeID)) continue;

      const currentPos = await this.cache.graph.getElementPosition(nodeID);
      const initialPos = this.cache.initialNodePositions.get(this.cache.data.selectedLayout).get(nodeID);

      if (currentPos[0] !== initialPos.style.x || currentPos[1] !== initialPos.style.y) {
        await this.cache.graph.translateElementTo(nodeID, [initialPos.style.x, initialPos.style.y]);
      }
    }
  }

  async layoutSelectedNodes(action) {
    if (this.cache.selectedNodes.length === 0) return;

    async function groupOrSpreadSelectedNodes(scale) {
      for (const node of await this.cache.sm.getSelectedNodes()) {
        const oldX = node.style.x;
        const oldY = node.style.y;

        node.style.x = origAvgX + (oldX - origAvgX) * scale;
        node.style.y = origAvgY + (oldY - origAvgY) * scale;
      }
    }

    async function arrangeNodesInCircle(radius) {
      const numNodes = this.cache.selectedNodes.length;
      let angleStep = (2 * Math.PI) / numNodes;

      let i = 0;
      for (const node of await this.cache.sm.getSelectedNodes()) {
        const angle = i * angleStep;
        node.style.x = origAvgX + radius * Math.cos(angle);
        node.style.y = origAvgY + radius * Math.sin(angle);
        i++;
      }
    }

    async function applyForceLayout(iterations) {
      // -----------------------------
      // Updated parameters
      // -----------------------------
      const INITIAL_TEMPERATURE = 2.0;     // Starting "temperature" for the cooling factor
      const COOLING_FACTOR = 0.98;    // Slower cooling to allow more spreading
      const GRAVITY_STRENGTH = 0.00001; // Reduced gravity so nodes aren't pulled too close
      const MAX_DISPLACEMENT = 50;      // Higher limit on movement per iteration or remove if needed

      const REPULSION = 20000;        // Strong repulsion to push nodes apart
      const SPRING_LENGTH = 300;         // Ideal distance between connected nodes
      const SPRING_STRENGTH = 0.005;        // Reduced tension to allow more space

      // -----------------------------
      // Larger initial placement range
      // -----------------------------
      const nodes = await this.cache.sm.getSelectedNodes();
      for (const node of nodes) {
        node.style.x = Math.random() * 1000 - 500;  // Range: [-500, 500]
        node.style.y = Math.random() * 1000 - 500;  // Range: [-500, 500]
      }

      // -----------------------------
      // Main iteration
      // -----------------------------
      let temperature = INITIAL_TEMPERATURE;
      for (let i = 0; i < iterations; i++) {
        // 1) Repulsion between every pair of nodes
        for (let a = 0; a < nodes.length; a++) {
          for (let b = a + 1; b < nodes.length; b++) {
            const dx = nodes[b].style.x - nodes[a].style.x;
            const dy = nodes[b].style.y - nodes[a].style.y;
            const dist = Math.sqrt(dx * dx + dy * dy) + 0.01; // Avoid dividing by zero

            const force = REPULSION / (dist * dist); // 1 / distance^2
            const fx = force * (dx / dist);
            const fy = force * (dy / dist);

            // Apply forces (scaled by temperature)
            nodes[a].style.x -= fx * temperature;
            nodes[a].style.y -= fy * temperature;
            nodes[b].style.x += fx * temperature;
            nodes[b].style.y += fy * temperature;
          }
        }

        // 2) Spring forces (edges)
        for (const edge of await this.cache.graph.getEdgeData()) {
          const {source, target} = edge;
          if (this.cache.selectedNodes.includes(source) && this.cache.selectedNodes.includes(target)) {
            const nodeA = nodes.find((n) => n.id === source);
            const nodeB = nodes.find((n) => n.id === target);
            if (nodeA && nodeB) {
              const dx = nodeB.style.x - nodeA.style.x;
              const dy = nodeB.style.y - nodeA.style.y;
              const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;

              // (currentDistance - idealDistance)
              const force = (dist - SPRING_LENGTH) * SPRING_STRENGTH;
              const fx = force * (dx / dist);
              const fy = force * (dy / dist);

              // Apply (scaled by temperature)
              nodeA.style.x += fx * temperature;
              nodeA.style.y += fy * temperature;
              nodeB.style.x -= fx * temperature;
              nodeB.style.y -= fy * temperature;
            }
          }
        }

        // 3) Gravity / Centering
        // With reduced gravity, nodes won't cluster too tightly
        for (const node of nodes) {
          node.style.x += -node.style.x * GRAVITY_STRENGTH * temperature;
          node.style.y += -node.style.y * GRAVITY_STRENGTH * temperature;
        }

        // 4) Limit maximum displacement (optional)
        // Increase or remove if you don't want clamping
        for (const node of nodes) {
          const dist = Math.sqrt(node.style.x * node.style.x + node.style.y * node.style.y);
          if (dist > MAX_DISPLACEMENT) {
            const ratio = MAX_DISPLACEMENT / dist;
            node.style.x *= ratio;
            node.style.y *= ratio;
          }
        }

        // 5) Cool down temperature for next iteration
        temperature *= COOLING_FACTOR;
      }
    }

    async function applyGridLayout() {
      const nodes = await this.cache.sm.getSelectedNodes();
      if (nodes.length === 0) return;

      const count = nodes.length;
      const columns = Math.ceil(Math.sqrt(count));
      const spacing = 100;

      const rows = Math.ceil(count / columns);
      const totalWidth = (columns - 1) * spacing;
      const totalHeight = (rows - 1) * spacing;

      let idx = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          if (idx >= count) break;
          const node = nodes[idx];
          node.style.x = origAvgX - totalWidth / 2 + col * spacing;
          node.style.y = origAvgY - totalHeight / 2 + row * spacing;
          idx++;
        }
      }
    }

    async function applyRandomLayout() {
      const nodes = await this.cache.sm.getSelectedNodes();
      if (nodes.length < 2) return;

      // ALWAYS use the fixed original bounding‐box:
      const centerX = origCenterX;
      const centerY = origCenterY;
      const width = origWidth;
      const height = origHeight;

      // If you really want rotation (see note below), be aware a rotated
      // rectangle has a larger AABB—but we’re not recomputing the AABB,
      // so the outer box stays fixed at origWidth × origHeight.
      const angle = Math.random() * 2 * Math.PI;

      // Pick two anchors to go to two opposite corners of the ROTATED rectangle
      // (but the *axis‐aligned* bounding-box of that rotated rectangle is still
      // held “virtually” at origWidth×origHeight; we do not “re‐read” min/max from it).
      const [anchor1, anchor2] = getRandomElements(nodes, 2);

      // Rotate those two anchors to the “corners” of a width×height box at random angle:
      // corner1 ( +width/2, +height/2 ) after rotation; corner2 ( -width/2, -height/2 ).
      anchor1.style.x = centerX + (width / 2) * Math.cos(angle) - (height / 2) * Math.sin(angle);
      anchor1.style.y = centerY + (width / 2) * Math.sin(angle) + (height / 2) * Math.cos(angle);

      anchor2.style.x = centerX - (width / 2) * Math.cos(angle) + (height / 2) * Math.sin(angle);
      anchor2.style.y = centerY - (width / 2) * Math.sin(angle) - (height / 2) * Math.cos(angle);

      // Now scatter the rest uniformly inside that same rotated box:
      for (const node of nodes) {
        if (node === anchor1 || node === anchor2) continue;

        // pick a random (u,v) in [–0.5..+0.5] × [–0.5..+0.5]
        const u = Math.random() - 0.5;
        const v = Math.random() - 0.5;

        // scale to [–width/2..+width/2], [–height/2..+height/2]
        const dx = u * width;
        const dy = v * height;

        // rotate (dx,dy) around origin by “angle”
        node.style.x = centerX + dx * Math.cos(angle) - dy * Math.sin(angle);
        node.style.y = centerY + dx * Math.sin(angle) + dy * Math.cos(angle);
      }
    }

    function getRandomElements(array, n) {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled.slice(0, n);
    }

    const sel = await this.cache.sm.getSelectedNodes();
    if (sel.length == 0) return;

    const coords = sel.map(n => ({x: n.style.x, y: n.style.y}));

    const origAvgX = coords.reduce((sum, pos) => sum + pos.x, 0) / coords.length;
    const origAvgY = coords.reduce((sum, pos) => sum + pos.y, 0) / coords.length;
    const origMinX = Math.min(...coords.map((pos) => pos.x));
    const origMaxX = Math.max(...coords.map((pos) => pos.x));
    const origMinY = Math.min(...coords.map((pos) => pos.y));
    const origMaxY = Math.max(...coords.map((pos) => pos.y));

    const origCenterX = (origMinX + origMaxX) / 2;
    const origCenterY = (origMinY + origMaxY) / 2;
    const origWidth = origMaxX - origMinX;
    const origHeight = origMaxY - origMinY;


    const eventLabels = {
      "shrink": "Shrink selected nodes toward their center",
      "expand": "Expand selected nodes outward from their center",
      "circle": "Arrange selected nodes evenly in a circular layout",
      "force": "Apply a force-directed layout to selected nodes",
      "grid": "Align selected nodes in a uniform grid layout",
      "random": "Distribute selected nodes randomly while preserving the original layout bounds"
    };

    const layoutActions = {
      "shrink": () => groupOrSpreadSelectedNodes(0.5),
      "expand": () => groupOrSpreadSelectedNodes(2),
      "circle": () => arrangeNodesInCircle(100),
      "force": () => applyForceLayout(150),
      "grid": () => applyGridLayout(),
      "random": () => applyRandomLayout(),
    }

    await layoutActions[action]();
    await this.persistNodePositions();
    await this.handleLayoutChangeLoadingEvent(action, eventLabels[action]);
  }

  async getPositions() {
    const posCopy = [];
    for (const node of await this.cache.graph.getNodeData()) {
      posCopy.push({
        id: node.id,
        style: {
          x: node.style.x,
          y: node.style.y
        }
      });
    }
    return posCopy;
  }

  async debugPositions() {
    for (const node of await this.getPositions()) {
      this.cache.ui.debug(`${node.id} | ${node.style.x} | ${node.style.y}`);
    }
  }

  async persistNodePositions() {
    this.cache.ui.debug("PERSISTING NODE POSITIONS ..");
    for (const node of await this.cache.graph.getNodeData()) {
      this.cache.data.layouts[this.cache.data.selectedLayout].positions.set(node.id, {style: {x: node.style.x, y: node.style.y}});
    }
  }

  createDefaultLayout(key, overridePositionsFromExcel = false) {
    const defLayout = {
      internals: this.cache.DEFAULTS.LAYOUT_INTERNALS[key] || null,
      positions: new Map(),
      filters: structuredClone(this.cache.data.filterDefaults),
      isCustom: false,
      query: undefined,
    };

    if (overridePositionsFromExcel) {
      // applies given coordinates from Excel template; remaining positions will be force layouted
      for (const [nodeID, positions] of this.cache.nodePositionsFromExcelImport) {
        defLayout.positions.set(nodeID, {style: {x: positions.x, y: positions.y}});
      }
      defLayout.type = this.cache.DEFAULTS.LAYOUT;
      defLayout.internals = this.cache.DEFAULTS.LAYOUT_INTERNALS[this.cache.DEFAULTS.LAYOUT];
      defLayout.isCustom = true;
    }

    for (let group of this.cache.bs.traverseBubbleSets()) {
      defLayout[`${group}Props`] = new Set();
    }

    return defLayout;
  }

  async nodePositionsAreInSync() {
    for (const node of await this.cache.graph.getNodeData()) {
      const existing = this.cache.data.layouts[this.cache.data.selectedLayout].positions?.get(node.id);
      if (!existing) continue;
      if (node.style.x !== existing.style.x || node.style.y !== existing.style.y) {
        return false;
      }
    }
    return true;
  }
}

export {GraphLayoutManager}