# Graph Lens Lite

Visualise and navigate **property graphs** through a sleek, ultra-lightweight interface.  
Works in any modern browser, with native Electron desktops for Windows and Linux.

---

## Quickstart
1. Download a [template](templates/GLL_template.xlsx)
2. Download the [latest release](https://github.com/Delta4AI/GraphLensLite/releases/latest) for your OS
3. (Optional) Put your own data into the template
4. Launch Graph Lens Lite and load the file

---

## Screenshots
TBD

---

## Development
### Debug JavaScript
1. Run http server
    ```bash
    cd /path/to/graph_lens_lite
    npm run serve
    ```
2. Open browser, go to [http://localhost:8080/graph_lens_lite.html](http://localhost:8080/graph_lens_lite.html)
3. Run WebStorm JavaScript debugger
    - URL: `http://localhost:8000/graph_lens_lite.html`
    - Browser: Chromium
4. Set Breakpoints and debug
5. **Alternatively**, create compound run configuration in WebStorm:
   1. Add `npm run serve` npm configuration
   2. Add `JavaScript Debug` (with URL and Browser from step 3)
   3. Add `Compound` configuratoin, add `npm run serve` and `JavaScript Debug` as children
   4. Debug the compound configuration to start everything at once#

### Run electron app
```bash
# Install prerequisites (fedora)
sudo dnf install libxcrypt-compat wine

# Run the electron app
npm start

# Create a GLL_vXXX.zip archive
npm run create-gll-zip

# Build the electron app
npm run dist

## Update electron dependencies
npm install --save-dev electron@latest electron-builder@latest
```

---

## Known issues

1. Deselection by clicking on empty spaces in the canvas take a long time on large graphs (see [GitHub issue](https://github.com/antvis/G6/issues/7195))