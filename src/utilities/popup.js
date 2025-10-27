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