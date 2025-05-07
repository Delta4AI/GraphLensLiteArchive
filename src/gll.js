const {
  Graph,
  NodeEvent,
  GraphEvent,
  CanvasEvent,
  CommonEvent,
  WindowEvent,
  Layout,
  BaseLayout,
  ExtensionCategory,
  register
} = G6;


class CustomForceLayout extends BaseLayout {
  id = 'custom-force-layout';

  async execute(data) {
    const {nodes = []} = data;
    const myNodes = nodes
      .filter(n => cache.selectedNodes.includes(n.id))
      .map((node, index) => ({
        id: node.id,
        style: {
          x: 50 * index + 25,
          y: 50 * index + 25,
        },
      }));
    graph.updateNodeData(myNodes);
    persistNodePositions();
    return {
      nodes: myNodes,
    };
  }
}

register(ExtensionCategory.LAYOUT, 'custom', CustomForceLayout);

// graph.setLayout({type: 'custom'});
// persistNodePositions();
// handleFilterEvent("Custom", "foo");

/**
 *  Essential objects
 */
/* @type {import('@antv/g6').Graph","null} */
let graph = null;  // The G6 graph object
let data = {};  // Stores data that can be serialized as json file
let cache = {initialized: false};  // Stores references to map IDs to node/edge objects that cannot be serialized to a json file
let didShowAnyStatusMessage = false;

/**
 *  GLL configuration parameters
 */

// Determines if filter sliders should be hidden when the minimum and maximum values are identical
const HIDE_SLIDERS_WITH_SAME_MIN_MAX_VALUES = true;

// Specifies the slider step size for integer-based properties
const FILTER_STEP_SIZE_INTEGER = 1;

// Specifies the slider step size for float-based properties
const FILTER_STEP_SIZE_FLOAT = 0.000001;

// Specifies the slider thumb- and tooltip-values (only visually); internally, the full float precision is used
const FILTER_VISUAL_FLOAT_PRECISION = 3;

// If true, all node and edge filters are enabled on initial model load; disabled on large graphs
let FILTERS_ACTIVE_PER_DEFAULT = true;

// If true, filters in the side-panel are sorted alphabetically
const SORT_FILTERS = false;

// If true, filters in the tooltips are sorted alphabetically
const SORT_TOOLTIPS = true;

// Maximum tooltip columns
const TOOLTIP_MAX_COLUMNS = 1;

// If true, properties with null (empty) values are not displayed in tooltips
const TOOLTIP_HIDE_NULL_VALUES = false;

// Node count threshold beyond which labels and hover effects are disabled to keep the application responsive
const MAX_NODES_BEFORE_HIDING_LABELS_AND_HOVER_EFFECT = 300;

// If true, bubble groups avoid all non-bubble group members per default
const AVOID_NON_BUBBLE_GROUP_MEMBERS = false;

// Used for "clearing" labels
const INVISIBLE_CHARACTER = "\u200B";

// Maximum capacity of selection memory
const MAX_SELECTION_MEMORY = 10;

// If true, an additional "Node Connectivity" section is displayed in the UI
const ENABLE_NODE_CONNECTIVITY_SECTION = false;

/**
 *  Excel-model import related properties
 */

// Header automatically assigned to properties without a group definition
const EXCEL_UNCATEGORIZED_SUBHEADER = "Uncategorized Properties";

// Node filter header
const EXCEL_NODE_HEADER = "Node filters";

// Edge filter header
const EXCEL_EDGE_HEADER = "Edge filters";

// The following constants define the columns in the Excel template for mapping node and edge properties
// allowed types: "str", "num", "bool", "rgba", "oneOf:a|b|c"
// @formatter:off
const EXCEL_NODE_PROPERTIES = [
  {column: "ID", type: "str", required: true},
  {column: "Label", type: "str", apply: (n, v) => {
    n.label = v;
    n.style.label = DEFAULTS.NODE.LABEL.ENABLED;
    n.style.labelText = v;
    n.style.labelFontSize = DEFAULTS.NODE.FONT_SIZE;
    n.style.labelFill = DEFAULTS.NODE.FOREGROUND_COLOR;
    n.style.labelBackground = DEFAULTS.NODE.BACKGROUND;
    n.style.labelBackgroundFill = DEFAULTS.NODE.BACKGROUND_COLOR;
    n.style.labelPlacement = DEFAULTS.NODE.PLACEMENT;
  }},
  {column: "Label Font Size", type: "num", apply: (n, v) => {n.style.labelFontSize = v; }},
  {
    column: "Label Placement",
    type: "oneOf:left|right|top|bottom|left-top|left-bottom|right-top|right-bottom|top-left|top-right|bottom-left|"
      + "bottom-right|center",
    apply: (n, v) => {n.style.labelPlacement = v; }
  },
  {column: "Label Color", type: "rgba", apply: (n, v) => {n.style.labelFill = v; }},
  {column: "Label Background Color", type: "rgba", apply: (n, v) => {
    n.style.labelBackground = true;
    n.style.labelBackgroundFill = v;
  }},
  {column: "Description", type: "str", apply: (n, v) => {n.description = v; }},
  {column: "Shape", type: "oneOf:circle|diamond|hexagon|rect|triangle|star", apply: (n, v) => {n.type = v; }},
  {column: "Size", type: "num", apply: (n, v) => {n.style.size = v; }},
  {column: "Fill Color", type: "rgba", apply: (n, v) => {n.style.fill = v; }},
  {column: "Border Color", type: "rgba", apply: (n, v) => {n.style.stroke = v; }},
  {column: "Border Size", type: "num", apply: (n, v) => {n.style.lineWidth = v; }},
  {column: "X Coordinate", type: "num", apply: (n, v) => {n.style.x = v; }},
  {column: "Y Coordinate", type: "num", apply: (n, v) => {n.style.y = v; }},
];

const EXCEL_EDGE_PROPERTIES = [
  {column: "Source ID", type: "str", required: true},
  {column: "Target ID", type: "str", required: true},
  {column: "Label", type: "str", apply: (e, v) => {
    e.label = v;
    e.style.label = true;
    e.style.labelText = v;
    e.style.labelFontSize = DEFAULTS.EDGE.LABEL.FONT_SIZE;
    e.style.labelFill = DEFAULTS.EDGE.LABEL.FOREGROUND_COLOR;
    e.style.labelPlacement = DEFAULTS.EDGE.LABEL.PLACEMENT;
    e.style.labelAutoRotate = DEFAULTS.EDGE.LABEL.AUTO_ROTATE;
    e.style.labelBackground = DEFAULTS.EDGE.LABEL.BACKGROUND;
    e.style.labelBackgroundFill = DEFAULTS.EDGE.LABEL.BACKGROUND_COLOR;
  }},
  {column: "Label Font Size", type: "num", apply: (e, v) => {e.style.labelFontSize = v; }},
  {column: "Label Placement", type: "oneOf:start|center|end", apply: (e, v) => {e.style.labelPlacement = v; }},
  {column: "Label Color", type: "rgba", apply: (e, v) => {e.style.labelFill = v; }},
  {column: "Label Background Color", type: "rgba", apply: (e, v) => {
    e.style.labelBackground = true;
    e.style.labelBackgroundFill = v;
  }},
  {column: "Label Offset X", type: "num", apply: (e, v) => {e.style.labelOffsetX = v; }},
  {column: "Label Offset Y", type: "num", apply: (e, v) => {e.style.labelOffsetY = v; }},
  {column: "Label Auto Rotate", type: "bool", apply: (e, v) => {e.style.labelAutoRotate = v; }},
  {column: "Color", type: "rgba", apply: (e, v) => {e.style.stroke = v; }},
  {column: "Line Width", type: "num", apply: (e, v) => {e.style.lineWidth = v; }},
  {column: "Line Dash", type: "num", apply: (e, v) => {e.style.lineDash = v; }},
  {column: "Type", type: "oneOf:line|cubic|quadratic|polyline", apply: (e, v) => {e.type = v; }},
  {column: "Start Arrow", type: "bool", apply: (e, v) => {e.startArrow = v; }},
  {column: "Start Arrow Size", type: "num", apply: (e, v) => {e.startArrowSize = v; }},
  {column: "Start Arrow Type", type: "oneOf:triangle|circle|diamond|vee|rect|triangleRect|simple",
    apply: (e, v) => {e.startArrowType = v; }
  },
  {column: "End Arrow", type: "bool", apply: (e, v) => {e.endArrow = v; }},
  {column: "End Arrow Size", type: "num", apply: (e, v) => {e.endArrowSize = v; }},
  {column: "End Arrow Type", type: "oneOf:triangle|circle|diamond|vee|rect|triangleRect|simple",
    apply: (e, v) => { e.endArrowType = v; }
  },
  {column: "Halo Color", type: "rgba", apply: (e, v) => {
    e.style.halo = true;
    e.style.haloStroke = v;
  }},
  {column: "Halo Width", type: "num", apply: (e, v) => {e.style.haloLineWidth = v; }},
];
// @formatter:on

/**
 * Defaults for the graph, layouts and UI
 */
const DEFAULTS = {
  NODE: {
    FILL_COLOR: "#C33D35", SIZE: 20, LINE_WIDTH: 1, TYPE: "hexagon", STROKE_COLOR: null,
    BADGE: {
      FONT_SIZE: 8, COLOR: "#C33D35"
    },
    LABEL: {
      ENABLED: true, FOREGROUND_COLOR: "#000000", BACKGROUND: false, BACKGROUND_COLOR: null, BACKGROUND_RADIUS: 5,
      PADDING: 2, PLACEMENT: "bottom", FONT_SIZE: 12
    },
  },
  EDGE: {
    COLOR: "#403C5390", LINE_WIDTH: 0.75, LINE_DASH: 0, TYPE: "line",
    ARROWS: {START: false, END: false, START_SIZE: 8, START_TYPE: "triangle", END_SIZE: 8, END_TYPE: "triangle"},
    LABEL: {
      ENABLED: false, TEXT: null, FOREGROUND_COLOR: "#000000", BACKGROUND: false, BACKGROUND_COLOR: null,
      PLACEMENT: "center", FONT_SIZE: 12, AUTO_ROTATE: false, OFFSET_X: 0, OFFSET_Y: 0
    },
    HALO: {
      ENABLED: false, COLOR: "#403C53", WIDTH: 3,
    }
  },
  LAYOUT: "force",
  LAYOUT_INTERNALS: {
    "force": {gravity: 10},
    // "fruchterman": {gravity: 5, speed: 5, clustering: true, nodeClusterBy: 'cluster', clusterGravity: 16},
    // "antv-dagre": {nodesep: 100, ranksep: 70, controlPoints: true},
    "circular": {startRadius: 10, endRadius: 300},
    "radial": {direction: "LR", nodeSize: 32, unitRadius: 100, linkDistance: 200},
    "concentric": {nodeSize: 32, maxLevelDiff: 0.5, sortBy: 'degree', preventOverlap: true},
    "grid": {sortBy: "id", nodeSize: 32},
    "mds": {nodeSize: 32, linkDistance: 100},
  },
  BUBBLE_SET_STYLE: {
    "groupOne": {fill: '#403C53', fillOpacity: 0.25, stroke: '#C33D35', strokeOpacity: 1, virtualEdges: true,},
    "groupTwo": {fill: '#c33d35', fillOpacity: 0.25, stroke: '#403c53', strokeOpacity: 1, virtualEdges: true,},
    "groupThree": {fill: '#EFB0AA', fillOpacity: 0.4, stroke: '#8CA6D9', strokeOpacity: 1, virtualEdges: true,},
    "groupFour": {fill: '#8CA6D9', fillOpacity: 0.4, stroke: '#EFB0AA', strokeOpacity: 1, virtualEdges: true,},
  },
  BUBBLE_SET_QUADRANT_POSITIONS: {
    groupOne: "top-left", groupTwo: "top-right", groupThree: "bottom-left", groupFour: "bottom-right"
  },
  STYLES: {
    NODE_FORM: {"●": "circle", "◆": "diamond", "⬢": "hexagon", "■": "rect", "▲": "triangle", "★": "star"},
    NODE_COLORS: {red: "#C33D35", purple: "#403C53", blue: "#8CA6D9", pink: "#EFB0AA", grey: "#ABACBD"},
    NODE_SIZES: {s: 15, m: 25, l: 35, xl: 50},
    NODE_BORDER_COLORS: {
      red: "#C33D35",
      purple: "#403C53",
      blue: "#8CA6D9",
      pink: "#EFB0AA",
      grey: "#ABACBD",
      none: "#00000000"
    },
    NODE_BORDER_SIZES: {sm: 0.5, md: 1, lg: 2, xlg: 4},
    NODE_LABEL_FONT_SIZES: {sm: 10, md: 12, lg: 14, xlg: 20},
    NODE_LABEL_COLORS: {black: "#000000", red: "#C33D35", purple: "#403C53", grey: "#ABACBD"},
    NODE_LABEL_PLACEMENTS: ["left", "right", "top", "bottom", "left-top", "left-bottom", "right-top", "right-bottom", "top-left", "top-right", "bottom-left", "bottom-right", "center"],
    NODE_LABEL_BACKGROUND_COLORS: {
      red: "#C33D35",
      purple: "#403C53",
      blue: "#8CA6D9",
      pink: "#EFB0AA",
      grey: "#ABACBD",
      none: "#00000000"
    },
    NODE_BADGE_PLACEMENTS: ["left", "right", "top", "bottom", "left-top", "left-bottom", "right-top", "right-bottom", "top-left", "top-right", "bottom-left", "bottom-right"],
    EDGE_TYPES: ["line", "cubic", "quadratic", "polyline"],
    EDGE_COLORS: {red: "#C33D35", purple: "#403C53", blue: "#8CA6D9", pink: "#EFB0AA", grey: "#ABACBD"},
    // EDGE_WIDTHS: {sm: 0.5, md: 0.75, lg: 1, xlg: 3},
    EDGE_DASHS: {none: 0, dashed: 10},
    EDGE_LABEL_FONT_SIZES: {sm: 8, md: 12, lg: 16},
    EDGE_LABEL_PLACEMENTS: ["start", "center", "end"],
    EDGE_LABEL_COLORS: {red: "#C33D35", purple: "#403C53", blue: "#8CA6D9", pink: "#EFB0AA", grey: "#ABACBD"},
    EDGE_LABEL_BACKGROUND_COLORS: {
      red: "#C33D35",
      purple: "#403C53",
      blue: "#8CA6D9",
      pink: "#EFB0AA",
      grey: "#ABACBD"
    },
    EDGE_LABEL_OFFSET_X: {"-25": -25, "0": 0, "25": 25},
    EDGE_LABEL_OFFSET_Y: {"-25": -25, "0": 0, "25": 25},
    // EDGE_LABEL_AUTOROTATE: {enable: true, disable: false},
    // EDGE_ARROW_SIZES: {sm: 8, md: 10, lg: 14},
    EDGE_ARROW_TYPES: ["triangle", "circle", "diamond", "vee", "rect", "triangleRect", "simple"],
    EDGE_HALO: {enable: true, disable: false},
    EDGE_HALO_STROKE: {red: "#C33D35", purple: "#403C53", blue: "#8CA6D9"},
    EDGE_HALO_WIDTH: {sm: 2, md: 3, lg: 5},
  },
  FILTER_STRATEGY: "OR",
};


class QueryFilter {
  constructor(instructions) {
    // keep original structure – no pre-processing necessary
    this.instructions = instructions;
  }

  /* ===== public API =================================================== */
  testNode(node) {
    return this.#evalExpr(this.instructions, node, /*elemType*/ 'Node filters');
  }

  testEdge(edge) {
    return this.#evalExpr(this.instructions, edge, /*elemType*/ 'Edge filters');
  }

  /* ===== internal helpers ============================================ */
  /**
   * Recursively evaluate any sub-expression.
   * Implements “left-before-right” for chains of arbitrary length.
   */
  #evalExpr(expr, element, requestedMainGroup) {
    if (!Array.isArray(expr)) return false;

    /* ---------- 1. unwrap single-element containers --------------------- */
    if (expr.length === 1) {
      return this.#evalExpr(expr[0], element, requestedMainGroup);
    }

    /* ---------- 2. leaf detection --------------------------------------- */
    const isLeaf =
      expr.length > 0 &&
      !Array.isArray(expr[0]) &&          // first item is NOT another list
      typeof expr[0] === 'object' &&
      expr[0]?.type === 'property';

    if (isLeaf) {
      return this.#evalLeaf(expr, element, requestedMainGroup);
    }

    /* ---------- 3. composite chain  (lhs OP rhs OP rhs2 …) -------------- */
    if (expr.length >= 3 && typeof expr[1] === 'string') {
      // evaluate first operand
      let acc = this.#evalExpr(expr[0], element, requestedMainGroup);

      // walk through the chain left-to-right
      for (let i = 1; i < expr.length; i += 2) {
        const op  = expr[i];           // "AND" | "OR" | "NOT"
        const rhs = this.#evalExpr(expr[i + 1], element, requestedMainGroup);

        switch (op) {
          case 'AND':
            acc = acc && rhs;
            break;
          case 'OR':
            acc = acc || rhs;
            break;
          case 'NOT':
            // “lhs NOT rhs”  :=  lhs && !rhs   (specification)
            acc = acc && !rhs;
            break;
          default:
            // should never occur with validated input
            return false;
        }
      }
      return acc;
    }

    /* ---------- 4. nothing matched  ------------------------------------ */
    return false;   // fallback – shouldn’t be reached with valid input
  }


  // Evaluate a single property expression
  #evalLeaf(tokens, element, requestedMainGroup) {
    /*  token layout (guaranteed):
          0: property
          1: KW (BETWEEN | LOWER THAN | IN [)
          2+: values / further KW
    */
    const propTok = tokens[0];
    const opTok   = tokens[1];  // KW: "BETWEEN" | "LOWER THAN" | "IN [""]
    const value   = this.#readValue(element, propTok);

    if (value === undefined || value === null) return false;

    // skip properties of the wrong main group (e.g. node property on an edge)
    if (propTok.main !== requestedMainGroup) return false;

    const propVal = this.#readValue(element, propTok);
    if (propVal === undefined || propVal === null) return false;

    const op = tokens[1].value;

    // --- BETWEEN a AND b ------------------------------------------------
    if (op === 'BETWEEN') {
      const lower = tokens[2].value;
      const upper = tokens[4].value;
      return typeof propVal === 'number' && propVal >= lower && propVal <= upper;
    }

    // --- LOWER THAN a OR GREATER THAN b -------------------------------
    if (op === 'LOWER THAN') {
      const low  = tokens[2].value;  // a
      const high = tokens[4].value;  // b
      return typeof propVal === 'number' && (propVal <= low || propVal >= high);
    }

    // --- IN [ a, b, c ] -------------------------------------------------
    if (op.startsWith('IN')) {
      const set = tokens.slice(2).map(t => t.value);
      return set.includes(propVal);
    }

    return false;
  }

  // Safely pull the data from the D4Data hierarchy
  #readValue(element, { main, sub, prop }) {
    try {
      return element?.D4Data?.[main]?.[sub]?.[prop];
    } catch {
      return undefined;
    }
  }
}

function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

function isNumber(value) {
  const parsed = parseFloat(value);
  return !isNaN(parsed) && isFinite(parsed);
}

function isInList(value, allowedValues) {
  return allowedValues.includes(value);
}

function isBoolean(value) {
  if (typeof value === 'boolean') {
    return true;
  }
  if (typeof value === 'string') {
    const lowerVal = value.trim().toLowerCase();
    return lowerVal === 'true' || lowerVal === 'false';
  }
  if (typeof value === 'number') {
    return value === 1 || value === 0;
  }
  return false;
}

function isHexColor(value) {
  if (!isString(value)) return false;
  const hexRegex = /^#(?:[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
  return hexRegex.test(value.trim());
}


function createDefaultLayout(key) {
  const defLayout = {
    internals: DEFAULTS.LAYOUT_INTERNALS[key] || null,
    positions: new Map(),
    filters: structuredClone(data.filterDefaults),
    isCustom: false,
    filterStrategy: DEFAULTS.FILTER_STRATEGY,
  };

  for (const [nodeID, positions] of cache.nodePositionsFromExcelImport) {
    defLayout.positions.set(nodeID, {x: positions.x, y: positions.y});
  }

  for (let group of traverseBubbleSets()) {
    defLayout[`${group}Props`] = new Set();
  }

  return defLayout;
}

function parseGroups(filterValue) {
  const groupData = {
    categories: new Set(filterValue?.categories || []),
  };
  for (let group of traverseBubbleSets()) {
    groupData[`${group}Members`] = new Set(filterValue[`${group}Members`] || []);
    groupData[`${group}IDs`] = new Set(filterValue[`${group}IDs`] || []);
    groupData[`${group}MembersHidden`] = new Set(filterValue[`${group}MembersHidden`] || []);
    groupData[`${group}IDsHidden`] = new Set(filterValue[`${group}IDsHidden`] || []);
  }
  return groupData;
}

function parseLayouts(jsonLayouts) {
  const parsedLayouts = {};
  Object.entries(jsonLayouts).forEach(([key, layout]) => {
    parsedLayouts[key] = {
      internals: layout.internals || null,
      positions: new Map(Object.entries(layout.positions || {})),
      filters: new Map(Object.entries(layout.filters || {}).map(([key, value]) => [key, {
        ...value, ...parseGroups(value),
      },])),
      isCustom: layout.isCustom || false,
      filterStrategy: layout.filterStrategy || DEFAULTS.FILTER_STRATEGY,
    };

    for (let group of traverseBubbleSets()) {
      parsedLayouts[key][`${group}Props`] = new Set(layout[`${group}Props`] || []);
    }
  });
  return parsedLayouts;
}

function getReadableForegroundColor(hex) {
  if (hex === "#00000000") return "#000000"
  hex = hex.replace(/^#/, "");
  let r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
  let g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
  let b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 186 ? "#000000" : "#FFFFFF";
}

function getTargetNodes(propID) {
  if (!propID) return cache.selectedNodes;
  if (!cache.propToNodeIDs.has(propID)) {
    return [];
  }
  return [...cache.propToNodeIDs.get(propID)].filter((nodeID) =>
    cache.nodeIDsToBeShown.has(nodeID)
  );
}

function getTargetEdges(propID) {
  if (!propID) return cache.selectedEdges;
  if (!cache.propToEdgeIDs.has(propID)) {
    return [];
  }
  return [...cache.propToEdgeIDs.get(propID)].filter((edgeID) =>
    cache.edgeIDsToBeShown.has(edgeID)
  );
}

function layoutSelectedNodes(action) {
  if (cache.selectedNodes.length === 0) return;

  function getSelectedNodes() {
    return graph.getNodeData().filter((node) => cache.selectedNodes.includes(node.id));
  }

  function groupOrSpreadSelectedNodes(scale) {
    for (const node of getSelectedNodes()) {
      const oldX = node.style.x;
      const oldY = node.style.y;

      node.style.x = avgX + (oldX - avgX) * scale;
      node.style.y = avgY + (oldY - avgY) * scale;
    }
  }

  function arrangeNodesInCircle(radius) {
    const numNodes = cache.selectedNodes.length;
    let angleStep = (2 * Math.PI) / numNodes;

    let i = 0;
    for (const node of getSelectedNodes()) {
      const angle = i * angleStep;
      node.style.x = avgX + radius * Math.cos(angle);
      node.style.y = avgY + radius * Math.sin(angle);
      i++;
    }
  }

  function applyForceLayout(iterations) {
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
    const nodes = getSelectedNodes();
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
      for (const edge of graph.getEdgeData()) {
        const {source, target} = edge;
        if (cache.selectedNodes.includes(source) && cache.selectedNodes.includes(target)) {
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

  function applyGridLayout() {
    const nodes = getSelectedNodes();
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
        node.style.x = avgX - totalWidth / 2 + col * spacing;
        node.style.y = avgY - totalHeight / 2 + row * spacing;
        idx++;
      }
    }
  }

  function applyRandomLayout() {
    for (const node of getSelectedNodes()) {
      node.style.x = minX + Math.random() * xDistance;
      node.style.y = minY + Math.random() * yDistance;
    }
  }

  const selectedNodes = new Map(
    [...data.layouts[data.selectedLayout].positions]
      .filter(([key]) => cache.selectedNodes.includes(key))
  );
  const selectedNodesCoords = [...selectedNodes.values()];
  const avgX = selectedNodesCoords.reduce((sum, pos) => sum + pos.x, 0) / selectedNodesCoords.length;
  const avgY = selectedNodesCoords.reduce((sum, pos) => sum + pos.y, 0) / selectedNodesCoords.length;
  const minX = Math.min(...selectedNodesCoords.map((pos) => pos.x));
  const maxX = Math.max(...selectedNodesCoords.map((pos) => pos.x));
  const minY = Math.min(...selectedNodesCoords.map((pos) => pos.y));
  const maxY = Math.max(...selectedNodesCoords.map((pos) => pos.y));
  const xDistance = maxX - minX;
  const yDistance = maxY - minY;

  const eventLabels = {
    "shrink": "Shrinking Selected Nodes in Layout",
    "expand": "Expanding Selected Nodes in Layout",
    "circle": "Applying Circular Layout to Selected Nodes",
    "force": "Applying Force Layout to Selected Nodes",
    "grid": "Applying Grid Layout to Selected Nodes",
    "random": "Applying Random Layout to Selected Nodes",
  }

  const layoutActions = {
    "shrink": () => groupOrSpreadSelectedNodes(0.5),
    "expand": () => groupOrSpreadSelectedNodes(2),
    "circle": () => arrangeNodesInCircle(100),
    "force": () => applyForceLayout(150),
    "grid": () => applyGridLayout(),
    "random": () => applyRandomLayout(),
  }

  layoutActions[action]();
  persistNodePositions();
  handleFilterEvent(action, eventLabels[action]);
}

function createStyleDiv() {
  const root = document.createElement("div");

  function createNewRow(parent) {
    const row = document.createElement("div");
    row.classList.add("card-row");
    parent.appendChild(row);
    return row;
  }

  function appendVerticalRule(parent, label = undefined, tooltip = undefined) {
    const verticalRule = document.createElement("div");
    verticalRule.className = "vr";
    parent.appendChild(verticalRule);
    appendLabel(parent, label, tooltip);
  }

  function createLabel(labelText, tooltip = undefined) {
    if (labelText) {
      const label = document.createElement("label");
      label.textContent = labelText;
      label.className = "vr-label";
      label.id = labelText;
      if (tooltip) label.title = tooltip;
      return label;
    }
    return null;
  }

  function appendLabel(parent, labelText, tooltip = undefined) {
    const label = createLabel(labelText, tooltip);
    if (label) parent.appendChild(label);
  }

  function createCard(label) {
    const card = document.createElement("div");
    card.classList.add("card-labeled");
    card.dataset.label = label;
    card.id = label;
    root.appendChild(card);
    return card;
  }


  function handleStyleChangeEvent(property, value) {
    switch (property) {
      case "Node Size":
        updateNodes({style: {size: value}});
        break;
      case "Node Border Size":
        updateNodes({style: {lineWidth: value}});
        break;
      case "Node Label Font Size":
        updateNodes({style: {labelFontSize: value}});
        break;
      case "Node Label Font Color":
        updateNodes({style: {labelFill: value}});
        break;
      case "Node Label Background Color":
        updateNodes({style: {labelBackground: true, labelBackgroundFill: value}});
        break;
      case "Node Fill Color":
        updateNodes({style: {fill: value}});
        break;
      case "Node Border Color":
        updateNodes({style: {stroke: value}});
        break;
      case "Node Label Color":
        updateNodes({style: {labelFill: value}});
        break;
      case "Node Label Placement":
        updateNodes({style: {labelPlacement: value}});
        break;
      case "Edge Color":
        updateEdges({style: {stroke: value}});
        break;
      case "Edge Width":
        updateEdges({style: {lineWidth: value}});
        break;
      case "Edge Dash":
        updateEdges({style: {lineDash: value}});
        break;
      case "Edge Label Font Size":
        updateEdges({style: {labelFontSize: value}});
        break;
      case "Edge Label Offset X":
        updateEdges({style: {labelOffsetX: value}});
        break;
      case "Edge Label Offset Y":
        updateEdges({style: {labelOffsetY: value}});
        break;
      case "Edge Label Placement":
        updateEdges({style: {labelPlacement: value}});
        break;
      case "Edge Label Font Color":
        updateEdges({style: {labelFill: value}});
        break;
      case "Edge Label Background Color":
        updateEdges({style: {labelBackground: true, labelBackgroundFill: value}});
        break;
      case "Edge Label Auto Rotate":
        updateEdges({style: {labelAutoRotate: value}});
        break;
      case "Edge Start Arrow":
        updateEdges({style: {startArrow: value}});
        break;
      case "Edge End Arrow":
        updateEdges({style: {endArrow: value}});
        break;
      case "Edge Start Arrow Size":
        updateEdges({style: {startArrowSize: value}});
        break;
      case "Edge End Arrow Size":
        updateEdges({style: {endArrowSize: value}});
        break;
      case "Edge Start Arrow Type":
        updateEdges({style: {startArrowType: value}});
        break;
      case "Edge End Arrow Type":
        updateEdges({style: {endArrowType: value}});
        break;
      case "Edge Halo":
        updateEdges({style: {halo: value}});
        break;
      case "Edge Halo Width":
        updateEdges({style: {haloLineWidth: value}});
        break;
      case "Edge Halo Color":
        updateEdges({style: {haloStroke: value}});
        break;
      default:
        break;
    }
  }

  function createBooleanControls(parent, property, tooltip = undefined) {
    const onBtn = document.createElement("button");
    onBtn.textContent = "On";
    onBtn.classList.add("style-inner-button");
    onBtn.onclick = () => {
      handleStyleChangeEvent(property, true);
    }
    if (tooltip) onBtn.title = tooltip;
    parent.appendChild(onBtn);

    const offBtn = document.createElement("button");
    offBtn.textContent = "Off";
    offBtn.classList.add("style-inner-button");
    offBtn.onclick = () => {
      handleStyleChangeEvent(property, false);
    }
    if (tooltip) offBtn.title = tooltip;
    parent.appendChild(offBtn);
  }


  function createCategoricalControls(parent, property, defaultValue, listOfValues, tooltip = undefined) {
    const dropdown = document.createElement("select");
    dropdown.className = "style-inner-button";
    if (tooltip) dropdown.title = tooltip;

    listOfValues.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      dropdown.appendChild(option);
      dropdown.onchange = () => {
        handleStyleChangeEvent(property, dropdown.value);
      };
    });

    dropdown.value = defaultValue;
    parent.appendChild(dropdown);
  }

  function createNumericalSlider(parent, property, defaultValue, sliderParams = {
    min: 0,
    max: 100,
    step: 1
  }, tooltip = undefined) {
    const useFloat =
      !Number.isInteger(sliderParams.min) ||
      !Number.isInteger(sliderParams.max) ||
      !Number.isInteger(sliderParams.step);

    // A helper function to parse according to the useFloat flag
    function parseValue(val) {
      return useFloat ? parseFloat(val) : parseInt(val, 10);
    }

    const typedDefaultValue = parseValue(defaultValue);

    const container = document.createElement("div");
    container.className = "style-slider-container";
    if (tooltip) container.title = tooltip;

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = sliderParams.min;
    slider.max = sliderParams.max;
    slider.step = sliderParams.step;
    slider.value = typedDefaultValue;
    slider.classList.add("style-slider");

    const valueInput = document.createElement("input");
    valueInput.type = "number";
    valueInput.value = typedDefaultValue;
    valueInput.classList.add("style-input-sm");

    slider.oninput = () => {
      valueInput.value = slider.value;
    };

    slider.onchange = () => {
      handleStyleChangeEvent(property, parseValue(slider.value));
    };

    valueInput.onchange = () => {
      slider.value = valueInput.value;
      handleStyleChangeEvent(property, parseValue(valueInput.value));
    };

    container.appendChild(slider);
    container.appendChild(valueInput);

    parent.appendChild(container);
  }

  function createColorPicker(defaultColor, title) {
    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.classList.add("style-inner-button");
    colorPicker.style.width = "24px";
    colorPicker.value = defaultColor;
    colorPicker.title = title;
    return colorPicker;
  }

  function createColorControls(parent, property, defaultColor, colors) {
    const colorButtonDiv = document.createElement("div");
    colorButtonDiv.className = "style-color-button-container";

    for (const [label, value] of Object.entries(colors)) {
      const colorButton = document.createElement("button");
      colorButton.style.backgroundColor = value;
      colorButton.style.color = getReadableForegroundColor(value);
      colorButton.className = "style-inner-button style-color-button";
      colorButton.title = `Set ${property} of the selected elements to ${label} (${value}).`;

      if (label === "none") {
        colorButton.textContent = "×";
        colorButton.style.maxWidth = "12px";
      }

      colorButton.onclick = () => {
        colorInput.value = value;
        handleStyleChangeEvent(property, value);
      };
      colorButtonDiv.appendChild(colorButton);
    }

    parent.appendChild(colorButtonDiv);

    const colorPicker = createColorPicker(defaultColor,
      `Set ${property} of the selected elements to a color of choice.`);

    colorPicker.oninput = () => {
      colorInput.value = colorPicker.value;
    };

    colorPicker.onchange = () => {
      handleStyleChangeEvent(property, colorPicker.value);
    }

    const colorInput = document.createElement("input");
    colorInput.type = "text";
    colorInput.value = defaultColor;
    colorInput.classList.add("style-input");
    colorInput.title = `Set ${property} of the selected elements to a color of choice (RGBA hex color code).`;
    colorInput.placeholder = `Enter Color`;

    colorInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        handleStyleChangeEvent(property, colorInput.value);
      }
    });

    parent.appendChild(colorPicker);
    parent.appendChild(colorInput);
  }

  function createLabelControls(parent, property, isNode = null) {
    const labelInput = createInput(true, `Enter Custom ${property}`,
      `Set the label of the selected ${isNode ? "nodes" : "edges"} to a custom label.`, undefined, () => {
        isNode ? updateNodes({
          style: {
            label: true,
            labelText: labelInput.value.trim()
          }
        }) : updateEdges({style: {label: true, labelText: labelInput.value.trim()}});
      });

    const clearLabelButton = createButton("Clear",
      `Clear the label of the selected ${isNode ? "nodes" : "edges"}.`, () => {
        labelInput.value = "";
        const sharedOverride = {
          style: {
            label: false,
            labelText: INVISIBLE_CHARACTER
          }
        };
        isNode ? updateNodes(sharedOverride) : updateEdges(sharedOverride);
        labelInput.value = "";
      });

    const setToIDButton = createButton("Set to ID",
      `Set the label of the selected ${isNode ? "nodes" : "edges"} to their predefined IDs.`, () => {
        labelInput.value = "";
        const sharedCommands = ["label_set_to_id"];
        isNode ? updateNodes(undefined, sharedCommands) : updateEdges(undefined, sharedCommands);
      });
    const setToLabelButton = createButton("Set to Label",
      `Set the label of the selected ${isNode ? "nodes" : "edges"} to their predefined labels.`, () => {
        labelInput.value = "";
        const sharedCommands = ["label_set_to_label"];
        isNode ? updateNodes(undefined, sharedCommands) : updateEdges(undefined, sharedCommands);
      });

    parent.appendChild(labelInput);
    parent.appendChild(setToIDButton);
    if (isNode) parent.appendChild(setToLabelButton);
    parent.appendChild(clearLabelButton);
  }


  function createButton(label, tooltip, callback) {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.title = tooltip;
    btn.classList.add("style-inner-button");
    if (label === "Clear") btn.classList.add("red");
    btn.id = label;
    btn.onclick = () => {
      callback();
    }
    return btn;
  }

  function appendButton(parent, label, tooltip, callback) {
    const btn = createButton(label, tooltip, callback);
    parent.appendChild(btn);
  }

  function createInput(large = true, placeholder = undefined, title = undefined,
                       defaultValue = undefined, callback = undefined) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = placeholder;
    input.title = title;
    input.classList.add("style-input");
    input.value = defaultValue || "";
    if (large) input.classList.add("style-input-lg");
    if (callback) {
      input.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          callback(input.value.trim());
        }
      });
    }
    return input;
  }

  function appendInput(parent, large = true, placeholder = undefined, title = undefined,
                       defaultValue = undefined, callback = undefined) {
    const input = createInput(large, placeholder, title, defaultValue, callback);
    parent.appendChild(input);
  }

  function createNodeShapeControls(parent) {
    for (const [label, value] of Object.entries(DEFAULTS.STYLES.NODE_FORM)) {
      appendButton(parent, label, value,
        () => updateNodes({type: value})
      );
    }
  }

  function createEdgeTypeControls(parent) {
    for (const label of DEFAULTS.STYLES.EDGE_TYPES) {
      appendButton(parent, label, label, () => updateEdges({type: label}));
    }
  }

  function createNodeBadgeControls(parent) {
    const badgeInput = createInput(true, "Enter Badge Text",
      "Enter the text of the badge to add to the selected nodes.", undefined, undefined);
    parent.appendChild(badgeInput);

    const badgeColorPicker = createColorPicker(DEFAULTS.NODE.BADGE.COLOR, "Set the color of the badge.");
    parent.appendChild(badgeColorPicker);

    const badgePlacementDropdown = document.createElement("select");
    badgePlacementDropdown.className = "style-inner-button";
    DEFAULTS.STYLES.NODE_BADGE_PLACEMENTS.forEach((placement) => {
      const option = document.createElement("option");
      option.value = placement;
      option.textContent = placement.replace("-", " ");
      badgePlacementDropdown.appendChild(option);
    });
    parent.appendChild(badgePlacementDropdown);

    appendButton(parent, "Add", "Add a badge to the selected nodes.", () => {
      updateNodes({
          style: {
            badges: [{
              text: badgeInput.value.trim(),
              placement: badgePlacementDropdown.value
            }],
            badgePalette: [badgeColorPicker.value]
          }
        }, ["badge_add"]
      );
    });
    appendButton(parent, "Clear", "Clear all badges from the selected nodes.", () => {
      updateNodes({}, ["badge_clear"]);
    });
  }

  function createSelectCard() {
    const selDiv = createCard("Select Elements");

    const rowOne = createNewRow(selDiv);
    appendButton(rowOne, "All Nodes", "Select all visible nodes",
      () => toggleSelectionForAllNodes(true));
    appendButton(rowOne, "No Nodes", "Deselect all visible nodes",
      () => toggleSelectionForAllNodes(false));
    appendVerticalRule(rowOne);
    appendButton(rowOne, "All Edges", "Select all visible edges",
      () => toggleSelectionForAllEdges(true));
    appendButton(rowOne, "No Edges", "Deselect all visible edges",
      () => toggleSelectionForAllEdges(false));
    appendVerticalRule(rowOne);
    appendButton(rowOne, "Expand Edges",
      "Add all edges connected to the currently selected nodes to the selection",
      () => toggleSelectionByNeighbors("expand-edges"));
    appendButton(rowOne, "Reduce Edges",
      "Remove edges that do not connect two selected nodes",
      () => toggleSelectionByNeighbors("reduce-edges"));
    appendVerticalRule(rowOne);
    appendButton(rowOne, "Expand Neighbors",
      "Add all directly connected neighbor nodes (and their edges) to the current selection",
      () => toggleSelectionByNeighbors("expand-neighbors"));
    appendButton(rowOne, "Reduce Neighbors",
      "Remove the outermost layer of selected neighbor nodes (and their edges) from the ",
      () => toggleSelectionByNeighbors("reduce-neighbors"));

    const rowTwo = createNewRow(selDiv);
    appendLabel(rowTwo, "Select by Node ID(s)",
      "Enter comma-separated node IDs to add to selection.");
    const topTwoNodeIDs = data?.nodes?.slice(0, 2).map(n => n.id).join(',') || 'Node1,Node2';
    const nodeIDsInput = createInput(true, topTwoNodeIDs, "Enter comma-separated list of node IDs to add to selection.",
      undefined, (val) => {
        addNodeOrEdgeIDsToSelection(val, true);
      });
    nodeIDsInput.id = "selectByNodeIDsInput";
    rowTwo.appendChild(nodeIDsInput);
    appendVerticalRule(rowTwo, "Select by Edge ID(s)",
      "Enter comma-separated edge IDs (SourceID::TargetID) to add to selection.");
    const topTwoEdgeIDs = data?.edges?.slice(0, 2).map(e => e.id).join(',') || 'Node1::Node2,Node1::Node3';
    const edgeIDsInput = createInput(true, topTwoEdgeIDs,
      "Enter comma-separated edge IDs (SourceID::TargetID) to add to selection.", undefined, (val) => {
        addNodeOrEdgeIDsToSelection(val, false);
      });
    edgeIDsInput.id = "selectByEdgeIDsInput";
    rowTwo.appendChild(edgeIDsInput);
  }

  function createArrangeNodesCard() {
    const arrDiv = createCard("Arrange Selection");

    const rowOne = createNewRow(arrDiv);
    appendButton(rowOne, "Shrink", "Move nodes closer together, halving their distance to the center.",
      () => layoutSelectedNodes("shrink"));
    appendButton(rowOne, "Expand", "Move nodes farther apart, doubling their distance to the center.",
      () => layoutSelectedNodes("expand"));
    appendVerticalRule(rowOne);
    appendButton(rowOne, "Circle", "Arrange nodes evenly in a circular layout around the center.",
      () => layoutSelectedNodes("circle"));
    appendButton(rowOne, "Force", "Apply a force-directed layout to the selected nodes.",
      () => layoutSelectedNodes("force"));
    appendButton(rowOne, "Grid", "Apply a grid layout to the selected nodes.",
      () => layoutSelectedNodes("grid"));
    appendButton(rowOne, "Random", "Apply a random layout to the selected nodes.",
      () => layoutSelectedNodes("random"));
  }

  function createNodeConfigCard() {
    const nodeDiv = createCard("Node Configuration");

    const rowOne = createNewRow(nodeDiv);
    appendLabel(rowOne, "Shape");
    createNodeShapeControls(rowOne);
    appendVerticalRule(rowOne, "Size");
    createNumericalSlider(rowOne, "Node Size", DEFAULTS.NODE.SIZE,
      {min: 10, max: 50, step: 1});
    appendVerticalRule(rowOne, "Fill Color");
    createColorControls(rowOne, "Node Fill Color", DEFAULTS.NODE.FILL_COLOR, DEFAULTS.STYLES.NODE_COLORS);

    const rowTwo = createNewRow(nodeDiv);
    appendLabel(rowTwo, "Border Size", "Defines the width of the border of the selected nodes.");
    createNumericalSlider(rowTwo, "Node Border Size", DEFAULTS.NODE.LINE_WIDTH,
      {min: 1, max: 10, step: 1}, "Defines the width of the border of the selected nodes.");
    appendVerticalRule(rowTwo, "Border Color", "Defines the fill color of the selected nodes.");
    createColorControls(rowTwo, "Node Border Color", DEFAULTS.NODE.STROKE_COLOR,
      DEFAULTS.STYLES.NODE_BORDER_COLORS);

    const rowThree = createNewRow(nodeDiv);
    appendLabel(rowThree, "Label", "Customize the selected nodes labels.");
    createLabelControls(rowThree, "Node Label", true);
    appendVerticalRule(rowThree, "Font Size", "Defines the font size of the selected nodes labels.");
    createNumericalSlider(rowThree, "Node Label Font Size", DEFAULTS.NODE.LABEL.FONT_SIZE,
      {min: 10, max: 30, step: 1}, "Defines the font size of the selected nodes labels.");
    appendVerticalRule(rowThree, "Placement", "Defines the placement of the selected nodes labels.");
    createCategoricalControls(rowThree, "Node Label Placement", DEFAULTS.NODE.LABEL.PLACEMENT,
      DEFAULTS.STYLES.NODE_LABEL_PLACEMENTS, "Defines the placement of the selected nodes labels.");

    const rowFour = createNewRow(nodeDiv);
    appendLabel(rowFour, "Label Color",
      "Defines the foreground (text) color of the selected nodes labels.");
    createColorControls(rowFour, "Node Label Font Color", DEFAULTS.NODE.LABEL.FOREGROUND_COLOR,
      DEFAULTS.STYLES.NODE_LABEL_COLORS);
    appendVerticalRule(rowFour, "Label Background Color",
      "Defines the background color of the selected nodes labels.");
    createColorControls(rowFour, "Node Label Background Color", DEFAULTS.NODE.LABEL.BACKGROUND_COLOR,
      DEFAULTS.STYLES.NODE_LABEL_BACKGROUND_COLORS);

    const rowFive = createNewRow(nodeDiv);
    appendLabel(rowFive, "Badges", "Add Badges to the selected nodes.");
    createNodeBadgeControls(rowFive);

  }

  function createEdgeConfigCard() {
    const edgeDiv = createCard("Edge Configuration");

    const rowOne = createNewRow(edgeDiv);
    appendLabel(rowOne, "Type", "Change the geometric edge type of the selected edges.");
    createEdgeTypeControls(rowOne);
    appendVerticalRule(rowOne, "Width", "Change the width of the selected edges.");
    createNumericalSlider(rowOne, "Edge Width", DEFAULTS.EDGE.LINE_WIDTH,
      {min: 0.1, max: 10.0, step: 0.1}, "Change the width of the selected edges.");
    appendVerticalRule(rowOne, "Dash", "Define the dash pattern of the selected edges.");
    createNumericalSlider(rowOne, "Edge Dash", DEFAULTS.EDGE.LINE_DASH,
      {min: 0, max: 40, step: 1}, "Define the dash pattern of the selected edges.");
    appendVerticalRule(rowOne, "Color", "Define the selected edges color.");
    createColorControls(rowOne, "Edge Color", DEFAULTS.EDGE.COLOR, DEFAULTS.STYLES.EDGE_COLORS);

    const rowTwo = createNewRow(edgeDiv);
    appendLabel(rowTwo, "Label", "Customize the selected edges labels.");
    createLabelControls(rowTwo, "Edge Label");
    appendVerticalRule(rowTwo, "Font Size", "Defines the font size of the selected edges labels.");
    createNumericalSlider(rowTwo, "Edge Label Font Size", DEFAULTS.EDGE.LABEL.FONT_SIZE,
      {min: 10, max: 30, step: 1}, "Defines the font size of the selected edges labels.");
    appendVerticalRule(rowTwo, "Placement", "Defines the placement of the selected edges labels.");
    createCategoricalControls(rowTwo, "Edge Label Placement", DEFAULTS.EDGE.LABEL.PLACEMENT,
      DEFAULTS.STYLES.EDGE_LABEL_PLACEMENTS, "Defines the placement of the selected edges labels.");
    appendVerticalRule(rowTwo, "Rotate", "Enable/Disable label rotation.");
    createBooleanControls(rowTwo, "Edge Label Auto Rotate", "Enable/Disable label rotation.");

    const rowThree = createNewRow(edgeDiv);
    appendLabel(rowThree, "Label Offset X",
      "Define the offset of the selected edges labels along the X-axis.");
    createNumericalSlider(rowThree, "Edge Label Offset X", DEFAULTS.EDGE.LABEL.OFFSET_X,
      {min: -100, max: 100, step: 1},
      "Define the offset of the selected edges labels along the X-axis.");
    appendVerticalRule(rowThree, "Label Offset Y",
      "Define the offset of the selected edges labels along the Y-axis.");
    createNumericalSlider(rowThree, "Edge Label Offset Y", DEFAULTS.EDGE.LABEL.OFFSET_Y,
      {min: -100, max: 100, step: 1},
      "Define the offset of the selected edges labels along the Y-axis.");

    const rowFour = createNewRow(edgeDiv);
    appendLabel(rowFour, "Label Color",
      "Defines the foreground (text) color of the selected edges labels.");
    createColorControls(rowFour, "Edge Label Font Color", DEFAULTS.EDGE.LABEL.FOREGROUND_COLOR,
      DEFAULTS.STYLES.EDGE_LABEL_COLORS, "Defines the foreground (text) color of the selected edges labels.");
    appendVerticalRule(rowFour, "Label Background Color",
      "Defines the background color of the selected edges labels.");
    createColorControls(rowFour, "Edge Label Background Color", DEFAULTS.EDGE.LABEL.BACKGROUND_COLOR,
      DEFAULTS.STYLES.EDGE_LABEL_BACKGROUND_COLORS, "Defines the background color of the selected edges labels.");

    const rowFive = createNewRow(edgeDiv);
    appendLabel(rowFive, "Start Arrow", "Enable/Disable the start arrow of the selected edges.");
    createBooleanControls(rowFive, "Edge Start Arrow", "Enable/Disable the start arrow of the selected edges.");
    appendVerticalRule(rowFive, "Size", "Define the size of the start arrow of the selected edges.");
    createNumericalSlider(rowFive, "Edge Start Arrow Size", DEFAULTS.EDGE.ARROWS.START_SIZE,
      {min: 10, max: 40, step: 1}, "Define the size of the start arrow of the selected edges.");
    appendVerticalRule(rowFive, "Type", "Define the type of the start arrow of the selected edges.");
    createCategoricalControls(rowFive, "Edge Start Arrow Type", DEFAULTS.EDGE.ARROWS.START_TYPE,
      DEFAULTS.STYLES.EDGE_ARROW_TYPES, "Define the type of the start arrow of the selected edges.");

    const rowSix = createNewRow(edgeDiv);
    appendLabel(rowSix, "End Arrow", "Enable/Disable the end arrow of the selected edges.");
    createBooleanControls(rowSix, "Edge End Arrow", "Enable/Disable the end arrow of the selected edges.");
    appendVerticalRule(rowSix, "Size", "Define the size of the end arrow of the selected edges.");
    createNumericalSlider(rowSix, "Edge End Arrow Size", DEFAULTS.EDGE.ARROWS.END_SIZE,
      {min: 10, max: 40, step: 1}, "Define the size of the end arrow of the selected edges.");
    appendVerticalRule(rowSix, "Type", "Define the type of the end arrow of the selected edges.");
    createCategoricalControls(rowSix, "Edge End Arrow Type", DEFAULTS.EDGE.ARROWS.END_TYPE,
      DEFAULTS.STYLES.EDGE_ARROW_TYPES, "Define the type of the end arrow of the selected edges.");

    const rowSeven = createNewRow(edgeDiv);
    appendLabel(rowSeven, "Halo", "Enable/Disable a halo around the selected edges.");
    createBooleanControls(rowSeven, "Edge Halo", "Enable/Disable a halo around the selected edges.");
    appendVerticalRule(rowSeven, "Color", "Define the color of the halo for the selected edges.");
    createColorControls(rowSeven, "Edge Halo Color", DEFAULTS.EDGE.COLOR,
      DEFAULTS.STYLES.EDGE_COLORS);
    appendVerticalRule(rowSeven, "Width", "Define the halo width for the selected edges.");
    createNumericalSlider(rowSeven, "Edge Halo Width", DEFAULTS.EDGE.HALO.WIDTH,
      {min: 1, max: 30, step: 1}, "Define the halo width for the selected edges.");
  }

  createSelectCard();
  createArrangeNodesCard();
  createNodeConfigCard();
  createEdgeConfigCard();

  return root;
}

function updateEdges(overrides = {}, commands = []) {
  for (const edgeID of cache.selectedEdges) {
    const edge = cache.edgeRef.get(edgeID);

    for (const command of commands) {
      if (command === "label_set_to_id") {
        edge.style.label = true;
        edge.style.labelText = edge.id;
      }
    }

    // apply overrides
    deepMerge(edge, overrides);
    cache.edgeRef.set(edgeID, edge);
  }

  handleStyleChangeLoadingEvent("Style", "Updating Edge Styles");
}

/**
 * Recursively merges properties from `source` into `target`.
 * - Existing properties in `target` remain if not in `source`.
 * - Matching keys in `source` overwrite `target`.
 * - New keys are added to `target`.
 */
function deepMerge(target, source) {
  if (!isObject(target) || !isObject(source)) return;

  for (const [key, value] of Object.entries(source)) {
    // If both target and value are objects, recurse into them
    if (isObject(value) && isObject(target[key])) {
      deepMerge(target[key], value);
    } else {
      // Otherwise, just overwrite
      target[key] = value;
    }
  }
}

function isObject(obj) {
  return obj !== null && typeof obj === "object" && !Array.isArray(obj);
}

function updateNodes(overrides = {}, commands = []) {
  for (const nodeID of cache.selectedNodes) {
    const node = cache.nodeRef.get(nodeID);

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
        node.style.badges = [...node.style.badges, ...overrides.style.badges];
        node.style.badgePalette = [...node.style.badgePalette, ...overrides.style.badgePalette];
        delete overrides.style?.badges;
        delete overrides.style?.badgePalette;
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
    deepMerge(node, overrides);
    cache.nodeRef.set(nodeID, node);
  }
  handleStyleChangeLoadingEvent("Style", `Updating Node Styles`);
}

function toggleStyleElementsThatRequireAtLeastOneSelectedNode(enable) {
  toggleStyleElements([
    "Node Configuration", "Expand Edges", "Reduce Edges", "Expand Neighbors", "Reduce Neighbors"
  ], enable);
}

function toggleStyleElementsThatRequireAtLeastOneSelectedEdge(enable) {
  toggleStyleElements(["Edge Configuration"], enable);
}

function toggleStyleElementsThatRequireAtLeastOneSelectedNodeOrEdge(enable) {
  toggleStyleElements([], enable);
}

function toggleStyleElementsThatRequireAtLeastOneVisibleNode(enable) {
  toggleStyleElements(["Select by Node ID(s)", "selectByNodeIDsInput"], enable);
}

function toggleStyleElementsThatRequireAtLeastOneVisibleEdge(enable) {
  toggleStyleElements(["Select by Edge ID(s)", "selectByEdgeIDsInput"], enable);
}

function toggleStyleElementsThatRequireAtLeastOneVisibleNodeOrEdge(enable) {
  toggleStyleElements(["Select Elements"], enable);
}

function toggleStyleElementsThatRequireMoreThanOneSelectedNode(enable) {
  toggleStyleElements(["Arrange Selection"], enable);
}

function toggleStyleElements(headingLabels, enable) {
  for (let elemID of headingLabels) {
    const elem = document.getElementById(elemID);
    if (elem) {
      enable ? elem.classList.remove("is-disabled") : elem.classList.add("is-disabled");
    } else {
      debug("Element not found: " + elemID);
    }
  }
}

function updateSelectedState(elemData, enable) {
  for (const item of elemData) {
    if (!item.states) {
      item.states = [];
    }

    if (enable) {
      if (!item.states.includes("selected")) {
        item.states.push("selected");
      }
    } else {
      const index = item.states.indexOf("selected");
      if (index > -1) {
        item.states.splice(index, 1);
      }
    }
  }
}

function updateSelectionLoadingAndRenderEvent(header = "Selection", text = "Updating Selection", propID = null) {
  handleFilterEvent(header, text, propID);
}

function toggleSelectionForAllNodes(enable) {
  const nodes = graph.getNodeData();
  updateSelectedState(nodes, enable);
  graph.updateNodeData(nodes);
  updateSelectionLoadingAndRenderEvent();
}

function toggleSelectionForAllEdges(enable) {
  const edges = graph.getEdgeData();
  updateSelectedState(edges, enable);
  graph.updateEdgeData(edges);
  updateSelectionLoadingAndRenderEvent();
}

function syncSelectionCacheAndElementStates() {
  const nodesToShow = [];
  const nodesToHide = [];
  const edgesToShow = [];
  const edgesToHide = [];

  const snapshot = cache.selectionMemory[cache.selectedMemoryIndex];

  cache.selectedNodes = snapshot.nodes;
  cache.selectedEdges = snapshot.edges;

  for (const node of graph.getNodeData()) {
    snapshot.nodes.includes(node.id) ? nodesToShow.push(node) : nodesToHide.push(node);
  }
  for (const edge of graph.getEdgeData()) {
    snapshot.edges.includes(edge.id) ? edgesToShow.push(edge) : edgesToHide.push(edge);
  }
  updateSelectedState(nodesToShow, true);
  updateSelectedState(nodesToHide, false);
  updateSelectedState(edgesToShow, true);
  updateSelectedState(edgesToHide, false);

  updateSelectionLoadingAndRenderEvent();
}

function undoSelection() {
  if (cache.selectedMemoryIndex > 0) {
    cache.selectedMemoryIndex--;
    syncSelectionCacheAndElementStates();
  } else {
    warning("Cannot undo!");
  }
}

function redoSelection() {
  if (cache.selectionMemory.length > cache.selectedMemoryIndex + 1) {
    cache.selectedMemoryIndex++;
    syncSelectionCacheAndElementStates();
  } else {
    warning("Cannot redo!");
  }
}

function addNodeOrEdgeIDsToSelection(elementIDs, isNode) {
  if (!elementIDs) return;

  const elemDescription = isNode ? "Node" : "Edge";
  const idArray = elementIDs.split(",");

  const visibleElements = isNode ? cache.nodeIDsToBeShown : cache.edgeIDsToBeShown;
  const existingElements = isNode ? cache.nodeRef.keys().toArray() : cache.edgeRef.keys().toArray();
  const selectedElements = isNode ? cache.selectedNodes : cache.selectedEdges;
  const ref = isNode ? cache.nodeRef : cache.edgeRef;

  for (const elemID of idArray) {
    if (!existingElements.includes(elemID)) {
      error(`${elemDescription} with ID: '${elemID}' does not exist!`);
      continue;
    }

    if (!visibleElements.has(elemID)) {
      warning(`Cannot select ${elemDescription} with ID: '${elemID}' as it is not visible.`);
      continue;
    }

    const elementsToUpdate = [];
    if (!selectedElements.includes(elemID)) {
      elementsToUpdate.push(ref.get(elemID));
    }

    if (elementsToUpdate.length > 0) {
      updateSelectedState(elementsToUpdate, true);
      updateSelectionLoadingAndRenderEvent();
    }
  }
}

function toggleSelectionByNeighbors(mode) {
  const edgesToShow = [];
  const edgesToHide = [];
  const nodesToShow = [];
  const nodesToHide = [];

  function isOuterNodeInSelection(nodeID) {
    let neighborsInSelection = 0;

    for (const edgeID of cache.nodeIDToEdgeIDs.get(nodeID) || []) {
      const edge = cache.edgeRef.get(edgeID);
      if (!edge) continue;

      const neighbor = edge.source === nodeID ? edge.target : edge.source;

      if (cache.selectedNodes.includes(neighbor)) {
        neighborsInSelection++;
        if (neighborsInSelection > 1) {
          return false;
        }
      }
    }

    return neighborsInSelection <= 1;
  }

  function update() {
    if (edgesToShow.length > 0) updateSelectedState(edgesToShow, true);
    if (edgesToHide.length > 0) updateSelectedState(edgesToHide, false);
    if (nodesToShow.length > 0) updateSelectedState(nodesToShow, true);
    if (nodesToHide.length > 0) updateSelectedState(nodesToHide, false);

    const edgesChanged = edgesToShow.length > 0 || edgesToHide.length > 0;
    const nodesChanged = nodesToShow.length > 0 || nodesToHide.length > 0;
    const graphChanged = edgesChanged || nodesChanged;

    if (edgesChanged) graph.updateEdgeData([...edgesToShow, ...edgesToHide]);
    if (nodesChanged) graph.updateNodeData([...nodesToShow, ...nodesToHide]);

    if (graphChanged) {
      updateSelectionLoadingAndRenderEvent();
    }
  }

  switch (mode) {

    case "expand-edges":
      for (let nodeID of cache.selectedNodes) {
        for (let edgeID of cache.nodeIDToEdgeIDs.get(nodeID) || []) {
          edgesToShow.push(cache.edgeRef.get(edgeID));
        }
      }
      break;

    case "reduce-edges":
      for (let edgeID of cache.selectedEdges) {
        const edge = cache.edgeRef.get(edgeID);
        const connectingNodesAreSelected = cache.selectedNodes.includes(edge.source)
          && cache.selectedNodes.includes(edge.target);
        connectingNodesAreSelected ? edgesToShow.push(edge) : edgesToHide.push(edge);
      }
      break;

    case "expand-neighbors":
      for (let nodeID of cache.selectedNodes) {
        for (let edgeID of cache.nodeIDToEdgeIDs.get(nodeID) || []) {
          const edge = cache.edgeRef.get(edgeID);
          edgesToShow.push(edge);

          nodesToShow.push(cache.nodeRef.get(edge.source));
          nodesToShow.push(cache.nodeRef.get(edge.target));
        }
      }
      break;

    case "reduce-neighbors":
      for (const nodeID of cache.selectedNodes.filter(isOuterNodeInSelection)) {
        nodesToHide.push(cache.nodeRef.get(nodeID));

        for (const edgeID of cache.nodeIDToEdgeIDs.get(nodeID) || []) {
          edgesToHide.push(cache.edgeRef.get(edgeID));
        }
      }
      break;

    // case "only-outer-layer":
    //   console.log("Select only the next outer layer of connected nodes from the currently selected nodes");
    //   break;
    //
    // case "only-inner-layer":
    //   console.log("Select only the inner layer (excluding outermost nodes) of the currently selected nodes");
    //   break;

    default:
      break;
  }

  update();
}

function persistPositionsUpdateDataAndReDrawGraph() {
  // the timeout is necessary since otherwise, when calling this directly after rendering, the layout is not fully
  // finished and the recorded nodes are misplaced slightly
  setTimeout(() => {
    let ld = data.layouts[data.selectedLayout];
    if (!ld.isCustom && ld.positions.size === 0) {
      console.log(`Initially persisting coordinates of default layout ${data.selectedLayout} ..`);
      persistNodePositions();
    }

    // cache is written on app start or layout change every time IF no data exists yet, no matter if it is a custom layout or not
    if (!cache.initialNodePositions.has(data.selectedLayout)) {
      cache.initialNodePositions.set(data.selectedLayout, new Map());
      console.log(`Caching coordinates of layout ${data.selectedLayout} to be used by reset feature ..`);
      persistNodePositions(cache.initialNodePositions.get(data.selectedLayout));
    }
  }, 100);
}

function persistNodePositions(targetMap = data.layouts[data.selectedLayout].positions) {
  for (const node of graph.getNodeData()) {
    targetMap.set(node.id, {x: node.style.x, y: node.style.y});
  }
}

function* traverseD4Data(nodeOrEdge) {
  if (!nodeOrEdge.D4Data) return;

  for (let section in nodeOrEdge.D4Data) {
    for (let subsection in nodeOrEdge.D4Data[section]) {
      for (let prop in nodeOrEdge.D4Data[section][subsection]) {
        yield [section, subsection, prop, nodeOrEdge.D4Data[section][subsection][prop]];
      }
    }
  }
}

function generatePropHashId(section, subSection, prop) {
  return `${section}::${subSection}::${prop}`;
}

function decodePropHashId(propId) {
  return propId.split("::");
}

function loadFile(event) {
  const file = event.target.files[0];
  if (!file) {
    alert("No file selected.");
    return Promise.resolve(null);
  }

  const fileType = file.name.split(".").pop().toLowerCase();

  try {
    switch (fileType) {
      case 'json':
        return parseJSON(file);

      case 'xls':
      case 'xlsx':
      case 'ods':
        return file.arrayBuffer().then((buffer) => {
          return parseExcelToJson(buffer);
        }).catch((error) => {
          alert(`Error reading Excel file: ${error.message}`);
          return null;
        });


      default:
        alert(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    alert(`Failed to load file: ${error.message}`);
  }

  // Reset the file input for subsequent uploads
  event.target.value = '';
}

function parseJSON(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const jsonContent = JSON.parse(reader.result);
        if (!jsonContent.edges || !jsonContent.nodes) {
          alert("File does not contain edges or nodes.");
          resolve(null);
        } else {
          resolve(jsonContent);
        }
      } catch (error) {
        alert(`Failed to parse file as JSON: ${error}`);
        resolve(null);
      }
    };
    reader.onerror = () => {
      alert(`Failed to load file: ${reader.error}`);
      resolve(null);
    };
    reader.readAsText(file);
  });

}

/**
 * Parses an Excel file into the required JSON structure.
 *
 * @param {File} file - The Excel file to be parsed.
 * @returns {Object} - Parsed JSON structure compatible with the existing system.
 */
function parseExcelToJson(file) {
  const workbook = XLSX.read(file, {type: 'array'});

  const nodesSheet = workbook.Sheets['nodes'];
  const edgesSheet = workbook.Sheets['edges'];
  const debugSheet = workbook.Sheets["debug"];

  if (!nodesSheet || !edgesSheet) {
    error('The Excel file must contain a "nodes" and "edges" sheet.');
    return;
  }

  function getOrNull(row, key) {
    const lowerCaseKey = key.toString().toLowerCase().trim();
    const value = row[Object.keys(row).find(key => key.toLowerCase() === lowerCaseKey)];
    if (value && value.toString().trim() !== "") {
      return value;
    }
    return null;
  }

  function validateColumns(requiredColumns, firstRowKeys, sheetName) {
    for (const column of requiredColumns) {
      if (!firstRowKeys.includes(column)) {
        const origColumn = firstRowKeys.filter(k => k.toLowerCase().trim() === column)[0];
        error(`The "${sheetName}" sheet must contain an "${origColumn}" column.`);
        return;
      }
    }
  }

  const nodesData = XLSX.utils.sheet_to_json(nodesSheet, {defval: null});
  const edgesData = XLSX.utils.sheet_to_json(edgesSheet, {defval: null});

  if (nodesData.length === 0) {
    error('The "nodes" sheet is empty or invalid.');
    return;
  }

  if (edgesData.length === 0) {
    error('The "edges" sheet is empty or invalid.');
    return;
  }

  const firstNodeRowKeys = Object.keys(nodesData[0])
    .map(k => k.toLowerCase().trim());
  const requiredNodeColumns = EXCEL_NODE_PROPERTIES
    .filter(node => node.required)
    .map(node => node.column.toLowerCase().trim());
  validateColumns(requiredNodeColumns, firstNodeRowKeys, 'nodes');

  const firstEdgeRowKeys = Object.keys(edgesData[0])
    .map(k => k.toLowerCase().trim());
  const requiredEdgeColumns = EXCEL_EDGE_PROPERTIES
    .filter(edge => edge.required)
    .map(edge => edge.column.toLowerCase().trim());
  validateColumns(requiredEdgeColumns, firstEdgeRowKeys, 'edges');

  const nonDataNodeColumns = new Set(EXCEL_NODE_PROPERTIES.map((p) => p.column.toLowerCase().trim()));
  const nodeDataHeaders = Object.keys(nodesData[0])
    .filter(k => !nonDataNodeColumns.has(k.toLowerCase().trim()) && !k.startsWith("__EMPTY"))
    .map((k) => decodeKey(k));
  const nonDataEdgeColumns = new Set(EXCEL_EDGE_PROPERTIES.map((p) => p.column.toLowerCase().trim()));
  const edgeDataHeaders = Object.keys(edgesData[0])
    .filter(k => !nonDataEdgeColumns.has(k.toLowerCase().trim()) && !k.startsWith("__EMPTY"))
    .map((k) => decodeKey(k));

  function addNodeOrEdgeStyle(nodeOrEdge, row, propertyMap, descriptor) {
    nodeOrEdge.style = {};

    propertyMap.forEach(({column, type, required, apply}) => {
      if (required) return;

      const rowNum = row.__rowNum__ + 1;

      if (!type) {
        warning(`Unsure how to validate ${descriptor} property ${column} in row ${rowNum}. 
        Missing definition in EXCEL_NODE_PROPERTIES or EXCEL_EDGE_PROPERTIES?`);
        return;
      }

      const maybeValue = getOrNull(row, column);
      if (maybeValue) {
        let validated = false;
        let listValues = null;
        if (type.startsWith("oneOf:")) {
          listValues = type.split(":")[1].split("|");
          type = "list";
        }
        switch (type) {
          case "str":
            validated = true;
            break;
          case "num":
            validated = isNumber(maybeValue);
            break;
          case "bool":
            validated = isBoolean(maybeValue);
            break;
          case "rgba":
            validated = isHexColor(maybeValue);
            break;
          case "list":
            validated = isInList(maybeValue, listValues);
            break;
          default:
            break;
        }
        if (!validated) {
          error(`${descriptor} property '${column}' in row ${rowNum} has an invalid value '${maybeValue}' and will be ignored (value must be of type '${type}').`);
        } else {
          apply(nodeOrEdge, maybeValue);
        }
      }
    });
  }

  function decodeKey(key) {
    let subGroup = EXCEL_UNCATEGORIZED_SUBHEADER;
    if (key.indexOf("[") > -1 && key.indexOf("]") > -1) {
      subGroup = key.substring(key.indexOf("[") + 1, key.indexOf("]")).trim();
    }
    const trimmedKey = key.split("[")[0].trim();
    return {"subGroup": subGroup, "key": trimmedKey};
  }

  function validateUserData(row, key) {
    const val = row[key];

    if (val === null || val.toString().trim() === "") {
      return null;
    }

    return {"value": val, ...decodeKey(key)};
  }

  function addNodeOrEdgeUserData(nodeOrEdge, row, propertyMap, header, descriptor) {
    nodeOrEdge.D4Data = {
      [header]: {},
    };

    let propsAdded = 0;
    const reservedProperties = propertyMap.map(p => p.column.toLowerCase().trim());

    for (let key in row) {
      if (reservedProperties.includes(key.toLowerCase())) continue;

      const userData = validateUserData(row, key);

      if (!userData) continue;

      if (!nodeOrEdge.D4Data[header].hasOwnProperty(userData.subGroup)) {
        nodeOrEdge.D4Data[header][userData.subGroup] = {};
      }

      nodeOrEdge.D4Data[header][userData.subGroup][userData.key] = userData.value;
      propsAdded++;
    }

    if (propsAdded === 0) {
      warning(`${descriptor} in row ${row.__rowNum__} (${nodeOrEdge.id}) has no properties. 
      Added property 'exists' to enable display.`);
      nodeOrEdge.D4Data[header][EXCEL_UNCATEGORIZED_SUBHEADER] = {
        "exists": true
      }
    }
  }

  const nodeIDs = new Set();

  const parsedNodes = nodesData.map(row => {
    const node = {};
    const nodeRowNum = row.__rowNum__ + 1;
    const descriptor = "Node";

    const nodeID = getOrNull(row, "ID");
    if (!nodeID) {
      warning(`Node in row ${nodeRowNum} does not contain an ID and will be skipped.`);
      return null;
    }

    if (nodeIDs.has(nodeID)) {
      warning(`Node in row ${nodeRowNum} (ID ${nodeID}) already exists and will be skipped.`);
      return null;
    }

    node.id = nodeID;
    nodeIDs.add(nodeID);

    addNodeOrEdgeStyle(node, row, EXCEL_NODE_PROPERTIES, descriptor);
    addNodeOrEdgeUserData(node, row, EXCEL_NODE_PROPERTIES, EXCEL_NODE_HEADER, descriptor);

    return node;
  }).filter(node => node !== null);

  const parsedEdges = edgesData.map(row => {
    const edge = {};
    const edgeRowNum = row.__rowNum__ + 1;
    const descriptor = "Edge";

    const sourceID = getOrNull(row, "Source ID");
    if (!sourceID) {
      warning(`Edge in row ${edgeRowNum} does not contain a Source ID and will be skipped.`);
      return null;
    }

    if (!nodeIDs.has(sourceID)) {
      warning(`Edge in row ${edgeRowNum} has an invalid/missing Source ID (${sourceID}) and will be skipped.`);
      return null;
    }

    const targetID = getOrNull(row, "Target ID");
    if (!targetID) {
      warning(`Edge in row ${edgeRowNum} does not contain a Target ID and will be skipped.`)
      return null;
    }

    if (!nodeIDs.has(targetID)) {
      warning(`Edge in row ${edgeRowNum} has an invalid/missing Target ID (${targetID}) and will be skipped.`);
      return null;
    }

    edge.id = `${sourceID}::${targetID}`;
    edge.source = sourceID;
    edge.target = targetID;

    addNodeOrEdgeStyle(edge, row, EXCEL_EDGE_PROPERTIES, descriptor);
    addNodeOrEdgeUserData(edge, row, EXCEL_EDGE_PROPERTIES, EXCEL_EDGE_HEADER, descriptor);

    return edge;
  }).filter(edge => edge !== null);

  if (debugSheet) {
    const debugJson = XLSX.utils.sheet_to_json(debugSheet, {defval: null});

    const header = Object.keys(debugJson[0]);
    const expectedHeader = ["Query", "Valid Node IDs", "Valid Edge IDs"];
    if (!arraysAreEqual(header, expectedHeader)) {
      warning(`The 'debug' sheet must contain three columns: ${expectedHeader} (comma-separated IDs).`);
      return;
    }

    const debugDiv = document.getElementById("debugDiv");

    debugJson.map(row => {
      const btn = document.createElement("button");
      btn.onclick = () => debugQuery(row["Query"]);
      btn.title = `Valid Node IDs: ${row["Valid Node IDs"]} | Valid Edge IDs: ${row["Valid Edge IDs"]}`;
      btn.textContent = `${row.__rowNum__}`;
      btn.className = "small-btn red";
      debugDiv.appendChild(btn);
    })
  }

  return {
    nodes: parsedNodes,
    edges: parsedEdges,
    nodeDataHeaders: nodeDataHeaders,
    edgeDataHeaders: edgeDataHeaders,
  };
}

function createGraphInstance() {
  if (graph === null) {

    const behaviors = [
      {type: 'drag-canvas', key: 'drag-canvas',},
      {type: 'zoom-canvas', key: 'zoom-canvas',},
      {type: 'drag-element', cursor: {default: 'default', grab: 'default', grabbing: 'default'},},
    ];

    if (cache.showNodeLabelsAndHoverEffect) {
      behaviors.push(
        {
          type: 'hover-activate',
          enable: (event) => {
            return event.targetType === 'node' || event.targetType === 'edge';
          },
          degree: 1,
          state: 'highlight',
          inactiveState: 'dim',
        }
      );
    }

    const plugins = [
      {
        key: "tooltip",
        type: "tooltip",
        trigger: "click",
        enterable: true,
        getContent: (e, items) => cache.toolTips.get(items[0].id),
      },
      {
        key: "minimap",
        type: "minimap",
        position: "bottom-left",
      },
      ...[...traverseBubbleSets()].map(group => ({
        key: `bubbleSetPlugin-${group}`,
        type: "bubble-sets",
        members: [],
        avoidMembers: [...cache.nodeRef.keys()],
        ...DEFAULTS.BUBBLE_SET_STYLE[group],
        strokeOpacity: 0,  // hide bubble groups initially (1 node persists due to bug)
        fillOpacity: 0,
      })),
    ];

    graph = new Graph({
      container: 'innerGraphContainer',
      autoFit: false,  // 'view'
      animation: false,
      autoResize: true,
      padding: 10,
      data: createSimplifiedDataForGraphObject(),
      node: {
        state: {
          highlight: {
            fill: '#C33D35', halo: true, lineWidth: 0,
          }, dim: {
            fill: '#E4E3EA',
          },
        },
      },
      edge: {
        state: {
          highlight: {
            stroke: '#C33D35',
          },
          selected: {
            stroke: '#C33D35',
          }
        },
      },
      behaviors: behaviors,
      plugins: plugins,
    });

    graph.on(NodeEvent.DRAG_END, (event) => {
      // persist all node positions
      persistNodePositions();
    });

    graph.on(GraphEvent.AFTER_DRAW, (ev) => {
      // TODO: fired quite often.. better alternative?
      updateSelectedNodesAndEdges();
    });

    graph.on(GraphEvent.BEFORE_RENDER, () => {
      preRenderEvent();
    });

    graph.on(GraphEvent.AFTER_RENDER, () => {
      showLoading("Preparing View", "Restoring Positions and Groups");
      afterRenderEvent();
      updateNodeConnectivityMetrics();
      // TODO: Without this update and redraw after 200ms, positions are not restored
      restorePositions();
      // refreshUI();
      updateQueryTextArea();
    });

    let layout = data.layouts[data.selectedLayout];
    if (!layout.isCustom) {
      graph.setLayout({type: data.selectedLayout, ...layout.internals});
    }
  }
}

function arraysAreEqual(a, b) {
  if (a === b) return true;       // Same reference
  if (!a || !b) return false;     // One is undefined/null
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

let changeCounter = 0;

function updateSelectionCache() {
  const {selectedNodes, selectedEdges, selectionMemory, selectedMemoryIndex} = cache;

  // this should never be triggered; in case no snapshot is available, create an empty one
  if (selectionMemory.length === 0) {
    selectionMemory.push({nodes: [], edges: []});
    cache.selectedMemoryIndex = 0;
  }

  const currentSnapshot = selectionMemory[selectedMemoryIndex];

  const nodesChanged = !arraysAreEqual(currentSnapshot.nodes, selectedNodes);
  const edgesChanged = !arraysAreEqual(currentSnapshot.edges, selectedEdges);

  if (nodesChanged || edgesChanged) {
    changeCounter++;

    // In case the user goes back in memory & then changes the selection, clear all memories after the current selection
    if (selectedMemoryIndex < selectionMemory.length - 1) {
      selectionMemory.splice(selectedMemoryIndex + 1);
    }

    // if the memory limit is reached, clear the first entry
    if (selectionMemory.length === MAX_SELECTION_MEMORY) {
      selectionMemory.shift();
      cache.selectedMemoryIndex = selectionMemory.length - 1;
    }

    // push new memory, increment index
    selectionMemory.push({
      nodes: [...selectedNodes],
      edges: [...selectedEdges],
    });

    cache.selectedMemoryIndex = selectionMemory.length - 1;
  }
}

function updateEnabledStateUndoRedoSelectionButtons() {
  const {selectionMemory, selectedMemoryIndex} = cache;
  const canUndo = (selectedMemoryIndex > 0);
  const canRedo = (selectedMemoryIndex < selectionMemory.length - 1);

  const undoButton = document.getElementById("undoSelectionBtn");
  const redoButton = document.getElementById("redoSelectionButton");

  canUndo ? undoButton.classList.remove("disabled") : undoButton.classList.add("disabled");
  canRedo ? redoButton.classList.remove("disabled") : redoButton.classList.add("disabled");
}

function updateSelectedNodesAndEdges() {
  cache.selectedNodes = graph.getNodeData()
    .filter((n) => n.states?.includes("selected") && cache.nodeIDsToBeShown.has(n.id))
    .map((n) => n.id);
  cache.selectedEdges = graph.getEdgeData()
    .filter((e) => e.states?.includes("selected") && cache.edgeIDsToBeShown.has(e.id))
    .map((e) => e.id);

  const selectedNodesCount = cache.selectedNodes?.length || 0;
  const selectedEdgesCount = cache.selectedEdges?.length || 0;

  document.getElementById("selectedNodes").textContent = `${selectedNodesCount}`;
  document.getElementById("selectedEdges").textContent = `${selectedEdgesCount}`;

  const atLeastOneNodeSelected = selectedNodesCount > 0;
  const atLeastOneEdgeSelected = selectedEdgesCount > 0;
  const atLeastOneNodeOrEdgeSelected = atLeastOneNodeSelected || atLeastOneEdgeSelected;
  const moreThanOneNodeSelected = selectedNodesCount > 1;

  document.getElementById("selectedNodes").style.display = atLeastOneNodeSelected ? "block" : "none";

  toggleStyleElementsThatRequireAtLeastOneSelectedNode(atLeastOneNodeSelected);
  toggleStyleElementsThatRequireAtLeastOneSelectedEdge(atLeastOneEdgeSelected);
  toggleStyleElementsThatRequireAtLeastOneSelectedNodeOrEdge(atLeastOneNodeOrEdgeSelected);
  toggleStyleElementsThatRequireMoreThanOneSelectedNode(moreThanOneNodeSelected);

  updateSelectionCache();
  updateEnabledStateUndoRedoSelectionButtons();
}

function toggleEditMode(ev) {
  let editModeActive = ev.classList.contains("active");
  editModeActive ? ev.classList.remove("active") : ev.classList.add("active");

  const nonEditBehaviors = [
    {type: 'drag-canvas', key: 'drag-canvas'},
    {type: 'drag-element', cursor: {default: 'default', grab: 'default', grabbing: 'default'}},
  ];

  if (cache.showNodeLabelsAndHoverEffect) {
    nonEditBehaviors.push({
      type: 'hover-activate', degree: 1, state: 'highlight', inactiveState: 'dim',
      enable: (event) => {
        // console.log(event.targetType);
        return event.targetType === 'node' || event.targetType === 'edge';
      },
    });
  }

  const editBehaviors = [
    {type: "lasso-select", key: "lasso-select", trigger: "drag"},
    {type: "click-select", key: "click-select", multiple: true, trigger: ["shift"]},
  ];

  // reduce behaviors to clean up existing edit/non-edit behaviors
  let behaviors = graph.getBehaviors()
    .filter(b => ![...nonEditBehaviors.map(b => b.type), ...editBehaviors.map(b => b.type)].includes(b.type));

  // re-add behaviors for current mode
  graph.setBehaviors([...behaviors, ...editModeActive ? nonEditBehaviors : editBehaviors]);

  // control tooltip plugin
  graph.updatePlugin({key: 'tooltip', enable: editModeActive});

  handleEditModeUIChanges();
}

function handleEditModeUIChanges() {
  const editModeActive = document.getElementById("editBtn").classList.contains("active");

  const mainContent = document.getElementById("mainContent");
  const container = document.getElementById("sidebarContentContainer");
  const sidebar = document.getElementById("sidebar");
  const status = document.getElementById("sidebarStatusContainer");
  const bottomBar = document.getElementById("bottomBar");

  container.style.paddingRight = editModeActive ? "6px" : "0";

  mainContent.style.height = editModeActive ? "90%" : "100%";
  bottomBar.style.height = editModeActive ? "10%" : "0";
  bottomBar.classList.toggle("active", editModeActive);

  // handle all edit elements
  const editElements = document.querySelectorAll('.show-on-edit');
  editElements.forEach(el => {
    editModeActive ? el.classList.add("show") : el.classList.remove("show");
    el.style.height = editModeActive ? `${el.scrollHeight}px` : "0";
  });

  // 'collapse' all open style rows
  if (!editModeActive) {
    const styleRows = document.querySelectorAll('.style-row');
    styleRows.forEach(row => {
      row.classList.remove("show");
    });
  }

  // handle filter row column widths
  const filterRows = document.querySelectorAll('.filter-row');
  filterRows.forEach(row => {
    const checkboxCol = row.children[0];
    checkboxCol.style.width = editModeActive ? "45%" : "56%";

    const sliderCol = row.querySelector(".filter-row-col2");
    sliderCol.style.width = editModeActive ? "65%" : "33%";
    sliderCol.style.display = editModeActive ? "flex" : "";
    sliderCol.style.alignItems = editModeActive ? "center" : "";

    if (sliderCol.children[2]?.id.endsWith("slider")) {
      const sliderElem = sliderCol.children[2];
      if (sliderElem) sliderElem.style.width = editModeActive ? "200%" : "";
    } else if (sliderCol.children[0]?.id.endsWith("dropdown")) {
      const dropdownElem = sliderCol.children[0];
      if (dropdownElem) {
        dropdownElem.style.width = editModeActive ? "96.5%" : "";
        dropdownElem.children[0].style.width = editModeActive ? "100%" : "90%";
        dropdownElem.children[0].style.margin = editModeActive ? "0" : "0 0 0 4px";
      }
    }
  });

  sidebar.style.minWidth = editModeActive ? "600px" : "360px";
  status.style.maxWidth = editModeActive ? "600px" : "360px";

  // if (didShowAnyStatusMessage) {
  //   status.style.height = "8%;"
  // }
}

function* traverseBubbleSets() {
  for (let group of Object.keys(DEFAULTS.BUBBLE_SET_STYLE)) {
    yield group;
  }
}

function updateBubbleSet(group, members) {
  console.log(`Updating bubble set ${group} ..`);
  const plugin = graph.getPluginInstance("bubbleSetPlugin-" + group);
  let empty = !members || members.size === 0;
  const membersAsArray = [...members];
  plugin.update({
    members: empty ? [] : membersAsArray,
    avoidMembers: empty ?
      [] : AVOID_NON_BUBBLE_GROUP_MEMBERS ?
        [...cache.nodeRef.keys()].filter(nodeID => !membersAsArray.includes(nodeID)) : [],
    fillOpacity: empty ? 0 : DEFAULTS.BUBBLE_SET_STYLE[group].fillOpacity,
    strokeOpacity: empty ? 0 : DEFAULTS.BUBBLE_SET_STYLE[group].strokeOpacity,
  });
  // graph.draw();
  // plugin.drawBubbleSets();
}

function setsAreEqual(setA, setB) {
  if (setA.size !== setB.size) return false;
  for (let item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
}

function setsIntersect(activeSet, totalSet) {
  if (!(totalSet instanceof Set)) {
    return false;
  }

  for (let item of activeSet) {
    if (totalSet.has(item)) {
      return true;
    }
  }
  return false;
}

function createSimplifiedDataForGraphObject(resetToCachedPositions = false) {
  const filterObject = (obj, excludedKeys) => {
    return Object.keys(obj)
      .filter(key => !excludedKeys.includes(key)) // Exclude specified keys
      .reduce((newObj, key) => {
        newObj[key] = obj[key];
        return newObj;
      }, {});
  };

  // Process nodes and exclude their unwanted properties
  const filteredNodes = data.nodes
    .map(node => {
      const filteredNode = filterObject(node, ["D4Data", "features", "featureValues", "featureWithinThreshold"]);

      // load positions from the layouts position Map
      const position = data.layouts[data.selectedLayout]?.positions.get(node.id);

      Object.assign(filteredNode, getNodeStyleOrDefaults(node));

      if (position) {
        filteredNode.style.x = position.x;
        filteredNode.style.y = position.y;
      }

      if (resetToCachedPositions) {
        filteredNode.style.x = cache.initialNodePositions.get(data.selectedLayout).get(node.id).x;
        filteredNode.style.y = cache.initialNodePositions.get(data.selectedLayout).get(node.id).y;
      }

      return filteredNode;
    });

  // Process edges if provided, and exclude unwanted properties
  const filteredEdges = data.edges
    .map(edge => {
      const filteredEdge = filterObject(edge, ["D4Data", "features", "featureValues", "featureWithinThreshold"]);

      Object.assign(filteredEdge, getEdgeStyleOrDefaults(edge));

      return filteredEdge;
    });

  return {
    nodes: filteredNodes, edges: filteredEdges, combos: data.combos || [],
  };
}

function preRenderEventLegacy() {
  /**
   * Determines the visibility of nodes and edges based on active properties and filter thresholds.
   * Updates the visibility cache and adjusts the graph visuals by hiding or showing nodes and edges.
   * Supports both "OR" and "AND" filtering strategies
   * "AND" filtering strategy:
   *   - The node fulfills the node-related conditions **AND**
   *   - The edge fulfills the edge-related conditions **AND**
   *   - The edge connects nodes that are not filtered out by the node filters.
   * "OR" filtering strategy:
   *   - Any element fulfills at least one condition
   */
  cache.nodeIDsToBeShown = new Set();
  cache.propIDsToNodeIDsToBeShown = new Map();  // this is used by the bubble-grouping functionality after rendering
  cache.edgeIDsToBeShown = new Set();
  cache.propIDsToEdgeIDsToBeShown = new Map();
  cache.remainingEdgeRelatedNodes = new Set();
  resetFeatureIsWithinThresholdMaps();

  for (let propID of cache.activeProps) {
    let fd = data.layouts[data.selectedLayout].filters.get(propID);
    cache.propIDsToNodeIDsToBeShown.set(propID, new Set());

    for (let node of cache.propToNodes.get(propID) || []) {
      if (isWithinThreshold(fd, node.featureValues.get(propID))) {
        // this node has an active property and is within the defined thresholds, so we can consider showing it
        cache.nodeIDsToBeShown.add(node.id);
        cache.propIDsToNodeIDsToBeShown.get(propID).add(node.id);
        node.featureIsWithinThreshold.set(propID, true);
      } else {
        node.featureIsWithinThreshold.set(propID, false);
      }
    }
  }

  // we need two iterations over all activated props, otherwise we might miss node ids to be shown
  for (let propID of cache.activeProps) {
    let fd = data.layouts[data.selectedLayout].filters.get(propID);
    cache.propIDsToEdgeIDsToBeShown.set(propID, new Set());

    for (let edge of cache.propToEdges.get(propID) || []) {
      if (isWithinThreshold(fd, edge.featureValues.get(propID)) && allRelatedNodesAreVisible(edge.id)) {
        // this edge has an active property, is within the defined thresholds, and all of its related nodes are visible,
        // so we can also consider to show the edge itself
        cache.edgeIDsToBeShown.add(edge.id);
        cache.propIDsToEdgeIDsToBeShown.get(propID).add(edge.id);
        edge.featureIsWithinThreshold.set(propID, true);
      } else {
        edge.featureIsWithinThreshold.set(propID, false);
      }
    }
  }

  // in the "OR" filtering logic, we already have all to be considered nodes (at least one property is within threshold)
  if (data.layouts[data.selectedLayout].filterStrategy === "AND") {
    performANDFilterLogic();
  }

  const nodeIDsToBeHidden = [...cache.nodeRef.keys()].filter(nodeID => !cache.nodeIDsToBeShown.has(nodeID));
  const edgeIDsToBeHidden = [...cache.edgeRef.keys()].filter(edgeID => !cache.edgeIDsToBeShown.has(edgeID));

  const idsToShow = [
    ...cache.nodeIDsToBeShown,
    ...cache.edgeIDsToBeShown
  ];

  const idsToHide = [
    ...nodeIDsToBeHidden,
    ...edgeIDsToBeHidden,
    ...cache.hiddenDanglingNodeIDs,
    ...cache.hiddenDanglingEdgeIDs
  ];

  graph.showElement(idsToShow).then(r => console.log(`${cache.nodeIDsToBeShown.size} nodes and ${cache.edgeIDsToBeShown.size} edges shown`));
  graph.hideElement(idsToHide).then(r => console.log(`${nodeIDsToBeHidden.length} nodes and ${edgeIDsToBeHidden.length} edges hidden`));
}

function preRenderEvent() {
  cache.nodeIDsToBeShown = new Set();
  cache.propIDsToNodeIDsToBeShown = new Map();  // this is used by the bubble-grouping functionality after rendering
  cache.edgeIDsToBeShown = new Set();
  cache.propIDsToEdgeIDsToBeShown = new Map();
  cache.remainingEdgeRelatedNodes = new Set();
  resetFeatureIsWithinThresholdMaps();

  const queryTextArea = document.getElementById("queryTextArea");
  cache.instructions = decodeQuery(queryTextArea.innerHTML);
  cache.queryFilter = new QueryFilter(cache.instructions);
  const qf = cache.queryFilter;

  for (const node of cache.nodeRef.values()) {
    if (!qf || qf.testNode(node)) {
      cache.nodeIDsToBeShown.add(node.id);
    } else {
      console.log(`Node ${node.id} did not fulfill filter!`);
    }
  }

  for (const edge of cache.edgeRef.values()) {
    const endsOk = cache.nodeIDsToBeShown.has(edge.source) &&
      cache.nodeIDsToBeShown.has(edge.target);

    if (endsOk && (!qf || qf.testEdge(edge))) {
      cache.edgeIDsToBeShown.add(edge.id);
    } else {
      console.log(`Edge ${edge.id} did not fulfill filter!`);
    }
  }

  const nodeIDsToBeHidden = [...cache.nodeRef.keys()].filter(nodeID => !cache.nodeIDsToBeShown.has(nodeID));
  const edgeIDsToBeHidden = [...cache.edgeRef.keys()].filter(edgeID => !cache.edgeIDsToBeShown.has(edgeID));

  const idsToShow = [
    ...cache.nodeIDsToBeShown,
    ...cache.edgeIDsToBeShown
  ];

  const idsToHide = [
    ...nodeIDsToBeHidden,
    ...edgeIDsToBeHidden,
    ...cache.hiddenDanglingNodeIDs,
    ...cache.hiddenDanglingEdgeIDs
  ];

  graph.showElement(idsToShow).then(r => console.log(`${cache.nodeIDsToBeShown.size} nodes and ${cache.edgeIDsToBeShown.size} edges shown`));
  graph.hideElement(idsToHide).then(r => console.log(`${nodeIDsToBeHidden.length} nodes and ${edgeIDsToBeHidden.length} edges hidden`));
}

function performANDFilterLogic() {
  // we want to kick out elements where not all thresholds are met
  for (let nodeID of cache.nodeIDsToBeShown) {
    let propertiesNotWithinThresholds = getPropertiesNotWithinThresholds(nodeID, null);
    if (propertiesNotWithinThresholds.length > 0) {
      cache.nodeIDsToBeShown.delete(nodeID);
      removeFromPropIDsToNodeIDsToBeShown(nodeID);
    }
  }

  for (let edgeID of cache.edgeIDsToBeShown) {
    let propertiesNotWithinThresholds = getPropertiesNotWithinThresholds(null, edgeID);
    if (propertiesNotWithinThresholds.length > 0) {
      cache.edgeIDsToBeShown.delete(edgeID);
      removeFromPropIDsToEdgeIDsToBeShown(edgeID);
    } else {
      // we have edges in an AND-filtered graph, so we want to remember the connected nodes, since all other dangling
      // nodes should be removed
      const [source, target] = edgeID.split("::");
      cache.remainingEdgeRelatedNodes.add(source);
      cache.remainingEdgeRelatedNodes.add(target);
    }
  }
}

function toggleCleanUpDanglingElements(btn) {
  const shouldEnable = btn.classList.contains("red");

  if (shouldEnable) {
    btn.classList.remove("red");
    btn.classList.add("green", "highlight");
    btn.title = "Show all nodes and edges, irrespectively of their connectedness.";
    btn.textContent = "👁";
    hideDanglingElements();
  } else {
    btn.classList.remove("green", "highlight");
    btn.classList.add("red");
    btn.title = "Hide all nodes and edges that are not connected to any other node or edge.";
    btn.textContent = "🚫";
    showDanglingElements();
  }
}

function nodeHasAVisibleEdge(nodeID) {
  for (const edgeID of cache.nodeIDToEdgeIDs.get(nodeID) || []) {
    if (cache.edgeIDsToBeShown.has(edgeID) && !cache.hiddenDanglingEdgeIDs.has(edgeID)) {
      return true;
    }
  }

  return false;
}

function edgeIsConnectedToTwoVisibleNodes(edgeID) {
  for (const nodeID of cache.edgeIDToNodeIDs.get(edgeID) || []) {
    if (!cache.nodeIDsToBeShown.has(nodeID) || cache.hiddenDanglingNodeIDs.has(nodeID)) {
      return false;
    }
  }
  return true;
}

function hideDanglingElements() {
  let changes;

  do {
    changes = false;

    for (let nodeID of cache.nodeIDsToBeShown) {
      if (!nodeHasAVisibleEdge(nodeID) && !cache.hiddenDanglingNodeIDs.has(nodeID)) {
        cache.hiddenDanglingNodeIDs.add(nodeID);
        changes = true;
      }
    }

    for (let edgeID of cache.edgeIDsToBeShown) {
      if (!edgeIsConnectedToTwoVisibleNodes(edgeID) && !cache.hiddenDanglingEdgeIDs.has(edgeID)) {
        cache.hiddenDanglingEdgeIDs.add(edgeID);
        changes = true;
      }
    }

  } while (changes);

  handleFilterEvent("Hiding Elements", "Hiding nodes and edges that are not connected to any other node or edge.");
}

function showDanglingElements() {
  cache.hiddenDanglingNodeIDs.clear();
  cache.hiddenDanglingEdgeIDs.clear();

  handleFilterEvent("Showing Elements",
    "Showing all previously hidden nodes and edges that are not connected to any other node or edge.");
}

function removeFromPropIDsToNodeIDsToBeShown(nodeID) {
  for (let propID of cache.propIDsToNodeIDsToBeShown.keys()) {
    cache.propIDsToNodeIDsToBeShown.get(propID).delete(nodeID);
  }
}

function removeFromPropIDsToEdgeIDsToBeShown(edgeID) {
  for (let propID of cache.propIDsToEdgeIDsToBeShown.keys()) {
    cache.propIDsToEdgeIDsToBeShown.get(propID).delete(edgeID);
  }
}

function resetFeatureIsWithinThresholdMaps() {
  for (let node of data.nodes) {
    node.featureIsWithinThreshold.forEach((value, key) => {
      node.featureIsWithinThreshold.set(key, null);
    });
  }
  for (let edge of data.edges) {
    edge.featureIsWithinThreshold.forEach((value, key) => {
      edge.featureIsWithinThreshold.set(key, null);
    });
  }
}

function getPropertiesNotWithinThresholds(nodeID = null, edgeID = null) {
  const keysWithFalse = [];
  const isNode = nodeID !== null;
  const element = isNode ? cache.nodeRef.get(nodeID) : cache.edgeRef.get(edgeID);

  // we only check properties that belong to this element type (specific props for nodes and edges)
  // const availableProps = isNode ? cache.nodeExclusiveProps : cache.edgeExclusiveProps;
  const availableProps = new Set([
    ...(isNode ? cache.nodeExclusiveProps : cache.edgeExclusiveProps),
    ...cache.mixedProps,
  ]);

  for (const [key, value] of element.featureIsWithinThreshold.entries()) {
    if (!availableProps.has(key)) continue;
    if (value === false) {
      keysWithFalse.push(key);
    }
  }

  for (let propID of cache.activeProps) {
    if (!availableProps.has(propID)) continue;
    if (!element.featureIsWithinThreshold.has(propID)) {
      keysWithFalse.push(propID);
    }
  }

  return keysWithFalse;
}

function isWithinThreshold(filterData, nodeOrEdgeValue) {
  return filterData.isCategory
    ? evaluateCategoricalThreshold(filterData, nodeOrEdgeValue)
    : evaluateNumericalThreshold(filterData, nodeOrEdgeValue);
}

function evaluateCategoricalThreshold(filterData, nodeOrEdgeValue) {
  if (data.layouts[data.selectedLayout].filterStrategy === "AND") {
    // element must fulfill all checked categories
    return setsAreEqual(filterData.categories, nodeOrEdgeValue);
  } else {
    // the element must have at least one active category
    return setsIntersect(filterData.categories, nodeOrEdgeValue);
  }
}

function evaluateNumericalThreshold(filterData, nodeOrEdgeValue) {
  return filterData.isInverted
    ? (nodeOrEdgeValue <= filterData.upperThreshold || nodeOrEdgeValue >= filterData.lowerThreshold)
    : (filterData.lowerThreshold <= nodeOrEdgeValue && nodeOrEdgeValue <= filterData.upperThreshold);
}

function allRelatedNodesAreVisible(edgeID) {
  for (let nodeID of cache.edgeIDToNodeIDs.get(edgeID) || []) {
    if (!cache.nodeIDsToBeShown.has(nodeID)) {
      return false;
    }
  }
  return true;
}

function afterRenderEvent() {
  /**
   * Updates and redraws bubble sets after each graph rendering.
   *
   * For each bubble set group, it calculates the current members (nodes),
   * compares them with the previous members, and redraws the set if changes are detected.
   * Updates the cache with the latest members for consistency.
   */

  // update bubble sets
  for (let group of traverseBubbleSets()) {
    let propsInGroup = data.layouts[data.selectedLayout][`${group}Props`];

    let lastSetMembers = cache.lastBubbleSetMembers.get(group);
    let newSetMembers = new Set();
    for (let prop of propsInGroup) {
      let nodeIDsToBeGrouped = cache.propIDsToNodeIDsToBeShown.get(prop) || [];
      for (let nodeID of nodeIDsToBeGrouped) {
        newSetMembers.add(nodeID);
      }
    }

    if (!setsAreEqual(lastSetMembers, newSetMembers)) {
      updateBubbleSet(group, newSetMembers);
      cache.lastBubbleSetMembers.set(group, newSetMembers);
    }
  }
}

function restorePositions() {
  setTimeout(() => {
    if (!nodePositionsAreInSyncWithPersistedPositions()) {
      graph.updateData(createSimplifiedDataForGraphObject());
      graph.draw();
    } else {
      console.log("Graph is in sync, no re-draw necessary");
    }

    hideLoading();
  }, 200);
}

function nodePositionsAreInSyncWithPersistedPositions() {
  for (let node of graph.getNodeData()) {
    const persistedPosition = data.layouts[data.selectedLayout].positions.get(node.id);
    if (node.style.x !== persistedPosition?.x || node.style.y !== persistedPosition?.y) {
      return false;
    }
  }
  return true;
}

function isInteger(value) {
  return value % 1 === 0;
}

function formatNumber(value, precision) {
  return isInteger(value) ? value : parseFloat(value).toFixed(precision);
}

function buildUI() {
  buildDropdownOptions();
  buildFilterUI();
  showUI(true);
}

function buildDropdownOptions() {
  let layoutDropdown = document.getElementById('layout');
  let layoutOptions = Object.keys(data.layouts).map(key => {
    let selected = data.selectedLayout === key ? "selected" : "";
    return `<option value="${key}" ${selected}>${key}</option>`;
  });
  layoutDropdown.innerHTML = layoutOptions.join("");
}

function buildFilterUI() {
  const div = document.getElementById("filterContainer");
  div.innerHTML = "";

  div.appendChild(createFilterStrategyToggleSwitch());

  let sectionsCreated = new Set();
  let subSectionsCreated = new Set();

  const sortedPropIDs = SORT_FILTERS
    ? [...data.layouts[data.selectedLayout].filters.keys()].sort()
    : [...data.layouts[data.selectedLayout].filters.keys()];

  for (let propID of sortedPropIDs) {
    let [section, subSection, prop] = decodePropHashId(propID);
    let isCategoricalProperty = data.filterDefaults.get(propID).isCategory;

    if (!sectionsCreated.has(section)) {
      if (sectionsCreated.size > 0) {
        div.appendChild(document.createElement("hr"));
      }
      const headerDiv = document.createElement("div");
      headerDiv.classList.add("container-vertical-aligned");

      const header = document.createElement("h3");
      header.textContent = section;
      header.classList.add("inline");
      headerDiv.appendChild(header);

      headerDiv.appendChild(createSectionToggleButton(true, section));
      headerDiv.appendChild(createSectionToggleButton(false, section));

      div.appendChild(headerDiv);
      sectionsCreated.add(section);
    }

    if (!subSectionsCreated.has(`${section}::${subSection}`)) {
      const subHeaderDiv = document.createElement("div");
      subHeaderDiv.className = "sub-header-card";

      const subHeader = document.createElement("h5");
      subHeader.textContent = subSection;
      subHeader.className = "m-0 inline";
      subHeaderDiv.appendChild(subHeader);

      subHeaderDiv.appendChild(createSectionToggleButton(true, section, subSection));
      subHeaderDiv.appendChild(createSectionToggleButton(false, section, subSection));

      div.appendChild(subHeaderDiv);

      subSectionsCreated.add(`${section}::${subSection}`);
    }

    const row = document.createElement('div');
    row.className = "filter-row";

    const col1 = document.createElement('div');
    col1.className = "filter-row-col1";
    col1.appendChild(createCheckbox(propID, prop));
    row.appendChild(col1);

    const col2 = document.createElement('div');
    col2.className = "filter-row-col2";
    row.appendChild(col2);

    const sliderOrDropdown = isCategoricalProperty
      ? new DropdownChecklist(propID)
      : new InvertibleRangeSlider(propID);
    sliderOrDropdown.appendTo(col2);

    const col3 = document.createElement('div');
    col3.className = "filter-row-col3";
    if (cache.nodeExclusiveProps.has(propID) || cache.mixedProps.has(propID)) {
      col3.appendChild(createCircleGroupButtonWithQuadrants(propID));
    } else {
      const placeHolder = document.createElement('div');
      placeHolder.style.width = "18px";
      col3.appendChild(placeHolder);
    }
    col3.appendChild(createAddOrRemoveToSelectionButton(propID, true));
    col3.appendChild(createAddOrRemoveToSelectionButton(propID, false));
    row.appendChild(col3);

    div.append(row);
    sliderOrDropdown.appendListeners();
  }

  const staticStyleDiv = document.getElementById("staticStyleDiv");
  staticStyleDiv.innerHTML = "";
  staticStyleDiv.appendChild(createStyleDiv());

  if (ENABLE_NODE_CONNECTIVITY_SECTION) {
    div.appendChild(buildNodeConnectivitySection());
  }
  manageDynamicWidgets();
  handleEditModeUIChanges();
}

function buildNodeConnectivitySection() {
  const container = document.createElement("div");
  container.style.marginTop = "1.5em";

  const header = document.createElement("h3");
  header.textContent = "Node Connectivity";
  header.classList.add("inline");
  container.appendChild(header);

  const hr = document.createElement("hr");
  container.appendChild(hr);

  const metrics = [
    {name: "Betweenness", id: "betweenness", type: "slider", min: 0, max: 1, step: 0.01},
    {name: "Closeness Centrality", id: "closenessCentrality", type: "slider", min: 0, max: 1, step: 0.01},
  ];

  metrics.forEach(metric => {
    data.filterDefaults.set(metric.id, {
      isCategory: false,
      lowerThreshold: 0,
      upperThreshold: 1,
      step: 0.01
    });

    const row = document.createElement("div");
    row.className = "filter-row";

    const col1 = document.createElement("div");
    col1.className = "filter-row-col1";
    const metricLabel = document.createElement("label");
    metricLabel.textContent = metric.name;
    col1.appendChild(metricLabel);
    row.appendChild(col1);

    const col2 = document.createElement("div");
    col2.className = "filter-row-col2";
    col2.style.marginRight = "28px";
    if (metric.type === "slider") {
      const slider = new InvertibleRangeSlider(metric.id);
      slider.appendTo(col2);
    } else if (metric.type === "checkbox") {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = metric.id;
      col2.appendChild(checkbox);
    }
    row.appendChild(col2);

    container.appendChild(row);
  });

  return container;
}

function updateNodeConnectivityMetrics() {
  // Recompute connectivity metrics here based on visible nodes/edges
  // Access the graph, data, or cache objects as needed.
  // For example, using a graph library to compute betweenness or closeness for each node:

  /*
  for (let node of data.nodes) {
    // Hypothetical: use a centrality function from your library
    node.betweenness = computeBetweenness(node, graph);
    node.closenessCentrality = computeCloseness(node, graph);
    // etc.
  }
  */
  console.log("!!TODO: Node connectivity metrics updated!");
}

function saveFiltersToStash(manualTriggered = false) {
  data.stash = {
    filters: structuredClone(data.layouts[data.selectedLayout].filters),
    filterStrategy: structuredClone(data.layouts[data.selectedLayout].filterStrategy),
    triggered: manualTriggered
  };
  showLoading("Saving filter", "Saving filter settings to stash", false, true);
}

function loadFiltersFromStash() {
  data.layouts[data.selectedLayout].filters = structuredClone(data.stash.filters);
  data.layouts[data.selectedLayout].filterStrategy = structuredClone(data.stash.filterStrategy);
  buildFilterUI();
  handleFilterEvent("Restoring filter", "Restoring filter settings from stash");
}

function createFilterStrategyToggleSwitch() {
  function updateText() {
    text.innerHTML = `Filter Strategy: <span class='red'>${data.layouts[data.selectedLayout].filterStrategy}</span>`;
    text.title = data.layouts[data.selectedLayout].filterStrategy === "AND" ? "Applies all active filters at the same time. Only items that satisfy all conditions will be displayed." : "Items that satisfy any condition will be displayed.";
  }

  let currentStrat = data.layouts[data.selectedLayout].filterStrategy;

  const div = document.createElement("div");
  div.className = "container-vertical-aligned";

  const text = document.createElement("h5");
  text.className = "inline";
  updateText();

  const label = document.createElement("label");
  label.className = "switch inline";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = currentStrat === "AND";
  input.addEventListener("change", () => {
    data.layouts[data.selectedLayout].filterStrategy = data.layouts[data.selectedLayout].filterStrategy === "AND" ? "OR" : "AND";
    updateText();
    handleFilterEvent("Filter Strategy", "Filter Strategy changed to " + data.layouts[data.selectedLayout].filterStrategy);
  });

  const span = document.createElement("span");
  span.className = "slider round";

  label.appendChild(input);
  label.appendChild(span);
  div.appendChild(label);
  div.appendChild(text);

  return div;
}

function manageDynamicWidgets() {
  let isCustomLayout = data.layouts[data.selectedLayout].isCustom;
  let removeLayoutBtnCls = document.getElementById("removeSelectedLayoutButton").classList;
  let resetLayoutBtnCls = document.getElementById("resetLayoutButton").classList;

  isCustomLayout ? removeLayoutBtnCls.remove("disabled") : removeLayoutBtnCls.add("disabled");
  isCustomLayout ? resetLayoutBtnCls.add("disabled") : resetLayoutBtnCls.remove("disabled");
}

function createSectionToggleButton(enable, section, subSection = null) {
  const btn = document.createElement("button");
  btn.className = "small-btn toggle-section-btn ml-1";
  if (subSection) btn.classList.add("extra-small");
  if (enable) btn.classList.add("ml-2");
  btn.textContent = enable ? "✔" : "✗";
  btn.title = `${enable ? 'Enable' : 'Disable'} all filters for the ${subSection ? 'sub-section: ' + subSection : 'section: ' + section}`;
  btn.onclick = () => {
    subSection ? toggleSubSection(enable, section, subSection) : toggleSection(enable, section);
  };
  return btn;
}

function toggleSection(enable, section) {
  toggleCheckboxesForSetOfPropIDs(enable, section);
  handleFilterEvent(`${enable ? 'Showing' : 'Hiding'} Elements`, `Nodes and related edges for ${section}`);
}

function toggleSubSection(enable, section, subSection) {
  toggleCheckboxesForSetOfPropIDs(enable, section + "::" + subSection);
  handleFilterEvent(`${enable ? 'Showing' : 'Hiding'} Elements`, `Nodes and related edges for ${section} ${subSection}`);
}

function toggleCheckboxesForSetOfPropIDs(enable, propIDPrefixToSearchFor) {
  const setOfPropIDs = [...cache.propToNodes.keys(), ...cache.propToEdgeIDs.keys()]
    .filter(propID => propID.startsWith(propIDPrefixToSearchFor));
  for (let propID of setOfPropIDs) {
    let checkbox = document.getElementById(`filter-${propID}-checkbox`);
    let wrapper = document.getElementById(`filter-${propID}-checkbox-wrapper`);
    let inner = document.getElementById(`filter-${propID}-checkbox-inner`);
    checkbox.checked = enable;
    data.layouts[data.selectedLayout].filters.get(propID).active = enable;
    enable ? cache.activeProps.add(propID) : cache.activeProps.delete(propID);
    wrapper.title = `Click to ${enable ? 'hide' : 'show'} nodes and related edges that ${enable ? 'do not' : ''} have the property: ${propID}`;
    inner.textContent = enable ? '✔' : '';
  }
}

function createCheckbox(propID, prop) {
  const wrapper = document.createElement('label');
  wrapper.className = 'checkboxWrapper';
  wrapper.id = `filter-${propID}-checkbox-wrapper`;

  const input = document.createElement('input');
  input.id = `filter-${propID}-checkbox`;
  input.type = 'checkbox';
  input.checked = data.layouts[data.selectedLayout].filters.get(propID).active;
  input.style.display = 'none';

  const customCheckbox = document.createElement('span');
  customCheckbox.id = `filter-${propID}-checkbox-inner`;
  customCheckbox.className = "checkbox checkbox-red";

  const updateCheckbox = () => {
    customCheckbox.textContent = input.checked ? '✔' : '';
    wrapper.title = `Click to ${input.checked ? 'hide' : 'show'} nodes and related edges that ${input.checked ? 'do not' : ''} have the property: ${propID}`;
  };
  updateCheckbox();

  input.addEventListener('change', updateCheckbox);

  const displayField = document.createElement('span');
  displayField.className = 'checkboxLabel';
  displayField.textContent = prop;

  wrapper.append(input, customCheckbox, displayField);

  wrapper.addEventListener('change', (ev) => {
    // const slider = document.getElementById(`filter-${propID}-slider`);
    // slider && input.checked ? slider.classList.remove("is-disabled") : slider && slider.classList.add("is-disabled");
    data.layouts[data.selectedLayout].filters.get(propID).active = input.checked;
    input.checked ? cache.activeProps.add(propID) : cache.activeProps.delete(propID);
    let status = input.checked ? "Showing" : "Hiding";
    handleFilterEvent(`${status} Elements`, `Nodes and related edges for ${propID}`);
  });

  input.checked ? cache.activeProps.add(propID) : cache.activeProps.delete(propID);

  return wrapper;
}

function uncheckAllCheckboxes() {
  for (const propID of cache.propIDs) {
    checkCheckbox(propID, false);
  }
}

function checkCheckbox(propID, enable = true) {
  const checkbox = document.getElementById(`filter-${propID}-checkbox`);
  const span = document.getElementById(`filter-${propID}-checkbox-inner`);
  const wrapper = document.getElementById(`filter-${propID}-checkbox-wrapper`);

  checkbox.checked = enable;
  data.layouts[data.selectedLayout].filters.get(propID).active = enable;

  enable ? cache.activeProps.add(propID) : cache.activeProps.delete(propID);
  span.textContent = enable ? '✔' : '';
  wrapper.title = `Click to ${enable ? 'hide' : 'show'} nodes and related edges that ${enable ? 'do not' : ''} have the property: ${propID}`;
}

class DropdownChecklist {
  constructor(propID) {
    this.propID = propID;
    this.categories = data.filterDefaults.get(propID).categories;
    this.selectedCategories = data.layouts[data.selectedLayout].filters.get(propID).categories;
    this.isVisible = false;
    this.sortCategories();
    cache.propIDToDropdownChecklists.set(propID, this);
  }

  sortCategories() {
    const catArray = Array.isArray(this.categories)
      ? [...this.categories]
      : Array.from(this.categories);

    catArray.sort((a, b) => {
      const getPriority = (val) => {
        const lower = val.toLowerCase();
        if (lower === "low") return 1;
        if (lower === "medium") return 2;
        if (lower === "high") return 3;
        return 0; // “other” values
      };
      const priorityA = getPriority(a);
      const priorityB = getPriority(b);

      if (priorityA === 0 && priorityB === 0) {
        // Both “other” values → alphabetical
        return a.localeCompare(b);
      }
      // Sort by priority ascending: 0 → “other”, 1 → “low”, 2 → “medium”, 3 → “high”
      return priorityA - priorityB;
    });

    this.categories = new Set(catArray);
  }

  appendTo(parent) {
    this.container = document.createElement("div");
    this.container.id = this.propID + "-dropdown";
    this.container.className = "dropdown-check-list";
    this.container.tabIndex = 100;

    // Create the anchor (visible clickable part)
    this.anchor = document.createElement("h5");
    this.anchor.className = "anchor purple round-border";
    this.anchor.textContent = `${this.selectedCategories.size}/${this.categories.size} selected`;
    this.anchor.id = this.propID + "-dropdown-anchor";
    this.container.appendChild(this.anchor);

    // Create the unordered list (dropdown items)
    this.itemsList = document.createElement("ul");
    this.itemsList.className = "items";

    // add buttons on top
    this.buttonContainer = document.createElement("div");
    this.buttonContainer.className = "dropdown-buttons";

    this.selectAllButton = document.createElement("button");
    this.selectAllButton.textContent = "Select All";

    this.deselectAllButton = document.createElement("button");
    this.deselectAllButton.textContent = "Deselect All";

    this.buttonContainer.appendChild(this.selectAllButton);
    this.buttonContainer.appendChild(this.deselectAllButton);

    this.itemsList.appendChild(this.buttonContainer);

    // Add the options as checkboxes
    this.categories.forEach(option => {
      const listItem = document.createElement("li");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = option;
      checkbox.checked = this.selectedCategories.has(option);
      checkbox.style.display = "none";
      checkbox.addEventListener("change", (ev) => this.handleSelection(ev));

      const customCheckbox = document.createElement("span");
      customCheckbox.className = "custom-checkbox";

      checkbox.addEventListener("change", () => {
        checkbox.checked ? customCheckbox.classList.add("checked") : customCheckbox.classList.remove("checked");
      });

      // Set initial state
      if (checkbox.checked) customCheckbox.classList.add("checked");

      const label = document.createElement("label");
      label.textContent = option;
      label.prepend(customCheckbox);
      label.prepend(checkbox);

      listItem.appendChild(label);
      this.itemsList.appendChild(listItem);
    });

    this.container.appendChild(this.itemsList);

    parent.appendChild(this.container);
  }

  handleSelection(ev) {
    ev.target.checked
      ? this.selectedCategories.add(ev.target.value)
      : this.selectedCategories.delete(ev.target.value);
    this.anchor.textContent = `${this.selectedCategories.size}/${this.categories.size} selected`;
    handleFilterEvent(ev.target.checked ? "Showing" : "Hiding" + " Elements",
      `Nodes and related edges for ${this.propID} ${ev.target.value}`, this.propID);
    // console.log(`${this.propID} ${ev.target.value} ${ev.target.checked}`);
  }

  appendListeners() {
    const updateDropdownPosition = () => {
      // Temporarily make the dropdown visible to calculate its height
      this.itemsList.style.visibility = "hidden";
      this.itemsList.style.display = "block";

      const dropdownHeight = this.itemsList.offsetHeight;
      this.itemsList.style.display = "";
      this.itemsList.style.visibility = "";

      const anchorRect = this.anchor.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const availableHeight = viewportHeight - anchorRect.bottom;

      // Set position of the dropdown
      this.itemsList.style.top = `${anchorRect.bottom}px`;
      this.itemsList.style.left = `${anchorRect.left - 3}px`;

      // Make the dropdown scrollable if there's not enough space
      if (dropdownHeight > availableHeight) {
        this.itemsList.style.maxHeight = `${availableHeight}px`;
        this.itemsList.style.overflowY = "auto";
      } else {
        this.itemsList.style.maxHeight = "";
        this.itemsList.style.overflowY = "";
      }
    };

    this.anchor.addEventListener("click", () => {
      this.isVisible = !this.isVisible;
      if (this.isVisible) {
        updateDropdownPosition();
        document.addEventListener("scroll", updateDropdownPosition, true);
        this.container.classList.add("visible");
      } else {
        this.container.classList.remove("visible");
        document.removeEventListener("scroll", updateDropdownPosition, true);
      }
    });

    // button callbacks
    this.selectAllButton.addEventListener("click", () => this.selectAllCategories());
    this.deselectAllButton.addEventListener("click", () => this.deselectAllCategories());

    // Handle clicks outside the dropdown to close it
    document.addEventListener("click", (event) => {
      if (!this.container.contains(event.target)) {
        this.isVisible = false;
        this.container.classList.remove("visible");
      }
    });
  }

  selectCategory(category) {
    if (!this.categories.has(category)) {
      warning(`Category "${category}" does not exist for ${this.propID}`);
      return;
    }

    this.selectedCategories.add(category);

    const checkbox = this.itemsList.querySelector(
      `input[type="checkbox"][value="${CSS.escape(category)}"]`
    );
    checkbox.checked = true;
    checkbox.nextElementSibling.classList.add("checked");
    this.anchor.textContent = `${this.selectedCategories.size}/${this.categories.size} selected`;
  }

  selectAllCategories() {
    this.categories.forEach(category => this.selectedCategories.add(category)); // Add all categories
    this.updateCheckboxStates(true);
    handleFilterEvent("Showing Elements", `Nodes and related edges for ${this.propID}`, this.propID);
  }

  deselectAllCategories(skipFilterEvent=false) {
    this.categories.forEach(category => this.selectedCategories.delete(category)); // Clear all categories
    this.updateCheckboxStates(false);
    if (!skipFilterEvent) {
      handleFilterEvent("Hiding Elements", `Nodes and related edges for ${this.propID}`, this.propID);
    }
  }

  updateCheckboxStates(selectAll) {
    Array.from(this.itemsList.querySelectorAll("input[type='checkbox']")).forEach(checkbox => {
      checkbox.checked = selectAll; // Update checkbox state
      selectAll
        ? checkbox.nextElementSibling.classList.add("checked")
        : checkbox.nextElementSibling.classList.remove("checked");
    });
    this.anchor.textContent = `${this.selectedCategories.size}/${this.categories.size} selected`; // Update anchor text
  }

}

class InvertibleRangeSlider {
  constructor(propID) {
    this.propID = propID;
    const defaultFilterData = structuredClone(data.filterDefaults.get(propID));
    this.readCurrentFilterSettings();
    this.sliderMin = defaultFilterData.lowerThreshold;
    this.sliderMax = defaultFilterData.upperThreshold;
    this.stepSize = isInteger(this.sliderMin) && isInteger(this.sliderMax)
      ? FILTER_STEP_SIZE_INTEGER
      : FILTER_STEP_SIZE_FLOAT;
    this.initializeIds();
    cache.propIDToInvertibleRangeSliders.set(propID, this);
  }

  initializeIds() {
    this.sliderId = `filter-${this.propID}-slider`;
    this.sliderIdStart = `${this.sliderId}-start`;
    this.sliderIdStartInput = `${this.sliderId}-start-input`;
    this.sliderIdEnd = `${this.sliderId}-end`;
    this.sliderIdEndInput = `${this.sliderId}-end-input`;
    this.inverseLeftId = `${this.sliderId}-inverse-left`;
    this.inverseRightId = `${this.sliderId}-inverse-right`;
    this.rangeId = `${this.sliderId}-range`;
    this.thumbStartId = `${this.sliderId}-thumb-start`;
    this.thumbEndId = `${this.sliderId}-thumb-end`;
    this.labelStartId = `${this.sliderIdStart}-label`;
    this.labelEndId = `${this.sliderIdEnd}-label`;
  }

  readCurrentFilterSettings() {
    if (!data.layouts[data.selectedLayout].filters.has(this.propID)) {
      this.currentMin = 0;
      this.currentMax = 1;
      this.isInverted = false;
    } else {
      let filterData = data.layouts[data.selectedLayout].filters.get(this.propID);
      this.currentMin = filterData.lowerThreshold;
      this.currentMax = filterData.upperThreshold;
      this.isInverted = filterData.isInverted;
    }
  }

  writeCurrentFilterSettings() {
    if (data.layouts[data.selectedLayout].filters.has(this.propID)) {
      let filterData = data.layouts[data.selectedLayout].filters.get(this.propID);
      filterData.lowerThreshold = this.currentMin;
      filterData.upperThreshold = this.currentMax;
      filterData.isInverted = this.isInverted;
    }
  }

  calcPercentage(value) {
    return ((value - this.sliderMin) / (this.sliderMax - this.sliderMin)) * 100;
  }

  getDOMReferences() {
    this.slider = document.getElementById(this.sliderId);
    this.sliderStart = document.getElementById(this.sliderIdStart);
    this.sliderStartInput = document.getElementById(this.sliderIdStartInput);
    this.sliderEnd = document.getElementById(this.sliderIdEnd);
    this.sliderEndInput = document.getElementById(this.sliderIdEndInput);
    this.inverseLeft = document.getElementById(this.inverseLeftId);
    this.inverseRight = document.getElementById(this.inverseRightId);
    this.range = document.getElementById(this.rangeId);
    this.thumbStart = document.getElementById(this.thumbStartId);
    this.thumbEnd = document.getElementById(this.thumbEndId);
    this.labelStart = document.getElementById(this.labelStartId);
    this.labelEnd = document.getElementById(this.labelEndId);
  }

  createSliderInput(id, initialValue, relatedSliderId) {
    const input = document.createElement("input");
    input.id = id;
    input.style.width = '80px';
    input.style.height = '16px';
    input.style.boxSizing = 'border-box';
    input.value = initialValue;
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        let newValue = parseFloat(input.value);
        const sliderElem = document.getElementById(relatedSliderId);
        if (isNaN(newValue) || newValue < this.sliderMin || newValue > this.sliderMax) {
          input.value = sliderElem.value;
        } else {
          sliderElem.value = newValue;
          sliderElem.dispatchEvent(new Event("input"));
          sliderElem.dispatchEvent(new Event("change"));
        }
      }
    });
    return input;
  }

  appendTo(parent) {
    if (HIDE_SLIDERS_WITH_SAME_MIN_MAX_VALUES && this.sliderMin === this.sliderMax) {
      parent.appendChild(document.createElement("span"));
      return false;
    }
    this.isValidSlider = true;

    const colLeft = document.createElement('div');
    colLeft.classList.add('show-on-edit');
    colLeft.style.transition = 'width 0.2s ease';
    const leftElem = this.createSliderInput(this.sliderIdStartInput, this.currentMin, this.sliderIdStart);
    colLeft.appendChild(leftElem);

    const colRight = document.createElement('div');
    colRight.classList.add('show-on-edit');
    colRight.style.transition = 'width 0.2s ease';
    const rightElem = this.createSliderInput(this.sliderIdEndInput, this.currentMax, this.sliderIdEnd);
    colRight.appendChild(rightElem);

    const div = document.createElement("div");
    div.innerHTML = this.createDivInnerHTML();
    const slider = div.firstElementChild;
    slider.style.width = '100%';
    slider.title = `Set minimum & maximum thresholds for ${this.propID}.\nDouble-click to reset.`;

    parent.appendChild(div);
    parent.appendChild(colLeft);
    parent.appendChild(slider);
    parent.appendChild(colRight);
  }

  createDivInnerHTML() {
    return `
      <div slider id="${this.sliderId}">
        <div>
          <div id="${this.inverseLeftId}" inverse-left style="width:${this.calcPercentage(this.currentMin)}%;"></div>
          <div id="${this.inverseRightId}" inverse-right style="width:${100 - this.calcPercentage(this.currentMax)}%;"></div>
          <div id="${this.rangeId}" range style="left:${this.calcPercentage(this.currentMin)}%; 
                 right:${100 - this.calcPercentage(this.currentMax)}%;"></div>
          <span id="${this.thumbStartId}" thumb style="left:${this.calcPercentage(this.currentMin)}%;"></span>
          <span id="${this.thumbEndId}" thumb style="left:${this.calcPercentage(this.currentMax)}%;"></span>
          <div sign class="left" style="left:0%;">
            <span id="${this.labelStartId}">${formatNumber(this.currentMin, FILTER_VISUAL_FLOAT_PRECISION)}</span>
          </div>
          <div sign class="right" style="left:100%; margin-left: 24px;">
            <span id="${this.labelEndId}">${formatNumber(this.currentMax, FILTER_VISUAL_FLOAT_PRECISION)}</span>
          </div>
        </div>
        <input type="range" tabindex="0" value="${this.currentMin}" max="${this.sliderMax}" min="${this.sliderMin}" 
          step="${this.stepSize}" id="${this.sliderIdStart}" />
        <input type="range" tabindex="0" value="${this.currentMax}" max="${this.sliderMax}" min="${this.sliderMin}" 
          step="${this.stepSize}" id="${this.sliderIdEnd}" />
      </div>
    `;
  }

  appendListeners() {
    if (!this.isValidSlider) return;
    this.getDOMReferences();

    this.slider.addEventListener('dblclick', () => {
      this.sliderStart.value = this.sliderMin;
      this.sliderStart.dispatchEvent(new Event('input'));
      data.layouts[data.selectedLayout].filters.get(this.propID).lowerThreshold = this.sliderMin;
      this.sliderEnd.value = this.sliderMax;
      this.sliderEnd.dispatchEvent(new Event('input'));
      this.sliderEnd.dispatchEvent(new Event('change'));
    });

    this.sliderStart.addEventListener("input", () => this.handleThresholdOnInputEvent(true));
    this.sliderStart.addEventListener("change", () => {
      this.writeCurrentFilterSettings();
      handleFilterEvent("Filtering",
        `Applying lower threshold ${this.sliderStart.value} for ${this.propID}`, this.propID);
    });
    this.sliderEnd.addEventListener("input", () => this.handleThresholdOnInputEvent(false));
    this.sliderEnd.addEventListener("change", () => {
      this.writeCurrentFilterSettings();
      handleFilterEvent("Filtering",
        `Applying upper threshold ${this.sliderEnd.value} for ${this.propID}`, this.propID);
    });

    // initially dispatch input event once to match slider visuals to the current state
    this.sliderStart.dispatchEvent(new Event('input'));
    this.sliderEnd.dispatchEvent(new Event('input'));
  }

  handleThresholdOnInputEvent(isLower) {
    const primarySlider = isLower ? this.sliderStart : this.sliderEnd;
    const secondarySlider = isLower ? this.sliderEnd : this.sliderStart;
    const primaryValue = parseFloat(primarySlider.value);
    const secondaryValue = parseFloat(secondarySlider.value);

    this.isInverted = isLower ? primaryValue > secondaryValue : primaryValue < secondaryValue;

    if (this.isInverted) {
      this.range.style.width = '0%';
      const leftWidth = this.calcPercentage(isLower ? secondaryValue : primaryValue);
      const rightWidth = this.calcPercentage(isLower ? primaryValue : secondaryValue);
      this.inverseLeft.style.width = leftWidth + '%';
      this.inverseRight.style.width = (100 - rightWidth) + '%';
      this.range.style.left = '50%';
      this.inverseLeft.style.backgroundColor = '#C33D35';
      this.inverseRight.style.backgroundColor = '#C33D35';
      if (isLower) {
        this.labelEnd.innerHTML = formatNumber(primaryValue, FILTER_VISUAL_FLOAT_PRECISION);
        this.labelStart.innerHTML = formatNumber(secondaryValue, FILTER_VISUAL_FLOAT_PRECISION);
      } else {
        this.labelStart.innerHTML = formatNumber(primaryValue, FILTER_VISUAL_FLOAT_PRECISION);
        this.labelEnd.innerHTML = formatNumber(secondaryValue, FILTER_VISUAL_FLOAT_PRECISION);
      }

      this.labelStart.parentElement.classList.add("flipped");
      this.labelEnd.parentElement.classList.add("flipped");
    } else {
      const leftPos = this.calcPercentage(isLower ? primaryValue : secondaryValue);
      const rightPos = 100 - this.calcPercentage(isLower ? secondaryValue : primaryValue);
      this.range.style.left = leftPos + '%';
      this.range.style.width = (100 - leftPos - rightPos) + '%';
      this.inverseLeft.style.width = leftPos + '%';
      this.inverseRight.style.width = rightPos + '%';
      this.inverseLeft.style.backgroundColor = 'grey';
      this.inverseRight.style.backgroundColor = 'grey';
      if (isLower) {
        this.labelStart.innerHTML = formatNumber(primaryValue, FILTER_VISUAL_FLOAT_PRECISION);
        this.labelEnd.innerHTML = formatNumber(secondaryValue, FILTER_VISUAL_FLOAT_PRECISION);
      } else {
        this.labelStart.innerHTML = formatNumber(secondaryValue, FILTER_VISUAL_FLOAT_PRECISION);
        this.labelEnd.innerHTML = formatNumber(primaryValue, FILTER_VISUAL_FLOAT_PRECISION);
      }

      this.labelStart.parentElement.classList.remove("flipped");
      this.labelEnd.parentElement.classList.remove("flipped");
    }

    if (isLower) {
      this.thumbStart.style.left = this.calcPercentage(primaryValue) + '%';
      this.sliderStartInput.value = primaryValue;
      this.currentMin = primaryValue;
    } else {
      this.thumbEnd.style.left = this.calcPercentage(primaryValue) + '%';
      this.sliderEndInput.value = primaryValue;
      this.currentMax = primaryValue;
    }
  }

  setTo(min, max, inverted) {
    const clampedMin = Math.min(Math.max(min, this.sliderMin), this.sliderMax);
    const clampedMax = Math.min(Math.max(max, this.sliderMin), this.sliderMax);

    if (!inverted && min >= max) {
      error(`Cannot set min threshold to ${min} and max threshold to ${max} for ${this.propID}`);
      return;
    }
    if (inverted && max <= min) {
      error(`Cannot set threshold to LOWER THAN ${min} OR GREATER THAN ${max} for inverted ${this.propID}`);
      return;
    }

    if (min < this.sliderMin) {
      warning(`Minimum threshold for ${this.propID} corrected to ${clampedMin} (from ${min})`);
    }
    if (max > this.sliderMax) {
      warning(`Maximum threshold for ${this.propID} corrected to ${clampedMax} (from ${max})`);
    }

    this.sliderStart.value = inverted ? clampedMax : clampedMin;
    this.sliderEnd.value = inverted ? clampedMin : clampedMax;

    this.handleThresholdOnInputEvent(true);
    this.handleThresholdOnInputEvent(false);

    this.writeCurrentFilterSettings();
  }
}

function createCircleGroupButtonWithQuadrants(propID) {
  const circleButton = document.createElement('div');
  circleButton.className = `circle-button`;

  for (let [group, quadrantPosition] of Object.entries(DEFAULTS.BUBBLE_SET_QUADRANT_POSITIONS)) {
    const quadrant = document.createElement('button');
    quadrant.classList.add("quadrant");
    quadrant.classList.add(quadrantPosition);
    data.layouts[data.selectedLayout].filters.get(propID)[`${group}Members`].size === 0 ? quadrant.classList.remove("active") : quadrant.classList.add("active");

    quadrant.addEventListener('click', () => {
      let shouldShowRemove = quadrant.classList.contains("active");
      let members = data.layouts[data.selectedLayout].filters.get(propID)[`${group}Members`];

      if (shouldShowRemove) {
        data.layouts[data.selectedLayout][`${group}Props`].delete(propID);
        quadrant.title = `Remove ${propID} from ${group}.`;
        members.delete(propID);
        quadrant.classList.remove("active");
        handleFilterEvent(`Reduce Group`, `Removing ${propID} from ${group}`, propID);
      } else {
        data.layouts[data.selectedLayout][`${group}Props`].add(propID);
        quadrant.title = `Add ${propID} to ${group}`;
        members.add(propID);
        quadrant.classList.add("active");
        handleFilterEvent(`Add to Group`, `Adding ${propID} to ${group}`, propID);
      }
    });

    quadrant.title = `Add ${propID} to ${group}.`;
    circleButton.appendChild(quadrant);
  }

  return circleButton;
}

function createStyleToggleButton(propID) {
  const btn = document.createElement("button");
  btn.classList.add("ml-2", "style-icon-button", "show-on-edit");
  btn.textContent = "🎨";
  btn.title = "Control style for this property";

  btn.addEventListener("click", () => {
    document.getElementById(`style-row-${propID}`).classList.toggle("show");
  });

  return btn;
}

function createAddOrRemoveToSelectionButton(propID, shouldAdd) {
  const btn = document.createElement("button");
  btn.classList.add("plus-minus-button", "show-on-edit");
  btn.textContent = shouldAdd ? "+" : "-";
  btn.title = shouldAdd ? "Add to selection" : "Remove from selection";
  btn.addEventListener("click", () => {
    let triggerRender = false;

    const nodeIDs = cache.propIDsToNodeIDsToBeShown.get(propID) || [];
    if (nodeIDs.size > 0) {
      const nodes = graph.getNodeData([...nodeIDs]);
      updateSelectedState(nodes, shouldAdd);
      graph.updateNodeData(nodes);
      triggerRender = true;
    }

    const edgeIDs = cache.propIDsToEdgeIDsToBeShown.get(propID) || [];
    if (edgeIDs.size > 0) {
      const edges = graph.getEdgeData([...edgeIDs]);
      updateSelectedState(edges, shouldAdd);
      graph.updateEdgeData(edges);
      triggerRender = true;
    }

    if (triggerRender) {
      const addRemove = shouldAdd ? "Adding" : "Removing";
      const filler = shouldAdd ? "to" : "from";
      updateSelectionLoadingAndRenderEvent(`${addRemove} ${filler} Selection`, `${addRemove} ${propID} ${filler} selection`, propID);
    }
  });
  return btn;
}

function handleFilterEvent(header, text, propID = null) {
  // skip rendering if property is not active
  if (propID !== null && !data.layouts[data.selectedLayout].filters.get(propID).active) {
    return;
  }

  showLoading(header, text);
  setTimeout(() => {
    graph.render().then(r => console.log(`Graph updated after filter event with message ${header} ${text}`));
  }, 25);
}

function handleStyleChangeLoadingEvent(header, text) {
  showLoading(header, text);
  setTimeout(() => {
    graph.render().then(r => console.log(`Graph updated after style event with message ${header} ${text}`));
  }, 25);
}

function showUI(show) {
  document.querySelectorAll('.showOnLoad').forEach((element) => {
    element.style.opacity = show ? "1" : "0";
    element.style.pointerEvents = show ? "auto" : "none";
  });
}

async function changeLayout() {
  data.selectedLayout = document.getElementById('layout').value;
  showLoading("Switching layout", data.selectedLayout);
  setTimeout(() => {
    let layout = data.layouts[data.selectedLayout];
    if (!layout.isCustom) {
      graph.setLayout({type: data.selectedLayout, ...layout.internals});
    }
    buildFilterUI();
    clearActivePropsCacheOnLayoutChange();

    setTimeout(() => {
      graph.render().then(r => {
        persistPositionsUpdateDataAndReDrawGraph();
        console.log(`Switched to layout: ${data.selectedLayout}`);
      });
    }, 25);


  }, 25);
}

function addLayout() {
  let layoutName = prompt("Enter Layout Name: ");
  let existing = Object.keys(data.layouts);

  if (layoutName == null || layoutName === "") {
    console.log("Creating layout canceled");
    return false;
  } else if (existing.includes(layoutName)) {
    alert(`Layout with name "${layoutName}" already exists.`);
    return false;
  }

  const currentLayout = data.layouts[data.selectedLayout];

  // create new layout object by copying positions and filters from current one
  data.layouts[layoutName] = {
    internals: null,
    positions: structuredClone(currentLayout.positions),
    filters: structuredClone(currentLayout.filters),
    filterStrategy: structuredClone(currentLayout.filterStrategy),
    isCustom: true
  };
  for (let group of traverseBubbleSets()) {
    data.layouts[layoutName][`${group}Props`] = structuredClone(currentLayout[`${group}Props`]);
  }

  buildDropdownOptions();
  document.getElementById('layout').value = layoutName;
  changeLayout();
}

function removeSelectedLayout() {
  if (!data.layouts[data.selectedLayout].isCustom) {
    alert("Cannot delete default layout.");
    return false;
  }

  if (!confirm(`Are you sure you want to delete the following layout? ${data.selectedLayout}`)) return false;

  delete data.layouts[data.selectedLayout];
  buildDropdownOptions();

  document.getElementById('layout').value = DEFAULTS.LAYOUT;
  changeLayout();
}

function getNodeStyleOrDefaults(node) {
  const nodeObj = {
    type: node.type || DEFAULTS.NODE.TYPE,
    style: {
      labelFontSize: node.style?.labelFontSize || DEFAULTS.NODE.LABEL.FONT_SIZE,
      labelPlacement: node.style?.labelPlacement || DEFAULTS.NODE.LABEL.PLACEMENT,
      labelFill: node.style?.labelFill || DEFAULTS.NODE.LABEL.FOREGROUND_COLOR,
      labelBackgroundFill: node.style?.labelBackgroundFill || DEFAULTS.NODE.LABEL.BACKGROUND_COLOR,
      labelBackground: node.style?.labelBackground || DEFAULTS.NODE.LABEL.BACKGROUND,
      labelBackgroundRadius: DEFAULTS.NODE.LABEL.BACKGROUND_RADIUS,
      labelPadding: DEFAULTS.NODE.LABEL.PADDING,
      size: node.style?.size || DEFAULTS.NODE.SIZE,
      fill: node.style?.fill || DEFAULTS.NODE.FILL_COLOR,
      stroke: node.style?.stroke || DEFAULTS.NODE.STROKE_COLOR,
      lineWidth: node.style?.lineWidth || DEFAULTS.NODE.LINE_WIDTH,
      badge: node.style?.badge || false,
      badges: node.style?.badges || [],
      badgePalette: node.style?.badgePalette || [],
      badgeFontSize: DEFAULTS.NODE.BADGE.FONT_SIZE,
    }
  };

  if (cache.showNodeLabelsAndHoverEffect) {
    nodeObj.style.label = true;
    nodeObj.style.labelText = node.style?.labelText || node.label || node.id;
    nodeObj.style.labelFontSize = node.style?.labelFontSize || DEFAULTS.STYLES.NODE_LABEL_FONT_SIZES.md;
  }
  return nodeObj;
}

function getEdgeStyleOrDefaults(edge) {
  return {
    type: edge.type || DEFAULTS.EDGE.TYPE,
    style: {
      startArrow: edge.style?.startArrow || DEFAULTS.EDGE.ARROWS.START,
      startArrowSize: edge.style?.startArrowSize || DEFAULTS.EDGE.ARROWS.START_SIZE,
      startArrowType: edge.style?.startArrowType || DEFAULTS.EDGE.ARROWS.START_TYPE,
      endArrow: edge.style?.endArrow || DEFAULTS.EDGE.ARROWS.END,
      endArrowSize: edge.style?.endArrowSize || DEFAULTS.EDGE.ARROWS.END_SIZE,
      endArrowType: edge.style?.endArrowType || DEFAULTS.EDGE.ARROWS.END_TYPE,
      lineWidth: edge.style?.lineWidth || DEFAULTS.EDGE.LINE_WIDTH,
      lineDash: edge.style?.lineDash || DEFAULTS.EDGE.LINE_DASH,
      label: edge.style?.label || DEFAULTS.EDGE.LABEL.ENABLED,
      labelText: edge.style?.labelText || DEFAULTS.EDGE.LABEL.TEXT,
      labelFill: edge.style?.labelFill || DEFAULTS.EDGE.LABEL.FOREGROUND_COLOR,
      labelFontSize: edge.style?.labelFontSize || DEFAULTS.EDGE.LABEL.FONT_SIZE,
      labelPlacement: edge.style?.labelPlacement || DEFAULTS.EDGE.LABEL.PLACEMENT,
      labelOffsetX: edge.style?.labelOffsetX || DEFAULTS.EDGE.LABEL.OFFSET_X,
      labelOffsetY: edge.style?.labelOffsetY || DEFAULTS.EDGE.LABEL.OFFSET_Y,
      labelBackground: edge.style?.labelBackground || DEFAULTS.EDGE.LABEL.BACKGROUND,
      labelBackgroundFill: edge.style?.labelBackgroundFill || DEFAULTS.EDGE.LABEL.BACKGROUND_COLOR,
      labelAutoRotate: edge.style?.labelAutoRotate || DEFAULTS.EDGE.LABEL.AUTO_ROTATE,
      stroke: edge.style?.stroke || DEFAULTS.EDGE.COLOR,
      halo: edge.style?.halo || DEFAULTS.EDGE.HALO.ENABLED,
      haloStroke: edge.style?.haloStroke || DEFAULTS.EDGE.HALO.COLOR,
      haloLineWidth: edge.style?.haloLineWidth || DEFAULTS.EDGE.HALO.WIDTH,
    }
  }
}

function exportGraphAsJSON() {
  if (data === null) {
    alert("No graph data to save.");
    return false;
  }

  function replacer(key, value) {
    /**
     * Custom replacer function for JSON.stringify to serialize Maps and Sets.
     * Converts Maps to plain objects and Sets to arrays.
     */
    if (value instanceof Map) return Object.fromEntries(value);
    if (value instanceof Set) return [...value];
    return value;
  }

  const blob = new Blob([JSON.stringify(data, replacer)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "graph.json";
  a.click();
  URL.revokeObjectURL(url);
}

function preProcessData(fileData) {
  data = {};
  data.filterDefaults = new Map();  // used as template for each layout
  cache = {initialized: false};

  function getDefaultFilterObject() {
    let obj = {
      active: FILTERS_ACTIVE_PER_DEFAULT,
      lowerThreshold: Infinity,
      upperThreshold: -Infinity,
      isInverted: false,
      isCategory: false,
      categories: new Set(),
    };
    for (let group of traverseBubbleSets()) {
      obj[`${group}Members`] = new Set();
      obj[`${group}MembersHidden`] = new Set();
      obj[`${group}IDs`] = new Set();
      obj[`${group}IDsHidden`] = new Set();
    }
    return obj
  }

  function populateFilterPropsLowsAndHighs(propHash, nodeOrEdgeValue) {
    if (!data.filterDefaults.get(propHash)) {
      data.filterDefaults.set(propHash, getDefaultFilterObject());
    }

    if (nodeOrEdgeValue === "") {
      return
    }

    if (isNaN(nodeOrEdgeValue)) {
      if (data.filterDefaults.get(propHash).lowerThreshold !== Infinity) {
        let [section, subSection, prop] = decodePropHashId(propHash);
        warning(`Property ${prop} (section ${section} sub-section ${subSection} contains both numeric and 
        categorical values. To proceed, please use a single data type. Property has been excluded.`);
        data.filterDefaults.delete(propHash);
        return
      }
      data.filterDefaults.get(propHash).isCategory = true;
      data.filterDefaults.get(propHash).categories.add(nodeOrEdgeValue);
      return
    }

    data.filterDefaults.get(propHash).lowerThreshold = Math.min(nodeOrEdgeValue, data.filterDefaults.get(propHash).lowerThreshold);
    data.filterDefaults.get(propHash).upperThreshold = Math.max(nodeOrEdgeValue, data.filterDefaults.get(propHash).upperThreshold);
  }

  cache.showNodeLabelsAndHoverEffect = fileData.nodes.length <= MAX_NODES_BEFORE_HIDING_LABELS_AND_HOVER_EFFECT;
  cache.nodePositionsFromExcelImport = new Map();

  if (!cache.showNodeLabelsAndHoverEffect) {
    warning(`Large graph with ${fileData.nodes.length} nodes detected. Labels and hover effects are disabled to improve performance. The network is hidden by default - toggle filters to display the nodes.`);
    FILTERS_ACTIVE_PER_DEFAULT = false;
  }

  // takes excel header and pre-populates data.filterDefaults to maintain order
  if (fileData.nodeDataHeaders) {
    for (const nodeHeader of fileData.nodeDataHeaders) {
      const nodePropHash = generatePropHashId(EXCEL_NODE_HEADER, nodeHeader.subGroup, nodeHeader.key);
      data.filterDefaults.set(nodePropHash, getDefaultFilterObject());
    }
  }
  if (fileData.edgeDataHeaders) {
    for (const edgeHeader of fileData.edgeDataHeaders) {
      const edgePropHash = generatePropHashId(EXCEL_EDGE_HEADER, edgeHeader.subGroup, edgeHeader.key);
      data.filterDefaults.set(edgePropHash, getDefaultFilterObject());
    }
  }

  data.nodes = fileData.nodes.map((node) => {
    const nodeFeatures = new Set();
    const nodeFeatureValues = new Map();
    const nodeFeatureWithinThreshold = new Map();

    for (let [section, subsection, prop, data] of traverseD4Data(node)) {
      let propId = generatePropHashId(section, subsection, prop);
      nodeFeatures.add(propId);

      if (isNaN(data)) {
        if (!nodeFeatureValues.has(propId)) {
          nodeFeatureValues.set(propId, new Set());
        }
        nodeFeatureValues.get(propId).add(data);
      } else {
        nodeFeatureValues.set(propId, data);
      }
      nodeFeatureWithinThreshold.set(propId, null);
      populateFilterPropsLowsAndHighs(propId, data);
    }

    if (node.style?.x && node.style?.y) {
      cache.nodePositionsFromExcelImport.set(node.id, {x: node.style.x, y: node.style.y});
    }

    const nodie = {
      ...node,
      ...getNodeStyleOrDefaults(node),
      features: nodeFeatures,
      featureValues: nodeFeatureValues,
      featureIsWithinThreshold: nodeFeatureWithinThreshold,
    };
    return nodie;
  });

  data.edges = fileData.edges.map((edge) => {
    const edgeFeatures = new Set();
    const edgeFeatureValues = new Map();
    const edgeFeatureWithinThreshold = new Map();

    for (let [section, subsection, prop, data] of traverseD4Data(edge)) {
      let propId = generatePropHashId(section, subsection, prop);
      edgeFeatures.add(propId);
      if (isNaN(data)) {
        if (!edgeFeatureValues.has(propId)) {
          edgeFeatureValues.set(propId, new Set());
        }
        edgeFeatureValues.get(propId).add(data);
      } else {
        edgeFeatureValues.set(propId, data);
      }
      edgeFeatureWithinThreshold.set(propId, null);
      populateFilterPropsLowsAndHighs(propId, data);
    }

    return {
      ...edge,
      ...getEdgeStyleOrDefaults(edge),
      features: edgeFeatures,
      featureValues: edgeFeatureValues,
      featureIsWithinThreshold: edgeFeatureWithinThreshold,
    }
  });

  // option to re-configure bubble set styles per model if wanted
  data.bubbleSetStyle = fileData.bubbleSetStyle || DEFAULTS.BUBBLE_SET_STYLE;

  // currently selected layout
  data.selectedLayout = fileData.selectedLayout || DEFAULTS.LAYOUT;

  // create individual map for each layout, no matter if default or manual, with positions, current filters, ..
  if (fileData.layouts) {
    data.layouts = parseLayouts(fileData.layouts);
  } else {
    data.layouts = Object.keys(DEFAULTS.LAYOUT_INTERNALS).reduce((acc, key) => {
      if (data?.layouts?.[key]) {
        warning("Layout with key '" + key + "' already exists.");
        return acc;
      } else {
        acc[key] = createDefaultLayout(key);
        return acc;
      }
    }, {});
  }

  if (fileData.stash) {
    data.stash = new Map(
      Object.entries(fileData.stash || {}).map(([key, value]) => [
        key,
        {
          ...value,
          ...parseGroups(value),
        },
      ])
    );
    data.stash.triggered = true;
  }

  console.log("Done pre-processing data");
}

function createCache() {
  cache.initialized = true;

  cache.nodeRef = new Map();
  cache.edgeRef = new Map();
  cache.toolTips = new Map();

  cache.propIDs = new Set();
  cache.activeProps = new Set();
  cache.nodeExclusiveProps = new Set();
  cache.edgeExclusiveProps = new Set();
  cache.mixedProps = new Set();

  cache.propToNodes = new Map();
  cache.propToNodeIDs = new Map();
  cache.propToEdges = new Map();
  cache.propToEdgeIDs = new Map();
  cache.nodeIDToEdgeIDs = new Map();
  cache.edgeIDToNodeIDs = new Map();

  cache.propIDToDropdownChecklists = new Map();
  cache.propIDToInvertibleRangeSliders = new Map();

  cache.initialNodePositions = new Map();
  cache.lastBubbleSetMembers = new Map();

  cache.nodeIDsToBeShown = new Set();
  cache.propIDsToNodeIDsToBeShown = new Map();
  cache.edgeIDsToBeShown = new Set();
  cache.propIDsToEdgeIDsToBeShown = new Map();

  cache.selectedNodes = new Set();
  cache.selectedEdges = new Set();

  cache.selectionMemory = [{nodes: [], edges: []}];
  cache.selectedMemoryIndex = 0;

  cache.hiddenDanglingNodeIDs = new Set();
  cache.hiddenDanglingEdgeIDs = new Set();

  cache.query = "";
  cache.uniquePropHierarchy = {};
  cache.queryValidated = false;
  cache.queryFilter = null;
  cache.instructions = null;

  function populateUniquePropGroups(propHash) {
    const [mainGroup, subGroup, prop] = decodePropHashId(propHash);
    if (!cache.uniquePropHierarchy[mainGroup]) {
      cache.uniquePropHierarchy[mainGroup] = {};
    }

    if (!cache.uniquePropHierarchy[mainGroup][subGroup]) {
      cache.uniquePropHierarchy[mainGroup][subGroup] = new Set();
    }

    cache.uniquePropHierarchy[mainGroup][subGroup].add(prop);
  }

  for (let group of traverseBubbleSets()) {
    cache.lastBubbleSetMembers.set(group, new Set());
  }

  data.nodes.forEach((node) => {
    cache.nodeRef.set(node.id, node);
    cache.toolTips.set(node.id, buildToolTipText(node.id, false));
    for (let prop of node.features) {
      populateUniquePropGroups(prop);
      if (!cache.propToNodes.has(prop)) cache.propToNodes.set(prop, new Set());
      if (!cache.propToNodeIDs.has(prop)) cache.propToNodeIDs.set(prop, new Set());
      cache.propToNodes.get(prop).add(node);
      cache.propToNodeIDs.get(prop).add(node.id);
      cache.nodeExclusiveProps.add(prop);
      cache.propIDs.add(prop);
    }
  });

  data.edges.forEach((edge) => {
    cache.edgeRef.set(edge.id, edge);
    cache.toolTips.set(edge.id, buildToolTipText(edge.id, true));
    for (let prop of edge.features) {
      populateUniquePropGroups(prop);
      if (!cache.propToEdges.has(prop)) cache.propToEdges.set(prop, new Set());
      if (!cache.propToEdgeIDs.has(prop)) cache.propToEdgeIDs.set(prop, new Set());
      cache.propToEdges.get(prop).add(edge);
      cache.propToEdgeIDs.get(prop).add(edge.id);
      if (cache.nodeExclusiveProps.has(prop)) {
        cache.nodeExclusiveProps.delete(prop);
        cache.mixedProps.add(prop);
      } else {
        cache.edgeExclusiveProps.add(prop);
      }
      cache.propIDs.add(prop);
    }

    if (!cache.nodeIDToEdgeIDs.has(edge.source)) cache.nodeIDToEdgeIDs.set(edge.source, new Set());
    if (!cache.nodeIDToEdgeIDs.has(edge.target)) cache.nodeIDToEdgeIDs.set(edge.target, new Set());
    if (!cache.edgeIDToNodeIDs.has(edge.id)) cache.edgeIDToNodeIDs.set(edge.id, new Set());
    cache.nodeIDToEdgeIDs.get(edge.source).add(edge.id);
    cache.nodeIDToEdgeIDs.get(edge.target).add(edge.id);
    cache.edgeIDToNodeIDs.get(edge.id).add(edge.source);
    cache.edgeIDToNodeIDs.get(edge.id).add(edge.target);
  });
}

function clearActivePropsCacheOnLayoutChange() {
  cache.activeProps = new Set();
  for (const [key, value] of data.layouts[data.selectedLayout].filters.entries()) {
    if (value.active) {
      cache.activeProps.add(key);
    }
  }
}

function buildToolTipText(nodeOrEdgeID, isEdge) {
  const item = isEdge ? cache.edgeRef.get(nodeOrEdgeID) : cache.nodeRef.get(nodeOrEdgeID);
  const label = item.label && item.label !== item.id ? `${item.label}<br><small>${item.id}</small>` : item.id;
  let tooltip = `<h3><span class="purple">${isEdge ? "Edge" : "Node"}</span> <span class="red">${label}</span></h3>`;

  if (item.description) {
    tooltip += `<p class="tooltip-description">${item.description}</p>`;
  }
  if (!item.D4Data) return tooltip;

  const sortedPropIDs = SORT_TOOLTIPS
    ? [...data.filterDefaults.keys()].sort()
    : [...data.filterDefaults.keys()];

  // ------------------
  // 1) Collect data into a structure grouped by (section, subSection)
  // ------------------
  const structuredData = [];

  /**
   * Ensures a section object and subSection array exist, then pushes a property item.
   */
  function pushSubSectionProperty(secName, subName, prop, val) {
    let sectionObj = structuredData.find(s => s.section === secName);
    if (!sectionObj) {
      sectionObj = {section: secName, subSections: []};
      structuredData.push(sectionObj);
    }
    let subObj = sectionObj.subSections.find(sub => sub.name === subName);
    if (!subObj) {
      subObj = {name: subName, props: []};
      sectionObj.subSections.push(subObj);
    }
    subObj.props.push({key: prop, value: val});
  }

  // Gather valid properties, grouped
  for (const propID of sortedPropIDs) {
    const [section, subSection, property] = decodePropHashId(propID);
    const rawValue = item.D4Data?.[section]?.[subSection]?.[property];
    if (rawValue === undefined) continue;
    if (TOOLTIP_HIDE_NULL_VALUES && rawValue === 0) continue;

    const displayValue = isNaN(rawValue)
      ? rawValue
      : formatNumber(rawValue, FILTER_VISUAL_FLOAT_PRECISION);

    pushSubSectionProperty(section, subSection, property, displayValue);
  }

  // ------------------
  // 2) Sort properties within each subSection if needed (SORT_TOOLTIPS)
  // ------------------
  if (SORT_TOOLTIPS) {
    for (const sec of structuredData) {
      for (const sub of sec.subSections) {
        sub.props.sort((a, b) => a.key.localeCompare(b.key));
      }
    }
  }

  // ------------------
  // 3) Flatten each {section, subSections} into an array while preserving order
  // ------------------
  const orderedBlocks = [];
  for (const s of structuredData) {
    orderedBlocks.push({type: "section", text: s.section});
    for (const sb of s.subSections) {
      orderedBlocks.push({type: "subSection", section: s.section, text: sb.name, props: sb.props});
    }
  }

  // If we have nothing to show, return the basic tooltip
  if (orderedBlocks.length === 0) return tooltip;

  // ------------------
  // 4) Distribute these blocks into columns, left to right, preserving order
  // ------------------
  const columns = [];
  const columnSize = Math.ceil(orderedBlocks.length / TOOLTIP_MAX_COLUMNS);

  for (let i = 0; i < TOOLTIP_MAX_COLUMNS; i++) {
    const start = i * columnSize;
    const end = start + columnSize;
    columns.push(orderedBlocks.slice(start, end));
  }

  // ------------------
  // 5) Build the tooltip HTML
  // ------------------
  tooltip += `<hr><div class="tooltip-columns">`;

  for (const col of columns) {
    tooltip += `<div class="tooltip-column">`;

    let startedList = false;
    for (const block of col) {
      if (block.type === "section") {
        // Close a list if it's open before starting a new section
        if (startedList) {
          tooltip += `</ul>`;
          startedList = false;
        }
        // tooltip += `<h3 class="tooltip-section">${block.text}</h3>`;
      } else if (block.type === "subSection") {
        if (startedList) {
          tooltip += `</ul>`;
          startedList = false;
        }
        tooltip += `<h5 class="tooltip-sub-section">${block.text}</h5><ul>`;
        startedList = true;
        // Properties for this subSection
        for (const propItem of block.props) {
          tooltip += `<li>${propItem.key}: <span class="red"><b>${propItem.value}</b></span></li>`;
        }
      }
    }

    if (startedList) {
      tooltip += `</ul>`;
    }
    tooltip += `</div>`;
  }

  tooltip += `</div>`;
  return tooltip;
}

function encodeQuery(asciiStr) {
  cache.queryValidated = true;

  const space = `<span class='q-space' data-encoded> </span>`

  /* ------------------------------------------------------------------ */
  /* 1. Property names (main group::sub group::property)                */
  /* ------------------------------------------------------------------ */
  asciiStr = asciiStr.replace(
    /(Node filters|Edge filters)::([^:]+)::([^:]+)(?=\s(?:IN|BETWEEN|LOWER\sTHAN|\)))/g,
    (match, mainGroup, subGroup, prop) => {
      const mgok = mainGroup in cache.uniquePropHierarchy;
      const sgok = mgok && (subGroup in cache.uniquePropHierarchy[mainGroup]);
      const pok = sgok && cache.uniquePropHierarchy[mainGroup][subGroup].has(prop);

      const mainGroupEncoded = `<span class="${mgok ? 'q-maingroup' : 'q-error-unrecognized'}" data-encoded>${mainGroup}</span>`;
      const subGroupEncoded = `<span class="${sgok ? 'q-subgroup' : 'q-error-unrecognized'}" data-encoded>${subGroup}</span>`;
      const propEncoded = `<span class="${pok ? 'q-property' : 'q-error-unrecognized'}" data-encoded>${prop}</span>`;
      const sep = `<span class="q-prop-group-separator" data-encoded>::</span>`;

      return `<span class="q-property-wrapper" data-encoded>`
        + mainGroupEncoded + sep
        + subGroupEncoded + sep
        + propEncoded
        + `</span>`;
    }
  );

  /* ------------------------------------------------------------------ */
  /* 2. Keyword highlighting and encapsulated numbers                   */
  /* ------------------------------------------------------------------ */

  /* 5-1  "BETWEEN X AND Y" --------- */
  asciiStr = asciiStr.replace(
    /(BETWEEN)\s+(-?\d+(?:\.\d+)?)\s+(AND)\s+(-?\d+(?:\.\d+)?)/gi,
    (_m, betweenKw, low, andKw, high) =>
      `<span class='q-kw-between' data-encoded>${betweenKw}</span>`
      + space
      + `<span class='q-number' data-encoded>${low}</span>`
      + space
      + `<span class='q-kw-between-and' data-encoded>${andKw}</span>`
      + space
      + `<span class='q-number' data-encoded>${high}</span>`
  );

  /* 5-2  "LOWER THAN X OR GREATER THAN Y" --------- */
  asciiStr = asciiStr.replace(
    /(LOWER THAN)\s+(-?\d+(?:\.\d+)?)\s+(OR GREATER THAN)\s+(-?\d+(?:\.\d+)?)/gi,
    (_m, lowerThanKw, low, andGreaterThanKw, high) =>
      `<span class='q-lower-than' data-encoded>${lowerThanKw}</span>`
      + space
      + `<span class='q-number' data-encoded>${low}</span>`
      + space
      + `<span class='q-or-greater-than' data-encoded>${andGreaterThanKw}</span>`
      + space
      + `<span class='q-number' data-encoded>${high}</span>`
  );

  /* ------------------------------------------------------------------ */
  /* 3. List-Categories after "IN [" up to "]"                          */
  /* ------------------------------------------------------------------ */
  asciiStr = asciiStr.replace(/IN\s*\[([^\]]*?)]/g, (_match, list) => {
      const encodedCategories = list
        .split(",")
        .map(cat => `<span class='q-string' data-encoded>${cat}</span>`)
        .join(`<span class='q-comma' data-encoded>,</span>`);

      return [
        `<span class='q-in-cat-bracket-open' data-encoded>IN${space}[</span>`,
        encodedCategories,
        `<span class='q-cat-bracket-close' data-encoded>]</span>`
      ].join("");
    }
  );

  /* ------------------------------------------------------------------ */
  /* 4.  Top-level connectors  ") OR ("  /  ") AND ("  /  ") NOT ("     */
  /* ------------------------------------------------------------------ */
  const connectorOpeningBracket = `<span class='q-connector-opening-bracket' data-encoded>(</span>`;
  const connectorClosingBracket = `<span class='q-connector-closing' data-encoded>)</span>`;

  asciiStr = asciiStr.replace(
    /\)\s*(OR|AND|NOT)\s*\(/gi,
    (_m, connector) =>
      connectorClosingBracket
      + `<span class='q-connector-${connector.toLowerCase()}' data-encoded>`
      + '&nbsp;'
      + connector.toUpperCase()
      + '&nbsp;'
      + `</span>`
      + connectorOpeningBracket
  );

  /* ------------------------------------------------------------------ */
  /* 5. Brackets with depth tracking                                    */
  /* ------------------------------------------------------------------ */
  function findUnmatchedBracketIndices(str) {
    const stack = [];
    const unmatched = new Set();

    for (let i = 0; i < str.length; ++i) {
      const ch = str[i];
      if (ch === '(') {
        stack.push(i);
      } else if (ch === ')') {
        if (stack.length) {
          stack.pop();
        } else {
          // “)” without a matching “(”
          unmatched.add(i);
        }
      }
    }

    stack.forEach(idx => unmatched.add(idx));
    return unmatched;
  }

  let bracketLevel = 0;
  const unmatched = findUnmatchedBracketIndices(asciiStr);
  if (unmatched.size) {
    cache.queryValidated = false;
  }

  asciiStr = [...asciiStr]
    .map((ch, i) => {
      if (ch === '(') {
        bracketLevel++;
        const lvl = Math.min(bracketLevel, 5);
        const cls = [
          `q-bracket-open-lvl-${lvl}`,
          unmatched.has(i) ? 'q-error-unmatched-opening-bracket' : ''
        ].join(' ');
        return `<span class='${cls.trim()}' data-encoded>(</span>`;
      }

      if (ch === ')') {
        const lvl = Math.min(bracketLevel, 5);
        const cls = [
          `q-bracket-close-lvl-${lvl}`,
          unmatched.has(i) ? 'q-error-unmatched-closing-bracket' : ''
        ].join(' ');
        const html = `<span class='${cls.trim()}' data-encoded>)</span>`;
        bracketLevel = Math.max(bracketLevel - 1, 0);
        return html;
      }

      return ch;
    })
    .join('');

  // ------------------------------------------------------------------
  // 6. substitute &nbsp; with the space span (important for copy/paste)
  // ------------------------------------------------------------------
  asciiStr = asciiStr
    // split into “already encoded” vs “plain” parts
    .split(/(<span\b[^>]*data-encoded[^>]*>[\s\S]*?<\/span>)/g)
    .map(chunk => {
      // keep every part that is already marked as encoded
      if (chunk.startsWith('<span') && chunk.includes('data-encoded')) {
        return chunk;
      }
      // in all other chunks replace real blanks, NBSP (char 160) and “&nbsp;”
      // with the standard encoded-space element
      return chunk
        .replace(/&nbsp;|\u00a0| /g, space);
    })
    .join('');

  // ------------------------------------------------------------------
  // 7. wrap everything not already in a <span class='q-…'>…</span> as an error
  // ------------------------------------------------------------------
  asciiStr = asciiStr
    // split out only the already‐encoded chunks vs everything else
    .split(/(<span\b[^>]*data-encoded[^>]*>[\s\S]*?<\/span>)/g)
    .map(chunk => {
      // if it’s one of our data-encoded spans, keep it
      if ((chunk.startsWith('<span') && chunk.includes('data-encoded'))
        || chunk === "" || chunk === "</span> " || chunk === "</span>" || chunk === "[</span>") {
        return chunk;
      }

      cache.queryValidated = false;
      return chunk.replace(/\S+/g, txt =>
        `<span class="q-error-unrecognized">${txt}</span>`
      );
    })
    .join('');


  const updateQueryBtn = document.getElementById("queryUpdateBtn");
  if (cache.queryValidated) {
    updateQueryBtn.classList.remove("disabled");
  } else {
    updateQueryBtn.classList.add("disabled");
  }

  return asciiStr;
}

function updateQueryTextArea() {
  // TODO: make sure all updateQueryTextArea calls are proper
  // 1. should be called once on graph load
  // 2. should be modified when UI elements change
  // 3. maybe its not necessary to call it from preRenderEvent ?
  const query = document.getElementById("queryTextArea");
  query.innerHTML = "";
  let tmp = "";

  let queryEntries = [];
  for (const [propID, fo] of data.layouts[data.selectedLayout].filters.entries()) {
    if (fo.active) {
      if (fo.isCategory) {
        queryEntries.push(`${propID} IN [${[...fo.categories].map(cat => cat).join(",")}]`);
      } else if (fo.isInverted) {
        queryEntries.push(`${propID} LOWER THAN ${fo.upperThreshold} OR GREATER THAN ${fo.lowerThreshold}`);
      } else {
        queryEntries.push(`${propID} BETWEEN ${fo.lowerThreshold} AND ${fo.upperThreshold}`);
      }
    }
  }

  if (queryEntries.length > 0) {
    tmp += "(";
    tmp += queryEntries.join(") OR (");
    tmp += ")";
  }
  query.innerHTML = encodeQuery(tmp);

}

function getCursorPosition() {
  const sel = document.getSelection();
  sel.modify("extend", "backward", "paragraphboundary");
  const pos = sel.toString().length;
  if (sel.anchorNode !== null && sel.anchorNode !== undefined) sel.collapseToEnd();

  return pos;
}

function setCursorPosition(containerEl, charIndex) {
  charIndex = Math.max(0, Math.min(charIndex, containerEl.textContent.length));

  const range = document.createRange();
  const walker = document.createTreeWalker(containerEl, NodeFilter.SHOW_TEXT, null, false);

  let currentNode;
  let remaining = charIndex;

  while ((currentNode = walker.nextNode())) {
    if (remaining <= currentNode.length) {
      range.setStart(currentNode, remaining);
      range.collapse(true);
      break;
    }
    remaining -= currentNode.length;
  }

  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

function handleQueryValidationEvent() {
  const query = document.getElementById("queryTextArea");
  const btn = document.getElementById("queryUpdateBtn");
  const caretPosition = getCursorPosition();

  query.innerHTML = encodeQuery(query.textContent);
  setCursorPosition(query, caretPosition);
  if (cache.queryValidated) {
    btn.classList.remove("disabled");
  } else {
    btn.classList.add("disabled");
  }
}

function handleQueryUpdateEvent() {
  handleFilterEvent("Updating Graph from Query", queryTextArea.textContent);
  updateUIFromQueryInstructions();
}

/**
 * Turn the HTML produced by `encodeQuery()` back into a nested data
 * structure that mirrors the original logical expression.
 *
 * Returned format (simplified):
 * [
 *   {type: 'property', main:'Node filters', sub:'Label', prop:'name'},
 *   {type: 'KW', value: 'BETWEEN'},
 *   {type: 'NUM', value: 10},
 *   {type: 'KW', value: 'AND'},
 *   {type: 'NUM', value: 20},
 *   'AND',
 *   [                                    // ← nested group (brackets)
 *     {type:'property', …},
 *     'OR',
 *     {type:'property', …}
 *   ]
 * ]
 *
 * The tree can afterwards be compiled into any instruction format you need.
 */
function decodeQuery(queryHTML) {
  /* -------------------------------------------------------------
   * 1.  DOM → token list
   * ----------------------------------------------------------- */
  const tokens = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${queryHTML}</div>`, 'text/html');
  const root = doc.body.firstElementChild;        // wrapper <div>

  // helper: map CSS classes → token factory
  const classMap = {
    // connectors
    'q-connector-or': () => 'OR',
    'q-connector-and': () => 'AND',
    'q-connector-not': () => 'NOT',

    // brackets
    'q-bracket-open-lvl-1': () => ({type: '(', value: '('}),
    'q-bracket-open-lvl-2': () => ({type: '(', value: '('}),
    'q-bracket-open-lvl-3': () => ({type: '(', value: '('}),
    'q-bracket-open-lvl-4': () => ({type: '(', value: '('}),
    'q-bracket-open-lvl-5': () => ({type: '(', value: '('}),
    'q-bracket-close-lvl-1': () => ({type: ')', value: ')'}),
    'q-bracket-close-lvl-2': () => ({type: ')', value: ')'}),
    'q-bracket-close-lvl-3': () => ({type: ')', value: ')'}),
    'q-bracket-close-lvl-4': () => ({type: ')', value: ')'}),
    'q-bracket-close-lvl-5': () => ({type: ')', value: ')'}),

    // numbers & keywords
    'q-number': el => ({type: 'NUM', value: Number(el.textContent)}),
    'q-kw-between': () => ({type: 'KW', value: 'BETWEEN'}),
    'q-kw-between-and': () => ({type: 'KW', value: 'AND'}),
    'q-lower-than': () => ({type: 'KW', value: 'LOWER THAN'}),
    'q-or-greater-than': () => ({type: 'KW', value: 'OR GREATER THAN'}),
    'q-in-cat-bracket-open': () => ({type: 'KW', value: 'IN ['}),

    // category strings
    'q-string': el => ({type: 'STR', value: el.textContent}),

    // whole property path (“A::B::C”)
    'q-property-wrapper': el => {
      const [main, sub, prop] = el.textContent.split('::');
      return {type: 'property', main, sub, prop, propID: el.textContent};
    }
  };

  // depth-first walk
  function walk(node) {
    // ignore plain text / spaces
    if (node.nodeType === Node.TEXT_NODE) {
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      for (const cls of node.classList) {
        if (classMap[cls]) {
          const t = classMap[cls](node);
          if (t !== undefined) tokens.push(t);
          // stop after first recognised class
          break;
        }
      }
    }

    node.childNodes.forEach(walk);
  }

  walk(root);

  /* -------------------------------------------------------------
   * 2.  Token list → nested groups     (recursive-descent)
   * ----------------------------------------------------------- */
  function readGroup(idx = 0) {
    const group = [];

    while (idx < tokens.length) {
      const tok = tokens[idx];

      if (tok.type === ')') {               // end of this group
        return [group, idx + 1];
      }

      if (tok.type === '(') {               // begin sub-group
        const [subGroup, next] = readGroup(idx + 1);
        group.push(subGroup);
        idx = next;
        continue;
      }

      group.push(tok);
      idx += 1;
    }

    return [group, idx];                    // top-level done
  }

  const [instructions] = readGroup();       // start at index 0
  return instructions;
}

function updateUIFromQueryInstructions() {
  function handleInstruction(obj) {
    if (obj.constructor === Array) {
      if (obj[0].constructor === Object && obj[0].type === "property") {

        // normal slider
        if (obj[1].type === "KW" && obj[1].value === "BETWEEN") {
          checkCheckbox(obj[0].propID, true);
          cache.propIDToInvertibleRangeSliders.get(obj[0].propID).setTo(obj[2].value, obj[4].value, false);
        }

        // inverted slider
        else if (obj[1].type === "KW" && obj[1].value === "LOWER THAN") {
          checkCheckbox(obj[0].propID, true);
          cache.propIDToInvertibleRangeSliders.get(obj[0].propID).setTo(obj[2].value, obj[4].value, true);
        }

        // category
        else if (obj[1].type === "KW" && obj[1].value === "IN [") {
          checkCheckbox(obj[0].propID, true);
          const dropdown = cache.propIDToDropdownChecklists.get(obj[0].propID);
          dropdown.deselectAllCategories(true);
          for (const dropdownElem of obj) {
            if (dropdownElem.type === "STR") {
              dropdown.selectCategory(dropdownElem.value);
            }
          }
        }
      } else {
        // nested instruction
        for (const nestedInst of obj) {
          handleInstruction(nestedInst);
        }
      }
    }
  }

  uncheckAllCheckboxes();
  for (const inst of cache.instructions) {
    handleInstruction(inst);
  }
}

function humanFileSize(size) {
  let i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return +((size / Math.pow(1024, i)).toFixed(2)) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

function loadFileWrapper(event) {
  let file = event.target.files[0];
  showLoading("Loading", `Loading ${file.name} (${file.type} with ${humanFileSize(file.size)})`);
  setTimeout(() => {
    loadFile(event)
      .then((fileData) => {
        if (!fileData) {
          hideLoading();
          return;
        }

        preProcessData(fileData);
        createCache();
        buildUI();
        createGraphInstance();
        updateQueryTextArea();

        graph.render().then(r => {
          console.log("Initial graph rendered");
          persistPositionsUpdateDataAndReDrawGraph();
          saveFiltersToStash(false);
          hideLoading();
        });

        registerHotkeyEvents();
      })
      .catch((error) => {
        alert(`Error loading graph: ${error}`);
        hideLoading();
      })
      .finally(() => {
        hideLoading();
      });
  }, 20);

}

function registerHotkeyEvents() {
  document.addEventListener('keydown', (event) => {
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
        exportPNG();
        break;
      case "s":
        exportGraphAsJSON();
        break;
      case "r":
        resetLayout();
        break;
      case "f":
        graph.fitView();
        break;
      case "e":
        document.getElementById('editBtn').click();
        break;
      default:
        break;
    }
  });
}

function resetLayout() {
  if (data.layouts[data.selectedLayout].isCustom) {
    alert("Cannot reset custom layout.");
    return false;
  }

  data.layouts[data.selectedLayout]?.positions?.clear();
  graph.updateData(createSimplifiedDataForGraphObject(true));
  let layout = data.layouts[data.selectedLayout];
  if (!layout.isCustom) {
    graph.setLayout({type: data.selectedLayout, ...layout.internals});
  }
  graph.render().then(r => console.log(`Resetted layout ${data.selectedLayout}`));
}

function exportPNG() {
  // https://g6.antv.antgroup.com/en/api/reference/g6/dataurloptions#properties
  showLoading("Loading", "Generating picture data");

  graph.toDataURL({
    type: "image/png", mode: "viewport"
  }).then((imageData) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = 'graph.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  hideLoading();
}

function showLoading(header, text = "", invisible = false, autoFade = false) {
  const overlay = document.getElementById('loadingOverlay');
  overlay.style.display = 'flex';

  // timeout is required to trigger transition; otherwise, because of style.display='flex', the transition is skipped
  setTimeout(() => {
    overlay.style.opacity = invisible ? '0' : '1';
  }, 5);

  document.getElementById('loadingHeader').textContent = header;
  document.getElementById('loadingText').textContent = text;

  setTimeout(() => {
    let logInfo = header;
    if (text) logInfo += `: ${text}`;
    console.log(logInfo);
  }, 25);

  if (autoFade) {
    setTimeout(() => {
      hideLoading();
    }, 1000);
  }

  // refreshUI();
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  overlay.style.opacity = '0';

  setTimeout(() => {
    overlay.style.display = 'none';
  }, 200);

  refreshUI();
}

document.addEventListener('DOMContentLoaded', async () => {
  hideLoading();
});

function refreshUI() {
  if (!cache.initialized) return;

  const loadFromStashBtn = document.getElementById("loadFromStashBtn");
  data.stash?.triggered ? loadFromStashBtn.classList.remove("disabled") : loadFromStashBtn.classList.add("disabled");

  toggleStyleElementsThatRequireAtLeastOneVisibleNode(cache.nodeIDsToBeShown.size > 0);
  toggleStyleElementsThatRequireAtLeastOneVisibleEdge(cache.edgeIDsToBeShown.size > 0);
  toggleStyleElementsThatRequireAtLeastOneVisibleNodeOrEdge(cache.nodeIDsToBeShown.size > 0 || cache.edgeIDsToBeShown.size > 0);

  document.getElementById("visibleNodes").innerHTML = `${cache.nodeIDsToBeShown.size - cache.hiddenDanglingNodeIDs.size}`;
  document.getElementById("totalNodes").innerHTML = `${data.nodes.length}`;
  document.getElementById("visibleEdges").innerHTML = `${cache.edgeIDsToBeShown.size - cache.hiddenDanglingEdgeIDs.size}`;
  document.getElementById("totalEdges").innerHTML = `${data.edges.length}`;
}

// window.addEventListener('resize', () => {
//   if (graph !== null) {
//
//   }
// })

function logMessage(text, colorClass, bold = false) {
  if (!didShowAnyStatusMessage) didShowAnyStatusMessage = true;

  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const timestamp = `${hh}:${mm}:${ss}`;

  const container = document.getElementById('sidebarStatusContainer');
  container.style.height = "8%";

  const p = document.createElement('p');
  p.style.margin = "0 0 1px 0";

  const spanTime = document.createElement('span');
  spanTime.textContent = `${timestamp} | `;
  spanTime.classList.add("grey");
  p.appendChild(spanTime);

  const spanText = document.createElement('span');
  spanText.classList.add(colorClass);
  spanText.style.fontWeight = bold ? "bold" : "normal";
  spanText.textContent = text;
  p.appendChild(spanText);

  container.appendChild(p);
  container.scrollTop = container.scrollHeight;
}

function info(message) {
  logMessage(message, "black");
}

function warning(message) {
  logMessage(message, "orange");
}

function error(message) {
  logMessage(message, "red", true);
}

function success(message) {
  logMessage(message, "green");
}

function debug(message) {
  logMessage(message, "grey");
}


function debugQuery(query) {
  document.getElementById("queryTextArea").textContent = query;
  handleQueryValidationEvent();
  handleQueryUpdateEvent();
}

function fooDebug() {
  document.getElementById("queryTextArea").textContent = "(((Node filters::group A::my first numerical node property LOWER THAN 0.261051 OR GREATER THAN 0.46391) AND (Node filters::group A::my first categorical node property IN [bar])) OR (Node filters::group B::my second numerical node property BETWEEN -0.5 AND 2)) OR ((Edge filters::group X::my first numerical edge property BETWEEN 0.5 AND 1.3) NOT (Edge filters::group Y::my second numerical edge property BETWEEN 0 AND 2))";
  handleQueryValidationEvent();
  handleQueryUpdateEvent();
  console.log("DONE");
}

function debugPrintPropMaps() {
  for (const [k, v] of cache.propToNodeIDs.entries()) {
    console.log(`Node Property: "${k}" || Nodes: "${[...v].join('","')}"`);
  }
  for (const [k, v] of cache.propToEdgeIDs.entries()) {
    console.log(`Edge Property: "${k}" || Edges: "${[...v].join('","')}"`);
  }
}