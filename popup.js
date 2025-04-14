document.addEventListener("DOMContentLoaded", () => {
  // DOM elements - Main
  const shortcutsList = document.getElementById("shortcuts-list")
  const addShortcutBtn = document.getElementById("add-shortcut")
  const settingsBtn = document.getElementById("settings-btn")
  const searchInput = document.getElementById("search")

  // DOM elements - Shortcut Form
  const shortcutForm = document.getElementById("shortcut-form")
  const formTitle = document.getElementById("form-title")
  const triggerInput = document.getElementById("trigger")
  const contentInput = document.getElementById("content")
  const saveFormBtn = document.getElementById("save-form")
  const cancelFormBtn = document.getElementById("cancel-form")
  const closeFormBtn = document.getElementById("close-form")

  // DOM elements - Settings
  const settingsPanel = document.getElementById("settings-panel")
  const closeSettingsBtn = document.getElementById("close-settings")
  const saveSettingsBtn = document.getElementById("save-settings")
  const enableExtension = document.getElementById("enable-extension")
  const themeSelect = document.getElementById("theme-select")
  const scopeSelect = document.getElementById("scope-select")
  const siteListContainer = document.getElementById("site-list-container")
  const siteInput = document.getElementById("site-input")
  const addSiteBtn = document.getElementById("add-site-btn")
  const siteList = document.getElementById("site-list")
  const tabButtons = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")

  // DOM elements - Import/Export
  const importExportPanel = document.getElementById("import-export-panel")
  const importExportTitle = document.getElementById("import-export-title")
  const importExportData = document.getElementById("import-export-data")
  const confirmImportExportBtn = document.getElementById("confirm-import-export")
  const cancelImportExportBtn = document.getElementById("cancel-import-export")
  const closeImportExportBtn = document.getElementById("close-import-export")
  const exportBtn = document.getElementById("export-btn")
  const importBtn = document.getElementById("import-btn")

  // State
  let shortcuts = {}
  let settings = {
    enabled: true,
    theme: "system",
    scope: "all",
    whitelist: [],
    blacklist: [],
  }
  let editingTrigger = null
  let currentSiteList = []

  // Initialize
  loadShortcuts()
  loadSettings()
  applyTheme()

  // Event listeners - Main
  addShortcutBtn.addEventListener("click", () => showAddForm())
  settingsBtn.addEventListener("click", () => showSettings())
  searchInput.addEventListener("input", filterShortcuts)

  // Event listeners - Shortcut Form
  saveFormBtn.addEventListener("click", saveShortcut)
  cancelFormBtn.addEventListener("click", hideForm)
  closeFormBtn.addEventListener("click", hideForm)

  // Event listeners - Settings
  closeSettingsBtn.addEventListener("click", hideSettings)
  saveSettingsBtn.addEventListener("click", saveSettings)
  scopeSelect.addEventListener("change", updateSiteListVisibility)
  addSiteBtn.addEventListener("click", addSite)

  // Event listeners - Tabs
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove("active"))

      // Add active class to clicked button
      button.classList.add("active")

      // Show corresponding content
      const tabId = button.getAttribute("data-tab")
      tabContents.forEach((content) => {
        content.classList.remove("active")
        if (content.id === `${tabId}-tab`) {
          content.classList.add("active")
        }
      })
    })
  })

  // Event listeners - Import/Export
  exportBtn.addEventListener("click", () => showExport())
  importBtn.addEventListener("click", () => showImport())
  confirmImportExportBtn.addEventListener("click", confirmImportExport)
  cancelImportExportBtn.addEventListener("click", hideImportExport)
  closeImportExportBtn.addEventListener("click", hideImportExport)

  // Functions - Data
  function loadShortcuts() {
    if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.sendMessage({ action: "getShortcuts" }, (response) => {
        shortcuts = response.shortcuts || {}
        renderShortcuts()
      })
    } else {
      console.warn("Chrome runtime is not available.")
    }
  }

  function loadSettings() {
    if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.sendMessage({ action: "getSettings" }, (response) => {
        settings = { ...settings, ...response.settings }

        // Update UI with settings
        enableExtension.checked = settings.enabled
        themeSelect.value = settings.theme
        scopeSelect.value = settings.scope

        // Update site list
        if (settings.scope === "whitelist") {
          currentSiteList = settings.whitelist || []
        } else if (settings.scope === "blacklist") {
          currentSiteList = settings.blacklist || []
        }

        updateSiteListVisibility()
        renderSiteList()
      })
    } else {
      console.warn("Chrome runtime is not available.")
    }
  }

  function saveSettings() {
    // Update settings object
    settings.enabled = enableExtension.checked
    settings.theme = themeSelect.value
    settings.scope = scopeSelect.value

    // Update whitelist or blacklist based on scope
    if (settings.scope === "whitelist") {
      settings.whitelist = currentSiteList
    } else if (settings.scope === "blacklist") {
      settings.blacklist = currentSiteList
    }

    // Save to storage
    if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.sendMessage(
        {
          action: "saveSettings",
          settings: settings,
        },
        () => {
          applyTheme()
          hideSettings()
        },
      )
    } else {
      console.warn("Chrome runtime is not available.")
    }
  }

  // Functions - UI
  function renderShortcuts(filter = "") {
    shortcutsList.innerHTML = ""

    const filteredTriggers = Object.keys(shortcuts).filter((trigger) => {
      return (
        trigger.toLowerCase().includes(filter.toLowerCase()) ||
        shortcuts[trigger].toLowerCase().includes(filter.toLowerCase())
      )
    })

    if (filteredTriggers.length === 0) {
      shortcutsList.innerHTML = `
        <div class="empty-state">
          ${filter ? "No shortcuts match your search." : "No shortcuts yet. Click + to add one."}
        </div>
      `
      return
    }

    filteredTriggers.forEach((trigger) => {
      const shortcutItem = document.createElement("div")
      shortcutItem.className = "shortcut-item"

      const content = shortcuts[trigger]
      const displayContent = content.length > 50 ? content.substring(0, 50) + "..." : content

      shortcutItem.innerHTML = `
        <div class="shortcut-trigger">${trigger}</div>
        <div class="shortcut-content">${displayContent}</div>
        <div class="shortcut-actions">
          <button class="edit-btn small-btn">Edit</button>
          <button class="delete-btn small-btn">Delete</button>
        </div>
      `

      shortcutsList.appendChild(shortcutItem)

      // Add event listeners to buttons
      shortcutItem.querySelector(".edit-btn").addEventListener("click", (e) => {
        e.stopPropagation()
        showEditForm(trigger)
      })

      shortcutItem.querySelector(".delete-btn").addEventListener("click", (e) => {
        e.stopPropagation()
        deleteShortcut(trigger)
      })
    })
  }

  function renderSiteList() {
    siteList.innerHTML = ""

    if (currentSiteList.length === 0) {
      siteList.innerHTML = `
        <div class="empty-state">
          No sites added. Add a domain above.
        </div>
      `
      return
    }

    currentSiteList.forEach((site, index) => {
      const siteItem = document.createElement("div")
      siteItem.className = "site-item"

      siteItem.innerHTML = `
        <div class="site-name">${site}</div>
        <button class="remove-site small-btn" data-index="${index}">Remove</button>
      `

      siteList.appendChild(siteItem)

      // Add event listener to remove button
      siteItem.querySelector(".remove-site").addEventListener("click", (e) => {
        const index = Number.parseInt(e.target.getAttribute("data-index"))
        removeSite(index)
      })
    })
  }

  function updateSiteListVisibility() {
    if (scopeSelect.value === "whitelist" || scopeSelect.value === "blacklist") {
      siteListContainer.classList.remove("hidden")

      // Update current site list based on scope
      if (scopeSelect.value === "whitelist") {
        currentSiteList = settings.whitelist || []
      } else {
        currentSiteList = settings.blacklist || []
      }

      renderSiteList()
    } else {
      siteListContainer.classList.add("hidden")
    }
  }

  function applyTheme() {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (settings.theme === "dark" || (settings.theme === "system" && prefersDark)) {
      document.body.classList.add("dark-theme")
    } else {
      document.body.classList.remove("dark-theme")
    }
  }

  // Functions - Shortcuts
  function showAddForm() {
    formTitle.textContent = "Add Shortcut"
    triggerInput.value = ""
    contentInput.value = ""
    editingTrigger = null
    shortcutForm.classList.remove("hidden")
  }

  function showEditForm(trigger) {
    formTitle.textContent = "Edit Shortcut"
    triggerInput.value = trigger
    contentInput.value = shortcuts[trigger]
    editingTrigger = trigger
    shortcutForm.classList.remove("hidden")
  }

  function hideForm() {
    shortcutForm.classList.add("hidden")
  }

  function saveShortcut() {
    const trigger = triggerInput.value.trim()
    const content = contentInput.value

    if (!trigger) {
      alert("Trigger cannot be empty")
      return
    }

    // If editing, remove old trigger
    if (editingTrigger && editingTrigger !== trigger) {
      delete shortcuts[editingTrigger]
    }

    // Add or update shortcut
    shortcuts[trigger] = content

    // Save to storage
    if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.sendMessage(
        {
          action: "saveShortcuts",
          shortcuts: shortcuts,
        },
        () => {
          hideForm()
          renderShortcuts(searchInput.value)
        },
      )
    } else {
      console.warn("Chrome runtime is not available.")
    }
  }

  function deleteShortcut(trigger) {
    if (confirm(`Delete shortcut "${trigger}"?`)) {
      delete shortcuts[trigger]

      // Save to storage
      if (typeof chrome !== "undefined" && chrome.runtime) {
        chrome.runtime.sendMessage(
          {
            action: "saveShortcuts",
            shortcuts: shortcuts,
          },
          () => {
            renderShortcuts(searchInput.value)
          },
        )
      } else {
        console.warn("Chrome runtime is not available.")
      }
    }
  }

  function filterShortcuts() {
    renderShortcuts(searchInput.value)
  }

  // Functions - Settings
  function showSettings() {
    settingsPanel.classList.remove("hidden")
  }

  function hideSettings() {
    settingsPanel.classList.add("hidden")
  }

  function addSite() {
    const site = siteInput.value.trim()

    if (!site) {
      alert("Please enter a domain")
      return
    }

    // Add site to current list if not already present
    if (!currentSiteList.includes(site)) {
      currentSiteList.push(site)
      renderSiteList()
      siteInput.value = ""
    } else {
      alert("This domain is already in the list")
    }
  }

  function removeSite(index) {
    currentSiteList.splice(index, 1)
    renderSiteList()
  }

  // Functions - Import/Export
  function showExport() {
    importExportTitle.textContent = "Export Shortcuts"
    importExportData.value = JSON.stringify(shortcuts, null, 2)
    confirmImportExportBtn.textContent = "Copy to Clipboard"
    importExportPanel.classList.remove("hidden")
  }

  function showImport() {
    importExportTitle.textContent = "Import Shortcuts"
    importExportData.value = ""
    importExportData.placeholder = "Paste your shortcuts JSON here..."
    confirmImportExportBtn.textContent = "Import"
    importExportPanel.classList.remove("hidden")
  }

  function hideImportExport() {
    importExportPanel.classList.add("hidden")
  }

  function confirmImportExport() {
    if (importExportTitle.textContent === "Export Shortcuts") {
      // Copy to clipboard
      importExportData.select()
      document.execCommand("copy")
      alert("Shortcuts copied to clipboard!")
      hideImportExport()
    } else {
      // Import
      try {
        const importedData = JSON.parse(importExportData.value)

        if (typeof importedData !== "object") {
          throw new Error("Invalid format")
        }

        // Confirm before overwriting
        if (Object.keys(shortcuts).length > 0) {
          if (!confirm("This will overwrite your existing shortcuts. Continue?")) {
            return
          }
        }

        shortcuts = importedData

        // Save to storage
        if (typeof chrome !== "undefined" && chrome.runtime) {
          chrome.runtime.sendMessage(
            {
              action: "saveShortcuts",
              shortcuts: shortcuts,
            },
            () => {
              hideImportExport()
              renderShortcuts()
              alert("Shortcuts imported successfully!")
            },
          )
        } else {
          console.warn("Chrome runtime is not available.")
        }
      } catch (error) {
        alert("Invalid JSON format. Please check your data.")
      }
    }
  }

  // Listen for theme changes
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (settings.theme === "system") {
      applyTheme()
    }
  })
})
