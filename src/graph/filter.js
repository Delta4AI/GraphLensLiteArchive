class GraphFilterManager {
  constructor(cache) {
    this.cache = cache;
  }

  async resetFilters(section, subSection = undefined) {
    const idPrefix = section + (subSection ? `::${subSection}` : "");
    const affectedPropIDs = Array.from(this.cache.propIDs).filter(id => id.startsWith(idPrefix));

    for (const propID of affectedPropIDs) {
      this.cache.ui.checkCheckbox(propID, true);
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

    // skip rendering if property is not active
    if (propID !== null && !this.cache.data.layouts[this.cache.data.selectedLayout].filters.get(propID).active) {
      return;
    }

    await this.cache.ui.showLoading(header, text);
    await new Promise(resolve => requestAnimationFrame(resolve));

    // Clean up manual bubble groups (remove filtered-out nodes)
    this.cache.bs.cleanupManualGroupMembers();

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

    // we only check properties that belong to this element type (specific props for nodes and edges)
    const availableProps = new Set([
      ...(isNode ? this.cache.nodeExclusiveProps : this.cache.edgeExclusiveProps),
      ...this.cache.mixedProps,
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
    const {nodes, edges} = await this.cache.graph.getData();
    const {visible, hidden} = [...nodes, ...edges].reduce((acc, item) => {
      acc[item.style.visibility === "visible" ? 'visible' : 'hidden'].push(item.id);
      return acc;
    }, {visible: [], hidden: []});

    const showElementsDiff = idsToShow.filter(id => hidden.includes(id));
    const hideElementsDiff = idsToHide.filter(id => visible.includes(id));

    if (showElementsDiff.length > 0) {
      await this.cache.graph.showElement(showElementsDiff);
      this.cache.visibleElementsChanged = true;
    }
    if (hideElementsDiff.length > 0) {
      await this.cache.graph.hideElement(hideElementsDiff);
      this.cache.visibleElementsChanged = true;
    }
    if (this.cache.visibleElementsChanged) {
      this.cache.metrics.invalidateMetricValues();
    }

  }
}

export {GraphFilterManager};
