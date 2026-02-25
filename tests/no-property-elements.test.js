import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import ExcelJS from "exceljs";
import {
  IOManager,
  EXCEL_NODE_PROPERTIES,
  EXCEL_EDGE_PROPERTIES,
} from "../src/managers/io.js";
import { GraphFilterManager } from "../src/graph/filter.js";
import { CFG, DEFAULTS } from "../src/config.js";

// ==========================================================================
// No-property elements — ensures nodes/edges without user-defined properties
// are handled cleanly: no dummy "exists" injection, consolidated logging,
// and correct filter bypass so featureless elements remain always visible.
// ==========================================================================

// Make ExcelJS available as global (production code references it as a global)
beforeAll(() => {
  globalThis.ExcelJS = ExcelJS;
});

function createMockCache() {
  return {
    CFG,
    DEFAULTS,
    data: {
      filterDefaults: new Map(),
    },
    bs: {
      traverseBubbleSets: function* () {
        for (const group of Object.keys(
          DEFAULTS.BUBBLE_GROUP_QUADRANT_POSITIONS,
        )) {
          yield group;
        }
      },
    },
    ui: {
      warning: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
    activeProps: new Set(),
    nodeExclusiveProps: new Set(),
    edgeExclusiveProps: new Set(),
    mixedProps: new Set(),
    nodeRef: new Map(),
    edgeRef: new Map(),
  };
}

/**
 * Build a minimal Excel buffer with "nodes" and "edges" sheets.
 * @param {Array<Object>} nodeRows - e.g. [{ ID: 'n1', Label: 'Node 1' }]
 * @param {Array<Object>} edgeRows - e.g. [{ 'Source ID': 'n1', 'Target ID': 'n2' }]
 */
async function buildExcelBuffer(nodeRows, edgeRows) {
  const workbook = new ExcelJS.Workbook();

  const nodesSheet = workbook.addWorksheet("nodes");
  if (nodeRows.length > 0) {
    const nodeCols = Object.keys(nodeRows[0]);
    nodesSheet.addRow(nodeCols);
    for (const row of nodeRows) {
      nodesSheet.addRow(nodeCols.map((c) => row[c]));
    }
  }

  const edgesSheet = workbook.addWorksheet("edges");
  if (edgeRows.length > 0) {
    const edgeCols = Object.keys(edgeRows[0]);
    edgesSheet.addRow(edgeCols);
    for (const row of edgeRows) {
      edgesSheet.addRow(edgeCols.map((c) => row[c]));
    }
  }

  return workbook.xlsx.writeBuffer();
}

// --------------------------------------------------------------------------
// 1. addNodeOrEdgeUserData does NOT inject "exists" property
// --------------------------------------------------------------------------
describe('parseExcelToJson — no "exists" injection', () => {
  let io, cache;

  beforeEach(() => {
    cache = createMockCache();
    io = new IOManager(cache);
  });

  it("produces empty D4Data section when node has no user-defined properties", async () => {
    const buffer = await buildExcelBuffer(
      [{ ID: "n1" }],
      [{ "Source ID": "n1", "Target ID": "n1" }],
    );

    const result = await io.parseExcelToJson(buffer);
    const node = result.nodes[0];
    expect(node).toBeDefined();
    expect(node.id).toBe("n1");

    // D4Data should have the header key but an empty sub-object
    const header = CFG.EXCEL_NODE_HEADER;
    expect(node.D4Data[header]).toBeDefined();
    expect(Object.keys(node.D4Data[header])).toHaveLength(0);

    // Specifically, no "exists" property anywhere
    const uncategorized = CFG.EXCEL_UNCATEGORIZED_SUBHEADER;
    expect(node.D4Data[header][uncategorized]).toBeUndefined();
  });

  it('does NOT inject "exists" for edges without properties', async () => {
    const buffer = await buildExcelBuffer(
      [{ ID: "n1" }, { ID: "n2" }],
      [{ "Source ID": "n1", "Target ID": "n2" }],
    );

    const result = await io.parseExcelToJson(buffer);
    const edge = result.edges[0];
    expect(edge).toBeDefined();

    const header = CFG.EXCEL_EDGE_HEADER;
    expect(Object.keys(edge.D4Data[header])).toHaveLength(0);

    const uncategorized = CFG.EXCEL_UNCATEGORIZED_SUBHEADER;
    expect(edge.D4Data[header][uncategorized]).toBeUndefined();
  });
});

// --------------------------------------------------------------------------
// 2. Consolidated log instead of per-element warnings
// --------------------------------------------------------------------------
describe("consolidated info log for propertyless elements", () => {
  let io, cache;

  beforeEach(() => {
    cache = createMockCache();
    io = new IOManager(cache);
  });

  it("emits one info message (not N warnings) when N nodes have no properties", async () => {
    const buffer = await buildExcelBuffer(
      [{ ID: "n1" }, { ID: "n2" }, { ID: "n3" }],
      [{ "Source ID": "n1", "Target ID": "n2" }],
    );

    await io.parseExcelToJson(buffer);

    // Should NOT have per-node warnings about "exists"
    const existsWarnings = cache.ui.warning.mock.calls.filter(
      (call) => call[0] && call[0].includes("exists"),
    );
    expect(existsWarnings).toHaveLength(0);

    // Should have one consolidated info message mentioning node IDs
    const infoMessages = cache.ui.info.mock.calls.filter(
      (call) =>
        call[0] &&
        call[0].includes("node") &&
        call[0].includes("no user-defined properties"),
    );
    expect(infoMessages).toHaveLength(1);
    expect(infoMessages[0][0]).toContain("3");
  });

  it("emits one info message for propertyless edges", async () => {
    const buffer = await buildExcelBuffer(
      [{ ID: "n1" }, { ID: "n2" }],
      [{ "Source ID": "n1", "Target ID": "n2" }],
    );

    await io.parseExcelToJson(buffer);

    const infoMessages = cache.ui.info.mock.calls.filter(
      (call) =>
        call[0] &&
        call[0].includes("edge") &&
        call[0].includes("no user-defined properties"),
    );
    expect(infoMessages).toHaveLength(1);
    expect(infoMessages[0][0]).toContain("1");
  });

  it("does NOT emit info message when all nodes have properties", async () => {
    const buffer = await buildExcelBuffer(
      [{ ID: "n1", score: 42 }],
      [{ "Source ID": "n1", "Target ID": "n1" }],
    );

    await io.parseExcelToJson(buffer);

    const infoMessages = cache.ui.info.mock.calls.filter(
      (call) =>
        call[0] &&
        call[0].includes("no user-defined properties") &&
        call[0].includes("node"),
    );
    expect(infoMessages).toHaveLength(0);
  });
});

// --------------------------------------------------------------------------
// 3. getPropertiesNotWithinThresholds returns [] for featureless elements
// --------------------------------------------------------------------------
describe("getPropertiesNotWithinThresholds — featureless bypass", () => {
  let fm, cache;

  beforeEach(() => {
    cache = createMockCache();
    fm = new GraphFilterManager(cache);
  });

  it("returns [] for a node with empty features Set", () => {
    const node = {
      id: "n1",
      features: new Set(),
      featureIsWithinThreshold: new Map(),
    };
    cache.nodeRef.set("n1", node);

    // Even with active props in the system, featureless node should return []
    cache.activeProps.add("Node filters::group::someProp");
    cache.nodeExclusiveProps.add("Node filters::group::someProp");

    const result = fm.getPropertiesNotWithinThresholds("n1", null);
    expect(result).toEqual([]);
  });

  it("returns [] for an edge with empty features Set", () => {
    const edge = {
      id: "e1",
      features: new Set(),
      featureIsWithinThreshold: new Map(),
    };
    cache.edgeRef.set("e1", edge);

    cache.activeProps.add("Edge filters::group::someProp");
    cache.edgeExclusiveProps.add("Edge filters::group::someProp");

    const result = fm.getPropertiesNotWithinThresholds(null, "e1");
    expect(result).toEqual([]);
  });

  it("still returns failing props for elements WITH features", () => {
    const node = {
      id: "n1",
      features: new Set(["Node filters::group::score"]),
      featureIsWithinThreshold: new Map([
        ["Node filters::group::score", false],
      ]),
    };
    cache.nodeRef.set("n1", node);
    cache.activeProps.add("Node filters::group::score");
    cache.nodeExclusiveProps.add("Node filters::group::score");

    const result = fm.getPropertiesNotWithinThresholds("n1", null);
    expect(result).toContain("Node filters::group::score");
  });
});
