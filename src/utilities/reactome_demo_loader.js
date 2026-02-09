class ReactomeDemoDataLoader {
  constructor(cache, pathwayId = 'R-HSA-1640170', includeDisease = true, maxReactions = 200) {
    this.cache = cache;
    this.baseUrl = 'https://reactome.org/ContentService';
    this.pathwayId = pathwayId.trim();
    this.includeDisease = includeDisease;
    this.maxReactions = maxReactions;
  }

  async loadNetwork() {
    await this.cache.ui.showLoading(
      'Reactome Data',
      `Loading Reactome pathway ${this.pathwayId}...`
    );

    try {
      // Step 1: Fetch all contained events in the pathway
      await this.cache.ui.showLoading(
        'Reactome Data',
        `Step 1/4: Fetching contained events for ${this.pathwayId}...`
      );
      const containedEvents = await this._fetchJson(
        `${this.baseUrl}/data/pathway/${this.pathwayId}/containedEvents`
      );

      if (!containedEvents || containedEvents.length === 0) {
        this.cache.ui.warning('No events found in this Reactome pathway. Check the pathway ID.');
        return null;
      }

      // Separate reactions from sub-pathways
      const reactionClasses = new Set([
        'Reaction', 'BlackBoxEvent', 'Polymerisation', 'Depolymerisation',
        'FailedReaction'
      ]);

      let reactions = containedEvents.filter(e => reactionClasses.has(e.schemaClass));
      const subPathways = containedEvents.filter(e => e.schemaClass === 'Pathway');

      // Filter disease reactions if requested
      if (!this.includeDisease) {
        reactions = reactions.filter(r => !r.isInDisease);
      }

      if (reactions.length === 0) {
        this.cache.ui.warning('No reactions found in this pathway after filtering.');
        return null;
      }

      // Cap reactions to avoid huge API load
      if (reactions.length > this.maxReactions) {
        this.cache.ui.warning(
          `Pathway has ${reactions.length} reactions. Capping to ${this.maxReactions}. ` +
          `Increase "Max Reactions" if needed.`
        );
        reactions = reactions.slice(0, this.maxReactions);
      }

      // Step 2: Fetch detailed info for each reaction (inputs/outputs/compartments)
      await this.cache.ui.showLoading(
        'Reactome Data',
        `Step 2/4: Fetching details for ${reactions.length} reactions...`
      );
      const reactionDetails = await this._fetchReactionDetails(reactions);

      // Step 3: Resolve parent sub-pathway hierarchy
      await this.cache.ui.showLoading(
        'Reactome Data',
        `Step 3/4: Resolving pathway hierarchy...`
      );
      const parentMap = await this._resolveParentSubPathways(reactions, subPathways);

      // Step 4: Build the network
      await this.cache.ui.showLoading(
        'Reactome Data',
        `Step 4/4: Building reaction flow network...`
      );
      return this._buildNetwork(reactions, reactionDetails, parentMap);

    } catch (err) {
      this.cache.ui.error(
        `Failed to load Reactome pathway "${this.pathwayId}". ` +
        `Make sure the pathway ID is valid. Error: ${err.message}`
      );
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // API fetching
  // ---------------------------------------------------------------------------

  async _fetchReactionDetails(reactions) {
    const batchSize = 20;
    const allDetails = new Map();

    for (let i = 0; i < reactions.length; i += batchSize) {
      const batch = reactions.slice(i, i + batchSize);
      const processed = Math.min(i + batchSize, reactions.length);

      await this.cache.ui.showLoading(
        'Reactome Data',
        `Step 2/4: Fetching reaction details ${processed}/${reactions.length}...`
      );

      const results = await Promise.all(
        batch.map(async (r) => {
          try {
            const detail = await this._fetchJson(
              `${this.baseUrl}/data/query/${r.stId}`
            );
            return { id: r.stId, detail };
          } catch {
            return { id: r.stId, detail: null };
          }
        })
      );

      results.forEach(({ id, detail }) => {
        if (detail) allDetails.set(id, detail);
      });
    }

    return allDetails;
  }

  /**
   * For each reaction, try to find which sub-pathway it belongs to by fetching
   * the sub-pathway details and checking their hasEvent arrays.
   * This is a best-effort heuristic using the already-fetched data.
   */
  async _resolveParentSubPathways(reactions, subPathways) {
    const parentMap = new Map(); // reaction stId → sub-pathway displayName

    if (subPathways.length === 0) {
      reactions.forEach(r => parentMap.set(r.stId, 'Top-level'));
      return parentMap;
    }

    // Fetch sub-pathway details in batches to read their hasEvent arrays
    const batchSize = 10;
    const subPathwayEvents = new Map(); // spStId → Set of child event stIds

    for (let i = 0; i < subPathways.length; i += batchSize) {
      const batch = subPathways.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async (sp) => {
          try {
            const detail = await this._fetchJson(
              `${this.baseUrl}/data/query/${sp.stId}`
            );
            const childIds = (detail.hasEvent || []).map(e => e.stId || String(e.dbId));
            return { stId: sp.stId, displayName: sp.displayName, childIds };
          } catch {
            return { stId: sp.stId, displayName: sp.displayName, childIds: [] };
          }
        })
      );

      results.forEach(({ stId, displayName, childIds }) => {
        subPathwayEvents.set(stId, { displayName, childIds: new Set(childIds) });
      });
    }

    // Assign each reaction to its most specific (deepest) parent sub-pathway
    const reactionIds = new Set(reactions.map(r => r.stId));

    reactions.forEach(r => {
      let bestParent = 'Top-level';
      let bestSize = Infinity; // prefer smallest (most specific) sub-pathway

      subPathwayEvents.forEach(({ displayName, childIds }) => {
        if (childIds.has(r.stId) && childIds.size < bestSize) {
          bestParent = displayName;
          bestSize = childIds.size;
        }
      });

      parentMap.set(r.stId, this._sanitizeForAST(bestParent));
    });

    return parentMap;
  }

  // ---------------------------------------------------------------------------
  // Network building
  // ---------------------------------------------------------------------------

  _buildNetwork(reactions, reactionDetails, parentMap) {
    const nodeMap = new Map();

    // For each reaction, parse its entities into structured objects
    const reactionInputs = new Map();   // stId → Map<entityKey, EntityInfo>
    const reactionOutputs = new Map();  // stId → Map<entityKey, EntityInfo>

    reactions.forEach(reaction => {
      const detail = reactionDetails.get(reaction.stId);

      const inputs = this._parseEntities(detail?.input);
      const outputs = this._parseEntities(detail?.output);

      reactionInputs.set(reaction.stId, inputs);
      reactionOutputs.set(reaction.stId, outputs);

      // Extract compartment from the DETAIL response (not the lightweight event)
      const compartments = (detail?.compartment || reaction.compartment || [])
        .map(c => this._sanitizeForAST(c.displayName || c.name || 'Unknown'));
      const compartment = compartments.length > 0 ? compartments.join('|') : 'Unknown';

      // Schema class & category
      const schemaClass = this._sanitizeForAST(
        detail?.schemaClass || reaction.schemaClass || 'Unknown'
      );
      const category = this._sanitizeForAST(
        detail?.category || reaction.category || 'transition'
      );

      const isDisease = detail?.isInDisease ?? reaction.isInDisease ?? false;
      const parentSubPathway = parentMap.get(reaction.stId) || 'Top-level';

      const nodeId = reaction.stId;
      const label = this._sanitizeForAST(
        detail?.displayName || reaction.displayName || reaction.stId
      );

      nodeMap.set(reaction.stId, {
        id: nodeId,
        label: label,
        style: {
          labelText: label,
          fill: this._getCompartmentColor(compartment),
        },
        D4Data: {
          'Node filters': {
            'Reactome': {
              'Compartment': compartment,
              'Schema Class': schemaClass,
              'Is Disease': isDisease ? 'Yes' : 'No',
              'Category': category,
              'Sub-Pathway': parentSubPathway,
            }
          }
        }
      });
    });

    // Build edges based on biochemical flow (output of A → input of B)
    const reactionIds = Array.from(nodeMap.keys());
    const edgeCandidates = [];

    for (let i = 0; i < reactionIds.length; i++) {
      for (let j = i + 1; j < reactionIds.length; j++) {
        const idA = reactionIds[i];
        const idB = reactionIds[j];

        const outsA = reactionOutputs.get(idA);
        const insB = reactionInputs.get(idB);
        const outsB = reactionOutputs.get(idB);
        const insA = reactionInputs.get(idA);

        // A→B: outputs of A that are inputs of B
        const sharedAtoB = this._findSharedEntities(outsA, insB);
        // B→A: outputs of B that are inputs of A
        const sharedBtoA = this._findSharedEntities(outsB, insA);

        if (sharedAtoB.length === 0 && sharedBtoA.length === 0) continue;

        // Determine flow direction
        const hasForward = sharedAtoB.length > 0;
        const hasReverse = sharedBtoA.length > 0;
        let flowDirection;
        if (hasForward && hasReverse) flowDirection = 'Bidirectional';
        else if (hasForward) flowDirection = 'Forward';
        else flowDirection = 'Reverse';

        // Merge all shared entities
        const allShared = [...sharedAtoB, ...sharedBtoA];
        // Deduplicate by key
        const seen = new Set();
        const uniqueShared = allShared.filter(e => {
          if (seen.has(e.key)) return false;
          seen.add(e.key);
          return true;
        });

        edgeCandidates.push({
          source: idA,
          target: idB,
          sharedEntities: uniqueShared,
          flowDirection,
          forwardCount: sharedAtoB.length,
          reverseCount: sharedBtoA.length,
        });
      }
    }

    // Fallback: if no biochemical flow edges, connect reactions sequentially by sub-pathway
    if (edgeCandidates.length === 0 && reactionIds.length > 1) {
      const bySubPathway = new Map();
      reactionIds.forEach(id => {
        const sp = nodeMap.get(id).D4Data['Node filters']['Reactome']['Sub-Pathway'];
        if (!bySubPathway.has(sp)) bySubPathway.set(sp, []);
        bySubPathway.get(sp).push(id);
      });

      bySubPathway.forEach((ids) => {
        for (let k = 0; k < ids.length - 1; k++) {
          edgeCandidates.push({
            source: ids[k],
            target: ids[k + 1],
            sharedEntities: [],
            flowDirection: 'Sequential',
            forwardCount: 0,
            reverseCount: 0,
          });
        }
      });
    }

    // Compute edge stats for color scaling
    const allCounts = edgeCandidates.map(e => e.sharedEntities.length);
    const minShared = allCounts.length > 0 ? Math.min(...allCounts) : 0;
    const maxShared = allCounts.length > 0 ? Math.max(...allCounts) : 0;

    // Build edges with rich filter data
    const edges = edgeCandidates.map(ec => {
      const totalCount = ec.sharedEntities.length;

      // Group shared entities by compartment
      const byCompartment = new Map();
      const entityTypes = new Set();
      const baseNames = new Set();

      ec.sharedEntities.forEach(e => {
        const comp = e.compartment || 'Unknown';
        if (!byCompartment.has(comp)) byCompartment.set(comp, []);
        byCompartment.get(comp).push(e.baseName);
        if (e.schemaClass) entityTypes.add(e.schemaClass);
        baseNames.add(e.baseName);
      });

      // Build the "Shared Compartments" value: list of compartments
      const sharedCompartments = Array.from(byCompartment.keys()).sort().join('|') || 'None';

      // Pick the "primary" shared entity type
      const entityTypeStr = entityTypes.size > 0
        ? Array.from(entityTypes).sort().join('|')
        : 'Unknown';

      // Build readable shared entity names (just base names, deduplicated)
      const sharedNamesList = Array.from(baseNames).sort();
      const sharedNamesStr = sharedNamesList.length <= 5
        ? sharedNamesList.join('|')
        : `${sharedNamesList.slice(0, 5).join('|')} (+${sharedNamesList.length - 5} more)`;

      return {
        id: `${ec.source}::${ec.target}`,
        source: ec.source,
        target: ec.target,
        style: {
          stroke: this._getEdgeColor(totalCount, minShared, maxShared),
          lineWidth: Math.max(0.5, Math.min(5, totalCount * 1.2)),
        },
        D4Data: {
          'Edge filters': {
            'Connection': {
              'Flow Direction': this._sanitizeForAST(ec.flowDirection),
              'Shared Entity Count': totalCount || 1,
            },
            'Shared Entities': {
              'Entity Names': this._sanitizeForAST(sharedNamesStr),
              'Entity Types': this._sanitizeForAST(entityTypeStr),
              'Compartments': this._sanitizeForAST(sharedCompartments),
            }
          }
        }
      };
    });

    // Finalize nodes
    const finalNodes = Array.from(nodeMap.values());

    // Build data headers — only include filter keys that have >1 unique value
    const nodeFilterKeys = ['Compartment', 'Schema Class', 'Is Disease', 'Category', 'Sub-Pathway'];
    const nodeDataHeaders = nodeFilterKeys
      .filter(key => {
        const vals = new Set(finalNodes.map(
          n => n.D4Data['Node filters']['Reactome'][key]
        ));
        return vals.size > 1;
      })
      .map(key => ({ subGroup: 'Reactome', key }));

    const edgeFilterDefs = [
      { subGroup: 'Connection', key: 'Flow Direction' },
      { subGroup: 'Connection', key: 'Shared Entity Count' },
      { subGroup: 'Shared Entities', key: 'Entity Names' },
      { subGroup: 'Shared Entities', key: 'Entity Types' },
      { subGroup: 'Shared Entities', key: 'Compartments' },
    ];
    const edgeDataHeaders = edgeFilterDefs.filter(def => {
      const vals = new Set(edges.map(
        e => e.D4Data['Edge filters'][def.subGroup]?.[def.key]
      ));
      return vals.size > 1;
    });

    return {
      nodes: finalNodes,
      edges,
      nodeDataHeaders,
      edgeDataHeaders,
    };
  }

  // ---------------------------------------------------------------------------
  // Entity parsing — extract base name, compartment, and type from displayName
  // ---------------------------------------------------------------------------

  /**
   * Parse an array of entity refs from the Reactome /data/query response.
   * Each entity has { displayName, stId, dbId, schemaClass, ... }
   * displayName often looks like "CCNE-CDK2 [cytosol]" or "ATP [nucleoplasm]"
   * Returns a Map<entityKey, EntityInfo>
   */
  _parseEntities(entityArray) {
    const result = new Map();
    if (!entityArray || !Array.isArray(entityArray)) return result;

    entityArray.forEach(entity => {
      const raw = entity.displayName || entity.stId || String(entity.dbId);
      const parsed = this._parseEntityName(raw);
      const key = `${parsed.baseName}||${parsed.compartment}`;

      result.set(key, {
        key,
        baseName: this._sanitizeForAST(parsed.baseName),
        compartment: this._sanitizeForAST(parsed.compartment),
        schemaClass: this._sanitizeForAST(entity.schemaClass || 'Unknown'),
        stId: entity.stId || String(entity.dbId),
      });
    });

    return result;
  }

  /**
   * Parse "CCNE-CDK2 [cytosol]" → { baseName: "CCNE-CDK2", compartment: "cytosol" }
   * Handles square brackets (common) and also round brackets used in some names.
   */
  _parseEntityName(displayName) {
    if (!displayName) return { baseName: 'Unknown', compartment: 'Unknown' };

    // Reactome typically uses [compartment] at the end
    const bracketMatch = displayName.match(/^(.+?)\s*\[([^\]]+)\]\s*$/);
    if (bracketMatch) {
      return {
        baseName: bracketMatch[1].trim(),
        compartment: bracketMatch[2].trim(),
      };
    }

    return { baseName: displayName.trim(), compartment: 'Unknown' };
  }

  /**
   * Find entities that appear in both entity maps (output of one → input of another).
   * Matches by base name regardless of compartment, to capture cross-compartment flow.
   */
  _findSharedEntities(outputMap, inputMap) {
    const shared = [];
    if (!outputMap || !inputMap) return shared;

    // Build a lookup of input base names
    const inputByBaseName = new Map();
    inputMap.forEach((info) => {
      if (!inputByBaseName.has(info.baseName)) {
        inputByBaseName.set(info.baseName, []);
      }
      inputByBaseName.get(info.baseName).push(info);
    });

    // Check each output entity's base name against inputs
    const seen = new Set();
    outputMap.forEach((outInfo) => {
      const matching = inputByBaseName.get(outInfo.baseName);
      if (matching && !seen.has(outInfo.baseName)) {
        seen.add(outInfo.baseName);
        // Use the output entity info (it's what flows from A→B)
        shared.push(outInfo);
      }
    });

    return shared;
  }

  // ---------------------------------------------------------------------------
  // Styling helpers
  // ---------------------------------------------------------------------------

  _getCompartmentColor(compartment) {
    const colorMap = {
      'cytosol': '#8ecae6',
      'nucleoplasm': '#219ebc',
      'cytoplasm': '#a8dadc',
      'mitochondrial matrix': '#ffb703',
      'endoplasmic reticulum lumen': '#fb8500',
      'golgi lumen': '#e76f51',
      'extracellular region': '#2a9d8f',
      'plasma membrane': '#e9c46a',
      'endosome membrane': '#f4a261',
      'mitochondrial outer membrane': '#d4a373',
      'nuclear envelope': '#457b9d',
      'mitochondrial intermembrane space': '#bc6c25',
    };

    const lower = (compartment || '').toLowerCase();
    for (const [key, color] of Object.entries(colorMap)) {
      if (lower.includes(key)) return color;
    }

    // Deterministic fallback from string hash
    let hash = 0;
    for (let i = 0; i < compartment.length; i++) {
      hash = compartment.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 55%, 65%)`;
  }

  _getEdgeColor(count, minCount, maxCount) {
    const normalized = maxCount === minCount
      ? 0.5
      : (count - minCount) / (maxCount - minCount);

    const greyColor = { r: 135, g: 137, b: 150 };
    const blueColor = { r: 140, g: 166, b: 217 };
    const purpleColor = { r: 153, g: 170, b: 187 };
    const pinkColor = { r: 239, g: 176, b: 170 };

    let r, g, b;

    if (normalized <= 0.33) {
      const t = normalized / 0.33;
      r = Math.round(greyColor.r + (blueColor.r - greyColor.r) * t);
      g = Math.round(greyColor.g + (blueColor.g - greyColor.g) * t);
      b = Math.round(greyColor.b + (blueColor.b - greyColor.b) * t);
    } else if (normalized <= 0.66) {
      const t = (normalized - 0.33) / 0.33;
      r = Math.round(blueColor.r + (purpleColor.r - blueColor.r) * t);
      g = Math.round(blueColor.g + (purpleColor.g - blueColor.g) * t);
      b = Math.round(blueColor.b + (purpleColor.b - blueColor.b) * t);
    } else {
      const t = (normalized - 0.66) / 0.34;
      r = Math.round(purpleColor.r + (pinkColor.r - purpleColor.r) * t);
      g = Math.round(purpleColor.g + (pinkColor.g - purpleColor.g) * t);
      b = Math.round(purpleColor.b + (pinkColor.b - purpleColor.b) * t);
    }

    return `rgb(${r}, ${g}, ${b})`;
  }

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------

  async _fetchJson(url) {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) {
      throw new Error(`Reactome API ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }

  _sanitizeForAST(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/\(/g, '{')
      .replace(/\)/g, '}')
      .replace(/\[/g, '{')
      .replace(/]/g, '}')
      .replace(/:/g, '-')
      .replace(/,/g, ' ')
      .replace(/&/g, 'and')
      .replace(/</g, 'less')
      .replace(/>/g, 'greater')
      .replace(/"/g, '')
      .replace(/'/g, '')
      .replace(/\\/g, '')
      .replace(/\//g, ' or ');
  }
}

export { ReactomeDemoDataLoader };