(() => {
  // src/config.js
  var DEFAULTS = {
    NODE: {
      FILL_COLOR: "#C33D35",
      SIZE: 20,
      LINE_WIDTH: 1,
      TYPE: "hexagon",
      STROKE_COLOR: null,
      BADGE: {
        FONT_SIZE: 8,
        COLOR: "#C33D35"
      },
      LABEL: {
        FOREGROUND_COLOR: "#000000",
        BACKGROUND: false,
        BACKGROUND_COLOR: null,
        BACKGROUND_RADIUS: 5,
        PADDING: 2,
        PLACEMENT: "bottom",
        FONT_SIZE: 12,
        CURSOR: "default",
        LINE_SPACING: 0,
        MAX_LINES: 1,
        MAX_WIDTH: "200%",
        TEXT_ALIGN: "middle",
        WORD_WRAP: false,
        Z_INDEX: 0,
        OFFSET_X: 0,
        OFFSET_Y: 0
      }
    },
    EDGE: {
      COLOR: "#403C5390",
      LINE_WIDTH: 0.75,
      LINE_DASH: 0,
      TYPE: "line",
      ARROWS: { START: false, END: false, START_SIZE: 8, START_TYPE: "triangle", END_SIZE: 8, END_TYPE: "triangle" },
      LABEL: {
        TEXT: null,
        FOREGROUND_COLOR: "#000000",
        BACKGROUND: false,
        BACKGROUND_COLOR: null,
        BACKGROUND_CURSOR: "default",
        BACKGROUND_FILL_OPACITY: 1,
        BACKGROUND_RADIUS: 0,
        BACKGROUND_STROKE_OPACITY: 1,
        CURSOR: "default",
        FILL_OPACITY: 1,
        FONT_WEIGHT: "normal",
        MAX_LINES: 1,
        MAX_WIDTH: "80%",
        PADDING: 0,
        PLACEMENT: "center",
        FONT_SIZE: 12,
        AUTO_ROTATE: false,
        OFFSET_X: 4,
        OFFSET_Y: 0,
        TEXT_ALIGN: "left",
        TEXT_BASE_LINE: "middle",
        TEXT_OVERFLOW: "ellipsis",
        VISIBILITY: "visible",
        WORD_WRAP: false,
        OPACITY: 1
      },
      HALO: {
        ENABLED: false,
        COLOR: "#403C53",
        WIDTH: 3
      }
    },
    LAYOUT: "force",
    LAYOUT_INTERNALS: {
      "force": { gravity: 10 },
      // "fruchterman": {gravity: 5, speed: 5, clustering: true, nodeClusterBy: 'cluster', clusterGravity: 16},
      // "antv-dagre": {nodesep: 100, ranksep: 70, controlPoints: true},
      "circular": { startRadius: 10, endRadius: 300 },
      "radial": { direction: "LR", nodeSize: 32, unitRadius: 100, linkDistance: 200 },
      "concentric": { nodeSize: 32, maxLevelDiff: 0.5, sortBy: "degree", preventOverlap: true },
      "grid": { sortBy: "id", nodeSize: 32 },
      "mds": { nodeSize: 32, linkDistance: 100 }
    },
    CUSTOM_LAYOUT_NAME: "custom",
    BUBBLE_GROUP_STYLE: {
      "groupOne": {
        fill: "#403C53",
        fillOpacity: 0.25,
        stroke: "#C33D35",
        strokeOpacity: 1,
        virtualEdges: true,
        labelFill: "#fff",
        labelPadding: 2,
        labelBackgroundFill: "#403C53",
        labelBackgroundRadius: 5,
        label: true,
        labelText: "group one"
      },
      "groupTwo": {
        fill: "#c33d35",
        fillOpacity: 0.25,
        stroke: "#403c53",
        strokeOpacity: 1,
        virtualEdges: true,
        labelFill: "#fff",
        labelPadding: 2,
        labelBackgroundFill: "#c33d35",
        labelBackgroundRadius: 5,
        label: true,
        labelText: "group two"
      },
      "groupThree": {
        fill: "#EFB0AA",
        fillOpacity: 0.4,
        stroke: "#8CA6D9",
        strokeOpacity: 1,
        virtualEdges: true,
        labelFill: "#fff",
        labelPadding: 2,
        labelBackgroundFill: "#EFB0AA",
        labelBackgroundRadius: 5,
        label: true,
        labelText: "group three"
      },
      "groupFour": {
        fill: "#8CA6D9",
        fillOpacity: 0.4,
        stroke: "#EFB0AA",
        strokeOpacity: 1,
        virtualEdges: true,
        labelFill: "#fff",
        labelPadding: 2,
        labelBackgroundFill: "#8CA6D9",
        labelBackgroundRadius: 5,
        label: true,
        labelText: "group four"
      }
    },
    BUBBLE_GROUP_QUADRANT_POSITIONS: {
      groupOne: "top-left",
      groupTwo: "top-right",
      groupThree: "bottom-left",
      groupFour: "bottom-right"
    },
    STYLES: {
      NODE_FORM: { "\u25CF": "circle", "\u25C6": "diamond", "\u2B22": "hexagon", "\u25A0": "rect", "\u25B2": "triangle", "\u2605": "star" },
      NODE_COLORS: { red: "#C33D35", purple: "#403C53", blue: "#8CA6D9", pink: "#EFB0AA", grey: "#ABACBD" },
      NODE_SIZES: { s: 15, m: 25, l: 35, xl: 50 },
      NODE_BORDER_COLORS: {
        red: "#C33D35",
        purple: "#403C53",
        blue: "#8CA6D9",
        pink: "#EFB0AA",
        grey: "#ABACBD",
        none: "#00000000"
      },
      NODE_BORDER_SIZES: { sm: 0.5, md: 1, lg: 2, xlg: 4 },
      NODE_LABEL_FONT_SIZES: { sm: 10, md: 12, lg: 14, xlg: 20 },
      NODE_LABEL_COLORS: { black: "#000000", red: "#C33D35", purple: "#403C53", grey: "#ABACBD" },
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
      EDGE_COLORS: { red: "#C33D35", purple: "#403C53", blue: "#8CA6D9", pink: "#EFB0AA", grey: "#ABACBD" },
      // EDGE_WIDTHS: {sm: 0.5, md: 0.75, lg: 1, xlg: 3},
      EDGE_DASHS: { none: 0, dashed: 10 },
      EDGE_LABEL_FONT_SIZES: { sm: 8, md: 12, lg: 16 },
      EDGE_LABEL_PLACEMENTS: ["start", "center", "end"],
      EDGE_LABEL_COLORS: { red: "#C33D35", purple: "#403C53", blue: "#8CA6D9", pink: "#EFB0AA", grey: "#ABACBD" },
      EDGE_LABEL_BACKGROUND_COLORS: {
        red: "#C33D35",
        purple: "#403C53",
        blue: "#8CA6D9",
        pink: "#EFB0AA",
        grey: "#ABACBD"
      },
      EDGE_LABEL_OFFSET_X: { "-25": -25, "0": 0, "25": 25 },
      EDGE_LABEL_OFFSET_Y: { "-25": -25, "0": 0, "25": 25 },
      // EDGE_LABEL_AUTOROTATE: {enable: true, disable: false},
      // EDGE_ARROW_SIZES: {sm: 8, md: 10, lg: 14},
      EDGE_ARROW_TYPES: ["triangle", "circle", "diamond", "vee", "rect", "triangleRect", "simple"],
      EDGE_HALO: { enable: true, disable: false },
      EDGE_HALO_STROKE: { red: "#C33D35", purple: "#403C53", blue: "#8CA6D9" },
      EDGE_HALO_WIDTH: { sm: 2, md: 3, lg: 5 }
    }
  };
  var CFG = {
    // Determines if filter sliders should be hidden when the minimum and maximum values are identical
    HIDE_SLIDERS_WITH_SAME_MIN_MAX_VALUES: true,
    // Specifies the slider step size for integer-based properties
    FILTER_STEP_SIZE_INTEGER: 1,
    // Specifies the slider step size for float-based properties
    FILTER_STEP_SIZE_FLOAT: 1e-6,
    // Specifies the slider thumb- and tooltip-values (only visually); internally, the full float precision is used
    FILTER_VISUAL_FLOAT_PRECISION: 3,
    // If true, filters in the side-panel are sorted alphabetically
    SORT_FILTERS: false,
    // If true, filters in the tooltips are sorted alphabetically
    SORT_TOOLTIPS: true,
    // Maximum tooltip columns
    TOOLTIP_MAX_COLUMNS: 1,
    // If true, properties with null (empty) values are not displayed in tooltips
    TOOLTIP_HIDE_NULL_VALUES: false,
    // if network is greater than defined threshold, no labels are shown until explicity set via UI
    MAX_NODES_BEFORE_HIDING_LABELS: 1e3,
    HIDE_LABELS: false,
    // if network is greater than defined threshold, hover effects are disabled
    MAX_NODES_BEFORE_DISABLING_HOVER_EFFECT: 300,
    DISABLE_HOVER_EFFECT: false,
    // if network is greater than defined threshold, bubble groups may span across non-bubble group members
    MAX_NODES_BEFORE_DISABLING_AVOID_MEMBERS_IN_BUBBLE_GROUPS: 300,
    AVOID_MEMBERS_IN_BUBBLE_GROUPS: false,
    // Maximum capacity of selection memory
    MAX_SELECTION_MEMORY: 10,
    // Header automatically assigned to properties without a group definition
    EXCEL_UNCATEGORIZED_SUBHEADER: "Uncategorized Properties",
    // Node filter header
    EXCEL_NODE_HEADER: "Node filters",
    // Edge filter header
    EXCEL_EDGE_HEADER: "Edge filters",
    // Set to true in case original g6.min.js is used and issue #7195 is NOT resolved (https://github.com/antvis/G6/issues/7195)
    APPLY_BUBBLE_SET_HOTFIX: false,
    // Set to true to use current filter configuration for pushing property to query editor, e.g. if slider is inverted
    // false uses defaults (non-inverted) and min/max
    QUERY_BTN_USE_CURRENT_FILTER: true,
    // Set to true to reset positions of selected elements when clicking the reset selection button in the top right selection frame
    RESET_SELECTION_BUTTON_RESETS_POSITIONS: true,
    INVISIBLE_DUMMY_NODE: {
      id: "INVISIBLEDUMMYNODEWITHIMPOSSIBLEID",
      style: {
        visibility: "hidden"
      }
    },
    INVISIBLE_CHAR: "\u200B"
  };

  // src/utilities/static.js
  var StaticUtilities = class {
    static isString(value) {
      return typeof value === "string" || value instanceof String;
    }
    static isNumber(value) {
      const parsed = parseFloat(value);
      return !isNaN(parsed) && isFinite(parsed);
    }
    static isInList(value, allowedValues) {
      return allowedValues.includes(value);
    }
    static isBoolean(value) {
      if (typeof value === "boolean") {
        return true;
      }
      if (typeof value === "string") {
        const lowerVal = value.trim().toLowerCase();
        return lowerVal === "true" || lowerVal === "false";
      }
      if (typeof value === "number") {
        return value === 1 || value === 0;
      }
      return false;
    }
    static isHexColor(value) {
      if (!this.isString(value)) return false;
      const hexRegex = /^#(?:[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
      return hexRegex.test(value.trim());
    }
    static getReadableForegroundColor(hex) {
      if (hex === "#00000000") return "#000000";
      hex = hex.replace(/^#/, "");
      let r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
      let g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
      let b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b > 186 ? "#000000" : "#FFFFFF";
    }
    /**
     * Recursively merges properties from `source` into `target`.
     * - Existing properties in `target` remain if not in `source`.
     * - Matching keys in `source` overwrite `target`.
     * - New keys are added to `target`.
     */
    static deepMerge(target, source) {
      if (!this.isObject(target) || !this.isObject(source)) return;
      for (const [key, value] of Object.entries(source)) {
        if (this.isObject(value) && this.isObject(target[key])) {
          this.deepMerge(target[key], value);
        } else {
          target[key] = value;
        }
      }
    }
    static isObject(obj) {
      return obj !== null && typeof obj === "object" && !Array.isArray(obj);
    }
    static arraysAreEqual(a, b) {
      if (a === b) return true;
      if (!a || !b) return false;
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    }
    static isInteger(value) {
      return value % 1 === 0;
    }
    static formatNumber(value, precision) {
      return this.isInteger(value) ? value : parseFloat(value).toFixed(precision);
    }
    static getLineMetrics(el) {
      if (!el || !el.firstChild) {
        return { lines: 0, lastLineWidth: 0 };
      }
      const range = document.createRange();
      range.selectNodeContents(el);
      const rects = Array.from(range.getClientRects());
      const groups = /* @__PURE__ */ new Map();
      rects.forEach((rc) => {
        const key = Math.round(rc.top);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(rc);
      });
      const lines = groups.size;
      if (lines === 0) return { lines: 0, lastLineWidth: 0 };
      const lastTop = Math.max(...groups.keys());
      const lastRects = groups.get(lastTop);
      const left = Math.min(...lastRects.map((r) => r.left));
      const right = Math.max(...lastRects.map((r) => r.right));
      const lastLineWidth = Math.round(right - left);
      return { lines, lastLineWidth };
    }
    static generatePropHashId(section, subSection, prop) {
      return `${section}::${subSection}::${prop}`;
    }
    static decodePropHashId(propId) {
      return propId.split("::");
    }
    static setsAreEqual(setA, setB) {
      if (setA.size !== setB.size) return false;
      for (let item of setA) {
        if (!setB.has(item)) return false;
      }
      return true;
    }
    static formatPropsAsTree(propID = void 0, section = void 0, subSection = void 0, prop = void 0) {
      if (propID) {
        const decoded = this.decodePropHashId(propID);
        section = decoded[0];
        subSection = decoded[1];
        prop = decoded[2];
      }
      let retStr = `
 \u2514\u2500 ${section}`;
      if (subSection) retStr += `
        \u2514\u2500 ${subSection}`;
      if (prop) retStr += `
                \u2514\u2500 ${prop}`;
      return retStr;
    }
    static humanFileSize(size) {
      let i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
      return +(size / Math.pow(1024, i)).toFixed(2) + " " + ["B", "kB", "MB", "GB", "TB"][i];
    }
    static getTimestamp(includeMilliseconds = false) {
      const now = /* @__PURE__ */ new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      if (includeMilliseconds) {
        const ms = String(now.getMilliseconds()).padStart(3, "0");
        return `${hh}:${mm}:${ss}.${ms}`;
      }
      return `${hh}:${mm}:${ss}`;
    }
  };

  // src/utilities/color_scale_picker.js
  var ColorScalePicker = class {
    constructor(cache3) {
      this.defaultColors = {
        min: "#403C53",
        zero: "#FFFFFF",
        max: "#C33D35"
      };
      this.handles = [];
      this.element = null;
      this.resolvePromise = null;
      this.minValue = 0;
      this.maxValue = 0;
      this.categories = [];
      this.defaultColorForMissing = "#CCCCCC";
      this.elementType = "nodes";
      this.dom = {};
      this.cache = cache3;
    }
    createDom() {
      const overlay = document.createElement("div");
      overlay.className = "picker-overlay";
      this.dom.overlay = overlay;
      const content = document.createElement("div");
      content.className = "picker-content";
      this.dom.content = content;
      const dropdown = document.createElement("select");
      dropdown.className = "picker-dropdown";
      this.dom.dropdown = dropdown;
      const gradient = document.createElement("div");
      gradient.className = "picker-gradient disabled";
      this.dom.gradient = gradient;
      const handleContainer = document.createElement("div");
      handleContainer.className = "picker-handle-container";
      this.dom.handleContainer = handleContainer;
      const controls = document.createElement("div");
      controls.className = "picker-controls disabled";
      this.dom.controls = controls;
      const addButton = document.createElement("button");
      addButton.className = "picker-button plus-minus";
      addButton.textContent = "+";
      addButton.onclick = () => this.addHandle();
      this.dom.addButton = addButton;
      const removeButton = document.createElement("button");
      removeButton.className = "picker-button plus-minus";
      removeButton.textContent = "-";
      removeButton.onclick = () => this.removeHandle();
      this.dom.removeButton = removeButton;
      const categoryContainer = document.createElement("div");
      categoryContainer.className = "picker-category-container";
      categoryContainer.style.display = "none";
      this.dom.categoryContainer = categoryContainer;
      controls.append(addButton, removeButton);
      const buttons = document.createElement("div");
      buttons.className = "picker-button-container";
      this.dom.buttons = buttons;
      const cancelButton = document.createElement("button");
      cancelButton.className = "picker-button secondary";
      cancelButton.textContent = "Cancel";
      cancelButton.onclick = () => this.cancel();
      this.dom.cancelButton = cancelButton;
      const defaultColorContainer = document.createElement("div");
      defaultColorContainer.className = "picker-default-color-container disabled";
      this.dom.defaultColorContainer = defaultColorContainer;
      const label = document.createElement("span");
      label.textContent = "Default color:";
      label.title = "Default color for elements with missing values";
      this.dom.label = label;
      const defaultColorEl = document.createElement("input");
      defaultColorEl.type = "color";
      defaultColorEl.className = "picker-default-color";
      defaultColorEl.value = this.defaultColorForMissing;
      defaultColorEl.addEventListener("input", (e) => {
        this.defaultColorForMissing = e.target.value;
      });
      this.dom.defaultColorEl = defaultColorEl;
      defaultColorContainer.append(label, defaultColorEl);
      const applyButton = document.createElement("button");
      applyButton.className = "picker-button primary disabled";
      applyButton.textContent = "Apply";
      applyButton.onclick = () => this.apply();
      this.dom.applyButton = applyButton;
      buttons.append(cancelButton, defaultColorContainer, applyButton);
      content.append(dropdown, gradient, handleContainer, controls, categoryContainer, buttons);
      overlay.appendChild(content);
      this.element = overlay;
      return overlay;
    }
    async pickColors(elementType = "nodes") {
      this.elementType = elementType;
      return new Promise((resolve) => {
        this.resolvePromise = resolve;
        document.body.appendChild(this.createDom());
        this.initializeFilters();
        this.setupHandleDragging();
      });
    }
    initializeFilters() {
      const dropdown = this.element.querySelector(".picker-dropdown");
      const filters = new Map(this.cache.data.layouts[this.cache.data.selectedLayout].filters);
      const available = /* @__PURE__ */ new Set();
      const selectedElements = this.elementType === "nodes" ? this.cache.selectedNodes : this.cache.selectedEdges;
      selectedElements.forEach((elementId) => {
        const element = this.elementType === "nodes" ? this.cache.nodeRef.get(elementId) : this.cache.edgeRef.get(elementId);
        element?.features.forEach((f) => {
          if (filters.has(f)) available.add(f);
        });
      });
      dropdown.innerHTML = '<option value="">Select property</option>';
      Array.from(available).sort().forEach((prop) => {
        const opt = document.createElement("option");
        opt.value = prop;
        opt.textContent = prop;
        dropdown.appendChild(opt);
      });
      dropdown.onchange = () => this.selectProperty(dropdown.value, filters.get(dropdown.value));
    }
    selectProperty(property, filterObj) {
      if (!property) return;
      const selectedElements = this.elementType === "nodes" ? this.cache.selectedNodes : this.cache.selectedEdges;
      const elementRef = this.elementType === "nodes" ? this.cache.nodeRef : this.cache.edgeRef;
      const elementsWithProperty = Array.from(selectedElements).filter((id) => {
        const element = elementRef.get(id);
        return element?.featureValues.has(property);
      });
      const totalElements = selectedElements.length;
      const elementsWithPropertyCount = elementsWithProperty.length;
      const existingCounter = this.element.querySelector(".picker-property-counter");
      if (existingCounter) {
        existingCounter.remove();
      }
      const counterEl = document.createElement("div");
      counterEl.className = "picker-property-counter";
      this.element.querySelector(".picker-content").insertBefore(
        counterEl,
        this.element.querySelector(".picker-gradient")
      );
      const elementTypeLabel = this.elementType === "nodes" ? "Nodes" : "Edges";
      counterEl.textContent = `Affected ${elementTypeLabel}: ${elementsWithPropertyCount} / ${totalElements}`;
      if (this.dom.defaultColorContainer) {
        if (elementsWithPropertyCount === totalElements) {
          this.dom.defaultColorContainer.classList.add("disabled");
        } else {
          this.dom.defaultColorContainer.classList.remove("disabled");
        }
      }
      for (const elem of [this.dom.applyButton, this.dom.controls, this.dom.gradient]) {
        elem.classList.remove("disabled");
      }
      if (filterObj.isCategory) {
        this.categories = [...filterObj.categories].map((name) => ({ name, color: this.generateRandomColor() }));
        this.renderCategories();
      } else {
        this.initializeGradient(property);
      }
    }
    renderCategories() {
      const gradient = this.element.querySelector(".picker-gradient");
      const handleContainer = this.element.querySelector(".picker-handle-container");
      const controls = this.element.querySelector(".picker-controls");
      const categoryContainer = this.element.querySelector(".picker-category-container");
      gradient.style.display = "none";
      handleContainer.style.display = "none";
      controls.style.display = "none";
      categoryContainer.innerHTML = "";
      categoryContainer.style.display = "block";
      this.categories.forEach((cat) => {
        const row = document.createElement("div");
        row.className = "picker-category-row";
        const label = document.createElement("span");
        label.textContent = cat.name;
        const colorInput = document.createElement("input");
        colorInput.type = "color";
        colorInput.value = cat.color;
        colorInput.oninput = (e) => {
          cat.color = e.target.value;
        };
        row.append(label, colorInput);
        categoryContainer.appendChild(row);
      });
    }
    generateRandomColor() {
      return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
    }
    initializeGradient(property) {
      const selectedElements = this.elementType === "nodes" ? this.cache.selectedNodes : this.cache.selectedEdges;
      const elementRef = this.elementType === "nodes" ? this.cache.nodeRef : this.cache.edgeRef;
      const values = Array.from(selectedElements).map((id) => elementRef.get(id)?.featureValues.get(property)).filter((v) => v !== void 0);
      this.minValue = Math.min(...values);
      this.maxValue = Math.max(...values);
      this.handles = [
        { pos: 0, color: this.defaultColors.min, value: this.minValue, fixed: true },
        { pos: 50, color: this.defaultColors.zero, value: (this.maxValue + this.minValue) / 2, fixed: false },
        { pos: 100, color: this.defaultColors.max, value: this.maxValue, fixed: true }
      ];
      this.element.querySelector(".picker-gradient").style.display = "block";
      this.element.querySelector(".picker-handle-container").style.display = "block";
      this.element.querySelector(".picker-controls").style.display = "flex";
      this.element.querySelector(".picker-category-container").style.display = "none";
      this.renderHandles();
      this.updateGradient();
    }
    setupHandleDragging() {
      const container = this.element.querySelector(".picker-handle-container");
      container.addEventListener("mousedown", (e) => {
        const handleEl = e.target.closest(".picker-handle");
        if (!handleEl) return;
        const idx = parseInt(handleEl.dataset.index, 10);
        const handleObj = this.handles[idx];
        if (handleObj.fixed) return;
        const onMove = (moveEvent) => {
          const rect = container.getBoundingClientRect();
          let pos = (moveEvent.clientX - rect.left) / rect.width * 100;
          pos = Math.max(0, Math.min(100, pos));
          this.updateHandlePosition(handleObj, pos);
        };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", () => {
          document.removeEventListener("mousemove", onMove);
        }, { once: true });
      });
    }
    updateHandlePosition(handle, newPos) {
      handle.pos = newPos;
      handle.value = this.minValue + newPos / 100 * (this.maxValue - this.minValue);
      this.handles.sort((a, b) => a.pos - b.pos);
      this.renderHandles();
      this.updateGradient();
    }
    renderHandles() {
      const container = this.element.querySelector(".picker-handle-container");
      container.innerHTML = "";
      this.handles.forEach((handle, i) => {
        const element = document.createElement("div");
        element.className = "picker-handle";
        element.style.left = `${handle.pos}%`;
        element.style.backgroundColor = handle.color;
        element.dataset.index = i;
        element.dataset.fixed = handle.fixed;
        element.style.zIndex = handle.fixed ? 1 : 2;
        const value = document.createElement("div");
        value.className = "picker-handle-value";
        value.textContent = handle.value.toFixed(2);
        const colorPicker = document.createElement("input");
        colorPicker.type = "color";
        colorPicker.value = handle.color;
        colorPicker.className = "picker-handle-color";
        colorPicker.style.opacity = "0";
        colorPicker.style.position = "absolute";
        colorPicker.style.width = "100%";
        colorPicker.style.height = "100%";
        colorPicker.style.cursor = "pointer";
        colorPicker.addEventListener("input", (e) => {
          handle.color = e.target.value;
          element.style.backgroundColor = e.target.value;
          this.updateGradient();
        });
        if (!handle.fixed) {
          element.style.cursor = "move";
        }
        element.appendChild(value);
        element.appendChild(colorPicker);
        container.appendChild(element);
      });
    }
    updateGradient() {
      const gradient = this.element.querySelector(".picker-gradient");
      const stops = [...this.handles].sort((a, b) => a.pos - b.pos).map((h) => `${h.color} ${h.pos}%`).join(", ");
      gradient.style.background = `linear-gradient(to right, ${stops})`;
    }
    addHandle() {
      if (this.handles.length >= 10) return;
      const newColor = this.generateRandomColor();
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
      const pos = (sortedHandles[insertIndex - 1].pos + sortedHandles[insertIndex].pos) / 2;
      const value = this.minValue + pos / 100 * (this.maxValue - this.minValue);
      this.handles.push({ pos, color: newColor, value, fixed: false });
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
      const dropdown = this.element.querySelector(".picker-dropdown");
      const colorMap = /* @__PURE__ */ new Map();
      const selectedElements = this.elementType === "nodes" ? this.cache.selectedNodes : this.cache.selectedEdges;
      const elementRef = this.elementType === "nodes" ? this.cache.nodeRef : this.cache.edgeRef;
      const filterObj = this.cache.data.layouts[this.cache.data.selectedLayout].filters.get(dropdown.value);
      const isCategory = filterObj?.isCategory;
      if (isCategory) {
        const categoryColorMap = new Map(
          this.categories.map((cat) => [cat.name, cat.color])
        );
        Array.from(selectedElements).forEach((elementId) => {
          const element = elementRef.get(elementId);
          const valueSet = element?.featureValues.get(dropdown.value);
          const value = valueSet instanceof Set ? Array.from(valueSet)[0] : valueSet;
          if (value !== void 0 && categoryColorMap.has(value)) {
            colorMap.set(elementId, categoryColorMap.get(value));
          } else {
            colorMap.set(elementId, this.defaultColorForMissing);
          }
        });
      } else {
        Array.from(selectedElements).forEach((elementId) => {
          const element = elementRef.get(elementId);
          const value = element?.featureValues.get(dropdown.value);
          if (value !== void 0) {
            const normalizedValue = (value - this.minValue) / (this.maxValue - this.minValue) * 100;
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
      return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
    }
    close() {
      this.element?.remove();
      this.element = null;
    }
  };
  function replaceColorScale(obj, elemID, colorMap) {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }
    for (let key in obj) {
      const value = obj[key];
      if (value === "set_continuous_color_scale") {
        obj[key] = colorMap.get(elemID);
      } else if (typeof value === "object") {
        replaceColorScale(value, elemID, colorMap);
      }
    }
    return obj;
  }

  // src/graph/core.js
  var {
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
  var GraphCoreManager = class {
    constructor(cache3) {
      this.cache = cache3;
      this.BEHAVIOURS = {
        DRAG_ELEMENT: {
          type: "drag-element",
          cursor: { default: "default", grab: "default", grabbing: "default" },
          shadow: true,
          shadowFill: "#C33D35",
          shadowFillOpacity: 0.5,
          shadowStroke: "#C33D35",
          shadowStrokeOpacity: 1
        },
        DRAG_CANVAS: {
          type: "drag-canvas",
          key: "drag-canvas",
          animation: false
        },
        ZOOM_CANVAS: {
          type: "zoom-canvas",
          key: "zoom-canvas",
          animation: false
        },
        HOVER_ACTIVATE: {
          type: "hover-activate",
          enable: (event) => {
            return event.targetType === "node" || event.targetType === "edge";
          },
          degree: 1,
          state: "highlight",
          inactiveState: "dim"
        },
        LASSO_SELECT: {
          type: "lasso-select",
          key: "lasso-select",
          trigger: ["drag"],
          style: {
            fill: "#C33D35",
            fillOpacity: 0.3,
            stroke: "#C33D35"
          },
          enable: (event) => {
            this.cache.ui.debug("LASSO CANVAS CLICK");
            if (!this.cache.CFG.APPLY_BUBBLE_SET_HOTFIX) return true;
            const selected = this.cache.graph.getNodeData().filter((n) => n.states?.includes("selected"));
            if (selected.length !== 0) {
              this.cache.ui.debug("PREVENTING LASSO DESELECT EVENT BY REMOVING CANVAS CLICK EVENT");
              const eventHandler = this.cache.graph.getEvents()["canvas:click"];
              this.cache.graph.off("canvas:click");
              setTimeout(() => {
                this.cache.ui.debug("RESTORING CANVAS CLICK EVENT");
                this.cache.graph.on("canvas:click", eventHandler);
              }, 1e3);
              return false;
            }
            return true;
          }
        },
        CLICK_SELECT: {
          type: "click-select",
          key: "click-select",
          multiple: true,
          trigger: ["shift"]
        }
      };
    }
    *traverseD4Data(nodeOrEdge) {
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
      await new Promise((resolve) => requestAnimationFrame(resolve));
      if (this.cache.EVENT_LOCKS.QUERY_SELECTION_EVENT) {
        this.cache.qm.storeQuery();
      }
      await this.preRenderEvent();
      await this.cache.metrics.updateUI();
      try {
        if (this.cache.bubbleSetChanged || this.cache.styleChanged || this.cache.layoutChanged || forceRender) {
          if (this.cache.styleChanged) {
            await this.cache.ui.showLoading("Loading", "Updating this.cache.graph.data ..");
            await new Promise((resolve) => requestAnimationFrame(resolve));
            await this.cache.graph.updateData(this.createSimplifiedDataForGraphObject());
            this.cache.styleChanged = false;
            this.cache.labelStyleChanged = false;
          }
          await this.cache.ui.showLoading("Loading", "Rendering this.cache.graph...");
          await new Promise((resolve) => requestAnimationFrame(resolve));
          return await this.cache.graph.render();
        } else {
          await this.cache.ui.showLoading("Loading", "Redrawing this.cache.graph...");
          await new Promise((resolve) => requestAnimationFrame(resolve));
          return await this.cache.graph.draw();
        }
        if (this.cache.EVENT_LOCKS.QUERY_SELECTION_EVENT) {
          this.cache.qm.storeQuery();
          this.cache.EVENT_LOCKS.QUERY_SELECTION_EVENT = false;
        }
      } catch (errorMsg) {
        this.cache.ui.error(errorMsg);
        return false;
      } finally {
        await hideLoading();
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
    }
    async createGraphInstance() {
      if (this.cache.graph === null) {
        const behaviors = [
          this.BEHAVIOURS.DRAG_CANVAS,
          this.BEHAVIOURS.ZOOM_CANVAS,
          this.BEHAVIOURS.DRAG_ELEMENT
        ];
        if (!DISABLE_HOVER_EFFECT) {
          behaviors.push(this.BEHAVIOURS.HOVER_ACTIVATE);
        }
        const plugins = [
          {
            key: "tooltip",
            type: "tooltip",
            trigger: "click",
            enterable: true,
            getContent: (e, items) => this.cache.toolTips.get(items[0].id)
          },
          {
            key: "minimap",
            type: "minimap",
            position: "bottom-left"
          },
          ...[...this.cache.bs.traverseBubbleSets()].map((group) => ({
            key: `bubbleSetPlugin-${group}`,
            type: "bubble-sets",
            members: [],
            avoidMembers: [this.cache.CFG.INVISIBLE_DUMMY_NODE.id],
            // avoidMembers: [...this.cache.nodeRef.keys()],
            ...this.cache.data.bubbleSetStyle[group],
            strokeOpacity: 0,
            // hide bubble groups initially (1 node persists due to bug)
            fillOpacity: 0,
            label: false
          }))
        ];
        this.cache.graph = new Graph(
          {
            container: "innerGraphContainer",
            autoFit: false,
            // 'view'
            animation: false,
            autoResize: true,
            padding: 10,
            data: createSimplifiedDataForGraphObject(),
            node: {
              state: {
                highlight: {
                  fill: "#C33D35",
                  halo: true,
                  lineWidth: 0
                },
                dim: {
                  fill: "#E4E3EA"
                }
              }
            },
            edge: {
              state: {
                highlight: {
                  stroke: "#C33D35"
                },
                selected: {
                  stroke: "#C33D35"
                }
              }
            },
            behaviors,
            plugins
          }
        );
        this.cache.graph.on("node:dragend", async () => {
          if (this.cache.EVENT_LOCKS.DRAG_END_RUNNING) return;
          this.cache.ui.debug("DRAG END");
          this.cache.EVENT_LOCKS.DRAG_END_RUNNING = true;
          await persistNodePositions();
          this.cache.EVENT_LOCKS.DRAG_END_RUNNING = false;
        });
        this.cache.graph.on("beforelayout", async () => {
          this.cache.ui.debug("BEFORE LAYOUT");
        });
        this.cache.graph.on("afterlayout", async () => {
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
        });
        this.cache.graph.on("canvas:click", async (event) => {
          this.cache.ui.debug("CANVAS CLICK");
        });
        this.cache.graph.on("node:click", async (event) => {
          this.cache.ui.debug("NODE CLICK");
        });
        this.cache.graph.on("edge:click", async (event) => {
          this.cache.ui.debug("EDGE CLICK");
        });
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
            await initialAfterRenderEvent();
          }
        });
        async function initialAfterRenderEvent() {
          if (this.cache.EVENT_LOCKS.ONCE_AFTER_RENDER_RUNNING) return;
          try {
            this.cache.ui.debug("ONCE AFTER RENDER");
            await this.cache.ui.showLoading("Post-processing", "Post-processing ..");
            await new Promise((resolve) => requestAnimationFrame(resolve));
            this.cache.EVENT_LOCKS.ONCE_AFTER_RENDER_RUNNING = true;
            await this.cache.ui.showLoading("Post-processing", "Registering event listeners ..");
            await new Promise((resolve) => requestAnimationFrame(resolve));
            registerHotkeyEvents();
            registerGlobalEventListeners();
            await registerPluginStates();
            await this.cache.ui.showLoading("Post-processing", "Pre-render event ..");
            await new Promise((resolve) => requestAnimationFrame(resolve));
            await this.preRenderEvent();
            await this.cache.ui.showLoading("Post-processing", "Updating metrics UI ..");
            await new Promise((resolve) => requestAnimationFrame(resolve));
            await this.cache.metrics.updateUI();
            await this.cache.ui.showLoading("Post-processing", "Finalizing rendering ..");
            await new Promise((resolve) => requestAnimationFrame(resolve));
            if (this.cache.EVENT_LOCKS.TRIGGER_SET_LAYOUT_ONCE) {
              if (this.cache.nodePositionsFromExcelImport.size !== 0) {
                this.cache.ui.info(`Created view "${this.cache.DEFAULTS.CUSTOM_LAYOUT_NAME}". Applying ${this.cache.DEFAULTS.LAYOUT} layout to nodes without coordinates ..`);
              }
              await this.cache.graph.setLayout({ type: this.cache.DEFAULTS.LAYOUT, ...this.cache.DEFAULTS.LAYOUT_INTERNALS[this.cache.DEFAULTS.LAYOUT] });
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
            this.cache.ui.error(`Error in this.cache.graph.vent.AFTER_RENDER: ${errorMsg}`);
            this.cache.ui.error("Graph setup failed. Please check your input this.cache.data.");
            await this.cache.ui.hideLoading();
          } finally {
            this.cache.EVENT_LOCKS.ONCE_AFTER_RENDER_RUNNING = false;
          }
        }
        let layout = this.cache.data.layouts[this.cache.data.selectedLayout];
        if (!layout.isCustom) {
          await this.cache.graph.setLayout({ type: this.cache.data.selectedLayout, ...layout.internals });
        }
      }
    }
    async toggleCleanUpDanglingElements(btn) {
      const shouldEnable = btn.classList.contains("red");
      if (shouldEnable) {
        btn.classList.remove("red");
        btn.classList.add("green", "highlight");
        btn.title = "Show all nodes and edges, irrespectively of their connectedness.";
        btn.textContent = "\u{1F441}";
        await this.hideDanglingElements();
      } else {
        btn.classList.remove("green", "highlight");
        btn.classList.add("red");
        btn.title = "Hide all nodes and edges that are not connected to any other node or edge.";
        btn.textContent = "\u{1F6AB}";
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
      await this.cache.fm.handleFilterEvent(
        "Showing Elements",
        "Showing all previously hidden nodes and edges that are not connected to any other node or edge."
      );
    }
    async focusNodes(nodeIDs = void 0) {
      if (!nodeIDs) {
        nodeIDs = this.cache.selectedNodes;
      }
      await this.focusElements(nodeIDs);
    }
    async focusEdges(edgeIDs = void 0) {
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
                ...Array.isArray(badgesToAdd) ? badgesToAdd : [badgesToAdd]
              ];
            }
            if (badgePaletteToAdd) {
              node.style.badgePalette = [
                ...node.style.badgePalette,
                ...Array.isArray(badgePaletteToAdd) ? badgePaletteToAdd : [badgePaletteToAdd]
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
      return [...this.cache.propToNodeIDs.get(propID)].filter(
        (nodeID) => this.cache.nodeIDsToBeShown.has(nodeID)
      );
    }
    getTargetEdges(propID) {
      if (!propID) return this.cache.selectedEdges;
      if (!this.cache.propToEdgeIDs.has(propID)) {
        return [];
      }
      return [...this.cache.propToEdgeIDs.get(propID)].filter(
        (edgeID) => this.cache.edgeIDsToBeShown.has(edgeID)
      );
    }
    async getSelectedNodes() {
      return await this.cache.graph.getNodeData().filter((n) => n.states?.includes("selected"));
    }
    createSimplifiedDataForGraphObject(resetToCachedPositions = false) {
      const filterObject = (obj, excludedKeys) => {
        return Object.keys(obj).filter((key) => !excludedKeys.includes(key)).reduce((newObj, key) => {
          newObj[key] = obj[key];
          return newObj;
        }, {});
      };
      const filteredNodes = this.cache.data.nodes.map((node) => {
        const filteredNode = filterObject(node, [
          "D4Data",
          "features",
          "featureValues",
          "featureWithinThreshold",
          "originalStyle"
        ]);
        const position = this.cache.data.layouts[this.cache.data.selectedLayout].positions.get(node.id);
        Object.assign(filteredNode, this.cache.style.getNodeStyleOrDefaults(node));
        if (position) {
          filteredNode.style.x = position.x;
          filteredNode.style.y = position.y;
        }
        if (resetToCachedPositions) {
          const { style: { x, y } } = this.cache.initialNodePositions.get(this.cache.data.selectedLayout).get(node.id);
          Object.assign(filteredNode.style, { x, y });
        }
        return filteredNode;
      });
      const filteredEdges = this.cache.data.edges.map((edge) => {
        const filteredEdge = filterObject(edge, [
          "D4Data",
          "features",
          "featureValues",
          "featureWithinThreshold",
          "originalStyle"
        ]);
        Object.assign(filteredEdge, this.cache.style.getEdgeStyleOrDefaults(edge));
        return filteredEdge;
      });
      return {
        nodes: [...filteredNodes, this.cache.CFG.INVISIBLE_DUMMY_NODE],
        edges: filteredEdges,
        combos: this.cache.data.combos || []
      };
    }
    async preRenderEvent() {
      if (this.cache.styleChanged) return;
      this.cache.qm.resetQuery();
      this.cache.nodeIDsToBeShown = /* @__PURE__ */ new Set();
      this.cache.propIDsToNodeIDsToBeShown = /* @__PURE__ */ new Map();
      this.cache.edgeIDsToBeShown = /* @__PURE__ */ new Set();
      this.cache.propIDsToEdgeIDsToBeShown = /* @__PURE__ */ new Map();
      this.cache.remainingEdgeRelatedNodes = /* @__PURE__ */ new Set();
      this.cache.fm.resetFeatureIsWithinThresholdMaps();
      this.cache.bubbleSetChanged = false;
      this.cache.qm.decodeQueryAndBuildAST();
      for (const node of this.cache.nodeRef.values()) {
        if (this.cache.query.ast.testNode(node)) {
          this.cache.nodeIDsToBeShown.add(node.id);
          node.featureIsWithinThreshold.forEach((v, k) => {
            if (v === true) {
              if (!this.cache.propIDsToNodeIDsToBeShown.has(k)) {
                this.cache.propIDsToNodeIDsToBeShown.set(k, /* @__PURE__ */ new Set());
              }
              this.cache.propIDsToNodeIDsToBeShown.get(k).add(node.id);
            }
          });
        }
      }
      for (const edge of this.cache.edgeRef.values()) {
        const endsOk = this.cache.nodeIDsToBeShown.has(edge.source) && this.cache.nodeIDsToBeShown.has(edge.target);
        if (endsOk && this.cache.query.ast.testEdge(edge)) {
          this.cache.edgeIDsToBeShown.add(edge.id);
          edge.featureIsWithinThreshold.forEach((v, k) => {
            if (v === true) {
              if (!this.cache.propIDsToEdgeIDsToBeShown.has(k)) {
                this.cache.propIDsToEdgeIDsToBeShown.set(k, /* @__PURE__ */ new Set());
              }
              this.cache.propIDsToEdgeIDsToBeShown.get(k).add(edge.id);
            }
          });
        }
      }
      const nodeIDsToBeHidden = [...this.cache.nodeRef.keys()].filter((nodeID) => !this.cache.nodeIDsToBeShown.has(nodeID));
      const edgeIDsToBeHidden = [...this.cache.edgeRef.keys()].filter((edgeID) => !this.cache.edgeIDsToBeShown.has(edgeID));
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
      const status = document.getElementById("sidebarStatusContainer");
      status.innerHTML = "";
      status.style.height = "0";
    }
  };
  function registerHotkeyEvents() {
    if (EVENT_LOCKS.HOTKEY_EVENTS_REGISTERED) return;
    document.addEventListener("keydown", async (event) => {
      const activeElement = document.activeElement;
      if (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA" || activeElement.tagName === "SELECT" || activeElement.isContentEditable) {
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
          await cache.graph.fitView();
          break;
        case "e":
          await toggleEditMode();
          break;
        case "d":
          await toggleDataEditor();
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
    EVENT_LOCKS.HOTKEY_EVENTS_REGISTERED = true;
  }
  function registerGlobalEventListeners() {
    if (EVENT_LOCKS.GLOBAL_EVENTS_REGISTERED) return;
    ["input", "keydown", "keyup", "mousedown", "mouseup", "focus", "blur", "scroll", "selectionchange"].forEach(
      (evt) => query.text.addEventListener(evt, moveCaret)
    );
    makeBottomBarResizable();
    EVENT_LOCKS.GLOBAL_EVENTS_REGISTERED = true;
  }
  async function registerPluginStates() {
    this.cache.ui.debug("Registering bubble set plugin instances ..");
    for (const group of this.cache.bs.traverseBubbleSets()) {
      this.cache.INSTANCES.BUBBLE_GROUPS[group] = await this.cache.graph.getPluginInstance(`bubbleSetPlugin-${group}`);
    }
  }

  // src/graph/bubble_sets.js
  var GraphBubbleSetManager = class {
    constructor(cache3) {
      this.cache = cache3;
      this.redrawBubbleSets = debounce(async () => {
        if (!this.cache.EVENT_LOCKS.ONCE_AFTER_RENDER_COMPLETED) return;
        if (this.cache.EVENT_LOCKS.BUBBLE_GROUP_REDRAW_RUNNING) return;
        this.cache.EVENT_LOCKS.BUBBLE_GROUP_REDRAW_RUNNING = true;
        try {
          for (const group of this.traverseBubbleSets()) {
            const cachedMembers = this.cache.lastBubbleSetMembers.get(group);
            if (cachedMembers?.size > 0) {
              this.cache.ui.debug(`Redrawing bubble set ${group} with ${cachedMembers.size} members ..`);
              await this.updateBubbleSet(group, []);
              await this.updateBubbleSet(group, Array.from(cachedMembers));
            }
          }
        } finally {
          this.cache.EVENT_LOCKS.BUBBLE_GROUP_REDRAW_RUNNING = false;
        }
      }, 50);
    }
    *traverseBubbleSets() {
      for (let group of Object.keys(this.cache.DEFAULTS.BUBBLE_GROUP_STYLE)) {
        yield group;
      }
    }
    async updateBubbleSetStyle(property, value) {
      const remainder = property.split("Bubble Set ")[1];
      const parts = remainder.split(" ");
      const group = parts[0];
      const propertyLabel = parts.slice(1).join(" ");
      const bStyle = this.cache.data.bubbleSetStyle[group];
      switch (propertyLabel) {
        case "Fill Color":
          bStyle.fill = value;
          bStyle.labelBackgroundFill = value;
          break;
        case "Fill Opacity":
          bStyle.fillOpacity = value;
          break;
        case "Stroke Color":
          bStyle.stroke = value;
          break;
        case "Stroke Opacity":
          bStyle.strokeOpacity = value;
          break;
        case "Label":
          bStyle.label = value;
          break;
        case "Label Text":
          bStyle.labelText = value;
          break;
        case "Label Background Color":
          bStyle.labelBackgroundFill = value;
          break;
        case "Label Background":
          bStyle.labelBackground = value;
          if (!value) {
            bStyle.labelFill = "#000000";
          } else {
            bStyle.labelFill = "#FFFFFF";
          }
          break;
        default:
          break;
      }
      await this.cache.INSTANCES.BUBBLE_GROUPS[group].update(bStyle);
      await this.cache.gcm.decideToRenderOrDraw(true);
    }
    refreshBubbleStyleElements() {
      for (const group of this.traverseBubbleSets()) {
        const hasActiveMembers = this.cache.lastBubbleSetMembers.get(group).size > 0;
        const labelConfigShouldBeEnabled = this.cache.data.bubbleSetStyle[group].label;
        const card = document.getElementById(`bubbleSetStyleCard${group}`);
        hasActiveMembers ? card.classList.remove("disabled") : card.classList.add("disabled");
        for (const elem of card.querySelectorAll(".bubbleSetOptionalLabelConfig")) {
          labelConfigShouldBeEnabled ? elem.classList.remove("disabled") : elem.classList.add("disabled");
        }
        const fillColor = this.cache.data.bubbleSetStyle[group].fill || this.cache.DEFAULTS.BUBBLE_GROUP_STYLE[group].fill;
        document.documentElement.style.setProperty(`--${group}-color`, fillColor);
      }
    }
    async updateBubbleSetIfChanged() {
      for (let group of this.traverseBubbleSets()) {
        let propsInGroup = this.cache.data.layouts[this.cache.data.selectedLayout][`${group}Props`];
        let lastSetMembers = this.cache.lastBubbleSetMembers.get(group);
        let newSetMembers = /* @__PURE__ */ new Set();
        for (let prop of propsInGroup) {
          let nodeIDsToBeGrouped = this.cache.propIDsToNodeIDsToBeShown.get(prop) || [];
          for (let nodeID of nodeIDsToBeGrouped) {
            newSetMembers.add(nodeID);
          }
        }
        if (!StaticUtilities.setsAreEqual(lastSetMembers, newSetMembers)) {
          await this.updateBubbleSet(group, newSetMembers);
          this.cache.lastBubbleSetMembers.set(group, newSetMembers);
          this.cache.bubbleSetChanged = true;
        }
      }
    }
    async updateBubbleSet(group, members) {
      let empty = !members || members.size === 0;
      const membersAsArray = [...members];
      function getAvoidMembers() {
        if (empty) return [];
        if (this.cache.CFG.APPLY_BUBBLE_SET_HOTFIX && this.cache.CFG.AVOID_MEMBERS_IN_BUBBLE_GROUPS) return [];
        return [...this.cache.nodeRef.keys()].filter((nodeID) => !membersAsArray.includes(nodeID));
      }
      const avoidMembers = getAvoidMembers();
      if (StaticUtilities.arraysAreEqual(membersAsArray, [...this.cache.INSTANCES.BUBBLE_GROUPS[group].members.keys()])) {
        this.cache.ui.debug("BUBBLE GROUPS IN SYNC - SKIPPING UPDATE");
        return;
      }
      await this.cache.INSTANCES.BUBBLE_GROUPS[group].update({
        members: empty ? [] : membersAsArray,
        avoidMembers,
        fillOpacity: empty ? 0 : this.cache.data.bubbleSetStyle[group].fillOpacity,
        strokeOpacity: empty ? 0 : this.cache.data.bubbleSetStyle[group].strokeOpacity,
        label: empty ? false : this.cache.data.bubbleSetStyle[group].label
      });
      await this.cache.INSTANCES.BUBBLE_GROUPS[group].drawBubbleSets();
    }
    async clearBubbleSetInstanceMembers() {
      for (const group of this.traverseBubbleSets()) {
        await this.cache.INSTANCES.BUBBLE_GROUPS[group].update({
          members: []
        });
      }
    }
  };
  var debounce = (func, wait) => {
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

  // src/graph/filter.js
  var GraphFilterManager = class {
    constructor(cache3) {
      this.cache = cache3;
    }
    async resetFilters(section, subSection = void 0) {
      const idPrefix = section + (subSection ? `::${subSection}` : "");
      const affectedPropIDs = Array.from(this.cache.propIDs).filter((id) => id.startsWith(idPrefix));
      for (const propID of affectedPropIDs) {
        this.cache.fm.checkCheckbox(propID, true);
        const slider = this.cache.propIDToInvertibleRangeSliders.get(propID);
        const dropdown = this.cache.propIDToDropdownChecklists.get(propID);
        if (slider) await slider.reset();
        if (dropdown) await dropdown.selectAllCategories(true);
      }
      await this.handleFilterEvent("Filtering", `Resetting filters for ${idPrefix} ..`);
    }
    async handleFilterEvent(header, text, propID = null, shouldResetQuery = true) {
      if (shouldResetQuery) {
        this.cache.qm.resetQuery();
      }
      if (propID !== null && !this.cache.data.layouts[this.cache.data.selectedLayout].filters.get(propID).active) {
        return;
      }
      await this.cache.ui.showLoading(header, text);
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await this.cache.gcm.decideToRenderOrDraw();
    }
    resetFeatureIsWithinThresholdMaps() {
      for (let node of this.cache.data.nodes) {
        node.featureIsWithinThreshold.forEach((value, key) => {
          node.featureIsWithinThreshold.set(key, null);
        });
      }
      for (let edge of this.cache.data.edges) {
        edge.featureIsWithinThreshold.forEach((value, key) => {
          edge.featureIsWithinThreshold.set(key, null);
        });
      }
    }
    getPropertiesNotWithinThresholds(nodeID = null, edgeID = null) {
      const keysWithFalse = [];
      const isNode = nodeID !== null;
      const element = isNode ? this.cache.nodeRef.get(nodeID) : this.cache.edgeRef.get(edgeID);
      const availableProps = /* @__PURE__ */ new Set([
        ...isNode ? this.cache.nodeExclusiveProps : this.cache.edgeExclusiveProps,
        ...this.cache.mixedProps
      ]);
      for (const [key, value] of element.featureIsWithinThreshold.entries()) {
        if (!availableProps.has(key)) continue;
        if (value === false) {
          keysWithFalse.push(key);
        }
      }
      for (let propID of this.cache.activeProps) {
        if (!availableProps.has(propID)) continue;
        if (!element.featureIsWithinThreshold.has(propID)) {
          keysWithFalse.push(propID);
        }
      }
      return keysWithFalse;
    }
    removeFromPropIDsToNodeIDsToBeShown(nodeID) {
      for (let propID of this.cache.propIDsToNodeIDsToBeShown.keys()) {
        this.cache.propIDsToNodeIDsToBeShown.get(propID).delete(nodeID);
      }
    }
    removeFromPropIDsToEdgeIDsToBeShown(edgeID) {
      for (let propID of this.cache.propIDsToEdgeIDsToBeShown.keys()) {
        this.cache.propIDsToEdgeIDsToBeShown.get(propID).delete(edgeID);
      }
    }
    async updateElementVisibility(idsToShow, idsToHide) {
      this.cache.visibleElementsChanged = false;
      const { nodes, edges } = await this.cache.graph.getData();
      const { visible, hidden } = [...nodes, ...edges].reduce((acc, item) => {
        acc[item.style.visibility === "visible" ? "visible" : "hidden"].push(item.id);
        return acc;
      }, { visible: [], hidden: [] });
      const showElementsDiff = idsToShow.filter((id) => hidden.includes(id));
      const hideElementsDiff = idsToHide.filter((id) => visible.includes(id));
      if (showElementsDiff.length > 0) {
        await this.cache.graph.showElement(showElementsDiff);
        this.cache.visibleElementsChanged = true;
      }
      if (hideElementsDiff.length > 0) {
        await this.cache.graph.hideElement(hideElementsDiff);
        this.cache.visibleElementsChanged = true;
      }
    }
  };

  // src/utilities/popup.js
  var Popup = class _Popup {
    /**
     * // Simple text popup
     * const popup1 = new Popup("Hello, I'm a simple popup!");
     *
     * // Popup with HTML content
     * const popup2 = new Popup(`
     *     <h2>Welcome!</h2>
     *     <p>This is a popup with <strong>HTML</strong> content.</p>
     *     <button onclick="ui.error('Button clicked!')">Click me</button>
     * `);
     *
     * // Popup with custom options
     * const popup3 = new Popup("Custom positioned popup!", {
     *     width: '400px',
     *     position: { x: 100, y: 100 },
     *     closeOnClickOutside: false,
     *     onClose: () => ui.debug('Popup closed!')
     * });
     */
    constructor(content, options = {}) {
      this.options = {
        width: "300px",
        height: "auto",
        position: "center",
        lineHeight: "normal",
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
        const inputField = document.createElement("input");
        inputField.type = "text";
        inputField.className = "p-prompt";
        const content = document.createElement("div");
        content.innerHTML = `<div>${message}</div>`;
        content.appendChild(inputField);
        const confirmBtn = document.createElement("button");
        confirmBtn.textContent = "OK";
        confirmBtn.className = "p-button";
        content.appendChild(confirmBtn);
        let isConfirmed = false;
        const handleConfirm = () => {
          isConfirmed = true;
          const value = inputField.value.trim();
          popup.close();
          resolve(value);
        };
        const popup = new _Popup(content, {
          width: "300px",
          showFullscreenButton: false,
          closeOnClickOutside: false,
          onClose: () => {
            if (!isConfirmed) {
              resolve(null);
            }
          }
        });
        confirmBtn.addEventListener("click", handleConfirm);
        inputField.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            handleConfirm();
          }
        });
        setTimeout(() => inputField.focus(), 0);
      });
    }
    static async confirm(message) {
      return new Promise((resolve) => {
        const content = document.createElement("div");
        content.innerHTML = `<div>${message}</div>`;
        const confirmBtn = document.createElement("button");
        confirmBtn.textContent = "OK";
        confirmBtn.className = "p-button ml-1";
        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Cancel";
        cancelBtn.className = "p-button";
        content.appendChild(confirmBtn);
        content.appendChild(cancelBtn);
        let isResolved = false;
        const popup = new _Popup(content, {
          width: "300px",
          showFullscreenButton: false,
          closeOnClickOutside: false,
          onClose: () => {
            if (!isResolved) {
              resolve(null);
            }
          }
        });
        confirmBtn.addEventListener("click", () => {
          isResolved = true;
          popup.close();
          resolve(true);
        });
        cancelBtn.addEventListener("click", () => {
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
      this.popup = document.createElement("div");
      this.popup.className = "p-custom";
      const headerDiv = document.createElement("div");
      headerDiv.className = "p-header";
      if (this.options.showFullscreenButton) {
        this.fullscreenBtn = document.createElement("button");
        this.fullscreenBtn.className = "p-icon";
        this.fullscreenBtn.innerHTML = "\u26F6";
        this.fullscreenBtn.title = "Toggle fullscreen";
        headerDiv.appendChild(this.fullscreenBtn);
      }
      this.closeBtn = document.createElement("button");
      this.closeBtn.className = "p-icon";
      this.closeBtn.innerHTML = "\xD7";
      this.closeBtn.title = "Close popup";
      headerDiv.appendChild(this.closeBtn);
      const popupContent = document.createElement("div");
      popupContent.className = "popup-content";
      popupContent.style.marginTop = "20px";
      if (typeof content === "string") {
        popupContent.innerHTML = content;
      } else {
        popupContent.appendChild(content);
      }
      this.popup.appendChild(headerDiv);
      this.popup.appendChild(popupContent);
      this.overlay = document.createElement("div");
      this.overlay.className = "p-overlay";
      document.body.appendChild(this.overlay);
      document.body.appendChild(this.popup);
      this.popup.style.width = this.options.width;
      if (this.options.height !== "auto") {
        this.popup.style.height = this.options.height;
      }
      if (this.options.lineHeight !== "normal") {
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
      this.fullscreenBtn.addEventListener("click", () => this.toggleFullscreen());
    }
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen;
      if (this.isFullscreen) {
        this.popup.style.width = "100%";
        this.popup.style.height = "100%";
        this.popup.style.top = "0";
        this.popup.style.left = "0";
        this.popup.style.transform = "none";
        this.popup.style.position = "fixed";
        this.fullscreenBtn.innerHTML = "\u29C9";
        this.fullscreenBtn.title = "Exit fullscreen";
      } else {
        Object.assign(this.popup.style, this.originalStyles);
        this.fullscreenBtn.innerHTML = "\u26F6";
        this.fullscreenBtn.title = "Fullscreen";
      }
    }
    setPosition() {
      if (!this.isFullscreen) {
        if (this.options.position === "center") {
          this.popup.style.top = "50%";
          this.popup.style.left = "50%";
          this.popup.style.transform = "translate(-50%, -50%)";
        } else {
          this.popup.style.top = `${this.options.position.y}px`;
          this.popup.style.left = `${this.options.position.x}px`;
          this.popup.style.transform = "none";
        }
      }
    }
    setupCloseHandlers() {
      this.closeBtn.addEventListener("click", () => this.close());
      if (this.options.closeOnClickOutside) {
        this.overlay.addEventListener("click", () => this.close());
      }
    }
    show() {
      this.popup.style.display = "block";
      this.overlay.style.display = "block";
    }
    close() {
      if (this.options.onClose) {
        this.options.onClose();
      }
      this.popup.remove();
      this.overlay.remove();
    }
  };

  // src/graph/layout.js
  var GraphLayoutManager = class {
    constructor(cache3) {
      this.cache = cache3;
    }
    async handleLayoutChangeLoadingEvent(header, text) {
      await this.cache.ui.showLoading(header, text);
      this.cache.layoutChanged = true;
      await this.cache.gcm.decideToRenderOrDraw();
      this.cache.ui.debug(`Graph updated after layout event with message ${header} ${text}`);
    }
    async changeLayout() {
      this.cache.data.selectedLayout = document.getElementById("selectView").value;
      await this.cache.ui.showLoading("Switching View", this.cache.data.selectedLayout);
      await new Promise((resolve) => requestAnimationFrame(resolve));
      let layout = this.cache.data.layouts[this.cache.data.selectedLayout];
      if (!layout.isCustom) {
        await this.cache.graph.setLayout({ type: this.cache.data.selectedLayout, ...layout.internals });
        await this.cache.graph.layout();
      }
      this.cache.ui.buildFilterUI();
      this.cache.ui.clearActivePropsCacheOnLayoutChange();
      await this.cache.metrics.updateUI();
      this.cache.EVENT_LOCKS.ONCE_AFTER_RENDER_COMPLETED = false;
      await this.cache.gcm.decideToRenderOrDraw(true);
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
      this.cache.data.layouts[layoutName] = {
        internals: null,
        positions: structuredClone(currentLayout.positions),
        filters: structuredClone(currentLayout.filters),
        isCustom: true
      };
      for (let group of this.cache.bs.traverseBubbleSets()) {
        this.cache.data.layouts[layoutName][`${group}Props`] = structuredClone(currentLayout[`${group}Props`]);
      }
      this.cache.ui.buildDropdownOptions();
      document.getElementById("selectView").value = layoutName;
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
      document.getElementById("selectView").value = this.cache.DEFAULTS.LAYOUT;
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
        this.cache.initialNodePositions.set(this.cache.data.selectedLayout, /* @__PURE__ */ new Map());
        for (const nodeID of this.cache.nodeRef.keys()) {
          const pos = await this.cache.graph.getElementPosition(nodeID);
          this.cache.initialNodePositions.get(this.cache.data.selectedLayout).set(nodeID, { style: { x: pos[0], y: pos[1] } });
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
        let angleStep = 2 * Math.PI / numNodes;
        let i = 0;
        for (const node of await this.cache.sm.getSelectedNodes()) {
          const angle = i * angleStep;
          node.style.x = origAvgX + radius * Math.cos(angle);
          node.style.y = origAvgY + radius * Math.sin(angle);
          i++;
        }
      }
      async function applyForceLayout(iterations) {
        const INITIAL_TEMPERATURE = 2;
        const COOLING_FACTOR = 0.98;
        const GRAVITY_STRENGTH = 1e-5;
        const MAX_DISPLACEMENT = 50;
        const REPULSION = 2e4;
        const SPRING_LENGTH = 300;
        const SPRING_STRENGTH = 5e-3;
        const nodes = await this.cache.sm.getSelectedNodes();
        for (const node of nodes) {
          node.style.x = Math.random() * 1e3 - 500;
          node.style.y = Math.random() * 1e3 - 500;
        }
        let temperature = INITIAL_TEMPERATURE;
        for (let i = 0; i < iterations; i++) {
          for (let a = 0; a < nodes.length; a++) {
            for (let b = a + 1; b < nodes.length; b++) {
              const dx = nodes[b].style.x - nodes[a].style.x;
              const dy = nodes[b].style.y - nodes[a].style.y;
              const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;
              const force = REPULSION / (dist * dist);
              const fx = force * (dx / dist);
              const fy = force * (dy / dist);
              nodes[a].style.x -= fx * temperature;
              nodes[a].style.y -= fy * temperature;
              nodes[b].style.x += fx * temperature;
              nodes[b].style.y += fy * temperature;
            }
          }
          for (const edge of await this.cache.graph.getEdgeData()) {
            const { source, target } = edge;
            if (this.cache.selectedNodes.includes(source) && this.cache.selectedNodes.includes(target)) {
              const nodeA = nodes.find((n) => n.id === source);
              const nodeB = nodes.find((n) => n.id === target);
              if (nodeA && nodeB) {
                const dx = nodeB.style.x - nodeA.style.x;
                const dy = nodeB.style.y - nodeA.style.y;
                const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;
                const force = (dist - SPRING_LENGTH) * SPRING_STRENGTH;
                const fx = force * (dx / dist);
                const fy = force * (dy / dist);
                nodeA.style.x += fx * temperature;
                nodeA.style.y += fy * temperature;
                nodeB.style.x -= fx * temperature;
                nodeB.style.y -= fy * temperature;
              }
            }
          }
          for (const node of nodes) {
            node.style.x += -node.style.x * GRAVITY_STRENGTH * temperature;
            node.style.y += -node.style.y * GRAVITY_STRENGTH * temperature;
          }
          for (const node of nodes) {
            const dist = Math.sqrt(node.style.x * node.style.x + node.style.y * node.style.y);
            if (dist > MAX_DISPLACEMENT) {
              const ratio = MAX_DISPLACEMENT / dist;
              node.style.x *= ratio;
              node.style.y *= ratio;
            }
          }
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
        const centerX = origCenterX;
        const centerY = origCenterY;
        const width = origWidth;
        const height = origHeight;
        const angle = Math.random() * 2 * Math.PI;
        const [anchor1, anchor2] = getRandomElements(nodes, 2);
        anchor1.style.x = centerX + width / 2 * Math.cos(angle) - height / 2 * Math.sin(angle);
        anchor1.style.y = centerY + width / 2 * Math.sin(angle) + height / 2 * Math.cos(angle);
        anchor2.style.x = centerX - width / 2 * Math.cos(angle) + height / 2 * Math.sin(angle);
        anchor2.style.y = centerY - width / 2 * Math.sin(angle) - height / 2 * Math.cos(angle);
        for (const node of nodes) {
          if (node === anchor1 || node === anchor2) continue;
          const u = Math.random() - 0.5;
          const v = Math.random() - 0.5;
          const dx = u * width;
          const dy = v * height;
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
      const coords = sel.map((n) => ({ x: n.style.x, y: n.style.y }));
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
        "random": () => applyRandomLayout()
      };
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
        this.cache.data.layouts[this.cache.data.selectedLayout].positions.set(node.id, { style: { x: node.style.x, y: node.style.y } });
      }
    }
    createDefaultLayout(key, overridePositionsFromExcel = false) {
      const defLayout = {
        internals: this.cache.DEFAULTS.LAYOUT_INTERNALS[key] || null,
        positions: /* @__PURE__ */ new Map(),
        filters: structuredClone(this.cache.data.filterDefaults),
        isCustom: false,
        query: void 0
      };
      if (overridePositionsFromExcel) {
        for (const [nodeID, positions] of this.cache.nodePositionsFromExcelImport) {
          defLayout.positions.set(nodeID, { style: { x: positions.x, y: positions.y } });
        }
        defLayout.type = this.cache.DEFAULTS.LAYOUT;
        defLayout.internals = this.cache.DEFAULTS.LAYOUT_INTERNALS[this.cache.DEFAULTS.LAYOUT];
        defLayout.isCustom = true;
      }
      for (let group of this.cache.bs.traverseBubbleSets()) {
        defLayout[`${group}Props`] = /* @__PURE__ */ new Set();
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
  };

  // src/graph/selection.js
  var GraphSelectionManager = class {
    constructor(cache3) {
      this.cache = cache3;
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
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const updatedData = [];
      for (const item of elemData) {
        const elem = this.cache.graph.getElementData(item.id);
        this.updateElementSelectedState(elem, enable);
        this.cache.data.push(elem);
      }
      await this.cache.graph.updateData(updatedData);
      await this.cache.graph.render();
      await this.cache.ui.hideLoading();
      await new Promise((resolve) => requestAnimationFrame(resolve));
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
      const shouldAdd = isNode ? !document.getElementById("selectByNodeIDsSwitch").checked : !document.getElementById("selectByEdgeIDsSwitch").checked;
      const elementIDsAsArray = elementIDs ? elementIDs.split(",") : [];
      await this.addNodeOrEdgeIDsToSelection(elementIDsAsArray, isNode, shouldAdd);
    }
    async addNodeOrEdgeLabelsToSelectionWrapper(elementLabels, isNode) {
      const elementLabelsAsArray = elementLabels ? elementLabels.split(",") : [];
      const elementIDs = elementLabelsAsArray.flatMap((label) => {
        const set = isNode ? this.cache.nodeLabelToNodeIDs.get(label) : this.cache.edgeLabelToEdgeIDs.get(label);
        return set ? Array.from(set) : [];
      });
      const shouldAdd = isNode ? !document.getElementById("selectByNodeLabelsSwitch").checked : !document.getElementById("selectByEdgeLabelsSwitch").checked;
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
            const connectingNodesAreSelected = this.cache.selectedNodes.includes(edge.source) && this.cache.selectedNodes.includes(edge.target);
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
      const { selectedNodes, selectedEdges, selectionMemory, selectedMemoryIndex } = cache;
      if (selectionMemory.length === 0) {
        selectionMemory.push({ nodes: [], edges: [] });
        this.cache.selectedMemoryIndex = 0;
      }
      const currentSnapshot = selectionMemory[selectedMemoryIndex];
      const nodesChanged = !StaticUtilities.arraysAreEqual(currentSnapshot.nodes, selectedNodes);
      const edgesChanged = !StaticUtilities.arraysAreEqual(currentSnapshot.edges, selectedEdges);
      if (nodesChanged || edgesChanged) {
        if (selectedMemoryIndex < selectionMemory.length - 1) {
          selectionMemory.splice(selectedMemoryIndex + 1);
        }
        if (selectionMemory.length === this.cache.CFG.MAX_SELECTION_MEMORY) {
          selectionMemory.shift();
          this.cache.selectedMemoryIndex = selectionMemory.length - 1;
        }
        selectionMemory.push({
          nodes: [...selectedNodes],
          edges: [...selectedEdges]
        });
        this.cache.selectedMemoryIndex = selectionMemory.length - 1;
      }
    }
    updateEnabledStateUndoRedoSelectionButtons() {
      const { selectionMemory, selectedMemoryIndex } = this.cache;
      const canUndo = selectedMemoryIndex > 0;
      const canRedo = selectedMemoryIndex < selectionMemory.length - 1;
      this.cache.ui.toggleDisabledElements(["undoSelectionBtn"], canUndo);
      this.cache.ui.toggleDisabledElements(["redoSelectionBtn"], canRedo);
    }
    async updateSelectedNodesAndEdges() {
      this.cache.selectedNodes = await this.cache.graph.getNodeData().filter((n) => n.states?.includes("selected") && this.cache.nodeIDsToBeShown.has(n.id)).map((n) => n.id);
      this.cache.selectedEdges = await this.cache.graph.getEdgeData().filter((e) => e.states?.includes("selected") && this.cache.edgeIDsToBeShown.has(e.id)).map((e) => e.id);
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
      if (typeof this.cache.dataTable !== "undefined" && this.cache.dataTable.fileData) {
        if (this.cache.dataTable.currentTab === "selectedNodes" || this.cache.dataTable.currentTab === "selectedEdges" || this.cache.dataTable.currentTab === "selectedElements") {
          this.cache.dataTable.refreshCurrentTab();
        }
      }
    }
  };

  // src/graph/style.js
  var GraphStyleManager = class {
    constructor(cache3) {
      this.cache = cache3;
    }
    async resetStyleForSelectedElements() {
      for (const node of this.cache.nodeRef.values()) {
        if (this.cache.selectedNodes.includes(node.id)) {
          if (this.cache.CFG.RESET_SELECTION_BUTTON_RESETS_POSITIONS) {
            console.log("bar");
          }
          node.style = structuredClone(node.originalStyle);
        }
      }
      for (const edge of this.cache.edgeRef.values()) {
        if (this.cache.selectedEdges.includes(edge.id)) {
          edge.style = structuredClone(edge.originalStyle);
        }
      }
      await this.handleStyleChangeLoadingEvent("Style", `Resetting Styles`);
      await this.cache.lm.restoreInitialNodePositions(true);
    }
    async handleStyleChangeLoadingEvent(header, text) {
      await this.cache.ui.showLoading(header, text);
      await new Promise((resolve) => requestAnimationFrame(resolve));
      this.cache.styleChanged = true;
      await this.cache.gcm.decideToRenderOrDraw();
      this.cache.ui.debug(`Graph updated after style event with message ${header} ${text}`);
    }
    getNodeStyleOrDefaults(node) {
      const src = node.style ?? {};
      const d = this.cache.DEFAULTS.NODE;
      const defaultNode = {
        type: node.type ?? d.TYPE,
        style: {
          size: src.size ?? d.SIZE,
          fill: src.fill ?? d.FILL_COLOR,
          stroke: src.stroke ?? d.STROKE_COLOR,
          lineWidth: src.lineWidth ?? d.LINE_WIDTH,
          badge: src.badge ?? false,
          badges: src.badges ?? [],
          badgePalette: src.badgePalette ?? [],
          badgeFontSize: src.badgeFontSize ?? d.BADGE.FONT_SIZE
        }
      };
      if (!this.cache.CFG.HIDE_LABELS || src.label) {
        const l = this.cache.DEFAULTS.NODE.LABEL;
        Object.assign(defaultNode.style, {
          label: true,
          labelText: src.labelText,
          labelBackgroundFill: src.labelBackgroundFill ?? l.BACKGROUND_COLOR,
          labelBackground: src.labelBackground ?? l.BACKGROUND,
          labelBackgroundRadius: src.labelBackgroundRadius ?? l.BACKGROUND_RADIUS,
          labelCursor: src.labelCursor ?? l.CURSOR,
          labelFill: src.labelFill ?? l.FOREGROUND_COLOR,
          labelFontSize: src.labelFontSize ?? l.FONT_SIZE,
          labelLeading: src.labelLeading ?? l.LINE_SPACING,
          labelMaxLines: src.labelMaxLines ?? l.MAX_LINES,
          labelMaxWidth: src.labelMaxWidth ?? l.MAX_WIDTH,
          labelOffsetX: src.labelOffsetX ?? l.OFFSET_X,
          labelOffsetY: src.labelOffsetY ?? l.OFFSET_Y,
          labelPadding: src.labelPadding ?? l.PADDING,
          labelPlacement: src.labelPlacement ?? l.PLACEMENT,
          labelTextAlign: src.labelTextAlign ?? l.TEXT_ALIGN,
          labelWordWrap: src.labelWordWrap ?? l.WORD_WRAP,
          labelZIndex: src.labelZIndex ?? l.Z_INDEX
        });
      }
      return defaultNode;
    }
    getEdgeStyleOrDefaults(edge) {
      const src = edge.style ?? {};
      const d = this.cache.DEFAULTS.EDGE;
      const defaultEdge = {
        type: edge.type ?? d.TYPE,
        style: {
          startArrow: src.startArrow ?? d.ARROWS.START,
          startArrowSize: src.startArrowSize ?? d.ARROWS.START_SIZE,
          startArrowType: src.startArrowType ?? d.ARROWS.START_TYPE,
          endArrow: src.endArrow ?? d.ARROWS.END,
          endArrowSize: src.endArrowSize ?? d.ARROWS.END_SIZE,
          endArrowType: src.endArrowType ?? d.ARROWS.END_TYPE,
          lineWidth: src.lineWidth ?? d.LINE_WIDTH,
          lineDash: src.lineDash ?? d.LINE_DASH,
          stroke: src.stroke ?? d.COLOR,
          halo: src.halo ?? d.HALO.ENABLED,
          haloStroke: src.haloStroke ?? d.HALO.COLOR,
          haloLineWidth: src.haloLineWidth ?? d.HALO.WIDTH
        }
      };
      if (!this.cache.CFG.HIDE_LABELS || src.label) {
        const l = this.cache.DEFAULTS.EDGE.LABEL;
        Object.assign(defaultEdge.style, {
          label: true,
          labelAutoRotate: src.labelAutoRotate ?? l.AUTO_ROTATE,
          labelBackground: src.labelBackground ?? l.BACKGROUND,
          labelBackgroundFill: src.labelBackgroundFill ?? l.BACKGROUND_COLOR,
          labelBackgroundCursor: src.labelBackgroundCursor ?? l.BACKGROUND_CURSOR,
          labelBackgroundFillOpacity: src.labelBackgroundFillOpacity ?? l.BACKGROUND_FILL_OPACITY,
          labelBackgroundRadius: src.labelBackgroundRadius ?? l.BACKGROUND_RADIUS,
          labelBackgroundStrokeOpacity: src.labelBackgroundStrokeOpacity ?? l.BACKGROUND_STROKE_OPACITY,
          labelCursor: src.labelCursor ?? l.CURSOR,
          labelFill: src.labelFill ?? l.FOREGROUND_COLOR,
          labelFillOpacity: src.labelFillOpacity ?? l.FILL_OPACITY,
          labelFontSize: src.labelFontSize ?? l.FONT_SIZE,
          labelFontWeight: src.labelFontWeight ?? l.FONT_WEIGHT,
          labelMaxLines: src.labelMaxLines ?? l.MAX_LINES,
          labelMaxWidth: src.labelMaxWidth ?? l.MAX_WIDTH,
          labelOffsetX: src.labelOffsetX ?? l.OFFSET_X,
          labelOffsetY: src.labelOffsetY ?? l.OFFSET_Y,
          labelOpacity: src.labelOpacity ?? l.OPACITY,
          labelPlacement: src.labelPlacement ?? l.PLACEMENT,
          labelPadding: src.labelPadding ?? l.PADDING,
          labelText: src.labelText ?? l.TEXT,
          labelTextAlign: src.labelTextAlign ?? l.TEXT_ALIGN,
          labelTextBaseLine: src.labelTextBaseLine ?? l.TEXT_BASE_LINE,
          labelTextOverflow: src.labelTextOverflow ?? l.TEXT_OVERFLOW,
          labelVisibility: src.labelVisibility ?? l.VISIBILITY,
          labelWordWrap: src.labelWordWrap ?? l.WORD_WRAP
        });
      }
      return defaultEdge;
    }
  };

  // src/utilities/data_editor.js
  var dataTable;
  var DataTable = class {
    constructor(cache3, containerId = "dataTableContainer") {
      this.containerId = containerId;
      this.tableData = [];
      this.headers = [];
      this.currentEditingCell = null;
      this.onChangeCallback = null;
      this.sortState = {};
      this.originalOrder = [];
      this.headerIndexMap = /* @__PURE__ */ new Map();
      this.currentTab = "selectedNodes";
      this.fileData = null;
      this.tableDataBackup = [];
      this.pendingChanges = /* @__PURE__ */ new Map();
      this.onPendingChangesCallback = null;
      this.cache = cache3;
    }
    init() {
      const container = document.getElementById(this.containerId);
      if (!container) {
        this.cache.ui.error(`Container with ID '${this.containerId}' not found`);
        return;
      }
      container.innerHTML = `
      <div class="data-table-tabs">
        <button class="data-table-tab active" data-tab="selectedNodes">Selected Nodes</button>
        <button class="data-table-tab" data-tab="selectedEdges">Selected Edges</button>
        <button class="data-table-tab" data-tab="selectedElements">Selected Elements</button>
        <button class="data-table-tab" data-tab="allNodes">All Nodes</button>
        <button class="data-table-tab" data-tab="allEdges">All Edges</button>
        <button class="data-table-tab" data-tab="entireGraph">Entire Graph</button>
      </div>
      <table id="dataTable" class="data-table">
        <thead id="dataTableHead"></thead>
        <tbody id="dataTableBody"></tbody>
      </table>
    `;
      this.tabsContainer = container.querySelector(".data-table-tabs");
      this.table = container.querySelector("#dataTable");
      this.tableHead = container.querySelector("#dataTableHead");
      this.tableBody = container.querySelector("#dataTableBody");
      this.tabsContainer.addEventListener("click", this.handleTabClick.bind(this));
      this.tableBody.addEventListener("click", this.handleTableClick.bind(this));
      this.tableBody.addEventListener("focus", this.handleTableFocus.bind(this), true);
      this.tableBody.addEventListener("blur", this.handleTableBlur.bind(this), true);
      this.tableBody.addEventListener("keydown", this.handleTableKeydown.bind(this));
      this.tableBody.addEventListener("input", this.handleTableInput.bind(this));
      this.tableHead.addEventListener("click", this.handleHeaderTableClick.bind(this));
    }
    async handleTabClick(event) {
      if (event.target.classList.contains("data-table-tab")) {
        const tab = event.target.dataset.tab;
        await this.switchTab(tab);
      }
    }
    async switchTab(tab) {
      await this.cache.ui.showLoading("Data Editor", `Loading ${tab} this.cache.data...`);
      this.currentTab = tab;
      this.tabsContainer.querySelectorAll(".data-table-tab").forEach((btn) => {
        btn.classList.remove("active");
        if (btn.dataset.tab === tab) {
          btn.classList.add("active");
        }
      });
      this.sortState = {};
      this.loadTabData();
      await this.cache.ui.hideLoading();
    }
    loadTabData() {
      if (!this.fileData) {
        this.cache.ui.error("No fileData available");
        return;
      }
      this.headers = ["Del", "Row #", "Type", "ID", "Label", "Description"];
      this.headers.push(...this.fileData.nodeDataHeaders.map((o) => `${this.cache.CFG.EXCEL_NODE_HEADER}::${o.subGroup}::${o.key}`));
      this.headers.push(...this.fileData.edgeDataHeaders.map((o) => `${this.cache.CFG.EXCEL_EDGE_HEADER}::${o.subGroup}::${o.key}`));
      this.headerIndexMap.clear();
      this.headers.forEach((header, index) => {
        this.headerIndexMap.set(header, index);
      });
      const pendingRowIds = /* @__PURE__ */ new Set();
      this.pendingChanges.forEach((change, id) => {
        pendingRowIds.add(id);
      });
      const preservedRows = this.tableData.filter((row) => pendingRowIds.has(row[3]));
      this.tableData = [];
      switch (this.currentTab) {
        case "selectedNodes":
          this.loadSelectedNodes();
          break;
        case "selectedEdges":
          this.loadSelectedEdges();
          break;
        case "selectedElements":
          this.loadSelectedElements();
          break;
        case "allNodes":
          this.loadAllNodes();
          break;
        case "allEdges":
          this.loadAllEdges();
          break;
        case "entireGraph":
          this.loadEntireGraph();
          break;
      }
      this.tableData.push(...preservedRows);
      this.tableData.forEach((row, index) => {
        row[1] = index + 1;
      });
      this.tableDataBackup = this.tableData.map((row) => [...row]);
      this.originalOrder = this.tableData.map((_, index) => index);
      this.render();
    }
    loadSelectedNodes() {
      if (!this.fileData.nodes || !this.cache.selectedNodes) return;
      const selectedNodeSet = new Set(this.cache.selectedNodes);
      const selectedNodes = this.fileData.nodes.filter((node) => selectedNodeSet.has(node.id));
      this.addNodesToTable(selectedNodes);
    }
    loadSelectedEdges() {
      if (!this.fileData.edges || !this.cache.selectedEdges) return;
      const selectedEdgeSet = new Set(this.cache.selectedEdges);
      const selectedEdges = this.fileData.edges.filter((edge) => selectedEdgeSet.has(edge.id));
      this.addEdgesToTable(selectedEdges);
    }
    loadSelectedElements() {
      if (!this.cache.selectedNodes && !this.cache.selectedEdges) return;
      if (this.fileData.nodes && this.cache.selectedNodes) {
        const selectedNodeSet = new Set(this.cache.selectedNodes);
        const selectedNodes = this.fileData.nodes.filter((node) => selectedNodeSet.has(node.id));
        this.addNodesToTable(selectedNodes);
      }
      if (this.fileData.edges && this.cache.selectedEdges) {
        const selectedEdgeSet = new Set(this.cache.selectedEdges);
        const selectedEdges = this.fileData.edges.filter((edge) => selectedEdgeSet.has(edge.id));
        this.addEdgesToTable(selectedEdges);
      }
    }
    loadAllNodes() {
      if (!this.fileData.nodes) return;
      this.addNodesToTable(this.fileData.nodes);
    }
    loadAllEdges() {
      if (!this.fileData.edges) return;
      this.addEdgesToTable(this.fileData.edges);
    }
    loadEntireGraph() {
      if (this.fileData.nodes) {
        this.addNodesToTable(this.fileData.nodes);
      }
      if (this.fileData.edges) {
        this.addEdgesToTable(this.fileData.edges);
      }
    }
    addNodesToTable(nodes) {
      nodes.forEach((node) => {
        const row = new Array(this.headers.length).fill("");
        row[0] = "";
        row[1] = this.tableData.length + 1;
        row[2] = "Node";
        row[3] = node.id;
        row[4] = node.label || "";
        row[5] = node.description || "";
        for (let [section, subSection, prop, data] of traverseD4Data(node)) {
          const headerKey = `${section}::${subSection}::${prop}`;
          const headerIdx = this.headerIndexMap.get(headerKey);
          if (headerIdx !== void 0) {
            row[headerIdx] = data;
          }
        }
        this.tableData.push(row);
      });
    }
    addEdgesToTable(edges) {
      edges.forEach((edge) => {
        const row = new Array(this.headers.length).fill("");
        row[0] = "";
        row[1] = this.tableData.length + 1;
        row[2] = "Edge";
        row[3] = edge.id;
        row[4] = edge.label || "";
        row[5] = edge.description || "";
        for (let [section, subSection, prop, data] of this.cache.gcm.traverseD4Data(edge)) {
          const headerKey = `${section}::${subSection}::${prop}`;
          const headerIdx = this.headerIndexMap.get(headerKey);
          if (headerIdx !== void 0) {
            row[headerIdx] = data;
          }
        }
        this.tableData.push(row);
      });
    }
    handleTableClick(event) {
      if (event.target.classList.contains("data-table-delete-row-btn")) {
        const rowIndex = parseInt(event.target.closest("td").dataset.row);
        this.handleDeleteRow(rowIndex);
      }
    }
    async handleHeaderTableClick(event) {
      await this.cache.ui.showLoading("Data Editor", "Sorting ..");
      const headerDiv = event.target.closest(".data-table-sortable-header");
      if (headerDiv) {
        const columnIndex = parseInt(headerDiv.dataset.column);
        this.handleHeaderClick(columnIndex);
      }
      await this.cache.ui.hideLoading();
    }
    handleTableFocus(event) {
      if (event.target.contentEditable === "true") {
        const rowIndex = parseInt(event.target.dataset.row);
        const colIndex = parseInt(event.target.dataset.col);
        this.handleCellFocus(event, rowIndex, colIndex);
      }
    }
    handleTableBlur(event) {
      if (event.target.contentEditable === "true") {
        const rowIndex = parseInt(event.target.dataset.row);
        const colIndex = parseInt(event.target.dataset.col);
        this.handleCellBlur(event, rowIndex, colIndex);
      }
    }
    handleTableKeydown(event) {
      if (event.target.contentEditable === "true") {
        const rowIndex = parseInt(event.target.dataset.row);
        const colIndex = parseInt(event.target.dataset.col);
        this.handleCellKeydown(event, rowIndex, colIndex);
      }
    }
    handleTableInput(event) {
      if (event.target.contentEditable === "true") {
        const rowIndex = parseInt(event.target.dataset.row);
        const colIndex = parseInt(event.target.dataset.col);
        this.handleCellInput(event, rowIndex, colIndex);
      }
    }
    populateFromFileData(fileData) {
      if (!fileData) {
        this.cache.ui.error("No fileData provided");
        return;
      }
      this.fileData = structuredClone(fileData);
      this.loadTabData();
    }
    async refreshCurrentTab() {
      this.loadTabData();
    }
    reset() {
      this.tableData = this.tableDataBackup.map((row) => [...row]);
      this.sortState = {};
      this.originalOrder = this.tableData.map((_, index) => index);
      this.render();
    }
    render() {
      if (!this.tableHead || !this.tableBody) {
        this.cache.ui.error("Table elements not found");
        return;
      }
      const headerFragment = document.createDocumentFragment();
      const bodyFragment = document.createDocumentFragment();
      if (this.tableData.length === 0) {
        this.tableHead.innerHTML = "";
        this.tableBody.innerHTML = '<tr><td colspan="100%">No data available</td></tr>';
        this.updateExportButtonState();
        return;
      }
      const headerRow = document.createElement("tr");
      this.headers.forEach((header, index) => {
        const th = document.createElement("th");
        if (index === 0) {
          th.classList.add("data-table-delete-row-column");
        } else {
          th.innerHTML = `
        <div class="data-table-sortable-header" data-column="${index}">
          <span class="data-table-header-text">${header}</span>
          <span class="data-table-sort-indicator">${this.getSortIndicator(index)}</span>
        </div>
      `;
        }
        headerRow.appendChild(th);
      });
      headerFragment.appendChild(headerRow);
      this.tableData.forEach((rowData, rowIndex) => {
        const tr = document.createElement("tr");
        const isNodeRow = rowData[2] === "Node";
        rowData.forEach((cellData, colIndex) => {
          const td = document.createElement("td");
          td.dataset.row = rowIndex;
          td.dataset.col = colIndex;
          if (colIndex === 0) {
            td.innerHTML = `<button class="data-table-delete-row-btn" title="Delete row ${rowIndex + 1} (${rowData[2]} ${rowData[3]})">\xD7</button>`;
            td.classList.add("data-table-delete-row-column");
          } else {
            td.textContent = cellData || "";
            const isBasicColumn = colIndex <= 3;
            const isReservedColumn = colIndex === 4 || colIndex === 5;
            const isMismatchedColumn = isNodeRow && this.headers[colIndex].startsWith(this.cache.CFG.EXCEL_EDGE_HEADER) || !isNodeRow && this.headers[colIndex].startsWith(this.cache.CFG.EXCEL_NODE_HEADER);
            const shouldBeEditable = (!isBasicColumn || isReservedColumn) && !isMismatchedColumn;
            if (shouldBeEditable) {
              td.contentEditable = true;
            } else {
              td.classList.add("readonly");
            }
          }
          tr.appendChild(td);
        });
        bodyFragment.appendChild(tr);
      });
      this.tableHead.innerHTML = "";
      this.tableBody.innerHTML = "";
      this.tableHead.appendChild(headerFragment);
      this.tableBody.appendChild(bodyFragment);
      this.updateExportButtonState();
    }
    updateExportButtonState() {
      const exportBtn = document.getElementById("exportDataTableBtn");
      if (exportBtn) {
        if (this.tableData.length === 0) {
          exportBtn.classList.add("disabled");
          exportBtn.disabled = true;
        } else {
          exportBtn.classList.remove("disabled");
          exportBtn.disabled = false;
        }
      }
    }
    handleDeleteRow(rowIndex) {
      if (rowIndex >= 0 && rowIndex < this.tableData.length) {
        const id = this.tableData[rowIndex][3];
        const type = this.tableData[rowIndex][2];
        this.pendingChanges.set(id, { type, action: "delete" });
        this.tableData.splice(rowIndex, 1);
        this.originalOrder.splice(rowIndex, 1);
        this.originalOrder = this.originalOrder.map((idx) => idx > rowIndex ? idx - 1 : idx);
        this.render();
        if (this.onChangeCallback) {
          this.onChangeCallback(-1, -1, "row_deleted");
        }
      }
    }
    handleHeaderClick(columnIndex) {
      const currentSort = this.sortState[columnIndex];
      this.sortState = {};
      if (!currentSort) {
        this.sortState[columnIndex] = "asc";
      } else if (currentSort === "asc") {
        this.sortState[columnIndex] = "desc";
      } else {
        this.sortState[columnIndex] = null;
      }
      this.sortColumn(columnIndex, this.sortState[columnIndex]);
    }
    sortColumn(columnIndex, direction) {
      if (!direction) {
        const originalData = this.originalOrder.map((idx) => this.tableDataBackup[idx]);
        this.tableData = originalData.map((row) => [...row]);
        this.render();
        return;
      }
      const sortIndices = this.tableData.map((_, index) => index);
      sortIndices.sort((aIdx, bIdx) => {
        let aVal = this.tableData[aIdx][columnIndex] || "";
        let bVal = this.tableData[bIdx][columnIndex] || "";
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return direction === "asc" ? aNum - bNum : bNum - aNum;
        } else {
          aVal = String(aVal).toLowerCase();
          bVal = String(bVal).toLowerCase();
          return direction === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
      });
      this.tableData = sortIndices.map((idx) => this.tableData[idx]);
      this.render();
    }
    getSortIndicator(columnIndex) {
      const sortState = this.sortState[columnIndex];
      if (sortState === "asc") return "\u25B2";
      if (sortState === "desc") return "\u25BC";
      return "\u21C5";
    }
    handleCellFocus(event, rowIndex, colIndex) {
      const cell = event.target;
      this.currentEditingCell = { cell, rowIndex, colIndex };
      cell.classList.add("editing");
      const range = document.createRange();
      range.selectNodeContents(cell);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
    handleCellBlur(event, rowIndex, colIndex) {
      const cell = event.target;
      cell.classList.remove("editing");
      this.tableData[rowIndex][colIndex] = cell.textContent;
      const id = this.tableData[rowIndex][3];
      const type = this.tableData[rowIndex][2];
      this.trackChange(id, type);
      if (this.onChangeCallback) {
        this.onChangeCallback(rowIndex, colIndex, cell.textContent);
      }
      this.notifyPendingChanges();
      this.currentEditingCell = null;
    }
    notifyPendingChanges() {
      if (this.onPendingChangesCallback) {
        const hasPendingChanges = this.pendingChanges.size > 0;
        const hasChangesFromOriginal = this.hasChangesFromOriginal();
        this.onPendingChangesCallback({
          hasPendingChanges,
          hasChangesFromOriginal
        });
      }
    }
    hasChangesFromOriginal() {
      if (this.tableData.length !== this.tableDataBackup.length) {
        return true;
      }
      for (let i = 0; i < this.tableData.length; i++) {
        const currentRow = this.tableData[i];
        const originalRow = this.tableDataBackup[i];
        if (!currentRow || !originalRow) {
          return true;
        }
        for (let j = 0; j < currentRow.length; j++) {
          if (currentRow[j] !== originalRow[j]) {
            return true;
          }
        }
      }
      return false;
    }
    onPendingChangesUpdated(callback) {
      this.onPendingChangesCallback = callback;
    }
    handleCellKeydown(event, rowIndex, colIndex) {
      switch (event.key) {
        case "Enter":
          event.preventDefault();
          this.moveToCell(rowIndex + 1, colIndex);
          break;
        case "Tab":
          event.preventDefault();
          if (event.shiftKey) {
            this.moveToCell(rowIndex, colIndex - 1);
          } else {
            this.moveToCell(rowIndex, colIndex + 1);
          }
          break;
        case "Escape":
          event.target.blur();
          break;
      }
    }
    handleCellInput(event, rowIndex, colIndex) {
      this.tableData[rowIndex][colIndex] = event.target.textContent;
    }
    moveToCell(rowIndex, colIndex) {
      if (colIndex >= this.headers.length) {
        colIndex = 2;
        rowIndex++;
      } else if (colIndex < 2) {
        colIndex = this.headers.length - 1;
        rowIndex--;
      }
      if (rowIndex < 0 || rowIndex >= this.tableData.length) {
        return;
      }
      const targetCell = this.tableBody.querySelector(`td[data-row="${rowIndex}"][data-col="${colIndex}"]`);
      if (targetCell && targetCell.contentEditable === "true") {
        targetCell.focus();
      }
    }
    onChange(callback) {
      this.onChangeCallback = callback;
    }
    getData() {
      return {
        headers: [...this.headers],
        data: this.tableData.map((row) => [...row])
      };
    }
    async addNode() {
      if (typeof dataTable === "undefined") return;
      let nodeID = await Popup.prompt("Enter Node ID: ");
      if (!nodeID) {
        this.cache.ui.info("Adding node canceled");
        return;
      }
      if (this.cache.nodeRef.has(nodeID) || this.tableData.some((row) => row[2] === "Node" && row[3] === nodeID)) {
        this.cache.ui.error(`Node "${nodeID}" already exists`);
        return;
      }
      this.addRow("Node", nodeID);
    }
    async addEdge() {
      if (typeof dataTable === "undefined") return;
      let edgeID = await Popup.prompt("Enter Edge ID: ");
      if (!edgeID) {
        this.cache.ui.info("Adding edge canceled");
        return;
      }
      if (this.cache.edgeRef.has(edgeID) || this.tableData.some((row) => row[2] === "Edge" && row[3] === edgeID)) {
        this.cache.ui.error(`Edge "${edgeID}" already exists`);
        return;
      }
      if (!edgeID.includes("::")) {
        this.cache.ui.error(`Edge ID must contain a double colon (::) to indicate the source and target nodes`);
        return;
      }
      const [source, target] = edgeID.split("::");
      const sourceExists = this.cache.nodeRef.has(source) || this.tableData.some((row) => row[2] === "Node" && row[3] === source);
      const targetExists = this.cache.nodeRef.has(target) || this.tableData.some((row) => row[2] === "Node" && row[3] === target);
      if (!sourceExists) {
        this.cache.ui.error(`Source node "${source}" does not exist. Please create the node first.`);
        return;
      }
      if (!targetExists) {
        this.cache.ui.error(`Target node "${target}" does not exist. Please create the node first.`);
        return;
      }
      this.addRow("Edge", edgeID);
    }
    addRow(type = "Node", id = "") {
      const newRow = new Array(this.headers.length).fill("");
      newRow[0] = "";
      newRow[1] = this.tableData.length > 0 ? Math.max(...this.tableData.map((row) => row[1])) + 1 : 1;
      newRow[2] = type;
      newRow[3] = id;
      newRow[4] = "";
      newRow[5] = "";
      this.tableData.push(newRow);
      this.originalOrder.push(this.originalOrder.length);
      this.trackChange(id, type);
      this.notifyPendingChanges();
      this.render();
    }
    trackChange(id, type) {
      const rowData = this.tableData.find((row) => row[3] === id && row[2] === type);
      if (rowData) {
        this.pendingChanges.set(id, { type, rowData: [...rowData] });
      }
    }
    removeRow(index) {
      if (index >= 0 && index < this.tableData.length) {
        this.tableData.splice(index, 1);
        this.originalOrder.splice(index, 1);
        this.originalOrder = this.originalOrder.map((idx) => idx > index ? idx - 1 : idx);
        this.render();
      }
    }
    clear() {
      this.tableData = [];
      this.headers = [];
      this.sortState = {};
      this.originalOrder = [];
      this.headerIndexMap.clear();
      this.render();
    }
    async update() {
      await this.cache.ui.showLoading("Updating Data", "Updating Data from Data Table ..");
      try {
        const updatedFileData = this.getUpdatedFileData();
        if (!updatedFileData || !updatedFileData.nodes && !updatedFileData.edges) {
          this.cache.ui.error("No data to update with.");
          return;
        }
        const validationErrors = this.validateNewElements();
        if (validationErrors.length > 0) {
          await this.cache.ui.hideLoading();
          this.cache.ui.error("Cannot apply changes:\n" + validationErrors.join("\n") + "\nPlease add at least one property to each new element.");
          return;
        }
        this.pendingChanges.clear();
        await this.cache.graph?.destroy();
        this.cache.graph = null;
        const status = document.getElementById("sidebarStatusContainer");
        status.innerHTML = "";
        status.style.height = "0";
        await this.cache.gcm.destroyGraphAndRollBackUI();
        this.cache.gcm.resetEventLocks();
        this.cache.io.preProcessData(updatedFileData);
        this.cache.initialize(updatedFileData);
        this.cache.ui.buildUI();
        await this.cache.gcm.createGraphInstance();
        await this.cache.graph.render();
        this.fileData = structuredClone(updatedFileData);
        this.loadTabData();
      } catch (err) {
        this.cache.ui.error(`Error updating graph: ${err}`);
      } finally {
        await this.cache.ui.hideLoading();
      }
    }
    validateNewElements() {
      const errors = [];
      this.pendingChanges.forEach((change, id) => {
        if (change.action === "delete") return;
        const row = change.rowData;
        if (!row) return;
        const type = row[2];
        const elementId = row[3];
        const isNew = type === "Node" ? !this.fileData.nodes?.some((n) => n.id === elementId) : !this.fileData.edges?.some((e) => e.id === elementId);
        if (!isNew) return;
        let hasProperty = false;
        for (let i = 6; i < row.length; i++) {
          const value = row[i];
          if (value !== null && value !== void 0 && String(value).trim() !== "") {
            hasProperty = true;
            break;
          }
        }
        if (!hasProperty) {
          errors.push(`\u2022 ${type} "${elementId}" requires at least one property value`);
        }
      });
      return errors;
    }
    getUpdatedFileData() {
      const result = {
        nodes: [],
        edges: [],
        nodeDataHeaders: [...this.fileData.nodeDataHeaders],
        edgeDataHeaders: [...this.fileData.edgeDataHeaders]
      };
      const allowedKeys = /* @__PURE__ */ new Set(["D4Data", "id", "label", "source", "style", "target", "description", "type"]);
      const processedIds = /* @__PURE__ */ new Set();
      const deletedIds = /* @__PURE__ */ new Set();
      this.pendingChanges.forEach((change, id) => {
        if (change.action === "delete") {
          deletedIds.add(id);
          processedIds.add(id);
        }
      });
      const processRow = (row) => {
        const isNode = row[2] === "Node";
        const id = row[3];
        if (processedIds.has(id)) return;
        processedIds.add(id);
        const label = row[4] || void 0;
        const description = row[5] || void 0;
        const elem = isNode ? this.cache.nodeRef.get(id) || this.createNode(id) : this.cache.edgeRef.get(id) || this.createEdge(id);
        const cleanElem = {};
        for (const key of allowedKeys) {
          if (elem.hasOwnProperty(key)) {
            cleanElem[key] = elem[key];
          }
        }
        if (label) cleanElem.label = label;
        if (description) cleanElem.description = description;
        if (isNode && label) {
          cleanElem.style.label = true;
          cleanElem.style.labelText = label;
        }
        cleanElem.D4Data = {};
        for (let i = 6; i < row.length; i++) {
          const value = row[i];
          if (value !== null && value !== void 0 && String(value).trim() !== "") {
            const headerName = this.headers[i];
            const [group, subGroup, prop] = StaticUtilities.decodePropHashId(headerName);
            if (!cleanElem.D4Data[group]) {
              cleanElem.D4Data[group] = {};
            }
            if (!cleanElem.D4Data[group][subGroup]) {
              cleanElem.D4Data[group][subGroup] = {};
            }
            cleanElem.D4Data[group][subGroup][prop] = isNaN(value) ? value : Number(value);
          }
        }
        isNode ? result.nodes.push(cleanElem) : result.edges.push(cleanElem);
      };
      const pendingNodes = [];
      const pendingEdges = [];
      this.pendingChanges.forEach((change, id) => {
        if (change.action !== "delete" && change.rowData) {
          if (change.type === "Node") {
            pendingNodes.push(change.rowData);
          } else if (change.type === "Edge") {
            pendingEdges.push(change.rowData);
          }
        }
      });
      pendingNodes.forEach((rowData) => processRow(rowData));
      pendingEdges.forEach((rowData) => processRow(rowData));
      if (this.fileData.nodes) {
        this.fileData.nodes.forEach((node) => {
          if (!processedIds.has(node.id) && !deletedIds.has(node.id)) {
            result.nodes.push(structuredClone(node));
            processedIds.add(node.id);
          }
        });
      }
      if (this.fileData.edges) {
        this.fileData.edges.forEach((edge) => {
          if (!processedIds.has(edge.id) && !deletedIds.has(edge.id)) {
            result.edges.push(structuredClone(edge));
            processedIds.add(edge.id);
          }
        });
      }
      const nodeIds = new Set(result.nodes.map((n) => n.id));
      result.edges = result.edges.filter((edge) => {
        if (!nodeIds.has(edge.source)) {
          console.warn(`Edge ${edge.id} references non-existent source node: ${edge.source}`);
          return false;
        }
        if (!nodeIds.has(edge.target)) {
          console.warn(`Edge ${edge.id} references non-existent target node: ${edge.target}`);
          return false;
        }
        return true;
      });
      return result;
    }
    createNode(id) {
      return {
        id,
        ...this.cache.style.getNodeStyleOrDefaults(id)
      };
    }
    createEdge(id) {
      const [source, target] = id.split("::");
      return {
        id,
        source,
        target,
        ...this.cache.style.getEdgeStyleOrDefaults(id)
      };
    }
    async exportToExcel() {
      await this.cache.ui.showLoading("Data Editor", "Exporting Table to Excel ..");
      try {
        const workbook = new ExcelJS.Workbook();
        let nodesToExport = [];
        let edgesToExport = [];
        switch (this.currentTab) {
          case "selectedNodes":
            nodesToExport = this.getNodesFromTableData();
            break;
          case "selectedEdges":
            edgesToExport = this.getEdgesFromTableData();
            break;
          case "selectedElements":
            nodesToExport = this.getNodesFromTableData();
            edgesToExport = this.getEdgesFromTableData();
            break;
          case "allNodes":
            nodesToExport = this.getNodesFromTableData();
            break;
          case "allEdges":
            edgesToExport = this.getEdgesFromTableData();
            break;
          case "entireGraph":
            nodesToExport = this.getNodesFromTableData();
            edgesToExport = this.getEdgesFromTableData();
            break;
        }
        if (nodesToExport.length > 0) {
          const nodesSheet = workbook.addWorksheet("nodes");
          const nodesHeader = [...EXCEL_NODE_PROPERTIES.map((p) => p.column), ...this.cache.nodeExclusiveProps];
          nodesSheet.addRow(nodesHeader);
          for (const node of nodesToExport) {
            const row = [];
            for (const prop of EXCEL_NODE_PROPERTIES) {
              const value = prop.get ? prop.get(node) : "";
              row.push(value);
            }
            for (const customProp of this.cache.nodeExclusiveProps) {
              const [group, subGroup, prop] = StaticUtilities.decodePropHashId(customProp);
              const value = node.D4Data && node.D4Data[group] && node.D4Data[group][subGroup] ? node.D4Data[group][subGroup][prop] : "";
              row.push(value);
            }
            nodesSheet.addRow(row);
          }
        }
        if (edgesToExport.length > 0) {
          const edgesSheet = workbook.addWorksheet("edges");
          const edgesHeader = [...EXCEL_EDGE_PROPERTIES.map((p) => p.column), ...this.cache.edgeExclusiveProps];
          edgesSheet.addRow(edgesHeader);
          for (const edge of edgesToExport) {
            const row = [];
            for (const prop of EXCEL_EDGE_PROPERTIES) {
              const value = prop.get ? prop.get(edge) : "";
              row.push(value);
            }
            for (const customProp of this.cache.edgeExclusiveProps) {
              const [group, subGroup, prop] = StaticUtilities.decodePropHashId(customProp);
              const value = edge.D4Data && edge.D4Data[group] && edge.D4Data[group][subGroup] ? edge.D4Data[group][subGroup][prop] : "";
              row.push(value);
            }
            edgesSheet.addRow(row);
          }
        }
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `graph_data_export_${this.currentTab}_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace(/:/g, "-")}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.cache.ui.info("Excel file exported successfully!");
      } catch (error) {
        this.cache.ui.error("Failed to export Excel file: " + error.message);
      } finally {
        await this.cache.ui.hideLoading();
      }
    }
    getNodesFromTableData() {
      const nodes = [];
      for (const row of this.tableData) {
        if (row[2] === "Node") {
          const nodeId = row[3];
          const node = this.cache.nodeRef.get(nodeId);
          if (node) {
            nodes.push(node);
          }
        }
      }
      return nodes;
    }
    getEdgesFromTableData() {
      const edges = [];
      for (const row of this.tableData) {
        if (row[2] === "Edge") {
          const edgeId = row[3];
          const edge = this.cache.edgeRef.get(edgeId);
          if (edge) {
            edges.push(edge);
          }
        }
      }
      return edges;
    }
    help() {
      this.cache.popup = new Popup(`<h2>Data Editor</h2>
<p>Explore and directly modify graph data through an interactive spreadsheet interface.</p>

<div class="alert-info">
  <strong>\u{1F4A1} Tip:</strong> All changes are staged until you click <span class="tooltip-dummy-buttons">\u2714 Apply</span>
</div>

<h3>Available Actions</h3>
<ul>
  <li><span class="tooltip-dummy-buttons">\u2714 Apply</span> \u2014 Apply the changes to the graph</li>
  <li><span class="tooltip-dummy-buttons pink">\u27F3 Reset</span> \u2014 Discard all changes and restore original data</li>
  <li><span class="tooltip-dummy-buttons blue"><strong>+</strong>&nbsp;Node</span> \u2014 Create a new node in the graph</li>
  <li><span class="tooltip-dummy-buttons blue"><strong>+</strong>&nbsp;Edge</span> \u2014 Create a new edge between existing nodes</li>
  <li><span class="tooltip-dummy-buttons green">\u2913 Export</span> \u2014 Save current view as an Excel file (disabled when no data is shown)</li>
</ul>

<h3>Working with the Editor</h3>
<ul>
  <li><strong>Sort columns:</strong> Click column headers to sort ascending/descending or restore original order</li>
  <li><strong>Edit cells:</strong> Click on editable cells to modify values (navigate with Tab/Shift+Tab/Enter/Escape)</li>
  <li><strong>Delete rows:</strong> Click the <span class="data-table-delete-row-btn tt">\xD7</span> button to remove nodes or edges</li>
  <li><strong>Add elements:</strong>
    <ul>
      <li>New nodes/edges must have at least one property value before applying</li>
      <li>Edge IDs must use the format: <code>sourceNode::targetNode</code></li>
      <li>Both source and target nodes must exist before creating an edge</li>
    </ul>
  </li>
  <li><strong>Tabs:</strong> Switch between different views (selected elements vs. all existing data)</li>
</ul>
`, { width: "50vw", height: "60vh", lineHeight: "1.5em" });
    }
  };
  function buildDataTable(fileData) {
    this.cache.dataTable.onPendingChangesUpdated(({ hasPendingChanges, hasChangesFromOriginal }) => {
      const applyBtn2 = document.getElementById("updateDataTableBtn");
      const resetBtn2 = document.getElementById("resetDataTableBtn");
      if (applyBtn2) {
        applyBtn2.disabled = !hasPendingChanges;
      }
      if (resetBtn2) {
        resetBtn2.disabled = !hasChangesFromOriginal;
      }
    });
    this.cache.dataTable.populateFromFileData(fileData);
    const applyBtn = document.getElementById("updateDataTableBtn");
    const resetBtn = document.getElementById("resetDataTableBtn");
    if (applyBtn) applyBtn.disabled = true;
    if (resetBtn) resetBtn.disabled = true;
  }

  // src/managers/io.js
  var excelData = { "s": { "readme": { "d": [[0, 0, "Color Codes Explained"], [0, 1, "Description"], [1, 0, "Required"], [1, 1, "Strictly required property"], [2, 0, "Optional"], [2, 1, "Optional property; Column name can not be re-used for user-defined data"], [3, 0, "User Data [group]"], [3, 1, 'Add custom properties in new columns. Use [brackets] for grouping (e.g., "Temperature [Celsius] [Physics]"). The last [bracket] becomes the group name.'], [5, 0, "Data Types Explained"], [5, 1, "Description"], [6, 0, "text"], [6, 1, "any text"], [7, 0, "number"], [7, 1, "whole decimal numbers or floating point numbers"], [8, 0, "boolean"], [8, 1, "true or TRUE or 1, false or FALSE or 0"], [9, 0, "RGBA"], [9, 1, "RGBA hex color code (e.g. #C33D3580 for 50% opacity) (last 2 digits are optional)"], [10, 0, "value 1 | value 2"], [10, 1, "List of categorical values of which one must be matched (excluding optional information in brackets)"], [11, 0, "any"], [11, 1, "Categorical view when text is given, slider-based view when numerical input is given"], [13, 0, "Node Properties Explained"], [13, 1, "Description"], [13, 2, "Default Value"], [13, 3, "Type"], [14, 0, "ID"], [14, 1, "Unique identifier for a node"], [14, 2, "-"], [14, 3, "text (unique)"], [15, 0, "Label"], [15, 1, "Label of the node; if no Label is given, the ID is displayed per default"], [15, 2, "-"], [15, 3, "text"], [16, 0, "Description"], [16, 1, "Description of the node, displayed in the tooltip text"], [16, 2, "-"], [16, 3, "text"], [17, 0, "Shape"], [17, 1, "The shape of the node"], [17, 2, "hexagon"], [17, 3, "circle (\u25CF) | diamond (\u25C6) | hexagon (\u2B22) | rect (\u25A0) | triangle (\u25B2) | star (\u2605)"], [18, 0, "Size"], [18, 1, "The size of the node"], [18, 2, "20"], [18, 3, "number"], [19, 0, "Fill Color"], [19, 1, "The fill color of the node in RGBA format (e.g. #FF000080 for a red node with 50% opacity)"], [19, 2, "#C33D35"], [19, 3, "rgba"], [20, 0, "Border Size"], [20, 1, "The stroke width"], [20, 2, "1"], [20, 3, "number"], [21, 0, "Border Color"], [21, 1, "The stroke color of the node in RGBA format"], [21, 2, "-"], [21, 3, "rgba"], [22, 0, "Label Font Size"], [22, 1, "Label font size"], [22, 2, "12"], [22, 3, "number"], [23, 0, "Label Placement"], [23, 1, "Label position relative to the main shape of the node"], [23, 2, "bottom"], [23, 3, "left | right | top | bottom | left-top | left-bottom | right-top | right-bottom | top-left | top-right | bottom-left | bottom-right | center"], [24, 0, "Label Color"], [24, 1, "The color of the nodes label"], [24, 2, "-"], [24, 3, "rgba"], [25, 0, "Label Background Color"], [25, 1, "Label background fill color"], [25, 2, "-"], [25, 3, "rgba"], [26, 0, "X Coordinate"], [26, 1, "The x coordinate of the node"], [26, 2, "-"], [26, 3, "number"], [27, 0, "Y Coordinate"], [27, 1, "The y coordinate of the node"], [27, 2, "-"], [27, 3, "number"], [28, 0, "property A [group A]"], [28, 1, "User-defined custom node properties"], [28, 2, "-"], [28, 3, "any"], [30, 0, "Edge Properties Explained"], [30, 1, "Description"], [30, 2, "Default Value"], [30, 3, "Type"], [31, 0, "Source ID"], [31, 1, "The ID of the source node"], [31, 2, "-"], [31, 3, "text"], [32, 0, "Target ID"], [32, 1, "The ID of the target node"], [32, 2, "-"], [32, 3, "text"], [33, 0, "Label"], [33, 1, "Label of the edge; if no Label is given, the edge is only visible as line without any text"], [33, 2, "-"], [33, 3, "text"], [34, 0, "Description"], [34, 1, "Description of the edge, displayed in the tooltip text"], [34, 2, "-"], [34, 3, "text"], [35, 0, "Type"], [35, 1, "The edge type"], [35, 2, "line"], [35, 3, "line | cubic | quadratic | polyline"], [36, 0, "Line Width"], [36, 1, "The border width of the edge"], [36, 2, "0.75"], [36, 3, "number"], [37, 0, "Line Dash"], [37, 1, "The dash offset of the edge line"], [37, 2, "0"], [37, 3, "number"], [38, 0, "Color"], [38, 1, "The stroke color of the edge in RGBA format"], [38, 2, "#403C5390"], [38, 3, "rgba"], [39, 0, "Label Font Size"], [39, 1, "The font size of the edges label"], [39, 2, "center"], [39, 3, "number"], [40, 0, "Label Placement"], [40, 1, "The position of the label relative to the edge"], [40, 2, "#000000"], [40, 3, "start | center | end"], [41, 0, "Label Auto Rotate"], [41, 1, "Whether to automatically rotate the label to match the edge\u2019s direction"], [41, 2, "1"], [41, 3, "boolean"], [42, 0, "Label Offset X"], [42, 1, "The offset of the label on the X-Axis"], [42, 2, "0"], [42, 3, "number"], [43, 0, "Label Offset Y"], [43, 1, "The offset of the label on the Y-Axis"], [43, 2, "0"], [43, 3, "number"], [44, 0, "Label Color"], [44, 1, "The color of the edges label text"], [44, 2, "-"], [44, 3, "rgba"], [45, 0, "Label Background Color"], [45, 1, "The color for the edge label\u2019s background"], [45, 2, "#E4E3EA"], [45, 3, "rgba"], [46, 0, "Start Arrow"], [46, 1, "Whether to display the start arrow on the edge"], [46, 2, { "formula": "FALSE()" }], [46, 3, "boolean"], [47, 0, "Start Arrow Size"], [47, 1, "The size of the start arrow"], [47, 2, "8"], [47, 3, "number"], [48, 0, "Start Arrow Type"], [48, 1, "The type of the start arrow"], [48, 2, "triangle"], [48, 3, "triangle | circle | diamond | vee | rect | triangleRect | simple"], [49, 0, "End Arrow"], [49, 1, "Whether to display the end arrow on the edge"], [49, 2, { "formula": "FALSE()" }], [49, 3, "boolean"], [50, 0, "End Arrow Size"], [50, 1, "The size of the end arrow"], [50, 2, "8"], [50, 3, "number"], [51, 0, "End Arrow Type"], [51, 1, "The type of the end arrow"], [51, 2, "triangle"], [51, 3, "triangle | circle | diamond | vee | rect | triangleRect | simple"]], "st": { "A1": 0, "B1": 0, "C1": 1, "D1": 2, "A2": 3, "B2": 2, "C2": 1, "D2": 2, "A3": 4, "B3": 2, "C3": 1, "D3": 2, "A4": 5, "B4": 2, "C4": 1, "D4": 2, "A5": 2, "B5": 2, "C5": 1, "D5": 2, "A6": 0, "B6": 0, "C6": 6, "D6": 7, "A7": 8, "B7": 2, "C7": 1, "D7": 2, "A8": 8, "B8": 2, "C8": 1, "D8": 2, "A9": 8, "B9": 2, "C9": 1, "D9": 2, "A10": 8, "B10": 2, "C10": 1, "D10": 2, "A11": 9, "B11": 2, "C11": 1, "D11": 2, "A12": 8, "B12": 2, "C12": 1, "D12": 2, "A13": 2, "B13": 2, "C13": 1, "D13": 2, "A14": 10, "B14": 10, "C14": 11, "D14": 10, "A15": 3, "B15": 2, "C15": 1, "D15": 2, "A16": 4, "B16": 2, "C16": 1, "D16": 2, "A17": 4, "B17": 2, "C17": 1, "D17": 2, "A18": 4, "B18": 2, "C18": 1, "D18": 12, "A19": 4, "B19": 2, "C19": 1, "D19": 2, "A20": 4, "B20": 2, "C20": 1, "D20": 2, "A21": 4, "B21": 2, "C21": 1, "D21": 2, "A22": 4, "B22": 2, "C22": 1, "D22": 2, "A23": 4, "B23": 2, "C23": 1, "D23": 2, "A24": 4, "B24": 2, "C24": 1, "D24": 12, "A25": 4, "B25": 2, "C25": 1, "D25": 2, "A26": 4, "B26": 2, "C26": 1, "D26": 2, "A27": 4, "B27": 2, "C27": 1, "D27": 2, "A28": 4, "B28": 2, "C28": 1, "D28": 2, "A29": 5, "B29": 2, "C29": 1, "D29": 2, "A30": 2, "B30": 2, "C30": 1, "D30": 2, "A31": 10, "B31": 10, "C31": 11, "D31": 10, "A32": 3, "B32": 2, "C32": 1, "D32": 2, "A33": 3, "B33": 2, "C33": 1, "D33": 2, "A34": 4, "B34": 2, "C34": 1, "D34": 2, "A35": 4, "B35": 2, "C35": 1, "D35": 2, "A36": 4, "B36": 2, "C36": 1, "D36": 12, "A37": 4, "B37": 2, "C37": 1, "D37": 2, "A38": 4, "B38": 2, "C38": 1, "D38": 2, "A39": 4, "B39": 2, "C39": 1, "D39": 2, "A40": 4, "B40": 2, "C40": 1, "D40": 2, "A41": 4, "B41": 2, "C41": 1, "D41": 12, "A42": 4, "B42": 2, "C42": 13, "D42": 2, "A43": 4, "B43": 2, "C43": 1, "D43": 2, "A44": 4, "B44": 2, "C44": 1, "D44": 2, "A45": 4, "B45": 2, "C45": 1, "D45": 2, "A46": 4, "B46": 2, "C46": 13, "D46": 2, "A47": 4, "B47": 2, "C47": 13, "D47": 2, "A48": 4, "B48": 2, "C48": 1, "D48": 2, "A49": 4, "B49": 2, "C49": 13, "D49": 12, "A50": 4, "B50": 2, "C50": 13, "D50": 2, "A51": 4, "B51": 2, "C51": 1, "D51": 14, "A52": 4, "B52": 2, "C52": 13, "D52": 12 }, "dim": [52, 4] }, "nodes": { "d": [[0, 0, "ID"], [0, 1, "Label"], [0, 2, "Description"], [0, 3, "Shape"], [0, 4, "Size"], [0, 5, "Fill Color"], [0, 6, "Border Color"], [0, 7, "Feature X [group A]"], [0, 8, "Feature Y [nm] [group A]"], [0, 9, "Feature Z [group B]"], [1, 0, "A"], [1, 1, "Node 1"], [1, 2, "The first node"], [1, 3, "circle"], [1, 4, "60"], [1, 5, "#403C53"], [1, 6, "#C33D35"], [1, 7, "1"], [1, 8, "foo"], [1, 9, "1"], [2, 0, "B"], [2, 1, "Node 2"], [2, 2, "The second node"], [2, 7, "0.5"], [2, 8, "foo"], [2, 9, "2"], [3, 0, "C"], [3, 1, "Node 3"], [3, 2, "The third node"], [3, 7, "1.1"], [3, 8, "foo"], [3, 9, "1"], [4, 0, "D"], [4, 1, "Node 4"], [4, 2, "The fourth node"], [4, 7, "1.3"], [4, 8, "bar"], [4, 9, "0"], [5, 0, "E"], [5, 7, "0"], [5, 8, "bar"], [5, 9, "-1"], [6, 0, "F"], [6, 1, "Lonely Node"], [6, 7, "-1"]], "st": { "A1": 3, "B1": 4, "C1": 4, "D1": 4, "E1": 4, "F1": 4, "G1": 4, "H1": 5, "I1": 5, "J1": 5, "A2": 15, "B2": 16, "C2": 16, "D2": 16, "E2": 16, "F2": 16, "G2": 16, "H2": 17, "I2": 17, "J2": 17, "A3": 15, "B3": 16, "C3": 16, "D3": 16, "E3": 16, "F3": 16, "G3": 16, "H3": 17, "I3": 17, "J3": 17, "A4": 15, "B4": 16, "C4": 16, "D4": 16, "E4": 16, "F4": 16, "G4": 16, "H4": 17, "I4": 17, "J4": 17, "A5": 15, "B5": 16, "C5": 16, "D5": 16, "E5": 16, "F5": 16, "G5": 16, "H5": 17, "I5": 17, "J5": 17, "A6": 15, "B6": 16, "C6": 16, "D6": 16, "E6": 16, "F6": 16, "G6": 16, "H6": 17, "I6": 17, "J6": 17, "A7": 15, "B7": 16, "C7": 16, "D7": 16, "E7": 16, "F7": 16, "G7": 16, "H7": 17, "I7": 17, "J7": 17 }, "dim": [7, 10] }, "edges": { "d": [[0, 0, "Source ID"], [0, 1, "Target ID"], [0, 2, "Color"], [0, 3, "Line Width"], [0, 4, "Label"], [0, 5, "Feature EX [group X]"], [0, 6, "Feature EY [group X]"], [0, 7, "Feature EZ [group Y]"], [1, 0, "A"], [1, 1, "B"], [1, 2, "#FF0000"], [1, 3, "0.75"], [1, 4, "foo"], [1, 5, "1"], [1, 6, "Dummy Category 1"], [1, 7, "1"], [2, 0, "A"], [2, 1, "C"], [2, 5, "0.5"], [2, 6, "Dummy Category 2"], [2, 7, "2"], [3, 0, "C"], [3, 1, "D"], [3, 5, "1.1"], [3, 6, "Dummy Category 3"], [3, 7, "1"], [4, 0, "D"], [4, 1, "E"], [4, 5, "1.3"], [4, 6, "Dummy Category 4"], [4, 7, "0"]], "st": { "A1": 3, "B1": 3, "C1": 4, "D1": 4, "E1": 4, "F1": 5, "G1": 5, "H1": 5, "A2": 15, "B2": 15, "C2": 16, "D2": 16, "E2": 16, "F2": 17, "G2": 17, "H2": 17, "A3": 15, "B3": 15, "C3": 16, "D3": 16, "E3": 16, "F3": 17, "G3": 17, "H3": 17, "A4": 15, "B4": 15, "C4": 16, "D4": 16, "E4": 16, "F4": 17, "G4": 17, "H4": 17, "A5": 15, "B5": 15, "C5": 16, "D5": 16, "E5": 16, "F5": 17, "G5": 17, "H5": 17 }, "dim": [5, 8] } }, "st": { "0": { "f": { "b": 1, "sz": 12, "n": "Arial" }, "fill": { "fg": "E4E3EA", "bg": "FEFFE1" }, "b": { "t": ["thin", "000000"], "b": ["thin", "000000"], "l": ["thin", "000000"], "r": ["thin", "000000"] }, "a": { "h": "general", "v": "bottom" }, "nf": "General" }, "1": { "f": { "sz": 10, "n": "Arial" }, "fill": { "p": "none" }, "a": { "h": "left", "v": "bottom" }, "nf": "General" }, "2": { "f": { "sz": 10, "n": "Arial" }, "fill": { "p": "none" }, "a": { "h": "general", "v": "bottom" }, "nf": "General" }, "3": { "f": { "b": 1, "sz": 10, "n": "Arial" }, "fill": { "fg": "FF9A9A", "bg": "FF8080" }, "b": { "t": ["thin", "000000"], "b": ["thin", "000000"], "l": ["thin", "000000"], "r": ["thin", "000000"] }, "a": { "h": "general", "v": "bottom" }, "nf": "General" }, "4": { "f": { "b": 1, "sz": 10, "n": "Arial" }, "fill": { "fg": "FEFFE1", "bg": "FFFFFF" }, "b": { "t": ["thin", "000000"], "b": ["thin", "000000"], "l": ["thin", "000000"], "r": ["thin", "000000"] }, "a": { "h": "general", "v": "bottom" }, "nf": "General" }, "5": { "f": { "b": 1, "sz": 10, "n": "Arial" }, "fill": { "fg": "81D41A", "bg": "969696" }, "b": { "t": ["thin", "000000"], "b": ["thin", "000000"], "l": ["thin", "000000"], "r": ["thin", "000000"] }, "a": { "h": "general", "v": "bottom" }, "nf": "General" }, "6": { "f": { "b": 1, "sz": 12, "n": "Arial" }, "fill": { "p": "none" }, "a": { "h": "left", "v": "bottom" }, "nf": "General" }, "7": { "f": { "b": 1, "sz": 12, "n": "Arial" }, "fill": { "p": "none" }, "a": { "h": "general", "v": "bottom" }, "nf": "General" }, "8": { "f": { "b": 1, "sz": 10, "n": "Arial" }, "fill": { "fg": "E4E3EA", "bg": "FEFFE1" }, "b": { "t": ["thin", "000000"], "b": ["thin", "000000"], "l": ["thin", "000000"], "r": ["thin", "000000"] }, "a": { "h": "general", "v": "bottom" }, "nf": "General" }, "9": { "f": { "b": 1, "i": 1, "sz": 10, "n": "Arial" }, "fill": { "fg": "E4E3EA", "bg": "FEFFE1" }, "b": { "t": ["thin", "000000"], "b": ["thin", "000000"], "l": ["thin", "000000"], "r": ["thin", "000000"] }, "a": { "h": "general", "v": "bottom" }, "nf": "General" }, "10": { "f": { "b": 1, "sz": 12, "n": "Arial" }, "fill": { "fg": "E4E3EA", "bg": "FEFFE1" }, "b": { "t": ["thin", "000000"], "b": ["thin", "000000"] }, "a": { "h": "general", "v": "bottom" }, "nf": "General" }, "11": { "f": { "b": 1, "sz": 12, "n": "Arial" }, "fill": { "fg": "E4E3EA", "bg": "FEFFE1" }, "b": { "t": ["thin", "000000"], "b": ["thin", "000000"] }, "a": { "h": "left", "v": "bottom" }, "nf": "General" }, "12": { "f": { "i": 1, "sz": 10, "n": "Arial" }, "fill": { "p": "none" }, "a": { "h": "general", "v": "bottom" }, "nf": "General" }, "13": { "f": { "sz": 10, "n": "Arial" }, "fill": { "p": "none" }, "a": { "h": "left", "v": "bottom" }, "nf": '"TRUE";"TRUE";"FALSE"' }, "14": { "f": { "u": 1, "sz": 10, "n": "Arial" }, "fill": { "p": "none" }, "a": { "h": "general", "v": "bottom" }, "nf": "General" }, "15": { "f": { "sz": 10, "n": "Arial" }, "fill": { "fg": "FF9A9A", "bg": "FF8080" }, "b": { "t": ["thin", "000000"], "b": ["thin", "000000"], "l": ["thin", "000000"], "r": ["thin", "000000"] }, "a": { "h": "general", "v": "bottom" }, "nf": "General" }, "16": { "f": { "sz": 10, "n": "Arial" }, "fill": { "fg": "FEFFE1", "bg": "FFFFFF" }, "b": { "t": ["thin", "000000"], "b": ["thin", "000000"], "l": ["thin", "000000"], "r": ["thin", "000000"] }, "a": { "h": "general", "v": "bottom" }, "nf": "General" }, "17": { "f": { "sz": 10, "n": "Arial" }, "fill": { "fg": "81D41A", "bg": "969696" }, "b": { "t": ["thin", "000000"], "b": ["thin", "000000"], "l": ["thin", "000000"], "r": ["thin", "000000"] }, "a": { "h": "general", "v": "bottom" }, "nf": "General" } }, "sc": 18 };
  var EXCEL_NODE_PROPERTIES = [
    {
      column: "ID",
      type: "str",
      required: true,
      get: (n) => {
        return n.id;
      }
    },
    {
      column: "Label",
      type: "str",
      apply: (n, v) => {
        n.label = v;
        n.style.label = false;
        n.style.labelText = v;
        n.style.labelFontSize = DEFAULTS.NODE.FONT_SIZE;
        n.style.labelFill = DEFAULTS.NODE.FOREGROUND_COLOR;
        n.style.labelBackground = DEFAULTS.NODE.BACKGROUND;
        n.style.labelBackgroundFill = DEFAULTS.NODE.BACKGROUND_COLOR;
        n.style.labelPlacement = DEFAULTS.NODE.PLACEMENT;
      },
      get: (n) => {
        return n.label;
      }
    },
    {
      column: "Description",
      type: "str",
      apply: (n, v) => {
        n.description = v;
      },
      get: (n) => {
        return n.description;
      }
    },
    {
      column: "Shape",
      type: "oneOf:circle|diamond|hexagon|rect|triangle|star",
      apply: (n, v) => {
        n.type = v;
      },
      get: (n) => {
        return n.type;
      }
    },
    {
      column: "Size",
      type: "num",
      apply: (n, v) => {
        n.style.size = v;
      },
      get: (n) => {
        return n.style.size;
      }
    },
    {
      column: "Fill Color",
      type: "rgba",
      apply: (n, v) => {
        n.style.fill = v;
      },
      get: (n) => {
        return n.style.fill;
      }
    },
    {
      column: "Border Size",
      type: "num",
      apply: (n, v) => {
        n.style.lineWidth = v;
      },
      get: (n) => {
        return n.style.lineWidth;
      }
    },
    {
      column: "Border Color",
      type: "rgba",
      apply: (n, v) => {
        n.style.stroke = v;
      },
      get: (n) => {
        return n.style.stroke;
      }
    },
    {
      column: "Label Font Size",
      type: "num",
      apply: (n, v) => {
        n.style.labelFontSize = v;
      },
      get: (n) => {
        return n.style.labelFontSize;
      }
    },
    {
      column: "Label Placement",
      type: "oneOf:left|right|top|bottom|left-top|left-bottom|right-top|right-bottom|top-left|top-right|bottom-left|bottom-right|center",
      apply: (n, v) => {
        n.style.labelPlacement = v;
      },
      get: (n) => {
        return n.style.labelPlacement;
      }
    },
    {
      column: "Label Color",
      type: "rgba",
      apply: (n, v) => {
        n.style.labelFill = v;
      },
      get: (n) => {
        return n.style.labelFill;
      }
    },
    {
      column: "Label Background Color",
      type: "rgba",
      apply: (n, v) => {
        n.style.labelBackground = true;
        n.style.labelBackgroundFill = v;
      },
      get: (n) => {
        return n.style.labelBackgroundFill;
      }
    },
    {
      column: "X Coordinate",
      type: "num",
      apply: (n, v) => {
        n.style.x = v;
      },
      get: (n) => {
        return n.style.x;
      }
    },
    {
      column: "Y Coordinate",
      type: "num",
      apply: (n, v) => {
        n.style.y = v;
      },
      get: (n) => {
        return n.style.y;
      }
    }
  ];
  var EXCEL_EDGE_PROPERTIES = [
    {
      column: "Source ID",
      type: "str",
      required: true,
      get: (e) => {
        return e.source;
      }
    },
    {
      column: "Target ID",
      type: "str",
      required: true,
      get: (e) => {
        return e.target;
      }
    },
    {
      column: "Label",
      type: "str",
      apply: (e, v) => {
        e.label = v;
        e.style.label = false;
        e.style.labelText = v;
        e.style.labelFontSize = DEFAULTS.EDGE.LABEL.FONT_SIZE;
        e.style.labelFill = DEFAULTS.EDGE.LABEL.FOREGROUND_COLOR;
        e.style.labelPlacement = DEFAULTS.EDGE.LABEL.PLACEMENT;
        e.style.labelAutoRotate = DEFAULTS.EDGE.LABEL.AUTO_ROTATE;
        e.style.labelBackground = DEFAULTS.EDGE.LABEL.BACKGROUND;
        e.style.labelBackgroundFill = DEFAULTS.EDGE.LABEL.BACKGROUND_COLOR;
      },
      get: (e) => {
        return e.label;
      }
    },
    {
      column: "Description",
      type: "str",
      apply: (e, v) => {
        e.description = v;
      },
      get: (e) => {
        return e.description;
      }
    },
    {
      column: "Type",
      type: "oneOf:line|cubic|quadratic|polyline",
      apply: (e, v) => {
        e.type = v;
      },
      get: (e) => {
        return e.type;
      }
    },
    {
      column: "Line Width",
      type: "num",
      apply: (e, v) => {
        e.style.lineWidth = v;
      },
      get: (e) => {
        return e.style.lineWidth;
      }
    },
    {
      column: "Line Dash",
      type: "num",
      apply: (e, v) => {
        e.style.lineDash = v;
      },
      get: (e) => {
        return e.style.lineDash;
      }
    },
    {
      column: "Color",
      type: "rgba",
      apply: (e, v) => {
        e.style.stroke = v;
      },
      get: (e) => {
        return e.style.stroke;
      }
    },
    {
      column: "Label Font Size",
      type: "num",
      apply: (e, v) => {
        e.style.labelFontSize = v;
      },
      get: (e) => {
        return e.style.labelFontSize;
      }
    },
    {
      column: "Label Placement",
      type: "oneOf:start|center|end",
      apply: (e, v) => {
        e.style.labelPlacement = v;
      },
      get: (e) => {
        return e.style.labelPlacement;
      }
    },
    {
      column: "Label Auto Rotate",
      type: "bool",
      apply: (e, v) => {
        e.style.labelAutoRotate = v;
      },
      get: (e) => {
        return e.style.labelAutoRotate;
      }
    },
    {
      column: "Label Offset X",
      type: "num",
      apply: (e, v) => {
        e.style.labelOffsetX = v;
      },
      get: (e) => {
        return e.style.labelOffsetX;
      }
    },
    {
      column: "Label Offset Y",
      type: "num",
      apply: (e, v) => {
        e.style.labelOffsetY = v;
      },
      get: (e) => {
        return e.style.labelOffsetY;
      }
    },
    {
      column: "Label Color",
      type: "rgba",
      apply: (e, v) => {
        e.style.labelFill = v;
      },
      get: (e) => {
        return e.style.labelFill;
      }
    },
    {
      column: "Label Background Color",
      type: "rgba",
      apply: (e, v) => {
        e.style.labelBackground = true;
        e.style.labelBackgroundFill = v;
      },
      get: (e) => {
        return e.style.labelBackgroundFill;
      }
    },
    {
      column: "Start Arrow",
      type: "bool",
      apply: (e, v) => {
        e.startArrow = v;
      },
      get: (e) => {
        return e.startArrow;
      }
    },
    {
      column: "Start Arrow Size",
      type: "num",
      apply: (e, v) => {
        e.startArrowSize = v;
      },
      get: (e) => {
        return e.startArrowSize;
      }
    },
    {
      column: "Start Arrow Type",
      type: "oneOf:triangle|circle|diamond|vee|rect|triangleRect|simple",
      apply: (e, v) => {
        e.startArrowType = v;
      },
      get: (e) => {
        return e.startArrowType;
      }
    },
    {
      column: "End Arrow",
      type: "bool",
      apply: (e, v) => {
        e.endArrow = v;
      },
      get: (e) => {
        return e.endArrow;
      }
    },
    {
      column: "End Arrow Size",
      type: "num",
      apply: (e, v) => {
        e.endArrowSize = v;
      },
      get: (e) => {
        return e.endArrowSize;
      }
    },
    {
      column: "End Arrow Type",
      type: "oneOf:triangle|circle|diamond|vee|rect|triangleRect|simple",
      apply: (e, v) => {
        e.endArrowType = v;
      },
      get: (e) => {
        return e.endArrowType;
      }
    },
    {
      column: "Halo Color",
      type: "rgba",
      apply: (e, v) => {
        e.style.halo = true;
        e.style.haloStroke = v;
      },
      get: (e) => {
        return e.style.haloStroke;
      }
    },
    {
      column: "Halo Width",
      type: "num",
      apply: (e, v) => {
        e.style.haloLineWidth = v;
      },
      get: (e) => {
        return e.style.haloLineWidth;
      }
    }
  ];
  var ExcelTemplate = class {
    constructor(compressedData) {
      this.compressed = compressedData;
    }
    createWorkbook(ExcelJS2) {
      const workbook = new ExcelJS2.Workbook();
      Object.entries(this.compressed.s).forEach(([sheetName, sheet]) => {
        const worksheet = workbook.addWorksheet(sheetName);
        sheet.d.forEach(([rowIndex, colIndex, value]) => {
          const cell = worksheet.getCell(rowIndex + 1, colIndex + 1);
          cell.value = value;
        });
        if (sheet.st) {
          Object.entries(sheet.st).forEach(([ref, styleId]) => {
            const cell = worksheet.getCell(ref);
            const style = this.compressed.st[styleId];
            if (style.f) {
              cell.font = {
                bold: style.f.b,
                italic: style.f.i,
                underline: style.f.u,
                strike: style.f.s,
                size: style.f.sz || 11,
                name: style.f.n || "Calibri",
                color: style.f.c && { argb: "FF" + style.f.c }
              };
            }
            if (style.fill) {
              cell.fill = {
                type: "pattern",
                pattern: style.fill.p || "solid",
                fgColor: style.fill.fg && { argb: "FF" + style.fill.fg },
                bgColor: style.fill.bg && { argb: "FF" + style.fill.bg }
              };
            }
            if (style.b) {
              const border = {};
              const sides = ["top", "bottom", "left", "right"];
              const keys = ["t", "b", "l", "r"];
              keys.forEach((key, idx) => {
                if (style.b[key]) {
                  border[sides[idx]] = {
                    style: style.b[key][0],
                    color: { argb: "FF" + style.b[key][1] }
                  };
                }
              });
              cell.border = border;
            }
            if (style.a) {
              cell.alignment = {
                horizontal: style.a.h,
                vertical: style.a.v,
                wrapText: style.a.w
              };
            }
            if (style.nf) {
              cell.numFmt = style.nf;
            }
          });
        }
      });
      return workbook;
    }
  };
  var IOManager = class {
    constructor(cache3) {
      this.cache = cache3;
    }
    parseJSON(file) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const jsonContent = JSON.parse(reader.result);
            if (!jsonContent.edges || !jsonContent.nodes) {
              this.cache.ui.error("File does not contain edges or nodes.");
              resolve(null);
            } else {
              resolve(jsonContent);
            }
          } catch (errorMsg) {
            this.cache.ui.error(`Failed to parse file as JSON: ${errorMsg}`);
            resolve(null);
          }
        };
        reader.onerror = () => {
          this.cache.ui.error(`Failed to load file: ${reader.error}`);
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
    async parseExcelToJson(file) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file);
      const nodesSheet = workbook.getWorksheet("nodes");
      const edgesSheet = workbook.getWorksheet("edges");
      if (!nodesSheet || !edgesSheet) {
        this.cache.ui.error('The Excel file must contain a "nodes" and "edges" sheet.');
        return;
      }
      function getOrNull(row, key) {
        const lowerCaseKey = key.toString().toLowerCase().trim();
        const value = row[Object.keys(row).find((key2) => key2.toLowerCase() === lowerCaseKey)];
        if (value && value.toString().trim() !== "") {
          return value;
        }
        return null;
      }
      function validateColumns(requiredColumns, firstRowKeys, sheetName) {
        for (const column of requiredColumns) {
          if (!firstRowKeys.includes(column)) {
            const origColumn = firstRowKeys.filter((k) => k.toLowerCase().trim() === column)[0];
            this.cache.ui.error(`The "${sheetName}" sheet must contain an "${origColumn}" column.`);
            return;
          }
        }
      }
      function sanitizeColumns(sheetJson, sheetDescriptor) {
        if (!sheetJson || sheetJson.length === 0) return;
        const firstRow = sheetJson[0];
        const columnMapping = {};
        Object.keys(firstRow).forEach((originalKey) => {
          if (originalKey.startsWith("__EMPTY")) return;
          if (originalKey.includes("(") || originalKey.includes(")")) {
            columnMapping[originalKey] = originalKey.replace(/\(/g, "[").replace(/\)/g, "]");
          }
        });
        sheetJson.forEach((row) => {
          Object.entries(columnMapping).forEach(([originalKey, sanitizedKey]) => {
            if (row.hasOwnProperty(originalKey)) {
              row[sanitizedKey] = row[originalKey];
              delete row[originalKey];
            }
          });
        });
        Object.entries(columnMapping).forEach(([original, sanitized]) => {
          this.cache.ui.warning(`Column "${original}" in "${sheetDescriptor}" sheet was renamed to "${sanitized}" for proper group parsing.`);
        });
      }
      function removeEmptyColumns(sheetJson, sheetDescriptor) {
        const propertyDefs = sheetDescriptor === "edges" ? EXCEL_EDGE_PROPERTIES : EXCEL_NODE_PROPERTIES;
        const requiredCols = propertyDefs.filter((prop) => prop.required).map((prop) => prop.column);
        const optionalCols = propertyDefs.filter((prop) => !prop.required).map((prop) => prop.column);
        const allCols = Object.keys(sheetJson[0]).filter((c) => !c.startsWith("__EMPTY") && c !== "__rowNum__");
        const isColumnEmpty = (col) => sheetJson.every((row) => {
          const v = row[col];
          return v === null || v.toString().trim() === "";
        });
        const emptyRequiredColumns = allCols.filter(
          (col) => requiredCols.includes(col) && isColumnEmpty(col)
        );
        const emptyOptionalColumns = allCols.filter(
          (col) => optionalCols.includes(col) && isColumnEmpty(col)
        );
        const emptyUserColumns = allCols.filter(
          (col) => !requiredCols.includes(col) && !optionalCols.includes(col) && isColumnEmpty(col)
        );
        emptyRequiredColumns.forEach((col) => {
          this.cache.ui.error(`Required column "${col}" in "${sheetDescriptor}" sheet is empty.`);
        });
        emptyOptionalColumns.forEach((col) => {
          this.cache.ui.info(`Optional column "${col}" in "${sheetDescriptor}" sheet is empty.`);
        });
        emptyUserColumns.forEach((col) => {
          this.cache.ui.warning(`User defined column "${col}" in "${sheetDescriptor}" sheet is empty.`);
        });
        const allEmptyColumns = [...emptyRequiredColumns, ...emptyOptionalColumns, ...emptyUserColumns];
        sheetJson.forEach((row) => {
          allEmptyColumns.forEach((col) => delete row[col]);
        });
      }
      function worksheetToJson(worksheet) {
        if (!worksheet) return [];
        const jsonData = [];
        const headers = [];
        const firstRow = worksheet.getRow(1);
        firstRow.eachCell((cell, colNumber) => {
          headers[colNumber] = cell.value;
        });
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return;
          const rowData = { __rowNum__: rowNumber - 2 };
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber];
            if (header) {
              rowData[header] = cell.value;
            }
          });
          const hasData = Object.values(rowData).some((val) => val !== null && val !== void 0 && val !== "");
          if (hasData) {
            jsonData.data.push(rowData);
          }
        });
        return { "headers": headers, "jsonData": jsonData };
      }
      const nodesDataDict = worksheetToJson(nodesSheet);
      const edgesDataDict = worksheetToJson(edgesSheet);
      const nodesData = nodesDataDict.jsonData;
      const edgesData = edgesDataDict.jsonData;
      if (nodesData.length === 0) {
        this.cache.ui.error('The "nodes" sheet is empty or invalid.');
        return;
      }
      if (edgesData.length === 0) {
        this.cache.ui.error('The "edges" sheet is empty or invalid.');
        return;
      }
      sanitizeColumns(nodesData, "nodes");
      sanitizeColumns(edgesData, "edges");
      removeEmptyColumns(nodesData, "nodes");
      removeEmptyColumns(edgesData, "edges");
      const firstNodeRowKeys = nodesDataDict.headers.map((k) => k.toLowerCase().trim());
      const requiredNodeColumns = EXCEL_NODE_PROPERTIES.filter((node) => node.required).map((node) => node.column.toLowerCase().trim());
      validateColumns(requiredNodeColumns, firstNodeRowKeys, "nodes");
      const firstEdgeRowKeys = edgesDataDict.headers.map((k) => k.toLowerCase().trim());
      const requiredEdgeColumns = EXCEL_EDGE_PROPERTIES.filter((edge) => edge.required).map((edge) => edge.column.toLowerCase().trim());
      validateColumns(requiredEdgeColumns, firstEdgeRowKeys, "edges");
      const nonDataNodeColumns = new Set(EXCEL_NODE_PROPERTIES.map((p) => p.column.toLowerCase().trim()));
      const nodeDataHeaders = nodesDataDict.headers.filter((k) => !nonDataNodeColumns.has(k.toLowerCase().trim()) && !k.startsWith("__EMPTY") && k !== "__rowNum__").map((k) => decodeKey(k));
      const nonDataEdgeColumns = new Set(EXCEL_EDGE_PROPERTIES.map((p) => p.column.toLowerCase().trim()));
      const edgeDataHeaders = edgesDataDict.headers.filter((k) => !nonDataEdgeColumns.has(k.toLowerCase().trim()) && !k.startsWith("__EMPTY") && k !== "__rowNum__").map((k) => decodeKey(k));
      function addNodeOrEdgeStyle(nodeOrEdge, row, propertyMap, descriptor) {
        nodeOrEdge.style = {};
        propertyMap.forEach(({ column, type, required, apply }) => {
          if (required) return;
          const rowNum = row.__rowNum__ + 1;
          if (!type) {
            this.cache.ui.warning(`Unsure how to validate ${descriptor} property ${column} in row ${rowNum}. 
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
                validated = StaticUtilities.isNumber(maybeValue);
                break;
              case "bool":
                validated = StaticUtilities.isBoolean(maybeValue);
                break;
              case "rgba":
                validated = StaticUtilities.isHexColor(maybeValue);
                break;
              case "list":
                validated = StaticUtilities.isInList(maybeValue, listValues);
                break;
              default:
                break;
            }
            if (!validated) {
              this.cache.ui.error(`${descriptor} property '${column}' in row ${rowNum} has an invalid value '${maybeValue}' and will be ignored (value must be of type '${type}').`);
            } else {
              apply(nodeOrEdge, maybeValue);
            }
          }
        });
      }
      function decodeKey(key) {
        let subGroup = this.cache.CFG.EXCEL_UNCATEGORIZED_SUBHEADER;
        let trimmedKey;
        const matches = key.match(/\[.*?\]/g);
        if (matches && matches.length >= 2) {
          const lastBracketContent = matches[matches.length - 1];
          subGroup = lastBracketContent.substring(1, lastBracketContent.length - 1).trim();
          const lastBracketIndex = key.lastIndexOf(matches[matches.length - 1]);
          trimmedKey = key.substring(0, lastBracketIndex).trim();
        } else if (matches && matches.length === 1) {
          const bracketContent = matches[0];
          subGroup = bracketContent.substring(1, bracketContent.length - 1).trim();
          trimmedKey = key.substring(0, key.indexOf("[")).trim();
        } else {
          trimmedKey = key.trim();
        }
        return { "subGroup": subGroup, "key": trimmedKey };
      }
      function validateUserData(row, key) {
        const val = row[key];
        if (val === null || val.toString().trim() === "") {
          return null;
        }
        return { "value": val, ...decodeKey(key) };
      }
      function addNodeOrEdgeUserData(nodeOrEdge, row, propertyMap, header, descriptor) {
        nodeOrEdge.D4Data = {
          [header]: {}
        };
        let propsAdded = 0;
        const reservedProperties = propertyMap.map((p) => p.column.toLowerCase().trim());
        for (let key in row) {
          if (key === "__rowNum__" || reservedProperties.includes(key.toLowerCase())) continue;
          const userData = validateUserData(row, key);
          if (!userData) continue;
          if (!nodeOrEdge.D4Data[header].hasOwnProperty(userData.subGroup)) {
            nodeOrEdge.D4Data[header][userData.subGroup] = {};
          }
          nodeOrEdge.D4Data[header][userData.subGroup][userData.key] = userData.value;
          propsAdded++;
        }
        if (propsAdded === 0) {
          this.cache.ui.warning(`${descriptor} in row ${row.__rowNum__} (${nodeOrEdge.id}) has no properties. 
      Added property 'exists' to enable display.`);
          nodeOrEdge.D4Data[header][this.cache.CFG.EXCEL_UNCATEGORIZED_SUBHEADER] = {
            "exists": true
          };
        }
      }
      const nodeIDs = /* @__PURE__ */ new Set();
      const parsedNodes = nodesData.map((row) => {
        const node = {};
        const nodeRowNum = row.__rowNum__ + 1;
        const descriptor = "Node";
        const nodeID = getOrNull(row, "ID");
        if (!nodeID) {
          this.cache.ui.warning(`Node in row ${nodeRowNum} does not contain an ID and will be skipped.`);
          return null;
        }
        if (nodeIDs.has(nodeID)) {
          this.cache.ui.warning(`Node in row ${nodeRowNum} (ID ${nodeID}) already exists and will be skipped.`);
          return null;
        }
        node.id = nodeID;
        nodeIDs.add(nodeID);
        addNodeOrEdgeStyle(node, row, EXCEL_NODE_PROPERTIES, descriptor);
        addNodeOrEdgeUserData(node, row, EXCEL_NODE_PROPERTIES, this.cache.CFG.EXCEL_NODE_HEADER, descriptor);
        return node;
      }).filter((node) => node !== null);
      const parsedEdges = edgesData.map((row) => {
        const edge = {};
        const edgeRowNum = row.__rowNum__ + 1;
        const descriptor = "Edge";
        const sourceID = getOrNull(row, "Source ID");
        if (!sourceID) {
          this.cache.ui.warning(`Edge in row ${edgeRowNum} does not contain a Source ID and will be skipped.`);
          return null;
        }
        if (!nodeIDs.has(sourceID)) {
          this.cache.ui.warning(`Edge in row ${edgeRowNum} has an invalid/missing Source ID (${sourceID}) and will be skipped.`);
          return null;
        }
        const targetID = getOrNull(row, "Target ID");
        if (!targetID) {
          this.cache.ui.warning(`Edge in row ${edgeRowNum} does not contain a Target ID and will be skipped.`);
          return null;
        }
        if (!nodeIDs.has(targetID)) {
          this.cache.ui.warning(`Edge in row ${edgeRowNum} has an invalid/missing Target ID (${targetID}) and will be skipped.`);
          return null;
        }
        edge.id = `${sourceID}::${targetID}`;
        edge.source = sourceID;
        edge.target = targetID;
        addNodeOrEdgeStyle(edge, row, EXCEL_EDGE_PROPERTIES, descriptor);
        addNodeOrEdgeUserData(edge, row, EXCEL_EDGE_PROPERTIES, this.cache.CFG.EXCEL_EDGE_HEADER, descriptor);
        return edge;
      }).filter((edge) => edge !== null);
      return {
        nodes: parsedNodes,
        edges: parsedEdges,
        nodeDataHeaders,
        edgeDataHeaders
      };
    }
    async downloadExcelTemplate() {
      const template = new ExcelTemplate(excelData);
      const workbook = template.createWorkbook(ExcelJS);
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "GLL_template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    }
    preProcessData(fileData) {
      this.cache.construct();
      const getDefaultFilterObject = () => {
        let obj = {
          active: true,
          lowerThreshold: Infinity,
          upperThreshold: -Infinity,
          isInverted: false,
          isCategory: false,
          categories: /* @__PURE__ */ new Set()
        };
        for (let group of this.cache.bs.traverseBubbleSets()) {
          obj[`${group}Members`] = /* @__PURE__ */ new Set();
          obj[`${group}MembersHidden`] = /* @__PURE__ */ new Set();
          obj[`${group}IDs`] = /* @__PURE__ */ new Set();
          obj[`${group}IDsHidden`] = /* @__PURE__ */ new Set();
        }
        return obj;
      };
      const populateFilterPropsLowsAndHighs = (propHash, nodeOrEdgeValue) => {
        if (!this.cache.data.filterDefaults.get(propHash)) {
          this.cache.data.filterDefaults.set(propHash, getDefaultFilterObject());
        }
        if (nodeOrEdgeValue === "") {
          return;
        }
        if (isNaN(nodeOrEdgeValue)) {
          if (this.cache.data.filterDefaults.get(propHash).lowerThreshold !== Infinity) {
            let [section, subSection, prop] = StaticUtilities.decodePropHashId(propHash);
            this.cache.ui.warning(`Property ${prop} (section ${section} sub-section ${subSection} contains both numeric and 
        categorical values. To proceed, please use a single data type. Property has been excluded.`);
            this.cache.data.filterDefaults.delete(propHash);
            return;
          }
          this.cache.data.filterDefaults.get(propHash).isCategory = true;
          this.cache.data.filterDefaults.get(propHash).categories.add(nodeOrEdgeValue);
          return;
        }
        this.cache.data.filterDefaults.get(propHash).lowerThreshold = Math.min(nodeOrEdgeValue, this.cache.data.filterDefaults.get(propHash).lowerThreshold);
        this.cache.data.filterDefaults.get(propHash).upperThreshold = Math.max(nodeOrEdgeValue, this.cache.data.filterDefaults.get(propHash).upperThreshold);
      };
      this.cache.CFG.HIDE_LABELS = fileData.nodes.length > this.cache.CFG.MAX_NODES_BEFORE_HIDING_LABELS;
      this.cache.CFG.DISABLE_HOVER_EFFECT = fileData.nodes.length > this.cache.CFG.MAX_NODES_BEFORE_DISABLING_HOVER_EFFECT;
      this.cache.CFG.AVOID_MEMBERS_IN_BUBBLE_GROUPS = fileData.nodes.length > this.cache.CFG.MAX_NODES_BEFORE_DISABLING_AVOID_MEMBERS_IN_BUBBLE_GROUPS;
      this.cache.nodePositionsFromExcelImport = /* @__PURE__ */ new Map();
      if (fileData.nodeDataHeaders) {
        for (const nodeHeader of fileData.nodeDataHeaders) {
          const nodePropHash = StaticUtilities.generatePropHashId(this.cache.CFG.EXCEL_NODE_HEADER, nodeHeader.subGroup, nodeHeader.key);
          this.cache.data.filterDefaults.set(nodePropHash, getDefaultFilterObject());
        }
      }
      if (fileData.edgeDataHeaders) {
        for (const edgeHeader of fileData.edgeDataHeaders) {
          const edgePropHash = StaticUtilities.generatePropHashId(this.cache.CFG.EXCEL_EDGE_HEADER, edgeHeader.subGroup, edgeHeader.key);
          this.cache.data.filterDefaults.set(edgePropHash, getDefaultFilterObject());
        }
      }
      this.cache.data.nodes = fileData.nodes.map((node) => {
        const nodeFeatures = /* @__PURE__ */ new Set();
        const nodeFeatureValues = /* @__PURE__ */ new Map();
        const nodeFeatureWithinThreshold = /* @__PURE__ */ new Map();
        for (let [section, subsection, prop, data] of this.cache.gcm.traverseD4Data(node)) {
          let propId = StaticUtilities.generatePropHashId(section, subsection, prop);
          nodeFeatures.add(propId);
          if (isNaN(data)) {
            if (!nodeFeatureValues.has(propId)) {
              nodeFeatureValues.set(propId, /* @__PURE__ */ new Set());
            }
            nodeFeatureValues.get(propId).add(data);
          } else {
            nodeFeatureValues.set(propId, data);
          }
          nodeFeatureWithinThreshold.set(propId, null);
          populateFilterPropsLowsAndHighs(propId, data);
        }
        if (node.style?.x && node.style?.y) {
          this.cache.nodePositionsFromExcelImport.set(node.id, { x: node.style.x, y: node.style.y });
        }
        return {
          ...node,
          ...this.cache.style.getNodeStyleOrDefaults(node),
          originalStyle: structuredClone(this.cache.style.getNodeStyleOrDefaults(node).style),
          features: nodeFeatures,
          featureValues: nodeFeatureValues,
          featureIsWithinThreshold: nodeFeatureWithinThreshold
        };
      });
      this.cache.data.edges = fileData.edges.map((edge) => {
        const edgeFeatures = /* @__PURE__ */ new Set();
        const edgeFeatureValues = /* @__PURE__ */ new Map();
        const edgeFeatureWithinThreshold = /* @__PURE__ */ new Map();
        for (let [section, subsection, prop, data] of this.cache.gcm.traverseD4Data(edge)) {
          let propId = StaticUtilities.generatePropHashId(section, subsection, prop);
          edgeFeatures.add(propId);
          if (isNaN(data)) {
            if (!edgeFeatureValues.has(propId)) {
              edgeFeatureValues.set(propId, /* @__PURE__ */ new Set());
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
          ...this.cache.style.getEdgeStyleOrDefaults(edge),
          originalStyle: structuredClone(this.cache.style.getEdgeStyleOrDefaults(edge).style),
          features: edgeFeatures,
          featureValues: edgeFeatureValues,
          featureIsWithinThreshold: edgeFeatureWithinThreshold
        };
      });
      this.cache.data.bubbleSetStyle = fileData.bubbleSetStyle || this.cache.DEFAULTS.BUBBLE_GROUP_STYLE;
      const excelHasCoordinates = this.cache.nodePositionsFromExcelImport.size > 0;
      this.cache.data.selectedLayout = fileData.selectedLayout || (excelHasCoordinates ? this.cache.DEFAULTS.CUSTOM_LAYOUT_NAME : this.cache.DEFAULTS.LAYOUT);
      if (fileData.layouts) {
        this.cache.data.layouts = this.cache.lm.parseLayouts(fileData.layouts);
        if (fileData.selectedLayout === this.cache.DEFAULTS.CUSTOM_LAYOUT_NAME) {
          this.cache.EVENT_LOCKS.TRIGGER_SET_LAYOUT_ONCE = true;
        }
      } else {
        this.cache.data.layouts = Object.keys(this.cache.DEFAULTS.LAYOUT_INTERNALS).reduce((acc, key) => {
          if (this.cache.data?.layouts?.[key]) {
            this.cache.ui.warning("Layout with key '" + key + "' already exists.");
            return acc;
          } else {
            acc[key] = this.cache.lm.createDefaultLayout(key, false);
            return acc;
          }
        }, {});
        if (excelHasCoordinates) {
          this.cache.data.layouts[this.cache.DEFAULTS.CUSTOM_LAYOUT_NAME] = this.cache.lm.createDefaultLayout(this.cache.DEFAULTS.CUSTOM_LAYOUT_NAME, true);
          this.cache.EVENT_LOCKS.TRIGGER_SET_LAYOUT_ONCE = true;
        }
      }
      if (fileData.stash) {
        this.cache.data.stash = Object.fromEntries(
          Object.entries(fileData.stash || {}).map(([key, value]) => [
            key,
            {
              ...value,
              ...this.parseGroups(value)
            }
          ])
        );
      } else {
        this.cache.data.stash = {};
      }
      this.cache.initialize();
      this.cache.ui.debug("Done pre-processing data");
    }
    async exportGraphAsJSON() {
      if (this.cache.data === null) {
        this.cache.ui.error("No graph data to save.");
        return false;
      }
      function replacer(key, value) {
        if (value instanceof Map) return Object.fromEntries(value);
        if (value instanceof Set) return [...value];
        return value;
      }
      await this.cache.ui.showLoading("Exporting graph ..");
      await new Promise((resolve) => requestAnimationFrame(resolve));
      if (!this.cache.data.nodeDataHeaders) {
        this.cache.data.nodeDataHeaders = [];
      }
      if (!this.cache.data.edgeDataHeaders) {
        this.cache.data.edgeDataHeaders = [];
      }
      for (const filterDefaultKey of this.cache.data.filterDefaults.keys()) {
        const [nodeOrEdge, subGroup, key] = StaticUtilities.decodePropHashId(filterDefaultKey);
        const targetList = nodeOrEdge === this.cache.CFG.EXCEL_NODE_HEADER ? this.cache.data.nodeDataHeaders : this.cache.data.edgeDataHeaders;
        const elem = { subGroup, key };
        if (!targetList.includes(elem)) {
          targetList.push(elem);
        }
      }
      const blob = new Blob([JSON.stringify(this.cache.data, replacer)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "this.cache.graph.json";
      a.click();
      URL.revokeObjectURL(url);
      await this.cache.ui.hideLoading();
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    parseGroups(filterValue) {
      const groupData = {
        categories: new Set(filterValue?.categories || [])
      };
      for (let group of this.cache.bs.traverseBubbleSets()) {
        groupData[`${group}Members`] = new Set(filterValue[`${group}Members`] || []);
        groupData[`${group}IDs`] = new Set(filterValue[`${group}IDs`] || []);
        groupData[`${group}MembersHidden`] = new Set(filterValue[`${group}MembersHidden`] || []);
        groupData[`${group}IDsHidden`] = new Set(filterValue[`${group}IDsHidden`] || []);
      }
      return groupData;
    }
    parseLayouts(jsonLayouts) {
      const parsedLayouts = {};
      Object.entries(jsonLayouts).forEach(([key, layout]) => {
        parsedLayouts[key] = {
          internals: layout.internals || null,
          positions: new Map(Object.entries(layout.positions || {})),
          filters: this.parseFiltersAsMap(layout.filters),
          isCustom: layout.isCustom || false,
          query: layout["query"] || void 0
        };
        for (let group of this.cache.bs.traverseBubbleSets()) {
          parsedLayouts[key][`${group}Props`] = new Set(layout[`${group}Props`] || []);
        }
      });
      return parsedLayouts;
    }
    parseFiltersAsMap(filtersObj) {
      if (filtersObj instanceof Map) {
        return structuredClone(filtersObj);
      }
      return new Map(Object.entries(filtersObj || {}).map(([key, value]) => [key, { ...value, ...this.parseGroups(value) }]));
    }
    loadFile(event) {
      const file = event.target.files[0];
      if (!file) {
        this.cache.ui.error("No file selected.");
        return Promise.resolve(null);
      }
      const fileType = file.name.split(".").pop().toLowerCase();
      try {
        switch (fileType) {
          case "json":
            return this.parseJSON(file);
          case "xls":
          case "xlsx":
          case "ods":
            return file.arrayBuffer().then((buffer) => {
              return this.parseExcelToJson(buffer);
            }).catch((errorMsg) => {
              this.cache.ui.error(`Error reading Excel file: ${errorMsg}`);
              return null;
            });
          default:
            this.cache.ui.error(`Unsupported file type: ${fileType}`);
        }
      } catch (errorMsg) {
        this.cache.ui.error(`Failed to load file: ${errorMsg}`);
      }
      event.target.value = "";
    }
    async loadFileWrapper(event) {
      let file = event.target.files[0];
      if (!file) return;
      await this.cache.ui.showLoading("Loading", `Loading ${file.name} (${file.type} with ${StaticUtilities.humanFileSize(file.size)})`);
      await new Promise((resolve) => requestAnimationFrame(resolve));
      if (graph) {
        await this.cache.gcm.destroyGraphAndRollBackUI();
      }
      this.cache.io.loadFile(event).then(async (fileData) => {
        if (!fileData) {
          this.cache.ui.error("File data is empty.");
          await this.cache.ui.hideLoading();
          await new Promise((resolve) => requestAnimationFrame(resolve));
          return;
        }
        this.cache.io.preProcessData(fileData);
        buildDataTable(fileData);
        this.cache.initialize();
        this.cache.ui.buildUI();
        await this.cache.gcm.createGraphInstance();
        if (!graph) {
          this.cache.ui.error("Graph not initialized, aborting.");
          await this.cache.ui.hideLoading();
          await new Promise((resolve) => requestAnimationFrame(resolve));
          return;
        }
        await this.cache.graph.render();
        await this.cache.graph.fitView();
        this.cache.ui.debug("Initial graph rendered.");
      }).catch(async (errorMsg) => {
        this.cache.ui.error(`Error loading graph: ${errorMsg}`);
        await this.cache.ui.hideLoading();
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }).finally(async () => {
        await this.cache.ui.hideLoading();
        await new Promise((resolve) => requestAnimationFrame(resolve));
      });
    }
    async exportPNG() {
      try {
        await this.cache.ui.showLoading("Loading", "Generating picture data");
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const imageData = this.cache.graph.toDataURL({
          type: "image/png",
          mode: "viewport"
        });
        const link = document.createElement("a");
        link.href = imageData;
        link.download = "this.cache.graph.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        await this.cache.ui.hideLoading();
        await new Promise((resolve) => requestAnimationFrame(resolve));
      } catch (errorMsg) {
        await this.cache.ui.hideLoading();
        await new Promise((resolve) => requestAnimationFrame(resolve));
        this.cache.ui.error(errorMsg);
      }
    }
  };

  // src/managers/metrics.js
  var NODE_CONNECTIVITY_METRICS_PRECISION = 5;
  var metrics = {
    centrality: {
      id: "centrality",
      label: "Degree Centrality",
      calculate: async (cache3) => await calculateDegreeCentrality(cache3)
    },
    betweenness: {
      id: "betweenness",
      label: "Betweenness Centrality",
      calculate: async (cache3) => await calculateBetweennessCentrality(cache3)
    },
    closeness: {
      id: "closeness",
      label: "Closeness Centrality",
      calculate: async (cache3) => await calculateClosenessCentrality(cache3)
    },
    eigenvector: {
      id: "eigenvector",
      label: "Eigenvector Centrality",
      calculate: async (cache3) => await calculateEigenvectorCentrality(cache3)
    },
    pagerank: { id: "pagerank", label: "PageRank", calculate: async (cache3) => await calculatePageRank(cache3) }
  };
  var NetworkMetrics = class {
    constructor(cache3) {
      this.selected = "centrality";
      this.multiselect = null;
      this.table = null;
      this.m = metrics;
      this.collapsed = false;
      this.cache = cache3;
      this.selectBtns = {
        "Add to Selection": async () => this.updateSelectedNodes(true),
        "Remove from Selection": async () => this.updateSelectedNodes(false)
      };
    }
    toggleUI() {
      const panel = document.getElementById("networkMetricsContainer");
      const willOpen = panel.classList.toggle("open");
      const fullHeight = panel.scrollHeight + "px";
      panel.style.maxHeight = fullHeight;
      const btn = document.getElementById("metricsToggleBtn");
      requestAnimationFrame(() => {
        panel.style.maxHeight = willOpen ? fullHeight : "0";
      });
      if (willOpen) {
        panel.addEventListener(
          "transitionend",
          () => panel.style.maxHeight = "none",
          { once: true }
        );
        btn.classList.add("highlight");
      } else {
        btn.classList.remove("highlight");
      }
      this.collapsed = !willOpen;
    }
    async updateUI() {
      if (!this.cache.visibleElementsChanged) return;
      const metricName = this.m[this.selected].label;
      await this.cache.ui.showLoading("Calculating", `Network Metric: ${metricName}`);
      await new Promise((resolve) => requestAnimationFrame(resolve));
      this.resetNodeToolTipMetricTexts();
      const metricResult = await this.m[this.selected]?.calculate();
      const selectedValues = Array.from(this.multiselect.selectedOptions, (opt) => opt.value);
      this.multiselect.innerHTML = "";
      for (const ns of metricResult.scores) {
        const opt = document.createElement("option");
        opt.value = ns.id;
        opt.textContent = `${ns.id} | ${ns.text}`;
        opt.selected = selectedValues.includes(ns.id);
        this.updateNodeToolTipMetricText(ns.id, metricName, ns.text);
        this.multiselect.appendChild(opt);
      }
      this.table.innerHTML = "";
      Object.entries(metricResult.graphLevelMetrics).forEach(([label, value]) => {
        const row = document.createElement("tr");
        const labelCell = document.createElement("td");
        labelCell.textContent = label;
        const valueCell = document.createElement("td");
        valueCell.textContent = `${value}`;
        row.append(labelCell, valueCell);
        this.table.appendChild(row);
      });
      document.getElementById("metricInfoBtn").onclick = () => {
        this.cache.popup = new Popup(metricResult.popupContent);
      };
      await this.cache.ui.hideLoading();
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    resetNodeToolTipMetricTexts() {
      for (const nodeID of this.cache.toolTips.keys()) {
        this.updateNodeToolTipMetricText(nodeID, void 0, void 0, true);
      }
    }
    updateNodeToolTipMetricText(nodeId = void 0, header = void 0, text = void 0, reset = false) {
      const tooltip = this.cache.toolTips.get(nodeId);
      if (!tooltip) return;
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = tooltip;
      const metricWrapper = tempDiv.querySelector(".tooltip-metric-wrapper");
      if (!metricWrapper) return;
      const metricContent = metricWrapper.querySelector(".tooltip-metric-content");
      if (!metricContent) return;
      const metricHeader = metricWrapper.querySelector(".tooltip-metric-header");
      if (!metricHeader) return;
      if (reset) {
        metricWrapper.classList.remove("visible");
        metricContent.textContent = "";
        metricHeader.textContent = "";
      } else {
        metricWrapper.classList.add("visible");
        metricContent.textContent = text;
        metricHeader.textContent = header;
      }
      this.cache.toolTips.set(nodeId, tempDiv.innerHTML);
    }
    buildUI() {
      const container = document.createElement("div");
      container.className = "nw-root";
      container.id = "networkMetricsContainer";
      const div = document.createElement("div");
      div.className = "nw-div";
      const header = document.createElement("h3");
      header.textContent = "Network Metrics";
      div.appendChild(header);
      const dropdownContainer = document.createElement("div");
      dropdownContainer.className = "nw-metric-select-container";
      const dropdown = document.createElement("select");
      dropdown.className = "nw-metric-select";
      Object.values(this.m).forEach((metric) => {
        const opt = document.createElement("option");
        opt.value = metric.id;
        opt.textContent = metric.label;
        opt.selected = metric.id === this.selected;
        dropdown.appendChild(opt);
      });
      dropdown.addEventListener("change", async (e) => {
        this.selected = e.target.value;
        await this.updateUI();
      });
      dropdownContainer.appendChild(dropdown);
      const infoBtn = document.createElement("button");
      infoBtn.className = "info-btn";
      infoBtn.textContent = "\u{1F6C8}";
      infoBtn.id = "metricInfoBtn";
      dropdownContainer.appendChild(infoBtn);
      div.append(dropdownContainer);
      this.multiselect = document.createElement("select");
      this.multiselect.className = "nw-node-multiselect";
      this.multiselect.multiple = true;
      this.multiselect.id = "metricsMultiselect";
      div.appendChild(this.multiselect);
      const buttonRow = document.createElement("div");
      Object.entries(this.selectBtns).forEach(([text, cb]) => {
        const btn = document.createElement("button");
        btn.textContent = text;
        btn.className = "nw-button";
        btn.onclick = cb;
        buttonRow.appendChild(btn);
      });
      div.appendChild(buttonRow);
      div.appendChild(document.createElement("hr"));
      const tHeader = document.createElement("p");
      tHeader.className = "nw-subheader";
      tHeader.textContent = "Graph Level Metrics";
      div.appendChild(tHeader);
      this.table = document.createElement("table");
      this.table.className = "nw-graph-metrics-table";
      div.appendChild(this.table);
      div.appendChild(document.createElement("hr"));
      container.appendChild(div);
      return container;
    }
    async updateSelectedNodes(add) {
      const ids = Array.from(
        this.multiselect.selectedOptions,
        (opt) => opt.value
      );
      if (ids.length) {
        const nodeData = await this.cache.graph.getNodeData(ids);
        await this.cache.sm.updateSelectedState(nodeData, add);
        if (add) {
          this.cache.selectedNodes = [.../* @__PURE__ */ new Set([...this.cache.selectedNodes, ...ids])];
        } else {
          this.cache.selectedNodes = this.cache.selectedNodes.filter((id) => !ids.includes(id));
        }
      }
    }
  };
  async function calculateDegreeCentrality(cache3) {
    const { nodeIDsToBeShown: nodes, edgeIDsToBeShown: edges, edgeRef } = cache3;
    const n = nodes.size;
    if (n === 0) {
      return { scores: [], graphLevelMetrics: {} };
    }
    const degree = /* @__PURE__ */ new Map();
    for (const id of nodes) degree.set(id, 0);
    for (const edgeId of edges) {
      const { source, target } = edgeRef.get(edgeId);
      if (degree.has(source)) degree.set(source, degree.get(source) + 1);
      if (degree.has(target)) degree.set(target, degree.get(target) + 1);
    }
    const scores = [];
    let sum = 0, min = Infinity, max = -Infinity;
    for (const [id, d] of degree) {
      const c = d / (n - 1);
      scores.push({ id, degree: d, centrality: c });
      sum += c;
      if (c < min) min = c;
      if (c > max) max = c;
    }
    scores.sort((a, b) => b.centrality - a.centrality);
    const median = scores[Math.floor(n / 2)].centrality;
    const mean = sum / n;
    const centralization = n > 2 ? scores.reduce((acc, s) => acc + (max - s.centrality), 0) / ((n - 1) * (n - 2)) : 0;
    return {
      scores: scores.map((s) => ({
        id: s.id,
        text: `Degree ${s.degree} | Centrality ${s.centrality.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION)} (${Math.round(s.centrality / max * 100)} %)`
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
<p><strong>Graph Density:</strong> Fraction of realised edges out of all possible edges (0&nbsp;\u2013&nbsp;1).</p>
<p><strong>Centralization:</strong> Freeman degree-centralization \u2014 how strongly the network is dominated by its most connected node (0&nbsp;=&nbsp;even, 1&nbsp;=&nbsp;perfect star).</p>
</div>`
    };
  }
  async function calculateBetweennessCentrality(cache3) {
    const { nodeIDsToBeShown: nodes, edgeIDsToBeShown: edges, edgeRef } = cache3;
    const n = nodes.size;
    if (n === 0) {
      return { scores: [], graphLevelMetrics: {} };
    }
    const adjacencyMap = /* @__PURE__ */ new Map();
    for (const id of nodes) adjacencyMap.set(id, /* @__PURE__ */ new Set());
    for (const edgeId of edges) {
      const { source, target } = edgeRef.get(edgeId);
      if (adjacencyMap.has(source)) adjacencyMap.get(source).add(target);
      if (adjacencyMap.has(target)) adjacencyMap.get(target).add(source);
    }
    const betweenness = /* @__PURE__ */ new Map();
    for (const id of nodes) betweenness.set(id, 0);
    for (const source of nodes) {
      const distance = /* @__PURE__ */ new Map();
      const paths = /* @__PURE__ */ new Map();
      const queue = [];
      const stack = [];
      distance.set(source, 0);
      paths.set(source, 1);
      queue.push(source);
      while (queue.length > 0) {
        const node = queue.shift();
        stack.push(node);
        for (const neighbor of adjacencyMap.get(node)) {
          if (!distance.has(neighbor)) {
            queue.push(neighbor);
            distance.set(neighbor, distance.get(node) + 1);
            paths.set(neighbor, paths.get(node));
          } else if (distance.get(neighbor) === distance.get(node) + 1) {
            paths.set(neighbor, paths.get(neighbor) + paths.get(node));
          }
        }
      }
      const dependency = /* @__PURE__ */ new Map();
      for (const node of nodes) dependency.set(node, 0);
      while (stack.length > 0) {
        const node = stack.pop();
        if (node === source) continue;
        for (const neighbor of adjacencyMap.get(node)) {
          if (distance.get(neighbor) === distance.get(node) - 1) {
            const coeff = paths.get(neighbor) / paths.get(node) * (1 + dependency.get(node));
            dependency.set(neighbor, dependency.get(neighbor) + coeff);
          }
        }
        betweenness.set(node, betweenness.get(node) + dependency.get(node) / 2);
      }
    }
    const scores = [];
    let max = -Infinity;
    const normalizationFactor = (n - 1) * (n - 2) / 2;
    for (const [id, score] of betweenness) {
      const normalizedScore = score / normalizationFactor;
      scores.push({ id, score: normalizedScore });
      if (normalizedScore > max) max = normalizedScore;
    }
    scores.sort((a, b) => b.score - a.score);
    const centralityValues = scores.map((s) => s.score);
    const sum = centralityValues.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const min = Math.min(...centralityValues);
    const centralization = scores.reduce((acc, s) => acc + (max - s.score), 0) / ((n - 1) * (n - 2) / 2);
    return {
      scores: scores.map((s) => ({
        id: s.id,
        text: `Score: ${s.score.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION)} (${Math.round(s.score / max * 100)}%)`
      })),
      graphLevelMetrics: {
        "Maximum Betweenness Centrality": +max.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION),
        "Minimum Betweenness Centrality": +min.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION),
        "Average Betweenness Centrality": +mean.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION),
        "Centralization": +centralization.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION)
      },
      popupContent: `<div>
<h1>Betweenness Centrality</h1>
<hr>
<p>Betweenness centrality measures how often a node acts as a bridge along the shortest path between two other nodes.
Nodes with high betweenness centrality are important controllers of information flow in the network.
<a href="https://doi.org/10.2307%2F3033543">Freeman, 1977</a>
</p>
<p><strong>Note:</strong> This implementation assumes an undirected graph (A\u2192B and B\u2192A are considered the same path). 
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
  async function calculateClosenessCentrality(cache3) {
    const { nodeIDsToBeShown: nodes, edgeIDsToBeShown: edges, edgeRef } = cache3;
    const n = nodes.size;
    if (n === 0) return { scores: [], graphLevelMetrics: {} };
    const graphMap = /* @__PURE__ */ new Map();
    for (const id of nodes) graphMap.set(id, /* @__PURE__ */ new Set());
    for (const edgeId of edges) {
      const { source, target } = edgeRef.get(edgeId);
      if (graphMap.has(source) && graphMap.has(target)) {
        graphMap.get(source).add(target);
        graphMap.get(target).add(source);
      }
    }
    function bfs(start) {
      const distances = /* @__PURE__ */ new Map();
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
      const totalDistance = Array.from(distances.values()).filter((d) => d > 0).reduce((a, b) => a + b, 0);
      const closeness = totalDistance > 0 ? (reachableNodes - 1) * (reachableNodes - 1) / ((n - 1) * totalDistance) : 0;
      scores.push({ id: nodeId, closeness });
      sum += closeness;
      if (closeness < min) min = closeness;
      if (closeness > max) max = closeness;
    }
    scores.sort((a, b) => b.closeness - a.closeness);
    const mean = sum / n;
    const maxForPercentage = max || 1;
    return {
      scores: scores.map((s) => ({
        id: s.id,
        text: `Score: ${s.closeness.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION)} (${Math.round(s.closeness / maxForPercentage * 100)}%)`
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
<strong>Centralization:</strong> Freeman closeness-centralization \u2014 degree to which one node is, on average, closer to all others than the rest of the network.
</p>
</div>`
    };
  }
  async function calculateEigenvectorCentrality(cache3) {
    const { nodeIDsToBeShown: nodes, edgeIDsToBeShown: edges, edgeRef } = cache3;
    const n = nodes.size;
    if (n === 0) return { scores: [], graphLevelMetrics: {} };
    const matrix = Array(n).fill().map(() => Array(n).fill(0));
    const nodeArray = Array.from(nodes);
    const nodeIndex = new Map(nodeArray.map((id, i) => [id, i]));
    for (const edgeId of edges) {
      const { source, target } = edgeRef.get(edgeId);
      if (nodeIndex.has(source) && nodeIndex.has(target)) {
        const i = nodeIndex.get(source), j = nodeIndex.get(target);
        matrix[i][j] = matrix[j][i] = 1;
      }
    }
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
      const norm = Math.sqrt(eigenVector.reduce((sum, x) => sum + x * x, 0));
      eigenVector = eigenVector.map((x) => x / norm);
      if (eigenVector.every((x, i) => Math.abs(x - prevEigenVector[i]) < tolerance)) break;
    }
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
      scores: scores.map((s) => ({
        id: s.id,
        text: `Score: ${s.centrality.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION)} (${Math.round(s.centrality / max * 100)}%)`
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
  async function calculatePageRank(cache3) {
    const { nodeIDsToBeShown: nodes, edgeIDsToBeShown: edges, edgeRef } = cache3;
    const n = nodes.size;
    if (n === 0) return { scores: [], graphLevelMetrics: {} };
    const nodeArray = Array.from(nodes);
    const nodeIndex = new Map(nodeArray.map((id, i) => [id, i]));
    const matrix = Array(n).fill().map(() => Array(n).fill(0));
    const degrees = Array(n).fill(0);
    for (const edgeId of edges) {
      const { source, target } = edgeRef.get(edgeId);
      if (nodeIndex.has(source) && nodeIndex.has(target)) {
        const i = nodeIndex.get(source), j = nodeIndex.get(target);
        matrix[j][i] = matrix[i][j] = 1;
        degrees[i]++;
        degrees[j]++;
      }
    }
    for (let i = 0; i < n; i++) {
      if (degrees[i] > 0) {
        for (let j = 0; j < n; j++) {
          matrix[j][i] = matrix[j][i] / degrees[i];
        }
      } else {
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
      scores: sortedScores.map((s) => ({
        id: s.id,
        text: `Score: ${s.score.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION)} (${Math.round(s.score / maxScore * 100)}%)`
      })),
      graphLevelMetrics: {
        "Maximum PageRank Score": +maxScore.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION),
        "Minimum PageRank Score": +minScore.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION),
        "Mean PageRank Score": +meanScore.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION),
        "Maximum Degree": maxDegree,
        "Minimum Degree": minDegree,
        "Mean Degree": +avgDegree.toFixed(NODE_CONNECTIVITY_METRICS_PRECISION)
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

  // src/managers/query.js
  var QueryAST = class {
    constructor(instructions) {
      this.instructions = instructions;
    }
    /* ===== public API =================================================== */
    testNode(node) {
      return this.#evalExpr(
        this.instructions,
        node,
        /*elemType*/
        "Node filters"
      );
    }
    testEdge(edge) {
      return this.#evalExpr(
        this.instructions,
        edge,
        /*elemType*/
        "Edge filters"
      );
    }
    /* ===== internal helpers ============================================ */
    /**
     * Recursively evaluate any sub-expression.
     * Implements “left-before-right” for chains of arbitrary length.
     */
    #evalExpr(expr, element, requestedMainGroup) {
      if (!Array.isArray(expr)) return false;
      if (expr.length === 1) {
        return this.#evalExpr(expr[0], element, requestedMainGroup);
      }
      const isLeaf = expr.length > 0 && !Array.isArray(expr[0]) && // first item is NOT another list
      typeof expr[0] === "object" && expr[0]?.type === "property";
      if (isLeaf) {
        return this.#evalLeaf(expr, element, requestedMainGroup);
      }
      if (expr.length >= 3 && typeof expr[1] === "string") {
        let acc = this.#evalExpr(expr[0], element, requestedMainGroup);
        for (let i = 1; i < expr.length; i += 2) {
          const op = expr[i];
          const rhs = this.#evalExpr(expr[i + 1], element, requestedMainGroup);
          switch (op) {
            case "AND":
              acc = acc && rhs;
              break;
            case "OR":
              acc = acc || rhs;
              break;
            case "NOT":
              acc = acc && !rhs;
              break;
            default:
              return false;
          }
        }
        return acc;
      }
      return false;
    }
    // Evaluate a single property expression
    #evalLeaf(tokens, element, requestedMainGroup) {
      const propTok = tokens[0];
      const opTok = tokens[1];
      const value = this.#readValue(element, propTok);
      if (value === void 0 || value === null) return false;
      if (propTok.main !== requestedMainGroup) return false;
      const propVal = this.#readValue(element, propTok);
      if (propVal === void 0 || propVal === null) return false;
      const op = tokens[1].value;
      let validated = false;
      if (op === "BETWEEN") {
        const lower = tokens[2].value;
        const upper = tokens[4].value;
        validated = typeof propVal === "number" && propVal >= lower && propVal <= upper;
      }
      if (op === "LOWER THAN") {
        const low = tokens[2].value;
        const high = tokens[4].value;
        validated = typeof propVal === "number" && (propVal <= low || propVal >= high);
      }
      if (op.startsWith("IN")) {
        const set = tokens.slice(2).map((t) => t.value);
        validated = set.includes(propVal);
      }
      element.featureIsWithinThreshold.set(tokens[0].propID, validated);
      return validated;
    }
    // Safely pull the data from the D4Data hierarchy
    #readValue(element, { main, sub, prop }) {
      try {
        return element?.D4Data?.[main]?.[sub]?.[prop];
      } catch {
        return void 0;
      }
    }
  };
  var QueryManager = class {
    constructor(cache3) {
      this.cache = cache3;
    }
    encodeQuery(asciiStr) {
      this.cache.query.valid = true;
      const space = `<span class='q-space' data-encoded> </span>`;
      if (!asciiStr) {
        this.cache.query.valid = false;
      }
      asciiStr = asciiStr.replace(
        /\(\s*\)/g,
        (match) => {
          this.cache.query.valid = false;
          return `<span class="q-error-empty-instruction" data-encoded>${match}</span>`;
        }
      );
      asciiStr = asciiStr.replace(
        /\)\s*\(/g,
        (match) => {
          this.cache.query.valid = false;
          return `<span class="q-error-missing-connector" data-encoded>` + match + `</span>`;
        }
      );
      asciiStr = asciiStr.replace(
        /(Node filters|Edge filters)::([^:]+)::([^:]+)(?=\s(?:IN|BETWEEN|LOWER\sTHAN|\)))/g,
        (match, mainGroup, subGroup, prop) => {
          const mgok = mainGroup in this.cache.uniquePropHierarchy;
          const sgok = mgok && subGroup in this.cache.uniquePropHierarchy[mainGroup];
          const pok = sgok && this.cache.uniquePropHierarchy[mainGroup][subGroup].has(prop);
          const mainGroupEncoded = `<span class="${mgok ? "q-maingroup" : "q-error-unrecognized"}" data-encoded>${mainGroup}</span>`;
          const subGroupEncoded = `<span class="${sgok ? "q-subgroup" : "q-error-unrecognized"}" data-encoded>${subGroup}</span>`;
          const propEncoded = `<span class="${pok ? "q-property" : "q-error-unrecognized"}" data-encoded>${prop}</span>`;
          const sep = `<span class="q-prop-group-separator" data-encoded>::</span>`;
          return `<span class="q-property-wrapper" data-encoded>` + mainGroupEncoded + sep + subGroupEncoded + sep + propEncoded + `</span>`;
        }
      );
      asciiStr = asciiStr.replace(
        /(BETWEEN)\s+(-?\d+(?:\.\d+)?)\s+(AND)\s+(-?\d+(?:\.\d+)?)/gi,
        (_m, betweenKw, low, andKw, high) => `<span class='q-kw-between' data-encoded>${betweenKw}</span>` + space + `<span class='q-number' data-encoded>${low}</span>` + space + `<span class='q-kw-between-and' data-encoded>${andKw}</span>` + space + `<span class='q-number' data-encoded>${high}</span>`
      );
      asciiStr = asciiStr.replace(
        /(LOWER THAN)\s+(-?\d+(?:\.\d+)?)\s+(OR GREATER THAN)\s+(-?\d+(?:\.\d+)?)/gi,
        (_m, lowerThanKw, low, andGreaterThanKw, high) => `<span class='q-lower-than' data-encoded>${lowerThanKw}</span>` + space + `<span class='q-number' data-encoded>${low}</span>` + space + `<span class='q-or-greater-than' data-encoded>${andGreaterThanKw}</span>` + space + `<span class='q-number' data-encoded>${high}</span>`
      );
      asciiStr = asciiStr.replace(
        /IN\s*\[([^\]]*?)]/g,
        (_match, list) => {
          const encodedCategories = list.split(",").map((cat) => `<span class='q-string' data-encoded>${cat}</span>`).join(`<span class='q-comma' data-encoded>,</span>`);
          return [
            `<span class='q-in-cat-bracket-open' data-encoded>IN${space}[</span>`,
            encodedCategories,
            `<span class='q-cat-bracket-close' data-encoded>]</span>`
          ].join("");
        }
      );
      const connectorOpeningBracket = `<span class='q-connector-opening-bracket' data-encoded>(</span>`;
      const connectorClosingBracket = `<span class='q-connector-closing' data-encoded>)</span>`;
      asciiStr = asciiStr.replace(
        /\)\s*(OR|AND|NOT)\s*\(/gi,
        (_m, connector) => connectorClosingBracket + `<span class='q-connector-${connector.toLowerCase()}' data-encoded> ` + connector.toUpperCase() + ` </span>` + connectorOpeningBracket
      );
      function findUnmatchedBracketIndices(str) {
        const stack = [];
        const unmatched2 = /* @__PURE__ */ new Set();
        for (let i = 0; i < str.length; ++i) {
          const ch = str[i];
          if (ch === "(") {
            stack.push(i);
          } else if (ch === ")") {
            if (stack.length) {
              stack.pop();
            } else {
              unmatched2.add(i);
            }
          }
        }
        stack.forEach((idx) => unmatched2.add(idx));
        return unmatched2;
      }
      let bracketLevel = 0;
      const unmatched = findUnmatchedBracketIndices(asciiStr);
      if (unmatched.size) {
        this.cache.query.valid = false;
      }
      asciiStr = [...asciiStr].map((ch, i) => {
        if (ch === "(") {
          bracketLevel++;
          const lvl = Math.min(bracketLevel, 5);
          const cls = [
            `q-bracket-open-lvl-${lvl}`,
            unmatched.has(i) ? "q-error-unmatched-opening-bracket" : ""
          ].join(" ");
          return `<span class='${cls.trim()}' data-encoded>(</span>`;
        }
        if (ch === ")") {
          const lvl = Math.min(bracketLevel, 5);
          const cls = [
            `q-bracket-close-lvl-${lvl}`,
            unmatched.has(i) ? "q-error-unmatched-closing-bracket" : ""
          ].join(" ");
          const html = `<span class='${cls.trim()}' data-encoded>)</span>`;
          bracketLevel = Math.max(bracketLevel - 1, 0);
          return html;
        }
        return ch;
      }).join("");
      asciiStr = asciiStr.split(/(<span\b[^>]*data-encoded[^>]*>[\s\S]*?<\/span>)/g).map((chunk) => {
        if (chunk.startsWith("<span") && chunk.includes("data-encoded")) {
          return chunk;
        }
        return chunk.replace(/&nbsp;|\u00a0| /g, space);
      }).join("");
      asciiStr = asciiStr.split(/(<span\b[^>]*data-encoded[^>]*>[\s\S]*?<\/span>)/g).map((chunk) => {
        if (chunk.startsWith("<span") && chunk.includes("data-encoded") || chunk === "" || chunk === "</span> " || chunk === "</span>" || chunk === "[</span>") {
          return chunk;
        }
        this.cache.query.valid = false;
        return chunk.replace(
          /\S+/g,
          (txt) => `<span class="q-error-unrecognized">${txt}</span>`
        );
      }).join("");
      const updateQueryBtn = document.getElementById("queryUpdateBtn");
      const selectQueryBtn = document.getElementById("querySelectBtn");
      if (this.cache.query.valid) {
        updateQueryBtn.classList.remove("disabled");
        selectQueryBtn.classList.remove("disabled");
      } else {
        updateQueryBtn.classList.add("disabled");
        selectQueryBtn.classList.add("disabled");
      }
      return asciiStr;
    }
    updateQueryTextArea() {
      let queryStr = this.cache.data.layouts[this.cache.data.selectedLayout]["query"] || "";
      if (!queryStr) {
        let queryEntries = [];
        for (const [propID, fo] of this.cache.data.layouts[this.cache.data.selectedLayout].filters.entries()) {
          if (fo.active) {
            if (fo.isCategory) {
              queryEntries.push(`${propID} IN [${[...fo.categories].map((cat) => cat).join(",")}]`);
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
      this.cache.query.text.textContent = queryStr;
      this.cache.query.overlay.innerHTML = this.encodeQuery(queryStr);
    }
    clearQuery() {
      this.cache.query.text.textContent = "";
      this.handleQueryValidationEvent();
      this.cache.query.caret.style.display = "none";
    }
    getCursorPosition() {
      const sel = window.getSelection();
      if (!sel.rangeCount) return 0;
      const range = sel.getRangeAt(0).cloneRange();
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(this.cache.query.text);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      return preCaretRange.toString().length;
    }
    setCursorPosition(charIndex) {
      const root = this.cache.query.text;
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
    moveCaret() {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) {
        this.cache.query.caret.style.display = "none";
        return;
      }
      const range = sel.getRangeAt(0).cloneRange();
      range.collapse(true);
      const rect = range.getBoundingClientRect();
      const parentRect = this.cache.query.text.getBoundingClientRect();
      if (!rect || !rect.height) {
        this.cache.query.caret.style.display = "none";
        return;
      }
      const overlapsVert = rect.bottom > parentRect.top && rect.top < parentRect.bottom;
      const overlapsHoriz = rect.right > parentRect.left && rect.left < parentRect.right;
      if (!(overlapsVert && overlapsHoriz)) {
        this.cache.query.caret.style.display = "none";
        return;
      }
      this.cache.query.caret.style.display = "block";
      this.cache.query.caret.style.left = `${rect.left - parentRect.left}px`;
      this.cache.query.caret.style.top = `${rect.top - parentRect.top}px`;
      this.cache.query.caret.style.height = `${rect.height}px`;
    }
    handleQueryValidationEvent() {
      const caretPosition = this.getCursorPosition();
      this.cache.query.overlay.innerHTML = this.encodeQuery(this.cache.query.text.textContent);
      this.cache.query.overlay.scrollTop = this.cache.query.text.scrollTop;
      this.cache.query.overlay.scrollLeft = this.cache.query.text.scrollLeft;
      if (this.cache.query.valid) {
        this.cache.data.layouts[this.cache.data.selectedLayout]["query"] = this.cache.query.text.textContent;
      } else {
        this.cache.data.layouts[this.cache.data.selectedLayout]["query"] = void 0;
      }
      requestAnimationFrame(() => {
        this.setCursorPosition(caretPosition);
      });
    }
    async handleQueryUpdateEvent() {
      this.updateUIFromQueryInstructions();
      await this.cache.fm.handleFilterEvent("Updating Graph from Query", this.cache.query.text.textContent, null, false);
    }
    async handleQuerySelectEvent() {
      await this.cache.ui.showLoading("Updating Selection", `Modifying selection from query`);
      await new Promise((resolve) => requestAnimationFrame(resolve));
      this.cache.EVENT_LOCKS.QUERY_SELECTION_EVENT = true;
      this.decodeQueryAndBuildAST();
      const nodeIDsToSelect = this.cache.nodeRef.values().filter((node) => this.cache.query.ast.testNode(node) && this.cache.nodeIDsToBeShown.has(node.id)).map((node) => node.id);
      const edgeIDsToSelect = this.cache.edgeRef.values().filter((edge) => this.cache.query.ast.testEdge(edge) && this.cache.edgeIDsToBeShown.has(edge.id)).map((edge) => edge.id);
      await this.cache.sm.selectNodes(nodeIDsToSelect);
      await this.cache.sm.selectEdges(edgeIDsToSelect);
      await this.cache.ui.hideLoading();
      await new Promise((resolve) => requestAnimationFrame(resolve));
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
    decodeQuery() {
      const tokens = [];
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div>${this.cache.query.overlay.innerHTML}</div>`, "text/html");
      const root = doc.body.firstElementChild;
      const classMap = {
        // connectors
        "q-connector-or": () => "OR",
        "q-connector-and": () => "AND",
        "q-connector-not": () => "NOT",
        // brackets
        "q-bracket-open-lvl-1": () => ({ type: "(", value: "(" }),
        "q-bracket-open-lvl-2": () => ({ type: "(", value: "(" }),
        "q-bracket-open-lvl-3": () => ({ type: "(", value: "(" }),
        "q-bracket-open-lvl-4": () => ({ type: "(", value: "(" }),
        "q-bracket-open-lvl-5": () => ({ type: "(", value: "(" }),
        "q-bracket-close-lvl-1": () => ({ type: ")", value: ")" }),
        "q-bracket-close-lvl-2": () => ({ type: ")", value: ")" }),
        "q-bracket-close-lvl-3": () => ({ type: ")", value: ")" }),
        "q-bracket-close-lvl-4": () => ({ type: ")", value: ")" }),
        "q-bracket-close-lvl-5": () => ({ type: ")", value: ")" }),
        // numbers & keywords
        "q-number": (el) => ({ type: "NUM", value: Number(el.textContent) }),
        "q-kw-between": () => ({ type: "KW", value: "BETWEEN" }),
        "q-kw-between-and": () => ({ type: "KW", value: "AND" }),
        "q-lower-than": () => ({ type: "KW", value: "LOWER THAN" }),
        "q-or-greater-than": () => ({ type: "KW", value: "OR GREATER THAN" }),
        "q-in-cat-bracket-open": () => ({ type: "KW", value: "IN [" }),
        // category strings
        "q-string": (el) => ({ type: "STR", value: el.textContent }),
        // whole property path (“A::B::C”)
        "q-property-wrapper": (el) => {
          const [main, sub, prop] = el.textContent.split("::");
          return { type: "property", main, sub, prop, propID: el.textContent };
        }
      };
      function walk(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          return;
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          for (const cls of node.classList) {
            if (classMap[cls]) {
              const t = classMap[cls](node);
              if (t !== void 0) tokens.push(t);
              break;
            }
          }
        }
        node.childNodes.forEach(walk);
      }
      walk(root);
      function readGroup(idx = 0) {
        const group = [];
        while (idx < tokens.length) {
          const tok = tokens[idx];
          if (tok.type === ")") {
            return [group, idx + 1];
          }
          if (tok.type === "(") {
            const [subGroup, next] = readGroup(idx + 1);
            group.push(subGroup);
            idx = next;
            continue;
          }
          group.push(tok);
          idx += 1;
        }
        return [group, idx];
      }
      const [instructions] = readGroup();
      return instructions;
    }
    updateUIFromQueryInstructions() {
      function setFilter(obj) {
        if (obj[1].type === "KW" && obj[1].value === "BETWEEN") {
          this.cache.ui.checkCheckbox(obj[0].propID, true);
          this.cache.propIDToInvertibleRangeSliders.get(obj[0].propID).setTo(obj[2].value, obj[4].value, false);
        } else if (obj[1].type === "KW" && obj[1].value === "LOWER THAN") {
          this.cache.ui.checkCheckbox(obj[0].propID, true);
          this.cache.propIDToInvertibleRangeSliders.get(obj[0].propID).setTo(obj[2].value, obj[4].value, true);
        } else if (obj[1].type === "KW" && obj[1].value === "IN [") {
          this.cache.ui.checkCheckbox(obj[0].propID, true);
          const dropdown = this.cache.propIDToDropdownChecklists.get(obj[0].propID);
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
            for (const nestedInst of obj) {
              refreshUI(nestedInst);
            }
          }
        }
      }
      this.cache.ui.uncheckAllCheckboxes();
      this.decodeQueryAndBuildAST();
      for (const inst of this.cache.query.ast.instructions) {
        refreshUI(inst);
      }
    }
    moveCaretToEnd() {
      const el = this.cache.query.text;
      if (!el) return;
      if ("selectionStart" in el) {
        el.selectionStart = el.selectionEnd = el.value.length;
        el.focus();
        return;
      }
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      el.focus();
    }
    resetQuery() {
      delete this.cache.data.layouts[this.cache.data.selectedLayout]["query"];
      this.cache.query.text.textContent = "";
      this.cache.query.overlay.innerHTML = "";
      this.updateQueryTextArea();
      this.moveCaretToEnd();
    }
    storeQuery() {
      this.cache.query.textCache = this.cache.query.text.textContent;
    }
    restoreQuery() {
      if (this.cache.query.textCache === void 0 || this.cache.query.textCache === null || this.cache.query.textCache === "") {
        return;
      }
      this.cache.query.text.textContent = this.cache.query.textCache;
      this.cache.query.overlay.innerHTML = this.encodeQuery(this.cache.query.textCache);
      this.moveCaretToEnd();
      this.cache.query.textCache = null;
    }
    showQueryHelp() {
      this.cache.popup = new Popup(`
<h2>Query Editor</h2>
<p>Build complex filters using nested AND, OR and NOT expressions.</p>

<div class="alert-warning">
  <strong>\u26A0\uFE0F Important:</strong> Using the filtering UI panel or adding/modifying bubble groups will automatically 
  overwrite the this.cache.query. Any custom logic (AND/NOT operators, nested brackets) will be cleared and replaced 
  with the UI-generated this.cache.query.
</div>
<div class="alert-info">
  <strong>\u{1F4A1} Tip:</strong> Queries are saved for each view and included when exporting the model \u{1F4BE}
</div>

<h3>Available Actions</h3>
<ul>
  <li><span class="tooltip-dummy-buttons">\u{1F50D} Filter</span> \u2014 Apply the query to filter the graph</li>
  <li><span class="tooltip-dummy-buttons blue">\u{1F3AF} Select</span> \u2014 Select all matching elements (without filtering)</li>
  <li><span class="tooltip-dummy-buttons pink">\u27F3 Sync</span> \u2014 Sync query with current UI panel settings</li>
  <li><span class="tooltip-dummy-buttons red">\u2717 Clear</span> \u2014 Remove all query conditions</li>
  <li><span class="add-to-query-button show tt">\u{1F4DD}</span> (filtering panel) \u2014 Add a single parameter to the query</li>
</ul>

<hr>
<h2>Query Syntax Guide</h2>

<h3>Example Query</h3>

<div class="popupQueryContainer">
  <span class="q-bracket-open-lvl-1">(</span>
  <span class="q-property-wrapper"><span class="q-maingroup">${this.cache.CFG.EXCEL_NODE_HEADER}</span><span class="q-prop-group-separator">::</span><span class="q-subgroup">group A</span><span class="q-prop-group-separator">::</span><span class="q-property">prop X</span></span>
  <span class="q-kw-between">BETWEEN</span>
  <span class="q-number">0</span>
  <span class="q-kw-between-and">AND</span>
  <span class="q-number">1.3</span>
  <span class="q-connector-closing"><span class="q-bracket-close-lvl-1">)</span></span>
  <span class="q-connector-or">&nbsp;OR&nbsp;</span>
  <span class="q-connector-opening-bracket"><span class="q-bracket-open-lvl-1">(</span></span>
  <span class="q-property-wrapper"><span class="q-maingroup">${this.cache.CFG.EXCEL_NODE_HEADER}</span><span class="q-prop-group-separator">::</span><span class="q-subgroup">group A</span><span class="q-prop-group-separator">::</span><span class="q-property">prop Y</span></span>
  <span class="q-in-cat-bracket-open">IN<span class="q-space"> </span>[</span>
  <span class="q-string">foo</span>
  <span class="q-comma">,</span>
  <span class="q-string">bar</span>
  <span class="q-cat-bracket-close">]</span>
  <span class="q-connector-closing"><span class="q-bracket-close-lvl-1">)</span></span>
</div>

<h3>Syntax Elements</h3>

<p><strong>1. Properties</strong></p>
<p style="margin-left: 20px; margin-top: -8px;">
  <span class="q-property-wrapper"><span class="q-maingroup">${this.cache.CFG.EXCEL_NODE_HEADER}</span><span class="q-prop-group-separator">::</span><span class="q-subgroup">group A</span><span class="q-prop-group-separator">::</span><span class="q-property">prop X</span></span>
</p>
<ul style="margin-top: -8px;">
  <li>Format: <code>node-or-edge::group::property</code> (<strong>3 levels</strong> separated by <strong>::</strong>)</li>
  <li>Nodes start with <span class="q-property-wrapper"><span class="q-maingroup">${this.cache.CFG.EXCEL_NODE_HEADER}</span><span class="q-prop-group-separator">::</span></span> , edges with <span class="q-property-wrapper"><span class="q-maingroup">${this.cache.CFG.EXCEL_EDGE_HEADER}</span><span class="q-prop-group-separator">::</span></span></li>
  <li>Default group is <span class="q-property-wrapper"><span class="q-subgroup">${this.cache.CFG.EXCEL_UNCATEGORIZED_SUBHEADER}</span></span> if none is defined in the input data</li>
</ul>

<p><strong>2. Filter Instructions</strong></p>
<ul style="margin-top: -8px;">
  <li><span class="q-kw-between">BETWEEN</span>&nbsp;<span class="q-number">0</span>&nbsp;<span class="q-kw-between-and">AND</span>&nbsp;<span class="q-number">1.3</span> \u2014 Keep numerical values in range (inclusive)</li>
  <li><span class="q-lower-than">LOWER THAN</span>&nbsp;<span class="q-number">0.2</span>&nbsp;<span class="q-or-greater-than">OR GREATER THAN</span>&nbsp;<span class="q-number">0.8</span> \u2014 Keep numerical values \u2264 0.2 or \u2265 0.8</li>
  <li><span class="q-in-cat-bracket-open">IN&nbsp;[</span><span class="q-string">foo</span><span class="q-comma">,</span>&nbsp;<span class="q-string">bar</span><span class="q-cat-bracket-close">]</span> \u2014 Keep specific categorical values</li>
</ul>

<p><strong>3. Logical Operators</strong></p>
<ul style="margin-top: -8px;">
  <li><span class="q-connector-or">&nbsp;OR&nbsp;</span> \u2014 True if at least one condition is true</li>
  <li><span class="q-connector-and">&nbsp;AND&nbsp;</span> \u2014 True if both conditions are true</li>
  <li><span class="q-connector-not">&nbsp;NOT&nbsp;</span> \u2014 True if first condition is true and second is false</li>
  <li>\u26A1 Left-to-right precedence; use parentheses for complex logic</li>
</ul>

<p><strong>4. Grouping with Parentheses</strong></p>
<ul style="margin-top: -8px;">
  <li><span class="q-bracket-open-lvl-1">(</span> <span class="q-bracket-close-lvl-1">)</span> \u2014 Group multiple conditions into one logical unit</li>
  <li>Nest to any depth with color coding: <span class="q-bracket-open-lvl-1">(</span><span class="q-bracket-open-lvl-2">(</span><span class="q-bracket-open-lvl-3">(</span><span class="q-bracket-open-lvl-4">(</span><span class="q-bracket-open-lvl-5">(</span><span class="q-bracket-close-lvl-5">)</span><span class="q-bracket-close-lvl-4">)</span><span class="q-bracket-close-lvl-3">)</span><span class="q-bracket-close-lvl-2">)</span><span class="q-bracket-close-lvl-1">)</span></li>
  <li>Unmatched brackets are highlighted: <span class="q-bracket-close-lvl-0 q-error-unmatched-closing-bracket">)</span></li>
</ul>

<p><strong>5. Query Validation</strong></p>
<ul style="margin-top: -8px">
  <li>Invalid syntax is <span class="q-error-unrecognized">highlighted like this</span></li>
</ul>

`, { width: "80vw", height: "75vh", lineHeight: "1.5em" });
    }
    decodeQueryAndBuildAST() {
      const instructions = this.decodeQuery();
      this.cache.query.ast = new QueryAST(instructions);
    }
    performANDFilterLogic() {
      for (let nodeID of this.cache.nodeIDsToBeShown) {
        let propertiesNotWithinThresholds = this.cache.fm.getPropertiesNotWithinThresholds(nodeID, null);
        if (propertiesNotWithinThresholds.length > 0) {
          this.cache.nodeIDsToBeShown.delete(nodeID);
          this.cache.fm.removeFromPropIDsToNodeIDsToBeShown(nodeID);
        }
      }
      for (let edgeID of this.cache.edgeIDsToBeShown) {
        let propertiesNotWithinThresholds = this.cache.fm.getPropertiesNotWithinThresholds(null, edgeID);
        if (propertiesNotWithinThresholds.length > 0) {
          this.cache.edgeIDsToBeShown.delete(edgeID);
          this.cache.fm.removeFromPropIDsToEdgeIDsToBeShown(edgeID);
        } else {
          const [source, target] = edgeID.split("::");
          this.cache.remainingEdgeRelatedNodes.add(source);
          this.cache.remainingEdgeRelatedNodes.add(target);
        }
      }
    }
    validateAlignment() {
      const mText = StaticUtilities.getLineMetrics(this.cache.query.text);
      const mOverlay = StaticUtilities.getLineMetrics(this.cache.query.overlay);
      const linesMatch = mText.lines === mOverlay.lines;
      const lastWidthMatch = Math.abs(mText.lastLineWidth - mOverlay.lastLineWidth) <= 1;
      if (linesMatch && lastWidthMatch) {
        if (this.cache.query.sizeChangeLocked) {
          this.cache.query.text.style.removeProperty("width");
          this.cache.query.overlay.style.removeProperty("width");
          this.cache.query.sizeChangeLocked = false;
          console.ui.info("Alignment restored, width unlocked");
        }
        this.cache.query.lastGoodWidth = this.cache.query.text.offsetWidth;
        return;
      }
      if (!this.cache.query.sizeChangeLocked && this.cache.query.lastGoodWidth > 0) {
        console.warn(`Mismatch \u2014 lines: ${mText.lines}/${mOverlay.lines}, last width: ${mText.lastLineWidth}/${mOverlay.lastLineWidth}. Locking at ${this.cache.query.lastGoodWidth}px`);
        this.cache.query.text.style.width = `${this.cache.query.lastGoodWidth}px`;
        this.cache.query.overlay.style.width = `${this.cache.query.lastGoodWidth}px`;
        this.cache.query.sizeChangeLocked = true;
      }
    }
  };

  // src/managers/stash.js
  var StashManager = class {
    constructor(cache3) {
      this.cache = cache3;
    }
    async saveStash() {
      const select = document.getElementById("selectStash");
      let stashName = await Popup.prompt("Enter Filter Profile Name: ");
      if (!stashName) {
        this.cache.ui.info("Creating filter profile canceled");
        return;
      }
      let existing = Object.keys(this.cache.data.stash);
      if (existing.includes(stashName)) {
        this.cache.ui.error(`Filter profile with name "${stashName}" already exists.`);
        return;
      }
      await this.captureStashSnapshot(stashName);
      this.cache.ui.refreshStashUI();
      select.value = stashName;
      this.cache.ui.info(`Created filter profile: ${stashName}`);
    }
    async overwriteStash() {
      const stashName = document.getElementById("selectStash").value;
      if (stashName == null || stashName === "") return;
      await this.captureStashSnapshot(stashName);
      this.cache.ui.info(`Overwrote filter profile: ${stashName}`);
    }
    async captureStashSnapshot(stashName) {
      this.cache.data.stash[stashName] = {
        query: structuredClone(this.cache.query.text.textContent),
        groupedProps: {},
        filters: structuredClone(this.cache.data.layouts[this.cache.data.selectedLayout].filters),
        bubbleSets: {},
        selectedNodes: [...this.cache.selectedNodes],
        selectedEdges: [...this.cache.selectedEdges]
      };
      for (const group of this.cache.bs.traverseBubbleSets()) {
        this.cache.data.stash[stashName].bubbleSets[group] = [...this.cache.INSTANCES.BUBBLE_GROUPS[group].members.keys()];
        this.cache.data.stash[stashName].groupedProps[group] = /* @__PURE__ */ new Set([...this.cache.data.layouts[this.cache.data.selectedLayout][`${group}Props`]]);
      }
      await this.captureStashViewport(stashName);
    }
    async captureStashViewport(stashName) {
      const currentZoom = await this.cache.graph.getZoom();
      await this.cache.graph.zoomTo(1, false);
      const position = await this.cache.graph.getPosition();
      this.cache.data.stash[stashName].zoom = currentZoom;
      this.cache.data.stash[stashName].position = position;
      await this.cache.graph.zoomTo(currentZoom, false);
      this.cache.ui.debug(`Captured viewport for filter profile: ${stashName} | zoom: ${currentZoom} | position: ${position}`);
    }
    async restoreStashViewport() {
      const selected = document.getElementById("selectStash").value;
      if (selected === null || selected === "") return;
      const { zoom, position } = this.cache.data.stash[selected];
      await this.cache.graph.zoomTo(1, false);
      await this.cache.graph.translateTo(position, false);
      await this.cache.graph.zoomTo(zoom, false);
      this.cache.ui.debug(`Viewport restored. Zoom: ${zoom}, Position: ${position}`);
    }
    async loadStash() {
      const selected = document.getElementById("selectStash").value;
      const query2 = this.cache.data.stash[selected]["query"];
      const groupedProps = this.cache.data.stash[selected].groupedProps;
      this.cache.data.layouts[this.cache.data.selectedLayout]["query"] = query2;
      this.cache.data.layouts[this.cache.data.selectedLayout].filters = this.cache.io.parseFiltersAsMap(this.cache.data.stash[selected].filters);
      for (const group of this.cache.bs.traverseBubbleSets()) {
        this.cache.data.layouts[this.cache.data.selectedLayout][`${group}Props`] = /* @__PURE__ */ new Set([...groupedProps[group]]);
        this.cache.lastBubbleSetMembers.set(group, new Set(this.cache.data.stash[selected].bubbleSets[group]));
      }
      this.cache.ui.buildFilterUI();
      await this.cache.ui.showLoading("Loading filter profile", `Applying profile ${selected} ..`);
      await this.cache.bs.clearBubbleSetInstanceMembers();
      await this.cache.gcm.decideToRenderOrDraw(true);
      await this.restoreStashViewport();
      await this.cache.sm.selectNodes(this.cache.data.stash[selected].selectedNodes);
      await this.cache.sm.selectEdges(this.cache.data.stash[selected].selectedEdges);
      this.cache.ui.info(`Applied filter profile: ${selected}`);
    }
    async removeStash() {
      const select = document.getElementById("selectStash");
      const val = select.value;
      const confirmed = await Popup.confirm(`Are you sure you want to delete the profile "${select.value}"?`);
      if (confirmed) {
        delete this.cache.data.stash[val];
        select.value = "";
        this.ui.refreshStashUI();
        this.cache.ui.info(`Removed filter profile: ${val}`);
      }
    }
  };

  // src/managers/ui_components.js
  var DropdownChecklist = class {
    constructor(propID, cache3) {
      this.propID = propID;
      this.cache = cache3;
      this.categories = this.cache.data.filterDefaults.get(propID).categories;
      this.selectedCategories = this.cache.data.layouts[this.cache.data.selectedLayout].filters.get(propID).categories;
      this.isVisible = false;
      this.sortCategories();
      this.cache.propIDToDropdownChecklists.set(propID, this);
    }
    sortCategories() {
      const catArray = Array.isArray(this.categories) ? [...this.categories] : Array.from(this.categories);
      catArray.sort((a, b) => {
        const getPriority = (val) => {
          const lower = val.toLowerCase();
          if (lower === "low") return 1;
          if (lower === "medium") return 2;
          if (lower === "high") return 3;
          return 0;
        };
        const priorityA = getPriority(a);
        const priorityB = getPriority(b);
        if (priorityA === 0 && priorityB === 0) {
          return a.localeCompare(b);
        }
        return priorityA - priorityB;
      });
      this.categories = new Set(catArray);
    }
    appendTo(parent) {
      this.container = document.createElement("div");
      this.container.id = this.propID + "-dropdown";
      this.container.className = "dropdown-check-list";
      this.container.tabIndex = 100;
      this.anchor = document.createElement("h5");
      this.anchor.className = "anchor purple round-border";
      this.anchor.textContent = `${this.selectedCategories.size}/${this.categories.size} selected`;
      this.anchor.id = this.propID + "-dropdown-anchor";
      this.container.appendChild(this.anchor);
      this.itemsList = document.createElement("ul");
      this.itemsList.className = "items";
      this.buttonContainer = document.createElement("div");
      this.buttonContainer.className = "dropdown-buttons";
      this.selectAllButton = document.createElement("button");
      this.selectAllButton.textContent = "Select All";
      this.deselectAllButton = document.createElement("button");
      this.deselectAllButton.textContent = "Deselect All";
      this.buttonContainer.appendChild(this.selectAllButton);
      this.buttonContainer.appendChild(this.deselectAllButton);
      this.itemsList.appendChild(this.buttonContainer);
      this.categories.forEach((option) => {
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
      ev.target.checked ? this.selectedCategories.add(ev.target.value) : this.selectedCategories.delete(ev.target.value);
      this.anchor.textContent = `${this.selectedCategories.size}/${this.categories.size} selected`;
      await this.cache.fm.handleFilterEvent(
        ev.target.checked ? "Showing" : "Hiding Elements",
        `Nodes and related edges for ${this.propID} ${ev.target.value}`,
        this.propID
      );
    }
    appendListeners() {
      const updateDropdownPosition = () => {
        this.itemsList.style.visibility = "hidden";
        this.itemsList.style.display = "block";
        const dropdownHeight = this.itemsList.offsetHeight;
        this.itemsList.style.display = "";
        this.itemsList.style.visibility = "";
        const anchorRect = this.anchor.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const availableHeight = viewportHeight - anchorRect.bottom;
        this.itemsList.style.top = `${anchorRect.bottom}px`;
        this.itemsList.style.left = `${anchorRect.left - 3}px`;
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
      this.selectAllButton.addEventListener("click", async () => await this.selectAllCategories());
      this.deselectAllButton.addEventListener("click", async () => await this.deselectAllCategories());
      document.addEventListener("click", (event) => {
        if (!this.container.contains(event.target)) {
          this.isVisible = false;
          this.container.classList.remove("visible");
        }
      });
    }
    selectCategory(category) {
      if (!this.categories.has(category)) {
        this.cache.ui.warning(`Category "${category}" does not exist for ${this.propID}`);
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
      this.categories.forEach((category) => this.selectedCategories.add(category));
      this.updateCheckboxStates(true);
      if (!skipFilterEvent) {
        await this.cache.fm.handleFilterEvent("Showing Elements", `Nodes and related edges for ${this.propID}`, this.propID);
      }
    }
    async deselectAllCategories(skipFilterEvent = false) {
      this.categories.forEach((category) => this.selectedCategories.delete(category));
      this.updateCheckboxStates(false);
      if (!skipFilterEvent) {
        await this.cache.fm.handleFilterEvent("Hiding Elements", `Nodes and related edges for ${this.propID}`, this.propID);
      }
    }
    updateCheckboxStates(selectAll) {
      Array.from(this.itemsList.querySelectorAll("input[type='checkbox']")).forEach((checkbox) => {
        checkbox.checked = selectAll;
        selectAll ? checkbox.nextElementSibling.classList.add("checked") : checkbox.nextElementSibling.classList.remove("checked");
      });
      this.anchor.textContent = `${this.selectedCategories.size}/${this.categories.size} selected`;
    }
  };
  var InvertibleRangeSlider = class {
    constructor(propID, cache3) {
      this.propID = propID;
      this.cache = cache3;
      const defaultFilterData = structuredClone(this.cache.data.filterDefaults.get(propID));
      this.readCurrentFilterSettings();
      this.sliderMin = defaultFilterData.lowerThreshold;
      this.sliderMax = defaultFilterData.upperThreshold;
      this.stepSize = StaticUtilities.isInteger(this.sliderMin) && StaticUtilities.isInteger(this.sliderMax) ? this.cache.CFG.FILTER_STEP_SIZE_INTEGER : this.cache.CFG.FILTER_STEP_SIZE_FLOAT;
      this.initializeIds();
      this.inputStart = null;
      this.inputEnd = null;
      this.cache.propIDToInvertibleRangeSliders.set(propID, this);
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
      if (!this.cache.data.layouts[this.cache.data.selectedLayout].filters.has(this.propID)) {
        this.currentMin = 0;
        this.currentMax = 1;
        this.isInverted = false;
      } else {
        let filterData = this.cache.data.layouts[this.cache.data.selectedLayout].filters.get(this.propID);
        this.currentMin = filterData.cache.data.lowerThreshold;
        this.currentMax = filterData.cache.data.upperThreshold;
        this.isInverted = filterData.cache.data.isInverted;
      }
    }
    writeCurrentFilterSettings() {
      if (this.cache.data.layouts[this.cache.data.selectedLayout].filters.has(this.propID)) {
        let filterData = this.cache.data.layouts[this.cache.data.selectedLayout].filters.get(this.propID);
        filterData.cache.data.lowerThreshold = this.currentMin;
        filterData.cache.data.upperThreshold = this.currentMax;
        filterData.cache.data.isInverted = this.isInverted;
      }
    }
    calcPercentage(value) {
      return (value - this.sliderMin) / (this.sliderMax - this.sliderMin) * 100;
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
      input.style.width = "80px";
      input.style.height = "16px";
      input.style.boxSizing = "border-box";
      input.value = initialValue;
      input.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
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
      this.setTo(this.sliderMin, this.sliderMax, false);
      this.isInverted = false;
      this.currentMin = this.sliderMin;
      this.currentMax = this.sliderMax;
      this.writeCurrentFilterSettings();
    }
    appendTo(parent) {
      if (this.cache.CFG.HIDE_SLIDERS_WITH_SAME_MIN_MAX_VALUES && this.sliderMin === this.sliderMax) {
        parent.appendChild(document.createElement("span"));
        return false;
      }
      this.isValidSlider = true;
      const colLeft = document.createElement("div");
      colLeft.classList.add("show-on-edit");
      colLeft.style.transition = "width 0.2s ease";
      this.inputStart = this.createSliderInput(this.sliderIdStartInput, this.currentMin, this.sliderIdStart);
      colLeft.appendChild(this.inputStart);
      const colRight = document.createElement("div");
      colRight.classList.add("show-on-edit");
      colRight.style.transition = "width 0.2s ease";
      this.inputEnd = this.createSliderInput(this.sliderIdEndInput, this.currentMax, this.sliderIdEnd);
      colRight.appendChild(this.inputEnd);
      const div = document.createElement("div");
      div.innerHTML = this.createDivInnerHTML();
      const slider = div.firstElementChild;
      slider.style.width = "100%";
      slider.title = `Set the thresholds for the numeric property: ${StaticUtilities.formatPropsAsTree(this.propID)}
---
  - Move handles to set min/max (\u2265 min \u2227 \u2264 max).
  - Swap handles to invert (\u2264 min \u2228 \u2265 max).
  - Double-click to reset.`;
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
            <span id="${this.labelStartId}">${StaticUtilities.formatNumber(this.currentMin, this.cache.CFG.FILTER_VISUAL_FLOAT_PRECISION)}</span>
          </div>
          <div sign class="right" style="left:100%; margin-left: 24px;">
            <span id="${this.labelEndId}">${StaticUtilities.formatNumber(this.currentMax, this.cache.CFG.FILTER_VISUAL_FLOAT_PRECISION)}</span>
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
      this.slider.addEventListener("dblclick", () => {
        this.reset();
        this.sliderEnd.dispatchEvent(new Event("change"));
      });
      this.sliderStart.addEventListener("input", () => this.handleThresholdOnInputEvent(true));
      this.sliderStart.addEventListener("change", async () => {
        this.writeCurrentFilterSettings();
        await this.cache.fm.handleFilterEvent(
          "Filtering",
          `Applying lower threshold ${this.sliderStart.value} for ${this.propID}`,
          this.propID
        );
      });
      this.sliderEnd.addEventListener("input", () => this.handleThresholdOnInputEvent(false));
      this.sliderEnd.addEventListener("change", async () => {
        this.writeCurrentFilterSettings();
        await this.cache.fm.handleFilterEvent(
          "Filtering",
          `Applying upper threshold ${this.sliderEnd.value} for ${this.propID}`,
          this.propID
        );
      });
      this.sliderStart.dispatchEvent(new Event("input"));
      this.sliderEnd.dispatchEvent(new Event("input"));
    }
    handleThresholdOnInputEvent(isLower) {
      const primarySlider = isLower ? this.sliderStart : this.sliderEnd;
      const secondarySlider = isLower ? this.sliderEnd : this.sliderStart;
      const primaryValue = parseFloat(primarySlider.value);
      const secondaryValue = parseFloat(secondarySlider.value);
      this.isInverted = isLower ? primaryValue > secondaryValue : primaryValue < secondaryValue;
      if (this.isInverted) {
        this.range.style.width = "0%";
        const leftWidth = this.calcPercentage(isLower ? secondaryValue : primaryValue);
        const rightWidth = this.calcPercentage(isLower ? primaryValue : secondaryValue);
        this.inverseLeft.style.width = leftWidth + "%";
        this.inverseRight.style.width = 100 - rightWidth + "%";
        this.range.style.left = "50%";
        this.inverseLeft.style.backgroundColor = "#C33D35";
        this.inverseRight.style.backgroundColor = "#C33D35";
        if (isLower) {
          this.labelEnd.innerHTML = StaticUtilities.formatNumber(primaryValue, this.cache.CFG.FILTER_VISUAL_FLOAT_PRECISION);
          this.labelStart.innerHTML = StaticUtilities.formatNumber(secondaryValue, this.cache.CFG.FILTER_VISUAL_FLOAT_PRECISION);
        } else {
          this.labelStart.innerHTML = StaticUtilities.formatNumber(primaryValue, this.cache.CFG.FILTER_VISUAL_FLOAT_PRECISION);
          this.labelEnd.innerHTML = StaticUtilities.formatNumber(secondaryValue, this.cache.CFG.FILTER_VISUAL_FLOAT_PRECISION);
        }
        this.labelStart.parentElement.classList.add("flipped");
        this.labelEnd.parentElement.classList.add("flipped");
        this.inputStart.classList.add("red");
        this.inputEnd.classList.add("red");
      } else {
        const leftPos = this.calcPercentage(isLower ? primaryValue : secondaryValue);
        const rightPos = 100 - this.calcPercentage(isLower ? secondaryValue : primaryValue);
        this.range.style.left = leftPos + "%";
        this.range.style.width = 100 - leftPos - rightPos + "%";
        this.inverseLeft.style.width = leftPos + "%";
        this.inverseRight.style.width = rightPos + "%";
        this.inverseLeft.style.backgroundColor = "grey";
        this.inverseRight.style.backgroundColor = "grey";
        if (isLower) {
          this.labelStart.innerHTML = StaticUtilities.formatNumber(primaryValue, this.cache.CFG.FILTER_VISUAL_FLOAT_PRECISION);
          this.labelEnd.innerHTML = StaticUtilities.formatNumber(secondaryValue, this.cache.CFG.FILTER_VISUAL_FLOAT_PRECISION);
        } else {
          this.labelStart.innerHTML = StaticUtilities.formatNumber(secondaryValue, this.cache.CFG.FILTER_VISUAL_FLOAT_PRECISION);
          this.labelEnd.innerHTML = StaticUtilities.formatNumber(primaryValue, this.cache.CFG.FILTER_VISUAL_FLOAT_PRECISION);
        }
        this.labelStart.parentElement.classList.remove("flipped");
        this.labelEnd.parentElement.classList.remove("flipped");
        this.inputStart.classList.remove("red");
        this.inputEnd.classList.remove("red");
      }
      if (isLower) {
        this.thumbStart.style.left = this.calcPercentage(primaryValue) + "%";
        this.sliderStartInput.value = primaryValue;
        this.currentMin = primaryValue;
      } else {
        this.thumbEnd.style.left = this.calcPercentage(primaryValue) + "%";
        this.sliderEndInput.value = primaryValue;
        this.currentMax = primaryValue;
      }
    }
    setTo(min, max, inverted) {
      const clampedMin = Math.min(Math.max(min, this.sliderMin), this.sliderMax);
      const clampedMax = Math.min(Math.max(max, this.sliderMin), this.sliderMax);
      if (!inverted && min >= max) {
        this.cache.ui.error(`Cannot set min threshold to ${min} and max threshold to ${max} for ${this.propID}`);
        return;
      }
      if (inverted && max <= min) {
        this.cache.ui.error(`Cannot set threshold to LOWER THAN ${min} OR GREATER THAN ${max} for inverted ${this.propID}`);
        return;
      }
      if (min < this.sliderMin) {
        this.cache.ui.warning(`Minimum threshold for ${this.propID} corrected to ${clampedMin} (from ${min})`);
      }
      if (max > this.sliderMax) {
        this.cache.ui.warning(`Maximum threshold for ${this.propID} corrected to ${clampedMax} (from ${max})`);
      }
      this.sliderStart.value = inverted ? clampedMax : clampedMin;
      this.sliderEnd.value = inverted ? clampedMin : clampedMax;
      this.handleThresholdOnInputEvent(true);
      this.handleThresholdOnInputEvent(false);
      this.writeCurrentFilterSettings();
    }
  };
  var UIComponentManager = class {
    constructor(cache3) {
      this.cache = cache3;
    }
    buildDropdownOptions() {
      let selectViewDropdown = document.getElementById("selectView");
      let selectViewOptions = Object.keys(this.cache.data.layouts).map((key) => {
        let selected = this.cache.data.selectedLayout === key ? "selected" : "";
        return `<option value="${key}" ${selected}>${key}</option>`;
      });
      selectViewDropdown.innerHTML = selectViewOptions.join("");
    }
    createSectionToggleButton(enable, section, subSection = null) {
      const btn = document.createElement("button");
      btn.className = "small-btn toggle-section-btn ml-1";
      if (subSection) btn.classList.add("extra-small");
      btn.textContent = enable ? "\u2714" : "\u2717";
      btn.title = `${enable ? "Enable" : "Disable"} all filters for the ${subSection ? "group: \n \u2514\u2500 " + section + "\n        \u2514\u2500 " + subSection : "section: \n \u2514\u2500 " + section}`;
      btn.onclick = async () => {
        subSection ? await this.cache.ui.toggleSubSection(enable, section, subSection) : await this.cache.ui.toggleSection(enable, section);
      };
      return btn;
    }
    createSectionResetButton(section, subSection = void 0) {
      const btn = document.createElement("button");
      btn.className = "small-btn toggle-section-btn ml-1";
      if (subSection) btn.classList.add("extra-small");
      btn.textContent = "\u27F3";
      btn.title = `Reset all filters for the ${subSection ? "group to their default values: \n \u2514\u2500 " + section + "\n        \u2514\u2500 " + subSection : "section to their default values: \n \u2514\u2500 " + section}`;
      btn.onclick = async () => {
        await this.cache.fm.resetFilters(section, subSection);
      };
      return btn;
    }
    alignUIWithJSConstants() {
      document.getElementById("resetSelectedElementsStyleBtn").title = this.cache.CFG.RESET_SELECTION_BUTTON_RESETS_POSITIONS ? "Reset the visual appearance and positions of the selected elements to their defaults" : "Reset the visual appearance of the selected elements to their defaults";
    }
    createCircleGroupButtonWithQuadrants(propID) {
      const circleButton = document.createElement("div");
      circleButton.className = `circle-button`;
      for (let [group, quadrantPosition] of Object.entries(DEFAULTS.BUBBLE_GROUP_QUADRANT_POSITIONS)) {
        const quadrant = document.createElement("button");
        quadrant.classList.add("quadrant");
        quadrant.classList.add(quadrantPosition);
        this.cache.data.layouts[this.cache.data.selectedLayout].filters.get(propID)[`${group}Members`].size === 0 ? quadrant.classList.remove("active") : quadrant.classList.add("active");
        quadrant.addEventListener("click", async () => {
          let shouldShowRemove = quadrant.classList.contains("active");
          let members = this.cache.data.layouts[this.cache.data.selectedLayout].filters.get(propID)[`${group}Members`];
          if (shouldShowRemove) {
            this.cache.data.layouts[this.cache.data.selectedLayout][`${group}Props`].delete(propID);
            quadrant.title = `Remove ${propID} from ${group}.`;
            members.delete(propID);
            quadrant.classList.remove("active");
            await this.cache.gcm.decideToRenderOrDraw();
          } else {
            this.cache.data.layouts[this.cache.data.selectedLayout][`${group}Props`].add(propID);
            quadrant.title = `Highlight ${propID} and add to bubble-group (${group})`;
            members.add(propID);
            quadrant.classList.add("active");
            await this.cache.gcm.decideToRenderOrDraw();
          }
        });
        quadrant.title = `Highlight ${propID} and add to bubble-group (${group})`;
        circleButton.appendChild(quadrant);
      }
      return circleButton;
    }
    buildToolTipText(nodeOrEdgeID, isEdge) {
      function initAndAddHeader() {
        const idFormatted = `<span class='purple'>ID: </span>${item.id}`;
        const label = item.label && item.label !== item.id ? `${item.label}<br><small>${idFormatted}</small>` : idFormatted;
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
          \u{1F4CA} <span class="tooltip-metric-header"></span>
        </h5>
        <p class="tooltip-metric-content"></p>
      </div>`;
        }
      }
      const item = isEdge ? this.cache.edgeRef.get(nodeOrEdgeID) : this.cache.nodeRef.get(nodeOrEdgeID);
      let tooltip = initAndAddHeader();
      addDescription();
      addMetric();
      if (!item.D4Data) return tooltip;
      const sortedPropIDs = this.cache.CFG.SORT_TOOLTIPS ? [...this.cache.data.filterDefaults.keys()].sort() : [...this.cache.data.filterDefaults.keys()];
      const structuredData = [];
      function pushSubSectionProperty(secName, subName, prop, val) {
        let sectionObj = structuredData.find((s) => s.section === secName);
        if (!sectionObj) {
          sectionObj = { section: secName, subSections: [] };
          structuredData.push(sectionObj);
        }
        let subObj = sectionObj.subSections.find((sub) => sub.name === subName);
        if (!subObj) {
          subObj = { name: subName, props: [] };
          sectionObj.subSections.push(subObj);
        }
        subObj.props.push({ key: prop, value: val });
      }
      for (const propID of sortedPropIDs) {
        const [section, subSection, property] = StaticUtilities.decodePropHashId(propID);
        const rawValue = item.D4Data?.[section]?.[subSection]?.[property];
        if (rawValue === void 0) continue;
        if (this.cache.CFG.TOOLTIP_HIDE_NULL_VALUES && rawValue === 0) continue;
        const displayValue = isNaN(rawValue) ? rawValue : StaticUtilities.formatNumber(rawValue, this.cache.CFG.FILTER_VISUAL_FLOAT_PRECISION);
        pushSubSectionProperty(section, subSection, property, displayValue);
      }
      function sortProps() {
        for (const sec of structuredData) {
          for (const sub of sec.subSections) {
            sub.props.sort((a, b) => a.key.localeCompare(b.key));
          }
        }
      }
      if (this.cache.CFG.SORT_TOOLTIPS) sortProps();
      function flattenBlocks() {
        const blocks = [];
        for (const s of structuredData) {
          blocks.push({ type: "section", text: s.section });
          for (const sb of s.subSections) {
            blocks.push({ type: "subSection", section: s.section, text: sb.name, props: sb.props });
          }
        }
        return blocks;
      }
      const orderedBlocks = flattenBlocks();
      if (orderedBlocks.length === 0) return tooltip;
      const columns = [];
      const columnSize = Math.ceil(orderedBlocks.length / this.cache.CFG.TOOLTIP_MAX_COLUMNS);
      for (let i = 0; i < this.cache.CFG.TOOLTIP_MAX_COLUMNS; i++) {
        const start = i * columnSize;
        const end = start + columnSize;
        columns.push(orderedBlocks.slice(start, end));
      }
      function buildColumns() {
        tooltip += `<hr><div class="tooltip-columns">`;
        for (const col of columns) {
          tooltip += `<div class="tooltip-column">`;
          let startedList = false;
          for (const block of col) {
            if (block.type === "section") {
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
    createCheckbox(propID, prop) {
      const container = this.cache.uiComponents.createCheckboxContainer(propID);
      const wrapper = document.createElement("label");
      wrapper.className = "checkboxWrapper";
      wrapper.id = `filter-${propID}-checkbox-wrapper`;
      const input = this.cache.uiComponents.createCheckboxInput(propID, this.cache.data.layouts[this.cache.data.selectedLayout].filters.get(propID).active);
      const customCheckbox = this.cache.uiComponents.createCustomCheckbox(propID);
      const actionButton = this.cache.uiComponents.createAddToQueryButton(propID);
      const displayField = document.createElement("span");
      displayField.className = "checkboxLabel";
      displayField.textContent = prop;
      const updateCheckbox = () => {
        customCheckbox.textContent = input.checked ? "\u2714" : "";
        wrapper.title = this.cache.uiComponents.getCheckboxTT(input.checked, propID);
      };
      updateCheckbox();
      input.addEventListener("change", updateCheckbox);
      wrapper.addEventListener("change", async () => {
        this.cache.data.layouts[this.cache.data.selectedLayout].filters.get(propID).active = input.checked;
        input.checked ? this.cache.activeProps.add(propID) : this.cache.activeProps.delete(propID);
        let status = input.checked ? "Showing" : "Hiding";
        await this.cache.fm.handleFilterEvent(`${status} Elements`, `Nodes and related edges for ${propID}`);
      });
      wrapper.append(input, customCheckbox);
      container.append(wrapper, actionButton, displayField);
      input.checked ? this.cache.activeProps.add(propID) : this.cache.activeProps.delete(propID);
      return container;
    }
    createQueryButton(propID, prop) {
      const btn = document.createElement("button");
      btn.className = "showOnQuery tiny-btn";
      btn.textContent = "Q";
      btn.title = `Query for nodes with the property:
 * ${propID}`;
      btn.onclick = async () => {
        console.log("foo");
      };
      return btn;
    }
    createCheckboxContainer(propID) {
      const container = document.createElement("div");
      container.className = "checkboxContainer";
      container.id = `filter-${propID}-container`;
      return container;
    }
    createCheckboxInput(propID, initialState) {
      const input = document.createElement("input");
      input.id = `filter-${propID}-checkbox`;
      input.type = "checkbox";
      input.checked = initialState;
      input.style.display = "none";
      return input;
    }
    createCustomCheckbox(propID) {
      const customCheckbox = document.createElement("span");
      customCheckbox.id = `filter-${propID}-checkbox-inner`;
      customCheckbox.className = "checkbox checkbox-green";
      return customCheckbox;
    }
    createAddToQueryButton(propID) {
      const actionButton = document.createElement("button");
      actionButton.className = "add-to-query-button";
      actionButton.textContent = "\u{1F4DD}";
      actionButton.title = `Add ${propID} to the query`;
      actionButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const slider = this.cache.propIDToInvertibleRangeSliders.get(propID);
        const dropdown = this.cache.propIDToDropdownChecklists.get(propID);
        let queryFragment;
        if (slider) {
          if (this.cache.CFG.QUERY_BTN_USE_CURRENT_FILTER) {
            queryFragment = slider.isInverted ? `${propID} LOWER THAN ${slider.currentMax} OR GREATER THAN ${slider.currentMin}` : `${propID} BETWEEN ${slider.currentMin} AND ${slider.currentMax}`;
          } else {
            queryFragment = `(${propID} BETWEEN ${slider.sliderMin} AND ${slider.sliderMax}`;
          }
        } else if (dropdown) {
          if (this.cache.CFG.QUERY_BTN_USE_CURRENT_FILTER) {
            queryFragment = `${propID} IN [${[...dropdown.selectedCategories].join(",")}]`;
          } else {
            queryFragment = `${propID} IN [${[...dropdown.categories].join(",")}]`;
          }
        }
        if (this.cache.data.layouts[this.cache.data.selectedLayout]["query"] === void 0) {
          this.cache.qm.handleQueryValidationEvent();
        }
        if (!this.cache.query.text.textContent.trim()) {
          this.cache.data.layouts[this.cache.data.selectedLayout]["query"] = `(${queryFragment})`;
        } else {
          this.cache.data.layouts[this.cache.data.selectedLayout]["query"] += ` OR (${queryFragment})`;
        }
        this.cache.qm.updateQueryTextArea();
      });
      return actionButton;
    }
    getCheckboxTT(enable, propID) {
      return `Click to ${enable ? "hide" : "show"} elements with the property:${StaticUtilities.formatPropsAsTree(propID)}`;
    }
    createAddOrRemoveToSelectionButton(propID, shouldAdd) {
      const btn = document.createElement("button");
      btn.classList.add("plus-minus-button", "show-on-edit");
      btn.textContent = shouldAdd ? "+" : "-";
      btn.title = shouldAdd ? "Add to selection" : "Remove from selection";
      btn.addEventListener("click", async () => {
        const nodeIDs = this.cache.propIDsToNodeIDsToBeShown.get(propID) || [];
        if (nodeIDs.size > 0) {
          const nodes = this.cache.graph.getNodeData([...nodeIDs]);
          await this.cache.sm.updateSelectedState(nodes, shouldAdd);
        }
        const edgeIDs = this.cache.propIDsToEdgeIDsToBeShown.get(propID) || [];
        if (edgeIDs.size > 0) {
          const edges = this.cache.graph.getEdgeData([...edgeIDs]);
          await this.cache.sm.updateSelectedState(edges, shouldAdd);
        }
      });
      return btn;
    }
  };

  // src/managers/ui_style_div.js
  function createStyleDiv(cache3) {
    const root = document.createElement("div");
    function createNewRow(parent) {
      const row = document.createElement("div");
      row.classList.add("card-row");
      parent.appendChild(row);
      return row;
    }
    function appendVerticalRule(parent, label = void 0, tooltip = void 0, id = void 0, customCSSClass = void 0) {
      const verticalRule = document.createElement("div");
      verticalRule.className = "vr";
      if (customCSSClass) verticalRule.classList.add(customCSSClass);
      parent.appendChild(verticalRule);
      appendLabel(parent, label, tooltip, id, customCSSClass);
    }
    function createLabel(labelText, tooltip = void 0) {
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
    function appendLabel(parent, labelText, tooltip = void 0, id = void 0, customCSSClass = void 0) {
      const label = createLabel(labelText, tooltip);
      if (id) label.id = id;
      if (customCSSClass) label.classList.add(customCSSClass);
      if (label) parent.appendChild(label);
    }
    function createCard(label, parent = void 0) {
      const card = document.createElement("div");
      card.classList.add("card-labeled");
      card.cache.data.et.label = label;
      card.id = label;
      if (parent) {
        parent.appendChild(card);
      } else {
        root.appendChild(card);
      }
      return card;
    }
    function createSwitch(callback = void 0, inputId = void 0, enabledByDefault = false) {
      const label = document.createElement("label");
      label.className = "switch";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = enabledByDefault;
      const span = document.createElement("span");
      span.className = "slider round";
      if (callback) {
        input.addEventListener("change", callback);
      }
      if (inputId) {
        input.id = inputId;
        label.id = `${inputId}Label`;
      }
      label.append(input, span);
      label.setChecked = (checked) => {
        input.checked = checked;
      };
      label.toggle = () => {
        input.checked = !input.checked;
      };
      label.isChecked = () => input.checked;
      return label;
    }
    async function handleStyleChangeEvent(property, value) {
      const commands = [];
      if (value === "set_continuous_color_scale") {
        commands.push("set_continuous_color_scale");
      }
      if (property.startsWith("Bubble Set")) {
        await cache3.bs.updateBubbleSetStyle(property, value);
        return;
      }
      switch (property) {
        case "Node Size":
          await cache3.gcm.updateNodes({ style: { size: value } }, commands);
          break;
        case "Node Border Size":
          await cache3.gcm.updateNodes({ style: { lineWidth: value } }, commands);
          break;
        case "Node Label Font Size":
          await cache3.gcm.updateNodes({ style: { labelFontSize: value } }, commands);
          break;
        case "Node Label Font Color":
          await cache3.gcm.updateNodes({ style: { labelFill: value } }, commands);
          break;
        case "Node Label Background Color":
          await cache3.gcm.updateNodes({ style: { labelBackground: true, labelBackgroundFill: value } }, commands);
          break;
        case "Node Fill Color":
          await cache3.gcm.updateNodes({ style: { fill: value } }, commands);
          break;
        case "Node Border Color":
          await cache3.gcm.updateNodes({ style: { stroke: value } }, commands);
          break;
        case "Node Label Color":
          await cache3.gcm.updateNodes({ style: { labelFill: value } }, commands);
          break;
        case "Node Label Placement":
          await cache3.gcm.updateNodes({ style: { labelPlacement: value } }, commands);
          break;
        case "Edge Color":
          await cache3.gcm.updateEdges({ style: { stroke: value } }, commands);
          break;
        case "Edge Width":
          await cache3.gcm.updateEdges({ style: { lineWidth: value } }, commands);
          break;
        case "Edge Dash":
          await cache3.gcm.updateEdges({ style: { lineDash: value } }, commands);
          break;
        case "Edge Label Font Size":
          await cache3.gcm.updateEdges({ style: { labelFontSize: value } }, commands);
          break;
        case "Edge Label Offset X":
          await cache3.gcm.updateEdges({ style: { labelOffsetX: value } }, commands);
          break;
        case "Edge Label Offset Y":
          await cache3.gcm.updateEdges({ style: { labelOffsetY: value } }, commands);
          break;
        case "Edge Label Placement":
          await cache3.gcm.updateEdges({ style: { labelPlacement: value } }, commands);
          break;
        case "Edge Label Font Color":
          await cache3.gcm.updateEdges({ style: { labelFill: value } }, commands);
          break;
        case "Edge Label Background Color":
          await cache3.gcm.updateEdges({ style: { labelBackground: true, labelBackgroundFill: value } }, commands);
          break;
        case "Edge Label Auto Rotate":
          await cache3.gcm.updateEdges({ style: { labelAutoRotate: value } }, commands);
          break;
        case "Edge Start Arrow":
          await cache3.gcm.updateEdges({ style: { startArrow: value } }, commands);
          break;
        case "Edge End Arrow":
          await cache3.gcm.updateEdges({ style: { endArrow: value } }, commands);
          break;
        case "Edge Start Arrow Size":
          await cache3.gcm.updateEdges({ style: { startArrowSize: value } }, commands);
          break;
        case "Edge End Arrow Size":
          await cache3.gcm.updateEdges({ style: { endArrowSize: value } }, commands);
          break;
        case "Edge Start Arrow Type":
          await cache3.gcm.updateEdges({ style: { startArrowType: value } }, commands);
          break;
        case "Edge End Arrow Type":
          await cache3.gcm.updateEdges({ style: { endArrowType: value } }, commands);
          break;
        case "Edge Halo":
          await cache3.gcm.updateEdges({ style: { halo: value } }, commands);
          break;
        case "Edge Halo Width":
          await cache3.gcm.updateEdges({ style: { haloLineWidth: value } }, commands);
          break;
        case "Edge Halo Color":
          await cache3.gcm.updateEdges({ style: { haloStroke: value } }, commands);
          break;
        default:
          break;
      }
    }
    function createBooleanControls(parent, property, tooltip = void 0) {
      const onBtn = document.createElement("button");
      onBtn.textContent = "On";
      onBtn.classList.add("style-inner-button");
      onBtn.onclick = async () => {
        await handleStyleChangeEvent(property, true);
      };
      if (tooltip) onBtn.title = tooltip;
      parent.appendChild(onBtn);
      const offBtn = document.createElement("button");
      offBtn.textContent = "Off";
      offBtn.classList.add("style-inner-button");
      offBtn.onclick = async () => {
        await handleStyleChangeEvent(property, false);
      };
      if (tooltip) offBtn.title = tooltip;
      parent.appendChild(offBtn);
    }
    function createCategoricalControls(parent, property, defaultValue, listOfValues, tooltip = void 0) {
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
    }, tooltip = void 0) {
      const useFloat = !Number.isInteger(sliderParams.min) || !Number.isInteger(sliderParams.max) || !Number.isInteger(sliderParams.step);
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
    function createColorControls(parent, property, defaultColor, colors, continuousScaleBtn = true, customCSSClass = void 0) {
      const colorButtonDiv = document.createElement("div");
      colorButtonDiv.className = "style-color-button-container";
      if (customCSSClass) colorButtonDiv.classList.add(customCSSClass);
      for (const [label, value] of Object.entries(colors)) {
        const colorButton = document.createElement("button");
        colorButton.style.backgroundColor = value;
        colorButton.style.color = StaticUtilities.getReadableForegroundColor(value);
        colorButton.className = "style-inner-button style-color-button";
        colorButton.title = `Set ${property} of the selected elements to ${label} (${value}).`;
        if (label === "none") {
          colorButton.textContent = "\xD7";
          colorButton.style.maxWidth = "12px";
        }
        colorButton.onclick = async () => {
          colorInput.value = value;
          await handleStyleChangeEvent(property, value);
        };
        if (customCSSClass) colorButton.classList.add(customCSSClass);
        colorButtonDiv.appendChild(colorButton);
      }
      parent.appendChild(colorButtonDiv);
      const colorPicker = createColorPicker(
        defaultColor,
        `Set ${property} of the selected elements to a color of choice.`
      );
      colorPicker.oninput = () => {
        colorInput.value = colorPicker.value;
      };
      colorPicker.onchange = async () => {
        await handleStyleChangeEvent(property, colorPicker.value);
      };
      const colorInput = document.createElement("input");
      colorInput.type = "text";
      colorInput.value = defaultColor;
      colorInput.classList.add("style-input");
      colorInput.title = `Set ${property} of the selected elements to a color of choice (RGBA hex color code). Confirm with Enter`;
      colorInput.placeholder = `Enter Color`;
      colorInput.addEventListener("keypress", async function(event) {
        if (event.key === "Enter") {
          event.preventDefault();
          await handleStyleChangeEvent(property, colorInput.value);
        }
      });
      if (customCSSClass) {
        colorPicker.classList.add(customCSSClass);
        colorInput.classList.add(customCSSClass);
      }
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
        if (customCSSClass) contScaleBtn.classList.add(customCSSClass);
        parent.appendChild(contScaleBtn);
      }
    }
    function createLabelControls(parent, property, isNode = null) {
      const labelInput = createInput(
        120,
        `Enter Custom ${property}`,
        `Set the label of the selected ${isNode ? "nodes" : "edges"} to a custom label.`,
        void 0,
        async () => {
          isNode ? await cache3.gcm.updateNodes({
            style: {
              label: true,
              labelText: labelInput.value.trim()
            }
          }) : await cache3.gcm.updateEdges({ style: { label: true, labelText: labelInput.value.trim() } });
        }
      );
      const clearLabelButton = createButton(
        "Clear",
        `Clear the label of the selected ${isNode ? "nodes" : "edges"}.`,
        async () => {
          labelInput.value = "";
          const sharedOverride = {
            style: {
              label: true,
              labelText: cache3.CFG.INVISIBLE_CHAR
            }
          };
          isNode ? await cache3.gcm.updateNodes(sharedOverride) : await cache3.gcm.updateEdges(sharedOverride);
          labelInput.value = "";
        }
      );
      const setToIDButton = createButton(
        "Set to ID",
        `Set the label of the selected ${isNode ? "nodes" : "edges"} to their predefined IDs.`,
        async () => {
          labelInput.value = "";
          const sharedCommands = ["label_set_to_id"];
          isNode ? await cache3.gcm.updateNodes(void 0, sharedCommands) : await cache3.gcm.updateEdges(void 0, sharedCommands);
        }
      );
      const setToLabelButton = createButton(
        "Set to Label",
        `Set the label of the selected ${isNode ? "nodes" : "edges"} to their predefined labels.`,
        async () => {
          labelInput.value = "";
          const sharedCommands = ["label_set_to_label"];
          isNode ? await cache3.gcm.updateNodes(void 0, sharedCommands) : await cache3.gcm.updateEdges(void 0, sharedCommands);
        }
      );
      parent.appendChild(labelInput);
      parent.appendChild(setToIDButton);
      parent.appendChild(setToLabelButton);
      parent.appendChild(clearLabelButton);
    }
    function createButton(label, tooltip, callback, id = void 0) {
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
      };
      return btn;
    }
    function appendButton(parent, label, tooltip, callback) {
      const btn = createButton(label, tooltip, callback);
      parent.appendChild(btn);
    }
    function createInput(widthInPx = 80, placeholder = void 0, title = void 0, defaultValue = void 0, callback = void 0) {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = placeholder;
      input.title = title;
      input.classList.add("style-input");
      input.style.width = `${widthInPx}px`;
      input.value = defaultValue || "";
      if (callback) {
        input.addEventListener("keypress", function(event) {
          if (event.key === "Enter") {
            event.preventDefault();
            callback(input.value.trim());
          }
        });
      }
      return input;
    }
    function createNodeShapeControls(parent) {
      for (const [label, value] of Object.entries(cache3.DEFAULTS.STYLES.NODE_FORM)) {
        appendButton(
          parent,
          label,
          value,
          async () => await cache3.gcm.updateNodes({ type: value })
        );
      }
    }
    function createEdgeTypeControls(parent) {
      for (const label of cache3.DEFAULTS.STYLES.EDGE_TYPES) {
        appendButton(parent, label, label, async () => await cache3.gcm.updateEdges({ type: label }));
      }
    }
    function createNodeBadgeControls(parent) {
      const badgeInput = createInput(
        120,
        "Enter Badge Text",
        "Enter the text of the badge to add to the selected nodes.",
        void 0,
        void 0
      );
      parent.appendChild(badgeInput);
      const badgeColorPicker = createColorPicker(cache3.DEFAULTS.NODE.BADGE.COLOR, "Set the color of the badge.");
      parent.appendChild(badgeColorPicker);
      const badgePlacementDropdown = document.createElement("select");
      badgePlacementDropdown.className = "style-inner-button";
      cache3.DEFAULTS.STYLES.NODE_BADGE_PLACEMENTS.forEach((placement) => {
        const option = document.createElement("option");
        option.value = placement;
        option.textContent = placement.replace("-", " ");
        badgePlacementDropdown.appendChild(option);
      });
      parent.appendChild(badgePlacementDropdown);
      appendButton(parent, "Add", "Add a badge to the selected nodes.", async () => {
        await cache3.gcm.updateNodes(
          {
            style: {
              badges: [{
                text: badgeInput.value.trim(),
                placement: badgePlacementDropdown.value
              }],
              badgePalette: [badgeColorPicker.value]
            }
          },
          ["badge_add"]
        );
      });
      appendButton(parent, "Clear", "Clear all badges from the selected nodes.", async () => {
        await cache3.gcm.updateNodes({}, ["badge_clear"]);
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
    function appendEditableDropdown(parent, isNode, widthInPx = 220) {
      const input = document.createElement("input");
      const dataListID = `focusOptions${isNode ? "Node" : "Edge"}`;
      input.setAttribute("list", dataListID);
      input.placeholder = `Search ${isNode ? "node" : "edge"} ID or label...`;
      input.classList.add("style-input");
      input.style.width = `${widthInPx}px`;
      const datalist = document.createElement("datalist");
      datalist.id = dataListID;
      const sourceMap = isNode ? cache3.nodeIDOrLabelToNodeIDs : cache3.edgeIDOrLabelToEdgeIDs;
      for (const key of sourceMap.keys()) {
        const option = document.createElement("option");
        option.value = key;
        datalist.appendChild(option);
      }
      const focusButton = document.createElement("button");
      focusButton.textContent = "Focus";
      focusButton.classList.add("style-inner-button");
      focusButton.onclick = async () => {
        const selectedValue = input.value;
        if (selectedValue) {
          const ids = sourceMap.get(selectedValue);
          if (ids) {
            if (ids.size !== 1) {
              cache3.ui.warning(`Ambiguous selection: ${selectedValue} matches ${ids.size} ${isNode ? "nodes" : "edges"} (${Array.from(ids).join(",")}).`);
            }
            await cache3.gcm.focusElements(ids, isNode);
          } else {
            cache3.ui.warning(`No ${isNode ? "node" : "edge"} found for: ${selectedValue}`);
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
      appendButton(
        rowOne,
        "All Nodes",
        "Select all visible nodes",
        async () => await cache3.sm.toggleSelectionForAllNodes(true)
      );
      appendButton(
        rowOne,
        "No Nodes",
        "Deselect all visible nodes",
        async () => await cache3.sm.toggleSelectionForAllNodes(false)
      );
      appendVerticalRule(rowOne);
      appendButton(
        rowOne,
        "All Edges",
        "Select all visible edges",
        async () => await cache3.sm.toggleSelectionForAllEdges(true)
      );
      appendButton(
        rowOne,
        "No Edges",
        "Deselect all visible edges",
        async () => await cache3.sm.toggleSelectionForAllEdges(false)
      );
      appendVerticalRule(rowOne);
      appendButton(
        rowOne,
        "Expand Edges",
        "Add all edges connected to the currently selected nodes to the selection",
        async () => await cache3.sm.toggleSelectionByNeighbors("expand-edges")
      );
      appendButton(
        rowOne,
        "Reduce Edges",
        "Remove edges that do not connect two selected nodes",
        async () => await cache3.sm.toggleSelectionByNeighbors("reduce-edges")
      );
      appendVerticalRule(rowOne);
      appendButton(
        rowOne,
        "Expand Neighbors",
        "Add all directly connected neighbor nodes (and their edges) to the current selection",
        async () => await cache3.sm.toggleSelectionByNeighbors("expand-neighbors")
      );
      appendButton(
        rowOne,
        "Reduce Neighbors",
        "Remove the outermost layer of selected neighbor nodes (and their edges) from the ",
        async () => await cache3.sm.toggleSelectionByNeighbors("reduce-neighbors")
      );
      const rowTwo = createNewRow(selDiv);
      const nodeIDsTT = "Enter comma-separated list of node IDs to add/remove to/from selection\nConfirm with Enter";
      appendLabel(rowTwo, "Node ID(s)", nodeIDsTT);
      const topTwoNodeIDs = cache3.data?.nodes?.slice(0, 2).map((n) => n.id).join(",") || "Node1,Node2";
      const nodeIDsInput = createInput(
        204,
        topTwoNodeIDs,
        nodeIDsTT,
        void 0,
        async (val) => {
          await cache3.sm.addNodeOrEdgeIDsToSelectionWrapper(val, true);
        }
      );
      nodeIDsInput.id = "selectByNodeIDsInput";
      rowTwo.appendChild(nodeIDsInput);
      const nodeIDsInputSwitch = createSwitch((e) => {
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
          await cache3.sm.addNodeOrEdgeIDsToSelectionWrapper(elements, true);
        }
      }, "selectByNodeIDsButton");
      rowTwo.appendChild(includeNodesByIdBtn);
      const edgeIDsTT = "Enter comma-separated list of edge IDs (SourceID::TargetID) to add/remove to/from selection\nConfirm with Enter";
      appendVerticalRule(rowTwo, "Edge ID(s)", edgeIDsTT);
      const topTwoEdgeIDs = cache3.data?.edges?.slice(0, 2).map((e) => e.id).join(",") || "Node1::Node2,Node1::Node3";
      const edgeIDsInput = createInput(
        204,
        topTwoEdgeIDs,
        edgeIDsTT,
        void 0,
        async (val) => {
          await cache3.sm.addNodeOrEdgeIDsToSelectionWrapper(val, false);
        }
      );
      edgeIDsInput.id = "selectByEdgeIDsInput";
      rowTwo.appendChild(edgeIDsInput);
      const edgeIDsInputSwitch = createSwitch((e) => {
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
          await cache3.sm.addNodeOrEdgeIDsToSelectionWrapper(elements, false);
        }
      }, "selectByEdgeIDsButton");
      rowTwo.appendChild(includeEdgesByIdBtn);
      conditionallyCreateNodeOrEdgeSelectionRow(selDiv);
    }
    function conditionallyCreateNodeOrEdgeSelectionRow(selDiv) {
      let row;
      if (cache3.nodeLabels.length > 0 || cache3.edgeLabels.length > 0) {
        row = createNewRow(selDiv);
      }
      if (cache3.nodeLabels.length > 0) {
        const nodeLabelsTT = "Enter comma-separated list of node labels to add/remove to/from selection\nConfirm with Enter";
        appendLabel(row, "Node Label(s)", nodeLabelsTT);
        const topTwoNodeLabels = cache3.nodeLabels?.slice(0, 2).join(",") || "Label1,Label2";
        const nodeLabelsInput = createInput(
          200,
          topTwoNodeLabels,
          nodeLabelsTT,
          void 0,
          async (val) => {
            await cache3.sm.addNodeOrEdgeLabelsToSelectionWrapper(val, true);
          }
        );
        nodeLabelsInput.id = "selectByNodeLabelsInput";
        row.appendChild(nodeLabelsInput);
        const nodeLabelsInputSwitch = createSwitch((e) => {
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
            await cache3.sm.addNodeOrEdgeLabelsToSelectionWrapper(elements, true);
          }
        }, "selectByNodeLabelsButton");
        row.appendChild(includeNodesByLabelBtn);
      }
      if (cache3.edgeLabels.length > 0) {
        const edgeLabelsTT = "Enter comma-separated list of edge Labels to add/remove to/from selection\nConfirm with Enter";
        appendVerticalRule(row, "Edge Label(s)", edgeLabelsTT);
        const topTwoEdgeLabels = cache3.edgeLabels.slice(0, 2).join(",") || "Label1,Label2";
        const edgeLabelsInput = createInput(
          200,
          topTwoEdgeLabels,
          edgeLabelsTT,
          void 0,
          async (val) => {
            await cache3.sm.addNodeOrEdgeLabelsToSelectionWrapper(val, false);
          }
        );
        edgeLabelsInput.id = "selectByEdgeLabelsInput";
        row.appendChild(edgeLabelsInput);
        const edgeLabelsInputSwitch = createSwitch((e) => {
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
            await cache3.sm.addNodeOrEdgeLabelsToSelectionWrapper(elements, false);
          }
        }, "selectByEdgeLabelsButton");
        row.appendChild(includeEdgesByLabelBtn);
      }
    }
    function createArrangeNodesCard() {
      const arrDiv = createCard("Arrange Selection");
      const rowOne = createNewRow(arrDiv);
      appendButton(
        rowOne,
        "Shrink",
        "Move nodes closer together, halving their distance to the center.",
        () => cache3.lm.layoutSelectedNodes("shrink")
      );
      appendButton(
        rowOne,
        "Expand",
        "Move nodes farther apart, doubling their distance to the center.",
        () => cache3.lm.layoutSelectedNodes("expand")
      );
      appendVerticalRule(rowOne);
      appendButton(
        rowOne,
        "Circle",
        "Arrange nodes evenly in a circular layout around the center.",
        () => cache3.lm.layoutSelectedNodes("circle")
      );
      appendButton(
        rowOne,
        "Force",
        "Apply a force-directed layout to the selected nodes.",
        () => cache3.lm.layoutSelectedNodes("force")
      );
      appendButton(
        rowOne,
        "Grid",
        "Apply a uniform grid layout to the selected nodes.",
        () => cache3.lm.layoutSelectedNodes("grid")
      );
      appendButton(
        rowOne,
        "Random",
        "Apply a random layout to the selected nodes while preserving the original layout bonds.",
        () => cache3.lm.layoutSelectedNodes("random")
      );
    }
    function createNodeConfigCard() {
      const nodeDiv = createCard("Node Configuration");
      const rowOne = createNewRow(nodeDiv);
      appendLabel(rowOne, "Shape");
      createNodeShapeControls(rowOne);
      appendVerticalRule(rowOne, "Size");
      createNumericalSlider(
        rowOne,
        "Node Size",
        cache3.DEFAULTS.NODE.SIZE,
        { min: 10, max: 50, step: 1 }
      );
      appendVerticalRule(rowOne, "Fill Color");
      createColorControls(rowOne, "Node Fill Color", cache3.DEFAULTS.NODE.FILL_COLOR, cache3.DEFAULTS.STYLES.NODE_COLORS);
      const rowTwo = createNewRow(nodeDiv);
      appendLabel(rowTwo, "Border Size", "Defines the width of the border of the selected nodes.");
      createNumericalSlider(
        rowTwo,
        "Node Border Size",
        cache3.DEFAULTS.NODE.LINE_WIDTH,
        { min: 1, max: 10, step: 1 },
        "Defines the width of the border of the selected nodes."
      );
      appendVerticalRule(rowTwo, "Border Color", "Defines the fill color of the selected nodes.");
      createColorControls(
        rowTwo,
        "Node Border Color",
        cache3.DEFAULTS.NODE.STROKE_COLOR,
        cache3.DEFAULTS.STYLES.NODE_BORDER_COLORS
      );
      const rowThree = createNewRow(nodeDiv);
      appendLabel(rowThree, "Label", "Customize the selected nodes labels.");
      createLabelControls(rowThree, "Node Label", true);
      appendVerticalRule(rowThree, "Font Size", "Defines the font size of the selected nodes labels.");
      createNumericalSlider(
        rowThree,
        "Node Label Font Size",
        cache3.DEFAULTS.NODE.LABEL.FONT_SIZE,
        { min: 10, max: 30, step: 1 },
        "Defines the font size of the selected nodes labels."
      );
      appendVerticalRule(rowThree, "Placement", "Defines the placement of the selected nodes labels.");
      createCategoricalControls(
        rowThree,
        "Node Label Placement",
        cache3.DEFAULTS.NODE.LABEL.PLACEMENT,
        cache3.DEFAULTS.STYLES.NODE_LABEL_PLACEMENTS,
        "Defines the placement of the selected nodes labels."
      );
      const rowFour = createNewRow(nodeDiv);
      appendLabel(
        rowFour,
        "Label Color",
        "Defines the foreground (text) color of the selected nodes labels."
      );
      createColorControls(
        rowFour,
        "Node Label Font Color",
        cache3.DEFAULTS.NODE.LABEL.FOREGROUND_COLOR,
        cache3.DEFAULTS.STYLES.NODE_LABEL_COLORS
      );
      appendVerticalRule(
        rowFour,
        "Label Background Color",
        "Defines the background color of the selected nodes labels."
      );
      createColorControls(
        rowFour,
        "Node Label Background Color",
        cache3.DEFAULTS.NODE.LABEL.BACKGROUND_COLOR,
        cache3.DEFAULTS.STYLES.NODE_LABEL_BACKGROUND_COLORS
      );
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
      createNumericalSlider(
        rowOne,
        "Edge Width",
        cache3.DEFAULTS.EDGE.LINE_WIDTH,
        { min: 0.1, max: 10, step: 0.1 },
        "Change the width of the selected edges."
      );
      appendVerticalRule(rowOne, "Dash", "Define the dash pattern of the selected edges.");
      createNumericalSlider(
        rowOne,
        "Edge Dash",
        cache3.DEFAULTS.EDGE.LINE_DASH,
        { min: 0, max: 40, step: 1 },
        "Define the dash pattern of the selected edges."
      );
      appendVerticalRule(rowOne, "Color", "Define the selected edges color.");
      createColorControls(rowOne, "Edge Color", cache3.DEFAULTS.EDGE.COLOR, cache3.DEFAULTS.STYLES.EDGE_COLORS);
      const rowTwo = createNewRow(edgeDiv);
      appendLabel(rowTwo, "Label", "Customize the selected edges labels.");
      createLabelControls(rowTwo, "Edge Label");
      appendVerticalRule(rowTwo, "Font Size", "Defines the font size of the selected edges labels.");
      createNumericalSlider(
        rowTwo,
        "Edge Label Font Size",
        cache3.DEFAULTS.EDGE.LABEL.FONT_SIZE,
        { min: 10, max: 30, step: 1 },
        "Defines the font size of the selected edges labels."
      );
      appendVerticalRule(rowTwo, "Placement", "Defines the placement of the selected edges labels.");
      createCategoricalControls(
        rowTwo,
        "Edge Label Placement",
        cache3.DEFAULTS.EDGE.LABEL.PLACEMENT,
        cache3.DEFAULTS.STYLES.EDGE_LABEL_PLACEMENTS,
        "Defines the placement of the selected edges labels."
      );
      appendVerticalRule(rowTwo, "Rotate", "Enable/Disable label rotation.");
      createBooleanControls(rowTwo, "Edge Label Auto Rotate", "Enable/Disable label rotation.");
      const rowThree = createNewRow(edgeDiv);
      appendLabel(
        rowThree,
        "Label Offset X",
        "Define the offset of the selected edges labels along the X-axis."
      );
      createNumericalSlider(
        rowThree,
        "Edge Label Offset X",
        cache3.DEFAULTS.EDGE.LABEL.OFFSET_X,
        { min: -100, max: 100, step: 1 },
        "Define the offset of the selected edges labels along the X-axis."
      );
      appendVerticalRule(
        rowThree,
        "Label Offset Y",
        "Define the offset of the selected edges labels along the Y-axis."
      );
      createNumericalSlider(
        rowThree,
        "Edge Label Offset Y",
        cache3.DEFAULTS.EDGE.LABEL.OFFSET_Y,
        { min: -100, max: 100, step: 1 },
        "Define the offset of the selected edges labels along the Y-axis."
      );
      const rowFour = createNewRow(edgeDiv);
      appendLabel(
        rowFour,
        "Label Color",
        "Defines the foreground (text) color of the selected edges labels."
      );
      createColorControls(
        rowFour,
        "Edge Label Font Color",
        cache3.DEFAULTS.EDGE.LABEL.FOREGROUND_COLOR,
        cache3.DEFAULTS.STYLES.EDGE_LABEL_COLORS,
        "Defines the foreground (text) color of the selected edges labels."
      );
      appendVerticalRule(
        rowFour,
        "Label Background Color",
        "Defines the background color of the selected edges labels."
      );
      createColorControls(
        rowFour,
        "Edge Label Background Color",
        cache3.DEFAULTS.EDGE.LABEL.BACKGROUND_COLOR,
        cache3.DEFAULTS.STYLES.EDGE_LABEL_BACKGROUND_COLORS,
        "Defines the background color of the selected edges labels."
      );
      const rowFive = createNewRow(edgeDiv);
      appendLabel(rowFive, "Start Arrow", "Enable/Disable the start arrow of the selected edges.");
      createBooleanControls(rowFive, "Edge Start Arrow", "Enable/Disable the start arrow of the selected edges.");
      appendVerticalRule(rowFive, "Size", "Define the size of the start arrow of the selected edges.");
      createNumericalSlider(
        rowFive,
        "Edge Start Arrow Size",
        cache3.DEFAULTS.EDGE.ARROWS.START_SIZE,
        { min: 10, max: 40, step: 1 },
        "Define the size of the start arrow of the selected edges."
      );
      appendVerticalRule(rowFive, "Type", "Define the type of the start arrow of the selected edges.");
      createCategoricalControls(
        rowFive,
        "Edge Start Arrow Type",
        cache3.DEFAULTS.EDGE.ARROWS.START_TYPE,
        cache3.DEFAULTS.STYLES.EDGE_ARROW_TYPES,
        "Define the type of the start arrow of the selected edges."
      );
      const rowSix = createNewRow(edgeDiv);
      appendLabel(rowSix, "End Arrow", "Enable/Disable the end arrow of the selected edges.");
      createBooleanControls(rowSix, "Edge End Arrow", "Enable/Disable the end arrow of the selected edges.");
      appendVerticalRule(rowSix, "Size", "Define the size of the end arrow of the selected edges.");
      createNumericalSlider(
        rowSix,
        "Edge End Arrow Size",
        cache3.DEFAULTS.EDGE.ARROWS.END_SIZE,
        { min: 10, max: 40, step: 1 },
        "Define the size of the end arrow of the selected edges."
      );
      appendVerticalRule(rowSix, "Type", "Define the type of the end arrow of the selected edges.");
      createCategoricalControls(
        rowSix,
        "Edge End Arrow Type",
        cache3.DEFAULTS.EDGE.ARROWS.END_TYPE,
        cache3.DEFAULTS.STYLES.EDGE_ARROW_TYPES,
        "Define the type of the end arrow of the selected edges."
      );
      const rowSeven = createNewRow(edgeDiv);
      appendLabel(rowSeven, "Halo", "Enable/Disable a halo around the selected edges.");
      createBooleanControls(rowSeven, "Edge Halo", "Enable/Disable a halo around the selected edges.");
      appendVerticalRule(rowSeven, "Color", "Define the color of the halo for the selected edges.");
      createColorControls(
        rowSeven,
        "Edge Halo Color",
        cache3.DEFAULTS.EDGE.COLOR,
        cache3.DEFAULTS.STYLES.EDGE_COLORS
      );
      appendVerticalRule(rowSeven, "Width", "Define the halo width for the selected edges.");
      createNumericalSlider(
        rowSeven,
        "Edge Halo Width",
        cache3.DEFAULTS.EDGE.HALO.WIDTH,
        { min: 1, max: 30, step: 1 },
        "Define the halo width for the selected edges."
      );
    }
    function createBubbleSetConfigCard() {
      const bubbleDiv = createCard("Bubble Set Configuration");
      const optionalCSSClass = "bubbleSetOptionalLabelConfig";
      let rowCount = 0;
      for (const group of cache3.bs.traverseBubbleSets()) {
        rowCount++;
        const card = createCard(`Bubble Set ${rowCount}`, bubbleDiv);
        card.id = `bubbleSetStyleCard${group}`;
        const rowOne = createNewRow(card);
        appendLabel(rowOne, "Fill Color");
        createColorControls(rowOne, `Bubble Set ${group} Fill Color`, cache3.data.bubbleSetStyle[group].fill, [], false);
        appendVerticalRule(rowOne, "Fill Opacity");
        createNumericalSlider(
          rowOne,
          `Bubble Set ${group} Fill Opacity`,
          cache3.data.bubbleSetStyle[group].fillOpacity,
          { min: 0, max: 1, step: 0.01 },
          `Define the fill opacity of the bubble set ${group}.`
        );
        appendVerticalRule(rowOne, "Stroke Color");
        createColorControls(rowOne, `Bubble Set ${group} Stroke Color`, cache3.data.bubbleSetStyle[group].stroke, [], false);
        appendVerticalRule(rowOne, "Stroke Opacity");
        createNumericalSlider(
          rowOne,
          `Bubble Set ${group} Stroke Opacity`,
          cache3.data.bubbleSetStyle[group].strokeOpacity,
          { min: 0, max: 1, step: 0.01 },
          `Define the stroke opacity of the bubble set ${group}.`
        );
        const rowTwo = createNewRow(card);
        appendLabel(rowTwo, "Label");
        const enableTextSwitch = createSwitch(async () => {
          await cache3.bs.updateBubbleSetStyle(`Bubble Set ${group} Label`, enableTextSwitch.isChecked());
        }, void 0, cache3.data.bubbleSetStyle[group].label);
        rowTwo.appendChild(enableTextSwitch);
        appendVerticalRule(rowTwo, "Label Text", void 0, void 0, optionalCSSClass);
        const labelInput = createInput(120, `${group} label text`, `Enter the label text for the bubble set ${group}.`, cache3.data.bubbleSetStyle[group].labelText, async () => {
          const val = labelInput.value.trim();
          await cache3.bs.updateBubbleSetStyle(`Bubble Set ${group} Label Text`, val);
        });
        labelInput.classList.add(optionalCSSClass);
        rowTwo.appendChild(labelInput);
        appendVerticalRule(rowTwo, "Label Background", void 0, void 0, optionalCSSClass);
        const enableBackgroundSwitch = createSwitch(async () => {
          await cache3.bs.updateBubbleSetStyle(`Bubble Set ${group} Label Background`, enableBackgroundSwitch.isChecked());
        }, void 0, cache3.data.bubbleSetStyle[group].labelBackground || true);
        enableBackgroundSwitch.classList.add(optionalCSSClass);
        rowTwo.appendChild(enableBackgroundSwitch);
        appendVerticalRule(rowTwo, "Label Background Color", void 0, void 0, optionalCSSClass);
        createColorControls(rowTwo, `Bubble Set ${group} Label Background Color`, cache3.data.bubbleSetStyle[group].labelBackgroundFill || cache3.data.bubbleSetStyle[group].fill, [], false, optionalCSSClass);
      }
    }
    createFocusCard();
    createSelectCard();
    createArrangeNodesCard();
    createNodeConfigCard();
    createEdgeConfigCard();
    createBubbleSetConfigCard();
    return root;
  }

  // src/managers/ui.js
  var UIManager = class {
    constructor(cache3, debugEnabled = false) {
      this.cache = cache3;
      this.debugEnabled = debugEnabled;
    }
    async showLoading(header, text = "") {
      const overlay = document.getElementById("loadingOverlay");
      overlay.style.display = "flex";
      overlay.style.opacity = "1";
      document.getElementById("loadingHeader").textContent = header;
      document.getElementById("loadingText").textContent = text;
      let logInfo = header;
      if (text) logInfo += `: ${text}`;
      this.debug(logInfo);
      overlay.getBoundingClientRect();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      return new Promise((resolve) => requestAnimationFrame(resolve));
    }
    async hideLoading() {
      const overlay = document.getElementById("loadingOverlay");
      overlay.style.opacity = "0";
      await new Promise((resolve) => {
        const transitionDuration = getComputedStyle(overlay).transitionDuration;
        const durationInMs = parseFloat(transitionDuration) * (transitionDuration.includes("ms") ? 1 : 1e3);
        setTimeout(resolve, durationInMs);
      });
      overlay.style.display = "none";
      this.refreshUI();
    }
    refreshUI() {
      if (!this.cache.initialized) return;
      this.toggleStyleElementsThatRequireAtLeastOneVisibleNode(this.cache.nodeIDsToBeShown.size > 0);
      this.toggleStyleElementsThatRequireAtLeastOneVisibleEdge(this.cache.edgeIDsToBeShown.size > 0);
      this.toggleStyleElementsThatRequireAtLeastOneVisibleNodeOrEdge(this.cache.nodeIDsToBeShown.size > 0 || this.cache.edgeIDsToBeShown.size > 0);
      document.getElementById("visibleNodes").innerHTML = `${this.cache.nodeIDsToBeShown.size - this.cache.hiddenDanglingNodeIDs.size}`;
      document.getElementById("totalNodes").innerHTML = `${this.cache.data.nodes.length}`;
      document.getElementById("visibleEdges").innerHTML = `${this.cache.edgeIDsToBeShown.size - this.cache.hiddenDanglingEdgeIDs.size}`;
      document.getElementById("totalEdges").innerHTML = `${this.cache.data.edges.length}`;
      this.refreshStashUI();
      this.cache.bs.refreshBubbleStyleElements();
    }
    toggleStyleElementsThatRequireAtLeastOneSelectedNode(enable) {
      this.toggleDisabledElements([
        "Node Configuration",
        "Expand Edges",
        "Reduce Edges",
        "Expand Neighbors",
        "Reduce Neighbors",
        "deselectNodesBtn",
        "focusNodesBtn"
      ], enable);
    }
    toggleStyleElementsThatRequireAtLeastOneSelectedEdge(enable) {
      this.toggleDisabledElements(["Edge Configuration", "deselectEdgesBtn", "focusEdgesBtn"], enable);
    }
    toggleStyleElementsThatRequireAtLeastOneSelectedNodeOrEdge(enable) {
      this.toggleDisabledElements(["resetSelectedElementsStyleBtn"], enable);
    }
    toggleStyleElementsThatRequireAtLeastOneVisibleNode(enable) {
      this.toggleDisabledElements([
        "selectByNodeIDsInput",
        "Node ID(s)",
        "selectByNodeIDsSwitch",
        "selectByNodeIDsSwitchLabel",
        "selectByNodeIDsButton"
      ], enable);
    }
    toggleStyleElementsThatRequireAtLeastOneVisibleEdge(enable) {
      this.toggleDisabledElements([
        "selectByEdgeIDsInput",
        "Edge ID(s)",
        "selectByEdgeIDsSwitch",
        "selectByEdgeIDsSwitchLabel",
        "selectByEdgeIDsButton"
      ], enable);
    }
    toggleStyleElementsThatRequireAtLeastOneVisibleNodeOrEdge(enable) {
      this.toggleDisabledElements(["Select Elements"], enable);
    }
    toggleStyleElementsThatRequireMoreThanOneSelectedNode(enable) {
      this.toggleDisabledElements(["Arrange Selection"], enable);
    }
    toggleDisabledElements(headingLabels, enable) {
      for (let elemID of headingLabels) {
        const elem = document.getElementById(elemID);
        if (elem) {
          enable ? elem.classList.remove("disabled") : elem.classList.add("disabled");
        } else {
          this.debug("Element not found: " + elemID);
        }
      }
    }
    refreshStashUI() {
      const select = document.getElementById("selectStash");
      const remove = document.getElementById("removeStash");
      const apply = document.getElementById("applyStash");
      const overwrite = document.getElementById("overwriteStash");
      const currentlySelected = select.value;
      select.innerHTML = "";
      for (const elem of [select, remove, apply, overwrite]) {
        if (Object.keys(this.cache.data.stash).length > 0) {
          elem.classList.remove("disabled");
        } else {
          elem.classList.add("disabled");
        }
      }
      for (const key of Object.keys(this.cache.data.stash)) {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = key;
        select.appendChild(option);
      }
      if (currentlySelected) {
        select.value = currentlySelected;
      } else if (Object.keys(this.cache.data.stash).length > 0) {
        select.value = Object.keys(this.cache.data.stash)[0];
      }
    }
    logMessage(text, colorClass, bold = false, iconPrefix = "") {
      const timestamp = StaticUtilities.getTimestamp();
      const container = document.getElementById("sidebarStatusContainer");
      container.style.height = "8%";
      const p = document.createElement("p");
      p.style.margin = "0 0 1px 0";
      const spanTime = document.createElement("span");
      spanTime.textContent = `${timestamp} | `;
      spanTime.classList.add("grey");
      p.appendChild(spanTime);
      if (iconPrefix) {
        const spanIcon = document.createElement("span");
        spanIcon.textContent = iconPrefix;
        spanIcon.classList.add("mr");
        p.appendChild(spanIcon);
      }
      const spanText = document.createElement("span");
      spanText.classList.add(colorClass);
      spanText.style.fontWeight = bold ? "bold" : "normal";
      spanText.textContent = text;
      p.appendChild(spanText);
      container.appendChild(p);
      container.scrollTop = container.scrollHeight;
    }
    info(message) {
      this.logMessage(message, "black", false);
    }
    warning(message) {
      this.logMessage(message, "dark-orange", false, "\u26A0\uFE0F");
    }
    error(message) {
      this.logMessage(message, "red", true, "\u26D4");
    }
    success(message) {
      this.logMessage(message, "green", false);
    }
    debug(message) {
      console.log(`${StaticUtilities.getTimestamp(true)} | ${message}`);
      if (this.debugEnabled) {
        this.logMessage(message, "grey", false);
      }
    }
    toggleQueryEditor() {
      const queryBtn = document.getElementById("queryToggleBtn");
      const dataBtn = document.getElementById("dataToggleBtn");
      const shouldEnable = !queryBtn.classList.contains("highlight");
      if (shouldEnable) {
        this.showEditor("query");
        queryBtn.classList.add("highlight");
        dataBtn.classList.remove("highlight");
      } else {
        this.hideBottomBar();
        queryBtn.classList.remove("highlight");
      }
    }
    async toggleDataEditor() {
      const queryBtn = document.getElementById("queryToggleBtn");
      const dataBtn = document.getElementById("dataToggleBtn");
      const shouldEnable = !dataBtn.classList.contains("highlight");
      if (shouldEnable) {
        await this.showLoading("Data Editor", "Loading Data Editor ..");
        this.showEditor("data");
        dataBtn.classList.add("highlight");
        queryBtn.classList.remove("highlight");
      } else {
        await this.showLoading("Data Editor", "Closing Data Editor ..");
        this.hideBottomBar();
        dataBtn.classList.remove("highlight");
      }
      await this.hideLoading();
    }
    showEditor(editorType) {
      const mainContent = document.getElementById("mainContent");
      const bottomBar = document.getElementById("bottomBar");
      const queryEditor = document.getElementById("queryEditor");
      const dataEditor = document.getElementById("dataEditor");
      const queryButtons = document.querySelector(".query-buttons");
      const dataButtons = document.querySelector(".data-buttons");
      const queryHelpIconDiv = document.getElementById("queryHelpIconDiv");
      const dataHelpIconDiv = document.getElementById("dataHelpIconDiv");
      const queryToggleButtons = document.querySelectorAll(".add-to-query-button");
      mainContent.style.height = "80%";
      bottomBar.style.height = "20%";
      bottomBar.classList.add("active");
      if (editorType === "query") {
        queryEditor.style.display = "block";
        dataEditor.style.display = "none";
        queryButtons.style.display = "flex";
        dataButtons.style.display = "none";
        queryHelpIconDiv.style.display = "flex";
        dataHelpIconDiv.style.display = "none";
        queryToggleButtons.forEach((btn) => btn.classList.add("show"));
      } else if (editorType === "data") {
        queryEditor.style.display = "none";
        dataEditor.style.display = "block";
        queryButtons.style.display = "none";
        dataButtons.style.display = "flex";
        queryHelpIconDiv.style.display = "none";
        dataHelpIconDiv.style.display = "flex";
        queryToggleButtons.forEach((btn) => btn.classList.remove("show"));
      }
    }
    hideBottomBar() {
      const mainContent = document.getElementById("mainContent");
      const bottomBar = document.getElementById("bottomBar");
      const queryToggleButtons = document.querySelectorAll(".add-to-query-button");
      mainContent.style.height = "100%";
      bottomBar.style.height = "0";
      bottomBar.classList.remove("active");
      queryToggleButtons.forEach((btn) => btn.classList.remove("show"));
    }
    makeBottomBarResizable() {
      const bottomBar = document.getElementById("bottomBar");
      const mainContent = document.getElementById("mainContent");
      const resizeHandle = bottomBar.querySelector(".resize-handle");
      let isResizing = false;
      let startY = 0;
      let startHeight = 0;
      let shadowBar = null;
      function createShadowBar() {
        if (shadowBar) return shadowBar;
        shadowBar = document.createElement("div");
        shadowBar.classList.add("resize-shadow-bar");
        document.body.appendChild(shadowBar);
        return shadowBar;
      }
      resizeHandle.addEventListener("mousedown", (e) => {
        if (!bottomBar.classList.contains("active")) return;
        isResizing = true;
        startY = e.clientY;
        startHeight = parseInt(document.defaultView.getComputedStyle(bottomBar).height, 10);
        createShadowBar();
        shadowBar.style.display = "block";
        shadowBar.style.bottom = startHeight + "px";
        shadowBar.style.height = startHeight + "px";
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        e.preventDefault();
        document.body.style.userSelect = "none";
        document.body.style.cursor = "ns-resize";
      });
      function handleMouseMove(e) {
        if (!isResizing || !bottomBar.classList.contains("active")) return;
        const dy = startY - e.clientY;
        const newHeight = startHeight + dy;
        const minHeight = 50;
        const maxHeight = window.innerHeight * 0.5;
        const clampedHeight = Math.min(Math.max(newHeight, minHeight), maxHeight);
        shadowBar.style.bottom = "0px";
        shadowBar.style.height = clampedHeight + "px";
      }
      function handleMouseUp(e) {
        if (!isResizing) return;
        isResizing = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        const dy = startY - e.clientY;
        const newHeight = startHeight + dy;
        const minHeight = 50;
        const maxHeight = window.innerHeight * 0.5;
        const finalHeight = Math.min(Math.max(newHeight, minHeight), maxHeight);
        if (finalHeight !== startHeight) {
          const viewportHeight = window.innerHeight;
          const newMainHeight = viewportHeight - finalHeight;
          bottomBar.style.height = finalHeight + "px";
          mainContent.style.height = newMainHeight + "px";
        }
        shadowBar.style.display = "none";
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      }
      window.addEventListener("beforeunload", () => {
        if (shadowBar && shadowBar.parentNode) {
          shadowBar.parentNode.removeChild(shadowBar);
        }
      });
    }
    async toggleEditMode() {
      const editBtn = document.getElementById("editBtn");
      let editModeActive = editBtn.classList.contains("active");
      editModeActive ? editBtn.classList.remove("active") : editBtn.classList.add("active");
      this.handleEditModeUIChanges();
    }
    async toggleLassoSelection() {
      const lassoWrapper = document.getElementById("lassoWrapper");
      let lassoIsActive = lassoWrapper.classList.contains("active");
      lassoIsActive ? lassoWrapper.classList.remove("active") : lassoWrapper.classList.add("active");
      const clickAndDragBehaviors = [
        this.cache.gcm.BEHAVIOURS.DRAG_CANVAS,
        this.cache.gcm.BEHAVIOURS.DRAG_ELEMENT
      ];
      if (!this.cache.CFG.DISABLE_HOVER_EFFECT) {
        clickAndDragBehaviors.push(this.cache.gcm.BEHAVIOURS.HOVER_ACTIVATE);
      }
      const lassoBehaviors = [
        this.cache.gcm.BEHAVIOURS.LASSO_SELECT
      ];
      if (!this.cache.CFG.APPLY_BUBBLE_SET_HOTFIX || this.cache.CFG.APPLY_BUBBLE_SET_HOTFIX && !this.cache.CFG.DISABLE_HOVER_EFFECT) {
        lassoBehaviors.push(this.cache.gcm.BEHAVIOURS.CLICK_SELECT);
      }
      let behaviors = await this.cache.graph.getBehaviors().filter((b) => ![
        ...clickAndDragBehaviors.map((b2) => b2.type),
        ...lassoBehaviors.map((b2) => b2.type)
      ].includes(b.type));
      lassoIsActive ? this.info("Switched to click and drag mode") : this.info("Switched to lasso selection mode");
      await this.cache.graph.setBehaviors([...behaviors, ...lassoIsActive ? clickAndDragBehaviors : lassoBehaviors]);
      await this.cache.graph.updatePlugin({ key: "tooltip", enable: lassoIsActive });
    }
    handleEditModeUIChanges() {
      const editBtn = document.getElementById("editBtn");
      const container = document.getElementById("sidebarContentContainer");
      const sidebar = document.getElementById("sidebar");
      const status = document.getElementById("sidebarStatusContainer");
      const editModeActive = editBtn.classList.contains("active");
      editModeActive ? editBtn.classList.add("highlight") : editBtn.classList.remove("highlight");
      container.style.paddingRight = editModeActive ? "6px" : "0";
      const editElements = document.querySelectorAll(".show-on-edit, .show-on-edit-full-width");
      editElements.forEach((el) => {
        editModeActive ? el.classList.add("show") : el.classList.remove("show");
        el.style.height = editModeActive ? `${el.scrollHeight}px` : "0";
      });
      if (!editModeActive) {
        const styleRows = document.querySelectorAll(".style-row");
        styleRows.forEach((row) => {
          row.classList.remove("show");
        });
      }
      const filterRows = document.querySelectorAll(".filter-row");
      filterRows.forEach((row) => {
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
    buildUI() {
      this.cache.query.text = document.getElementById("queryTextArea");
      this.cache.query.overlay = document.getElementById("queryOverlay");
      this.cache.query.caret = document.getElementById("queryCaret");
      this.cache.query.editorDiv = document.getElementById("queryEditor");
      this.cache.query.sizeObserver = new ResizeObserver(() => requestAnimationFrame(this.cache.qm.validateAlignment));
      this.cache.query.sizeObserver.observe(this.cache.query.editorDiv);
      this.cache.query.text.addEventListener("scroll", () => {
        this.cache.query.overlay.scrollTop = this.cache.query.text.scrollTop;
        this.cache.query.overlay.scrollLeft = this.cache.query.text.scrollLeft;
      });
      this.cache.uiComponents.buildDropdownOptions();
      this.cache.uiComponents.buildMetricsUI();
      this.cache.uiComponents.buildFilterUI();
      this.cache.uiComponents.alignUIWithJSConstants();
      this.showUI(true);
      this.cache.query.lastGoodWidth = this.cache.query.editorDiv.offsetWidth;
      this.cache.qm.validateAlignment();
    }
    buildMetricsUI() {
      const div = document.getElementById("metricsContainer");
      div.innerHTML = "";
      div.appendChild(this.cache.metrics.buildUI());
    }
    buildFilterUI() {
      const div = document.getElementById("filterContainer");
      div.innerHTML = "";
      let sectionsCreated = /* @__PURE__ */ new Set();
      let subSectionsCreated = /* @__PURE__ */ new Set();
      const sortedPropIDs = this.cache.CFG.SORT_FILTERS ? [...this.cache.data.layouts[this.cache.data.selectedLayout].filters.keys()].sort() : [...this.cache.data.layouts[this.cache.data.selectedLayout].filters.keys()];
      for (let propID of sortedPropIDs) {
        let [section, subSection, prop] = StaticUtilities.decodePropHashId(propID);
        let isCategoricalProperty = this.cache.data.filterDefaults.get(propID).isCategory;
        if (!sectionsCreated.has(section)) {
          if (sectionsCreated.size > 0) div.appendChild(document.createElement("hr"));
          const headerDiv = document.createElement("div");
          headerDiv.className = "header-card";
          const header = document.createElement("h4");
          header.textContent = section;
          header.className = "m-0 white";
          headerDiv.appendChild(header);
          headerDiv.appendChild(this.cache.uiComponents.createSectionToggleButton(false, section));
          headerDiv.appendChild(this.cache.uiComponents.createSectionResetButton(section));
          headerDiv.appendChild(this.cache.uiComponents.createSectionToggleButton(true, section));
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
          subHeaderDiv.appendChild(this.cache.uiComponents.createSectionToggleButton(false, section, subSection));
          subHeaderDiv.appendChild(this.cache.uiComponents.createSectionResetButton(section, subSection));
          subHeaderDiv.appendChild(this.cache.uiComponents.createSectionToggleButton(true, section, subSection));
          div.appendChild(subHeaderDiv);
          subSectionsCreated.add(`${section}::${subSection}`);
        }
        const row = document.createElement("div");
        row.className = "filter-row";
        const col1 = document.createElement("div");
        col1.className = "filter-row-col1";
        col1.appendChild(this.cache.uiComponents.createCheckbox(propID, prop));
        row.appendChild(col1);
        const col2 = document.createElement("div");
        col2.className = "filter-row-col2";
        row.appendChild(col2);
        const sliderOrDropdown = isCategoricalProperty ? new DropdownChecklist(propID) : new InvertibleRangeSlider(propID);
        sliderOrDropdown.appendTo(col2);
        const col3 = document.createElement("div");
        col3.className = "filter-row-col3";
        if (this.cache.nodeExclusiveProps.has(propID) || this.cache.mixedProps.has(propID)) {
          col3.appendChild(this.cache.uiComponents.createCircleGroupButtonWithQuadrants(propID));
        } else {
          const placeHolder = document.createElement("div");
          placeHolder.style.width = "18px";
          col3.appendChild(placeHolder);
        }
        col3.appendChild(this.cache.uiComponents.createAddOrRemoveToSelectionButton(propID, true));
        col3.appendChild(this.cache.uiComponents.createAddOrRemoveToSelectionButton(propID, false));
        row.appendChild(col3);
        div.append(row);
        sliderOrDropdown.appendListeners();
      }
      const staticStyleDiv = document.getElementById("staticStyleDiv");
      staticStyleDiv.innerHTML = "";
      staticStyleDiv.appendChild(createStyleDiv());
      this.manageDynamicWidgets();
      this.handleEditModeUIChanges();
      this.cache.qm.updateQueryTextArea();
    }
    showUI(show) {
      document.querySelectorAll(".showOnLoad").forEach((element) => {
        element.style.opacity = show ? "1" : "0";
        element.style.pointerEvents = show ? "auto" : "none";
      });
      document.querySelectorAll(".hideOnLoad").forEach((element) => {
        element.style.opacity = show ? "0" : "1";
        element.style.pointerEvents = show ? "none" : "auto";
        element.style.height = show ? "0" : "auto";
      });
    }
    uncheckAllCheckboxes() {
      for (const propID of this.cache.propIDs) {
        this.checkCheckbox(propID, false);
      }
    }
    checkCheckbox(propID, enable = true) {
      const checkbox = document.getElementById(`filter-${propID}-checkbox`);
      const span = document.getElementById(`filter-${propID}-checkbox-inner`);
      const wrapper = document.getElementById(`filter-${propID}-checkbox-wrapper`);
      checkbox.checked = enable;
      this.cache.data.layouts[this.cache.data.selectedLayout].filters.get(propID).active = enable;
      enable ? this.cache.activeProps.add(propID) : this.cache.activeProps.delete(propID);
      span.textContent = enable ? "\u2714" : "";
      wrapper.title = this.cache.uiComponents.getCheckboxTT(enable, propID);
    }
    manageDynamicWidgets() {
      let isCustomLayout = this.cache.data.layouts[this.cache.data.selectedLayout].isCustom;
      let removeLayoutBtnCls = document.getElementById("removeSelectedLayoutButton").classList;
      isCustomLayout ? removeLayoutBtnCls.remove("disabled") : removeLayoutBtnCls.add("disabled");
    }
    async toggleSection(enable, section) {
      this.toggleCheckboxesForSetOfPropIDs(enable, section);
      await this.cache.fm.handleFilterEvent(`${enable ? "Showing" : "Hiding"} Elements`, `Nodes and related edges for ${section}`);
    }
    async toggleSubSection(enable, section, subSection) {
      this.toggleCheckboxesForSetOfPropIDs(enable, section + "::" + subSection);
      await this.cache.fm.handleFilterEvent(`${enable ? "Showing" : "Hiding"} Elements`, `Nodes and related edges for ${section} ${subSection}`);
    }
    toggleCheckboxesForSetOfPropIDs(enable, propIDPrefixToSearchFor) {
      const setOfPropIDs = [...this.cache.propToNodes.keys(), ...this.cache.propToEdgeIDs.keys()].filter((propID) => propID.startsWith(propIDPrefixToSearchFor));
      for (let propID of setOfPropIDs) {
        let checkbox = document.getElementById(`filter-${propID}-checkbox`);
        let wrapper = document.getElementById(`filter-${propID}-checkbox-wrapper`);
        let inner = document.getElementById(`filter-${propID}-checkbox-inner`);
        checkbox.checked = enable;
        this.cache.data.layouts[this.cache.data.selectedLayout].filters.get(propID).active = enable;
        enable ? this.cache.activeProps.add(propID) : this.cache.activeProps.delete(propID);
        wrapper.title = this.cache.uiComponents.getCheckboxTT(enable, propID);
        inner.textContent = enable ? "\u2714" : "";
      }
    }
    clearActivePropsCacheOnLayoutChange() {
      this.cache.activeProps = /* @__PURE__ */ new Set();
      for (const [key, value] of this.cache.data.layouts[this.cache.data.selectedLayout].filters.entries()) {
        if (value.active) {
          this.cache.activeProps.add(key);
        }
      }
    }
  };

  // src/utilities/demo_loader.js
  var StringDemoDataLoader = class {
    constructor(cache3, genes, species = 9606, amountOfNodes = 50, requiredScore = 400) {
      this.cache = cache3;
      this.baseUrl = "https://string-db.org/api/json";
      this.genes = genes;
      this.species = species;
      this.amountOfNodes = amountOfNodes;
      this.requiredScore = requiredScore;
    }
    async loadNetwork() {
      const params = new URLSearchParams({
        identifiers: this.genes.join("%0d"),
        species: this.species,
        add_nodes: this.amountOfNodes,
        required_score: this.requiredScore
      });
      const url = `${this.baseUrl}/network?${params}`;
      await this.cache.ui.showLoading("Demo Data", `Loading STRING network with ${this.genes.length} genes: ${this.genes.join(",")}, ${this.amountOfNodes} additional nodes, species ${this.species}, minimum confidence: ${this.requiredScore}. URL: ${url}`);
      try {
        const stringData = await this._fetchFromString(url);
        if (!stringData || stringData.length === 0) {
          this.cache.ui.warning("No interaction data returned from STRING");
          return null;
        }
        const allProteins = /* @__PURE__ */ new Set();
        stringData.forEach((interaction) => {
          allProteins.add(interaction.preferredName_A);
          allProteins.add(interaction.preferredName_B);
        });
        const annotations = await this._fetchFunctionalAnnotations(Array.from(allProteins));
        return this._convertToAppFormat(stringData, annotations);
      } catch (err) {
        this.cache.ui.error(`Failed to load STRING network. Make sure gene symbols and species ID exist. ${url}`);
        return null;
      }
    }
    _getEdgeColor(score, minScore, maxScore) {
      const normalizedScore = maxScore === minScore ? 0 : (score - minScore) / (maxScore - minScore);
      const greyColor = { r: 135, g: 137, b: 150 };
      const blueColor = { r: 140, g: 166, b: 217 };
      const purpleColor = { r: 153, g: 170, b: 187 };
      const pinkColor = { r: 239, g: 176, b: 170 };
      let r, g, b;
      if (normalizedScore <= 0.33) {
        const t = normalizedScore / 0.33;
        r = Math.round(greyColor.r + (blueColor.r - greyColor.r) * t);
        g = Math.round(greyColor.g + (blueColor.g - greyColor.g) * t);
        b = Math.round(greyColor.b + (blueColor.b - greyColor.b) * t);
      } else if (normalizedScore <= 0.66) {
        const t = (normalizedScore - 0.33) / 0.33;
        r = Math.round(blueColor.r + (purpleColor.r - blueColor.r) * t);
        g = Math.round(blueColor.g + (purpleColor.g - blueColor.g) * t);
        b = Math.round(blueColor.b + (purpleColor.b - blueColor.b) * t);
      } else {
        const t = (normalizedScore - 0.66) / 0.34;
        r = Math.round(purpleColor.r + (pinkColor.r - purpleColor.r) * t);
        g = Math.round(purpleColor.g + (pinkColor.g - purpleColor.g) * t);
        b = Math.round(purpleColor.b + (pinkColor.b - purpleColor.b) * t);
      }
      return `rgb(${r}, ${g}, ${b})`;
    }
    async _fetchFromString(url) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`STRING API request failed: ${response.status}`);
      }
      return await response.json();
    }
    async _fetchFunctionalAnnotations(proteins) {
      const url = `${this.baseUrl}/functional_annotation?identifiers=${proteins.join("%0d")}&species=${this.species}`;
      const response = await fetch(url);
      if (!response.ok) return [];
      return await response.json();
    }
    _getSourceAndSubcategory(category) {
      const mapping = {
        "Process": { source: "Gene Ontology", subcategory: "Biological Process" },
        "Function": { source: "Gene Ontology", subcategory: "Molecular Function" },
        "Component": { source: "Gene Ontology", subcategory: "Cellular Component" },
        "Keyword": { source: "UniProt", subcategory: "Annotated Keywords" },
        "KEGG": { source: "KEGG", subcategory: "Pathways" },
        "RCTM": { source: "Reactome", subcategory: "Pathways" },
        "HPO": { source: "Monarch", subcategory: "Human Phenotype" },
        "MPO": { source: "Monarch", subcategory: "Mammalian Phenotype" },
        "DPO": { source: "Monarch", subcategory: "Drosophila Phenotype" },
        "WPO": { source: "Monarch", subcategory: "C. elegans Phenotype" },
        "ZPO": { source: "Monarch", subcategory: "Zebrafish Phenotype" },
        "FYPO": { source: "Monarch", subcategory: "Fission Yeast Phenotype" },
        "Pfam": { source: "Pfam", subcategory: "Protein Domains" },
        "SMART": { source: "SMART", subcategory: "Protein Domains" },
        "InterPro": { source: "InterPro", subcategory: "Protein Domains and Features" },
        "PMID": { source: "PubMed", subcategory: "Reference Publications" },
        "NetworkNeighborAL": { source: "STRING", subcategory: "Local Network Cluster" },
        "COMPARTMENTS": { source: "Compartments", subcategory: "Subcellular Localization" },
        "TISSUES": { source: "Tissues", subcategory: "Tissue Expression" },
        "DISEASES": { source: "Diseases", subcategory: "Disease-gene Associations" },
        "WikiPathways": { source: "WikiPathways", subcategory: "WikiPathways" }
      };
      return mapping[category] || { source: this._sanitizeForAST(category), subcategory: this._sanitizeForAST(category) };
    }
    _sanitizeForAST(str) {
      if (typeof str !== "string") return str;
      return str.replace(/\(/g, "{").replace(/\)/g, "}").replace(/\[/g, "{").replace(/]/g, "}").replace(/:/g, "-").replace(/,/g, " ").replace(/&/g, "and").replace(/</g, "less").replace(/>/g, "greater").replace(/"/g, "").replace(/'/g, "").replace(/\\/g, "").replace(/\//g, " or ");
    }
    _convertToAppFormat(stringData, annotationData) {
      const nodeMap = /* @__PURE__ */ new Map();
      const edges = [];
      const annotationsBySourceAndSubcategory = /* @__PURE__ */ new Map();
      const proteinToAnnotations = /* @__PURE__ */ new Map();
      annotationData.forEach((ann) => {
        const category = ann.category;
        const description = this._sanitizeForAST(ann.description);
        const proteins = ann.preferredNames || [];
        const { source, subcategory } = this._getSourceAndSubcategory(category);
        if (!annotationsBySourceAndSubcategory.has(source)) {
          annotationsBySourceAndSubcategory.set(source, /* @__PURE__ */ new Map());
        }
        if (!annotationsBySourceAndSubcategory.get(source).has(subcategory)) {
          annotationsBySourceAndSubcategory.get(source).set(subcategory, /* @__PURE__ */ new Set());
        }
        annotationsBySourceAndSubcategory.get(source).get(subcategory).add(description);
        proteins.forEach((protein) => {
          if (!proteinToAnnotations.has(protein)) {
            proteinToAnnotations.set(protein, /* @__PURE__ */ new Map());
          }
          if (!proteinToAnnotations.get(protein).has(source)) {
            proteinToAnnotations.get(protein).set(source, /* @__PURE__ */ new Map());
          }
          if (!proteinToAnnotations.get(protein).get(source).has(subcategory)) {
            proteinToAnnotations.get(protein).get(source).set(subcategory, []);
          }
          proteinToAnnotations.get(protein).get(source).get(subcategory).push(description);
        });
      });
      const filteredAnnotations = /* @__PURE__ */ new Map();
      annotationsBySourceAndSubcategory.forEach((subcategories, source) => {
        const filteredSubcategories = /* @__PURE__ */ new Map();
        subcategories.forEach((annotations, subcategory) => {
          if (annotations.size > 1) {
            filteredSubcategories.set(subcategory, annotations);
          }
        });
        if (filteredSubcategories.size > 0) {
          filteredAnnotations.set(source, filteredSubcategories);
        }
      });
      const nodeDataHeaders = [];
      filteredAnnotations.forEach((subcategories, source) => {
        subcategories.forEach((annotations, subcategory) => {
          nodeDataHeaders.push({ subGroup: source, key: subcategory });
        });
      });
      const edgeDataHeaders = [
        { subGroup: "Scores", key: "Combined Score" },
        { subGroup: "Evidence Scores", key: "Neighborhood Score" },
        { subGroup: "Evidence Scores", key: "Fusion Score" },
        { subGroup: "Evidence Scores", key: "Cooccurrence Score" },
        { subGroup: "Evidence Scores", key: "Coexpression Score" },
        { subGroup: "Evidence Scores", key: "Experimental Score" },
        { subGroup: "Evidence Scores", key: "Database Score" },
        { subGroup: "Evidence Scores", key: "Textmining Score" }
      ];
      stringData.forEach((interaction, index) => {
        const {
          stringId_A,
          stringId_B,
          preferredName_A,
          preferredName_B,
          score,
          nscore,
          fscore,
          pscore,
          ascore,
          escore,
          dscore,
          tscore
        } = interaction;
        const createNode = (stringId, preferredName) => {
          const proteinAnnotations = proteinToAnnotations.get(preferredName) || /* @__PURE__ */ new Map();
          const nodeFilters = {};
          filteredAnnotations.forEach((subcategories, source) => {
            if (!nodeFilters[source]) {
              nodeFilters[source] = {};
            }
            subcategories.forEach((annotations, subcategory) => {
              const proteinSourceAnnotations = proteinAnnotations.get(source) || /* @__PURE__ */ new Map();
              const proteinSubcategoryAnnotations = proteinSourceAnnotations.get(subcategory) || [];
              nodeFilters[source][subcategory] = proteinSubcategoryAnnotations.length > 0 ? proteinSubcategoryAnnotations[0] : `No ${subcategory}`;
            });
          });
          return {
            id: stringId,
            label: preferredName,
            style: {
              labelText: preferredName
            },
            D4Data: {
              "Node filters": nodeFilters
            }
          };
        };
        if (!nodeMap.has(preferredName_A)) {
          nodeMap.set(preferredName_A, createNode(stringId_A, preferredName_A));
        }
        if (!nodeMap.has(preferredName_B)) {
          nodeMap.set(preferredName_B, createNode(stringId_B, preferredName_B));
        }
        const scores = stringData.map((interaction2) => interaction2.score);
        const minScore = Math.min(...scores);
        const maxScore = Math.max(...scores);
        edges.push({
          id: `${stringId_A}::${stringId_B}`,
          source: stringId_A,
          target: stringId_B,
          style: {
            stroke: this._getEdgeColor(score, minScore, maxScore),
            lineWidth: Math.max(0.1, score * 3)
          },
          D4Data: {
            "Edge filters": {
              "Scores": {
                "Combined Score": score
              },
              "Evidence Scores": {
                "Neighborhood Score": nscore,
                "Fusion Score": fscore,
                "Cooccurrence Score": pscore,
                "Coexpression Score": ascore,
                "Experimental Score": escore,
                "Database Score": dscore,
                "Textmining Score": tscore
              }
            }
          }
        });
      });
      return {
        nodes: Array.from(nodeMap.values()),
        edges,
        nodeDataHeaders,
        edgeDataHeaders
      };
    }
  };

  // src/gll.js
  var {
    Graph: Graph2,
    NodeEvent: NodeEvent2,
    EdgeEvent: EdgeEvent2,
    GraphEvent: GraphEvent2,
    CanvasEvent: CanvasEvent2,
    CommonEvent: CommonEvent2,
    WindowEvent: WindowEvent2,
    Layout: Layout2,
    BaseLayout: BaseLayout2,
    ExtensionCategory: ExtensionCategory2,
    register: register2
  } = G6;
  var Cache = class {
    constructor() {
    }
    construct() {
      this.initialized = false;
      this.graph = null;
      this.data = {
        filterDefaults: /* @__PURE__ */ new Map()
      };
      this.query = {
        valid: false,
        ast: null,
        text: null,
        overlay: null,
        caret: null,
        editorDiv: null,
        lastGoodWidth: 0,
        sizeObserver: null,
        sizeChangeLocked: false,
        textCache: null
      };
      this.DEFAULTS = DEFAULTS;
      this.CFG = CFG;
      this.INSTANCES = {
        BUBBLE_GROUPS: {}
      };
      this.EVENT_LOCKS = {
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
        HOTKEY_EVENTS_REGISTERED: false,
        GLOBAL_EVENTS_REGISTERED: false,
        SKIP_QUERY_VALIDATION: false,
        QUERY_SELECTION_EVENT: false
      };
      this.excelData = excelData;
      this.gcm = new GraphCoreManager(this);
      this.io = new IOManager(this);
      this.qm = new QueryManager(this);
      this.bs = new GraphBubbleSetManager(this);
      this.sm = new GraphSelectionManager(this);
      this.fm = new GraphFilterManager(this);
      this.lm = new GraphLayoutManager(this);
      this.ui = new UIManager(this);
      this.uiComponents = new UIComponentManager(this);
      this.style = new GraphStyleManager(this);
      this.picker = new ColorScalePicker(this);
      this.dataTable = new DataTable(this);
      this.metrics = new NetworkMetrics(this);
      this.stash = new StashManager(this);
    }
    initialize(data = void 0) {
      this.initialized = true;
      if (data) {
        if (data.nodes && data.nodes.length > 0) {
          this.data.nodes = data.nodes;
        }
        if (data.edges && data.edges.length > 0) {
          this.data.edges = data.edges;
        }
        if (data.nodeDataHeaders && data.nodeDataHeaders.length > 0) {
          this.data.nodeDataHeaders = data.nodeDataHeaders;
        }
        if (data.edgeDataHeaders && data.edgeDataHeaders.length > 0) {
          this.data.edgeDataHeaders = data.edgeDataHeaders;
        }
      }
      this.nodeRef = /* @__PURE__ */ new Map();
      this.edgeRef = /* @__PURE__ */ new Map();
      this.toolTips = /* @__PURE__ */ new Map();
      this.propIDs = /* @__PURE__ */ new Set();
      this.activeProps = /* @__PURE__ */ new Set();
      this.nodeExclusiveProps = /* @__PURE__ */ new Set();
      this.edgeExclusiveProps = /* @__PURE__ */ new Set();
      this.mixedProps = /* @__PURE__ */ new Set();
      this.propToNodes = /* @__PURE__ */ new Map();
      this.propToNodeIDs = /* @__PURE__ */ new Map();
      this.propToEdges = /* @__PURE__ */ new Map();
      this.propToEdgeIDs = /* @__PURE__ */ new Map();
      this.nodeIDToEdgeIDs = /* @__PURE__ */ new Map();
      this.edgeIDToNodeIDs = /* @__PURE__ */ new Map();
      this.nodeIDToPropIDs = /* @__PURE__ */ new Map();
      this.edgeIDToPropIDs = /* @__PURE__ */ new Map();
      this.propIDToDropdownChecklists = /* @__PURE__ */ new Map();
      this.propIDToInvertibleRangeSliders = /* @__PURE__ */ new Map();
      this.initialNodePositions = /* @__PURE__ */ new Map();
      this.lastBubbleSetMembers = /* @__PURE__ */ new Map();
      this.bubbleSetChanged = false;
      this.nodeIDsToBeShown = /* @__PURE__ */ new Set();
      this.propIDsToNodeIDsToBeShown = /* @__PURE__ */ new Map();
      this.edgeIDsToBeShown = /* @__PURE__ */ new Set();
      this.propIDsToEdgeIDsToBeShown = /* @__PURE__ */ new Map();
      this.selectedNodes = /* @__PURE__ */ new Set();
      this.selectedEdges = /* @__PURE__ */ new Set();
      this.selectionMemory = [{ nodes: [], edges: [] }];
      this.selectedMemoryIndex = 0;
      this.hiddenDanglingNodeIDs = /* @__PURE__ */ new Set();
      this.hiddenDanglingEdgeIDs = /* @__PURE__ */ new Set();
      this.uniquePropHierarchy = {};
      this.styleChanged = false;
      this.labelStyleChanged = false;
      this.visibleElementsChanged = false;
      this.layoutChanged = false;
      this.popup = null;
      this.nodeLabels = [];
      this.edgeLabels = [];
      this.nodeLabelToNodeIDs = /* @__PURE__ */ new Map();
      this.edgeLabelToEdgeIDs = /* @__PURE__ */ new Map();
      this.nodeIDOrLabelToNodeIDs = /* @__PURE__ */ new Map();
      this.edgeIDOrLabelToEdgeIDs = /* @__PURE__ */ new Map();
      function populateUniquePropGroups(propHash) {
        const [mainGroup, subGroup, prop] = StaticUtilities.decodePropHashId(propHash);
        if (!this.uniquePropHierarchy[mainGroup]) {
          this.uniquePropHierarchy[mainGroup] = {};
        }
        if (!this.uniquePropHierarchy[mainGroup][subGroup]) {
          this.uniquePropHierarchy[mainGroup][subGroup] = /* @__PURE__ */ new Set();
        }
        this.uniquePropHierarchy[mainGroup][subGroup].add(prop);
      }
      for (let group of this.bs.traverseBubbleSets()) {
        this.lastBubbleSetMembers.set(group, /* @__PURE__ */ new Set());
      }
      this.data.nodes.forEach((node) => {
        this.nodeRef.set(node.id, node);
        this.toolTips.set(node.id, this.uiComponents.buildToolTipText(node.id, false));
        this.nodeIDToPropIDs.set(node.id, /* @__PURE__ */ new Set());
        if (node.label) {
          this.nodeLabels.push(node.label);
          if (!this.nodeLabelToNodeIDs.has(node.label)) {
            this.nodeLabelToNodeIDs.set(node.label, /* @__PURE__ */ new Set());
          }
          this.nodeLabelToNodeIDs.get(node.label).add(node.id);
          if (!this.nodeIDOrLabelToNodeIDs.has(node.label)) {
            this.nodeIDOrLabelToNodeIDs.set(node.label, /* @__PURE__ */ new Set());
          }
          this.nodeIDOrLabelToNodeIDs.get(node.label).add(node.id);
        }
        if (!this.nodeIDOrLabelToNodeIDs.has(node.id)) {
          this.nodeIDOrLabelToNodeIDs.set(node.id, /* @__PURE__ */ new Set());
        }
        this.nodeIDOrLabelToNodeIDs.get(node.id).add(node.id);
        for (let prop of node.features) {
          populateUniquePropGroups(prop);
          if (!this.propToNodes.has(prop)) this.propToNodes.set(prop, /* @__PURE__ */ new Set());
          if (!this.propToNodeIDs.has(prop)) this.propToNodeIDs.set(prop, /* @__PURE__ */ new Set());
          this.propToNodes.get(prop).add(node);
          this.propToNodeIDs.get(prop).add(node.id);
          this.nodeExclusiveProps.add(prop);
          this.propIDs.add(prop);
          this.nodeIDToPropIDs.get(node.id).add(prop);
        }
      });
      this.data.edges.forEach((edge) => {
        this.edgeRef.set(edge.id, edge);
        this.toolTips.set(edge.id, this.uiComponents.buildToolTipText(edge.id, true));
        this.edgeIDToPropIDs.set(edge.id, /* @__PURE__ */ new Set());
        if (edge.label) {
          this.edgeLabels.push(edge.label);
          if (!this.edgeLabelToEdgeIDs.has(edge.label)) {
            this.edgeLabelToEdgeIDs.set(edge.label, /* @__PURE__ */ new Set());
          }
          this.edgeLabelToEdgeIDs.get(edge.label).add(edge.id);
          if (!this.edgeIDOrLabelToEdgeIDs.has(edge.label)) {
            this.edgeIDOrLabelToEdgeIDs.set(edge.label, /* @__PURE__ */ new Set());
          }
          this.edgeIDOrLabelToEdgeIDs.get(edge.label).add(edge.id);
        }
        if (!this.edgeIDOrLabelToEdgeIDs.has(edge.id)) {
          this.edgeIDOrLabelToEdgeIDs.set(edge.id, /* @__PURE__ */ new Set());
        }
        this.edgeIDOrLabelToEdgeIDs.get(edge.id).add(edge.id);
        for (let prop of edge.features) {
          populateUniquePropGroups(prop);
          if (!this.propToEdges.has(prop)) this.propToEdges.set(prop, /* @__PURE__ */ new Set());
          if (!this.propToEdgeIDs.has(prop)) this.propToEdgeIDs.set(prop, /* @__PURE__ */ new Set());
          this.propToEdges.get(prop).add(edge);
          this.propToEdgeIDs.get(prop).add(edge.id);
          if (this.nodeExclusiveProps.has(prop)) {
            this.nodeExclusiveProps.delete(prop);
            this.mixedProps.add(prop);
          } else {
            this.edgeExclusiveProps.add(prop);
          }
          this.propIDs.add(prop);
          this.edgeIDToPropIDs.get(edge.id).add(prop);
        }
        if (!this.nodeIDToEdgeIDs.has(edge.source)) this.nodeIDToEdgeIDs.set(edge.source, /* @__PURE__ */ new Set());
        if (!this.nodeIDToEdgeIDs.has(edge.target)) this.nodeIDToEdgeIDs.set(edge.target, /* @__PURE__ */ new Set());
        if (!this.edgeIDToNodeIDs.has(edge.id)) this.edgeIDToNodeIDs.set(edge.id, /* @__PURE__ */ new Set());
        this.nodeIDToEdgeIDs.get(edge.source).add(edge.id);
        this.nodeIDToEdgeIDs.get(edge.target).add(edge.id);
        this.edgeIDToNodeIDs.get(edge.id).add(edge.source);
        this.edgeIDToNodeIDs.get(edge.id).add(edge.target);
      });
      this.dataTable.init();
    }
  };
  var cache2 = new Cache();
  async function loadDemoData() {
    const formContent = document.createElement("div");
    formContent.innerHTML = `
    <h3>Load STRING Demo Data</h3>
    <div style="margin-bottom: 10px;">
      <label for="genes-input" style="display: block; margin-bottom: 5px;">Genes (comma-separated):</label>
      <input type="text" id="genes-input" value="TP53" style="width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 3px;">
    </div>
    <div style="margin-bottom: 10px;">
      <label for="species-input" style="display: block; margin-bottom: 5px;">Species (NCBI Taxonomy ID):</label>
      <input type="number" id="species-input" value="9606" style="width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 3px;">
    </div>
    <div style="margin-bottom: 10px;">
      <label for="nodes-input" style="display: block; margin-bottom: 5px;">Additional Nodes:</label>
      <input type="number" id="nodes-input" value="50" style="width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 3px;">
    </div>
    <div style="margin-bottom: 20px;">
      <label for="score-input" style="display: block; margin-bottom: 5px;">Required Score (0-1000):</label>
      <input type="number" id="score-input" value="400" min="0" max="1000" style="width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 3px;">
    </div>
    <div style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; margin-bottom: 15px; font-size: 12px; color: #666;">
      <strong>Data Source:</strong> STRING Database API<br>
      <a href="https://string-db.org/" target="_blank" style="color: #0066cc;">\u{1F517} Visit STRING Database</a> | 
      <a href="https://doi.org/10.1093/nar/gkac1000" target="_blank" style="color: #0066cc;">\u{1F4C4} Citation</a><br>
      <em>Szklarczyk D, Gable AL, Nastou KC, et al. The STRING database in 2023: protein-protein association networks and functional enrichment analyses for any sequenced genome of interest. Nucleic Acids Res. 2023.</em>
    </div>
    <div style="text-align: right;">
      <button id="load-btn" class="p-button ml-1">Load</button>
      <button id="cancel-btn" class="p-button">Cancel</button>
    </div>
  `;
    return new Promise((resolve) => {
      const popup = new Popup(formContent, {
        width: "450px",
        showFullscreenButton: false,
        closeOnClickOutside: false,
        onClose: () => resolve(false)
      });
      const genesInput = formContent.querySelector("#genes-input");
      const speciesInput = formContent.querySelector("#species-input");
      const nodesInput = formContent.querySelector("#nodes-input");
      const scoreInput = formContent.querySelector("#score-input");
      const loadBtn = formContent.querySelector("#load-btn");
      const cancelBtn = formContent.querySelector("#cancel-btn");
      const handleLoad = async () => {
        const genesText = genesInput.value.trim();
        if (!genesText) {
          cache2.ui.error("Please enter at least one gene");
          return;
        }
        const genes = genesText.split(",").map((g) => g.trim()).filter((g) => g);
        const species = parseInt(speciesInput.value) || 9606;
        const amountOfNodes = parseInt(nodesInput.value) || 50;
        const requiredScore = parseInt(scoreInput.value) || 400;
        if (genes.length === 0) {
          cache2.ui.error("Please enter at least one valid gene");
          return;
        }
        popup.close();
        const stringDemoDataLoader = new StringDemoDataLoader(cache2, genes, species, amountOfNodes, requiredScore);
        const data = await stringDemoDataLoader.loadNetwork();
        if (data) {
          await cache2.gcm.destroyGraphAndRollBackUI();
          cache2.gcm.resetEventLocks();
          cache2.io.preProcessData(data);
          buildDataTable(data);
          cache2.ui.buildUI();
          await cache2.gcm.createGraphInstance();
          await cache2.graph.render();
          resolve(true);
        } else {
          resolve(false);
        }
        await cache2.ui.hideLoading();
      };
      const handleCancel = () => {
        popup.close();
        resolve(false);
      };
      loadBtn.addEventListener("click", handleLoad);
      cancelBtn.addEventListener("click", handleCancel);
      [genesInput, speciesInput, nodesInput, scoreInput].forEach((input) => {
        input.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            handleLoad();
          }
        });
      });
      setTimeout(() => genesInput.focus(), 100);
    });
  }
  window.loadDemoData = loadDemoData;
  window.cache = cache2;
  window.addEventListener("resize", () => {
    if (graph !== null && window.cache.initialized) {
      const editModeActive = document.getElementById("editBtn").classList.contains("active");
      const sidebarContentContainer = document.getElementById("sidebarContentContainer");
      const status = document.getElementById("sidebarStatusContainer");
      status.style.maxWidth = editModeActive ? `${sidebarContentContainer.offsetWidth}px` : "360px";
    }
  });
  window.addEventListener("DOMContentLoaded", () => {
    cache2.construct();
  });
})();
