# Changelog

## 1.11.0

### Features

* Added full-page landing screen with hero layout, network background, and action cards
* Added guided tour with sample dataset and step-by-step UI walkthrough, including highlight clipping, metrics step, and panel transitions
* Redesigned popup with scrollable body, maximize/restore toggle, and smooth CSS transitions
* Redesigned tooltip header with pill badge, clean title hierarchy, and fixed positioning
* Added close button to tooltips and auto-hide expand when content fits
* Made tooltips scrollable, draggable by header, and expandable with toggle button
* Made sidebar resizable and improved filter row layout
* Added panel headers with integrated action buttons and improved layout
* Added in-app version display with automatic injection from `package.json`
* Increased default bottom bar height and persist resized height across sessions
* Added Delta4 icon to header and made header compact when data loaded
* Added screenshot tool with portrait mode, scale 1x–10x, and browser size options
* Hide file input after load and make header clickable to reload app

### Fixes

* Fixed filter sliders snapping to integers for properties with float values between integer min/max
* Fixed tooltip jump and disappear when dragging
* Fixed popup footer cutoff on short screens
* Fixed tour overlay z-index above selected elements container
* Fixed selection panel button alignment and use opaque background
* Fixed cross-browser checkbox alignment in Safari and deduplicated CSS
* Fixed `fitView` respecting hidden disconnected nodes with G6 `translateTo` bug workaround
* Fixed query editor cursor jumping, bracket processing, caret flicker, and overlay alignment
* Persisted hide-disconnected-nodes state per workspace across JSON save/load
* Fixed selection visual feedback using `setElementState` with halo styles and preserved visibility during style updates
* Fixed lasso wrapper staying visually active after data editor updates
* Persisted node positions in Excel export from data editor
* Persisted data editor warning dismissal via `localStorage`
* Fixed inline Delta4 icon in standalone HTML bundle
* Added right margin to filter lock status bar to avoid overlapping edit button

### UI

* Redesigned color scale and numeric scale picker popups to use the app's `Popup` system with consistent header, footer, buttons, and overlay styling
* Reordered header buttons to place export functions at the end
* Moved edit button to filter container and positioned it in top-right corner
