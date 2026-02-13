import {Popup} from "./popup.js"

function generateTourData() {
  const categories = ["Protein", "Enzyme", "Receptor", "Transporter", "Kinase"]
  const compartments = ["Nucleus", "Cytoplasm", "Membrane", "Mitochondria", "ER"]
  const pathways = ["MAPK signaling", "Apoptosis", "Cell cycle", "Metabolism", "Immune response"]

  const nodes = [
    {id: "n1", label: "TP53", description: "Tumor suppressor protein p53"},
    {id: "n2", label: "MDM2", description: "E3 ubiquitin-protein ligase"},
    {id: "n3", label: "BRCA1", description: "Breast cancer type 1 susceptibility"},
    {id: "n4", label: "AKT1", description: "Serine/threonine-protein kinase"},
    {id: "n5", label: "EGFR", description: "Epidermal growth factor receptor"},
    {id: "n6", label: "KRAS", description: "GTPase KRas"},
    {id: "n7", label: "BRAF", description: "Serine/threonine-protein kinase B-Raf"},
    {id: "n8", label: "PIK3CA", description: "PI3-kinase catalytic subunit alpha"},
    {id: "n9", label: "PTEN", description: "Phosphatase and tensin homolog"},
    {id: "n10", label: "RB1", description: "Retinoblastoma-associated protein"},
    {id: "n11", label: "MYC", description: "Myc proto-oncogene protein"},
    {id: "n12", label: "CDK2", description: "Cyclin-dependent kinase 2"},
    {id: "n13", label: "MAPK1", description: "Mitogen-activated protein kinase 1"},
    {id: "n14", label: "JAK2", description: "Tyrosine-protein kinase JAK2"},
    {id: "n15", label: "STAT3", description: "Signal transducer and activator of transcription 3"},
    {id: "n16", label: "BCL2", description: "Apoptosis regulator Bcl-2"},
    {id: "n17", label: "CASP3", description: "Caspase-3"},
    {id: "n18", label: "TNF", description: "Tumor necrosis factor"},
    {id: "n19", label: "VEGFA", description: "Vascular endothelial growth factor A"},
    {id: "n20", label: "ERBB2", description: "Receptor tyrosine-protein kinase erbB-2"},
    {id: "n21", label: "SRC", description: "Proto-oncogene tyrosine-protein kinase Src"},
    {id: "n22", label: "MTOR", description: "Serine/threonine-protein kinase mTOR"},
    // Disconnected nodes
    {id: "n23", label: "INS", description: "Insulin (isolated node)"},
    {id: "n24", label: "ALB", description: "Albumin (isolated node)"},
    {id: "n25", label: "HBB", description: "Hemoglobin subunit beta (isolated node)"},
  ]

  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]
  const randNum = (min, max) => +(min + Math.random() * (max - min)).toFixed(2)

  nodes.forEach(n => {
    n.style = {labelText: n.label}
    n.D4Data = {
      "Node filters": {
        "Classification": {
          "Type": rand(categories),
          "Compartment": rand(compartments),
        },
        "Annotation": {
          "Pathway": rand(pathways),
          "Expression Level": randNum(0, 100),
          "Confidence": randNum(0, 1),
        }
      }
    }
  })

  const edgeDefs = [
    ["n1", "n2"], ["n1", "n3"], ["n1", "n10"], ["n1", "n11"], ["n1", "n16"],
    ["n2", "n1"], ["n3", "n4"], ["n4", "n8"], ["n4", "n22"],
    ["n5", "n6"], ["n5", "n20"], ["n6", "n7"], ["n6", "n13"],
    ["n7", "n13"], ["n8", "n9"], ["n8", "n22"],
    ["n10", "n12"], ["n11", "n12"], ["n13", "n14"],
    ["n14", "n15"], ["n15", "n11"], ["n16", "n17"],
    ["n17", "n18"], ["n18", "n15"], ["n19", "n5"],
    ["n20", "n21"], ["n21", "n4"],
  ]

  const interactionTypes = ["activation", "inhibition", "binding", "phosphorylation", "expression"]

  const edges = edgeDefs.map(([s, t], i) => ({
    id: `e${i}`,
    source: s,
    target: t,
    style: {lineWidth: randNum(0.5, 3)},
    D4Data: {
      "Edge filters": {
        "Interaction": {
          "Type": rand(interactionTypes),
          "Score": randNum(0.1, 1),
        }
      }
    }
  }))

  return {
    nodes,
    edges,
    nodeDataHeaders: [
      {subGroup: "Classification", key: "Type"},
      {subGroup: "Classification", key: "Compartment"},
      {subGroup: "Annotation", key: "Pathway"},
      {subGroup: "Annotation", key: "Expression Level"},
      {subGroup: "Annotation", key: "Confidence"},
    ],
    edgeDataHeaders: [
      {subGroup: "Interaction", key: "Type"},
      {subGroup: "Interaction", key: "Score"},
    ]
  }
}


const TOUR_STEPS = [
  {
    title: "Welcome to Graph Lens Lite! 👋",
    text: `This tour will walk you through the main features of the application.
           We've loaded a small sample network of 25 protein nodes and their interactions.
           <br><br>
           <strong>3 nodes are disconnected</strong> — they have no edges. This is intentional, so you can see how filtering works.
           <br><br>
           Let's explore the interface!`,
    target: null,
  },
  {
    title: "App Header — Quick Actions",
    text: `The header bar contains quick-access buttons:
           <br><br>
           📊 <strong>Metrics</strong> — compute network metrics (degree, betweenness, PageRank, etc.)
           <br>🔢 <strong>Data Editor</strong> — view and edit your graph data in a spreadsheet
           <br>📝 <strong>Query Editor</strong> — write filter/selection queries using our query language
           <br>📷 <strong>Save Image</strong> — export the current view as PNG
           <br>💾 <strong>Save Model</strong> — export the full graph (data + styles + layouts) as JSON
           <br><br>
           <em>Clicking the app name reloads the application.</em>`,
    target: ".header-row",
    position: "below",
  },
  {
    title: "Workspaces",
    text: `Workspaces let you save <strong>independent views</strong> of the same data.
           Each workspace preserves its own:
           <br><br>
           • Node positions and layout
           <br>• Filter settings
           <br>• Query state
           <br>• Bubble groups
           <br>• Visual styles applied per workspace
           <br><br>
           Use the <strong class="tour-green">✚</strong> button to create a new workspace (clone or template-based), and the <strong class="tour-red">✗</strong> button to delete the current one.
           <br><br>
           The <strong>⛶</strong> button fits the graph to the screen, and <strong>🚫</strong> hides disconnected nodes.`,
    target: "#selectView",
    position: "below",
  },
  {
    title: "Filtering Panel",
    text: `This is the core of the app. Every property from your data becomes a <strong>filter</strong>.
           <br><br>
           • <strong>Numeric properties</strong> get range sliders — drag to set thresholds
           <br>• <strong>Categorical properties</strong> get dropdown checklists — check/uncheck values
           <br><br>
           The <strong>checkbox</strong> next to each filter toggles whether that property is active.
           Only nodes/edges matching <em>all active filters</em> are shown (AND logic by default).
           <br><br>
           The ⚙️ <strong>Edit Mode</strong> button reveals advanced filter controls including
           bubble set group assignment and query builder buttons.`,
    target: "#filterContainer",
    position: "right",
  },
  {
    title: "Query Editor — Filter & Select by Code",
    text: `The query editor uses a <strong>custom DSL</strong> (domain-specific language) for filtering.
           <br><br>
           Syntax examples:
           <br><code>property BETWEEN 0.5 AND 1.0</code>
           <br><code>property IN (value1, value2)</code>
           <br><code>property LOWER THAN 50</code>
           <br><code>expr1 AND expr2</code>
           <br><code>expr1 OR expr2</code>
           <br><code>NOT expr</code>
           <br><br>
           The query <strong>syncs with the filter panel</strong> — changing filters updates the query text, and vice versa.
           When you manually edit the query, filters get <strong>locked</strong> (🔒) to prevent conflicts.
           <br><br>
           Use <strong>🔍 Filter</strong> to filter the graph, or <strong>🎯 Select</strong> to select matching nodes without hiding others.`,
    target: null,
    action: "openQueryEditor",
  },
  {
    title: "Data Editor — Edit Your Graph",
    text: `The data editor is a <strong>spreadsheet view</strong> of all nodes and edges.
           <br><br>
           You can:
           <br>• Edit property values directly in cells
           <br>• Add new nodes, edges, or property columns
           <br>• Export the data as Excel
           <br><br>
           Click <strong>✔ Apply</strong> to push changes to the graph, or <strong>⟳ Reset</strong> to revert.`,
    target: null,
    action: "openDataEditor",
  },
  {
    title: "Selection Panel",
    text: `The selection panel sits above the graph canvas. It shows how many nodes and edges are currently selected.
           <br><br>
           • Use <strong>click</strong> to select individual elements (hold Shift for multi-select)
           <br>• Toggle the <strong>lasso tool</strong> to draw a selection area
           <br>• <strong>↩/↪</strong> undo/redo selections (up to 25 states)
           <br>• <strong>⟳</strong> resets styles for selected elements
           <br><br>
           Expand the panel with <strong>▾</strong> to see focus, selection-by-ID, and arrangement tools.`,
    target: "#selectedElementsContainer",
    position: "below",
  },
  {
    title: "Styling Panel 🎨",
    text: `The styling panel (right sidebar) lets you customize the visual appearance of your graph.
           <br><br>
           • <strong>Global styles</strong> — change defaults for all nodes/edges
           <br>• <strong>Selection styles</strong> — style only the selected elements
           <br>• <strong>Color scales</strong> — map numeric properties to color gradients
           <br>• <strong>Size scales</strong> — map numeric properties to node sizes
           <br><br>
           Styles are <strong>per-workspace</strong>, so you can have different visual configurations in each workspace.`,
    target: null,
    action: "openStylingPanel",
  },
  {
    title: "You're all set! 🎉",
    text: `That covers the main features. Here are some <strong>keyboard shortcuts</strong> to remember:
           <br><br>
           <strong>F</strong> — Fit graph to screen
           <br><strong>L</strong> — Toggle lasso selection
           <br><strong>Q</strong> — Toggle query editor
           <br><strong>D</strong> — Toggle data editor
           <br><strong>M</strong> — Toggle metrics panel
           <br><strong>Y</strong> — Toggle styling panel
           <br><strong>E</strong> — Toggle edit mode
           <br><strong>P</strong> — Export as PNG
           <br><strong>S</strong> — Save as JSON
           <br><br>
           Try loading your own data from an <strong>Excel file</strong> or <strong>JSON export</strong>, or fetch protein networks from the <strong>STRING database</strong>.
           <br><br>
           <em>Enjoy exploring your graphs!</em>`,
    target: null,
  },
]


class GuidedTour {
  constructor(cache) {
    this.cache = cache
    this.currentStep = 0
    this.highlightEl = null
    this.popup = null
    this.overlay = null
  }

  async start() {
    this.currentStep = 0
    await this.showStep()
  }

  async showStep() {
    this.cleanup()

    if (this.currentStep >= TOUR_STEPS.length) {
      this.finish()
      return
    }

    const step = TOUR_STEPS[this.currentStep]

    // execute pre-step action
    if (step.action) {
      await this.executeAction(step.action)
    }

    // create highlight if target exists
    if (step.target) {
      this.highlight(step.target, step.position || "below")
    }

    const content = document.createElement("div")
    content.className = "tour-popup-content"

    const stepIndicator = document.createElement("div")
    stepIndicator.className = "tour-step-indicator"
    stepIndicator.textContent = `Step ${this.currentStep + 1} of ${TOUR_STEPS.length}`
    content.appendChild(stepIndicator)

    const title = document.createElement("h3")
    title.className = "tour-title"
    title.textContent = step.title
    content.appendChild(title)

    const text = document.createElement("div")
    text.className = "tour-text"
    text.innerHTML = step.text
    content.appendChild(text)

    const buttons = document.createElement("div")
    buttons.className = "tour-buttons"

    if (this.currentStep > 0) {
      const prevBtn = document.createElement("button")
      prevBtn.className = "p-button tour-btn-prev"
      prevBtn.textContent = "← Back"
      prevBtn.addEventListener("click", () => {
        this.currentStep--
        this.showStep()
      })
      buttons.appendChild(prevBtn)
    }

    const isLast = this.currentStep === TOUR_STEPS.length - 1

    const nextBtn = document.createElement("button")
    nextBtn.className = "p-button tour-btn-next"
    nextBtn.textContent = isLast ? "Finish ✓" : "Next →"
    nextBtn.addEventListener("click", () => {
      this.currentStep++
      this.showStep()
    })
    buttons.appendChild(nextBtn)

    const skipBtn = document.createElement("button")
    skipBtn.className = "tour-btn-skip"
    skipBtn.textContent = "Skip tour"
    skipBtn.addEventListener("click", () => {
      this.cleanup()
      this.finish()
    })
    if (!isLast) buttons.appendChild(skipBtn)

    content.appendChild(buttons)

    // compute position near highlighted element
    let popupOpts = {
      width: "460px",
      showFullscreenButton: false,
      closeOnClickOutside: false,
      onClose: () => {
        this.cleanup()
        this.finish()
      }
    }

    if (step.target && this.highlightEl) {
      const rect = document.querySelector(step.target)?.getBoundingClientRect()
      if (rect) {
        const pos = this.computePopupPosition(rect, step.position || "below")
        popupOpts.position = pos
      }
    }

    this.popup = new Popup(content, popupOpts)
  }

  computePopupPosition(targetRect, position) {
    const popupWidth = 460
    const margin = 16
    const vw = window.innerWidth
    const vh = window.innerHeight

    let x, y

    if (position === "below") {
      x = targetRect.left
      y = targetRect.bottom + margin
    } else if (position === "right") {
      x = targetRect.right + margin
      y = targetRect.top
    } else if (position === "above") {
      x = targetRect.left
      y = targetRect.top - margin - 300
    }

    // clamp to viewport
    x = Math.max(margin, Math.min(x, vw - popupWidth - margin))
    y = Math.max(margin, Math.min(y, vh - 200))

    return {x, y}
  }

  highlight(selector, position) {
    const el = document.querySelector(selector)
    if (!el) return

    const rect = el.getBoundingClientRect()
    const padding = 6

    this.highlightEl = document.createElement("div")
    this.highlightEl.className = "tour-highlight"
    this.highlightEl.style.top = `${rect.top - padding}px`
    this.highlightEl.style.left = `${rect.left - padding}px`
    this.highlightEl.style.width = `${rect.width + padding * 2}px`
    this.highlightEl.style.height = `${rect.height + padding * 2}px`
    document.body.appendChild(this.highlightEl)
  }

  async executeAction(action) {
    switch (action) {
      case "openQueryEditor": {
        const queryBtn = document.getElementById("queryToggleBtn")
        if (queryBtn && !queryBtn.classList.contains("highlight")) {
          this.cache.ui.toggleQueryEditor()
        }
        await this.sleep(350)
        break
      }
      case "openDataEditor": {
        // close query editor first if open
        const queryBtn = document.getElementById("queryToggleBtn")
        if (queryBtn && queryBtn.classList.contains("highlight")) {
          this.cache.ui.toggleQueryEditor()
          await this.sleep(350)
        }
        const dataBtn = document.getElementById("dataToggleBtn")
        if (dataBtn && !dataBtn.classList.contains("highlight")) {
          await this.cache.ui.toggleDataEditor()
        }
        await this.sleep(350)
        break
      }
      case "openStylingPanel": {
        // close data editor first if open
        const dataBtn = document.getElementById("dataToggleBtn")
        if (dataBtn && dataBtn.classList.contains("highlight")) {
          await this.cache.ui.toggleDataEditor()
          await this.sleep(350)
        }
        const styleBtn = document.getElementById("styleToggleBtn")
        const rightSidebar = document.getElementById("rightSidebar")
        if (rightSidebar && !rightSidebar.classList.contains("active")) {
          this.cache.ui.toggleStylingPanel()
        }
        await this.sleep(350)
        break
      }
    }
  }

  sleep(ms) {
    return new Promise(r => setTimeout(r, ms))
  }

  cleanup() {
    if (this.highlightEl) {
      this.highlightEl.remove()
      this.highlightEl = null
    }
    if (this.popup) {
      const p = this.popup
      this.popup = null
      p.close()
    }
  }

  finish() {
    this.cleanup()

    // close any open panels
    const dataBtn = document.getElementById("dataToggleBtn")
    if (dataBtn && dataBtn.classList.contains("highlight")) {
      this.cache.ui.toggleDataEditor()
    }
    const queryBtn = document.getElementById("queryToggleBtn")
    if (queryBtn && queryBtn.classList.contains("highlight")) {
      this.cache.ui.toggleQueryEditor()
    }
    const rightSidebar = document.getElementById("rightSidebar")
    if (rightSidebar && rightSidebar.classList.contains("active")) {
      this.cache.ui.toggleStylingPanel()
    }
  }
}

export {generateTourData, GuidedTour}
