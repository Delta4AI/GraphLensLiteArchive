# Graph Lens Lite

Visualise and navigate **property graphs** through a sleek, ultra-lightweight interface.  
Works in any modern browser, with native Electron desktops for Windows and Linux.

---

## Quickstart
1. Download the [latest release](https://github.com/Delta4AI/GraphLensLite/releases/latest) for your OS
2. (Optional) Download a [template](templates/GLL_template.xlsx) and populate with your own data
3. Launch Graph Lens Lite and start exploring by either loading a demo network or a file

---

## Screenshots
TBC

---

## Development
### Debug JavaScript
1. Run http server
    ```bash
    cd /path/to/graph_lens_lite
    npm run serve
    ```
2. Open browser, go to [http://localhost:8080/graph_lens_lite.html](http://localhost:8080/graph_lens_lite.html)
3. (Optional) Create compound run configuration with JavaScript debugger in WebStorm
   1. Create JavaScript debug configuration: 
       - URL: `http://localhost:8000/graph_lens_lite.html`
       - Browser: Chromium
   2. Create `npm run serve` npm configuration
   3. Add `Compound` configuration, add `npm run serve` and `JavaScript Debug` as children
   4. Debug the compound configuration to start everything at once
   5. Set Breakpoints and debug
      
### Common npm goals
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
2. The Query Editor cursor tends to change position on multiline queries

---

## Reference
TBC