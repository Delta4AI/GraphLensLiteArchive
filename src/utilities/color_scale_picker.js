class ColorScalePicker {
  constructor(cache) {
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
    this.currentProperty = null;
    this.dom = {};
    this.metricValuePrefix = "__metric__:";
    this.activeMetricSource = null;

    this.cache = cache;
  }

  createDom() {
    const overlay = document.createElement('div');
    overlay.className = 'picker-overlay';
    this.dom.overlay = overlay;

    const content = document.createElement('div');
    content.className = 'picker-content';
    this.dom.content = content;

    const title = document.createElement('h3');
    title.textContent = 'Map Property to Color Scale';
    title.style.marginBottom = '20px';
    title.style.textAlign = 'center';
    content.appendChild(title);

    const dropdownLabel = document.createElement('div');
    dropdownLabel.textContent = 'Select Property to Map:';
    dropdownLabel.style.fontWeight = 'bold';
    dropdownLabel.style.marginBottom = '8px';
    content.appendChild(dropdownLabel);

    const dropdown = document.createElement('select');
    dropdown.className = 'picker-dropdown';
    this.dom.dropdown = dropdown;
    content.appendChild(dropdown);

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
    content.append(gradient, handleContainer, controls, categoryContainer, buttons);
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
    const filters = new Map(this.cache.data.layouts[this.cache.data.selectedLayout].filters);
    const available = new Set();

    const selectedElements = this.elementType === 'nodes' ? this.cache.selectedNodes : this.cache.selectedEdges;

    selectedElements.forEach(elementId => {
      const element = this.elementType === 'nodes'
        ? this.cache.nodeRef.get(elementId)
        : this.cache.edgeRef.get(elementId);

      element?.features.forEach(f => {
        if (filters.has(f)) available.add(f);
      });
    });

    const metricOptions = this.elementType === 'nodes'
      ? this.cache.metrics.getMetricScaleOptions()
      : [];

    dropdown.innerHTML = '<option value="">Select property</option>';
    const propertyOptions = Array.from(available).sort();
    if (propertyOptions.length > 0) {
      const dataGroup = document.createElement('optgroup');
      dataGroup.label = 'Data Properties';
      propertyOptions.forEach(prop => {
        const opt = document.createElement('option');
        opt.value = prop;
        opt.textContent = prop;
        dataGroup.appendChild(opt);
      });
      dropdown.appendChild(dataGroup);
    }

    if (metricOptions.length > 0) {
      const metricGroup = document.createElement('optgroup');
      metricGroup.label = 'Network Metrics';
      metricOptions.forEach(metric => {
        const opt = document.createElement('option');
        opt.value = `${this.metricValuePrefix}${metric.id}`;
        opt.textContent = `${metric.label} (${metric.valueLabel})${metric.cached ? '' : ' (calculate)'}`;
        metricGroup.appendChild(opt);
      });
      dropdown.appendChild(metricGroup);
    }

    dropdown.onchange = async () => {
      const value = dropdown.value;
      const metricSource = this.getMetricSource(value);
      if (metricSource) {
        await this.selectProperty(value, {isCategory: false}, metricSource);
      } else {
        await this.selectProperty(value, filters.get(value));
      }
    };
  }

  async selectProperty(property, filterObj, metricSource = null) {
    if (!property) return;

    const selectedElements = this.elementType === 'nodes' ? this.cache.selectedNodes : this.cache.selectedEdges;
    const elementRef = this.elementType === 'nodes' ? this.cache.nodeRef : this.cache.edgeRef;
    if (property.startsWith(this.metricValuePrefix) && !metricSource) {
      const metricId = property.slice(this.metricValuePrefix.length);
      metricSource = await this.cache.metrics.ensureMetricValues(metricId);
      filterObj = {isCategory: false};
    }
    if (property.startsWith(this.metricValuePrefix) && !metricSource) {
      this.cache.ui.warning('Metric values not available yet. Calculate the metric first.');
      return;
    }
    if (!filterObj) {
      this.cache.ui.warning('No values found for selected property');
      return;
    }
    this.activeMetricSource = metricSource;

    const values = [];
    const elementsWithProperty = Array.from(selectedElements)
      .filter(id => {
        if (metricSource) {
          const value = metricSource.values.get(id);
          if (value !== undefined) {
            values.push(value);
            return true;
          }
          return false;
        }
        const element = elementRef.get(id);
        const value = element?.featureValues.get(property);
        if (value !== undefined) {
          values.push(value);
          return true;
        }
        return false;
      });

    const totalElements = selectedElements.length;
    const elementsWithPropertyCount = elementsWithProperty.length;

    if (!filterObj.isCategory && values.length === 0) {
      this.cache.ui.warning('No numeric values found for selected property');
      return;
    }

    const existingCounter = this.element.querySelector('.picker-property-counter');
    if (existingCounter) {
      existingCounter.remove();
    }

    const counterEl = document.createElement('div');
    counterEl.className = 'picker-property-counter';
    counterEl.style.padding = '15px';
    counterEl.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
    counterEl.style.borderRadius = '4px';
    counterEl.style.marginTop = '15px';
    this.element.querySelector('.picker-content').insertBefore(
      counterEl,
      this.element.querySelector('.picker-gradient')
    );

    const elementTypeLabel = this.elementType === 'nodes' ? 'nodes' : 'edges';

    // Extract property label after last "::"
    const propertyDisplayName = metricSource
      ? `${metricSource.label} (${metricSource.valueLabel})`
      : (property.includes('::') ? property.split('::').pop() : property);

    // Get the current property being styled (like "Node Fill Color")
    const targetProperty = this.currentProperty || 'color';

    let summaryHTML = `
      <div style="font-size: 14px;">
        Coloring <strong>${targetProperty}</strong> for <strong>${elementsWithPropertyCount}</strong> of <strong>${totalElements}</strong> affected ${elementTypeLabel}
    `;

    // Add property range for continuous (non-category) properties
    if (!filterObj.isCategory) {
      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);

      summaryHTML += `<br><div style="font-size: 13px; color: #333; margin-top: 8px;">
          <strong>${propertyDisplayName}</strong> min: ${minVal.toFixed(2)} &nbsp;&nbsp;&nbsp;&nbsp; <strong>${propertyDisplayName}</strong> max: ${maxVal.toFixed(2)}
        </div>`;
    }

    summaryHTML += `
      </div>
    `;

    counterEl.innerHTML = summaryHTML;

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
    const selectedElements = this.elementType === 'nodes' ? this.cache.selectedNodes : this.cache.selectedEdges;
    const elementRef = this.elementType === 'nodes' ? this.cache.nodeRef : this.cache.edgeRef;
    const values = this.activeMetricSource
      ? Array.from(selectedElements)
        .map(id => this.activeMetricSource.values.get(id))
        .filter(v => v !== undefined)
      : Array.from(selectedElements)
        .map(id => elementRef.get(id)?.featureValues.get(property))
        .filter(v => v !== undefined);

    this.minValue = Math.min(...values);
    this.maxValue = Math.max(...values);

    this.handles = [
      {pos: 0, color: this.defaultColors.min, value: this.minValue, fixed: true},
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
    if (this.handles.length <= 2) return;
    this.handles.splice(Math.floor(this.handles.length / 2), 1);
    this.renderHandles();
    this.updateGradient();
  }

  apply() {
    const dropdown = this.element.querySelector('.picker-dropdown');
    const colorMap = new Map();

    const selectedElements = this.elementType === 'nodes' ? this.cache.selectedNodes : this.cache.selectedEdges;
    const elementRef = this.elementType === 'nodes' ? this.cache.nodeRef : this.cache.edgeRef;

    const metricSource = this.getMetricSource(dropdown.value);
    const filterObj = metricSource
      ? {isCategory: false}
      : this.cache.data.layouts[this.cache.data.selectedLayout].filters.get(dropdown.value);
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
        }
        // Skip elements without the property - they'll keep their original color
      });
    } else {
      Array.from(selectedElements).forEach(elementId => {
        const element = elementRef.get(elementId);
        const value = metricSource
          ? metricSource.values.get(elementId)
          : element?.featureValues.get(dropdown.value);

        if (value !== undefined) {
          const normalizedValue = ((value - this.minValue) / (this.maxValue - this.minValue)) * 100;
          const color = this.getColorForValue(normalizedValue);
          colorMap.set(elementId, color);
        }
        // Skip elements without the property - they'll keep their original color
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

    // Find the appropriate pair of handles, skipping overlapping ones
    for (let i = 0; i < sortedHandles.length - 1; i++) {
      const currentHandle = sortedHandles[i];
      const nextHandle = sortedHandles[i + 1];

      // Skip if handles are at the same position (overlapping)
      if (currentHandle.pos === nextHandle.pos) {
        continue;
      }

      if (currentHandle.pos <= normalizedValue && nextHandle.pos >= normalizedValue) {
        lower = currentHandle;
        upper = nextHandle;
        break;
      }
    }

    // Handle case where handles are at the same position (division by zero)
    // This can happen if all handles overlap at the same position
    if (lower.pos === upper.pos) {
      // Use the upper color (last in sort order at that position)
      return upper.color;
    }

    const t = (normalizedValue - lower.pos) / (upper.pos - lower.pos);
    return this.interpolateColor(lower.color, upper.color, t);
  }

  interpolateColor(color1, color2, t) {
    // Clamp t to [0, 1] range to handle edge cases
    t = Math.max(0, Math.min(1, isNaN(t) ? 0 : t));

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

  getMetricSource(property) {
    if (!property || !property.startsWith(this.metricValuePrefix)) return null;
    const metricId = property.slice(this.metricValuePrefix.length);
    return this.cache.metrics.getMetricScaleValues(metricId);
  }
}

function replaceColorScale(obj, elemID, colorMap) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  for (let key in obj) {
    const value = obj[key];

    if (value === "set_continuous_color_scale") {
      // Only replace if element has a color in the map
      if (colorMap.has(elemID)) {
        obj[key] = colorMap.get(elemID);
      } else {
        // Delete the key so this property is not modified for elements without the property
        delete obj[key];
      }
    } else if (typeof value === 'object') {
      replaceColorScale(value, elemID, colorMap);
    }
  }

  return obj;
}

export {ColorScalePicker, replaceColorScale};
