class Popup {
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
      width: '300px',
      height: 'auto',
      position: 'center',
      lineHeight: 'normal',
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
      const inputField = document.createElement('input');
      inputField.type = 'text';
      inputField.className = "p-prompt";

      const content = document.createElement('div');
      content.innerHTML = `<div>${message}</div>`;
      content.appendChild(inputField);

      const confirmBtn = document.createElement('button');
      confirmBtn.textContent = 'OK';
      confirmBtn.className = "p-button";
      content.appendChild(confirmBtn);

      let isConfirmed = false;

      const handleConfirm = () => {
        isConfirmed = true;
        const value = inputField.value.trim();
        popup.close();
        resolve(value);
      };

      const popup = new Popup(content, {
        width: '300px',
        showFullscreenButton: false,
        closeOnClickOutside: false,
        onClose: () => {
          if (!isConfirmed) {
            resolve(null);
          }
        }
      });

      confirmBtn.addEventListener('click', handleConfirm);
      inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleConfirm();
        }
      });

      setTimeout(() => inputField.focus(), 0);
    });
  }


  static async confirm(message) {
    return new Promise((resolve) => {
      const content = document.createElement('div');
      content.innerHTML = `<div>${message}</div>`;

      const confirmBtn = document.createElement('button');
      confirmBtn.textContent = 'OK';
      confirmBtn.className="p-button ml-1";

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.className="p-button";

      content.appendChild(confirmBtn);
      content.appendChild(cancelBtn);

      let isResolved = false;

      const popup = new Popup(content, {
        width: '300px',
        showFullscreenButton: false,
        closeOnClickOutside: false,
        onClose: () => {
          if (!isResolved) {
            resolve(null);
          }
        }
      });

      confirmBtn.addEventListener('click', () => {
        isResolved = true;
        popup.close();
        resolve(true);
      });

      cancelBtn.addEventListener('click', () => {
        isResolved = true;
        popup.close();
        resolve(false);
      });

      setTimeout(() => confirmBtn.focus(), 0);
    });
  }

  static async layoutCreationDialog(layoutInternals) {
    return new Promise((resolve) => {
      // Create container
      const container = document.createElement('div');
      container.style.padding = '10px';

      // Title
      const title = document.createElement('h3');
      title.textContent = 'Create New View Preset';
      title.style.marginTop = '0';
      container.appendChild(title);

      // Name input
      const nameLabel = document.createElement('label');
      nameLabel.textContent = 'Name:';
      nameLabel.style.display = 'block';
      nameLabel.style.marginBottom = '5px';
      container.appendChild(nameLabel);

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'p-prompt';
      nameInput.style.width = '100%';
      nameInput.style.marginBottom = '15px';
      container.appendChild(nameInput);

      // Mode selection
      const modeContainer = document.createElement('div');

      // Clone option
      const cloneDiv = document.createElement('div');
      cloneDiv.style.marginBottom = '10px';

      const cloneRadio = document.createElement('input');
      cloneRadio.type = 'radio';
      cloneRadio.name = 'layout-mode';
      cloneRadio.value = 'clone';
      cloneRadio.checked = true;
      cloneRadio.id = 'mode-clone';

      const cloneLabel = document.createElement('label');
      cloneLabel.htmlFor = 'mode-clone';
      cloneLabel.textContent = ' Clone Current View';
      cloneLabel.style.fontWeight = 'bold';

      const cloneDesc = document.createElement('p');
      cloneDesc.textContent = 'Copies all settings: positions, filters, query, and bubble groups';
      cloneDesc.style.fontSize = '12px';
      cloneDesc.style.color = '#666';
      cloneDesc.style.marginLeft = '20px';
      cloneDesc.style.marginTop = '5px';
      cloneDesc.style.marginBottom = '0';

      cloneDiv.appendChild(cloneRadio);
      cloneDiv.appendChild(cloneLabel);
      cloneDiv.appendChild(cloneDesc);
      modeContainer.appendChild(cloneDiv);

      // Template option
      const templateDiv = document.createElement('div');
      templateDiv.style.marginBottom = '10px';

      const templateRadio = document.createElement('input');
      templateRadio.type = 'radio';
      templateRadio.name = 'layout-mode';
      templateRadio.value = 'template';
      templateRadio.id = 'mode-template';

      const templateLabel = document.createElement('label');
      templateLabel.htmlFor = 'mode-template';
      templateLabel.textContent = ' Create from Template';
      templateLabel.style.fontWeight = 'bold';

      const templateDesc = document.createElement('p');
      templateDesc.textContent = 'Starts fresh with selected layout algorithm and default filters';
      templateDesc.style.fontSize = '12px';
      templateDesc.style.color = '#666';
      templateDesc.style.marginLeft = '20px';
      templateDesc.style.marginTop = '5px';
      templateDesc.style.marginBottom = '10px';

      templateDiv.appendChild(templateRadio);
      templateDiv.appendChild(templateLabel);
      templateDiv.appendChild(templateDesc);

      // Template dropdown (initially hidden)
      const dropdownContainer = document.createElement('div');
      dropdownContainer.id = 'template-dropdown-container';
      dropdownContainer.style.marginLeft = '20px';
      dropdownContainer.style.display = 'none';

      const dropdownLabel = document.createElement('label');
      dropdownLabel.textContent = 'Layout Type:';
      dropdownLabel.style.display = 'block';
      dropdownLabel.style.marginBottom = '5px';
      dropdownContainer.appendChild(dropdownLabel);

      const dropdown = document.createElement('select');
      dropdown.id = 'template-type-select';
      dropdown.className = 'p-prompt';
      dropdown.style.width = '200px';

      // Populate dropdown with layout types
      for (const [key, value] of Object.entries(layoutInternals)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key.charAt(0).toUpperCase() + key.slice(1);
        dropdown.appendChild(option);
      }

      dropdownContainer.appendChild(dropdown);
      templateDiv.appendChild(dropdownContainer);
      modeContainer.appendChild(templateDiv);

      container.appendChild(modeContainer);

      // Show/hide dropdown based on radio selection
      const updateDropdownVisibility = () => {
        dropdownContainer.style.display = templateRadio.checked ? 'block' : 'none';
      };

      cloneRadio.addEventListener('change', updateDropdownVisibility);
      templateRadio.addEventListener('change', updateDropdownVisibility);

      // Buttons
      const buttonContainer = document.createElement('div');
      buttonContainer.style.textAlign = 'right';
      buttonContainer.style.marginTop = '20px';

      const createBtn = document.createElement('button');
      createBtn.textContent = 'Create';
      createBtn.className = 'p-button ml-1';

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.className = 'p-button';

      buttonContainer.appendChild(cancelBtn);
      buttonContainer.appendChild(createBtn);
      container.appendChild(buttonContainer);

      let isResolved = false;

      const popup = new Popup(container, {
        width: '400px',
        showFullscreenButton: false,
        closeOnClickOutside: false,
        onClose: () => {
          if (!isResolved) {
            resolve(null);
          }
        }
      });

      const handleCreate = () => {
        const name = nameInput.value.trim();
        if (!name) {
          alert('Please enter a name for the layout');
          return;
        }

        isResolved = true;
        popup.close();

        const mode = cloneRadio.checked ? 'clone' : 'template';
        const result = {
          name: name,
          mode: mode,
          templateType: mode === 'template' ? dropdown.value : null
        };

        resolve(result);
      };

      createBtn.addEventListener('click', handleCreate);
      cancelBtn.addEventListener('click', () => {
        isResolved = true;
        popup.close();
        resolve(null);
      });

      nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleCreate();
        }
      });

      setTimeout(() => nameInput.focus(), 0);
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
    this.popup = document.createElement('div');
    this.popup.className = 'p-custom';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'p-header';

    if (this.options.showFullscreenButton) {
      this.fullscreenBtn = document.createElement('button');
      this.fullscreenBtn.className = 'p-icon';
      this.fullscreenBtn.innerHTML = '⛶';
      this.fullscreenBtn.title = 'Toggle fullscreen';
      headerDiv.appendChild(this.fullscreenBtn);
    }

    this.closeBtn = document.createElement('button');
    this.closeBtn.className = 'p-icon';
    this.closeBtn.innerHTML = '×';
    this.closeBtn.title = 'Close popup';
    headerDiv.appendChild(this.closeBtn);

    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';
    popupContent.style.marginTop = '20px';

    if (typeof content === 'string') {
      popupContent.innerHTML = content;
    } else {
      popupContent.appendChild(content);
    }

    this.popup.appendChild(headerDiv);
    this.popup.appendChild(popupContent);

    this.overlay = document.createElement('div');
    this.overlay.className = 'p-overlay';

    document.body.appendChild(this.overlay);
    document.body.appendChild(this.popup);

    this.popup.style.width = this.options.width;
    if (this.options.height !== 'auto') {
      this.popup.style.height = this.options.height;
    }

    if (this.options.lineHeight !== 'normal') {
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
    this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;

    if (this.isFullscreen) {
      this.popup.style.width = '100%';
      this.popup.style.height = '100%';
      this.popup.style.top = '0';
      this.popup.style.left = '0';
      this.popup.style.transform = 'none';
      this.popup.style.position = 'fixed';

      this.fullscreenBtn.innerHTML = '⧉';
      this.fullscreenBtn.title = 'Exit fullscreen';
    } else {
      Object.assign(this.popup.style, this.originalStyles);

      this.fullscreenBtn.innerHTML = '⛶';
      this.fullscreenBtn.title = 'Fullscreen';
    }
  }

  setPosition() {
    if (!this.isFullscreen) {
      if (this.options.position === 'center') {
        this.popup.style.top = '50%';
        this.popup.style.left = '50%';
        this.popup.style.transform = 'translate(-50%, -50%)';
      } else {
        this.popup.style.top = `${this.options.position.y}px`;
        this.popup.style.left = `${this.options.position.x}px`;
        this.popup.style.transform = 'none';
      }
    }
  }

  setupCloseHandlers() {
    this.closeBtn.addEventListener('click', () => this.close());

    if (this.options.closeOnClickOutside) {
      this.overlay.addEventListener('click', () => this.close());
    }
  }

  show() {
    this.popup.style.display = 'block';
    this.overlay.style.display = 'block';
  }

  close() {
    if (this.options.onClose) {
      this.options.onClose();
    }
    this.popup.remove();
    this.overlay.remove();
    // this.cache.popup = null;
  }
}

export {Popup}