const {Graph, NodeEvent, GraphEvent, CanvasEvent, CommonEvent, WindowEvent} = G6;

/** @type {import('@antv/g6').Graph","null} */
let graph = null;
let data = {};  // Stores data that can be serialized as json file
let cache = {};  // Stores references to map IDs to node/edge objects that cannot be serialized to a json file
let inputErrors = [];

const HIDE_SLIDERS_WITH_SAME_MIN_MAX_VALUES = true;
const FILTER_STEP_SIZE_INTEGER = 1;
const FILTER_STEP_SIZE_FLOAT = 0.000001;
const FILTER_VISUAL_FLOAT_PRECISION = 3;  // used in slider thumbs and tooltips; in the back, full float is used
const FILTERS_ACTIVE_PER_DEFAULT = false;
const SORT_FILTERS = false;
const SORT_TOOLTIPS = true;
const TOOLTIP_LINE_BREAK = 20;
const TOOLTIP_HIDE_NULL_VALUES = false;
const MAX_NODES_BEFORE_HIDING_LABELS = 300;

const AVOID_NON_BUBBLE_GROUP_MEMBERS = false;

const DEFAULTS = {
  NODE: {
    COLOR: "#C33D35", SIZE: 20, TYPE: "hexagon"
  },
  EDGE: {
    COLOR: "#403C5390", LINE_WIDTH: 0.75, TYPE: "line", ARROWS: {START: false, END: false}
  },
  LAYOUT: "force",
  LAYOUT_INTERNALS: {
    "force": {gravity: 10},
    "fruchterman": {gravity: 5, speed: 5, clustering: true, nodeClusterBy: 'cluster', clusterGravity: 16},
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
    NODE_SIZES: {sm: 15, md: 25, lg: 35, xlg: 50},
    NODE_BORDER_COLORS: {red: "#C33D35", purple: "#403C53", blue: "#8CA6D9", pink: "#EFB0AA", grey: "#ABACBD", transparent: "#00000000"},
    NODE_BORDER_SIZES: {sm: 0.5, md: 1, lg: 2, xlg: 4},
    NODE_LABEL_SIZES: {sm: 10, md: 12, lg: 14, xlg: 20},
    NODE_BADGE_PLACEMENTS: ["left", "right", "top", "bottom", "left-top", "left-bottom", "right-top", "right-bottom", "top-left", "top-right", "bottom-left", "bottom-right"],
    NODE_BADGE_DEFAULT_COLOR: "#C33D35",
    EDGE_COLORS: {red: "#C33D35", purple: "#403C53", blue: "#8CA6D9", pink: "#EFB0AA", grey: "#ABACBD"},
    EDGE_WIDTHS: {sm: 0.5, md: 0.75, lg: 1, xlg: 3},
    EDGE_DASHS: {none: 0, dashed: 10},
    EDGE_HALO: {enable: true, disable: false},
    EDGE_HALO_STROKE: {red: "#C33D35", purple: "#403C53", blue: "#8CA6D9", pink: "#EFB0AA", grey: "#ABACBD"},
    EDGE_HALO_WIDTH: {sm: 2, md: 3, lg: 4, xlg: 6},
  }
};

function createDefaultLayout(key) {
  if (data?.layouts?.[key]) {
    alert("Layout with key '" + key + "' already exists.");
    return false;
  }

  const defLayout = {
    internals: DEFAULTS.LAYOUT_INTERNALS[key] || null,
    positions: new Map(),
    filters: structuredClone(data.filterDefaults),
    isCustom: false,
    filterStrategy: "AND",
  };

  for (let group of traverseBubbleSets()) {
    defLayout[`${group}Props`] = new Set();
  }

  return defLayout
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
      filterStrategy: layout.filterStrategy || "AND",
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

function createStyleDiv(propID) {
  const container = document.createElement("div");
  container.classList.add("style-container");

  if (!propID) {
    const buttonBar = document.createElement("div");
    const selectAllNodes = document.createElement("button");
    selectAllNodes.textContent = "All nodes";
    selectAllNodes.classList.add("style-inner-button");
    selectAllNodes.onclick = () => {
      toggleSelectionForAllNodes(true);
    }
    buttonBar.appendChild(selectAllNodes);

    const selectNoNodes = document.createElement("button");
    selectNoNodes.textContent = "No nodes";
    selectNoNodes.classList.add("style-inner-button");
    selectNoNodes.onclick = () => {
      toggleSelectionForAllNodes(false);
    }
    buttonBar.appendChild(selectNoNodes);

    const selectAllEdges = document.createElement("button");
    selectAllEdges.textContent = "All edges";
    selectAllEdges.classList.add("style-inner-button");
    selectAllEdges.onclick = () => {
      toggleSelectionForAllEdges(true);
    }
    buttonBar.appendChild(selectAllEdges);

    const selectNoEdges = document.createElement("button");
    selectNoEdges.textContent = "No edges";
    selectNoEdges.classList.add("style-inner-button");
    selectNoEdges.onclick = () => {
      toggleSelectionForAllEdges(false);
    }
    buttonBar.appendChild(selectNoEdges);

    createSection("Select", buttonBar);
    createSeparator();
  }

  function getTargetNodes(propID) {
    if (!propID) return cache.selectedNodes;
    return [...cache.propToNodeIDs.get(propID)].filter((nodeID) =>
      cache.nodeIDsToBeShown.has(nodeID)
    );
  }

  function getTargetEdges(propID) {
    if (!propID) return cache.selectedEdges;
    return [...cache.propToEdgeIDs.get(propID)].filter((edgeID) =>
      cache.edgeIDsToBeShown.has(edgeID)
    );
  }

  function updateNodes(
    propID = null,
    property = null,
    type = null,
    color = null,
    size = null,
    label = null,
    badge = null
  ) {
    for (const nodeID of propID ? getTargetNodes(propID) : cache.selectedNodes) {
      const node = cache.nodeRef.get(nodeID);
      if (type !== null) node.type = type;
      if (color !== null) {
        if (property === "Node") node.style.fill = color;
        else if (property === "Node Border") {
          node.style.stroke = color;
          if (!node.style.lineWidth) node.style.lineWidth = DEFAULTS.STYLES.NODE_BORDER_SIZES.md;
        }
      }
      if (size !== null) {
        if (property === "Node") node.style.size = size;
        else if (property === "Node Border") node.style.lineWidth = size;
        else if (property === "Node Label") node.style.labelFontSize = size;
      }
      if (label !== null) {
        if (label === "::SET_TO_ID::") node.style.labelText = nodeID;
        else node.style.labelText = label;
      }
      if (badge !== null) {
        if (badge === "::CLEAR::") {
          node.style.badge = false;
          node.style.badges = [];
          node.style.badgePalette = [];
        } else {
          node.style.badge = true;
          if (!node.style.badges) node.style.badges = [];
          if (!node.style.badgePalette) node.style.badgePalette = [];
          node.style.badges.push({text: badge.text, placement: badge.placement});
          node.style.badgePalette.push(badge.color);
        }
      }
    }
    graph.render();
  }

  function updateEdges(
    propID = null,
    property = null,
    width = null,
    label = null,
    color = null,
    halo = null
  ) {
    for (const edgeID of propID ? getTargetEdges(propID) : cache.selectedEdges) {
      const edge = cache.edgeRef.get(edgeID);
      if (width !== null) {
        if (property === "Edge") edge.style.lineWidth = width;
        else if (property === "Edge Dash") edge.style.lineDash = width;
        else if (property === "Edge Halo") edge.style.haloLineWidth = width;
      }
      if (label !== null) edge.style.labelText = label;
      if (color !== null) {
        if (property === "Edge") edge.style.stroke = color;
        else if (property === "Edge Halo") edge.style.haloStroke = color;
      }
      if (halo !== null) edge.style.halo = halo;
    }
    graph.render();
  }

  // Helper to create a labeled section with heading and controls
  function createSection(title, controls) {
    const heading = document.createElement("div");
    heading.textContent = title;
    heading.classList.add("style-col1-heading");
    controls.classList.add("style-col2-controls");

    container.appendChild(heading);
    container.appendChild(controls);
  }

  function createSeparator() {
    const separator = document.createElement("div");
    separator.classList.add("style-separator");
    container.appendChild(separator);
  }

  function createLabelControls(property) {
    const controls = document.createElement("div");

    const labelInput = document.createElement("input");
    labelInput.type = "text";
    labelInput.placeholder = `Enter ${property}`;
    labelInput.className = "style-input style-input-lg";
    labelInput.value = "";

    const clearLabelButton = document.createElement("button");
    clearLabelButton.textContent = "Clear";
    clearLabelButton.className = "style-inner-button red";
    clearLabelButton.onclick = () => {
      labelInput.value = "";
      updateNodes(propID, property, null, null, null, "", null);
    };

    const setToIDButton = document.createElement("button");
    setToIDButton.textContent = "Set to ID";
    setToIDButton.classList.add("style-inner-button");
    setToIDButton.onclick = () => {
      labelInput.value = "";
      updateNodes(propID, property, null, null, null, "::SET_TO_ID::", null);
    };

    labelInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        const newLabel = labelInput.value.trim();
        updateNodes(propID, property, null, null, null, newLabel, null);
      }
    });

    controls.appendChild(labelInput);
    controls.appendChild(setToIDButton);
    controls.appendChild(clearLabelButton);

    return controls;
  }

  function createNodeFormControls() {
    const controls = document.createElement("div");

    for (const [label, value] of Object.entries(DEFAULTS.STYLES.NODE_FORM)) {
      const button = document.createElement("button");
      button.textContent = label;
      button.title = value;
      button.classList.add("style-inner-button");
      button.onclick = () => {
        updateNodes(propID, null, value, null, null, null, null);
      };
      controls.appendChild(button);
    }

    return controls;
  }

  function createColorControls(property, defaultColor, colors) {
    const controls = document.createElement("div");

    for (const [label, value] of Object.entries(colors)) {
      const colorButton = document.createElement("button");
      colorButton.style.backgroundColor = value;
      colorButton.style.color = getReadableForegroundColor(value);
      colorButton.classList.add("style-inner-button");
      colorButton.textContent = label;
      colorButton.onclick = () => {
        colorInput.value = value;
        property.startsWith("Node")
          ? updateNodes(propID, property, null, value, null, null, null)
          : updateEdges(propID, property, null, null, value, null);
      };
      controls.appendChild(colorButton);
    }

    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.classList.add("style-inner-button");
    colorPicker.style.width = "24px";
    colorPicker.value = defaultColor; // Default color

    // fires on every change in the color picker; only updates input
    colorPicker.oninput = () => {
      colorInput.value = colorPicker.value;
    };

    // fired when leaving the color picker
    colorPicker.onchange = () => {
      property.startsWith("Node")
        ? updateNodes(propID, property, null, colorPicker.value, null, null, null)
        : updateEdges(propID, property, null, null, colorPicker.value, null);
    }

    const colorInput = document.createElement("input");
    colorInput.type = "text";
    colorInput.value = defaultColor; // Default color
    colorInput.classList.add("style-input");

    colorInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        property.startsWith("Node")
          ? updateNodes(propID, property, null, colorInput.value, null, null, null)
          : updateEdges(propID, property, null, null, colorInput.value, null);
      }
    });

    controls.appendChild(colorPicker);
    controls.appendChild(colorInput);

    return controls;
  }

  function createSizeControls(property, defaultValue, sizeMap) {
    const controls = document.createElement("div");

    const sizeInput = document.createElement("input");
    sizeInput.type = "text";
    sizeInput.placeholder = `Custom ${property.toLowerCase()} size`;
    sizeInput.classList.add("style-input");
    sizeInput.value = defaultValue;

    for (const [label, value] of Object.entries(sizeMap)) {
      const button = document.createElement("button");
      button.textContent = label;
      button.classList.add("style-inner-button");
      button.onclick = () => {
        sizeInput.value = value;
        property.startsWith("Node")
          ? updateNodes(propID, property, null, null, value, null, null)
          : updateEdges(propID, property, value, null, null, null);
      };
      controls.appendChild(button);
    }

    sizeInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        const customValue = parseFloat(sizeInput.value);
        if (!isNaN(customValue)) {
          property.startsWith("Node")
            ? updateNodes(propID, property, null, null, customValue, null, null)
            : updateEdges(propID, property, customValue, null, null, null);
        } else {
          sizeInput.value = defaultValue;
        }
      }
    });

    controls.appendChild(sizeInput);

    return controls;
  }

  function createHaloEnablingControls() {
    const controls = document.createElement("div");

    const enableButton = document.createElement("button");
    enableButton.textContent = "Enable";
    enableButton.classList.add("style-inner-button");
    enableButton.onclick = () => {
      updateEdges(propID, null, null, null, null, true);
    };
    controls.appendChild(enableButton);

    const disableButton = document.createElement("button");
    disableButton.textContent = "Disable";
    disableButton.classList.add("style-inner-button");
    disableButton.onclick = () => {
      updateEdges(propID, null, null, null, null, false);
    };
    controls.appendChild(disableButton);

    return controls;
  }

  function createBadgeControls() {
    const controls = document.createElement("div");

    const badgeInput = document.createElement("input");
    badgeInput.type = "text";
    badgeInput.placeholder = "Enter badge text";
    badgeInput.className = "style-input style-input-lg";

    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.className = "style-inner-button";
    colorPicker.style.width = "24px";
    colorPicker.value = DEFAULTS.STYLES.NODE_BADGE_DEFAULT_COLOR;

    const placementDropdown = document.createElement("select");
    placementDropdown.className = "style-inner-button";
    DEFAULTS.STYLES.NODE_BADGE_PLACEMENTS.forEach((placement) => {
      const option = document.createElement("option");
      option.value = placement;
      option.textContent = placement.replace("-", " ");
      placementDropdown.appendChild(option);
    });

    const addBadgeButton = document.createElement("button");
    addBadgeButton.textContent = "Add";
    addBadgeButton.classList.add("style-inner-button");
    addBadgeButton.onclick = () => {
      const badge = {
        text: badgeInput.value.trim(),
        color: colorPicker.value,
        placement: placementDropdown.value
      };
      updateNodes(propID, null, null, null, null, null, badge);
    };

    const clearBadgesButton = document.createElement("button");
    clearBadgesButton.textContent = "Clear";
    clearBadgesButton.className = "style-inner-button red";
    clearBadgesButton.onclick = () => {
      updateNodes(propID, null, null, null, null, null, "::CLEAR::");
    };

    controls.appendChild(badgeInput);
    controls.appendChild(colorPicker);
    controls.appendChild(placementDropdown);
    controls.appendChild(addBadgeButton);
    controls.appendChild(clearBadgesButton);

    return controls;
  }

  if (!propID || cache.nodeExclusiveProps.has(propID) || cache.mixedProps.has(propID)) {
    createSection("Node Form", createNodeFormControls());
    createSection("Node Color", createColorControls("Node", DEFAULTS.NODE.COLOR, DEFAULTS.STYLES.NODE_COLORS));
    createSection("Node Size", createSizeControls("Node", DEFAULTS.NODE.SIZE, DEFAULTS.STYLES.NODE_SIZES));
    createSection("Node Border Color", createColorControls("Node Border", DEFAULTS.STYLES.NODE_BORDER_COLORS.transparent, DEFAULTS.STYLES.NODE_BORDER_COLORS));
    createSection("Node Border Size", createSizeControls("Node Border", DEFAULTS.STYLES.NODE_BORDER_SIZES.md, DEFAULTS.STYLES.NODE_BORDER_SIZES));
    createSection("Node Label", createLabelControls("Node Label"));
    createSection("Node Label Size", createSizeControls("Node Label", DEFAULTS.STYLES.NODE_LABEL_SIZES.md, DEFAULTS.STYLES.NODE_LABEL_SIZES));
    createSection("Node Badges", createBadgeControls());
  }

  if (!propID || cache.mixedProps.has(propID)) {
    createSeparator();
  }

  if (!propID || cache.edgeExclusiveProps.has(propID) || cache.mixedProps.has(propID)) {
    createSection("Edge Color", createColorControls("Edge", DEFAULTS.EDGE.COLOR, DEFAULTS.STYLES.EDGE_COLORS));
    createSection("Edge Width", createSizeControls("Edge", DEFAULTS.EDGE.LINE_WIDTH, DEFAULTS.STYLES.EDGE_WIDTHS));
    createSection("Edge Dash", createSizeControls("Edge Dash", DEFAULTS.STYLES.EDGE_DASHS.none, DEFAULTS.STYLES.EDGE_DASHS));
    createSection("Edge Halo", createHaloEnablingControls());
    createSection("Edge Halo Color", createColorControls("Edge Halo", DEFAULTS.STYLES.EDGE_HALO_STROKE.purple, DEFAULTS.STYLES.EDGE_HALO_STROKE));
    createSection("Edge Halo Width", createSizeControls("Edge Halo", DEFAULTS.STYLES.EDGE_HALO_WIDTH.md, DEFAULTS.STYLES.EDGE_HALO_WIDTH));
  }

  return container;
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

function toggleSelectionForAllNodes(enable) {
  const nodes = graph.getNodeData();
  updateSelectedState(nodes, enable);
  graph.updateNodeData(nodes);
  graph.render();
}

function toggleSelectionForAllEdges(enable) {
  const edges = graph.getEdgeData();
  updateSelectedState(edges, enable);
  graph.updateEdgeData(edges);
  graph.render();
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
  // call with
  //     for (let [section, subsection, prop, data] of traverseD4Data(nodeOrEdge)) {
  //        console.log(`Section: ${section}, SubSection: ${subsection}, Prop: ${prop}, Data:`, data);
  //      }
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

  // Reserved column mappings
  const RESERVED_COLUMNS = {
    x: 'x', // Position X
    y: 'y', // Position Y
    label: 'label', // Node or edge label
    color: 'color', // Node or edge color
    size: 'size', // Node size
    source: 'source', // Edge source node ID
    target: 'target', // Edge target node ID
  };

  const nodesSheet = workbook.Sheets['nodes'];
  const edgesSheet = workbook.Sheets['edges'];

  if (!nodesSheet || !edgesSheet) {
    throw new Error('The Excel file must have two sheets: "nodes" and "edges".');
  }

  const nodesData = XLSX.utils.sheet_to_json(nodesSheet, {defval: null});
  const edgesData = XLSX.utils.sheet_to_json(edgesSheet, {defval: null});

  const parsedNodes = nodesData.map(row => {
    const node = {};
    if (row.id == null) {
      throw new Error('Each node must have an "id" column.');
    }

    node.id = row.id; // Mandatory ID
    node.label = row[RESERVED_COLUMNS.label] || null; // Optional label
    node.style = {}; // Styles (e.g., color, size)

    if (row[RESERVED_COLUMNS.x] != null && row[RESERVED_COLUMNS.y] != null) {
      node.x = row[RESERVED_COLUMNS.x];
      node.y = row[RESERVED_COLUMNS.y];
    }
    if (row[RESERVED_COLUMNS.color]) {
      node.style.fill = row[RESERVED_COLUMNS.color]; // Map color to node style
    }
    if (row[RESERVED_COLUMNS.size] != null) {
      node.style.size = row[RESERVED_COLUMNS.size];
    }

    return node;
  });

  const parsedEdges = edgesData.map(row => {
    const edge = {};
    if (row[RESERVED_COLUMNS.source] == null || row[RESERVED_COLUMNS.target] == null) {
      throw new Error('Each edge must have "source" and "target" columns.');
    }

    edge.source = row[RESERVED_COLUMNS.source]; // Mandatory source
    edge.target = row[RESERVED_COLUMNS.target]; // Mandatory target
    edge.label = row[RESERVED_COLUMNS.label] || null; // Optional label
    edge.style = {}; // Styles (e.g., color)

    if (row[RESERVED_COLUMNS.color]) {
      edge.style.stroke = row[RESERVED_COLUMNS.color]; // Map color to edge style
    }

    return edge;
  });

  // return {
  //   nodes: [{"id": "MF_0", "color": "#572cd2", "label": "MF 0", "description": "optional description for node id 0", "type": "hexagon", "size": 25, "D4Data": {"cells": {}, "tissues": {"vasculature": {"Endothelium": "category_1"}, "heart": {"Myocardium": 20}}, "phenotypes": {"NO_GROUPS_YET": {"Collagenous Sprue": "category_3"}}}},{"id": "MF_1", "color": "#1495f8", "label": "MF 1", "description": "optional description for node id 1", "type": "hexagon", "size": 25, "D4Data": {"cells": {}, "tissues": {"vasculature": {"Endothelium": "category_2"}}, "phenotypes": {"NO_GROUPS_YET": {"Atrial Remodeling": 215}}}},{"id": "MF_15", "color": "#61752d", "label": "MF 15", "description": "optional description for node id 15", "type": "hexagon", "size": 25, "D4Data": {"cells": {"adipose tissue": {"ADIPOCYTE": 1.137999}, "ECM": {"CARDIOFIBROBLAST": "category_2"}}, "tissues": {}, "phenotypes": {"NO_GROUPS_YET": {"Rhinitis, Allergic": 533}}}}],
  //   edges: [{"color": "#E4E3EA", "source": "MF_0", "target": "MF_15", "D4Data": {"properties": {"NO_GROUPS_YET": {"GWAS": 422}}}, "id": "MF_0::MF_15", "label": "Edge 0"}]
  // }

  return {
    nodes: parsedNodes,
    edges: parsedEdges,
    combos: [],
    layouts: {},
  };
}


function createGraphInstance() {
  if (graph === null) {

    graph = new Graph({
      container: 'innerGraphContainer',
      autoFit: 'view',
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
      behaviors: [
        {type: 'drag-canvas', key: 'drag-canvas',},
        {type: 'zoom-canvas', key: 'zoom-canvas',},
        {type: 'drag-element', cursor: {default: 'default', grab: 'default', grabbing: 'default'},},
        {
          type: 'hover-activate',
          enable: (event) => {
            // console.log(event.target.config.id);
            return event.targetType === 'node' || event.targetType === 'edge';
          },
          degree: 1,
          // degree: (event) => {
          //   if (event.targetType === 'node') {
          //     let relatedEdges = graph.getRelatedEdgesData(event.target.config.id).map(e => e.id);
          //     let relatedNodes = graph.getNeighborNodesData(event.target.config.id).map(n => n.id);
          //     if (!relatedEdges.every(edgeId => !cache.edgeIDsToBeShown.has(edgeId))) {
          //       return 0;
          //     }
          //     // return visibleNeighbors.length > 0 ? 1 : 0;
          //   }
          //   return 1;
          // },
          state: 'highlight',
          inactiveState: 'dim',
        },
      ],
      plugins: [
        {
          key: "tooltip",
          type: "tooltip",
          trigger: "click",
          enterable: true,
          getContent: (e, items) => cache.toolTips.get(items[0].id),
        },
        {key: "minimap", type: "minimap",},
        ...[...traverseBubbleSets()].map(group => ({
          key: `bubbleSetPlugin-${group}`,
          type: "bubble-sets",
          members: [],
          avoidMembers: [...cache.nodeRef.keys()],
          ...DEFAULTS.BUBBLE_SET_STYLE[group],
          strokeOpacity: 0,  // hide bubble groups initially (1 node persists due to bug)
          fillOpacity: 0,
        })),
      ],
    });

    graph.on(NodeEvent.DRAG_END, (event) => {
      // persist only the node affected by the event (when moving a group of selected nodes, the event only holds one id ..)
      // data.layouts[data.selectedLayout].positions.set(event.target.id, {...event.canvas});
      // console.log(`moved ${event.target.id} to ${event.canvas.x}, ${event.canvas.y}`);

      // persist all node positions
      persistNodePositions();
    });

    graph.on(GraphEvent.AFTER_DRAW, (ev) => {
      // TODO: fired quite often.. better alternative?
      updateSelectedNodesAndEdges();
    });

    graph.on(GraphEvent.BEFORE_RENDER, () => {
      preRenderEvent();
      console.log("BEFORE RENDER EVENT DONE");
    });

    graph.on(GraphEvent.AFTER_RENDER, () => {
      showLoading("Preparing View", "Restoring Positions and Groups");
      afterRenderEvent();
      // TODO: Without this update and redraw after 200ms, positions are not restored
      restorePositions();
      console.log("AFTER RENDER EVENT DONE");
    });

    let layout = data.layouts[data.selectedLayout];
    if (!layout.isCustom) {
      graph.setLayout({type: data.selectedLayout, ...layout.internals});
    }
  }
}

function updateSelectedNodesAndEdges() {
  cache.selectedNodes = graph.getNodeData()
    .filter((n) => n.states?.includes("selected") && cache.nodeIDsToBeShown.has(n.id))
    .map((n) => n.id);
  cache.selectedEdges = graph.getEdgeData()
    .filter((e) => e.states?.includes("selected") && cache.edgeIDsToBeShown.has(e.id))
    .map((e) => e.id);

  document.getElementById("selectedNodes").textContent = cache.selectedNodes.length;
  document.getElementById("selectedEdges").textContent = cache.selectedEdges.length;
}

function toggleEditMode(ev) {
  let editModeActive = ev.classList.contains("active");
  editModeActive ? ev.classList.remove("active") : ev.classList.add("active");

  const nonEditBehaviors = [
    {type: 'drag-canvas', key: 'drag-canvas'},
    {type: 'drag-element', cursor: {default: 'default', grab: 'default', grabbing: 'default'}},
    {
      type: 'hover-activate', degree: 1, state: 'highlight', inactiveState: 'dim',
      enable: (event) => {
        // console.log(event.targetType);
        return event.targetType === 'node' || event.targetType === 'edge';
      },
    },
  ];

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

  // handle all edit elements
  const editElements = document.querySelectorAll('.show-on-edit');
  editElements.forEach(el => {
    editModeActive ? el.classList.add("show") : el.classList.remove("show");
    editModeActive ? el.style.height = `${el.scrollHeight}px` : el.style.height = "0";
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
    checkboxCol.style.width = editModeActive ? "35%" : "66%";

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

  document.getElementById("sidebar").style.minWidth = editModeActive ? "600px" : "360px";
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

function preRenderEvent() {
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
  cache.remainingEdgeRelatedNodes = new Set();
  resetFeatureIsWithinThresholdMaps();

  for (let propID of cache.activeProps) {
    let fd = data.layouts[data.selectedLayout].filters.get(propID);
    cache.propIDsToNodeIDsToBeShown.set(propID, new Set());

    for (let node of cache.propToNodes.get(propID) || []) {
      if (isWithinThreshold(fd, node.featureValues.get(propID), node)) {
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
    for (let edge of cache.propToEdges.get(propID) || []) {
      if (isWithinThreshold(fd, edge.featureValues.get(propID), edge) && allRelatedNodesAreVisible(edge.id)) {
        // this edge has an active property, is within the defined thresholds, and all of its related nodes are visible,
        // so we can also consider to show the edge itself
        cache.edgeIDsToBeShown.add(edge.id);
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

  // TODO: skip rendering if no nodes/edges are visible
  document.getElementById("visibleNodes").innerHTML = `${cache.nodeIDsToBeShown.size}`;
  document.getElementById("totalNodes").innerHTML = `${data.nodes.length}`;
  document.getElementById("visibleEdges").innerHTML = `${cache.edgeIDsToBeShown.size}`;
  document.getElementById("totalEdges").innerHTML = `${data.edges.length}`;

  const idsToShow = [...cache.nodeIDsToBeShown, ...cache.edgeIDsToBeShown];
  const idsToHide = [...nodeIDsToBeHidden, ...edgeIDsToBeHidden];
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
    } else {
      // we have edges in an AND-filtered graph, so we want to remember the connected nodes, since all other dangling
      // nodes should be removed
      const [source, target] = edgeID.split("::");
      cache.remainingEdgeRelatedNodes.add(source);
      cache.remainingEdgeRelatedNodes.add(target);
    }
  }

  // if we have any edges displayed, clean up incomplete ones and dangling nodes
  cleanUpDanglingElements();
}

function cleanUpDanglingElements() {
  if (cache.remainingEdgeRelatedNodes.size === 0) return;
  let changes;
  do {
    changes = false;

    // Remove nodes without visible edges
    for (let nodeID of [...cache.nodeIDsToBeShown]) {
      const hasVisibleEdges = Array.from(cache.edgeIDsToBeShown).some(edgeID => {
        const [source, target] = edgeID.split("::");
        return source === nodeID || target === nodeID;
      });

      if (!hasVisibleEdges) {
        cache.nodeIDsToBeShown.delete(nodeID);
        removeFromPropIDsToNodeIDsToBeShown(nodeID);
        changes = true;
      }
    }

    // Remove edges with invisible nodes
    for (let edgeID of [...cache.edgeIDsToBeShown]) {
      const [source, target] = edgeID.split("::");
      if (!cache.nodeIDsToBeShown.has(source) || !cache.nodeIDsToBeShown.has(target)) {
        cache.edgeIDsToBeShown.delete(edgeID);
        changes = true;
      }
    }
  } while (changes); // Repeat until no changes
}

function removeFromPropIDsToNodeIDsToBeShown(nodeID) {
  for (let propID of cache.propIDsToNodeIDsToBeShown.keys()) {
    cache.propIDsToNodeIDsToBeShown.get(propID).delete(nodeID);
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

    if (!subSectionsCreated.has(subSection)) {
      const subHeaderDiv = document.createElement("div");
      subHeaderDiv.classList.add("container-vertical-aligned");

      const subHeader = document.createElement("h5");
      subHeader.textContent = subSection;
      subHeader.classList.add("ml-0", "inline");
      subHeaderDiv.appendChild(subHeader);

      subHeaderDiv.appendChild(createSectionToggleButton(true, section, subSection));
      subHeaderDiv.appendChild(createSectionToggleButton(false, section, subSection));

      div.appendChild(subHeaderDiv);

      subSectionsCreated.add(subSection);
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
    col3.appendChild(createStyleToggleButton(propID));
    row.appendChild(col3);

    div.append(row);
    sliderOrDropdown.appendListeners();

    const hiddenRow = document.createElement("div");
    hiddenRow.id = `style-row-${propID}`;
    hiddenRow.className = "style-row";
    hiddenRow.appendChild(createStyleDiv(propID));

    div.append(hiddenRow);
  }

  const staticStyleDiv = document.getElementById("staticStyleDiv");
  staticStyleDiv.innerHTML = "";
  staticStyleDiv.appendChild(createStyleDiv());

  manageDynamicWidgets();
  handleEditModeUIChanges();
}

function saveFiltersToStash() {
  data.stash = {
    filters: structuredClone(data.layouts[data.selectedLayout].filters),
    filterStrategy: structuredClone(data.layouts[data.selectedLayout].filterStrategy),
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
  btn.classList.add("small-btn", "no-border", "no-background", "red");
  if (subSection) btn.classList.add("extra-small");
  if (enable) btn.classList.add("ml-1");
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
  customCheckbox.classList.add('checkbox', 'red', 'red-border');

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

class DropdownChecklist {
  constructor(propID) {
    this.propID = propID;
    this.categories = data.filterDefaults.get(propID).categories;
    this.selectedCategories = data.layouts[data.selectedLayout].filters.get(propID).categories;
    this.isVisible = false;
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

  selectAllCategories() {
    this.categories.forEach(category => this.selectedCategories.add(category)); // Add all categories
    this.updateCheckboxStates(true);
    handleFilterEvent("Showing Elements", `Nodes and related edges for ${this.propID}`, this.propID);
  }

  deselectAllCategories() {
    this.categories.forEach(category => this.selectedCategories.delete(category)); // Clear all categories
    this.updateCheckboxStates(false);
    handleFilterEvent("Hiding Elements", `Nodes and related edges for ${this.propID}`, this.propID);
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
    let filterData = data.layouts[data.selectedLayout].filters.get(this.propID);
    this.currentMin = filterData.lowerThreshold;
    this.currentMax = filterData.upperThreshold;
    this.isInverted = filterData.isInverted;
  }

  writeCurrentFilterSettings() {
    let filterData = data.layouts[data.selectedLayout].filters.get(this.propID);
    filterData.lowerThreshold = this.currentMin;
    filterData.upperThreshold = this.currentMax;
    filterData.isInverted = this.isInverted;
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
    colRight.style.marginLeft = '10px';
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

  btn.addEventListener("click", () => {
    document.getElementById(`style-row-${propID}`).classList.toggle("show");
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
      size: node.style?.size || DEFAULTS.NODE.SIZE,
      fill: node.style?.fill || DEFAULTS.NODE.COLOR,
      stroke: node.style?.stroke || null,
      lineWidth: node.style?.lineWidth || DEFAULTS.STYLES.NODE_BORDER_SIZES.md,
      badge: node.style?.badge || false,
      badges: node.style?.badges || [],
      badgePalette: node.style?.badgePalette || [],
      badgeFontSize: 8,
    }
  };

  if (cache.showNodeLabels) {
    nodeObj.style.label = true;
    nodeObj.style.labelText = node.style?.labelText || node.label || node.id;
    nodeObj.style.labelBackground = true;
    nodeObj.style.labelFontSize = node.style?.labelFontSize || DEFAULTS.STYLES.NODE_LABEL_SIZES.md;
  }
  return nodeObj;
}

function getEdgeStyleOrDefaults(edge) {
  return {
    type: edge.type || DEFAULTS.EDGE.TYPE,
    style: {
      startArrow: edge.startArrow || DEFAULTS.EDGE.ARROWS.START,
      endArrow: edge.endArrow || DEFAULTS.EDGE.ARROWS.END,
      lineWidth: edge.style?.lineWidth || DEFAULTS.EDGE.LINE_WIDTH,
      lineDash: edge.style?.lineDash || DEFAULTS.STYLES.EDGE_DASHS.none,
      label: false,
      labelText: edge.style?.labelText || "",
      labelBackground: true,
      stroke: edge.style?.stroke || DEFAULTS.EDGE.COLOR,
      halo: edge.style?.halo || false,
      haloStroke: edge.style?.haloStroke || DEFAULTS.STYLES.EDGE_HALO_STROKE.purple,
      haloLineWidth: edge.style?.haloLineWidth || DEFAULTS.STYLES.EDGE_HALO_WIDTH.md
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
  cache = {};

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
        let warning = `Property ${prop} (section ${section} sub-section ${subSection} contains both numeric and categorical values. To proceed, please use a single data type. Property has been excluded.`;
        console.log(warning);
        inputErrors.push(warning);
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

  cache.showNodeLabels = fileData.nodes.length <= MAX_NODES_BEFORE_HIDING_LABELS;

  if (!cache.showNodeLabels) {
    alert(`Graph contains many nodes (${fileData.nodes.length}). Labels will be deactivated to improve performance.`);
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

  // option to re-configure bubble set styles per model if wanted
  data.bubbleSetStyle = fileData.bubbleSetStyle || DEFAULTS.BUBBLE_SET_STYLE;

  // currently selected layout
  data.selectedLayout = fileData.selectedLayout || DEFAULTS.LAYOUT;

  // create individual map for each layout, no matter if default or manual, with positions, current filters, ..
  if (fileData.layouts) {
    data.layouts = parseLayouts(fileData.layouts);
  } else {
    data.layouts = Object.keys(DEFAULTS.LAYOUT_INTERNALS).reduce((acc, key) => {
      acc[key] = createDefaultLayout(key);
      return acc;
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
  }

  console.log("Done pre-processing data");
}

function createCache() {
  cache.nodeRef = new Map();
  cache.edgeRef = new Map();
  cache.toolTips = new Map();

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

  cache.initialNodePositions = new Map();
  cache.lastBubbleSetMembers = new Map();

  cache.nodeIDsToBeShown = new Set();
  cache.propIDsToNodeIDsToBeShown = new Map();
  cache.edgeIDsToBeShown = new Set();

  cache.selectedNodes = new Set();
  cache.selectedEdges = new Set();


  for (let group of traverseBubbleSets()) {
    cache.lastBubbleSetMembers.set(group, new Set());
  }

  data.nodes.forEach((node) => {
    cache.nodeRef.set(node.id, node);
    cache.toolTips.set(node.id, buildToolTipText(node.id, false));
    for (let prop of node.features) {
      if (!cache.propToNodes.has(prop)) cache.propToNodes.set(prop, new Set());
      if (!cache.propToNodeIDs.has(prop)) cache.propToNodeIDs.set(prop, new Set());
      cache.propToNodes.get(prop).add(node);
      cache.propToNodeIDs.get(prop).add(node.id);
      cache.nodeExclusiveProps.add(prop);
    }
  });

  data.edges.forEach((edge) => {
    cache.edgeRef.set(edge.id, edge);
    cache.toolTips.set(edge.id, buildToolTipText(edge.id, true));
    for (let prop of edge.features) {
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
  let item = isEdge ? cache.edgeRef.get(nodeOrEdgeID) : cache.nodeRef.get(nodeOrEdgeID);
  let label = item.label && item.label !== item.id ? `${item.label} (${item.id})` : item.id;
  let tooltip = `<h3>${isEdge ? "Edge" : "Node"} <i>${label}</i></h3>`;

  if (item.description) {
    tooltip += `<p>${item.description}</p>`;
  }

  if (!item.D4Data) return tooltip;

  const sortedPropIDs = SORT_TOOLTIPS ? [...data.filterDefaults.keys()].sort() : [...data.filterDefaults.keys()];

  let currentLineCount = 0;
  tooltip += `<hr><div class="tooltip-columns"><div class="tooltip-column">`;

  let lastSection = null;
  let lastSubSection = null;

  for (const propID of sortedPropIDs) {
    const [section, subSection, property] = decodePropHashId(propID);

    // Skip if this property is not defined in the current item's data
    if (item.D4Data[section]?.[subSection]?.[property] === undefined) continue;

    if (section !== lastSection) {
      if (lastSection !== null) tooltip += `</ul>`; // Close the last subsection if it exists
      tooltip += `<h3>${section}</h3>`;
      lastSection = section;
      lastSubSection = null;
      currentLineCount++;
    }

    if (subSection !== lastSubSection) {
      if (lastSubSection !== null) tooltip += `</ul>`; // Close the previous subsection if it exists

      const subSectionLineCount = 1 + Object.keys(item.D4Data[section][subSection]).length;
      if (currentLineCount + subSectionLineCount > TOOLTIP_LINE_BREAK) {
        tooltip += `</div><div class="tooltip-column">`; // Start new column
        currentLineCount = 0;
      }

      tooltip += `<h5>${subSection}</h5><ul>`;
      lastSubSection = subSection;
      currentLineCount++;
    }

    // Add property and its value
    const value = item.D4Data[section][subSection][property];
    if (TOOLTIP_HIDE_NULL_VALUES && value === 0) continue;

    const formattedValue = isNaN(value) ? value : formatNumber(value, FILTER_VISUAL_FLOAT_PRECISION);
    tooltip += `<li>${property}: <span class="red"><b>${formattedValue}</b></span></li>`;
    currentLineCount++;
  }

  // Close any remaining open tags
  tooltip += `</ul></div></div>`;

  return tooltip;
}

function loadFileWrapper(event) {
  showLoading("Loading", "Loading data");
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

        graph.render().then(r => {
          console.log("Initial graph rendered");
          persistPositionsUpdateDataAndReDrawGraph();
          saveFiltersToStash();
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
    console.log(header);
  }, 25);

  if (autoFade) {
    setTimeout(() => {
      hideLoading();
    }, 1000);
  }
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  overlay.style.opacity = '0';

  setTimeout(() => {
    overlay.style.display = 'none';
  }, 200);
}

document.addEventListener('DOMContentLoaded', async () => {
  hideLoading();
});

window.addEventListener('resize', () => {
  if (graph !== null) {

  }
})