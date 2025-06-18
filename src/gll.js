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
    await graph.updateNodeData(myNodes);
    return {
      nodes: myNodes,
    };
  }
}

register(ExtensionCategory.LAYOUT, 'custom', CustomForceLayout);

// graph.setLayout({type: 'custom'});
// persistNodePositions();
// handleFilterEvent("Custom", "foo");

// 1. load custom file
// 2. drag node
// 3. switch to force layout
// 4. that dragged node is somewhere it shouldnt be

/**
 *  Essential objects
 */
/* @type {import('@antv/g6').Graph","null} */
// The G6 graph object
let graph = null;

// Stores json serializable data that is essential to reconstruct the graph
let data = {};

// Stores query related elements (text & overlay), AST, status about validity, widths, ..
let query = {
  valid: false,
  ast: null,
  text: null,
  overlay: null,
  caret: null,
  editorDiv: null,
  lastGoodWidth: 0,
  sizeObserver: null,
  sizeChangeLocked: false
};

// Stores references to map IDs to node/edge objects that cannot (or are not necessary to) serialized to a json file
let cache = {
  initialized: false
};

let picker;

let debugEnabled = false;

let PERFORMANCE_MODE = false;

// Stores available network metrics and their calculation function references
const metrics = {
  centrality: {id: "centrality", label: "Degree Centrality", calculate: async () => await calculateDegreeCentrality()},
  betweenness: {
    id: "betweenness",
    label: "Betweenness Centrality",
    calculate: async () => await calculateBetweennessCentrality()
  },
  closeness: {
    id: "closeness",
    label: "Closeness Centrality",
    calculate: async () => await calculateClosenessCentrality()
  },
  eigenvector: {
    id: "eigenvector",
    label: "Eigenvector Centrality",
    calculate: async () => await calculateEigenvectorCentrality()
  },
  pagerank: {id: "pagerank", label: "PageRank", calculate: async () => await calculatePageRank()},
};

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

// If true, bubble groups avoid all non-bubble group members per default; overruled if network exceeds
// MAX_NODES_BEFORE_HIDING_LABELS_AND_HOVER_EFFECT
const AVOID_NON_BUBBLE_GROUP_MEMBERS = false;

// Maximum capacity of selection memory
const MAX_SELECTION_MEMORY = 10;

const NODE_CONNECTIVITY_METRICS_PRECISION = 5;

/**
 *  Excel-model import related properties
 */

// Header automatically assigned to properties without a group definition
const EXCEL_UNCATEGORIZED_SUBHEADER = "Uncategorized Properties";

// Node filter header
const EXCEL_NODE_HEADER = "Node filters";

// Edge filter header
const EXCEL_EDGE_HEADER = "Edge filters";

// Set to true in case original g6.min.js is used and issue #7195 is NOT resolved (https://github.com/antvis/G6/issues/7195)
const APPLY_BUBBLE_SET_HOTFIX = false;

// Set to true to use current filter configuration for pushing property to query editor, e.g. if slider is inverted
// false uses defaults (non-inverted) and min/max
const QUERY_BTN_USE_CURRENT_FILTER = true;

// The following constants define the columns in the Excel template for mapping node and edge properties
// allowed types: "str", "num", "bool", "rgba", "oneOf:a|b|c"
// @formatter:off
const EXCEL_NODE_PROPERTIES = [
  {column: "ID", type: "str", required: true},
  {column: "Label", type: "str", apply: (n, v) => {
    n.label = v;
    n.style.label = false;
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
    e.style.label = false;
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
      FOREGROUND_COLOR: "#000000", BACKGROUND: false, BACKGROUND_COLOR: null, BACKGROUND_RADIUS: 5,
      PADDING: 2, PLACEMENT: "bottom", FONT_SIZE: 12, CURSOR: "default", LINE_SPACING: 0, MAX_LINES: 1,
      MAX_WIDTH: "200%", TEXT_ALIGN: "middle", WORD_WRAP: false, Z_INDEX: 0, OFFSET_X: 0, OFFSET_Y: 0,
    },
  },
  EDGE: {
    COLOR: "#403C5390", LINE_WIDTH: 0.75, LINE_DASH: 0, TYPE: "line",
    ARROWS: {START: false, END: false, START_SIZE: 8, START_TYPE: "triangle", END_SIZE: 8, END_TYPE: "triangle"},
    LABEL: {
      TEXT: null, FOREGROUND_COLOR: "#000000", BACKGROUND: false, BACKGROUND_COLOR: null,
      BACKGROUND_CURSOR: "default", BACKGROUND_FILL_OPACITY: 1, BACKGROUND_RADIUS: 0, BACKGROUND_STROKE_OPACITY: 1,
      CURSOR: "default", FILL_OPACITY: 1, FONT_WEIGHT: "normal", MAX_LINES: 1, MAX_WIDTH: "80%", PADDING: 0,
      PLACEMENT: "center", FONT_SIZE: 12, AUTO_ROTATE: false, OFFSET_X: 4, OFFSET_Y: 0, TEXT_ALIGN: "left",
      TEXT_BASE_LINE: "middle", TEXT_OVERFLOW: "ellipsis", VISIBILITY: "visible", WORD_WRAP: false, OPACITY: 1,
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
  CUSTOM_LAYOUT_NAME: "custom",
  BUBBLE_GROUP_STYLE: {
    "groupOne": {
      fill: '#403C53',
      fillOpacity: 0.25,
      stroke: '#C33D35',
      strokeOpacity: 1,
      virtualEdges: true,
      labelFill: '#fff',
      labelPadding: 2,
      labelBackgroundFill: '#403C53',
      labelBackgroundRadius: 5,
      label: true,
      labelText: 'group one'
    },
    "groupTwo": {
      fill: '#c33d35',
      fillOpacity: 0.25,
      stroke: '#403c53',
      strokeOpacity: 1,
      virtualEdges: true,
      labelFill: '#fff',
      labelPadding: 2,
      labelBackgroundFill: '#c33d35',
      labelBackgroundRadius: 5,
      label: true,
      labelText: 'group two'
    },
    "groupThree": {
      fill: '#EFB0AA',
      fillOpacity: 0.4,
      stroke: '#8CA6D9',
      strokeOpacity: 1,
      virtualEdges: true,
      labelFill: '#fff',
      labelPadding: 2,
      labelBackgroundFill: '#EFB0AA',
      labelBackgroundRadius: 5,
      label: true,
      labelText: 'group three'
    },
    "groupFour": {
      fill: '#8CA6D9',
      fillOpacity: 0.4,
      stroke: '#EFB0AA',
      strokeOpacity: 1,
      virtualEdges: true,
      labelFill: '#fff',
      labelPadding: 2,
      labelBackgroundFill: '#8CA6D9',
      labelBackgroundRadius: 5,
      label: true,
      labelText: 'group four'
    },
  },
  BUBBLE_GROUP_QUADRANT_POSITIONS: {
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
  BEHAVIOURS: {
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
        debug("LASSO CANVAS CLICK");

        if (!APPLY_BUBBLE_SET_HOTFIX) return true;

        const selected = graph.getNodeData().filter(n => n.states?.includes("selected"));

        // the code below triggers a loading event instead of freezing the UI, but prevents the bubble-deselection ..
        // const selected = graph.getNodeData().filter(n => n.states?.includes("selected"));
        // if (selected.length > 0) {
        //   showLoading("Rendering", "Deselecting after lasso selection event");
        // }

        // TODO: this does not allow for consecutive lasso-selections without deselection
        if (selected.length !== 0) {
          debug("PREVENTING LASSO DESELECT EVENT BY REMOVING CANVAS CLICK EVENT");
          const eventHandler = graph.getEvents()["canvas:click"];
          graph.off("canvas:click");
          setTimeout(() => {
            debug("RESTORING CANVAS CLICK EVENT");
            graph.on("canvas:click", eventHandler);
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
      // skip event.targetType === "canvas" since de-selection on large graphs is extremely slow
      // enable: (event) => {
      //   debug(`CLICK SELECT | ${event.targetType}`);
      //   const selected = graph.getNodeData().filter(n => n.states?.includes("selected"));
      //   debug(`Selected: ${selected.length}`);
      //   if (selected.length === 1) {
      //     // TODO: check if target node is currectly selected; if yes -> return false (de-select event)
      //     const selNodeXMax = selected[0].style.x + selected[0].style.size;
      //     const selNodeXMin = selected[0].style.x - selected[0].style.size;
      //     const selNodeYMax = selected[0].style.y + selected[0].style.size;
      //     const selNodeYMin = selected[0].style.y - selected[0].style.size;
      //
      //     // 1 node selected; cursor is on top of it; means this would be a de-select event leaving no remaining selected nodes
      //     if (event.canvas.x <= selNodeXMax
      //       && event.canvas.x >= selNodeXMin
      //       && event.canvas.y <= selNodeYMax
      //       && event.canvas.y >= selNodeYMin) {
      //       debug("PREVENTING DE-SELECTION");
      //       return false;
      //     }
      //   }
      //   return event.targetType === "node" || event.targetType === "edge"
      // },
    },
  },
};

const EVENT_LOCKS = {
  BEFORE_DRAW_RUNNING: false,
  AFTER_DRAW_RUNNING: false,
  DRAG_END_RUNNING: false,
  BEFORE_RENDER_RUNNING: false,
  AFTER_RENDER_RUNNING: false,
  BEFORE_LAYOUT_RUNNING: false,
  AFTER_LAYOUT_RUNNING: false,
  ONCE_AFTER_RENDER_RUNNING: false,
  ONCE_AFTER_RENDER_COMPLETED: false,
  IS_DESELECTING: false,
  BUBBLE_GROUP_REDRAW_RUNNING: false,
  TRIGGER_SET_LAYOUT_ONCE: false,
}

const INSTANCES = {
  BUBBLE_GROUPS: {}
}

const INVISIBLE_DUMMY_NODE = {
  id: "INVISIBLEDUMMYNODEWITHIMPOSSIBLEID",
  style: {
    visibility: "hidden"
  }
}

const INVISIBLE_CHAR = "\u200B";

class ColorScalePicker {
  constructor() {
    this.defaultColors = {
      min: '#403C53',
      zero: '#FFFFFF',
      max: '#C33D35'
    };
    this.handles = [];
    this.element = null;
    this.resolvePromise = null;
    this.minValue = 0;
    this.maxValue = 0;
    this.categories = [];
    this.defaultColorForMissing = '#CCCCCC';
    this.elementType = "nodes";
    this.dom = {};
  }

  createDom() {
    const overlay = document.createElement('div');
    overlay.className = 'picker-overlay';
    this.dom.overlay = overlay;

    const content = document.createElement('div');
    content.className = 'picker-content';
    this.dom.content = content;

    const dropdown = document.createElement('select');
    dropdown.className = 'picker-dropdown';
    this.dom.dropdown = dropdown;

    const gradient = document.createElement('div');
    gradient.className = 'picker-gradient disabled';
    this.dom.gradient = gradient;

    const handleContainer = document.createElement('div');
    handleContainer.className = 'picker-handle-container';
    this.dom.handleContainer = handleContainer;

    const controls = document.createElement('div');
    controls.className = 'picker-controls disabled';
    this.dom.controls = controls;

    const addButton = document.createElement('button');
    addButton.className = 'picker-button plus-minus';
    addButton.textContent = '+';
    addButton.onclick = () => this.addHandle();
    this.dom.addButton = addButton;

    const removeButton = document.createElement('button');
    removeButton.className = 'picker-button plus-minus';
    removeButton.textContent = '-';
    removeButton.onclick = () => this.removeHandle();
    this.dom.removeButton = removeButton;

    const categoryContainer = document.createElement('div');
    categoryContainer.className = 'picker-category-container';
    categoryContainer.style.display = 'none';
    this.dom.categoryContainer = categoryContainer;

    controls.append(addButton, removeButton);
    const buttons = document.createElement('div');
    buttons.className = 'picker-button-container';
    this.dom.buttons = buttons;

    const cancelButton = document.createElement('button');
    cancelButton.className = 'picker-button secondary';
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = () => this.cancel();
    this.dom.cancelButton = cancelButton;

    const defaultColorContainer = document.createElement('div');
    defaultColorContainer.className = 'picker-default-color-container disabled';
    this.dom.defaultColorContainer = defaultColorContainer;

    const label = document.createElement('span');
    label.textContent = 'Default color:';
    label.title = 'Default color for elements with missing values';
    this.dom.label = label;

    const defaultColorEl = document.createElement('input');
    defaultColorEl.type = 'color';
    defaultColorEl.className = 'picker-default-color';
    defaultColorEl.value = this.defaultColorForMissing;
    defaultColorEl.addEventListener('input', (e) => {
      this.defaultColorForMissing = e.target.value;
    });
    this.dom.defaultColorEl = defaultColorEl;

    defaultColorContainer.append(label, defaultColorEl);

    const applyButton = document.createElement('button');
    applyButton.className = 'picker-button primary disabled';
    applyButton.textContent = 'Apply';
    applyButton.onclick = () => this.apply();
    this.dom.applyButton = applyButton;

    buttons.append(cancelButton, defaultColorContainer, applyButton);
    content.append(dropdown, gradient, handleContainer, controls, categoryContainer, buttons);
    overlay.appendChild(content);

    this.element = overlay;
    return overlay;
  }

  async pickColors(elementType = 'nodes') {
    this.elementType = elementType;
    return new Promise(resolve => {
      this.resolvePromise = resolve;
      document.body.appendChild(this.createDom());
      this.initializeFilters();
      this.setupHandleDragging();
    });
  }

  initializeFilters() {
    const dropdown = this.element.querySelector('.picker-dropdown');
    const filters = new Map(data.layouts[data.selectedLayout].filters);
    const available = new Set();

    const selectedElements = this.elementType === 'nodes' ? cache.selectedNodes : cache.selectedEdges;

    selectedElements.forEach(elementId => {
      const element = this.elementType === 'nodes'
        ? cache.nodeRef.get(elementId)
        : cache.edgeRef.get(elementId);

      element?.features.forEach(f => {
        if (filters.has(f)) available.add(f);
      });
    });

    dropdown.innerHTML = '<option value="">Select property</option>';
    Array.from(available).sort().forEach(prop => {
      const opt = document.createElement('option');
      opt.value = prop;
      opt.textContent = prop;
      dropdown.appendChild(opt);
    });

    dropdown.onchange = () => this.selectProperty(dropdown.value, filters.get(dropdown.value));
  }

  selectProperty(property, filterObj) {
    if (!property) return;

    const selectedElements = this.elementType === 'nodes' ? cache.selectedNodes : cache.selectedEdges;
    const elementRef = this.elementType === 'nodes' ? cache.nodeRef : cache.edgeRef;

    const elementsWithProperty = Array.from(selectedElements)
      .filter(id => {
        const element = elementRef.get(id);
        return element?.featureValues.has(property);
      });

    const totalElements = selectedElements.length;
    const elementsWithPropertyCount = elementsWithProperty.length;

    const existingCounter = this.element.querySelector('.picker-property-counter');
    if (existingCounter) {
      existingCounter.remove();
    }

    const counterEl = document.createElement('div');
    counterEl.className = 'picker-property-counter';
    this.element.querySelector('.picker-content').insertBefore(
      counterEl,
      this.element.querySelector('.picker-gradient')
    );

    const elementTypeLabel = this.elementType === 'nodes' ? 'Nodes' : 'Edges';
    counterEl.textContent = `Affected ${elementTypeLabel}: ${elementsWithPropertyCount} / ${totalElements}`;

    if (this.dom.defaultColorContainer) {
      if (elementsWithPropertyCount === totalElements) {
        this.dom.defaultColorContainer.classList.add('disabled');
      } else {
        this.dom.defaultColorContainer.classList.remove('disabled');
      }
    }

    for (const elem of [this.dom.applyButton, this.dom.controls, this.dom.gradient]) {
      elem.classList.remove("disabled");
    }

    if (filterObj.isCategory) {
      this.categories = ([...filterObj.categories] || [])
        .map(name => ({name, color: this.generateRandomColor()}));
      this.renderCategories();
    } else {
      this.initializeGradient(property);
    }
  }

  renderCategories() {
    const gradient = this.element.querySelector('.picker-gradient');
    const handleContainer = this.element.querySelector('.picker-handle-container');
    const controls = this.element.querySelector('.picker-controls');
    const categoryContainer = this.element.querySelector('.picker-category-container');

    gradient.style.display = 'none';
    handleContainer.style.display = 'none';
    controls.style.display = 'none';
    categoryContainer.innerHTML = '';
    categoryContainer.style.display = 'block';

    this.categories.forEach(cat => {
      const row = document.createElement('div');
      row.className = 'picker-category-row';

      const label = document.createElement('span');
      label.textContent = cat.name;

      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.value = cat.color;
      colorInput.oninput = e => {
        cat.color = e.target.value;
      };

      row.append(label, colorInput);
      categoryContainer.appendChild(row);
    });
  }

  generateRandomColor() {
    return `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')}`;
  }

  initializeGradient(property) {
    const selectedElements = this.elementType === 'nodes' ? cache.selectedNodes : cache.selectedEdges;
    const elementRef = this.elementType === 'nodes' ? cache.nodeRef : cache.edgeRef;

    const values = Array.from(selectedElements)
      .map(id => elementRef.get(id)?.featureValues.get(property))
      .filter(v => v !== undefined);

    this.minValue = Math.min(...values);
    this.maxValue = Math.max(...values);

    this.handles = [
      {pos: 0, color: this.defaultColors.min, value: this.minValue, fixed: true},
      {pos: 50, color: this.defaultColors.zero, value: (this.maxValue + this.minValue) / 2, fixed: false},
      {pos: 100, color: this.defaultColors.max, value: this.maxValue, fixed: true}
    ];

    this.element.querySelector('.picker-gradient').style.display = 'block';
    this.element.querySelector('.picker-handle-container').style.display = 'block';
    this.element.querySelector('.picker-controls').style.display = 'flex';
    this.element.querySelector('.picker-category-container').style.display = 'none';

    this.renderHandles();
    this.updateGradient();
  }

  setupHandleDragging() {
    const container = this.element.querySelector('.picker-handle-container');

    container.addEventListener('mousedown', e => {
      const handleEl = e.target.closest('.picker-handle');
      if (!handleEl) return;

      const idx = parseInt(handleEl.dataset.index, 10);
      const handleObj = this.handles[idx];
      if (handleObj.fixed) return;

      const onMove = moveEvent => {
        const rect = container.getBoundingClientRect();
        let pos = ((moveEvent.clientX - rect.left) / rect.width) * 100;
        pos = Math.max(0, Math.min(100, pos));
        this.updateHandlePosition(handleObj, pos);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', onMove);
      }, {once: true});
    });
  }

  updateHandlePosition(handle, newPos) {
    handle.pos = newPos;
    handle.value = this.minValue + (newPos / 100) * (this.maxValue - this.minValue);

    this.handles.sort((a, b) => a.pos - b.pos);

    this.renderHandles();
    this.updateGradient();
  }

  renderHandles() {
    const container = this.element.querySelector('.picker-handle-container');
    container.innerHTML = '';

    this.handles.forEach((handle, i) => {
      const element = document.createElement('div');
      element.className = 'picker-handle';
      element.style.left = `${handle.pos}%`;
      element.style.backgroundColor = handle.color;
      element.dataset.index = i;
      element.dataset.fixed = handle.fixed;
      element.style.zIndex = handle.fixed ? 1 : 2;

      const value = document.createElement('div');
      value.className = 'picker-handle-value';
      value.textContent = handle.value.toFixed(2);

      const colorPicker = document.createElement('input');
      colorPicker.type = 'color';
      colorPicker.value = handle.color;
      colorPicker.className = 'picker-handle-color';
      colorPicker.style.opacity = '0';
      colorPicker.style.position = 'absolute';
      colorPicker.style.width = '100%';
      colorPicker.style.height = '100%';
      colorPicker.style.cursor = 'pointer';

      colorPicker.addEventListener('input', (e) => {
        handle.color = e.target.value;
        element.style.backgroundColor = e.target.value;
        this.updateGradient();
      });

      if (!handle.fixed) {
        element.style.cursor = 'move';
      }

      element.appendChild(value);
      element.appendChild(colorPicker);
      container.appendChild(element);
    });
  }

  updateGradient() {
    const gradient = this.element.querySelector('.picker-gradient');
    const stops = [...this.handles]
      .sort((a, b) => a.pos - b.pos)
      .map(h => `${h.color} ${h.pos}%`)
      .join(', ');
    gradient.style.background = `linear-gradient(to right, ${stops})`;
  }


  addHandle() {
    if (this.handles.length >= 10) return;

    const newColor = this.generateRandomColor();

    // Find two adjacent handles with the largest gap
    const sortedHandles = [...this.handles].sort((a, b) => a.pos - b.pos);
    let maxGap = 0;
    let insertIndex = 1;

    for (let i = 0; i < sortedHandles.length - 1; i++) {
      const gap = sortedHandles[i + 1].pos - sortedHandles[i].pos;
      if (gap > maxGap) {
        maxGap = gap;
        insertIndex = i + 1;
      }
    }

    // Insert new handle at the midpoint of the largest gap
    const pos = (sortedHandles[insertIndex - 1].pos + sortedHandles[insertIndex].pos) / 2;
    const value = this.minValue + (pos / 100) * (this.maxValue - this.minValue);

    this.handles.push({pos, color: newColor, value, fixed: false});
    this.handles.sort((a, b) => a.pos - b.pos);

    this.renderHandles();
    this.updateGradient();
  }

  removeHandle() {
    if (this.handles.length <= 3) return;
    this.handles.splice(Math.floor(this.handles.length / 2), 1);
    this.renderHandles();
    this.updateGradient();
  }

  apply() {
    const dropdown = this.element.querySelector('.picker-dropdown');
    const colorMap = new Map();

    const selectedElements = this.elementType === 'nodes' ? cache.selectedNodes : cache.selectedEdges;
    const elementRef = this.elementType === 'nodes' ? cache.nodeRef : cache.edgeRef;

    const filterObj = data.layouts[data.selectedLayout].filters.get(dropdown.value);
    const isCategory = filterObj?.isCategory;

    if (isCategory) {
      const categoryColorMap = new Map(
        this.categories.map(cat => [cat.name, cat.color])
      );

      Array.from(selectedElements).forEach(elementId => {
        const element = elementRef.get(elementId);
        const valueSet = element?.featureValues.get(dropdown.value);
        const value = valueSet instanceof Set ? Array.from(valueSet)[0] : valueSet;

        if (value !== undefined && categoryColorMap.has(value)) {
          colorMap.set(elementId, categoryColorMap.get(value));
        } else {
          colorMap.set(elementId, this.defaultColorForMissing);
        }
      });
    } else {
      Array.from(selectedElements).forEach(elementId => {
        const element = elementRef.get(elementId);
        const value = element?.featureValues.get(dropdown.value);

        if (value !== undefined) {
          const normalizedValue = ((value - this.minValue) / (this.maxValue - this.minValue)) * 100;
          const color = this.getColorForValue(normalizedValue);
          colorMap.set(elementId, color);
        } else {
          colorMap.set(elementId, this.defaultColorForMissing);
        }
      });
    }

    this.resolvePromise(colorMap);
    this.close();
  }

  cancel() {
    this.resolvePromise(null);
    this.close();
  }

  getColorForValue(normalizedValue) {
    const sortedHandles = [...this.handles].sort((a, b) => a.pos - b.pos);
    let lower = sortedHandles[0];
    let upper = sortedHandles[sortedHandles.length - 1];

    for (let i = 0; i < sortedHandles.length - 1; i++) {
      if (sortedHandles[i].pos <= normalizedValue && sortedHandles[i + 1].pos >= normalizedValue) {
        lower = sortedHandles[i];
        upper = sortedHandles[i + 1];
        break;
      }
    }

    const t = (normalizedValue - lower.pos) / (upper.pos - lower.pos);
    return this.interpolateColor(lower.color, upper.color, t);
  }

  interpolateColor(color1, color2, t) {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);

    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);

    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }

  close() {
    this.element?.remove();
    this.element = null;
  }
}

class NetworkMetrics {
  constructor() {
    this.selected = 'centrality';
    this.multiselect = null;
    this.table = null;
    this.m = metrics;
    this.collapsed = false;

    this.selectBtns = {
      'Add to Selection': async () => this.updateSelectedNodes(true),
      'Remove from Selection': async () => this.updateSelectedNodes(false)
    };
  }

  toggleUI() {
    const panel = document.getElementById('networkMetricsContainer');
    const willOpen = panel.classList.toggle('open');
    const fullHeight = panel.scrollHeight + 'px';
    panel.style.maxHeight = fullHeight;

    const btn = document.getElementById('metricsToggleBtn');

    requestAnimationFrame(() => {
      panel.style.maxHeight = willOpen ? fullHeight : '0';
    });

    if (willOpen) {
      panel.addEventListener(
        'transitionend',
        () => (panel.style.maxHeight = 'none'),
        {once: true}
      );
      btn.classList.add("highlight");
    } else {
      btn.classList.remove("highlight");
    }

    this.collapsed = !willOpen;
  }

  async updateUI() {
    if (!cache.visibleElementsChanged) return;

    const metricName = this.m[this.selected].label;
    await showLoading("Calculating", `Network Metric: ${metricName}`);
    await new Promise(resolve => requestAnimationFrame(resolve));

    resetNodeToolTipMetricTexts();

    const metricResult = await this.m[this.selected]?.calculate();

    /* multiselect */
    const selectedValues = Array.from(this.multiselect.selectedOptions, opt => opt.value);

    this.multiselect.innerHTML = '';
    for (const ns of metricResult.scores) {
      const opt = document.createElement('option');
      opt.value = ns.id;
      opt.textContent = `${ns.id} | ${ns.text}`;
      opt.selected = selectedValues.includes(ns.id);
      updateNodeToolTipMetricText(ns.id, metricName, ns.text);
      this.multiselect.appendChild(opt);
    }

    /* graph-level table */
    this.table.innerHTML = '';
    Object.entries(metricResult.graphLevelMetrics).forEach(([label, value]) => {
      const row = document.createElement('tr');
      const labelCell = document.createElement('td');
      labelCell.textContent = label;
      const valueCell = document.createElement('td');
      valueCell.textContent = `${value}`;
      row.append(labelCell, valueCell);
      this.table.appendChild(row);
    });

    /* tooltip */
    document.getElementById("metricInfoBtn").onclick = () => {
      cache.popup = new Popup(metricResult.popupContent);
    };
    await hideLoading();
    await new Promise(resolve => requestAnimationFrame(resolve));
  }

  buildUI() {
    const container = document.createElement('div');
    container.className = 'nw-root';
    container.id = 'networkMetricsContainer';

    const div = document.createElement('div');
    div.className = 'nw-div';

    /* header ------------------------------------------------------- */
    const header = document.createElement('h3');
    header.textContent = 'Network Metrics';
    div.appendChild(header);

    /* metric dropdown --------------------------------------------- */
    const dropdownContainer = document.createElement("div");
    dropdownContainer.className = "nw-metric-select-container";

    const dropdown = document.createElement('select');
    dropdown.className = 'nw-metric-select';
    Object.values(this.m).forEach(metric => {
      const opt = document.createElement('option');
      opt.value = metric.id;
      opt.textContent = metric.label;
      opt.selected = metric.id === this.selected;
      dropdown.appendChild(opt);
    });
    dropdown.addEventListener('change', async (e) => {
      this.selected = e.target.value;
      await this.updateUI();
    });
    dropdownContainer.appendChild(dropdown);

    const infoBtn = document.createElement("button");
    infoBtn.className = "info-btn";
    infoBtn.textContent = "🛈";
    infoBtn.id = "metricInfoBtn";
    dropdownContainer.appendChild(infoBtn);
    div.append(dropdownContainer);

    /* node multiselect -------------------------------------------- */
    this.multiselect = document.createElement('select');
    this.multiselect.className = 'nw-node-multiselect';
    this.multiselect.multiple = true;
    this.multiselect.id = 'metricsMultiselect';
    div.appendChild(this.multiselect);

    /* buttons ------------------------------------------------------ */
    const buttonRow = document.createElement('div');
    Object.entries(this.selectBtns).forEach(([text, cb]) => {
      const btn = document.createElement('button');
      btn.textContent = text;
      btn.className = 'nw-button';
      btn.onclick = cb;
      buttonRow.appendChild(btn);
    });
    div.appendChild(buttonRow);

    div.appendChild(document.createElement('hr'));

    /* graph-level metrics table ------------------------------------ */
    const tHeader = document.createElement('p');
    tHeader.className = 'nw-subheader';
    tHeader.textContent = 'Graph Level Metrics';
    div.appendChild(tHeader);

    this.table = document.createElement('table');
    this.table.className = 'nw-graph-metrics-table';
    div.appendChild(this.table);

    div.appendChild(document.createElement('hr'));

    container.appendChild(div);
    return container;
  }

  async updateSelectedNodes(add) {
    const ids = Array.from(
      this.multiselect.selectedOptions,
      opt => opt.value
    );
    if (ids.length) {
      const nodeData = await graph.getNodeData(ids);
      await updateSelectedState(nodeData, add);
      // workaround since selected nodes where missing after adding them through network metrics
      if (add) {
        cache.selectedNodes = [...new Set([...cache.selectedNodes, ...ids])];
      } else {
        cache.selectedNodes = cache.selectedNodes.filter(id => !ids.includes(id));
      }
    }
  }
}

async function calculateDegreeCentrality() {
  const {nodeIDsToBeShown: nodes, edgeIDsToBeShown: edges, edgeRef} = cache;

  const n = nodes.size;
  if (n === 0) {
    return {scores: [], graphLevelMetrics: {}};
  }

  // 1. Degree accumulation
  const degree = new Map();
  for (const id of nodes) degree.set(id, 0);

  for (const edgeId of edges) {
    const {source, target} = edgeRef.get(edgeId);
    if (degree.has(source)) degree.set(source, degree.get(source) + 1);
    if (degree.has(target)) degree.set(target, degree.get(target) + 1);
  }

  // 2. Centrality + statistics
  const scores = [];
  let sum = 0, min = Infinity, max = -Infinity;

  for (const [id, d] of degree) {
    const c = d / (n - 1);                // Freeman degree centrality
    scores.push({id, degree: d, centrality: c});
    sum += c;
    if (c < min) min = c;
    if (c > max) max = c;
  }

  scores.sort((a, b) => b.centrality - a.centrality);
  const median = scores[Math.floor(n / 2)].centrality;
  const mean = sum / n;

  // Freeman network centralization (undirected)
  const centralization = (n > 2)
    ? scores.reduce((acc, s) => acc + (max - s.centrality), 0) /
    ((n - 1) * (n - 2))
    : 0;

  return {
    scores: scores.map(s => ({
      id: s.id,
      text: `Degree ${s.degree} | Centrality ${s.centrality.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION)} (${Math.round((s.centrality / max) * 100)} %)`
    })),
    graphLevelMetrics: {
      "Maximum Degree Centrality": max * (n - 1),
      "Minimum Degree Centrality": min * (n - 1),
      "Average Degree Centrality": +(mean * (n - 1)).toFixed(NODE_CONNECTIVITY_METRICS_PRECISION),
      "Median Degree": +(median * (n - 1)).toFixed(NODE_CONNECTIVITY_METRICS_PRECISION),
      "Graph Density": +(sum / n).toFixed(NODE_CONNECTIVITY_METRICS_PRECISION),
      "Centralization": +centralization.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION)
    },
    popupContent: `<div>
<h1>Degree Centrality</h1>
<hr>
<p>Degree centrality is a measure of the number of connections a node has in a network.
Nodes with more connections are considered more central and receive a higher score (up to 1.0).
<a href="https://doi.org/10.2307%2F3033543">Freeman, 1977</a>
</p>
<p><strong>Note:</strong> 
  This implementation treats all graphs as undirected, counting all connections equally regardless of direction.
</p>
<svg width="300" height="200" viewBox="0 0 300 200">
  <!-- Edges (drawn first so they appear behind nodes) -->
  <!-- Central node (3) connections -->
  <line x1="150" y1="100" x2="50" y2="50" stroke="#666" stroke-width="2"/>
  <line x1="150" y1="100" x2="250" y2="50" stroke="#666" stroke-width="2"/>
  <line x1="150" y1="100" x2="50" y2="150" stroke="#666" stroke-width="2"/>
  <line x1="150" y1="100" x2="250" y2="150" stroke="#666" stroke-width="2"/>
  
  <!-- Nodes -->
  <!-- Central node with degree 4 -->
  <circle cx="150" cy="100" r="25" fill="#C33D35"/>
  <text x="150" y="105" text-anchor="middle" fill="white" font-size="14">4</text>
  
  <!-- End nodes (degree 1) -->
  <circle cx="50" cy="50" r="20" fill="#403C53"/>
  <text x="50" y="55" text-anchor="middle" fill="white" font-size="14">1</text>
  
  <circle cx="250" cy="50" r="20" fill="#403C53"/>
  <text x="250" y="55" text-anchor="middle" fill="white" font-size="14">1</text>
  
  <circle cx="50" cy="150" r="20" fill="#403C53"/>
  <text x="50" y="155" text-anchor="middle" fill="white" font-size="14">1</text>
  
  <circle cx="250" cy="150" r="20" fill="#403C53"/>
  <text x="250" y="155" text-anchor="middle" fill="white" font-size="14">1</text>
</svg>
<hr>
<p><strong>Degree Centrality:</strong> Normalised number of neighbours a node possesses.</p>
<p><strong>Graph Density:</strong> Fraction of realised edges out of all possible edges (0&nbsp;–&nbsp;1).</p>
<p><strong>Centralization:</strong> Freeman degree-centralization — how strongly the network is dominated by its most connected node (0&nbsp;=&nbsp;even, 1&nbsp;=&nbsp;perfect star).</p>
</div>`
  };
}

async function calculateBetweennessCentrality() {
  const {nodeIDsToBeShown: nodes, edgeIDsToBeShown: edges, edgeRef} = cache;

  const n = nodes.size;
  if (n === 0) {
    return {scores: [], graphLevelMetrics: {}};
  }

  // Build adjacency map
  const adjacencyMap = new Map();
  for (const id of nodes) adjacencyMap.set(id, new Set());
  for (const edgeId of edges) {
    const {source, target} = edgeRef.get(edgeId);
    if (adjacencyMap.has(source)) adjacencyMap.get(source).add(target);
    if (adjacencyMap.has(target)) adjacencyMap.get(target).add(source);
  }

  // Initialize betweenness scores
  const betweenness = new Map();
  for (const id of nodes) betweenness.set(id, 0);

  // Process each node as source
  for (const source of nodes) {
    // Initialize data structures for BFS
    const distance = new Map();
    const paths = new Map();
    const queue = [];
    const stack = []; // for dependency accumulation

    // Initialize source node
    distance.set(source, 0);
    paths.set(source, 1);
    queue.push(source);

    // BFS phase
    while (queue.length > 0) {
      const node = queue.shift();
      stack.push(node);

      for (const neighbor of adjacencyMap.get(node)) {
        // Node discovered for first time?
        if (!distance.has(neighbor)) {
          queue.push(neighbor);
          distance.set(neighbor, distance.get(node) + 1);
          paths.set(neighbor, paths.get(node));
        }
        // Another shortest path found?
        else if (distance.get(neighbor) === distance.get(node) + 1) {
          paths.set(neighbor, paths.get(neighbor) + paths.get(node));
        }
      }
    }

    // Dependency accumulation phase
    const dependency = new Map();
    for (const node of nodes) dependency.set(node, 0);

    // Process nodes in reverse order of discovery
    while (stack.length > 0) {
      const node = stack.pop();
      if (node === source) continue;

      for (const neighbor of adjacencyMap.get(node)) {
        if (distance.get(neighbor) === distance.get(node) - 1) {
          const coeff = (paths.get(neighbor) / paths.get(node)) * (1 + dependency.get(node));
          dependency.set(neighbor, dependency.get(neighbor) + coeff);
        }
      }

      betweenness.set(node, betweenness.get(node) + dependency.get(node) / 2);
    }
  }

  // Normalize scores and prepare results
  const scores = [];
  let max = -Infinity;
  const normalizationFactor = ((n - 1) * (n - 2)) / 2;

  for (const [id, score] of betweenness) {
    const normalizedScore = score / normalizationFactor;
    scores.push({id, score: normalizedScore});
    if (normalizedScore > max) max = normalizedScore;
  }

  scores.sort((a, b) => b.score - a.score);

  // Calculate graph level metrics
  const centralityValues = scores.map(s => s.score);
  const sum = centralityValues.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const min = Math.min(...centralityValues);
  const centralization = scores.reduce((acc, s) => acc + (max - s.score), 0) / ((n - 1) * (n - 2) / 2);

  return {
    scores: scores.map(s => ({
      id: s.id,
      text: `Score: ${s.score.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION)} (${Math.round((s.score / max) * 100)}%)`
    })),
    graphLevelMetrics: {
      "Maximum Betweenness Centrality": +max.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION),
      "Minimum Betweenness Centrality": +min.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION),
      "Average Betweenness Centrality": +mean.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION),
      "Centralization": +centralization.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION),
    },
    popupContent: `<div>
<h1>Betweenness Centrality</h1>
<hr>
<p>Betweenness centrality measures how often a node acts as a bridge along the shortest path between two other nodes.
Nodes with high betweenness centrality are important controllers of information flow in the network.
<a href="https://doi.org/10.2307%2F3033543">Freeman, 1977</a>
</p>
<p><strong>Note:</strong> This implementation assumes an undirected graph (A→B and B→A are considered the same path). 
</p>
<svg width="300" height="200" viewBox="0 0 300 200">
  <!-- Edges -->
  <line x1="50" y1="100" x2="150" y2="100" stroke="#666" stroke-width="2"/>
  <line x1="150" y1="100" x2="250" y2="100" stroke="#666" stroke-width="2"/>
  <line x1="150" y1="100" x2="150" y2="50" stroke="#666" stroke-width="2"/>
  <line x1="150" y1="100" x2="150" y2="150" stroke="#666" stroke-width="2"/>
  
  <!-- Nodes -->
  <circle cx="150" cy="100" r="25" fill="#C33D35"/> <!-- Bridge node -->
  <text x="150" y="105" text-anchor="middle" fill="white" font-size="14">1.0</text>
  
  <circle cx="50" cy="100" r="20" fill="#403C53"/>
  <text x="50" y="105" text-anchor="middle" fill="white" font-size="14">0</text>
  
  <circle cx="250" cy="100" r="20" fill="#403C53"/>
  <text x="250" y="105" text-anchor="middle" fill="white" font-size="14">0</text>
  
  <circle cx="150" cy="50" r="20" fill="#403C53"/>
  <text x="150" y="55" text-anchor="middle" fill="white" font-size="14">0</text>
  
  <circle cx="150" cy="150" r="20" fill="#403C53"/>
  <text x="150" y="155" text-anchor="middle" fill="white" font-size="14">0</text>
</svg>
<hr>
<p><strong>Centralization:</strong> 0 when paths are evenly shared, 1 when a single hub monopolises shortest paths (star-like topology).</p>
</div>`
  };
}

async function calculateClosenessCentrality() {
  const {nodeIDsToBeShown: nodes, edgeIDsToBeShown: edges, edgeRef} = cache;

  const n = nodes.size;
  if (n === 0) return {scores: [], graphLevelMetrics: {}};

  // Build adjacency list
  const graphMap = new Map();
  for (const id of nodes) graphMap.set(id, new Set());

  for (const edgeId of edges) {
    const {source, target} = edgeRef.get(edgeId);
    if (graphMap.has(source) && graphMap.has(target)) {
      graphMap.get(source).add(target);
      graphMap.get(target).add(source);
    }
  }

  // Calculate shortest paths using BFS
  function bfs(start) {
    const distances = new Map();
    const queue = [[start, 0]];
    distances.set(start, 0);

    while (queue.length > 0) {
      const [node, dist] = queue.shift();
      for (const neighbor of graphMap.get(node)) {
        if (!distances.has(neighbor)) {
          distances.set(neighbor, dist + 1);
          queue.push([neighbor, dist + 1]);
        }
      }
    }
    return distances;
  }

  const scores = [];
  let sum = 0, min = Infinity, max = -Infinity;

  for (const nodeId of nodes) {
    const distances = bfs(nodeId);
    const reachableNodes = distances.size;

    // Skip unreachable nodes in total distance calculation
    const totalDistance = Array.from(distances.values())
      .filter(d => d > 0)  // Exclude self-distance
      .reduce((a, b) => a + b, 0);

    // Wasserman and Faust (1994) formula for disconnected graphs
    const closeness = totalDistance > 0 ?
      ((reachableNodes - 1) * (reachableNodes - 1)) / ((n - 1) * totalDistance) : 0;

    scores.push({id: nodeId, closeness});
    sum += closeness;
    if (closeness < min) min = closeness;
    if (closeness > max) max = closeness;
  }

  scores.sort((a, b) => b.closeness - a.closeness);
  const mean = sum / n;

  // Avoid division by zero in percentage calculations
  const maxForPercentage = max || 1;

  return {
    scores: scores.map(s => ({
      id: s.id,
      text: `Score: ${s.closeness.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION)} (${Math.round((s.closeness / maxForPercentage) * 100)}%)`
    })),
    graphLevelMetrics: {
      "Maximum Closeness Centrality": +max.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION),
      "Minimum Closeness Centrality": +min.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION),
      "Average Closeness Centrality": +mean.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION),
      "Centralization": +((n * max - sum) / ((n - 1) * (n - 2) / (2 * n - 3))).toFixed(NODE_CONNECTIVITY_METRICS_PRECISION)
    },
    popupContent: `<div>
<h1>Closeness Centrality</h1>
<hr>
<p>Closeness centrality measures how near a node is to all others via shortest paths. A higher score (up to 1.0)
 indicates shorter average distance to every node.  
<a href="https://psycnet.apa.org/doi/10.1121/1.1906679">Bavelas, 1950</a>
</p>
<p><strong>Note:</strong> 
  This implementation treats all graphs as undirected when calculating shortest paths.
</p>
<svg width="300" height="200" viewBox="0 0 300 200">
  <line x1="150" y1="100" x2="75" y2="100" stroke="#666" stroke-width="2"/>
  <line x1="150" y1="100" x2="225" y2="100" stroke="#666" stroke-width="2"/>
  <line x1="75" y1="100" x2="75" y2="150" stroke="#666" stroke-width="2"/>
  <line x1="225" y1="100" x2="225" y2="150" stroke="#666" stroke-width="2"/>
  
  <circle cx="150" cy="100" r="25" fill="#C33D35"/>
  <text x="150" y="105" text-anchor="middle" fill="white" font-size="14">1.0</text>
  
  <circle cx="75" cy="100" r="20" fill="#403C53"/>
  <text x="75" y="105" text-anchor="middle" fill="white" font-size="14">0.6</text>
  
  <circle cx="225" cy="100" r="20" fill="#403C53"/>
  <text x="225" y="105" text-anchor="middle" fill="white" font-size="14">0.6</text>
  
  <circle cx="75" cy="150" r="20" fill="#403C53"/>
  <text x="75" y="155" text-anchor="middle" fill="white" font-size="14">0.4</text>
  
  <circle cx="225" cy="150" r="20" fill="#403C53"/>
  <text x="225" y="155" text-anchor="middle" fill="white" font-size="14">0.4</text>
</svg>
<hr>
<p>
<strong>Centralization:</strong> Freeman closeness-centralization — degree to which one node is, on average, closer to all others than the rest of the network.
</p>
</div>`
  };
}

async function calculateEigenvectorCentrality() {
  const {nodeIDsToBeShown: nodes, edgeIDsToBeShown: edges, edgeRef} = cache;

  const n = nodes.size;
  if (n === 0) return {scores: [], graphLevelMetrics: {}};

  // Initialize adjacency matrix and eigenvector
  const matrix = Array(n).fill().map(() => Array(n).fill(0));
  const nodeArray = Array.from(nodes);
  const nodeIndex = new Map(nodeArray.map((id, i) => [id, i]));

  // Build adjacency matrix
  for (const edgeId of edges) {
    const {source, target} = edgeRef.get(edgeId);
    if (nodeIndex.has(source) && nodeIndex.has(target)) {
      const i = nodeIndex.get(source), j = nodeIndex.get(target);
      matrix[i][j] = matrix[j][i] = 1;
    }
  }

  // Power iteration method
  let eigenVector = Array(n).fill(1 / n);
  let prevEigenVector;
  const maxIterations = 100;
  const tolerance = 1e-6;

  for (let iter = 0; iter < maxIterations; iter++) {
    prevEigenVector = [...eigenVector];
    eigenVector = Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        eigenVector[i] += matrix[i][j] * prevEigenVector[j];
      }
    }

    // Normalize
    const norm = Math.sqrt(eigenVector.reduce((sum, x) => sum + x * x, 0));
    eigenVector = eigenVector.map(x => x / norm);

    // Check convergence
    if (eigenVector.every((x, i) => Math.abs(x - prevEigenVector[i]) < tolerance)) break;
  }

  // Prepare scores
  const scores = eigenVector.map((score, i) => ({
    id: nodeArray[i],
    centrality: score
  }));

  scores.sort((a, b) => b.centrality - a.centrality);
  const max = scores[0].centrality;
  const min = scores[scores.length - 1].centrality;

  const mean = eigenVector.reduce((a, b) => a + b) / n;
  const variance = eigenVector.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;

  return {
    scores: scores.map(s => ({
      id: s.id,
      text: `Score: ${s.centrality.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION)} (${Math.round((s.centrality / max) * 100)}%)`
    })),
    graphLevelMetrics: {
      "Maximum Eigenvector Centrality": +max.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION),
      "Minimum Eigenvector Centrality": +min.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION),
      "Average Eigenvector Centrality": +mean.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION),
      "Variance Eigenvector Centrality": +variance.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION),
      "Centralization": +(scores.reduce((acc, s) => acc + (max - s.centrality), 0) / (n - 1)).toFixed(NODE_CONNECTIVITY_METRICS_PRECISION)
    },
    popupContent: `<div>
<h1>Eigenvector Centrality</h1>
<hr>
<p>Eigenvector centrality scores nodes by connecting to other high-scoring nodes: 
links to influential neighbours matter more than links to peripheral ones.
<a href="https://doi.org/10.1093/oso/9780198805090.003.0006">Newman, 2010</a>
</p>
<p><strong>Note:</strong> 
  This implementation treats all graphs as undirected when calculating influence scores.
</p>
<p>
<strong>Parameters:</strong>
<ul>
  <li>Tolerance: 1e-6</li>
  <li>Max iterations: 100</li>
</ul>
</p>
<svg width="300" height="200" viewBox="0 0 300 200">
  <line x1="150" y1="100" x2="50" y2="50" stroke="#666" stroke-width="2"/>
  <line x1="150" y1="100" x2="250" y2="50" stroke="#666" stroke-width="2"/>
  <line x1="250" y1="50" x2="250" y2="150" stroke="#666" stroke-width="2"/>
  <line x1="50" y1="50" x2="50" y2="150" stroke="#666" stroke-width="2"/>
  
  <circle cx="150" cy="100" r="25" fill="#C33D35"/>
  <text x="150" y="105" text-anchor="middle" fill="white" font-size="14">1.00</text>
  
  <circle cx="50" cy="50" r="20" fill="#403C53"/>
  <text x="50" y="55" text-anchor="middle" fill="white" font-size="12">0.52</text>
  
  <circle cx="250" cy="50" r="20" fill="#403C53"/>
  <text x="250" y="55" text-anchor="middle" fill="white" font-size="12">0.52</text>
  
  <circle cx="50" cy="150" r="20" fill="#666"/>
  <text x="50" y="155" text-anchor="middle" fill="white" font-size="12">0.27</text>
  
  <circle cx="250" cy="150" r="20" fill="#666"/>
  <text x="250" y="155" text-anchor="middle" fill="white" font-size="12">0.27</text>
</svg>
<hr>
<p><strong>Centralization:</strong> Measures how much the network centrality is dominated by a single node.</p>
</div>`

  };
}

async function calculatePageRank() {
  const {nodeIDsToBeShown: nodes, edgeIDsToBeShown: edges, edgeRef} = cache;

  const n = nodes.size;
  if (n === 0) return {scores: [], graphLevelMetrics: {}};

  const nodeArray = Array.from(nodes);
  const nodeIndex = new Map(nodeArray.map((id, i) => [id, i]));
  const matrix = Array(n).fill().map(() => Array(n).fill(0));
  const degrees = Array(n).fill(0);

  // Build symmetric adjacency matrix for undirected graph
  for (const edgeId of edges) {
    const {source, target} = edgeRef.get(edgeId);
    if (nodeIndex.has(source) && nodeIndex.has(target)) {
      const i = nodeIndex.get(source), j = nodeIndex.get(target);
      // Add edges in both directions
      matrix[j][i] = matrix[i][j] = 1;
      degrees[i]++;
      degrees[j]++;
    }
  }

  // Normalize the matrix
  for (let i = 0; i < n; i++) {
    if (degrees[i] > 0) {
      for (let j = 0; j < n; j++) {
        matrix[j][i] = matrix[j][i] / degrees[i];
      }
    } else {
      // For isolated nodes, distribute probability evenly
      for (let j = 0; j < n; j++) {
        matrix[j][i] = 1 / n;
      }
    }
  }

  const d = 0.85;
  let scores = Array(n).fill(1 / n);
  let prevScores;
  const maxIter = 100;
  const tolerance = 1e-6;

  // Power iteration method remains the same
  for (let iter = 0; iter < maxIter; iter++) {
    prevScores = [...scores];
    scores = Array(n).fill((1 - d) / n);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        scores[i] += d * matrix[i][j] * prevScores[j];
      }
    }

    if (scores.every((x, i) => Math.abs(x - prevScores[i]) < tolerance)) break;
  }

  const sortedScores = scores.map((score, i) => ({
    id: nodeArray[i],
    score
  })).sort((a, b) => b.score - a.score);

  const maxScore = sortedScores[0].score;
  const minScore = sortedScores[sortedScores.length - 1].score;
  const meanScore = scores.reduce((a, b) => a + b) / n;
  const minDegree = Math.min(...degrees);
  const maxDegree = Math.max(...degrees);
  const avgDegree = degrees.reduce((a, b) => a + b) / n;

  return {
    scores: sortedScores.map(s => ({
      id: s.id,
      text: `Score: ${s.score.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION)} (${Math.round((s.score / maxScore) * 100)}%)`
    })),
    graphLevelMetrics: {
      "Maximum PageRank Score": +maxScore.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION),
      "Minimum PageRank Score": +minScore.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION),
      "Mean PageRank Score": +meanScore.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION),
      "Maximum Degree": maxDegree,
      "Minimum Degree": minDegree,
      "Mean Degree": +(avgDegree).toFixed(NODE_CONNECTIVITY_METRICS_PRECISION)
    },
    popupContent: `<div>
<h1>PageRank</h1>
<hr>
<p>PageRank measures node importance based on the number and quality of incoming links. 
A node is important if it receives many links from other important nodes.
<a href="https://doi.org/10.1016/S0169-7552(98)00110-X">Brin & Page, 1998</a>
</p>
<p><strong>Note:</strong> 
  While PageRank was originally designed for directed graphs, this implementation treats all graphs as undirected.
</p>
<svg width="300" height="300" viewBox="0 0 400 300">
  <defs>
    <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5"
        markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#999"/>
    </marker>
  </defs>
  
  <!-- Directed edges -->
  <g stroke="#999" stroke-width="2" fill="none" marker-end="url(#arrowhead)">
    <!-- Hub node connections -->
    <line x1="200" y1="150" x2="120" y2="100"/>
    <line x1="200" y1="150" x2="280" y2="100"/>
    <line x1="200" y1="150" x2="200" y2="80"/>
    <line x1="200" y1="150" x2="120" y2="200"/>
    <line x1="200" y1="150" x2="280" y2="200"/>
    
    <!-- Secondary connections -->
    <line x1="120" y1="100" x2="200" y2="80"/>
    <line x1="280" y1="100" x2="200" y2="80"/>
    <line x1="120" y1="200" x2="50" y2="150"/>
    <line x1="280" y1="200" x2="350" y2="150"/>
    <line x1="50" y1="150" x2="120" y2="100"/>
    <line x1="350" y1="150" x2="280" y2="100"/>
    <line x1="120" y1="200" x2="280" y2="200"/>
    <line x1="200" y1="80" x2="200" y2="30"/>
    <line x1="200" y1="30" x2="280" y2="100"/>
  </g>
  
  <!-- Nodes -->
  <g>
    <!-- Central hub -->
    <circle cx="200" cy="150" r="25" fill="#e74c3c"/>
    <text x="200" y="155" text-anchor="middle" fill="white" font-family="Arial" font-size="14">35%</text>
    
    <!-- Top tier nodes -->
    <circle cx="200" cy="80" r="20" fill="#34495e"/>
    <text x="200" y="85" text-anchor="middle" fill="white" font-family="Arial" font-size="12">15%</text>
    
    <circle cx="120" cy="100" r="20" fill="#34495e"/>
    <text x="120" y="105" text-anchor="middle" fill="white" font-family="Arial" font-size="12">12%</text>
    
    <circle cx="280" cy="100" r="20" fill="#34495e"/>
    <text x="280" y="105" text-anchor="middle" fill="white" font-family="Arial" font-size="12">12%</text>
    
    <!-- Secondary nodes -->
    <circle cx="120" cy="200" r="18" fill="#7f8c8d"/>
    <text x="120" y="205" text-anchor="middle" fill="white" font-family="Arial" font-size="11">7%</text>
    
    <circle cx="280" cy="200" r="18" fill="#7f8c8d"/>
    <text x="280" y="205" text-anchor="middle" fill="white" font-family="Arial" font-size="11">7%</text>
    
    <circle cx="50" cy="150" r="18" fill="#7f8c8d"/>
    <text x="50" y="155" text-anchor="middle" fill="white" font-family="Arial" font-size="11">4%</text>
    
    <circle cx="350" cy="150" r="18" fill="#7f8c8d"/>
    <text x="350" y="155" text-anchor="middle" fill="white" font-family="Arial" font-size="11">4%</text>
    
    <!-- Top node -->
    <circle cx="200" cy="30" r="18" fill="#7f8c8d"/>
    <text x="200" y="35" text-anchor="middle" fill="white" font-family="Arial" font-size="11">2%</text>
    
    <!-- Isolated node with fewer connections -->
    <circle cx="350" cy="50" r="15" fill="#95a5a6"/>
    <text x="350" y="55" text-anchor="middle" fill="white" font-family="Arial" font-size="10">2%</text>
  </g>
</svg>
<hr>
<p>
<strong>Parameters:</strong>
<ul>
  <li>Damping factor (d): 0.85</li>
  <li>Tolerance: 1e-6</li>
  <li>Max iterations: 100</li>
</ul>
</p>
<hr>
<p><strong>PageRank Score:</strong> Probability that a random walker lands on the node.</p>
<p><strong>PageRank Degree:</strong> In-degree used internally while computing PageRank.</p>
</div>`
  };
}

class QueryAST {
  constructor(instructions) {
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
        const op = expr[i];           // "AND" | "OR" | "NOT"
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
    const opTok = tokens[1];  // KW: "BETWEEN" | "LOWER THAN" | "IN [""]
    const value = this.#readValue(element, propTok);

    if (value === undefined || value === null) return false;

    // skip properties of the wrong main group (e.g. node property on an edge)
    if (propTok.main !== requestedMainGroup) return false;

    const propVal = this.#readValue(element, propTok);
    if (propVal === undefined || propVal === null) return false;

    const op = tokens[1].value;

    let validated = false;
    // --- BETWEEN a AND b ------------------------------------------------
    if (op === 'BETWEEN') {
      const lower = tokens[2].value;
      const upper = tokens[4].value;
      validated = typeof propVal === 'number' && propVal >= lower && propVal <= upper;
    }

    // --- LOWER THAN a OR GREATER THAN b -------------------------------
    if (op === 'LOWER THAN') {
      const low = tokens[2].value;  // a
      const high = tokens[4].value;  // b
      validated = typeof propVal === 'number' && (propVal <= low || propVal >= high);
    }

    // --- IN [ a, b, c ] -------------------------------------------------
    if (op.startsWith('IN')) {
      const set = tokens.slice(2).map(t => t.value);
      validated = set.includes(propVal);
    }

    element.featureIsWithinThreshold.set(tokens[0].propID, validated);
    return validated;
  }

  // Safely pull the data from the D4Data hierarchy
  #readValue(element, {main, sub, prop}) {
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

function createDefaultLayout(key, overridePositionsFromExcel=false) {
  const defLayout = {
    internals: DEFAULTS.LAYOUT_INTERNALS[key] || null,
    positions: new Map(),
    filters: structuredClone(data.filterDefaults),
    isCustom: false,
    query: undefined,
  };

  if (overridePositionsFromExcel) {
    // applies given coordinates from Excel template; remaining positions will be force layouted
    for (const [nodeID, positions] of cache.nodePositionsFromExcelImport) {
      defLayout.positions.set(nodeID, {style: {x: positions.x, y: positions.y}});
    }
    defLayout.type = DEFAULTS.LAYOUT;
    defLayout.internals = DEFAULTS.LAYOUT_INTERNALS[DEFAULTS.LAYOUT];
    defLayout.isCustom = true;
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
      filters: parseFiltersAsMap(layout.filters),
      isCustom: layout.isCustom || false,
      query: layout["query"] || undefined
    };

    for (let group of traverseBubbleSets()) {
      parsedLayouts[key][`${group}Props`] = new Set(layout[`${group}Props`] || []);
    }
  });
  return parsedLayouts;
}

function parseFiltersAsMap(filtersObj) {
  if (filtersObj instanceof Map) {
    return structuredClone(filtersObj);
  }

  return new Map(Object.entries(filtersObj || {})
    .map(([key, value]) => [key, {...value, ...parseGroups(value)}]));
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

async function getSelectedNodes() {
  return await graph.getNodeData().filter(n => n.states?.includes("selected"));
}

async function layoutSelectedNodes(action) {
  if (cache.selectedNodes.length === 0) return;

  async function groupOrSpreadSelectedNodes(scale) {
    for (const node of await getSelectedNodes()) {
      const oldX = node.style.x;
      const oldY = node.style.y;

      node.style.x = origAvgX + (oldX - origAvgX) * scale;
      node.style.y = origAvgY + (oldY - origAvgY) * scale;
    }
  }

  async function arrangeNodesInCircle(radius) {
    const numNodes = cache.selectedNodes.length;
    let angleStep = (2 * Math.PI) / numNodes;

    let i = 0;
    for (const node of await getSelectedNodes()) {
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
    const nodes = await getSelectedNodes();
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
      for (const edge of await graph.getEdgeData()) {
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

  async function applyGridLayout() {
    const nodes = await getSelectedNodes();
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
    const nodes = await getSelectedNodes();
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

  const sel = await getSelectedNodes();
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
  await persistNodePositions();
  await handleLayoutChangeLoadingEvent(action, eventLabels[action]);
}

async function getPositions() {
  const posCopy = [];
  for (const node of await graph.getNodeData()) {
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

async function debugPositions() {
  for (const node of await getPositions()) {
    debug(`${node.id} | ${node.style.x} | ${node.style.y}`);
  }
}

async function persistNodePositions() {
  debug("PERSISTING NODE POSITIONS ..");
  for (const node of await graph.getNodeData()) {
    data.layouts[data.selectedLayout].positions.set(node.id, {style: {x: node.style.x, y: node.style.y}});
  }
}

function createStyleDiv() {
  const root = document.createElement("div");

  function createNewRow(parent) {
    const row = document.createElement("div");
    row.classList.add("card-row");
    parent.appendChild(row);
    return row;
  }

  function appendVerticalRule(parent, label = undefined, tooltip = undefined, id = undefined) {
    const verticalRule = document.createElement("div");
    verticalRule.className = "vr";
    parent.appendChild(verticalRule);
    appendLabel(parent, label, tooltip, id);
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

  function appendLabel(parent, labelText, tooltip = undefined, id = undefined) {
    const label = createLabel(labelText, tooltip);
    if (id) label.id = id;
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

  function createSwitch(callback = undefined, inputId = undefined) {
    const label = document.createElement('label');
    label.className = 'switch';

    const input = document.createElement('input');
    input.type = 'checkbox';

    const span = document.createElement('span');
    span.className = 'slider round';

    if (callback) {
      input.addEventListener('change', callback);
    }

    if (inputId) {
      input.id = inputId;
      label.id = `${inputId}Label`;
    }

    label.append(input, span);
    return label;
  }

  async function handleStyleChangeEvent(property, value) {
    const commands = [];

    if (value === "set_continuous_color_scale") {
      commands.push("set_continuous_color_scale");
    }

    switch (property) {
      case "Node Size":
        await updateNodes({style: {size: value}}, commands);
        break;
      case "Node Border Size":
        await updateNodes({style: {lineWidth: value}}, commands);
        break;
      case "Node Label Font Size":
        await updateNodes({style: {labelFontSize: value}}, commands);
        break;
      case "Node Label Font Color":
        await updateNodes({style: {labelFill: value}}, commands);
        break;
      case "Node Label Background Color":
        await updateNodes({style: {labelBackground: true, labelBackgroundFill: value}}, commands);
        break;
      case "Node Fill Color":
        await updateNodes({style: {fill: value}}, commands);
        break;
      case "Node Border Color":
        await updateNodes({style: {stroke: value}}, commands);
        break;
      case "Node Label Color":
        await updateNodes({style: {labelFill: value}}, commands);
        break;
      case "Node Label Placement":
        await updateNodes({style: {labelPlacement: value}}, commands);
        break;
      case "Edge Color":
        await updateEdges({style: {stroke: value}}, commands);
        break;
      case "Edge Width":
        await updateEdges({style: {lineWidth: value}}, commands);
        break;
      case "Edge Dash":
        await updateEdges({style: {lineDash: value}}, commands);
        break;
      case "Edge Label Font Size":
        await updateEdges({style: {labelFontSize: value}}, commands);
        break;
      case "Edge Label Offset X":
        await updateEdges({style: {labelOffsetX: value}}, commands);
        break;
      case "Edge Label Offset Y":
        await updateEdges({style: {labelOffsetY: value}}, commands);
        break;
      case "Edge Label Placement":
        await updateEdges({style: {labelPlacement: value}}, commands);
        break;
      case "Edge Label Font Color":
        await updateEdges({style: {labelFill: value}}, commands);
        break;
      case "Edge Label Background Color":
        await updateEdges({style: {labelBackground: true, labelBackgroundFill: value}}, commands);
        break;
      case "Edge Label Auto Rotate":
        await updateEdges({style: {labelAutoRotate: value}}, commands);
        break;
      case "Edge Start Arrow":
        await updateEdges({style: {startArrow: value}}, commands);
        break;
      case "Edge End Arrow":
        await updateEdges({style: {endArrow: value}}, commands);
        break;
      case "Edge Start Arrow Size":
        await updateEdges({style: {startArrowSize: value}}, commands);
        break;
      case "Edge End Arrow Size":
        await updateEdges({style: {endArrowSize: value}}, commands);
        break;
      case "Edge Start Arrow Type":
        await updateEdges({style: {startArrowType: value}}, commands);
        break;
      case "Edge End Arrow Type":
        await updateEdges({style: {endArrowType: value}}, commands);
        break;
      case "Edge Halo":
        await updateEdges({style: {halo: value}}, commands);
        break;
      case "Edge Halo Width":
        await updateEdges({style: {haloLineWidth: value}}, commands);
        break;
      case "Edge Halo Color":
        await updateEdges({style: {haloStroke: value}}, commands);
        break;
      default:
        break;
    }
  }

  function createBooleanControls(parent, property, tooltip = undefined) {
    const onBtn = document.createElement("button");
    onBtn.textContent = "On";
    onBtn.classList.add("style-inner-button");
    onBtn.onclick = async () => {
      await handleStyleChangeEvent(property, true);
    }
    if (tooltip) onBtn.title = tooltip;
    parent.appendChild(onBtn);

    const offBtn = document.createElement("button");
    offBtn.textContent = "Off";
    offBtn.classList.add("style-inner-button");
    offBtn.onclick = async () => {
      await handleStyleChangeEvent(property, false);
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
      dropdown.onchange = async () => {
        await handleStyleChangeEvent(property, dropdown.value);
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

    slider.onchange = async () => {
      await handleStyleChangeEvent(property, parseValue(slider.value));
    };

    valueInput.onchange = async () => {
      slider.value = valueInput.value;
      await handleStyleChangeEvent(property, parseValue(valueInput.value));
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

  function createColorControls(parent, property, defaultColor, colors, continuousScaleBtn=true) {
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

      colorButton.onclick = async () => {
        colorInput.value = value;
        await handleStyleChangeEvent(property, value);
      };
      colorButtonDiv.appendChild(colorButton);
    }

    parent.appendChild(colorButtonDiv);

    const colorPicker = createColorPicker(defaultColor,
      `Set ${property} of the selected elements to a color of choice.`);

    colorPicker.oninput = () => {
      colorInput.value = colorPicker.value;
    };

    colorPicker.onchange = async () => {
      await handleStyleChangeEvent(property, colorPicker.value);
    }

    const colorInput = document.createElement("input");
    colorInput.type = "text";
    colorInput.value = defaultColor;
    colorInput.classList.add("style-input");
    colorInput.title = `Set ${property} of the selected elements to a color of choice (RGBA hex color code). Confirm with Enter`;
    colorInput.placeholder = `Enter Color`;

    colorInput.addEventListener("keypress", async function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        await handleStyleChangeEvent(property, colorInput.value);
      }
    });

    parent.appendChild(colorPicker);
    parent.appendChild(colorInput);

    if (continuousScaleBtn) {
      const contScaleBtn = document.createElement("button");
      contScaleBtn.className = "style-inner-button style-color-button style-color-gradient-button";
      contScaleBtn.title = `Set ${property} of the selected elements to a continuous scale.`;
      contScaleBtn.onclick = async () => {
        colorInput.value = "";
        await handleStyleChangeEvent(property, "set_continuous_color_scale");
      };
      parent.appendChild(contScaleBtn);
    }
  }

  function createLabelControls(parent, property, isNode = null) {
    const labelInput = createInput(120, `Enter Custom ${property}`,
      `Set the label of the selected ${isNode ? "nodes" : "edges"} to a custom label.`, undefined,
      async () => {
        isNode ? await updateNodes({
          style: {
            label: true,
            labelText: labelInput.value.trim()
          }
        }) : await updateEdges({style: {label: true, labelText: labelInput.value.trim()}});
      });

    const clearLabelButton = createButton("Clear",
      `Clear the label of the selected ${isNode ? "nodes" : "edges"}.`, async () => {
        labelInput.value = "";
        const sharedOverride = {
          style: {
            label: true,
            labelText: INVISIBLE_CHAR
          }
        };
        isNode ? await updateNodes(sharedOverride) : await updateEdges(sharedOverride);
        labelInput.value = "";
      });

    const setToIDButton = createButton("Set to ID",
      `Set the label of the selected ${isNode ? "nodes" : "edges"} to their predefined IDs.`, async () => {
        labelInput.value = "";
        const sharedCommands = ["label_set_to_id"];
        isNode ? await updateNodes(undefined, sharedCommands) : await updateEdges(undefined, sharedCommands);
      });
    const setToLabelButton = createButton("Set to Label",
      `Set the label of the selected ${isNode ? "nodes" : "edges"} to their predefined labels.`, async () => {
        labelInput.value = "";
        const sharedCommands = ["label_set_to_label"];
        isNode ? await updateNodes(undefined, sharedCommands) : await updateEdges(undefined, sharedCommands);
      });

    parent.appendChild(labelInput);
    parent.appendChild(setToIDButton);
    parent.appendChild(setToLabelButton);
    parent.appendChild(clearLabelButton);
  }

  function createButton(label, tooltip, callback, id = undefined) {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.title = tooltip;
    btn.classList.add("style-inner-button");
    if (label === "Clear") btn.classList.add("red");
    if (id) {
      btn.id = id;
    } else {
      btn.id = label;
    }
    btn.onclick = () => {
      callback();
    }
    return btn;
  }

  function appendButton(parent, label, tooltip, callback) {
    const btn = createButton(label, tooltip, callback);
    parent.appendChild(btn);
  }

  function createInput(widthInPx = 80, placeholder = undefined, title = undefined,
                       defaultValue = undefined, callback = undefined) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = placeholder;
    input.title = title;
    input.classList.add("style-input");
    input.style.width = `${widthInPx}px`;
    input.value = defaultValue || "";
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

  function createNodeShapeControls(parent) {
    for (const [label, value] of Object.entries(DEFAULTS.STYLES.NODE_FORM)) {
      appendButton(parent, label, value,
        async () => await updateNodes({type: value})
      );
    }
  }

  function createEdgeTypeControls(parent) {
    for (const label of DEFAULTS.STYLES.EDGE_TYPES) {
      appendButton(parent, label, label, async () => await updateEdge({type: label}));
    }
  }

  function createNodeBadgeControls(parent) {
    const badgeInput = createInput(120, "Enter Badge Text",
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

    appendButton(parent, "Add", "Add a badge to the selected nodes.", async () => {
      await updateNodes({
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
    appendButton(parent, "Clear", "Clear all badges from the selected nodes.", async () => {
      await updateNodes({}, ["badge_clear"]);
    });
  }

  function createFocusCard() {
    const focDiv = createCard("Focus Elements");
    const row = createNewRow(focDiv);

    appendLabel(row, "Node ID/Label", "Select the Node ID or Label to focus.", "nodeFocusLabel");
    appendEditableDropdown(row, true);

    appendVerticalRule(row);

    appendLabel(row, "Edge ID/Label", "Select the Edge ID or Label to focus.", "edgeFocusLabel");
    appendEditableDropdown(row, false);
  }

  function appendEditableDropdown(parent, isNode, widthInPx=220) {
    const input = document.createElement('input');
    const dataListID = `focusOptions${isNode ? 'Node' : 'Edge'}`;
    input.setAttribute('list', dataListID);
    input.placeholder = `Search ${isNode ? 'node' : 'edge'} ID or label...`;
    input.classList.add('style-input');
    input.style.width = `${widthInPx}px`;

    const datalist = document.createElement('datalist');
    datalist.id = dataListID;

    const sourceMap = isNode
      ? cache.nodeIDOrLabelToNodeIDs
      : cache.edgeIDOrLabelToEdgeIDs;

    for (const key of sourceMap.keys()) {
      const option = document.createElement('option');
      option.value = key;
      datalist.appendChild(option);
    }

    const focusButton = document.createElement('button');
    focusButton.textContent = 'Focus';
    focusButton.classList.add('style-inner-button');
    focusButton.onclick = async () => {
      const selectedValue = input.value;
      if (selectedValue) {
        const ids = sourceMap.get(selectedValue);
        if (ids) {
          if (ids.size !== 1) {
            warning(`Ambiguous selection: ${selectedValue} matches ${ids.size} ${isNode ? 'nodes' : 'edges'} (${Array.from(ids).join(',')}).`);
          }
          await graph.focusElement([...ids]);
        } else {
          warning(`No ${isNode ? 'node' : 'edge'} found for: ${selectedValue}`);
        }
      }
    };

    parent.appendChild(input);
    parent.appendChild(datalist);
    parent.appendChild(focusButton);
  }

  function createSelectCard() {
    const selDiv = createCard("Select Elements");

    const rowOne = createNewRow(selDiv);
    appendButton(rowOne, "All Nodes", "Select all visible nodes",
      async () => await toggleSelectionForAllNodes(true));
    appendButton(rowOne, "No Nodes", "Deselect all visible nodes",
      async () => await toggleSelectionForAllNodes(false));
    appendVerticalRule(rowOne);
    appendButton(rowOne, "All Edges", "Select all visible edges",
      async () => await toggleSelectionForAllEdges(true));
    appendButton(rowOne, "No Edges", "Deselect all visible edges",
      async () => await toggleSelectionForAllEdges(false));
    appendVerticalRule(rowOne);
    appendButton(rowOne, "Expand Edges",
      "Add all edges connected to the currently selected nodes to the selection",
      async () => await toggleSelectionByNeighbors("expand-edges"));
    appendButton(rowOne, "Reduce Edges",
      "Remove edges that do not connect two selected nodes",
      async () => await toggleSelectionByNeighbors("reduce-edges"));
    appendVerticalRule(rowOne);
    appendButton(rowOne, "Expand Neighbors",
      "Add all directly connected neighbor nodes (and their edges) to the current selection",
      async () => await toggleSelectionByNeighbors("expand-neighbors"));
    appendButton(rowOne, "Reduce Neighbors",
      "Remove the outermost layer of selected neighbor nodes (and their edges) from the ",
      async () => await toggleSelectionByNeighbors("reduce-neighbors"));

    const rowTwo = createNewRow(selDiv);
    const nodeIDsTT = "Enter comma-separated list of node IDs to add/remove to/from selection\nConfirm with Enter";
    appendLabel(rowTwo, "Node ID(s)", nodeIDsTT);
    const topTwoNodeIDs = data?.nodes?.slice(0, 2).map(n => n.id).join(',') || 'Node1,Node2';
    const nodeIDsInput = createInput(204, topTwoNodeIDs, nodeIDsTT, undefined,
      async (val) => {
        await addNodeOrEdgeIDsToSelectionWrapper(val, true);
      });
    nodeIDsInput.id = "selectByNodeIDsInput";
    rowTwo.appendChild(nodeIDsInput);
    const nodeIDsInputSwitch = createSwitch(e => {
      const btn = document.getElementById("selectByNodeIDsButton");
      if (e.target.checked) {
        btn.textContent = "Exclude";
        btn.classList.add("red");
        btn.title = "Remove the selected nodes from the selection";
      } else {
        btn.textContent = "Include";
        btn.classList.remove("red");
        btn.title = "Add the selected nodes to the selection";
      }
    }, "selectByNodeIDsSwitch");
    rowTwo.appendChild(nodeIDsInputSwitch);
    const includeNodesByIdBtn = createButton("Include", "Add the selected nodes to the selection", async () => {
      const elements = document.getElementById("selectByNodeIDsInput").value;
      if (elements) {
        await addNodeOrEdgeIDsToSelectionWrapper(elements, true);
      }
    }, "selectByNodeIDsButton");
    rowTwo.appendChild(includeNodesByIdBtn);

    const edgeIDsTT = "Enter comma-separated list of edge IDs (SourceID::TargetID) to add/remove to/from selection\nConfirm with Enter";
    appendVerticalRule(rowTwo, "Edge ID(s)", edgeIDsTT);
    const topTwoEdgeIDs = data?.edges?.slice(0, 2).map(e => e.id).join(',') || 'Node1::Node2,Node1::Node3';
    const edgeIDsInput = createInput(204, topTwoEdgeIDs, edgeIDsTT, undefined,
      async (val) => {
        await addNodeOrEdgeIDsToSelectionWrapper(val, false);
      });
    edgeIDsInput.id = "selectByEdgeIDsInput";
    rowTwo.appendChild(edgeIDsInput);
    const edgeIDsInputSwitch = createSwitch(e => {
      const btn = document.getElementById("selectByEdgeIDsButton");
      if (e.target.checked) {
        btn.textContent = "Exclude";
        btn.classList.add("red");
        btn.title = "Remove the selected edges from the selection";
      } else {
        btn.textContent = "Include";
        btn.classList.remove("red");
        btn.title = "Add the selected edges to the selection";
      }
    }, "selectByEdgeIDsSwitch");
    rowTwo.appendChild(edgeIDsInputSwitch);
    const includeEdgesByIdBtn = createButton("Include", "Add the selected nodes to the selection", async () => {
      const elements = document.getElementById("selectByEdgeIDsInput").value;
      if (elements) {
        await addNodeOrEdgeIDsToSelectionWrapper(elements, false);
      }
    }, "selectByEdgeIDsButton");
    rowTwo.appendChild(includeEdgesByIdBtn);

    conditionallyCreateNodeOrEdgeSelectionRow(selDiv);
  }

  function conditionallyCreateNodeOrEdgeSelectionRow(selDiv) {
    let row;
    if (cache.nodeLabels.length > 0 || cache.edgeLabels.length > 0) {
      row = createNewRow(selDiv);
    }

    if (cache.nodeLabels.length > 0) {
      const nodeLabelsTT = "Enter comma-separated list of node labels to add/remove to/from selection\nConfirm with Enter";
      appendLabel(row, "Node Label(s)", nodeLabelsTT);
      const topTwoNodeLabels = cache.nodeLabels?.slice(0, 2).join(',') || 'Label1,Label2';
      const nodeLabelsInput = createInput(200, topTwoNodeLabels, nodeLabelsTT, undefined,
        async (val) => {
          await addNodeOrEdgeLabelsToSelectionWrapper(val, true);
        });
      nodeLabelsInput.id = "selectByNodeLabelsInput";
      row.appendChild(nodeLabelsInput);
      const nodeLabelsInputSwitch = createSwitch(e => {
        const btn = document.getElementById("selectByNodeLabelsButton");
        if (e.target.checked) {
          btn.textContent = "Exclude";
          btn.classList.add("red");
          btn.title = "Remove the selected nodes from the selection";
        } else {
          btn.textContent = "Include";
          btn.classList.remove("red");
          btn.title = "Add the selected nodes to the selection";
        }
      }, "selectByNodeLabelsSwitch");
      row.appendChild(nodeLabelsInputSwitch);
      const includeNodesByLabelBtn = createButton("Include", "Add the selected nodes to the selection", async () => {
        const elements = document.getElementById("selectByNodeLabelsInput").value;
        if (elements) {
          await addNodeOrEdgeLabelsToSelectionWrapper(elements, true);
        }
      }, "selectByNodeLabelsButton");
      row.appendChild(includeNodesByLabelBtn);
    }

    if (cache.edgeLabels.length > 0) {
      const edgeLabelsTT = "Enter comma-separated list of edge Labels to add/remove to/from selection\nConfirm with Enter";
      appendVerticalRule(row, "Edge Label(s)", edgeLabelsTT);
      const topTwoEdgeLabels = cache.edgeLabels.slice(0, 2).join(',') || 'Label1,Label2';
      const edgeLabelsInput = createInput(200, topTwoEdgeLabels, edgeLabelsTT, undefined,
        async (val) => {
          await addNodeOrEdgeLabelsToSelectionWrapper(val, false);
        });
      edgeLabelsInput.id = "selectByEdgeLabelsInput";
      row.appendChild(edgeLabelsInput);
      const edgeLabelsInputSwitch = createSwitch(e => {
        const btn = document.getElementById("selectByEdgeLabelsButton");
        if (e.target.checked) {
          btn.textContent = "Exclude";
          btn.classList.add("red");
          btn.title = "Remove the selected edges from the selection";
        } else {
          btn.textContent = "Include";
          btn.classList.remove("red");
          btn.title = "Add the selected edges to the selection";
        }
      }, "selectByEdgeLabelsSwitch");
      row.appendChild(edgeLabelsInputSwitch);
      const includeEdgesByLabelBtn = createButton("Include", "Add the selected nodes to the selection", async () => {
        const elements = document.getElementById("selectByEdgeLabelsInput").value;
        if (elements) {
          await addNodeOrEdgeLabelsToSelectionWrapper(elements, false);
        }
      }, "selectByEdgeLabelsButton");
      row.appendChild(includeEdgesByLabelBtn);
    }
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
    appendButton(rowOne, "Grid", "Apply a uniform grid layout to the selected nodes.",
      () => layoutSelectedNodes("grid"));
    appendButton(rowOne, "Random", "Apply a random layout to the selected nodes while preserving the original layout bonds.",
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

  createFocusCard();
  createSelectCard();
  createArrangeNodesCard();
  createNodeConfigCard();
  createEdgeConfigCard();

  return root;
}

async function focusNodes(nodeIDs = undefined) {
  if (!nodeIDs) {
    nodeIDs = cache.selectedNodes;
  }
  await graph.focusElement([...nodeIDs]);
}

async function focusEdges(edgeIDs = undefined) {
  if (!edgeIDs) {
    edgeIDs = cache.selectedEdges;
  }
  await graph.focusElement([...edgeIDs]);
}

async function updateEdges(overrides = {}, commands = []) {
  let colorMap = null;
  if (commands.includes("set_continuous_color_scale")) {
    colorMap = await picker.pickColors("edges");
    if (!colorMap) {
      info("Aborted color picker");
      return;
    }
  }

  for (const edgeID of cache.selectedEdges) {
    const edge = cache.edgeRef.get(edgeID);

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
      deepMerge(edge, overridesCopy);
    } else {
      deepMerge(edge, overrides);
    }
    cache.edgeRef.set(edgeID, edge);
  }

  await handleStyleChangeLoadingEvent("Style", "Updating Edge Styles");
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

async function updateNodes(overrides = {}, commands = []) {
  let colorMap = null;
  if (commands.includes("set_continuous_color_scale")) {
    colorMap = await picker.pickColors("nodes");
    if (!colorMap) {
      info("Aborted color picker");
      return;
    }
  }

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
    if (colorMap) {
      const overridesCopy = structuredClone(overrides);
      replaceColorScale(overridesCopy, nodeID, colorMap);
      deepMerge(node, overridesCopy);
    } else {
      deepMerge(node, overrides);
    }
    cache.nodeRef.set(nodeID, node);
  }
  await handleStyleChangeLoadingEvent("Style", `Updating Node Styles`);
}

function replaceColorScale(obj, elemID, colorMap) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  for (let key in obj) {
    const value = obj[key];

    if (value === "set_continuous_color_scale") {
      obj[key] = colorMap.get(elemID);
    } else if (typeof value === 'object') {
      replaceColorScale(value, elemID, colorMap);
    }
  }

  return obj;
}

function toggleStyleElementsThatRequireAtLeastOneSelectedNode(enable) {
  toggleStyleElements([
    "Node Configuration", "Expand Edges", "Reduce Edges", "Expand Neighbors", "Reduce Neighbors",
    "deselectNodesBtn", "focusNodesBtn"
  ], enable);
}

function toggleStyleElementsThatRequireAtLeastOneSelectedEdge(enable) {
  toggleStyleElements(["Edge Configuration", "deselectEdgesBtn", "focusEdgesBtn"], enable);
}

function toggleStyleElementsThatRequireAtLeastOneSelectedNodeOrEdge(enable) {
  toggleStyleElements([], enable);
}

function toggleStyleElementsThatRequireAtLeastOneVisibleNode(enable) {
  toggleStyleElements(["selectByNodeIDsInput", "Node ID(s)", "selectByNodeIDsSwitch",
    "selectByNodeIDsSwitchLabel", "selectByNodeIDsButton"], enable);
}

function toggleStyleElementsThatRequireAtLeastOneVisibleEdge(enable) {
  toggleStyleElements(["selectByEdgeIDsInput", "Edge ID(s)", "selectByEdgeIDsSwitch",
    "selectByEdgeIDsSwitchLabel", "selectByEdgeIDsButton"], enable);
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

async function updateSelectedState(elemData, enable) {
  await showLoading(enable ? "Selecting" : "Deselecting", `Modifying selection of ${elemData.length} elements`);
  await new Promise(resolve => requestAnimationFrame(resolve));

  // faster routine than setting each individual setElementState
  const updatedData = [];
  for (const item of elemData) {
    const elem = graph.getElementData(item.id);
    updateElementSelectedState(elem, enable);
    updatedData.push(elem);
  }
  await graph.updateData(updatedData);
  await graph.render();

  await hideLoading();
  await new Promise(resolve => requestAnimationFrame(resolve));
}

function updateElementSelectedState(element, shouldSelect) {
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

async function toggleSelectionForAllNodes(enable) {
  const nodes = await graph.getNodeData();
  await updateSelectedState(nodes, enable);
}

async function toggleSelectionForAllEdges(enable) {
  const edges = await graph.getEdgeData();
  await updateSelectedState(edges, enable);
}

async function syncSelectionCacheAndElementStates() {
  const snapshot = cache.selectionMemory[cache.selectedMemoryIndex];

  cache.selectedNodes = snapshot.nodes;
  cache.selectedEdges = snapshot.edges;

  for (const node of graph.getNodeData()) {
    updateElementSelectedState(node, snapshot.nodes.includes(node.id));
  }
  for (const edge of graph.getEdgeData()) {
    updateElementSelectedState(edge, snapshot.edges.includes(edge.id));
  }
  await graph.render();
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

async function addNodeOrEdgeIDsToSelectionWrapper(elementIDs, isNode) {
  const shouldAdd = isNode
    ? !document.getElementById("selectByNodeIDsSwitch").checked
    : !document.getElementById("selectByEdgeIDsSwitch").checked;
  const elementIDsAsArray = elementIDs ? elementIDs.split(",") : [];

  await addNodeOrEdgeIDsToSelection(elementIDsAsArray, isNode, shouldAdd);
}

async function addNodeOrEdgeLabelsToSelectionWrapper(elementLabels, isNode) {
  const elementLabelsAsArray = elementLabels ? elementLabels.split(",") : [];

  const elementIDs = elementLabelsAsArray.flatMap(label => {
    const set = isNode
      ? cache.nodeLabelToNodeIDs.get(label)
      : cache.edgeLabelToEdgeIDs.get(label);
    return set ? Array.from(set) : [];
  });

  const shouldAdd = isNode
    ? !document.getElementById("selectByNodeLabelsSwitch").checked
    : !document.getElementById("selectByEdgeLabelsSwitch").checked;

  await addNodeOrEdgeIDsToSelection(elementIDs, isNode, shouldAdd);
}

async function addNodeOrEdgeIDsToSelection(elementIDs, isNode, shouldAdd) {

  const elemDescription = isNode ? "Node" : "Edge";

  const visibleElements = isNode ? cache.nodeIDsToBeShown : cache.edgeIDsToBeShown;
  const existingElements = isNode ? cache.nodeRef.keys().toArray() : cache.edgeRef.keys().toArray();
  const selectedElements = isNode ? cache.selectedNodes : cache.selectedEdges;
  const ref = isNode ? cache.nodeRef : cache.edgeRef;

  for (const elemID of elementIDs) {
    if (!existingElements.includes(elemID)) {
      error(`${elemDescription} with ID: '${elemID}' does not exist!`);
      continue;
    }

    if (!visibleElements.has(elemID)) {
      warning(`Cannot update selection of ${elemDescription} with ID: '${elemID}' as it is not visible.`);
      continue;
    }

    const elementsToUpdate = [];
    if (!selectedElements.includes(elemID) || !shouldAdd) {
      elementsToUpdate.push(ref.get(elemID));
    }

    if (elementsToUpdate.length > 0) {
      await updateSelectedState(elementsToUpdate, shouldAdd);
    }
  }
}

async function toggleSelectionByNeighbors(mode) {
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

  async function update() {
    if (edgesToShow.length > 0) await updateSelectedState(edgesToShow, true);
    if (edgesToHide.length > 0) await updateSelectedState(edgesToHide, false);
    if (nodesToShow.length > 0) await updateSelectedState(nodesToShow, true);
    if (nodesToHide.length > 0) await updateSelectedState(nodesToHide, false);
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

    default:
      break;
  }

  await update();
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
    error("No file selected.");
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
        }).catch((errorMsg) => {
          error(`Error reading Excel file: ${errorMsg}`);
          return null;
        });


      default:
        error(`Unsupported file type: ${fileType}`);
    }
  } catch (errorMsg) {
    error(`Failed to load file: ${errorMsg}`);
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
          error("File does not contain edges or nodes.");
          resolve(null);
        } else {
          resolve(jsonContent);
        }
      } catch (errorMsg) {
        error(`Failed to parse file as JSON: ${errorMsg}`);
        resolve(null);
      }
    };
    reader.onerror = () => {
      error(`Failed to load file: ${reader.error}`);
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

  function sanitizeColumns(sheetJson, sheetDescriptor) {
    if (!sheetJson || sheetJson.length === 0) return;

    const firstRow = sheetJson[0];
    const columnMapping = {};

    Object.keys(firstRow).forEach(originalKey => {
      if (originalKey.startsWith('__EMPTY')) return;

      if (originalKey.includes('(') || originalKey.includes(')')) {
        columnMapping[originalKey] = originalKey.replace(/\(/g, '[').replace(/\)/g, ']');
      }
    });

    sheetJson.forEach(row => {
      Object.entries(columnMapping).forEach(([originalKey, sanitizedKey]) => {
        if (row.hasOwnProperty(originalKey)) {
          row[sanitizedKey] = row[originalKey];
          delete row[originalKey];
        }
      });
    });

    Object.entries(columnMapping).forEach(([original, sanitized]) => {
      warning(`Column "${original}" in "${sheetDescriptor}" sheet was renamed to "${sanitized}" for proper group parsing.`);
    });
  }

  function removeEmptyColumns(sheetJson, sheetDescriptor) {
    const propertyDefs = sheetDescriptor === 'edges'
      ? EXCEL_EDGE_PROPERTIES : EXCEL_NODE_PROPERTIES;
    const requiredCols = propertyDefs.filter(prop => prop.required).map(prop => prop.column);
    const optionalCols = propertyDefs.filter(prop => !prop.required).map(prop => prop.column);

    const allCols = Object.keys(sheetJson[0]).filter(c => !c.startsWith("__EMPTY"));

    const isColumnEmpty = (col) => sheetJson.every(row => {
      const v = row[col];
      return v === null || v.toString().trim() === "";
    });

    const emptyRequiredColumns = allCols.filter(col =>
      requiredCols.includes(col) && isColumnEmpty(col)
    );

    const emptyOptionalColumns = allCols.filter(col =>
      optionalCols.includes(col) && isColumnEmpty(col)
    );

    const emptyUserColumns = allCols.filter(col =>
      !requiredCols.includes(col) &&
      !optionalCols.includes(col) &&
      isColumnEmpty(col)
    );


    emptyRequiredColumns.forEach(col => {
      error(`Required column "${col}" in "${sheetDescriptor}" sheet is empty.`);
    });

    emptyOptionalColumns.forEach(col => {
      info(`Optional column "${col}" in "${sheetDescriptor}" sheet is empty.`);
    });

    emptyUserColumns.forEach(col => {
      warning(`User defined column "${col}" in "${sheetDescriptor}" sheet is empty.`);
    });

    const allEmptyColumns = [...emptyRequiredColumns, ...emptyOptionalColumns, ...emptyUserColumns];
    sheetJson.forEach(row => {
      allEmptyColumns.forEach(col => delete row[col]);
    });
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

  sanitizeColumns(nodesData, "nodes");
  sanitizeColumns(edgesData, "edges");

  removeEmptyColumns(nodesData, "nodes");
  removeEmptyColumns(edgesData, "edges");

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
    let trimmedKey;

    const matches = key.match(/\[.*?\]/g);
    if (matches && matches.length >= 2) {
      const lastBracketContent = matches[matches.length - 1];
      subGroup = lastBracketContent.substring(1, lastBracketContent.length - 1).trim();

      // For multiple brackets, preserve all except the last one in the key
      const lastBracketIndex = key.lastIndexOf(matches[matches.length - 1]);
      trimmedKey = key.substring(0, lastBracketIndex).trim();
    } else if (matches && matches.length === 1) {
      const bracketContent = matches[0];
      subGroup = bracketContent.substring(1, bracketContent.length - 1).trim();
      trimmedKey = key.substring(0, key.indexOf('[')).trim();
    } else {
      trimmedKey = key.trim();
    }

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

async function createGraphInstance() {
  if (graph === null) {

    const behaviors = [
      DEFAULTS.BEHAVIOURS.DRAG_CANVAS,
      DEFAULTS.BEHAVIOURS.ZOOM_CANVAS,
      DEFAULTS.BEHAVIOURS.DRAG_ELEMENT
    ];

    if (!PERFORMANCE_MODE) {
      behaviors.push(DEFAULTS.BEHAVIOURS.HOVER_ACTIVATE);
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
        avoidMembers: [INVISIBLE_DUMMY_NODE.id],
        // avoidMembers: [...cache.nodeRef.keys()],
        ...DEFAULTS.BUBBLE_GROUP_STYLE[group],
        strokeOpacity: 0,  // hide bubble groups initially (1 node persists due to bug)
        fillOpacity: 0,
        label: false,
      })),
    ];
    // foo

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

    graph.on("node:dragend", async () => {
      /**
       * Persist all positions on every drag event
       */
      if (EVENT_LOCKS.DRAG_END_RUNNING) return;

      debug("DRAG END");
      EVENT_LOCKS.DRAG_END_RUNNING = true;
      await persistNodePositions();
      EVENT_LOCKS.DRAG_END_RUNNING = false;
    })

    graph.on("beforelayout", async () => {
      debug("BEFORE LAYOUT");
    })

    graph.on("afterlayout", async () => {
      /**
       * Applies persisted positions (excel data or after moving nodes) after layouting has finished
       */
      if (EVENT_LOCKS.AFTER_LAYOUT_RUNNING) return;

      debug("AFTER LAYOUT");
      EVENT_LOCKS.AFTER_LAYOUT_RUNNING = true;

      if (data.layouts[data.selectedLayout].positions.size > 0) {
        graph.updateNodeData(Array.from(data.layouts[data.selectedLayout].positions, ([id, pos]) => ({
          id,
          style: pos.style
        })));
        await graph.draw();
      }
      EVENT_LOCKS.AFTER_LAYOUT_RUNNING = false;
    })

    graph.on("canvas:click", async (event) => {
      debug("CANVAS CLICK");
    });

    // graph.off("canvas:click");

    graph.on("node:click", async (event) => {
      debug("NODE CLICK");
    })

    graph.on("edge:click", async (event) => {
      debug("EDGE CLICK");
    })

    graph.on(GraphEvent.BEFORE_DRAW, async (event) => {
      if (EVENT_LOCKS.BEFORE_DRAW_RUNNING) return;

      EVENT_LOCKS.BEFORE_DRAW_RUNNING = true;
      debug("BEFORE DRAW");
      if (EVENT_LOCKS.IS_DESELECTING) {
        debug("BEFORE DRAW DESELECTION EVENT");
        EVENT_LOCKS.IS_DESELECTING = false;
      }
      EVENT_LOCKS.BEFORE_DRAW_RUNNING = false;
    });

    graph.on(GraphEvent.AFTER_DRAW, async (event) => {
      if (EVENT_LOCKS.AFTER_DRAW_RUNNING) return;

      EVENT_LOCKS.AFTER_DRAW_RUNNING = true;
      debug("AFTER DRAW");
      await updateSelectedNodesAndEdges();
      await redrawBubbleSets();

      EVENT_LOCKS.AFTER_DRAW_RUNNING = false;
      await hideLoading();
    });


    graph.on(GraphEvent.AFTER_RENDER, async () => {
      debug("AFTER RENDER");

      if (EVENT_LOCKS.ONCE_AFTER_RENDER_COMPLETED) {
        if (EVENT_LOCKS.AFTER_RENDER_RUNNING) return;

        EVENT_LOCKS.AFTER_RENDER_RUNNING = true;

        await updateSelectedNodesAndEdges();
        await redrawBubbleSets();

        EVENT_LOCKS.AFTER_RENDER_RUNNING = false;
        await hideLoading();
      } else {
        await initialAfterRenderEvent();
      }
    });

    async function initialAfterRenderEvent() {
      if (EVENT_LOCKS.ONCE_AFTER_RENDER_RUNNING) return;

      try {
        debug("ONCE AFTER RENDER");
        await showLoading("Post-processing", "Post-processing ..");
        await new Promise(resolve => requestAnimationFrame(resolve));
        EVENT_LOCKS.ONCE_AFTER_RENDER_RUNNING = true;

        await showLoading("Post-processing", "Registering event listeners ..");
        await new Promise(resolve => requestAnimationFrame(resolve));
        registerHotkeyEvents();
        registerGlobalEventListeners();
        await registerPluginStates();

        // to initially fill caches related to the query/filters, preRenderEvent is called without rendering afterwards
        await showLoading("Post-processing", "Pre-render event ..");
        await new Promise(resolve => requestAnimationFrame(resolve));
        await preRenderEvent();

        await showLoading("Post-processing", "Updating metrics UI ..");
        await new Promise(resolve => requestAnimationFrame(resolve));
        await cache.metrics.updateUI();

        await showLoading("Post-processing", "Finalizing rendering ..");
        await new Promise(resolve => requestAnimationFrame(resolve));

        if (EVENT_LOCKS.TRIGGER_SET_LAYOUT_ONCE) {
          // suppresses the info in case of loading from a json model
          if (cache.nodePositionsFromExcelImport.size !== 0) {
            info(`Created view "${DEFAULTS.CUSTOM_LAYOUT_NAME}". Applying ${DEFAULTS.LAYOUT} layout to nodes without coordinates ..`);
          }
          await graph.setLayout({type: DEFAULTS.LAYOUT, ...DEFAULTS.LAYOUT_INTERNALS[DEFAULTS.LAYOUT]});
        }

        EVENT_LOCKS.ONCE_AFTER_RENDER_COMPLETED = true;
        await graph.render();

        if (EVENT_LOCKS.TRIGGER_SET_LAYOUT_ONCE) {
          debug("Initially persisting custom layout ..");
          await persistNodePositions();
          EVENT_LOCKS.TRIGGER_SET_LAYOUT_ONCE = false;
        }

        await setInitialNodePositions();
      } catch (errorMsg) {
        error(`Error in GraphEvent.AFTER_RENDER: ${errorMsg}`);
        error("Graph setup failed. Please check your input data.");
        await hideLoading();
      } finally {
        EVENT_LOCKS.ONCE_AFTER_RENDER_RUNNING = false;
      }
    }

    let layout = data.layouts[data.selectedLayout];
    if (!layout.isCustom) {
      await graph.setLayout({type: data.selectedLayout, ...layout.internals});
    }
  }
}

async function debugPositions() {
  for (const nodeID of cache.nodeRef.keys()) {
    const pos = await graph.getElementPosition(nodeID);
    console.log(`${nodeID}: ${pos[0]}, ${pos[1]}, ${pos[2]}`);
  }
}

async function nodePositionsAreInSync() {
  for (const node of await graph.getNodeData()) {
    const existing = data.layouts[data.selectedLayout].positions?.get(node.id);
    if (!existing) continue;
    if (node.style.x !== existing.style.x || node.style.y !== existing.style.y) {
      return false;
    }
  }
  return true;
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

async function updateSelectedNodesAndEdges() {
  cache.selectedNodes = await graph.getNodeData()
    .filter((n) => n.states?.includes("selected") && cache.nodeIDsToBeShown.has(n.id))
    .map((n) => n.id);
  cache.selectedEdges = await graph.getEdgeData()
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

  if (atLeastOneNodeOrEdgeSelected || cache.selectionMemory.length > 1) {
    document.getElementById("selectedElementsContainer").classList.remove("hidden");
  } else {
    document.getElementById("selectedElementsContainer").classList.add("hidden");
  }

  toggleStyleElementsThatRequireAtLeastOneSelectedNode(atLeastOneNodeSelected);
  toggleStyleElementsThatRequireAtLeastOneSelectedEdge(atLeastOneEdgeSelected);
  toggleStyleElementsThatRequireAtLeastOneSelectedNodeOrEdge(atLeastOneNodeOrEdgeSelected);
  toggleStyleElementsThatRequireMoreThanOneSelectedNode(moreThanOneNodeSelected);

  updateSelectionCache();
  updateEnabledStateUndoRedoSelectionButtons();
}

function toggleQueryEditor() {
  const btn = document.getElementById("queryToggleBtn");
  let shouldEnable = !btn.classList.contains("highlight");

  const mainContent = document.getElementById("mainContent");
  const bottomBar = document.getElementById("bottomBar");
  const queryButtons = document.querySelectorAll('.add-to-query-button');

  mainContent.style.height = shouldEnable ? "90%" : "100%";
  bottomBar.style.height = shouldEnable ? "10%" : "0";
  bottomBar.classList.toggle("active", shouldEnable);
  btn.classList.toggle("highlight", shouldEnable);

  queryButtons.forEach(btn => btn.classList.toggle("show", shouldEnable));
}

async function toggleEditMode() {
  const editBtn = document.getElementById("editBtn");
  let editModeActive = editBtn.classList.contains("active");
  editModeActive ? editBtn.classList.remove("active") : editBtn.classList.add("active");

  handleEditModeUIChanges();
}

async function toggleLassoSelection() {
  const lassoWrapper = document.getElementById("lassoWrapper");
  let lassoIsActive = lassoWrapper.classList.contains("active");
  lassoIsActive ? lassoWrapper.classList.remove("active") : lassoWrapper.classList.add("active");

  const clickAndDragBehaviors = [
    DEFAULTS.BEHAVIOURS.DRAG_CANVAS,
    DEFAULTS.BEHAVIOURS.DRAG_ELEMENT
  ];

  if (!PERFORMANCE_MODE) {
    clickAndDragBehaviors.push(DEFAULTS.BEHAVIOURS.HOVER_ACTIVATE);
  }

  const lassoBehaviors = [
    DEFAULTS.BEHAVIOURS.LASSO_SELECT,
  ];

  if (!APPLY_BUBBLE_SET_HOTFIX || (APPLY_BUBBLE_SET_HOTFIX && !PERFORMANCE_MODE)) {
    lassoBehaviors.push(DEFAULTS.BEHAVIOURS.CLICK_SELECT);
  }

  let behaviors = await graph.getBehaviors()
    .filter(b => ![
      ...clickAndDragBehaviors.map(b => b.type),
      ...lassoBehaviors.map(b => b.type)
    ].includes(b.type));

  lassoIsActive ? info("Switched to click and drag mode") : info("Switched to lasso selection mode");

  await graph.setBehaviors([...behaviors, ...lassoIsActive ? clickAndDragBehaviors : lassoBehaviors]);
  await graph.updatePlugin({key: 'tooltip', enable: lassoIsActive});
}

function handleEditModeUIChanges() {
  const editBtn = document.getElementById("editBtn");
  const container = document.getElementById("sidebarContentContainer");
  const sidebar = document.getElementById("sidebar");
  const status = document.getElementById("sidebarStatusContainer");

  const editModeActive = editBtn.classList.contains("active");

  editModeActive ? editBtn.classList.add("highlight") : editBtn.classList.remove("highlight");

  container.style.paddingRight = editModeActive ? "6px" : "0";

  // handle all edit elements
  const editElements = document.querySelectorAll('.show-on-edit, .show-on-edit-full-width');
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

  sidebar.style.maxWidth = editModeActive ? "100%" : "unset";
  status.style.maxWidth = editModeActive ? `${container.offsetWidth}px` : "375px";

  const metricsContainer = document.getElementById("networkMetricsContainer");
  metricsContainer.style.maxWidth = editModeActive ? `${container.offsetWidth}px` : "350px";
}

function* traverseBubbleSets() {
  for (let group of Object.keys(DEFAULTS.BUBBLE_GROUP_STYLE)) {
    yield group;
  }
}

async function updateBubbleSet(group, members) {
  let empty = !members || members.size === 0;
  const membersAsArray = [...members];

  function getAvoidMembers() {
    if (empty) return [];
    if (APPLY_BUBBLE_SET_HOTFIX && PERFORMANCE_MODE) return [];
    if (AVOID_NON_BUBBLE_GROUP_MEMBERS) return [];
    return [...cache.nodeRef.keys()].filter(nodeID => !membersAsArray.includes(nodeID));
  }

  const avoidMembers = getAvoidMembers();

  if (arraysAreEqual(membersAsArray, [...INSTANCES.BUBBLE_GROUPS[group].members.keys()])) {
    debug("BUBBLE GROUPS IN SYNC - SKIPPING UPDATE");
    return;
  }

  await INSTANCES.BUBBLE_GROUPS[group].update({
    members: empty ? [] : membersAsArray,
    avoidMembers: avoidMembers,
    fillOpacity: empty ? 0 : DEFAULTS.BUBBLE_GROUP_STYLE[group].fillOpacity,
    strokeOpacity: empty ? 0 : DEFAULTS.BUBBLE_GROUP_STYLE[group].strokeOpacity,
    label: empty ? false : DEFAULTS.BUBBLE_GROUP_STYLE[group].label,
  });
  await INSTANCES.BUBBLE_GROUPS[group].drawBubbleSets();
}

async function clearBubbleSetInstanceMembers() {
  for (const group of traverseBubbleSets()) {
    await INSTANCES.BUBBLE_GROUPS[group].update({
      members: [],
    });
  }
}

function setsAreEqual(setA, setB) {
  if (setA.size !== setB.size) return false;
  for (let item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
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
      const position = data.layouts[data.selectedLayout].positions.get(node.id);

      Object.assign(filteredNode, getNodeStyleOrDefaults(node));

      if (position) {
        filteredNode.style.x = position.x;
        filteredNode.style.y = position.y;
      }

      if (resetToCachedPositions) {
        const {style: {x, y}} = cache.initialNodePositions.get(data.selectedLayout).get(node.id);
        Object.assign(filteredNode.style, {x, y});
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
    nodes: [...filteredNodes, INVISIBLE_DUMMY_NODE], edges: filteredEdges, combos: data.combos || [],
  };
}

async function setInitialNodePositions(override = false) {
  if (!cache.initialNodePositions.has(data.selectedLayout) || override) {
    debug(`Setting initial node positions for layout "${data.selectedLayout}" ..`);
    cache.initialNodePositions.set(data.selectedLayout, new Map());
    for (const nodeID of cache.nodeRef.keys()) {
      const pos = await graph.getElementPosition(nodeID);
      cache.initialNodePositions.get(data.selectedLayout).set(nodeID, {style: {x: pos[0], y: pos[1]}});
    }
  }
}

async function restoreInitialNodePositions() {
  for (const nodeID of cache.nodeRef.keys()) {
    const currentPos = await graph.getElementPosition(nodeID);
    const initialPos = cache.initialNodePositions.get(data.selectedLayout).get(nodeID);
    if (currentPos[0] !== initialPos.style.x || currentPos[1] !== initialPos.style.y) {
      await graph.translateElementTo(nodeID, [initialPos.style.x, initialPos.style.y]);
    }
  }
}

function decodeQueryAndBuildAST() {
  const instructions = decodeQuery();
  query.ast = new QueryAST(instructions);
}

async function preRenderEvent() {
  cache.nodeIDsToBeShown = new Set();
  cache.propIDsToNodeIDsToBeShown = new Map();  // this is used by the bubble-grouping functionality after rendering
  cache.edgeIDsToBeShown = new Set();
  cache.propIDsToEdgeIDsToBeShown = new Map();
  cache.remainingEdgeRelatedNodes = new Set();
  resetFeatureIsWithinThresholdMaps();
  cache.bubbleSetChanged = false;
  decodeQueryAndBuildAST();

  for (const node of cache.nodeRef.values()) {
    if (query.ast.testNode(node)) {
      cache.nodeIDsToBeShown.add(node.id);
      node.featureIsWithinThreshold.forEach((v, k) => {
        if (v === true) {
          if (!cache.propIDsToNodeIDsToBeShown.has(k)) {
            cache.propIDsToNodeIDsToBeShown.set(k, new Set());
          }
          cache.propIDsToNodeIDsToBeShown.get(k).add(node.id);
        }
      });
    }
    // else debug(`Node ${node.id} did not fulfill filter!`);
  }

  for (const edge of cache.edgeRef.values()) {
    const endsOk = cache.nodeIDsToBeShown.has(edge.source) &&
      cache.nodeIDsToBeShown.has(edge.target);

    if (endsOk && (query.ast.testEdge(edge))) {
      cache.edgeIDsToBeShown.add(edge.id);
      edge.featureIsWithinThreshold.forEach((v, k) => {
        if (v === true) {
          if (!cache.propIDsToEdgeIDsToBeShown.has(k)) {
            cache.propIDsToEdgeIDsToBeShown.set(k, new Set());
          }
          cache.propIDsToEdgeIDsToBeShown.get(k).add(edge.id);
        }
      });
    }
    // else debug(`Edge ${edge.id} did not fulfill filter!`);
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

  await updateElementVisibility(idsToShow, idsToHide);
  await updateBubbleSetIfChanged();
}

async function updateElementVisibility(idsToShow, idsToHide) {
  cache.visibleElementsChanged = false;
  const {nodes, edges} = await graph.getData();
  const {visible, hidden} = [...nodes, ...edges].reduce((acc, item) => {
    acc[item.style.visibility === "visible" ? 'visible' : 'hidden'].push(item.id);
    return acc;
  }, {visible: [], hidden: []});

  const showElementsDiff = idsToShow.filter(id => hidden.includes(id));
  const hideElementsDiff = idsToHide.filter(id => visible.includes(id));

  if (showElementsDiff.length > 0) {
    await graph.showElement(showElementsDiff);
    cache.visibleElementsChanged = true;
  }
  if (hideElementsDiff.length > 0) {
    await graph.hideElement(hideElementsDiff);
    cache.visibleElementsChanged = true;
  }

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

async function toggleCleanUpDanglingElements(btn) {
  const shouldEnable = btn.classList.contains("red");

  if (shouldEnable) {
    btn.classList.remove("red");
    btn.classList.add("green", "highlight");
    btn.title = "Show all nodes and edges, irrespectively of their connectedness.";
    btn.textContent = "👁";
    await hideDanglingElements();
  } else {
    btn.classList.remove("green", "highlight");
    btn.classList.add("red");
    btn.title = "Hide all nodes and edges that are not connected to any other node or edge.";
    btn.textContent = "🚫";
    await showDanglingElements();
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

async function hideDanglingElements() {
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

  await handleFilterEvent("Hiding Elements", "Hiding nodes and edges that are not connected to any other node or edge.");
}

async function showDanglingElements() {
  cache.hiddenDanglingNodeIDs.clear();
  cache.hiddenDanglingEdgeIDs.clear();

  await handleFilterEvent("Showing Elements",
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

async function updateBubbleSetIfChanged() {
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
      await updateBubbleSet(group, newSetMembers);
      cache.lastBubbleSetMembers.set(group, newSetMembers);
      cache.bubbleSetChanged = true;
    }
  }
}

function isInteger(value) {
  return value % 1 === 0;
}

function formatNumber(value, precision) {
  return isInteger(value) ? value : parseFloat(value).toFixed(precision);
}

function getLineMetrics(el) {
  if (!el || !el.firstChild) {
    return {lines: 0, lastLineWidth: 0};
  }

  const range = document.createRange();
  range.selectNodeContents(el);

  // All rectangles created by the text flow.
  const rects = Array.from(range.getClientRects());

  // Group by the rectangle's top coordinate (≈ line-id).
  // Using a rounded value avoids sub-pixel duplicates.
  const groups = new Map(); // top -> [rects]

  rects.forEach(rc => {
    const key = Math.round(rc.top);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(rc);
  });

  // Number of distinct "top" positions ⇒ line count.
  const lines = groups.size;
  if (lines === 0) return {lines: 0, lastLineWidth: 0};

  // Get rects belonging to the last (visually lowest) line.
  const lastTop = Math.max(...groups.keys());
  const lastRects = groups.get(lastTop);

  // Combine segments to obtain total visual width of that line.
  // (If inline spans break the line into pieces, merge them.)
  const left = Math.min(...lastRects.map(r => r.left));
  const right = Math.max(...lastRects.map(r => r.right));
  const lastLineWidth = Math.round(right - left);

  return {lines, lastLineWidth};
}


function validateAlignment() {
  // read real widths of the two layers
  const mText = getLineMetrics(query.text);
  const mOverlay = getLineMetrics(query.overlay);

  const linesMatch = mText.lines === mOverlay.lines;
  const lastWidthMatch = Math.abs(mText.lastLineWidth - mOverlay.lastLineWidth) <= 1;  // 1 pixel tolerance

  if (linesMatch && lastWidthMatch) {
    if (query.sizeChangeLocked) {
      // let flexbox resize again
      query.text.style.removeProperty('width');
      query.overlay.style.removeProperty('width');
      query.sizeChangeLocked = false;
      console.info("Alignment restored, width unlocked");
    }

    query.lastGoodWidth = query.text.offsetWidth;
    return;
  }

  // freeze both layers at the last known good width
  if (!query.sizeChangeLocked && query.lastGoodWidth > 0) {
    console.warn(
      `Mismatch — lines: ${mText.lines}/${mOverlay.lines}, ` +
      `last width: ${mText.lastLineWidth}/${mOverlay.lastLineWidth}. ` +
      `Locking at ${query.lastGoodWidth}px`
    );
    query.text.style.width = `${query.lastGoodWidth}px`;
    query.overlay.style.width = `${query.lastGoodWidth}px`;
    query.sizeChangeLocked = true;
  }
}

function buildUI() {
  query.text = document.getElementById("queryTextArea");
  query.overlay = document.getElementById("queryOverlay");
  query.caret = document.getElementById("queryCaret");
  query.editorDiv = document.getElementById("queryEditor");

  query.sizeObserver = new ResizeObserver(() => requestAnimationFrame(validateAlignment));
  query.sizeObserver.observe(query.editorDiv);

  query.text.addEventListener("scroll", () => {
    query.overlay.scrollTop = query.text.scrollTop;
    query.overlay.scrollLeft = query.text.scrollLeft;
  });

  buildDropdownOptions();
  buildMetricsUI();
  buildFilterUI();
  showUI(true);

  query.lastGoodWidth = query.editorDiv.offsetWidth;
  validateAlignment();
}

function buildDropdownOptions() {
  let selectViewDropdown = document.getElementById('selectView');
  let selectViewOptions = Object.keys(data.layouts).map(key => {
    let selected = data.selectedLayout === key ? "selected" : "";
    return `<option value="${key}" ${selected}>${key}</option>`;
  });
  selectViewDropdown.innerHTML = selectViewOptions.join("");
}

function buildFilterUI() {
  const div = document.getElementById("filterContainer");
  div.innerHTML = "";

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
      headerDiv.className = "header-card";

      const header = document.createElement("h4");
      header.textContent = section;
      header.className = "m-0 white";
      headerDiv.appendChild(header);

      headerDiv.appendChild(createSectionToggleButton(false, section));
      headerDiv.appendChild(createSectionResetButton(section));
      headerDiv.appendChild(createSectionToggleButton(true, section));

      div.appendChild(headerDiv);
      div.appendChild(document.createElement("br"));
      sectionsCreated.add(section);
    }

    if (!subSectionsCreated.has(`${section}::${subSection}`)) {
      const subHeaderDiv = document.createElement("div");
      subHeaderDiv.className = "sub-header-card";

      const subHeader = document.createElement("h5");
      subHeader.textContent = subSection;
      subHeader.className = "m-0 inline";
      subHeaderDiv.appendChild(subHeader);

      subHeaderDiv.appendChild(createSectionToggleButton(false, section, subSection));
      subHeaderDiv.appendChild(createSectionResetButton(section, subSection));
      subHeaderDiv.appendChild(createSectionToggleButton(true, section, subSection));

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

  manageDynamicWidgets();
  handleEditModeUIChanges();
  updateQueryTextArea();
}

function buildMetricsUI() {
  const div = document.getElementById("metricsContainer");
  div.innerHTML = "";
  div.appendChild(cache.metrics.buildUI());
}

async function saveStash() {
  const select = document.getElementById("selectStash");
  let stashName = await Popup.prompt("Enter Filter Profile Name: ");
  if (!stashName) {
    info("Creating filter profile canceled");
    return;
  }

  let existing = Object.keys(data.stash);

  if (existing.includes(stashName)) {
    error(`Filter profile with name "${stashName}" already exists.`);
    return;
  }

  await captureStashSnapshot(stashName);

  refreshStashUI();
  select.value = stashName;
  info(`Created filter profile: ${stashName}`)
}

async function overwriteStash() {
  const stashName = document.getElementById("selectStash").value;
  if (stashName == null || stashName === "") return;

  await captureStashSnapshot(stashName);
  info(`Overwrote filter profile: ${stashName}`);
}

async function captureStashSnapshot(stashName) {
  data.stash[stashName] = {
    query: structuredClone(query.text.textContent),
    groupedProps: {},
    filters: structuredClone(data.layouts[data.selectedLayout].filters),
    bubbleSets: {},
    selectedNodes: [...cache.selectedNodes],
    selectedEdges: [...cache.selectedEdges],
  }

  for (const group of traverseBubbleSets()) {
    data.stash[stashName].bubbleSets[group] = [...INSTANCES.BUBBLE_GROUPS[group].members.keys()];
    data.stash[stashName].groupedProps[group] = new Set([...data.layouts[data.selectedLayout][`${group}Props`]]);
  }

  await captureStashViewport(stashName);
}

async function captureStashViewport(stashName) {
  const currentZoom = await graph.getZoom();

  await graph.zoomTo(1, false);

  const position = await graph.getPosition();

  data.stash[stashName].zoom = currentZoom;
  data.stash[stashName].position = position;

  await graph.zoomTo(currentZoom, false);

  debug(`Captured viewport for filter profile: ${stashName} | zoom: ${currentZoom} | position: ${position}`);
}

async function restoreStashViewport() {
  const selected = document.getElementById("selectStash").value;
  if (selected === null || selected === "") return;

  const {zoom, position} = data.stash[selected];

  await graph.zoomTo(1, false);
  await graph.translateTo(position, false);
  await graph.zoomTo(zoom, false);

  debug(`Viewport restored. Zoom: ${zoom}, Position: ${position}`);
}

async function loadStash() {
  const selected = document.getElementById("selectStash").value;

  const query = data.stash[selected]["query"];
  const groupedProps = data.stash[selected].groupedProps;

  data.layouts[data.selectedLayout]["query"] = query;
  data.layouts[data.selectedLayout].filters = parseFiltersAsMap(data.stash[selected].filters);
  for (const group of traverseBubbleSets()) {
    data.layouts[data.selectedLayout][`${group}Props`] = new Set([...groupedProps[group]]);
    cache.lastBubbleSetMembers.set(group, new Set(data.stash[selected].bubbleSets[group]));
  }

  buildFilterUI();

  await showLoading("Loading filter profile", `Applying profile ${selected} ..`);
  await clearBubbleSetInstanceMembers();
  await decideToRenderOrDraw(true);
  await restoreStashViewport();
  await selectNodes(data.stash[selected].selectedNodes);
  await selectEdges(data.stash[selected].selectedEdges);

  info(`Applied filter profile: ${selected}`);
}

async function removeStash() {
  const select = document.getElementById("selectStash");
  const val = select.value;
  const confirmed = await Popup.confirm(`Are you sure you want to delete the profile "${select.value}"?`);

  if (confirmed) {
    delete data.stash[val];
    select.value = '';
    refreshStashUI();
    info(`Removed filter profile: ${val}`);
  }
}

function refreshStashUI() {
  const select = document.getElementById("selectStash");
  const remove = document.getElementById("removeStash");
  const apply = document.getElementById("applyStash");
  const overwrite = document.getElementById("overwriteStash");
  const currentlySelected = select.value;

  select.innerHTML = '';

  for (const elem of [select, remove, apply, overwrite]) {
    if (Object.keys(data.stash).length > 0) {
      elem.classList.remove("disabled");
    } else {
      elem.classList.add("disabled");
    }
  }

  for (const key of Object.keys(data.stash)) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = key;
    select.appendChild(option);
  }

  if (currentlySelected) {
    select.value = currentlySelected;
  } else if (Object.keys(data.stash).length > 0) {
    select.value = Object.keys(data.stash)[0];
  }
}

function manageDynamicWidgets() {
  let isCustomLayout = data.layouts[data.selectedLayout].isCustom;
  let removeLayoutBtnCls = document.getElementById("removeSelectedLayoutButton").classList;

  isCustomLayout ? removeLayoutBtnCls.remove("disabled") : removeLayoutBtnCls.add("disabled");
}

function createSectionToggleButton(enable, section, subSection = null) {
  const btn = document.createElement("button");
  btn.className = "small-btn toggle-section-btn ml-1";
  if (subSection) btn.classList.add("extra-small");
  btn.textContent = enable ? "✔" : "✗";
  btn.title = `${enable ? 'Enable' : 'Disable'} all filters for the ${subSection
    ? 'group: ' + "\n └─ " + section + "\n        └─ " + subSection
    : 'section: ' + "\n └─ " + section}`;
  btn.onclick = async () => {
    subSection ? await toggleSubSection(enable, section, subSection) : await toggleSection(enable, section);
  };
  return btn;
}

function createSectionResetButton(section, subSection = undefined) {
  const btn = document.createElement("button");
  btn.className = "small-btn toggle-section-btn ml-1";
  if (subSection) btn.classList.add("extra-small");
  btn.textContent = "⟳";
  btn.title = `Reset all filters for the ${subSection
    ? 'group to their default values: ' + "\n └─ " + section + "\n        └─ " + subSection
    : 'section to their default values: ' + "\n └─ " + section}`;
  btn.onclick = async () => {
    await resetFilters(section, subSection);
  };
  return btn;
}

async function toggleSection(enable, section) {
  toggleCheckboxesForSetOfPropIDs(enable, section);
  await handleFilterEvent(`${enable ? 'Showing' : 'Hiding'} Elements`, `Nodes and related edges for ${section}`);
}

async function toggleSubSection(enable, section, subSection) {
  toggleCheckboxesForSetOfPropIDs(enable, section + "::" + subSection);
  await handleFilterEvent(`${enable ? 'Showing' : 'Hiding'} Elements`, `Nodes and related edges for ${section} ${subSection}`);
}

function getCheckboxTT(enable, propID) {
  return `Click to ${enable ? 'hide' : 'show'} elements with the property:\n * ${propID}`;
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
    wrapper.title = getCheckboxTT(enable, propID);
    inner.textContent = enable ? '✔' : '';
  }
}

function createQueryButton(propID, prop) {
  const btn = document.createElement("button");
  btn.className = "showOnQuery tiny-btn";
  btn.textContent = "Q";
  btn.title = `Query for nodes with the property:\n * ${propID}`;
  btn.onclick = async () => {
    console.log("foo");
  };
  return btn;
}

function createCheckboxContainer(propID) {
    const container = document.createElement('div');
    container.className = 'checkboxContainer';
    container.id = `filter-${propID}-container`;
    return container;
}

function createCheckboxInput(propID, initialState) {
    const input = document.createElement('input');
    input.id = `filter-${propID}-checkbox`;
    input.type = 'checkbox';
    input.checked = initialState;
    input.style.display = 'none';
    return input;
}

function createCustomCheckbox(propID) {
    const customCheckbox = document.createElement('span');
    customCheckbox.id = `filter-${propID}-checkbox-inner`;
    customCheckbox.className = "checkbox checkbox-green";
    return customCheckbox;
}

function createAddToQueryButton(propID) {
  const actionButton = document.createElement('button');
  actionButton.className = 'add-to-query-button';
  actionButton.textContent = '📝';
  actionButton.title = `Add ${propID} to the query`;

  actionButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const slider = cache.propIDToInvertibleRangeSliders.get(propID);
    const dropdown = cache.propIDToDropdownChecklists.get(propID);

    let queryFragment;
    if (slider) {
      if (QUERY_BTN_USE_CURRENT_FILTER) {
        queryFragment = slider.isInverted
          ? `${propID} LOWER THAN ${slider.currentMax} OR GREATER THAN ${slider.currentMin}`
          : `${propID} BETWEEN ${slider.currentMin} AND ${slider.currentMax}`;
      } else {
        queryFragment = `(${propID} BETWEEN ${slider.sliderMin} AND ${slider.sliderMax}`;
      }
    } else if (dropdown) {
      if (QUERY_BTN_USE_CURRENT_FILTER) {
        queryFragment = `${propID} IN [${[...dropdown.selectedCategories].join(",")}]`
      } else {
        queryFragment = `${propID} IN [${[...dropdown.categories].join(",")}]`
      }
    }

    if (data.layouts[data.selectedLayout]["query"] === undefined) {
      handleQueryValidationEvent();
    }

    if (!query.text.textContent.trim()) {
      data.layouts[data.selectedLayout]["query"] = `(${queryFragment})`;
    } else {
      data.layouts[data.selectedLayout]["query"] += ` OR (${queryFragment})`;
    }
    updateQueryTextArea();
  });

  return actionButton;
}


function createCheckbox(propID, prop) {
    const container = createCheckboxContainer(propID);
    const wrapper = document.createElement('label');
    wrapper.className = 'checkboxWrapper';
    wrapper.id = `filter-${propID}-checkbox-wrapper`;

    const input = createCheckboxInput(propID, data.layouts[data.selectedLayout].filters.get(propID).active);
    const customCheckbox = createCustomCheckbox(propID);
    const actionButton = createAddToQueryButton(propID);
    const displayField = document.createElement("span");
    displayField.className = 'checkboxLabel';
    displayField.textContent = prop;

    const updateCheckbox = () => {
        customCheckbox.textContent = input.checked ? '✔' : '';
        wrapper.title = getCheckboxTT(input.checked, propID);
    };
    updateCheckbox();

    input.addEventListener('change', updateCheckbox);
    wrapper.addEventListener('change', async () => {
        data.layouts[data.selectedLayout].filters.get(propID).active = input.checked;
        input.checked ? cache.activeProps.add(propID) : cache.activeProps.delete(propID);
        let status = input.checked ? "Showing" : "Hiding";
        await handleFilterEvent(`${status} Elements`, `Nodes and related edges for ${propID}`);
    });

    wrapper.append(input, customCheckbox);
    container.append(wrapper, actionButton, displayField);

    input.checked ? cache.activeProps.add(propID) : cache.activeProps.delete(propID);

    return container;
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
  wrapper.title = getCheckboxTT(enable, propID);
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
      checkbox.addEventListener("change", async (ev) => await this.handleSelection(ev));

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

  async handleSelection(ev) {
    ev.target.checked
      ? this.selectedCategories.add(ev.target.value)
      : this.selectedCategories.delete(ev.target.value);
    this.anchor.textContent = `${this.selectedCategories.size}/${this.categories.size} selected`;
    await handleFilterEvent(ev.target.checked ? "Showing" : "Hiding" + " Elements",
      `Nodes and related edges for ${this.propID} ${ev.target.value}`, this.propID);
    // debug(`${this.propID} ${ev.target.value} ${ev.target.checked}`);
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
    this.selectAllButton.addEventListener("click", async () => await this.selectAllCategories());
    this.deselectAllButton.addEventListener("click", async () => await this.deselectAllCategories());

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

  async selectAllCategories(skipFilterEvent = false) {
    this.categories.forEach(category => this.selectedCategories.add(category)); // Add all categories
    this.updateCheckboxStates(true);
    if (!skipFilterEvent) {
      await handleFilterEvent("Showing Elements", `Nodes and related edges for ${this.propID}`, this.propID);
    }
  }

  async deselectAllCategories(skipFilterEvent = false) {
    this.categories.forEach(category => this.selectedCategories.delete(category)); // Clear all categories
    this.updateCheckboxStates(false);
    if (!skipFilterEvent) {
      await handleFilterEvent("Hiding Elements", `Nodes and related edges for ${this.propID}`, this.propID);
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
    this.inputStart = null;
    this.inputEnd = null;
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

  reset() {
    // Reset to min/max values in non-inverted state
    this.setTo(this.sliderMin, this.sliderMax, false);

    this.isInverted = false;
    this.currentMin = this.sliderMin;
    this.currentMax = this.sliderMax;
    this.writeCurrentFilterSettings();
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
    this.inputStart = this.createSliderInput(this.sliderIdStartInput, this.currentMin, this.sliderIdStart);
    colLeft.appendChild(this.inputStart);

    const colRight = document.createElement('div');
    colRight.classList.add('show-on-edit');
    colRight.style.transition = 'width 0.2s ease';
    this.inputEnd = this.createSliderInput(this.sliderIdEndInput, this.currentMax, this.sliderIdEnd);
    colRight.appendChild(this.inputEnd);

    const div = document.createElement("div");
    div.innerHTML = this.createDivInnerHTML();
    const slider = div.firstElementChild;
    slider.style.width = '100%';
    slider.title = `Thresholds for ${this.propID}.\n  - Move handles to set min/max (≥ min ∧ ≤ max).\n  - Swap handles to invert (≤ min ∨ ≥ max).\n  - Double-click to reset.`;

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
      this.reset();
      this.sliderEnd.dispatchEvent(new Event('change'));
    });

    this.sliderStart.addEventListener("input", () => this.handleThresholdOnInputEvent(true));
    this.sliderStart.addEventListener("change", async () => {
      this.writeCurrentFilterSettings();
      await handleFilterEvent("Filtering",
        `Applying lower threshold ${this.sliderStart.value} for ${this.propID}`, this.propID);
    });
    this.sliderEnd.addEventListener("input", () => this.handleThresholdOnInputEvent(false));
    this.sliderEnd.addEventListener("change", async () => {
      this.writeCurrentFilterSettings();
      await handleFilterEvent("Filtering",
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

      this.inputStart.classList.add("red");
      this.inputEnd.classList.add("red");
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

      this.inputStart.classList.remove("red");
      this.inputEnd.classList.remove("red");
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

  for (let [group, quadrantPosition] of Object.entries(DEFAULTS.BUBBLE_GROUP_QUADRANT_POSITIONS)) {
    const quadrant = document.createElement('button');
    quadrant.classList.add("quadrant");
    quadrant.classList.add(quadrantPosition);
    data.layouts[data.selectedLayout].filters.get(propID)[`${group}Members`].size === 0 ? quadrant.classList.remove("active") : quadrant.classList.add("active");

    quadrant.addEventListener('click', async () => {
      let shouldShowRemove = quadrant.classList.contains("active");
      let members = data.layouts[data.selectedLayout].filters.get(propID)[`${group}Members`];

      if (shouldShowRemove) {
        data.layouts[data.selectedLayout][`${group}Props`].delete(propID);
        quadrant.title = `Remove ${propID} from ${group}.`;
        members.delete(propID);
        quadrant.classList.remove("active");
        await decideToRenderOrDraw();
      } else {
        data.layouts[data.selectedLayout][`${group}Props`].add(propID);
        quadrant.title = `Highlight ${propID} and add to bubble-group (${group})`;
        members.add(propID);
        quadrant.classList.add("active");
        await decideToRenderOrDraw();
      }
    });

    quadrant.title = `Highlight ${propID} and add to bubble-group (${group})`;
    circleButton.appendChild(quadrant);
  }

  return circleButton;
}

class Popup {
  /**
   * // Simple text popup
   * const popup1 = new Popup("Hello, I'm a simple popup!");
   *
   * // Popup with HTML content
   * const popup2 = new Popup(`
   *     <h2>Welcome!</h2>
   *     <p>This is a popup with <strong>HTML</strong> content.</p>
   *     <button onclick="error('Button clicked!')">Click me</button>
   * `);
   *
   * // Popup with custom options
   * const popup3 = new Popup("Custom positioned popup!", {
   *     width: '400px',
   *     position: { x: 100, y: 100 },
   *     closeOnClickOutside: false,
   *     onClose: () => debug('Popup closed!')
   * });
   */
  constructor(content, options = {}) {
    this.options = {
      width: '300px',
      height: 'auto',
      position: 'center',
      lineHeight: 'normal',
      closeOnClickOutside: true,
      onClose: null,
      showFullscreenButton: true,
      ...options
    };

    this.popup = null;
    this.overlay = null;
    this.closeBtn = null;
    this.fullscreenBtn = null;
    this.isFullscreen = false;
    this.originalStyles = null;

    this.init(content);
  }

static async prompt(message) {
    return new Promise((resolve) => {
      const inputField = document.createElement('input');
      inputField.type = 'text';
      inputField.className = "p-prompt";

      const content = document.createElement('div');
      content.innerHTML = `<div>${message}</div>`;
      content.appendChild(inputField);

      const confirmBtn = document.createElement('button');
      confirmBtn.textContent = 'OK';
      confirmBtn.className = "p-button";
      content.appendChild(confirmBtn);

      let isConfirmed = false;

      const handleConfirm = () => {
        isConfirmed = true;
        const value = inputField.value.trim();
        popup.close();
        resolve(value);
      };

      const popup = new Popup(content, {
        width: '300px',
        showFullscreenButton: false,
        closeOnClickOutside: false,
        onClose: () => {
          if (!isConfirmed) {
            resolve(null);
          }
        }
      });

      confirmBtn.addEventListener('click', handleConfirm);
      inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleConfirm();
        }
      });

      setTimeout(() => inputField.focus(), 0);
    });
  }


  static async confirm(message) {
    return new Promise((resolve) => {
      const content = document.createElement('div');
      content.innerHTML = `<div>${message}</div>`;

      const confirmBtn = document.createElement('button');
      confirmBtn.textContent = 'OK';
      confirmBtn.className="p-button ml-1";

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.className="p-button";

      content.appendChild(confirmBtn);
      content.appendChild(cancelBtn);

      let isResolved = false;

      const popup = new Popup(content, {
        width: '300px',
        showFullscreenButton: false,
        closeOnClickOutside: false,
        onClose: () => {
          if (!isResolved) {
            resolve(null);
          }
        }
      });

      confirmBtn.addEventListener('click', () => {
        isResolved = true;
        popup.close();
        resolve(true);
      });

      cancelBtn.addEventListener('click', () => {
        isResolved = true;
        popup.close();
        resolve(false);
      });

      setTimeout(() => confirmBtn.focus(), 0);
    });
  }

  init(content) {
    this.createPopup(content);
    this.setupCloseHandlers();
    if (this.options.showFullscreenButton) {
      this.setupFullscreenButton();
    }
    this.show();
  }

  createPopup(content) {
    this.popup = document.createElement('div');
    this.popup.className = 'p-custom';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'p-header';

    if (this.options.showFullscreenButton) {
      this.fullscreenBtn = document.createElement('button');
      this.fullscreenBtn.className = 'p-icon';
      this.fullscreenBtn.innerHTML = '⛶';
      this.fullscreenBtn.title = 'Toggle fullscreen';
      headerDiv.appendChild(this.fullscreenBtn);
    }

    this.closeBtn = document.createElement('button');
    this.closeBtn.className = 'p-icon';
    this.closeBtn.innerHTML = '×';
    this.closeBtn.title = 'Close popup';
    headerDiv.appendChild(this.closeBtn);

    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';
    popupContent.style.marginTop = '20px';

    if (typeof content === 'string') {
      popupContent.innerHTML = content;
    } else {
      popupContent.appendChild(content);
    }

    this.popup.appendChild(headerDiv);
    this.popup.appendChild(popupContent);

    this.overlay = document.createElement('div');
    this.overlay.className = 'p-overlay';

    document.body.appendChild(this.overlay);
    document.body.appendChild(this.popup);

    this.popup.style.width = this.options.width;
    if (this.options.height !== 'auto') {
      this.popup.style.height = this.options.height;
    }

    if (this.options.lineHeight !== 'normal') {
      this.popup.style.lineHeight = this.options.lineHeight;
    }

    this.setPosition();
    this.storeOriginalStyles();
  }

  storeOriginalStyles() {
    this.originalStyles = {
      width: this.popup.style.width,
      height: this.popup.style.height,
      top: this.popup.style.top,
      left: this.popup.style.left,
      transform: this.popup.style.transform,
      borderRadius: this.popup.style.borderRadius,
      margin: this.popup.style.margin,
      position: this.popup.style.position
    };
  }

  setupFullscreenButton() {
    this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;

    if (this.isFullscreen) {
      this.popup.style.width = '100%';
      this.popup.style.height = '100%';
      this.popup.style.top = '0';
      this.popup.style.left = '0';
      this.popup.style.transform = 'none';
      this.popup.style.position = 'fixed';

      this.fullscreenBtn.innerHTML = '⧉';
      this.fullscreenBtn.title = 'Exit fullscreen';
    } else {
      Object.assign(this.popup.style, this.originalStyles);

      this.fullscreenBtn.innerHTML = '⛶';
      this.fullscreenBtn.title = 'Fullscreen';
    }
  }

  setPosition() {
    if (!this.isFullscreen) {
      if (this.options.position === 'center') {
        this.popup.style.top = '50%';
        this.popup.style.left = '50%';
        this.popup.style.transform = 'translate(-50%, -50%)';
      } else {
        this.popup.style.top = `${this.options.position.y}px`;
        this.popup.style.left = `${this.options.position.x}px`;
        this.popup.style.transform = 'none';
      }
    }
  }

  setupCloseHandlers() {
    this.closeBtn.addEventListener('click', () => this.close());

    if (this.options.closeOnClickOutside) {
      this.overlay.addEventListener('click', () => this.close());
    }
  }

  show() {
    this.popup.style.display = 'block';
    this.overlay.style.display = 'block';
  }

  close() {
    if (this.options.onClose) {
      this.options.onClose();
    }
    this.popup.remove();
    this.overlay.remove();
    cache.popup = null;
  }
}

function createAddOrRemoveToSelectionButton(propID, shouldAdd) {
  const btn = document.createElement("button");
  btn.classList.add("plus-minus-button", "show-on-edit");
  btn.textContent = shouldAdd ? "+" : "-";
  btn.title = shouldAdd ? "Add to selection" : "Remove from selection";
  btn.addEventListener("click", async () => {
    const nodeIDs = cache.propIDsToNodeIDsToBeShown.get(propID) || [];
    if (nodeIDs.size > 0) {
      const nodes = graph.getNodeData([...nodeIDs]);
      await updateSelectedState(nodes, shouldAdd);
    }

    const edgeIDs = cache.propIDsToEdgeIDsToBeShown.get(propID) || [];
    if (edgeIDs.size > 0) {
      const edges = graph.getEdgeData([...edgeIDs]);
      await updateSelectedState(edges, shouldAdd);
    }
  });
  return btn;
}

async function decideToRenderOrDraw(forceRender = false) {
  await showLoading("Loading", "Deciding to render or draw ..");
  await new Promise(resolve => requestAnimationFrame(resolve));
  await preRenderEvent();
  await cache.metrics.updateUI();

  try {
    if (cache.bubbleSetChanged || cache.styleChanged || cache.layoutChanged || forceRender) {
      if (cache.styleChanged) {
        await showLoading("Loading", "Updating graph data ..");
        await new Promise(resolve => requestAnimationFrame(resolve));
        await graph.updateData(createSimplifiedDataForGraphObject());
        cache.styleChanged = false;
        cache.labelStyleChanged = false;
      }
      await showLoading("Loading", "Rendering graph ..");
      await new Promise(resolve => requestAnimationFrame(resolve));
      return await graph.render();
    } else {
      await showLoading("Loading", "Redrawing graph ..");
      await new Promise(resolve => requestAnimationFrame(resolve));
      return await graph.draw();
    }
  } catch (errorMsg) {
    error(errorMsg);
    return false;
  } finally {
    await hideLoading();
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
}

async function handleFilterEvent(header, text, propID = null, shouldResetQuery = true) {
  if (shouldResetQuery) {
    resetQuery();
  }

  // skip rendering if property is not active
  if (propID !== null && !data.layouts[data.selectedLayout].filters.get(propID).active) {
    return;
  }

  await showLoading(header, text);
  await new Promise(resolve => requestAnimationFrame(resolve));
  await decideToRenderOrDraw();
}

async function handleStyleChangeLoadingEvent(header, text) {
  await showLoading(header, text);
  await new Promise(resolve => requestAnimationFrame(resolve));
  cache.styleChanged = true;
  await decideToRenderOrDraw();
  debug(`Graph updated after style event with message ${header} ${text}`);
}

async function handleLayoutChangeLoadingEvent(header, text) {
  await showLoading(header, text);
  cache.layoutChanged = true;
  await decideToRenderOrDraw();
  debug(`Graph updated after layout event with message ${header} ${text}`);
}

function showUI(show) {
  document.querySelectorAll('.showOnLoad').forEach((element) => {
    element.style.opacity = show ? "1" : "0";
    element.style.pointerEvents = show ? "auto" : "none";
  });
}

async function changeLayout() {
  data.selectedLayout = document.getElementById('selectView').value;
  await showLoading("Switching View", data.selectedLayout);
  await new Promise(resolve => requestAnimationFrame(resolve));
  let layout = data.layouts[data.selectedLayout];

  if (!layout.isCustom) {
    await graph.setLayout({type: data.selectedLayout, ...layout.internals});
    await graph.layout();
  }

  buildFilterUI();
  clearActivePropsCacheOnLayoutChange();

  await cache.metrics.updateUI();

  EVENT_LOCKS.ONCE_AFTER_RENDER_COMPLETED = false;

  await decideToRenderOrDraw(true);

  info(`Switched to view: ${data.selectedLayout}`);
}

async function addLayout() {
  let layoutName = await Popup.prompt("Enter View Name: ");
  if (!layoutName) {
    info("Creating view canceled");
    return;
  }

  let existing = Object.keys(data.layouts);

  if (existing.includes(layoutName)) {
    error(`View with name "${layoutName}" already exists.`);
    return;
  }

  const currentLayout = data.layouts[data.selectedLayout];

  // create new layout object by copying positions and filters from current one
  data.layouts[layoutName] = {
    internals: null,
    positions: structuredClone(currentLayout.positions),
    filters: structuredClone(currentLayout.filters),
    isCustom: true
  };
  for (let group of traverseBubbleSets()) {
    data.layouts[layoutName][`${group}Props`] = structuredClone(currentLayout[`${group}Props`]);
  }

  buildDropdownOptions();
  document.getElementById('selectView').value = layoutName;
  await changeLayout();
  info(`Created view ${layoutName}`);
}

async function removeSelectedLayout() {
  if (!data.layouts[data.selectedLayout].isCustom) {
    error("Cannot delete default layout.");
    return;
  }

  const confirmed = await Popup.confirm(`Are you sure you want to delete view "${data.selectedLayout}"?`);
  if (!confirmed) return false;

  delete data.layouts[data.selectedLayout];
  buildDropdownOptions();

  document.getElementById('selectView').value = DEFAULTS.LAYOUT;
  await changeLayout();
}

function getNodeStyleOrDefaults(node) {
  const src = node.style ?? {};
  const d = DEFAULTS.NODE;

  // ----- basic style -------------------------------------------------------
  /* @formatter:off */
  const defaultNode = {
    type : node.type ?? d.TYPE,
    style: {
      size         : src.size          ?? d.SIZE,
      fill         : src.fill          ?? d.FILL_COLOR,
      stroke       : src.stroke        ?? d.STROKE_COLOR,
      lineWidth    : src.lineWidth     ?? d.LINE_WIDTH,

      badge        : src.badge         ?? false,
      badges       : src.badges        ?? [],
      badgePalette : src.badgePalette  ?? [],
      badgeFontSize: src.badgeFontSize ?? d.BADGE.FONT_SIZE,
    }
  };

  // ----- label style ------------------------------------------------------
  if (!PERFORMANCE_MODE || src.label) {
    const l = DEFAULTS.NODE.LABEL;

    Object.assign(defaultNode.style, {
      label                 : true,
      labelText             : src.labelText,
      labelBackgroundFill   : src.labelBackgroundFill   ?? l.BACKGROUND_COLOR,
      labelBackground       : src.labelBackground       ?? l.BACKGROUND,
      labelBackgroundRadius : src.labelBackgroundRadius ?? l.BACKGROUND_RADIUS,
      labelCursor           : src.labelCursor           ?? l.CURSOR,
      labelFill             : src.labelFill             ?? l.FOREGROUND_COLOR,
      labelFontSize         : src.labelFontSize         ?? l.FONT_SIZE,
      labelLeading          : src.labelLeading          ?? l.LINE_SPACING,
      labelMaxLines         : src.labelMaxLines         ?? l.MAX_LINES,
      labelMaxWidth         : src.labelMaxWidth         ?? l.MAX_WIDTH,
      labelOffsetX          : src.labelOffsetX          ?? l.OFFSET_X,
      labelOffsetY          : src.labelOffsetY          ?? l.OFFSET_Y,
      labelPadding          : src.labelPadding          ?? l.PADDING,
      labelPlacement        : src.labelPlacement        ?? l.PLACEMENT,
      labelTextAlign        : src.labelTextAlign        ?? l.TEXT_ALIGN,
      labelWordWrap         : src.labelWordWrap         ?? l.WORD_WRAP,
      labelZIndex           : src.labelZIndex           ?? l.Z_INDEX,
    });
  }
  /* @formatter:on */

  return defaultNode;
}

function getEdgeStyleOrDefaults(edge) {
  const src = edge.style ?? {};
  const d = DEFAULTS.EDGE;

  // ---- core edge style ----------------------------------------------------
  /* @formatter:off */
  const defaultEdge = {
    type : edge.type ?? d.TYPE,
    style: {
      startArrow     : src.startArrow     ?? d.ARROWS.START,
      startArrowSize : src.startArrowSize ?? d.ARROWS.START_SIZE,
      startArrowType : src.startArrowType ?? d.ARROWS.START_TYPE,
      endArrow       : src.endArrow       ?? d.ARROWS.END,
      endArrowSize   : src.endArrowSize   ?? d.ARROWS.END_SIZE,
      endArrowType   : src.endArrowType   ?? d.ARROWS.END_TYPE,

      lineWidth      : src.lineWidth      ?? d.LINE_WIDTH,
      lineDash       : src.lineDash       ?? d.LINE_DASH,
      stroke         : src.stroke         ?? d.COLOR,

      halo           : src.halo           ?? d.HALO.ENABLED,
      haloStroke     : src.haloStroke     ?? d.HALO.COLOR,
      haloLineWidth  : src.haloLineWidth  ?? d.HALO.WIDTH,
    }
  };

  // ---- label style ------------------------------------------------------
  if (!PERFORMANCE_MODE || src.label) {
    const l = DEFAULTS.EDGE.LABEL;

    Object.assign(defaultEdge.style, {
      label                        : true,
      labelAutoRotate              : src.labelAutoRotate              ?? l.AUTO_ROTATE,
      labelBackground              : src.labelBackground              ?? l.BACKGROUND,
      labelBackgroundFill          : src.labelBackgroundFill          ?? l.BACKGROUND_COLOR,
      labelBackgroundCursor        : src.labelBackgroundCursor        ?? l.BACKGROUND_CURSOR,
      labelBackgroundFillOpacity   : src.labelBackgroundFillOpacity   ?? l.BACKGROUND_FILL_OPACITY,
      labelBackgroundRadius        : src.labelBackgroundRadius        ?? l.BACKGROUND_RADIUS,
      labelBackgroundStrokeOpacity : src.labelBackgroundStrokeOpacity ?? l.BACKGROUND_STROKE_OPACITY,
      labelCursor                  : src.labelCursor                  ?? l.CURSOR,
      labelFill                    : src.labelFill                    ?? l.FOREGROUND_COLOR,
      labelFillOpacity             : src.labelFillOpacity             ?? l.FILL_OPACITY,
      labelFontSize                : src.labelFontSize                ?? l.FONT_SIZE,
      labelFontWeight              : src.labelFontWeight              ?? l.FONT_WEIGHT,
      labelMaxLines                : src.labelMaxLines                ?? l.MAX_LINES,
      labelMaxWidth                : src.labelMaxWidth                ?? l.MAX_WIDTH,
      labelOffsetX                 : src.labelOffsetX                 ?? l.OFFSET_X,
      labelOffsetY                 : src.labelOffsetY                 ?? l.OFFSET_Y,
      labelOpacity                 : src.labelOpacity                 ?? l.OPACITY,
      labelPlacement               : src.labelPlacement               ?? l.PLACEMENT,
      labelPadding                 : src.labelPadding                 ?? l.PADDING,
      labelText                    : src.labelText                    ?? l.TEXT,
      labelTextAlign               : src.labelTextAlign               ?? l.TEXT_ALIGN,
      labelTextBaseLine            : src.labelTextBaseLine            ?? l.TEXT_BASE_LINE,
      labelTextOverflow            : src.labelTextOverflow            ?? l.TEXT_OVERFLOW,
      labelVisibility              : src.labelVisibility              ?? l.VISIBILITY,
      labelWordWrap                : src.labelWordWrap                ?? l.WORD_WRAP,
    });
    /* @formatter:on */
  }

  return defaultEdge;
}

async function exportGraphAsJSON() {
  if (data === null) {
    error("No graph data to save.");
    return false;
  }

  // helper for JSON.stringify to serialize Maps to plain objects and Sets to arrays
  function replacer(key, value) {
    if (value instanceof Map) return Object.fromEntries(value);
    if (value instanceof Set) return [...value];
    return value;
  }

  await showLoading("Exporting graph ..");
  await new Promise(resolve => requestAnimationFrame(resolve));
  const blob = new Blob([JSON.stringify(data, replacer)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "graph.json";
  a.click();
  URL.revokeObjectURL(url);
  await hideLoading();
  await new Promise(resolve => requestAnimationFrame(resolve));
}

function preProcessData(fileData) {
  data = {};
  data.filterDefaults = new Map();  // used as template for each layout
  cache = {initialized: false};

  function getDefaultFilterObject() {
    let obj = {
      active: true,
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

  PERFORMANCE_MODE = fileData.nodes.length > MAX_NODES_BEFORE_HIDING_LABELS_AND_HOVER_EFFECT;
  cache.nodePositionsFromExcelImport = new Map();

  if (PERFORMANCE_MODE) {
    let msg = `Large graph detected (${fileData.nodes.length}/${MAX_NODES_BEFORE_HIDING_LABELS_AND_HOVER_EFFECT} nodes) - Performance mode enabled: disabled labels, hover effects, group collision checks`;
    if (APPLY_BUBBLE_SET_HOTFIX) {
      msg += " and click select.";
    } else {
      msg = msg.replace(", group", " and group");
      msg += "."
    }
    warning(msg);
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

    return {
      ...node,
      ...getNodeStyleOrDefaults(node),
      features: nodeFeatures,
      featureValues: nodeFeatureValues,
      featureIsWithinThreshold: nodeFeatureWithinThreshold,
    };
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

  data.bubbleSetStyle = fileData.bubbleSetStyle || DEFAULTS.BUBBLE_GROUP_STYLE;

  const excelHasCoordinates = cache.nodePositionsFromExcelImport.size > 0;
  data.selectedLayout = fileData.selectedLayout || (
    excelHasCoordinates ? DEFAULTS.CUSTOM_LAYOUT_NAME : DEFAULTS.LAYOUT);

  // create individual map for each layout, no matter if default or manual, with positions, current filters, ..
  if (fileData.layouts) {
    data.layouts = parseLayouts(fileData.layouts);
    if (fileData.selectedLayout === DEFAULTS.CUSTOM_LAYOUT_NAME) {
      EVENT_LOCKS.TRIGGER_SET_LAYOUT_ONCE = true;
    }
  } else {
    data.layouts = Object.keys(DEFAULTS.LAYOUT_INTERNALS).reduce((acc, key) => {
      if (data?.layouts?.[key]) {
        warning("Layout with key '" + key + "' already exists.");
        return acc;
      } else {
        acc[key] = createDefaultLayout(key, false);
        return acc;
      }
    }, {});

    if (excelHasCoordinates) {
      data.layouts[DEFAULTS.CUSTOM_LAYOUT_NAME] = createDefaultLayout(DEFAULTS.CUSTOM_LAYOUT_NAME, true);
      EVENT_LOCKS.TRIGGER_SET_LAYOUT_ONCE = true;
    }
  }

  if (fileData.stash) {
    data.stash = Object.fromEntries(
      Object.entries(fileData.stash || {}).map(([key, value]) => [
        key,
        {
          ...value,
          ...parseGroups(value),
        },
      ])
    );
  } else {
    data.stash = {};
  }

  debug("Done pre-processing data");
}

function initCache() {
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
  cache.nodeIDToPropIDs = new Map();
  cache.edgeIDToPropIDs = new Map();

  cache.propIDToDropdownChecklists = new Map();
  cache.propIDToInvertibleRangeSliders = new Map();

  cache.initialNodePositions = new Map();
  cache.lastBubbleSetMembers = new Map();
  cache.bubbleSetChanged = false;

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

  cache.uniquePropHierarchy = {};

  cache.styleChanged = false;
  cache.labelStyleChanged = false;
  cache.visibleElementsChanged = false;
  cache.layoutChanged = false;

  cache.metrics = new NetworkMetrics();
  cache.popup = null;

  cache.nodeLabels = [];
  cache.edgeLabels = [];
  cache.nodeLabelToNodeIDs = new Map();
  cache.edgeLabelToEdgeIDs = new Map();

  cache.nodeIDOrLabelToNodeIDs = new Map();
  cache.edgeIDOrLabelToEdgeIDs = new Map();

  picker = new ColorScalePicker();

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
    cache.nodeIDToPropIDs.set(node.id, new Set());
    if (node.label) {
      cache.nodeLabels.push(node.label);

      if (!cache.nodeLabelToNodeIDs.has(node.label)) {
        cache.nodeLabelToNodeIDs.set(node.label, new Set());
      }
      cache.nodeLabelToNodeIDs.get(node.label).add(node.id);

      if (!cache.nodeIDOrLabelToNodeIDs.has(node.label)) {
        cache.nodeIDOrLabelToNodeIDs.set(node.label, new Set());
      }
      cache.nodeIDOrLabelToNodeIDs.get(node.label).add(node.id);
    }

    if (!cache.nodeIDOrLabelToNodeIDs.has(node.id)) {
      cache.nodeIDOrLabelToNodeIDs.set(node.id, new Set());
    }
    cache.nodeIDOrLabelToNodeIDs.get(node.id).add(node.id);

    for (let prop of node.features) {
      populateUniquePropGroups(prop);
      if (!cache.propToNodes.has(prop)) cache.propToNodes.set(prop, new Set());
      if (!cache.propToNodeIDs.has(prop)) cache.propToNodeIDs.set(prop, new Set());
      cache.propToNodes.get(prop).add(node);
      cache.propToNodeIDs.get(prop).add(node.id);
      cache.nodeExclusiveProps.add(prop);
      cache.propIDs.add(prop);
      cache.nodeIDToPropIDs.get(node.id).add(prop);
    }
  });

  data.edges.forEach((edge) => {
    cache.edgeRef.set(edge.id, edge);
    cache.toolTips.set(edge.id, buildToolTipText(edge.id, true));
    cache.edgeIDToPropIDs.set(edge.id, new Set());
    if (edge.label) {
      cache.edgeLabels.push(edge.label);

      if (!cache.edgeLabelToEdgeIDs.has(edge.label)) {
        cache.edgeLabelToEdgeIDs.set(edge.label, new Set());
      }
      cache.edgeLabelToEdgeIDs.get(edge.label).add(edge.id);

      if (!cache.edgeIDOrLabelToEdgeIDs.has(edge.label)) {
        cache.edgeIDOrLabelToEdgeIDs.set(edge.label, new Set());
      }
      cache.edgeIDOrLabelToEdgeIDs.get(edge.label).add(edge.id);
    }

    if (!cache.edgeIDOrLabelToEdgeIDs.has(edge.id)) {
      cache.edgeIDOrLabelToEdgeIDs.set(edge.id, new Set());
    }
    cache.edgeIDOrLabelToEdgeIDs.get(edge.id).add(edge.id);

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
      cache.edgeIDToPropIDs.get(edge.id).add(prop);
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
  function initAndAddHeader() {
    const idFormatted = `<span class='purple'>ID: </span>${item.id}`;
    const label = item.label && item.label !== item.id
      ? `${item.label}<br><small>${idFormatted}</small>`
      : idFormatted;

    return `<h3>
      <span class="purple">${isEdge ? "Edge" : "Node"}</span> 
      <span class="red">${label}</span>
    </h3>`;
  }

  function addDescription() {
    if (item.description) {
      tooltip += `<p class="tooltip-description">${item.description}</p>`;
    }
  }

  function addMetric() {
    if (!isEdge) {
      tooltip += `<div class="tooltip-metric-wrapper purple">
        <hr>
        <h5 class="tooltip-sub-section red-background">
          📊 <span class="tooltip-metric-header"></span>
        </h5>
        <p class="tooltip-metric-content"></p>
      </div>`
    }
  }

  const item = isEdge ? cache.edgeRef.get(nodeOrEdgeID) : cache.nodeRef.get(nodeOrEdgeID);
  let tooltip = initAndAddHeader();
  addDescription();
  addMetric();

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
  function sortProps() {
    for (const sec of structuredData) {
      for (const sub of sec.subSections) {
        sub.props.sort((a, b) => a.key.localeCompare(b.key));
      }
    }
  }

  if (SORT_TOOLTIPS) sortProps();

  // ------------------
  // 3) Flatten each {section, subSections} into an array while preserving order
  // ------------------
  function flattenBlocks() {
    const blocks = [];
    for (const s of structuredData) {
      blocks.push({type: "section", text: s.section});
      for (const sb of s.subSections) {
        blocks.push({type: "subSection", section: s.section, text: sb.name, props: sb.props});
      }
    }
    return blocks;
  }


  const orderedBlocks = flattenBlocks();

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
  function buildColumns() {

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
  }

  buildColumns();
  return tooltip;
}

function resetNodeToolTipMetricTexts() {
  for (const nodeID of cache.toolTips.keys()) {
    updateNodeToolTipMetricText(nodeID, undefined, undefined, true);
  }
}

function updateNodeToolTipMetricText(nodeId = undefined, header = undefined, text = undefined, reset = false) {
  const tooltip = cache.toolTips.get(nodeId);
  if (!tooltip) return;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = tooltip;

  const metricWrapper = tempDiv.querySelector('.tooltip-metric-wrapper');
  if (!metricWrapper) return;

  const metricContent = metricWrapper.querySelector('.tooltip-metric-content');
  if (!metricContent) return;

  const metricHeader = metricWrapper.querySelector('.tooltip-metric-header');
  if (!metricHeader) return;

  if (reset) {
    metricWrapper.classList.remove('visible');
    metricContent.textContent = '';
    metricHeader.textContent = '';
  } else {
    metricWrapper.classList.add('visible');
    metricContent.textContent = text;
    metricHeader.textContent = header;
  }

  cache.toolTips.set(nodeId, tempDiv.innerHTML);
}

function encodeQuery(asciiStr) {
  query.valid = true;

  const space = `<span class='q-space' data-encoded> </span>`;

  // ------------------------------------------------------------------
  // 1. Check for empty query
  // ------------------------------------------------------------------
  if (!asciiStr) {
    query.valid = false;
  }

  // ------------------------------------------------------------------
  // 2. Check for empty instructions "()"
  // ------------------------------------------------------------------
  asciiStr = asciiStr.replace(
    /\(\s*\)/g,
    match => {
      query.valid = false;
      return `<span class="q-error-empty-instruction" data-encoded>${match}</span>`;
    }
  );

  // ------------------------------------------------------------------
  // 3. Check for missing connectors between instructions ")("
  // ------------------------------------------------------------------
  asciiStr = asciiStr.replace(
    /\)\s*\(/g,
    match => {
      query.valid = false;
      return (
        `<span class="q-error-missing-connector" data-encoded>` +
        match +
        `</span>`
      );
    }
  );

  /* ------------------------------------------------------------------ */
  /* 4. Encode Property names (main group::sub group::property)                */
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
  /* 5. Encode filters in instructions                                  */
  /* ------------------------------------------------------------------ */

  /* 5-1 Numerical Values (Slider): "BETWEEN X AND Y" --------- */
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

  /* 5-2 Inverted Numerical Values (Slider): "LOWER THAN X OR GREATER THAN Y" ------ */
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

  /* 5-3 Categorical Values (Dropdown): "IN [" up to "]"  --------- */
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
  /* 6.  Top-level connectors  ") OR ("  /  ") AND ("  /  ") NOT ("     */
  /* ------------------------------------------------------------------ */
  const connectorOpeningBracket = `<span class='q-connector-opening-bracket' data-encoded>(</span>`;
  const connectorClosingBracket = `<span class='q-connector-closing' data-encoded>)</span>`;

  asciiStr = asciiStr.replace(
    /\)\s*(OR|AND|NOT)\s*\(/gi,
    (_m, connector) =>
      connectorClosingBracket
      + `<span class='q-connector-${connector.toLowerCase()}' data-encoded>`
      + ' '
      + connector.toUpperCase()
      + ' '
      + `</span>`
      + connectorOpeningBracket
  );

  /* ------------------------------------------------------------------ */
  /* 7. Brackets with depth tracking                                    */

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
    query.valid = false;
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
  // 8. substitute &nbsp; with space span (important for copy/paste)
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
  // 9. Check for instructions without filters (no "IN|BETWEEN|LOWER THAN after property)
  // TODO: not working
  // ------------------------------------------------------------------

  // asciiStr = asciiStr.replace(
  //   /\(([^)]+?::[^)]+?::[^)]+?)(?=\s*\))/g,
  //   (match, prop) => {
  //     query.valid = false;
  //     return `<span class="q-error-missing-filter" data-encoded>${match}</span>`;
  //   }
  // );

  // ------------------------------------------------------------------
  // 10. wrap everything not already in a <span class='q-…'>…</span> as an error
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

      query.valid = false;
      return chunk.replace(/\S+/g, txt =>
        `<span class="q-error-unrecognized">${txt}</span>`
      );
    })
    .join('');

  const updateQueryBtn = document.getElementById("queryUpdateBtn");
  const selectQueryBtn = document.getElementById("querySelectBtn");
  if (query.valid) {
    updateQueryBtn.classList.remove("disabled");
    selectQueryBtn.classList.remove("disabled");
  } else {
    updateQueryBtn.classList.add("disabled");
    selectQueryBtn.classList.add("disabled");
  }

  return asciiStr;
}

function updateQueryTextArea() {
  let queryStr = data.layouts[data.selectedLayout]["query"] || "";

  if (!queryStr) {
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

    if (queryEntries.length) {
      queryStr = `(${queryEntries.join(") OR (")})`;
    }
  }

  query.text.textContent = queryStr;
  query.overlay.innerHTML = encodeQuery(queryStr);
}

function clearQuery() {
  query.text.textContent = "";
  handleQueryValidationEvent();
  query.caret.style.display = "none";
}

function getCursorPosition() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return 0;

  const range = sel.getRangeAt(0).cloneRange();
  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(query.text);
  preCaretRange.setEnd(range.endContainer, range.endOffset);
  return preCaretRange.toString().length;
}

function setCursorPosition(charIndex) {
  const root = query.text;
  charIndex = Math.max(0, Math.min(charIndex, root.textContent.length));

  const range = document.createRange();
  const sel = window.getSelection();

  let currentPos = 0;
  let found = false;

  function traverseNodes(node) {
    if (found) return;

    if (node.nodeType === Node.TEXT_NODE) {
      const length = node.length;
      if (currentPos + length >= charIndex) {
        range.setStart(node, charIndex - currentPos);
        range.collapse(true);
        found = true;
        return;
      }
      currentPos += length;
    } else {
      for (const child of node.childNodes) {
        traverseNodes(child);
      }
    }
  }

  traverseNodes(root);
  sel.removeAllRanges();
  sel.addRange(range);
}

function moveCaret() {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) {
    query.caret.style.display = 'none';
    return;
  }

  const range = sel.getRangeAt(0).cloneRange();
  range.collapse(true);

  const rect = range.getBoundingClientRect();
  const parentRect = query.text.getBoundingClientRect();

  if (!rect || !rect.height) {
    query.caret.style.display = 'none';
    return;
  }

  const overlapsVert = rect.bottom > parentRect.top && rect.top < parentRect.bottom;
  const overlapsHoriz = rect.right > parentRect.left && rect.left < parentRect.right;

  if (!(overlapsVert && overlapsHoriz)) {
    query.caret.style.display = 'none';
    return;
  }

  query.caret.style.display = 'block';
  query.caret.style.left = `${rect.left - parentRect.left}px`;
  query.caret.style.top = `${rect.top - parentRect.top}px`;
  query.caret.style.height = `${rect.height}px`;
}

function handleQueryValidationEvent() {
  const caretPosition = getCursorPosition();

  query.overlay.innerHTML = encodeQuery(query.text.textContent);
  query.overlay.scrollTop = query.text.scrollTop;
  query.overlay.scrollLeft = query.text.scrollLeft;

  if (query.valid) {
    data.layouts[data.selectedLayout]["query"] = query.text.textContent;
  } else {
    data.layouts[data.selectedLayout]["query"] = undefined;
  }

  requestAnimationFrame(() => {
    setCursorPosition(caretPosition);
  });
}

async function handleQueryUpdateEvent() {
  updateUIFromQueryInstructions();
  await handleFilterEvent("Updating Graph from Query", query.text.textContent, null, false);
}

async function handleQuerySelectEvent() {
  await showLoading("Updating Selection", `Modifying selection from query`);
  await new Promise(resolve => requestAnimationFrame(resolve));

  decodeQueryAndBuildAST();

  const nodeIDsToSelect = cache.nodeRef.values()
    .filter(node => query.ast.testNode(node) && cache.nodeIDsToBeShown.has(node.id))
    .map(node => node.id);

  const edgeIDsToSelect = cache.edgeRef.values()
    .filter(edge => query.ast.testEdge(edge) && cache.edgeIDsToBeShown.has(edge.id))
    .map(edge => edge.id);

  await selectNodes(nodeIDsToSelect);
  await selectEdges(edgeIDsToSelect);
  await hideLoading();
  await new Promise(resolve => requestAnimationFrame(resolve));
}

async function selectNodes(nodeIDs) {
  await selectElements(nodeIDs, cache.nodeRef);
}

async function selectEdges(edgeIDs) {
  await selectElements(edgeIDs, cache.edgeRef);
}

/**
 * Selects given element IDs while deselecting all others
 * @param elementIDs
 * @param refMap
 * @returns {Promise<void>}
 */
async function selectElements(elementIDs, refMap) {
  const visibility = {};
  const elementIDsAsSet = new Set(elementIDs);

  for (const elem of refMap.values()) {
    const nodeOrEdgeID = elem.id;
    const state = await graph.getElementState(nodeOrEdgeID);
    const shouldSelect = elementIDsAsSet.has(nodeOrEdgeID);

    if (shouldSelect && !state.includes("selected")) state.push("selected");
    if (!shouldSelect && state.includes("selected")) state.splice(state.indexOf("selected"), 1);

    visibility[nodeOrEdgeID] = state;
  }

  await graph.setElementState(visibility);
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
function decodeQuery() {
  /* -------------------------------------------------------------
   * 1.  DOM → token list
   * ----------------------------------------------------------- */
  const tokens = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${query.overlay.innerHTML}</div>`, 'text/html');
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

  function setFilter(obj) {
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
  }

  function refreshUI(obj) {
    if (obj.constructor === Array) {
      if (obj[0].constructor === Object && obj[0].type === "property") {
        setFilter(obj);
      } else {
        // nested instruction
        for (const nestedInst of obj) {
          refreshUI(nestedInst);
        }
      }
    }
  }

  uncheckAllCheckboxes();
  decodeQueryAndBuildAST();

  for (const inst of query.ast.instructions) {
    refreshUI(inst);
  }
}

function moveCaretToEnd() {
  const el = query.text;               // the editable element
  if (!el) return;

  /* -------- textarea / input ---------- */
  if ('selectionStart' in el) {        // true for <input> / <textarea>
    el.selectionStart = el.selectionEnd = el.value.length;
    el.focus();
    return;
  }

  /* -------- contenteditable ----------- */
  const range = document.createRange();
  range.selectNodeContents(el);        // select the whole content
  range.collapse(false);               // collapse to the end

  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  el.focus();
}

function resetQuery() {
  delete data.layouts[data.selectedLayout]["query"];
  query.text.textContent = "";
  query.overlay.innerHTML = "";
  updateQueryTextArea();
  moveCaretToEnd();
}

function showQueryHelp() {
  cache.popup = new Popup(`
<h3>Query Editor</h3>
The query editor allows filtering of the graph using nested AND, OR and NOT expressions.

<ul>
  <li>The query is validated during typing</li>
  <li>Valid queries are stored per view and exported to a model.json upon export</li>
  <li>Changes in the UI updates the query and resets custom AND/NOT logics and nested brackets</li>
  <li>Invalid syntax is <span class="q-error-unrecognized">highlighted</span></li>
</ul>
<hr>
<h3>Query Structure Explained</h3>
<div class="popupQueryContainer">
  <span class="q-bracket-open-lvl-1">(</span>
  <span class="q-property-wrapper"><span class="q-maingroup">${EXCEL_NODE_HEADER}</span><span class="q-prop-group-separator">::</span><span class="q-subgroup">group A</span><span class="q-prop-group-separator">::</span><span class="q-property">prop X</span></span>
  <span class="q-kw-between">BETWEEN</span>
  <span class="q-number">0</span>
  <span class="q-kw-between-and">AND</span>
  <span class="q-number">1.3</span>
  <span class="q-connector-closing"><span class="q-bracket-close-lvl-1">)</span></span>
  <span class="q-connector-or">&nbsp;OR&nbsp;</span>
  <span class="q-connector-opening-bracket"><span class="q-bracket-open-lvl-1">(</span></span>
  <span class="q-property-wrapper"><span class="q-maingroup">${EXCEL_NODE_HEADER}</span><span class="q-prop-group-separator">::</span><span class="q-subgroup">group A</span><span class="q-prop-group-separator">::</span><span class="q-property">prop Y</span></span>
  <span class="q-in-cat-bracket-open">IN<span class="q-space"> </span>[</span>
  <span class="q-string">foo</span>
  <span class="q-comma">,</span>
  <span class="q-string">bar</span>
  <span class="q-cat-bracket-close">]</span>
  <span class="q-connector-closing"><span class="q-bracket-close-lvl-1">)</span></span>
</div>
<ul>
<li><span class="q-bracket-open-lvl-1">(</span>&nbsp;<span class="q-bracket-close-lvl-1">)</span>: Parentheses collect several conditions into one logical unit 
  <ul>
    <li>Groups can be nested to any depth</li>
    <li>Up to five levels of nested brackets are colour-coded: <span class="q-bracket-open-lvl-1">(</span><span class="q-bracket-open-lvl-2">(</span><span class="q-bracket-open-lvl-3">(</span><span class="q-bracket-open-lvl-4">(</span><span class="q-bracket-open-lvl-5">(</span><span class="q-bracket-close-lvl-5">)</span><span class="q-bracket-close-lvl-4">)</span><span class="q-bracket-close-lvl-3">)</span><span class="q-bracket-close-lvl-2">)</span><span class="q-bracket-close-lvl-1">)</span></li>
    <li>Unmatched brackets are highlighted: <span class="q-bracket-close-lvl-0 q-error-unmatched-closing-bracket">)</span></li>
  </ul>
</li>
<li><span class="q-property-wrapper"><span class="q-maingroup">${EXCEL_NODE_HEADER}</span><span class="q-prop-group-separator">::</span><span class="q-subgroup">group A</span><span class="q-prop-group-separator">::</span><span class="q-property">prop X</span></span>: selects property <strong>prop X [group A]</strong> from the <strong>node</strong> sheet 
  <ul>
    <li>Properties always have <strong>3 levels</strong>, separated by <span class="q-property-wrapper"><span class="q-prop-group-separator">::</span></span></li>
    <li>Node properties start with <span class="q-property-wrapper"><span class="q-maingroup">${EXCEL_NODE_HEADER}</span><span class="q-prop-group-separator">::</span></span> while edge properties start with <span class="q-property-wrapper"><span class="q-maingroup">${EXCEL_EDGE_HEADER}</span><span class="q-prop-group-separator">::</span></span></li>
    <li>If no groups are defined in a column of the input file, the default group <span class="q-property-wrapper"><span class="q-subgroup">${EXCEL_UNCATEGORIZED_SUBHEADER}</span></span> is used</li>
  </ul> 
</li>
<li>Properties must be followed by a <strong>filter instruction</strong>. Three different instructions exist: </strong>
  <ul>
    <li><span class="q-kw-between">BETWEEN</span>&nbsp;<span class="q-number">0</span>&nbsp;<span class="q-kw-between-and">AND</span>&nbsp;<span class="q-number">1.3</span>: keeps numerical values from 0 to 1.3 (inclusive)</li>
    <li><span class="q-lower-than">LOWER THAN</span>&nbsp;<span class="q-number">0.2</span>&nbsp;<span class="q-or-greater-than">OR GREATER THAN</span>&nbsp;<span class="q-number">0.8</span>: keeps numerical values ≤ 0.2 or ≥ 0.8</li>
    <li><span class="q-in-cat-bracket-open">IN<span class="q-space">&nbsp;</span>[</span>&nbsp;<span class="q-string">foo</span><span class="q-comma">,</span> <span class="q-string">bar</span>&nbsp;<span class="q-cat-bracket-close">]</span>: keeps categorical values 'foo' or 'bar'</li>  
  </ul>
</li>
<li><span class="q-connector-or">&nbsp;OR&nbsp;</span>: one of three logical operators that links two conditions or groups. Left prevails over right, otherwise all three operators are treated equally.
  <ul>
    <li><span class="q-connector-or">&nbsp;OR&nbsp;</span> results in true if at least one of the linked parts is true</li>
    <li><span class="q-connector-and">&nbsp;AND&nbsp;</span> results in true if both linked parts are true</li>
    <li><span class="q-connector-not">&nbsp;NOT&nbsp;</span> results in true part A is true while part B is not</li>
  </ul>
</li>
</ul>
`, {width: '66vw', height: '50vh', lineHeight: '1.5em'});
}

function humanFileSize(size) {
  let i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return +((size / Math.pow(1024, i)).toFixed(2)) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

async function loadFileWrapper(event) {
  let file = event.target.files[0];
  if (!file) return;

  await showLoading("Loading", `Loading ${file.name} (${file.type} with ${humanFileSize(file.size)})`);
  await new Promise(resolve => requestAnimationFrame(resolve));

  if (graph) {
    await destroyGraphAndRollBackUI();
  }

  loadFile(event)
    .then(async (fileData) => {
      if (!fileData) {
        error("File data is empty.");
        await hideLoading();
        await new Promise(resolve => requestAnimationFrame(resolve));
        return;
      }

      preProcessData(fileData);
      initCache();
      buildUI();
      await createGraphInstance();

      if (!graph) {
        error("Graph not initialized, aborting.");
        await hideLoading();
        await new Promise(resolve => requestAnimationFrame(resolve));
        return;
      }
      await graph.render();
      await graph.fitView();
      debug("Initial graph rendered.");
    })
    .catch(async (errorMsg) => {
      error(`Error loading graph: ${errorMsg}`);
      await hideLoading();
      await new Promise(resolve => requestAnimationFrame(resolve));
    })
    .finally(async () => {
      await hideLoading();
      await new Promise(resolve => requestAnimationFrame(resolve));
    });
}

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

async function destroyGraphAndRollBackUI() {
  await graph.destroy();
  graph = null;

  // isPositionsDirty = false;
  // syncPositionsDebounced.cancel?.();

  const status = document.getElementById("sidebarStatusContainer");
  status.innerHTML = "";
  status.style.height = "0";
}

function registerHotkeyEvents() {
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
        await exportPNG();
        break;
      case "s":
        await exportGraphAsJSON();
        break;
      case "r":
        await resetLayout();
        break;
      case "f":
        await graph.fitView();
        break;
      case "e":
        await toggleEditMode();
        break;
      case "q":
        toggleQueryEditor();
        break;
      case "m":
        cache.metrics.toggleUI();
        break;
      default:
        break;
    }
  });
}

function registerGlobalEventListeners() {
  ['input', 'keydown', 'keyup', 'mousedown', 'mouseup', 'focus', 'blur', 'scroll', 'selectionchange'].forEach(evt =>
    query.text.addEventListener(evt, moveCaret)
  );
}

async function registerPluginStates() {
  debug("Registering bubble set plugin instances ..");
  for (const group of traverseBubbleSets()) {
    INSTANCES.BUBBLE_GROUPS[group] = await graph.getPluginInstance(`bubbleSetPlugin-${group}`);
  }
}

async function resetLayout() {
  // await showLoading("Resetting", "Resetting layout to default ..");
  // await new Promise(resolve => requestAnimationFrame(resolve));
  //
  // if (!data.layouts[data.selectedLayout].isCustom) {
  //   data.layouts[data.selectedLayout]?.positions?.clear();
  // }
  //
  // await graph.updateData(createSimplifiedDataForGraphObject(true));
  // let layout = data.layouts[data.selectedLayout];
  // await graph.setLayout({type: data.selectedLayout, ...layout.internals});
  //
  // await debugPositions();
  // await decideToRenderOrDraw(true).then(r => debug(`Reset layout ${data.selectedLayout}`));
  // await debugPositions();
  await restoreInitialNodePositions();
}

async function exportPNG() {
  // https://g6.antv.antgroup.com/en/api/reference/g6/dataurloptions#properties

  try {
    await showLoading("Loading", "Generating picture data");
    await new Promise(resolve => requestAnimationFrame(resolve));
    const imageData = graph.toDataURL({
      type: "image/png", mode: "viewport"
    });

    const link = document.createElement('a');
    link.href = imageData;
    link.download = 'graph.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    await hideLoading();
    await new Promise(resolve => requestAnimationFrame(resolve));
  } catch (errorMsg) {
    await hideLoading();
    await new Promise(resolve => requestAnimationFrame(resolve));
    error(errorMsg);
  }
}

async function showLoading(header, text = "") {
  const overlay = document.getElementById('loadingOverlay');
  overlay.style.display = 'flex';
  overlay.style.opacity = '1';

  document.getElementById('loadingHeader').textContent = header;
  document.getElementById('loadingText').textContent = text;

  let logInfo = header;
  if (text) logInfo += `: ${text}`;
  debug(logInfo);

  // Force reflow
  overlay.getBoundingClientRect();

  await new Promise(resolve => requestAnimationFrame(resolve));

  // Wait for next frame to ensure the UI has updated
  return new Promise(resolve => requestAnimationFrame(resolve));
}

async function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  overlay.style.opacity = '0';

  // Wait for the opacity transition to complete
  await new Promise(resolve => {
    const transitionDuration = getComputedStyle(overlay).transitionDuration;
    const durationInMs = parseFloat(transitionDuration) * (transitionDuration.includes('ms') ? 1 : 1000);
    setTimeout(resolve, durationInMs);
  });

  overlay.style.display = 'none';
  refreshUI();
}

function refreshUI() {
  if (!cache.initialized) return;

  // const loadFromStashBtn = document.getElementById("loadFromStashBtn");
  // data.stash ? loadFromStashBtn.classList.remove("disabled") : loadFromStashBtn.classList.add("disabled");

  toggleStyleElementsThatRequireAtLeastOneVisibleNode(cache.nodeIDsToBeShown.size > 0);
  toggleStyleElementsThatRequireAtLeastOneVisibleEdge(cache.edgeIDsToBeShown.size > 0);
  toggleStyleElementsThatRequireAtLeastOneVisibleNodeOrEdge(cache.nodeIDsToBeShown.size > 0 || cache.edgeIDsToBeShown.size > 0);

  document.getElementById("visibleNodes").innerHTML = `${cache.nodeIDsToBeShown.size - cache.hiddenDanglingNodeIDs.size}`;
  document.getElementById("totalNodes").innerHTML = `${data.nodes.length}`;
  document.getElementById("visibleEdges").innerHTML = `${cache.edgeIDsToBeShown.size - cache.hiddenDanglingEdgeIDs.size}`;
  document.getElementById("totalEdges").innerHTML = `${data.edges.length}`;

  refreshStashUI();
}

window.addEventListener('resize', () => {
  if (graph !== null) {
    const editModeActive = document.getElementById("editBtn").classList.contains("active");
    const sidebarContentContainer = document.getElementById("sidebarContentContainer");
    const status = document.getElementById("sidebarStatusContainer");

    status.style.maxWidth = editModeActive ? `${sidebarContentContainer.offsetWidth}px` : "360px";
  }
})

function getTimestamp(includeMilliseconds = false) {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  if (includeMilliseconds) {
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    return `${hh}:${mm}:${ss}.${ms}`;
  }
  return `${hh}:${mm}:${ss}`;
}

function logMessage(text, colorClass, bold = false, iconPrefix = "") {
  const timestamp = getTimestamp();

  const container = document.getElementById('sidebarStatusContainer');
  container.style.height = "8%";

  const p = document.createElement('p');
  p.style.margin = "0 0 1px 0";

  const spanTime = document.createElement('span');
  spanTime.textContent = `${timestamp} | `;
  spanTime.classList.add("grey");
  p.appendChild(spanTime);

  if (iconPrefix) {
    const spanIcon = document.createElement('span');
    spanIcon.textContent = iconPrefix;
    spanIcon.classList.add("mr");
    p.appendChild(spanIcon);
  }

  const spanText = document.createElement('span');
  spanText.classList.add(colorClass);
  spanText.style.fontWeight = bold ? "bold" : "normal";
  spanText.textContent = text;
  p.appendChild(spanText);

  container.appendChild(p);
  container.scrollTop = container.scrollHeight;
}

function info(message) {
  logMessage(message, "black", false);
}

function warning(message) {
  logMessage(message, "dark-orange", false, "⚠️");
}

function error(message) {
  logMessage(message, "red", true, "⛔");
}

function success(message) {
  logMessage(message, "green", false);
}

function debug(message) {
  console.log(`${getTimestamp(true)} | ${message}`);
  if (debugEnabled) {
    logMessage(message, "grey", false);
  }
}

async function debugQuery(query) {
  query.text.textContent = query;
  handleQueryValidationEvent();
  await handleQueryUpdateEvent();
}

const redrawBubbleSets = debounce(async () => {
  if (!EVENT_LOCKS.ONCE_AFTER_RENDER_COMPLETED) return;
  if (EVENT_LOCKS.BUBBLE_GROUP_REDRAW_RUNNING) return;

  EVENT_LOCKS.BUBBLE_GROUP_REDRAW_RUNNING = true;
  try {
    for (const group of traverseBubbleSets()) {
      const cachedMembers = cache.lastBubbleSetMembers.get(group);
      if (cachedMembers?.size > 0) {
        debug(`Redrawing bubble set ${group} with ${cachedMembers.size} members ..`);
        await updateBubbleSet(group, []);
        await updateBubbleSet(group, Array.from(cachedMembers));
      }
    }
  } finally {
    EVENT_LOCKS.BUBBLE_GROUP_REDRAW_RUNNING = false;
  }
}, 50);

async function getPos() {
  const zoom = await graph.getZoom();
  const pos = await graph.getPosition();
  console.log(`Zoom: ${zoom}`);
  console.log(`Position: ${pos}`);
}

async function resetFilters(section, subSection=undefined) {
  const idPrefix = section + (subSection ? `::${subSection}` : "");
  const affectedPropIDs = Array.from(cache.propIDs).filter(id => id.startsWith(idPrefix));

  for (const propID of affectedPropIDs) {
    checkCheckbox(propID, true);
    const slider = cache.propIDToInvertibleRangeSliders.get(propID);
    const dropdown = cache.propIDToDropdownChecklists.get(propID);

    if (slider) await slider.reset();
    if (dropdown) await dropdown.selectAllCategories(true);
  }

  await handleFilterEvent("Filtering", `Resetting filters for ${idPrefix} ..`);
}