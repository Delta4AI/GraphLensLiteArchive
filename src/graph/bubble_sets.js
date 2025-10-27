import {StaticUtilities} from "../utilities/static";

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
      return [...this.cache.nodeRef.keys()].filter(nodeID => !membersAsArray.includes(nodeID));
    }

    const avoidMembers = getAvoidMembers();

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

  async clearBubbleSetInstanceMembers() {
    for (const group of this.traverseBubbleSets()) {
      await this.cache.INSTANCES.BUBBLE_GROUPS[group].update({
        members: [],
      });
    }
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