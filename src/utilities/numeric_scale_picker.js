class NumericScalePicker {
  constructor(cache) {
    this.element = null;
    this.resolvePromise = null;
    this.minValue = 0;
    this.maxValue = 0;
    this.minOutput = 0;
    this.maxOutput = 100;
    this.elementType = "nodes";
    this.propertyName = null;
    this.dom = {};
    this.cache = cache;
    this.metricValuePrefix = "__metric__:";
    this.activeMetricSource = null;
  }

  createDom() {
    const overlay = document.createElement('div');
    overlay.className = 'picker-overlay';
    this.dom.overlay = overlay;

    const content = document.createElement('div');
    content.className = 'picker-content numeric-scale-picker';
    this.dom.content = content;

    const header = document.createElement('div');
    header.className = 'picker-header';
    const title = document.createElement('span');
    title.className = 'picker-title';
    title.textContent = 'Map Property to Numeric Scale';
    header.appendChild(title);
    content.appendChild(header);

    const body = document.createElement('div');
    body.className = 'picker-body';
    this.dom.body = body;

    const dropdownLabel = document.createElement('div');
    dropdownLabel.textContent = 'Select Property to Map:';
    dropdownLabel.style.fontWeight = 'bold';
    dropdownLabel.style.marginBottom = '8px';
    body.appendChild(dropdownLabel);

    const dropdown = document.createElement('select');
    dropdown.className = 'picker-dropdown';
    this.dom.dropdown = dropdown;
    body.appendChild(dropdown);

    const rangeConfig = document.createElement('div');
    rangeConfig.className = 'numeric-scale-config';
    rangeConfig.style.display = 'none';
    rangeConfig.style.marginTop = '20px';
    rangeConfig.style.padding = '15px';
    rangeConfig.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
    rangeConfig.style.borderRadius = '4px';
    this.dom.rangeConfig = rangeConfig;

    // Summary info
    const summaryInfo = document.createElement('div');
    summaryInfo.className = 'numeric-scale-summary-info';
    this.dom.summaryInfo = summaryInfo;
    rangeConfig.appendChild(summaryInfo);

    // Separator
    const separator = document.createElement('hr');
    separator.style.border = 'none';
    separator.style.borderTop = '1px solid rgba(0, 0, 0, 0.2)';
    separator.style.margin = '12px 0';
    rangeConfig.appendChild(separator);

    // Output range row
    const outputRow = document.createElement('div');
    outputRow.style.display = 'flex';
    outputRow.style.alignItems = 'center';
    outputRow.style.gap = '10px';

    const outputLabel = document.createElement('span');
    outputLabel.innerHTML = `Set <strong>${this.propertyName || 'output'}</strong> range to:`;
    outputLabel.style.fontSize = '14px';
    this.dom.outputLabel = outputLabel;
    outputRow.appendChild(outputLabel);

    const minOutputInput = document.createElement('input');
    minOutputInput.type = 'number';
    minOutputInput.className = 'style-input';
    minOutputInput.style.width = '70px';
    minOutputInput.value = this.minOutput;
    minOutputInput.step = 'any';
    minOutputInput.oninput = () => {
      this.minOutput = parseFloat(minOutputInput.value) || 0;
    };
    this.dom.minOutputInput = minOutputInput;
    outputRow.appendChild(minOutputInput);

    const arrow = document.createElement('span');
    arrow.textContent = '→';
    arrow.style.fontSize = '18px';
    arrow.style.color = '#666';
    outputRow.appendChild(arrow);

    const maxOutputInput = document.createElement('input');
    maxOutputInput.type = 'number';
    maxOutputInput.className = 'style-input';
    maxOutputInput.style.width = '70px';
    maxOutputInput.value = this.maxOutput;
    maxOutputInput.step = 'any';
    maxOutputInput.oninput = () => {
      this.maxOutput = parseFloat(maxOutputInput.value) || 100;
    };
    this.dom.maxOutputInput = maxOutputInput;
    outputRow.appendChild(maxOutputInput);

    rangeConfig.appendChild(outputRow);
    body.appendChild(rangeConfig);

    // Buttons
    const buttons = document.createElement('div');
    buttons.className = 'picker-button-container';

    const cancelButton = document.createElement('button');
    cancelButton.className = 'picker-button secondary';
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = () => this.cancel();

    const applyButton = document.createElement('button');
    applyButton.className = 'picker-button primary disabled';
    applyButton.textContent = 'Apply';
    applyButton.onclick = () => this.apply();
    this.dom.applyButton = applyButton;

    buttons.append(cancelButton, applyButton);
    content.append(body, buttons);

    overlay.appendChild(content);
    this.element = overlay;
    return overlay;
  }

  async pickNumericScale(elementType = 'nodes', propertyName = null) {
    this.elementType = elementType;
    this.propertyName = propertyName;
    this.setDefaultOutputRange();
    return new Promise(resolve => {
      this.resolvePromise = resolve;
      document.body.appendChild(this.createDom());
      // Update input values after setting defaults
      if (this.dom.minOutputInput) {
        this.dom.minOutputInput.value = this.minOutput;
      }
      if (this.dom.maxOutputInput) {
        this.dom.maxOutputInput.value = this.maxOutput;
      }
      this.initializeFilters();
    });
  }

  setDefaultOutputRange() {
    // Set default output range based on property name
    if (this.elementType === 'nodes') {
      const defaults = this.cache.DEFAULTS.NODE;
      switch (this.propertyName) {
        case 'Node Size':
          this.minOutput = defaults.SIZE;
          this.maxOutput = 50;
          break;
        case 'Node Border Size':
          this.minOutput = defaults.LINE_WIDTH;
          this.maxOutput = 10;
          break;
        case 'Node Label Font Size':
          this.minOutput = defaults.LABEL.FONT_SIZE;
          this.maxOutput = 30;
          break;
        default:
          this.minOutput = 0;
          this.maxOutput = 100;
      }
    } else {
      const defaults = this.cache.DEFAULTS.EDGE;
      switch (this.propertyName) {
        case 'Edge Width':
          this.minOutput = defaults.LINE_WIDTH;
          this.maxOutput = 10;
          break;
        case 'Edge Dash':
          this.minOutput = defaults.LINE_DASH;
          this.maxOutput = 40;
          break;
        case 'Edge Label Font Size':
          this.minOutput = defaults.LABEL.FONT_SIZE;
          this.maxOutput = 30;
          break;
        case 'Edge Halo Width':
          this.minOutput = defaults.HALO.WIDTH;
          this.maxOutput = 10;
          break;
        default:
          this.minOutput = 0;
          this.maxOutput = 100;
      }
    }
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
        const filterObj = filters.get(f);
        // Only include numeric (non-category) properties
        if (filterObj && !filterObj.isCategory) {
          available.add(f);
        }
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

    dropdown.onchange = async () => this.selectProperty(dropdown.value);
  }

  async selectProperty(property) {
    if (!property) return;

    const selectedElements = this.elementType === 'nodes' ? this.cache.selectedNodes : this.cache.selectedEdges;
    const elementRef = this.elementType === 'nodes' ? this.cache.nodeRef : this.cache.edgeRef;
    let metricSource = this.getMetricSource(property);
    if (property.startsWith(this.metricValuePrefix) && !metricSource) {
      const metricId = property.slice(this.metricValuePrefix.length);
      metricSource = await this.cache.metrics.ensureMetricValues(metricId);
    }
    if (property.startsWith(this.metricValuePrefix) && !metricSource) {
      this.cache.ui.warning('Metric values not available yet. Calculate the metric first.');
      return;
    }
    this.activeMetricSource = metricSource;

    const values = [];
    let elementsWithProperty = 0;

    if (metricSource) {
      Array.from(selectedElements).forEach(id => {
        const value = metricSource.values.get(id);
        if (value !== undefined && !isNaN(value)) {
          values.push(value);
          elementsWithProperty += 1;
        }
      });
    } else {
      Array.from(selectedElements).forEach(id => {
        const value = elementRef.get(id)?.featureValues.get(property);
        if (value !== undefined && !isNaN(value)) {
          values.push(value);
          elementsWithProperty += 1;
        }
      });
    }

    if (values.length === 0) {
      this.cache.ui.warning('No numeric values found for selected property');
      return;
    }

    this.minValue = Math.min(...values);
    this.maxValue = Math.max(...values);

    const totalElements = selectedElements.length;
    const elementTypeLabel = this.elementType === 'nodes' ? 'nodes' : 'edges';

    // Extract property label after last "::"
    const propertyDisplayName = metricSource
      ? `${metricSource.label} (${metricSource.valueLabel})`
      : (property.includes('::') ? property.split('::').pop() : property);

    this.dom.summaryInfo.innerHTML = `
      <div style="font-size: 14px; margin-bottom: 8px;">
        Scaling <strong>${this.propertyName || 'property'}</strong> for <strong>${elementsWithProperty}</strong> of <strong>${totalElements}</strong> affected ${elementTypeLabel}
      </div>
      <div style="font-size: 13px; color: #333;">
        <strong>${propertyDisplayName}</strong> min: ${this.minValue.toFixed(2)} &nbsp;&nbsp;&nbsp;&nbsp; <strong>${propertyDisplayName}</strong> max: ${this.maxValue.toFixed(2)}
      </div>
    `;

    // Update the output label with property name
    if (this.dom.outputLabel) {
      this.dom.outputLabel.innerHTML = `Set <strong>${this.propertyName || 'output'}</strong> range to:`;
    }

    this.dom.rangeConfig.style.display = 'block';
    this.dom.applyButton.classList.remove('disabled');
  }

  apply() {
    const dropdown = this.element.querySelector('.picker-dropdown');
    const property = dropdown.value;

    if (!property) {
      this.cancel();
      return;
    }

    const selectedElements = this.elementType === 'nodes' ? this.cache.selectedNodes : this.cache.selectedEdges;
    const elementRef = this.elementType === 'nodes' ? this.cache.nodeRef : this.cache.edgeRef;
    const metricSource = this.getMetricSource(property);

    const scaleMap = new Map();

    Array.from(selectedElements).forEach(elementId => {
      const element = elementRef.get(elementId);
      const value = metricSource ? metricSource.values.get(elementId) : element?.featureValues.get(property);

      if (value !== undefined && !isNaN(value)) {
        // Linear interpolation from [minValue, maxValue] to [minOutput, maxOutput]
        const normalizedValue = (value - this.minValue) / (this.maxValue - this.minValue);
        const scaledValue = this.minOutput + normalizedValue * (this.maxOutput - this.minOutput);
        scaleMap.set(elementId, scaledValue);
      }
      // If value is undefined or NaN, don't add to map - element won't be modified
    });

    this.resolvePromise(scaleMap);
    this.close();
  }

  cancel() {
    this.resolvePromise(null);
    this.close();
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

function replaceNumericScale(obj, elemID, scaleMap) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  for (let key in obj) {
    const value = obj[key];

    if (value === "set_numeric_scale") {
      // Only replace if element has a scaled value
      if (scaleMap.has(elemID)) {
        obj[key] = scaleMap.get(elemID);
      } else {
        // Delete the key so this property is not modified for elements without the property
        delete obj[key];
      }
    } else if (typeof value === 'object') {
      replaceNumericScale(value, elemID, scaleMap);
    }
  }

  return obj;
}

export { NumericScalePicker, replaceNumericScale };
