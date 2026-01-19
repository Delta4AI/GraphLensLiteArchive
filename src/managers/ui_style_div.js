import {StaticUtilities} from "../utilities/static.js";

function createStyleDiv(cache) {
  const root = document.createElement("div");

  function createNewRow(parent) {
    const row = document.createElement("div");
    row.classList.add("card-row");
    parent.appendChild(row);
    return row;
  }

  function appendVerticalRule(parent, label = undefined, tooltip = undefined, id = undefined, customCSSClass = undefined) {
    const verticalRule = document.createElement("div");
    verticalRule.className = "vr";
    if (customCSSClass) verticalRule.classList.add(customCSSClass);
    parent.appendChild(verticalRule);
    appendLabel(parent, label, tooltip, id, customCSSClass);
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

  function appendLabel(parent, labelText, tooltip = undefined, id = undefined, customCSSClass = undefined) {
    const label = createLabel(labelText, tooltip);
    if (id) label.id = id;
    if (customCSSClass) label.classList.add(customCSSClass);
    if (label) parent.appendChild(label);
  }

  function createCard(label, parent = undefined) {
    const card = document.createElement("div");
    card.classList.add("card-labeled");
    card.dataset.label = label;
    card.id = label;
    if (parent) {
      parent.appendChild(card);
    } else {
      root.appendChild(card);
    }
    return card;
  }

  function createSwitch(callback = undefined, inputId = undefined, enabledByDefault = false) {
    const label = document.createElement('label');
    label.className = 'switch';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = enabledByDefault;

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
      await cache.bs.updateBubbleSetStyle(property, value);
      return;
    }

    switch (property) {
      case "Node Size":
        await cache.gcm.updateNodes({style: {size: value}}, commands);
        break;
      case "Node Border Size":
        await cache.gcm.updateNodes({style: {lineWidth: value}}, commands);
        break;
      case "Node Label Font Size":
        await cache.gcm.updateNodes({style: {labelFontSize: value}}, commands);
        break;
      case "Node Label Font Color":
        await cache.gcm.updateNodes({style: {labelFill: value}}, commands);
        break;
      case "Node Label Background Color":
        await cache.gcm.updateNodes({style: {labelBackground: true, labelBackgroundFill: value}}, commands);
        break;
      case "Node Fill Color":
        await cache.gcm.updateNodes({style: {fill: value}}, commands);
        break;
      case "Node Border Color":
        await cache.gcm.updateNodes({style: {stroke: value}}, commands);
        break;
      case "Node Label Color":
        await cache.gcm.updateNodes({style: {labelFill: value}}, commands);
        break;
      case "Node Label Placement":
        await cache.gcm.updateNodes({style: {labelPlacement: value}}, commands);
        break;
      case "Edge Color":
        await cache.gcm.updateEdges({style: {stroke: value}}, commands);
        break;
      case "Edge Width":
        await cache.gcm.updateEdges({style: {lineWidth: value}}, commands);
        break;
      case "Edge Dash":
        await cache.gcm.updateEdges({style: {lineDash: value}}, commands);
        break;
      case "Edge Label Font Size":
        await cache.gcm.updateEdges({style: {labelFontSize: value}}, commands);
        break;
      case "Edge Label Offset X":
        await cache.gcm.updateEdges({style: {labelOffsetX: value}}, commands);
        break;
      case "Edge Label Offset Y":
        await cache.gcm.updateEdges({style: {labelOffsetY: value}}, commands);
        break;
      case "Edge Label Placement":
        await cache.gcm.updateEdges({style: {labelPlacement: value}}, commands);
        break;
      case "Edge Label Font Color":
        await cache.gcm.updateEdges({style: {labelFill: value}}, commands);
        break;
      case "Edge Label Background Color":
        await cache.gcm.updateEdges({style: {labelBackground: true, labelBackgroundFill: value}}, commands);
        break;
      case "Edge Label Auto Rotate":
        await cache.gcm.updateEdges({style: {labelAutoRotate: value}}, commands);
        break;
      case "Edge Start Arrow":
        await cache.gcm.updateEdges({style: {startArrow: value}}, commands);
        break;
      case "Edge End Arrow":
        await cache.gcm.updateEdges({style: {endArrow: value}}, commands);
        break;
      case "Edge Start Arrow Size":
        await cache.gcm.updateEdges({style: {startArrowSize: value}}, commands);
        break;
      case "Edge End Arrow Size":
        await cache.gcm.updateEdges({style: {endArrowSize: value}}, commands);
        break;
      case "Edge Start Arrow Type":
        await cache.gcm.updateEdges({style: {startArrowType: value}}, commands);
        break;
      case "Edge End Arrow Type":
        await cache.gcm.updateEdges({style: {endArrowType: value}}, commands);
        break;
      case "Edge Halo":
        await cache.gcm.updateEdges({style: {halo: value}}, commands);
        break;
      case "Edge Halo Width":
        await cache.gcm.updateEdges({style: {haloLineWidth: value}}, commands);
        break;
      case "Edge Halo Color":
        await cache.gcm.updateEdges({style: {haloStroke: value}}, commands);
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

  function createColorControls(parent, property, defaultColor, colors, continuousScaleBtn = true, customCSSClass = undefined) {
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
        colorButton.textContent = "×";
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

      if (customCSSClass) contScaleBtn.classList.add(customCSSClass)
      parent.appendChild(contScaleBtn);
    }
  }

  function createLabelControls(parent, property, isNode = null) {
    const labelInput = createInput(120, `Enter Custom ${property}`,
      `Set the label of the selected ${isNode ? "nodes" : "edges"} to a custom label.`, undefined,
      async () => {
        isNode ? await cache.gcm.updateNodes({
          style: {
            label: true,
            labelText: labelInput.value.trim()
          }
        }) : await cache.gcm.updateEdges({style: {label: true, labelText: labelInput.value.trim()}});
      });

    const clearLabelButton = createButton("Clear",
      `Clear the label of the selected ${isNode ? "nodes" : "edges"}.`, async () => {
        labelInput.value = "";
        const sharedOverride = {
          style: {
            label: true,
            labelText: cache.CFG.INVISIBLE_CHAR
          }
        };
        isNode ? await cache.gcm.updateNodes(sharedOverride) : await cache.gcm.updateEdges(sharedOverride);
        labelInput.value = "";
      });

    const setToIDButton = createButton("Set to ID",
      `Set the label of the selected ${isNode ? "nodes" : "edges"} to their predefined IDs.`, async () => {
        labelInput.value = "";
        const sharedCommands = ["label_set_to_id"];
        isNode ? await cache.gcm.updateNodes(undefined, sharedCommands) : await cache.gcm.updateEdges(undefined, sharedCommands);
      });
    const setToLabelButton = createButton("Set to Label",
      `Set the label of the selected ${isNode ? "nodes" : "edges"} to their predefined labels.`, async () => {
        labelInput.value = "";
        const sharedCommands = ["label_set_to_label"];
        isNode ? await cache.gcm.updateNodes(undefined, sharedCommands) : await cache.gcm.updateEdges(undefined, sharedCommands);
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
    for (const [label, value] of Object.entries(cache.DEFAULTS.STYLES.NODE_FORM)) {
      appendButton(parent, label, value,
        async () => await cache.gcm.updateNodes({type: value})
      );
    }
  }

  function createEdgeTypeControls(parent) {
    for (const label of cache.DEFAULTS.STYLES.EDGE_TYPES) {
      appendButton(parent, label, label, async () => await cache.gcm.updateEdges({type: label}));
    }
  }

  function createNodeBadgeControls(parent) {
    const badgeInput = createInput(120, "Enter Badge Text",
      "Enter the text of the badge to add to the selected nodes.", undefined, undefined);
    parent.appendChild(badgeInput);

    const badgeColorPicker = createColorPicker(cache.DEFAULTS.NODE.BADGE.COLOR, "Set the color of the badge.");
    parent.appendChild(badgeColorPicker);

    const badgePlacementDropdown = document.createElement("select");
    badgePlacementDropdown.className = "style-inner-button";
    cache.DEFAULTS.STYLES.NODE_BADGE_PLACEMENTS.forEach((placement) => {
      const option = document.createElement("option");
      option.value = placement;
      option.textContent = placement.replace("-", " ");
      badgePlacementDropdown.appendChild(option);
    });
    parent.appendChild(badgePlacementDropdown);

    appendButton(parent, "Add", "Add a badge to the selected nodes.", async () => {
      await cache.gcm.updateNodes({
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
      await cache.gcm.updateNodes({}, ["badge_clear"]);
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
            cache.ui.warning(`Ambiguous selection: ${selectedValue} matches ${ids.size} ${isNode ? 'nodes' : 'edges'} (${Array.from(ids).join(',')}).`);
          }
          await cache.gcm.focusElements(ids, isNode);
        } else {
          cache.ui.warning(`No ${isNode ? 'node' : 'edge'} found for: ${selectedValue}`);
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
      async () => await cache.sm.toggleSelectionForAllNodes(true));
    appendButton(rowOne, "No Nodes", "Deselect all visible nodes",
      async () => await cache.sm.toggleSelectionForAllNodes(false));
    appendVerticalRule(rowOne);
    appendButton(rowOne, "All Edges", "Select all visible edges",
      async () => await cache.sm.toggleSelectionForAllEdges(true));
    appendButton(rowOne, "No Edges", "Deselect all visible edges",
      async () => await cache.sm.toggleSelectionForAllEdges(false));
    appendVerticalRule(rowOne);
    appendButton(rowOne, "Expand Edges",
      "Add all edges connected to the currently selected nodes to the selection",
      async () => await cache.sm.toggleSelectionByNeighbors("expand-edges"));
    appendButton(rowOne, "Reduce Edges",
      "Remove edges that do not connect two selected nodes",
      async () => await cache.sm.toggleSelectionByNeighbors("reduce-edges"));
    appendVerticalRule(rowOne);
    appendButton(rowOne, "Expand Neighbors",
      "Add all directly connected neighbor nodes (and their edges) to the current selection",
      async () => await cache.sm.toggleSelectionByNeighbors("expand-neighbors"));
    appendButton(rowOne, "Reduce Neighbors",
      "Remove the outermost layer of selected neighbor nodes (and their edges) from the ",
      async () => await cache.sm.toggleSelectionByNeighbors("reduce-neighbors"));

    const rowTwo = createNewRow(selDiv);
    const nodeIDsTT = "Enter comma-separated list of node IDs to add/remove to/from selection\nConfirm with Enter";
    appendLabel(rowTwo, "Node ID(s)", nodeIDsTT);
    const topTwoNodeIDs = cache.data?.nodes?.slice(0, 2).map(n => n.id).join(',') || 'Node1,Node2';
    const nodeIDsInput = createInput(204, topTwoNodeIDs, nodeIDsTT, undefined,
      async (val) => {
        await cache.sm.addNodeOrEdgeIDsToSelectionWrapper(val, true);
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
        await cache.sm.addNodeOrEdgeIDsToSelectionWrapper(elements, true);
      }
    }, "selectByNodeIDsButton");
    rowTwo.appendChild(includeNodesByIdBtn);

    const edgeIDsTT = "Enter comma-separated list of edge IDs (SourceID::TargetID) to add/remove to/from selection\nConfirm with Enter";
    appendVerticalRule(rowTwo, "Edge ID(s)", edgeIDsTT);
    const topTwoEdgeIDs = cache.data?.edges?.slice(0, 2).map(e => e.id).join(',') || 'Node1::Node2,Node1::Node3';
    const edgeIDsInput = createInput(204, topTwoEdgeIDs, edgeIDsTT, undefined,
      async (val) => {
        await cache.sm.addNodeOrEdgeIDsToSelectionWrapper(val, false);
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
        await cache.sm.addNodeOrEdgeIDsToSelectionWrapper(elements, false);
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
          await cache.sm.addNodeOrEdgeLabelsToSelectionWrapper(val, true);
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
          await cache.sm.addNodeOrEdgeLabelsToSelectionWrapper(elements, true);
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
          await cache.sm.addNodeOrEdgeLabelsToSelectionWrapper(val, false);
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
          await cache.sm.addNodeOrEdgeLabelsToSelectionWrapper(elements, false);
        }
      }, "selectByEdgeLabelsButton");
      row.appendChild(includeEdgesByLabelBtn);
    }
  }

  function createArrangeNodesCard() {
    const arrDiv = createCard("Arrange Selection");

    const rowOne = createNewRow(arrDiv);
    appendButton(rowOne, "Shrink", "Move nodes closer together, halving their distance to the center.",
      () => cache.lm.layoutSelectedNodes("shrink"));
    appendButton(rowOne, "Expand", "Move nodes farther apart, doubling their distance to the center.",
      () => cache.lm.layoutSelectedNodes("expand"));
    appendVerticalRule(rowOne);
    appendButton(rowOne, "Circle", "Arrange nodes evenly in a circular layout around the center.",
      () => cache.lm.layoutSelectedNodes("circle"));
    appendButton(rowOne, "Force", "Apply a force-directed layout to the selected nodes.",
      () => cache.lm.layoutSelectedNodes("force"));
    appendButton(rowOne, "Grid", "Apply a uniform grid layout to the selected nodes.",
      () => cache.lm.layoutSelectedNodes("grid"));
    appendButton(rowOne, "Random", "Apply a random layout to the selected nodes while preserving the original layout bonds.",
      () => cache.lm.layoutSelectedNodes("random"));
  }

  function createNodeConfigCard() {
    const nodeDiv = createCard("Node Configuration");

    const rowOne = createNewRow(nodeDiv);
    appendLabel(rowOne, "Shape");
    createNodeShapeControls(rowOne);
    appendVerticalRule(rowOne, "Size");
    createNumericalSlider(rowOne, "Node Size", cache.DEFAULTS.NODE.SIZE,
      {min: 10, max: 50, step: 1});
    appendVerticalRule(rowOne, "Fill Color");
    createColorControls(rowOne, "Node Fill Color", cache.DEFAULTS.NODE.FILL_COLOR, cache.DEFAULTS.STYLES.NODE_COLORS);

    const rowTwo = createNewRow(nodeDiv);
    appendLabel(rowTwo, "Border Size", "Defines the width of the border of the selected nodes.");
    createNumericalSlider(rowTwo, "Node Border Size", cache.DEFAULTS.NODE.LINE_WIDTH,
      {min: 1, max: 10, step: 1}, "Defines the width of the border of the selected nodes.");
    appendVerticalRule(rowTwo, "Border Color", "Defines the fill color of the selected nodes.");
    createColorControls(rowTwo, "Node Border Color", cache.DEFAULTS.NODE.STROKE_COLOR,
      cache.DEFAULTS.STYLES.NODE_BORDER_COLORS);

    const rowThree = createNewRow(nodeDiv);
    appendLabel(rowThree, "Label", "Customize the selected nodes labels.");
    createLabelControls(rowThree, "Node Label", true);
    appendVerticalRule(rowThree, "Font Size", "Defines the font size of the selected nodes labels.");
    createNumericalSlider(rowThree, "Node Label Font Size", cache.DEFAULTS.NODE.LABEL.FONT_SIZE,
      {min: 10, max: 30, step: 1}, "Defines the font size of the selected nodes labels.");
    appendVerticalRule(rowThree, "Placement", "Defines the placement of the selected nodes labels.");
    createCategoricalControls(rowThree, "Node Label Placement", cache.DEFAULTS.NODE.LABEL.PLACEMENT,
      cache.DEFAULTS.STYLES.NODE_LABEL_PLACEMENTS, "Defines the placement of the selected nodes labels.");

    const rowFour = createNewRow(nodeDiv);
    appendLabel(rowFour, "Label Color",
      "Defines the foreground (text) color of the selected nodes labels.");
    createColorControls(rowFour, "Node Label Font Color", cache.DEFAULTS.NODE.LABEL.FOREGROUND_COLOR,
      cache.DEFAULTS.STYLES.NODE_LABEL_COLORS);
    appendVerticalRule(rowFour, "Label Background Color",
      "Defines the background color of the selected nodes labels.");
    createColorControls(rowFour, "Node Label Background Color", cache.DEFAULTS.NODE.LABEL.BACKGROUND_COLOR,
      cache.DEFAULTS.STYLES.NODE_LABEL_BACKGROUND_COLORS);

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
    createNumericalSlider(rowOne, "Edge Width", cache.DEFAULTS.EDGE.LINE_WIDTH,
      {min: 0.1, max: 10.0, step: 0.1}, "Change the width of the selected edges.");
    appendVerticalRule(rowOne, "Dash", "Define the dash pattern of the selected edges.");
    createNumericalSlider(rowOne, "Edge Dash", cache.DEFAULTS.EDGE.LINE_DASH,
      {min: 0, max: 40, step: 1}, "Define the dash pattern of the selected edges.");
    appendVerticalRule(rowOne, "Color", "Define the selected edges color.");
    createColorControls(rowOne, "Edge Color", cache.DEFAULTS.EDGE.COLOR, cache.DEFAULTS.STYLES.EDGE_COLORS);

    const rowTwo = createNewRow(edgeDiv);
    appendLabel(rowTwo, "Label", "Customize the selected edges labels.");
    createLabelControls(rowTwo, "Edge Label");
    appendVerticalRule(rowTwo, "Font Size", "Defines the font size of the selected edges labels.");
    createNumericalSlider(rowTwo, "Edge Label Font Size", cache.DEFAULTS.EDGE.LABEL.FONT_SIZE,
      {min: 10, max: 30, step: 1}, "Defines the font size of the selected edges labels.");
    appendVerticalRule(rowTwo, "Placement", "Defines the placement of the selected edges labels.");
    createCategoricalControls(rowTwo, "Edge Label Placement", cache.DEFAULTS.EDGE.LABEL.PLACEMENT,
      cache.DEFAULTS.STYLES.EDGE_LABEL_PLACEMENTS, "Defines the placement of the selected edges labels.");
    appendVerticalRule(rowTwo, "Rotate", "Enable/Disable label rotation.");
    createBooleanControls(rowTwo, "Edge Label Auto Rotate", "Enable/Disable label rotation.");

    const rowThree = createNewRow(edgeDiv);
    appendLabel(rowThree, "Label Offset X",
      "Define the offset of the selected edges labels along the X-axis.");
    createNumericalSlider(rowThree, "Edge Label Offset X", cache.DEFAULTS.EDGE.LABEL.OFFSET_X,
      {min: -100, max: 100, step: 1},
      "Define the offset of the selected edges labels along the X-axis.");
    appendVerticalRule(rowThree, "Label Offset Y",
      "Define the offset of the selected edges labels along the Y-axis.");
    createNumericalSlider(rowThree, "Edge Label Offset Y", cache.DEFAULTS.EDGE.LABEL.OFFSET_Y,
      {min: -100, max: 100, step: 1},
      "Define the offset of the selected edges labels along the Y-axis.");

    const rowFour = createNewRow(edgeDiv);
    appendLabel(rowFour, "Label Color",
      "Defines the foreground (text) color of the selected edges labels.");
    createColorControls(rowFour, "Edge Label Font Color", cache.DEFAULTS.EDGE.LABEL.FOREGROUND_COLOR,
      cache.DEFAULTS.STYLES.EDGE_LABEL_COLORS, "Defines the foreground (text) color of the selected edges labels.");
    appendVerticalRule(rowFour, "Label Background Color",
      "Defines the background color of the selected edges labels.");
    createColorControls(rowFour, "Edge Label Background Color", cache.DEFAULTS.EDGE.LABEL.BACKGROUND_COLOR,
      cache.DEFAULTS.STYLES.EDGE_LABEL_BACKGROUND_COLORS, "Defines the background color of the selected edges labels.");

    const rowFive = createNewRow(edgeDiv);
    appendLabel(rowFive, "Start Arrow", "Enable/Disable the start arrow of the selected edges.");
    createBooleanControls(rowFive, "Edge Start Arrow", "Enable/Disable the start arrow of the selected edges.");
    appendVerticalRule(rowFive, "Size", "Define the size of the start arrow of the selected edges.");
    createNumericalSlider(rowFive, "Edge Start Arrow Size", cache.DEFAULTS.EDGE.ARROWS.START_SIZE,
      {min: 10, max: 40, step: 1}, "Define the size of the start arrow of the selected edges.");
    appendVerticalRule(rowFive, "Type", "Define the type of the start arrow of the selected edges.");
    createCategoricalControls(rowFive, "Edge Start Arrow Type", cache.DEFAULTS.EDGE.ARROWS.START_TYPE,
      cache.DEFAULTS.STYLES.EDGE_ARROW_TYPES, "Define the type of the start arrow of the selected edges.");

    const rowSix = createNewRow(edgeDiv);
    appendLabel(rowSix, "End Arrow", "Enable/Disable the end arrow of the selected edges.");
    createBooleanControls(rowSix, "Edge End Arrow", "Enable/Disable the end arrow of the selected edges.");
    appendVerticalRule(rowSix, "Size", "Define the size of the end arrow of the selected edges.");
    createNumericalSlider(rowSix, "Edge End Arrow Size", cache.DEFAULTS.EDGE.ARROWS.END_SIZE,
      {min: 10, max: 40, step: 1}, "Define the size of the end arrow of the selected edges.");
    appendVerticalRule(rowSix, "Type", "Define the type of the end arrow of the selected edges.");
    createCategoricalControls(rowSix, "Edge End Arrow Type", cache.DEFAULTS.EDGE.ARROWS.END_TYPE,
      cache.DEFAULTS.STYLES.EDGE_ARROW_TYPES, "Define the type of the end arrow of the selected edges.");

    const rowSeven = createNewRow(edgeDiv);
    appendLabel(rowSeven, "Halo", "Enable/Disable a halo around the selected edges.");
    createBooleanControls(rowSeven, "Edge Halo", "Enable/Disable a halo around the selected edges.");
    appendVerticalRule(rowSeven, "Color", "Define the color of the halo for the selected edges.");
    createColorControls(rowSeven, "Edge Halo Color", cache.DEFAULTS.EDGE.COLOR,
      cache.DEFAULTS.STYLES.EDGE_COLORS);
    appendVerticalRule(rowSeven, "Width", "Define the halo width for the selected edges.");
    createNumericalSlider(rowSeven, "Edge Halo Width", cache.DEFAULTS.EDGE.HALO.WIDTH,
      {min: 1, max: 30, step: 1}, "Define the halo width for the selected edges.");
  }

  function createBubbleSetConfigCard() {
    const bubbleDiv = createCard("Bubble Set Configuration");
    const optionalCSSClass = "bubbleSetOptionalLabelConfig";

    let rowCount = 0;
    for (const group of cache.bs.traverseBubbleSets()) {
      rowCount++;

      const card = createCard(`Bubble Set ${rowCount}`, bubbleDiv);
      card.id = `bubbleSetStyleCard${group}`;

      const rowOne = createNewRow(card);
      appendLabel(rowOne, "Fill Color");
      createColorControls(rowOne, `Bubble Set ${group} Fill Color`, cache.data.layouts[cache.data.selectedLayout].bubbleSetStyle[group].fill, [], false);
      appendVerticalRule(rowOne, "Fill Opacity");
      createNumericalSlider(rowOne, `Bubble Set ${group} Fill Opacity`, cache.data.layouts[cache.data.selectedLayout].bubbleSetStyle[group].fillOpacity,
        {min: 0, max: 1, step: 0.01}, `Define the fill opacity of the bubble set ${group}.`);
      appendVerticalRule(rowOne, "Stroke Color");
      createColorControls(rowOne, `Bubble Set ${group} Stroke Color`, cache.data.layouts[cache.data.selectedLayout].bubbleSetStyle[group].stroke, [], false);
      appendVerticalRule(rowOne, "Stroke Opacity");
      createNumericalSlider(rowOne, `Bubble Set ${group} Stroke Opacity`, cache.data.layouts[cache.data.selectedLayout].bubbleSetStyle[group].strokeOpacity,
        {min: 0, max: 1, step: 0.01}, `Define the stroke opacity of the bubble set ${group}.`);

      const rowTwo = createNewRow(card);
      appendLabel(rowTwo, "Label");
      const enableTextSwitch = createSwitch(async () => {
        await cache.bs.updateBubbleSetStyle(`Bubble Set ${group} Label`, enableTextSwitch.isChecked());
      }, undefined, cache.data.layouts[cache.data.selectedLayout].bubbleSetStyle[group].label);
      rowTwo.appendChild(enableTextSwitch);
      appendVerticalRule(rowTwo, "Label Text", undefined, undefined, optionalCSSClass);
      const labelInput = createInput(120, `${group} label text`, `Enter the label text for the bubble set ${group}.`, cache.data.layouts[cache.data.selectedLayout].bubbleSetStyle[group].labelText, async () => {
        const val = labelInput.value.trim();
        await cache.bs.updateBubbleSetStyle(`Bubble Set ${group} Label Text`, val);
      });
      labelInput.classList.add(optionalCSSClass);
      rowTwo.appendChild(labelInput);
      appendVerticalRule(rowTwo, "Label Background", undefined, undefined, optionalCSSClass);
      const enableBackgroundSwitch = createSwitch(async () => {
        await cache.bs.updateBubbleSetStyle(`Bubble Set ${group} Label Background`, enableBackgroundSwitch.isChecked());
      }, undefined, cache.data.layouts[cache.data.selectedLayout].bubbleSetStyle[group].labelBackground || true);
      enableBackgroundSwitch.classList.add(optionalCSSClass);
      rowTwo.appendChild(enableBackgroundSwitch);
      appendVerticalRule(rowTwo, "Label Background Color", undefined, undefined, optionalCSSClass);
      createColorControls(rowTwo, `Bubble Set ${group} Label Background Color`, cache.data.layouts[cache.data.selectedLayout].bubbleSetStyle[group].labelBackgroundFill || cache.data.layouts[cache.data.selectedLayout].bubbleSetStyle[group].fill, [], false, optionalCSSClass);
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

export {createStyleDiv}