// Initialize default shortcuts and settings if none exist
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["shortcuts", "settings"], (data) => {
    // Default shortcuts
    if (!data.shortcuts) {
      const defaultShortcuts = {
        "/mail": "example@gmail.com",
        "/name": "John Doe",
        "/phone": "(123) 456-7890",
        "/addr": "123 Main St, Anytown, USA",
      }

      chrome.storage.local.set({ shortcuts: defaultShortcuts })
    }

    // Default settings
    if (!data.settings) {
      const defaultSettings = {
        enabled: true,
        theme: "system", // 'light', 'dark', or 'system'
        scope: "all", // 'all', 'whitelist', or 'blacklist'
        whitelist: [],
        blacklist: [],
      }

      chrome.storage.local.set({ settings: defaultSettings })
    }
  })
})

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Get shortcuts
  if (request.action === "getShortcuts") {
    chrome.storage.local.get("shortcuts", (data) => {
      sendResponse({ shortcuts: data.shortcuts || {} })
    })
    return true // Required for async response
  }

  // Save shortcuts
  if (request.action === "saveShortcuts") {
    chrome.storage.local.set({ shortcuts: request.shortcuts }, () => {
      sendResponse({ success: true })
    })
    return true
  }

  // Get settings
  if (request.action === "getSettings") {
    chrome.storage.local.get("settings", (data) => {
      sendResponse({ settings: data.settings || {} })
    })
    return true
  }

  // Save settings
  if (request.action === "saveSettings") {
    chrome.storage.local.set({ settings: request.settings }, () => {
      sendResponse({ success: true })
    })
    return true
  }
})
