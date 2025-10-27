import {Popup} from "../utilities/popup.js";

class StashManager {
  constructor(cache) {
    this.cache = cache;
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
    this.cache.ui.info(`Created filter profile: ${stashName}`)
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
      selectedEdges: [...this.cache.selectedEdges],
    }

    for (const group of this.cache.bs.traverseBubbleSets()) {
      this.cache.data.stash[stashName].bubbleSets[group] = [...this.cache.INSTANCES.BUBBLE_GROUPS[group].members.keys()];
      this.cache.data.stash[stashName].groupedProps[group] = new Set([...this.cache.data.layouts[this.cache.data.selectedLayout][`${group}Props`]]);
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

    const {zoom, position} = this.cache.data.stash[selected];

    await this.cache.graph.zoomTo(1, false);
    await this.cache.graph.translateTo(position, false);
    await this.cache.graph.zoomTo(zoom, false);

    this.cache.ui.debug(`Viewport restored. Zoom: ${zoom}, Position: ${position}`);
  }

  async loadStash() {
    const selected = document.getElementById("selectStash").value;

    const query = this.cache.data.stash[selected]["query"];
    const groupedProps = this.cache.data.stash[selected].groupedProps;

    this.cache.data.layouts[this.cache.data.selectedLayout]["query"] = query;
    this.cache.data.layouts[this.cache.data.selectedLayout].filters = this.cache.io.parseFiltersAsMap(this.cache.data.stash[selected].filters);
    for (const group of this.cache.bs.traverseBubbleSets()) {
      this.cache.data.layouts[this.cache.data.selectedLayout][`${group}Props`] = new Set([...groupedProps[group]]);
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
      select.value = '';
      this.ui.refreshStashUI();
      this.cache.ui.info(`Removed filter profile: ${val}`);
    }
  }
}

export {StashManager};