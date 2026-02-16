![Graph Lens Lite Logo](./static/logo.png)
<h3 align="center">
   Visualise and navigate property graphs through a sleek, ultra-lightweight interface.  
   Works in any modern browser, with native Electron desktops for Windows and Linux.
</h3>


---

## Quickstart
1. Download the [latest release](https://github.com/Delta4AI/GraphLensLite/releases/latest).
   - **Windows**: `Graph.Lens.Lite.X.Y.Z.exe` (portable) or `Graph.Lens.Lite.Setup.X.Y.Z.exe` (installer)
   - **macOS**: `Graph.Lens.Lite-X.Y.Z-<arch>-mac.zip` or `Graph.Lens.Lite-X.Y.Z-<arch>.dmg`
   - **Linux**: `Graph.Lens.Lite-X.Y.Z.AppImage`, `graph-lens-lite_X.Y.Z_<arch>.deb`, or `graph-lens-lite_X.Y.Z_<arch>.snap`
   - **Web (no install)**: `graph-lens-lite_inline_X.Y.Z.html`
   - **From source**: clone the repo and run `npm install` then `npm run serve`
2. (Optional) Download a [template](templates/simple-template.xlsx) and add your data
3. Launch Graph Lens Lite and load a demo or your file
---

## Screenshots

![Launch screen with options to open a file, download a template, explore a STRING database demo, or take a guided tour](./static/screenshots/launch_screen.png)

### Graph canvas with filters and node details
![Graph canvas showing protein interaction network with property filter sidebar, node details popup for USP7 displaying centrality metrics and ontology annotations, and minimap](./static/screenshots/main_view_with_popup.png)

### Query editor
![Query editor with boolean DSL combining IN, BETWEEN, AND, and OR operators to filter nodes and edges by subcellular localization, biological process, combined score, and database score](./static/screenshots/query_editor.png)

### Selection tools and bubble set groupings
![Grid layout with three selected nodes, selection panel offering focus, expand, and arrange tools, and two labeled bubble set groups overlaid on the canvas](./static/screenshots/selection_panel_and_active_clusters.png)

### Network metrics and data editor
![Left panel showing degree centrality rankings and graph-level metrics, bottom panel showing an editable spreadsheet view of all node properties](./static/screenshots/network_metrics_and_data_editor.png)

### Styling panel
![Styling panel with per-element node and edge configuration for shape, size, color, labels, halos, badges, arrows, and bubble set appearance, applied to a graph with mixed node shapes](./static/screenshots/rich_styling.png)

### Workspace management
![Create New Workspace dialog with options to clone current workspace or create from a layout template](./static/screenshots/workspace_management.png)

### Property-based color mapping
<p>
  <img src="./static/screenshots/property_based_categorical_color_mapping.png" alt="Categorical color mapping dialog assigning distinct colors to Reactome pathway categories" width="49%">
  <img src="./static/screenshots/property_based_numerical_color_mapping.png" alt="Numerical color mapping dialog with a continuous gradient from dark to red for closeness centrality scores" width="46.75%">
</p>

---
## Development
```bash
npm install              # install dependencies
npm run bundle:serve     # dev server with watch + sourcemaps
npm run serve            # static http-server on :8000
npm start                # electron app
npm run dist-linux       # Linux build
npm run dist-windows     # Windows build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full list of npm scripts, version management, code style, and commit guidelines.

---

## Contributing
Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before filing issues or submitting pull requests.

---

## License
MIT - see [LICENSE](LICENSE) for details.

---

## Third‑Party Licenses
This project includes third‑party software. See [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES) for details.

---

## Disclaimer
- Uses the [String](https://string-db.org/) database for Demo purposes ([citation](https://doi.org/10.1093/nar/gkac1000))
- No guarantees on the accuracy of the results

---

## Known issues

1. Deselection by clicking on empty spaces in the canvas take a long time on large graphs (see [GitHub issue](https://github.com/antvis/G6/issues/7195))
2. The Query Editor cursor tends to change position on multiline queries

---

## Reference
TBD
