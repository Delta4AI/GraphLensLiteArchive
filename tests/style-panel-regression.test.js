import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { DEFAULTS, CFG } from "../src/config.js";
import { StaticUtilities } from "../src/utilities/static.js";
import { GraphStyleManager } from "../src/graph/style.js";

// ---------------------------------------------------------------------------
// Minimal mock cache that mirrors the real Cache for style-related operations
// ---------------------------------------------------------------------------
function createMockCache(nodes = [], edges = []) {
  const nodeRef = new Map();
  const edgeRef = new Map();
  const selectedNodes = [];
  const selectedEdges = [];

  const layout = {
    nodeStyles: new Map(),
    edgeStyles: new Map(),
    positions: new Map(),
  };

  const cache = {
    DEFAULTS,
    CFG,
    nodeRef,
    edgeRef,
    selectedNodes,
    selectedEdges,
    data: {
      nodes,
      edges,
      selectedLayout: "default",
      layouts: { default: layout },
    },
    styleChanged: false,
  };

  cache.style = new GraphStyleManager(cache);
  return cache;
}

// ---------------------------------------------------------------------------
// Mirrors the core of updateNodes (core.js) — deepMerge overrides into
// nodeRef, then persist into the layout's nodeStyles map.
// ---------------------------------------------------------------------------
function simulateUpdateNodes(cache, overrides) {
  for (const nodeID of cache.selectedNodes) {
    const node = cache.nodeRef.get(nodeID);
    const overridesCopy = structuredClone(overrides);
    StaticUtilities.deepMerge(node, overridesCopy);
    cache.nodeRef.set(nodeID, node);

    const currentLayout = cache.data.layouts[cache.data.selectedLayout];
    currentLayout.nodeStyles.set(nodeID, {
      type: node.type,
      style: structuredClone(node.style),
    });
  }
}

// ---------------------------------------------------------------------------
// Mirrors the core of updateEdges (core.js)
// ---------------------------------------------------------------------------
function simulateUpdateEdges(cache, overrides) {
  for (const edgeID of cache.selectedEdges) {
    const edge = cache.edgeRef.get(edgeID);
    const overridesCopy = structuredClone(overrides);
    StaticUtilities.deepMerge(edge, overridesCopy);
    cache.edgeRef.set(edgeID, edge);

    const currentLayout = cache.data.layouts[cache.data.selectedLayout];
    currentLayout.edgeStyles.set(edgeID, {
      type: edge.type,
      style: structuredClone(edge.style),
    });
  }
}

// ---------------------------------------------------------------------------
// Mirrors the node-processing part of createSimplifiedDataForGraphObject
// ---------------------------------------------------------------------------
function buildRenderedNodeData(cache) {
  return cache.data.nodes.map((node) => {
    const {
      features,
      featureValues,
      featureIsWithinThreshold,
      originalStyle,
      originalType,
      D4Data,
      ...filteredNode
    } = node;

    const currentLayout = cache.data.layouts[cache.data.selectedLayout];
    const layoutData = currentLayout.nodeStyles.get(node.id);

    if (layoutData) {
      Object.assign(filteredNode, cache.style.getNodeStyleOrDefaults(node));
      if (layoutData.type !== undefined) filteredNode.type = layoutData.type;
      if (layoutData.style)
        filteredNode.style = structuredClone(layoutData.style);
    } else {
      Object.assign(filteredNode, cache.style.getNodeStyleOrDefaults(node));
    }

    const position = currentLayout.positions.get(node.id);
    if (position && position.style) {
      filteredNode.style.x = position.style.x;
      filteredNode.style.y = position.style.y;
    }

    return filteredNode;
  });
}

// ---------------------------------------------------------------------------
// Mirrors the edge-processing part of createSimplifiedDataForGraphObject
// ---------------------------------------------------------------------------
function buildRenderedEdgeData(cache) {
  return cache.data.edges.map((edge) => {
    const {
      features,
      featureValues,
      featureIsWithinThreshold,
      originalStyle,
      originalType,
      D4Data,
      ...filteredEdge
    } = edge;

    const currentLayout = cache.data.layouts[cache.data.selectedLayout];
    const layoutData = currentLayout.edgeStyles.get(edge.id);

    if (layoutData) {
      Object.assign(filteredEdge, cache.style.getEdgeStyleOrDefaults(edge));
      if (layoutData.type !== undefined) filteredEdge.type = layoutData.type;
      if (layoutData.style)
        filteredEdge.style = structuredClone(layoutData.style);
    } else {
      Object.assign(filteredEdge, cache.style.getEdgeStyleOrDefaults(edge));
    }

    return filteredEdge;
  });
}

// ---------------------------------------------------------------------------
// Helper: set up a cache with one node, mimicking the full iterNodes flow
// ---------------------------------------------------------------------------
function setupNodeInCache(cache, nodeData) {
  const nodeWithDefaults = cache.style.getNodeStyleOrDefaults(nodeData);
  const nodeClone = structuredClone(nodeData);
  nodeClone.type = nodeWithDefaults.type;
  nodeClone.style = structuredClone(nodeWithDefaults.style);
  nodeClone.originalStyle = structuredClone(nodeWithDefaults.style);
  nodeClone.originalType = nodeWithDefaults.type;
  cache.nodeRef.set(nodeData.id, nodeClone);
}

function setupEdgeInCache(cache, edgeData) {
  const edgeWithDefaults = cache.style.getEdgeStyleOrDefaults(edgeData);
  const edgeClone = structuredClone(edgeData);
  edgeClone.type = edgeWithDefaults.type;
  edgeClone.style = structuredClone(edgeWithDefaults.style);
  edgeClone.originalStyle = structuredClone(edgeWithDefaults.style);
  edgeClone.originalType = edgeWithDefaults.type;
  cache.edgeRef.set(edgeData.id, edgeClone);
}

// ==========================================================================
// REGRESSION: Graph constructor must not set spec-level type/style
// ==========================================================================

describe("Graph constructor must not set spec-level node/edge type or style", () => {
  const coreSource = readFileSync(
    join(import.meta.dirname, "..", "src", "graph", "core.js"),
    "utf8",
  );

  // Extract the Graph constructor call block
  const graphConstructorMatch = coreSource.match(
    /this\.cache\.graph\s*=\s*new\s+Graph\(\{[\s\S]*?\n\s*\}\)\s*;/,
  );

  it("Graph constructor call is found in source", () => {
    expect(graphConstructorMatch).not.toBeNull();
  });

  it("node config must not have a top-level type property", () => {
    // Match the node: { ... } block inside the Graph constructor
    const nodeBlock = graphConstructorMatch[0].match(
      /node:\s*\{([\s\S]*?)\},\s*edge:/,
    );
    expect(nodeBlock).not.toBeNull();
    // Should not have `type:` as a direct child (state.type patterns are fine)
    const lines = nodeBlock[1].split("\n");
    const topLevelTypeLines = lines.filter((line) => /^\s*type\s*:/.test(line));
    expect(topLevelTypeLines).toHaveLength(0);
  });

  it("node config must not have a top-level style property", () => {
    const nodeBlock = graphConstructorMatch[0].match(
      /node:\s*\{([\s\S]*?)\},\s*edge:/,
    );
    expect(nodeBlock).not.toBeNull();
    const lines = nodeBlock[1].split("\n");
    // `style:` as direct child of node config (not inside state: { ... })
    const topLevelStyleLines = lines.filter((line) =>
      /^\s*style\s*:/.test(line),
    );
    expect(topLevelStyleLines).toHaveLength(0);
  });

  it("edge config must not have a top-level type property", () => {
    const edgeBlock = graphConstructorMatch[0].match(
      /edge:\s*\{([\s\S]*?)\},\s*behaviors:/,
    );
    expect(edgeBlock).not.toBeNull();
    const lines = edgeBlock[1].split("\n");
    const topLevelTypeLines = lines.filter((line) => /^\s*type\s*:/.test(line));
    expect(topLevelTypeLines).toHaveLength(0);
  });

  it("edge config must not have a top-level style property", () => {
    const edgeBlock = graphConstructorMatch[0].match(
      /edge:\s*\{([\s\S]*?)\},\s*behaviors:/,
    );
    expect(edgeBlock).not.toBeNull();
    const lines = edgeBlock[1].split("\n");
    const topLevelStyleLines = lines.filter((line) =>
      /^\s*style\s*:/.test(line),
    );
    expect(topLevelStyleLines).toHaveLength(0);
  });
});

// ==========================================================================
// REGRESSION: State styles must not override user-customizable properties
// In G6 v5, state styles always override per-node data styles. Any
// user-settable property (fill, size, stroke, lineWidth, type) in a
// persistent state like "selected" would silently break the styling panel.
// ==========================================================================

describe("State styles must not override user-customizable properties", () => {
  const coreSource = readFileSync(
    join(import.meta.dirname, "..", "src", "graph", "core.js"),
    "utf8",
  );

  const graphConstructorMatch = coreSource.match(
    /this\.cache\.graph\s*=\s*new\s+Graph\(\{[\s\S]*?\n\s*\}\)\s*;/,
  );

  // Extract the node selected state block
  const nodeSelectedMatch = graphConstructorMatch[0].match(
    /node:[\s\S]*?selected:\s*\{([^}]*)\}/,
  );

  // Extract the edge selected state block
  const edgeSelectedMatch = graphConstructorMatch[0].match(
    /edge:[\s\S]*?selected:\s*\{([^}]*)\}/,
  );

  const userCustomizableNodeProps = ["fill", "size", "stroke", "lineWidth"];
  const userCustomizableEdgeProps = ["stroke", "lineWidth"];

  for (const prop of userCustomizableNodeProps) {
    it(`node selected state must not set "${prop}"`, () => {
      expect(nodeSelectedMatch).not.toBeNull();
      // Property should not appear as a key in the state block
      const regex = new RegExp(`\\b${prop}\\s*:`);
      expect(nodeSelectedMatch[1]).not.toMatch(regex);
    });
  }

  for (const prop of userCustomizableEdgeProps) {
    it(`edge selected state must not set "${prop}"`, () => {
      expect(edgeSelectedMatch).not.toBeNull();
      const regex = new RegExp(`\\b${prop}\\s*:`);
      expect(edgeSelectedMatch[1]).not.toMatch(regex);
    });
  }
});

// ==========================================================================
// REGRESSION: Node style overrides survive the full update → render pipeline
// ==========================================================================

describe("Node style overrides through updateNodes → render data", () => {
  it("fill color override reaches rendered output", () => {
    const nodeData = { id: "n1", label: "Node 1" };
    const cache = createMockCache([nodeData]);
    setupNodeInCache(cache, nodeData);
    cache.selectedNodes.push("n1");

    // Simulate: user changes fill color via styling panel
    simulateUpdateNodes(cache, { style: { fill: "#800080" } });

    const rendered = buildRenderedNodeData(cache);
    expect(rendered[0].style.fill).toBe("#800080");
  });

  it("size override reaches rendered output", () => {
    const nodeData = { id: "n1" };
    const cache = createMockCache([nodeData]);
    setupNodeInCache(cache, nodeData);
    cache.selectedNodes.push("n1");

    simulateUpdateNodes(cache, { style: { size: 42 } });

    const rendered = buildRenderedNodeData(cache);
    expect(rendered[0].style.size).toBe(42);
  });

  it("type (shape) override reaches rendered output", () => {
    const nodeData = { id: "n1" };
    const cache = createMockCache([nodeData]);
    setupNodeInCache(cache, nodeData);
    cache.selectedNodes.push("n1");

    simulateUpdateNodes(cache, { type: "circle" });

    const rendered = buildRenderedNodeData(cache);
    expect(rendered[0].type).toBe("circle");
  });

  it("border color override reaches rendered output", () => {
    const nodeData = { id: "n1" };
    const cache = createMockCache([nodeData]);
    setupNodeInCache(cache, nodeData);
    cache.selectedNodes.push("n1");

    simulateUpdateNodes(cache, { style: { stroke: "#00FF00" } });

    const rendered = buildRenderedNodeData(cache);
    expect(rendered[0].style.stroke).toBe("#00FF00");
  });

  it("multiple overrides are preserved together", () => {
    const nodeData = { id: "n1" };
    const cache = createMockCache([nodeData]);
    setupNodeInCache(cache, nodeData);
    cache.selectedNodes.push("n1");

    simulateUpdateNodes(cache, {
      type: "star",
      style: { fill: "#0000FF", size: 35 },
    });

    const rendered = buildRenderedNodeData(cache);
    expect(rendered[0].type).toBe("star");
    expect(rendered[0].style.fill).toBe("#0000FF");
    expect(rendered[0].style.size).toBe(35);
    // Unchanged properties should retain defaults
    expect(rendered[0].style.lineWidth).toBe(DEFAULTS.NODE.LINE_WIDTH);
  });

  it("overrides only affect selected nodes", () => {
    const n1 = { id: "n1" };
    const n2 = { id: "n2" };
    const cache = createMockCache([n1, n2]);
    setupNodeInCache(cache, n1);
    setupNodeInCache(cache, n2);
    cache.selectedNodes.push("n1"); // only n1 selected

    simulateUpdateNodes(cache, { style: { fill: "#FF00FF" } });

    const rendered = buildRenderedNodeData(cache);
    const rn1 = rendered.find((n) => n.id === "n1");
    const rn2 = rendered.find((n) => n.id === "n2");

    expect(rn1.style.fill).toBe("#FF00FF");
    expect(rn2.style.fill).toBe(DEFAULTS.NODE.FILL_COLOR);
  });

  it("sequential overrides accumulate correctly", () => {
    const nodeData = { id: "n1" };
    const cache = createMockCache([nodeData]);
    setupNodeInCache(cache, nodeData);
    cache.selectedNodes.push("n1");

    // First override: change fill
    simulateUpdateNodes(cache, { style: { fill: "#111111" } });
    // Second override: change size (fill should persist)
    simulateUpdateNodes(cache, { style: { size: 50 } });

    const rendered = buildRenderedNodeData(cache);
    expect(rendered[0].style.fill).toBe("#111111");
    expect(rendered[0].style.size).toBe(50);
  });

  it("label style overrides reach rendered output", () => {
    const nodeData = { id: "n1" };
    const cache = createMockCache([nodeData]);
    setupNodeInCache(cache, nodeData);
    cache.selectedNodes.push("n1");

    simulateUpdateNodes(cache, {
      style: { labelFill: "#FF0000", labelFontSize: 20 },
    });

    const rendered = buildRenderedNodeData(cache);
    expect(rendered[0].style.labelFill).toBe("#FF0000");
    expect(rendered[0].style.labelFontSize).toBe(20);
  });
});

// ==========================================================================
// REGRESSION: Edge style overrides survive the full update → render pipeline
// ==========================================================================

describe("Edge style overrides through updateEdges → render data", () => {
  it("stroke color override reaches rendered output", () => {
    const edgeData = { id: "e1", source: "n1", target: "n2" };
    const cache = createMockCache([], [edgeData]);
    setupEdgeInCache(cache, edgeData);
    cache.selectedEdges.push("e1");

    simulateUpdateEdges(cache, { style: { stroke: "#00FF00" } });

    const rendered = buildRenderedEdgeData(cache);
    expect(rendered[0].style.stroke).toBe("#00FF00");
  });

  it("lineWidth override reaches rendered output", () => {
    const edgeData = { id: "e1", source: "n1", target: "n2" };
    const cache = createMockCache([], [edgeData]);
    setupEdgeInCache(cache, edgeData);
    cache.selectedEdges.push("e1");

    simulateUpdateEdges(cache, { style: { lineWidth: 3.5 } });

    const rendered = buildRenderedEdgeData(cache);
    expect(rendered[0].style.lineWidth).toBe(3.5);
  });

  it("type override reaches rendered output", () => {
    const edgeData = { id: "e1", source: "n1", target: "n2" };
    const cache = createMockCache([], [edgeData]);
    setupEdgeInCache(cache, edgeData);
    cache.selectedEdges.push("e1");

    simulateUpdateEdges(cache, { type: "cubic" });

    const rendered = buildRenderedEdgeData(cache);
    expect(rendered[0].type).toBe("cubic");
  });

  it("arrow overrides reach rendered output", () => {
    const edgeData = { id: "e1", source: "n1", target: "n2" };
    const cache = createMockCache([], [edgeData]);
    setupEdgeInCache(cache, edgeData);
    cache.selectedEdges.push("e1");

    simulateUpdateEdges(cache, {
      style: { startArrow: true, startArrowType: "vee", endArrow: true },
    });

    const rendered = buildRenderedEdgeData(cache);
    expect(rendered[0].style.startArrow).toBe(true);
    expect(rendered[0].style.startArrowType).toBe("vee");
    expect(rendered[0].style.endArrow).toBe(true);
  });

  it("overrides only affect selected edges", () => {
    const e1 = { id: "e1", source: "n1", target: "n2" };
    const e2 = { id: "e2", source: "n2", target: "n3" };
    const cache = createMockCache([], [e1, e2]);
    setupEdgeInCache(cache, e1);
    setupEdgeInCache(cache, e2);
    cache.selectedEdges.push("e1"); // only e1 selected

    simulateUpdateEdges(cache, { style: { stroke: "#FF0000" } });

    const rendered = buildRenderedEdgeData(cache);
    const re1 = rendered.find((e) => e.id === "e1");
    const re2 = rendered.find((e) => e.id === "e2");

    expect(re1.style.stroke).toBe("#FF0000");
    expect(re2.style.stroke).toBe(DEFAULTS.EDGE.COLOR);
  });
});

// ==========================================================================
// REGRESSION: Defaults are used for nodes/edges without layout overrides
// ==========================================================================

describe("Nodes/edges without layout overrides use defaults", () => {
  it("node without layout style uses default fill", () => {
    const nodeData = { id: "n1" };
    const cache = createMockCache([nodeData]);
    setupNodeInCache(cache, nodeData);

    const rendered = buildRenderedNodeData(cache);
    expect(rendered[0].style.fill).toBe(DEFAULTS.NODE.FILL_COLOR);
    expect(rendered[0].type).toBe(DEFAULTS.NODE.TYPE);
    expect(rendered[0].style.size).toBe(DEFAULTS.NODE.SIZE);
  });

  it("edge without layout style uses default stroke", () => {
    const edgeData = { id: "e1", source: "n1", target: "n2" };
    const cache = createMockCache([], [edgeData]);
    setupEdgeInCache(cache, edgeData);

    const rendered = buildRenderedEdgeData(cache);
    expect(rendered[0].style.stroke).toBe(DEFAULTS.EDGE.COLOR);
    expect(rendered[0].type).toBe(DEFAULTS.EDGE.TYPE);
    expect(rendered[0].style.lineWidth).toBe(DEFAULTS.EDGE.LINE_WIDTH);
  });
});
