import {StaticUtilities} from "../utilities/static.js";

class GraphBubbleSetManager {
  constructor(cache) {
    this.cache = cache;
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

  * traverseBubbleSets() {
    for (let group of Object.keys(this.cache.DEFAULTS.BUBBLE_GROUP_STYLE)) {
      yield group;
    }
  }

  async updateBubbleSetStyle(property, value) {
    const remainder = property.split('Bubble Set ')[1];
    const parts = remainder.split(' ');
    const group = parts[0];
    const propertyLabel = parts.slice(1).join(' ');

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

      // toggle entire cards based on bubble group members
      const card = document.getElementById(`bubbleSetStyleCard${group}`);
      hasActiveMembers ? card.classList.remove("disabled") : card.classList.add("disabled");

      // toggle label-related properties
      for (const elem of card.querySelectorAll(".bubbleSetOptionalLabelConfig")) {
        labelConfigShouldBeEnabled ? elem.classList.remove("disabled") : elem.classList.add("disabled");
      }

      // override css properties to style round-button quadrants
      const fillColor = this.cache.data.bubbleSetStyle[group].fill || this.cache.DEFAULTS.BUBBLE_GROUP_STYLE[group].fill;
      document.documentElement.style.setProperty(`--${group}-color`, fillColor);
    }
  }

  async updateBubbleSetIfChanged() {
    for (let group of this.traverseBubbleSets()) {
      let propsInGroup = this.cache.data.layouts[this.cache.data.selectedLayout][`${group}Props`];

      let lastSetMembers = this.cache.lastBubbleSetMembers.get(group);
      let newSetMembers = new Set();

      // Add members from filter-based properties
      for (let prop of propsInGroup) {
        let nodeIDsToBeGrouped = this.cache.propIDsToNodeIDsToBeShown.get(prop) || [];
        for (let nodeID of nodeIDsToBeGrouped) {
          newSetMembers.add(nodeID);
        }
      }

      // Add members from manual group selection
      const manualMembers = this.cache.data.layouts[this.cache.data.selectedLayout][`${group}ManualMembers`];
      if (manualMembers && manualMembers.size > 0) {
        for (let nodeID of manualMembers) {
          // Only add if node is still visible (not filtered out)
          if (this.cache.nodeRef.has(nodeID)) {
            newSetMembers.add(nodeID);
          }
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

    const avoidMembers = empty ? [] : this.getAvoidMembers(members);

    if (StaticUtilities.arraysAreEqual(membersAsArray, [...this.cache.INSTANCES.BUBBLE_GROUPS[group].members.keys()])) {
      this.cache.ui.debug("BUBBLE GROUPS IN SYNC - SKIPPING UPDATE");
      return;
    }

    await this.cache.INSTANCES.BUBBLE_GROUPS[group].update({
      members: empty ? [] : membersAsArray,
      avoidMembers: avoidMembers,
      fillOpacity: empty ? 0 : this.cache.data.bubbleSetStyle[group].fillOpacity,
      strokeOpacity: empty ? 0 : this.cache.data.bubbleSetStyle[group].strokeOpacity,
      label: empty ? false : this.cache.data.bubbleSetStyle[group].label,
    });
    await this.cache.INSTANCES.BUBBLE_GROUPS[group].drawBubbleSets();
  }

  getAvoidMembers(members) {
    if (this.cache.CFG.APPLY_BUBBLE_SET_HOTFIX && this.cache.CFG.AVOID_MEMBERS_IN_BUBBLE_GROUPS) return [];

    const checkMembership = members instanceof Set
      ? (nodeID) => members.has(nodeID)
      : (nodeID) => members.includes(nodeID);

    return [...this.cache.nodeRef.keys()].filter(nodeID => !checkMembership(nodeID));
  }

  async clearBubbleSetInstanceMembers() {
    for (const group of this.traverseBubbleSets()) {
      await this.cache.INSTANCES.BUBBLE_GROUPS[group].update({
        members: [],
      });
    }
  }

  async toggleSelectedNodesInManualGroup(group) {
    if (!this.cache.data.layouts[this.cache.data.selectedLayout][`${group}ManualMembers`]) {
      this.cache.data.layouts[this.cache.data.selectedLayout][`${group}ManualMembers`] = new Set();
    }

    const manualMembers = this.cache.data.layouts[this.cache.data.selectedLayout][`${group}ManualMembers`];
    const selectedNodeIds = [...this.cache.selectedNodes];

    if (selectedNodeIds.length === 0) {
      this.cache.ui.warning("No nodes selected");
      return;
    }

    // Check if all selected nodes are already in the group
    const allInGroup = selectedNodeIds.every(nodeId => manualMembers.has(nodeId));

    if (allInGroup) {
      // Remove all selected nodes from the group
      selectedNodeIds.forEach(nodeId => manualMembers.delete(nodeId));
      this.cache.ui.info(`Removed ${selectedNodeIds.length} node(s) from manual ${group}`);
    } else {
      // Add all selected nodes to the group
      selectedNodeIds.forEach(nodeId => manualMembers.add(nodeId));
      this.cache.ui.info(`Added ${selectedNodeIds.length} node(s) to manual ${group}`);
    }

    // Update the quadrant button visual state
    this.updateManualGroupButtonState();

    // Update status display
    this.updateManualGroupStatus();

    // Trigger bubble set update
    await this.cache.gcm.decideToRenderOrDraw();
  }

  updateManualGroupButtonState() {
    const button = document.getElementById('manualBubbleGroupButton');
    if (!button) return;

    const selectedNodeIds = new Set(this.cache.selectedNodes);

    for (let [group, quadrantPosition] of Object.entries(this.cache.DEFAULTS.BUBBLE_GROUP_QUADRANT_POSITIONS)) {
      const manualMembers = this.cache.data.layouts[this.cache.data.selectedLayout][`${group}ManualMembers`] || new Set();
      const quadrant = button.querySelector(`.quadrant.${quadrantPosition}.manual`);

      if (quadrant) {
        // Check if any selected node is in this manual group
        const hasAnyMember = selectedNodeIds.size > 0 &&
                              [...selectedNodeIds].some(nodeId => manualMembers.has(nodeId));

        if (hasAnyMember) {
          quadrant.classList.add("active");
        } else {
          quadrant.classList.remove("active");
        }
      }
    }
  }

  updateManualGroupStatus() {
    const statusSpan = document.getElementById('manualBubbleGroupStatus');
    const clearButton = document.getElementById('clearManualGroupsBtn');
    const separator = document.getElementById('manualGroupSeparator');
    if (!statusSpan) return;

    const activeGroups = [];

    for (let [group, quadrantPosition] of Object.entries(this.cache.DEFAULTS.BUBBLE_GROUP_QUADRANT_POSITIONS)) {
      const manualMembers = this.cache.data.layouts[this.cache.data.selectedLayout][`${group}ManualMembers`] || new Set();

      // Filter out nodes that are no longer visible (filtered out)
      const visibleMembers = [...manualMembers].filter(nodeId =>
        this.cache.nodeRef.has(nodeId) &&
        this.cache.propIDsToNodeIDsToBeShown.size === 0 ||
        [...this.cache.propIDsToNodeIDsToBeShown.values()].some(set => set.has(nodeId))
      );

      if (visibleMembers.length > 0) {
        const color = this.cache.data.bubbleSetStyle[group].fill;
        activeGroups.push(`<span style="color: ${color}; font-weight: bold;">●${visibleMembers.length}</span>`);
      }
    }

    // Show/hide elements based on active groups
    if (activeGroups.length > 0) {
      statusSpan.innerHTML = activeGroups.join(' ');
      statusSpan.style.display = 'inline';
      if (clearButton) clearButton.style.display = 'inline';
      if (separator) separator.style.display = 'inline-block';
    } else {
      statusSpan.innerHTML = '';
      statusSpan.style.display = 'none';
      if (clearButton) clearButton.style.display = 'none';
      if (separator) separator.style.display = 'none';
    }
  }

  cleanupManualGroupMembers() {
    // Remove nodes from manual groups that are no longer visible (filtered out)
    for (let group of Object.keys(this.cache.DEFAULTS.BUBBLE_GROUP_STYLE)) {
      const manualMembers = this.cache.data.layouts[this.cache.data.selectedLayout][`${group}ManualMembers`];

      if (manualMembers && manualMembers.size > 0) {
        const toRemove = [];
        for (let nodeId of manualMembers) {
          // Check if node is filtered out (not visible)
          if (!this.cache.nodeRef.has(nodeId)) {
            toRemove.push(nodeId);
          }
        }

        toRemove.forEach(nodeId => manualMembers.delete(nodeId));
      }
    }

    this.updateManualGroupStatus();
  }

  async clearAllManualGroups() {
    // Clear all manual bubble groups
    for (let group of Object.keys(this.cache.DEFAULTS.BUBBLE_GROUP_STYLE)) {
      const manualMembers = this.cache.data.layouts[this.cache.data.selectedLayout][`${group}ManualMembers`];
      if (manualMembers) {
        manualMembers.clear();
      }
    }

    // Update UI
    this.updateManualGroupButtonState();
    this.updateManualGroupStatus();

    // Trigger bubble set update
    await this.cache.gcm.decideToRenderOrDraw();

    this.cache.ui.info('Cleared all manual bubble groups');
  }
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

export { GraphBubbleSetManager };