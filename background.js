/**
 * TextShortcuts Background Service Worker
 * Manages extension initialization and message handling
 * @author Bharath K
 * @version 2.0.0
 */

/**
 * Default shortcuts to be set on first installation
 * @const {Object<string, string>}
 */
const DEFAULT_SHORTCUTS = {
  "/mail": "example@gmail.com",
  "/name": "John Doe",
  "/phone": "(123) 456-7890",
  "/addr": "123 Main St, Anytown, USA",
  "/date": "{date}",
  "/time": "{time}",
  "/sig": "Best regards,\nJohn Doe",
};

/**
 * Default settings configuration
 * @const {Object}
 */
const DEFAULT_SETTINGS = {
  enabled: true,
  theme: "system",
  scope: "all",
  caseSensitive: false,
  whitelist: [],
  blacklist: [],
};

/**
 * Initialize extension on installation or update
 * Sets default shortcuts and settings if none exist
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log("[TextShortcuts] Extension installed/updated:", details.reason);

  chrome.storage.local.get(["shortcuts", "settings"], (data) => {
    // Set default shortcuts if none exist
    if (!data.shortcuts) {
      chrome.storage.local.set({ shortcuts: DEFAULT_SHORTCUTS }, () => {
        if (chrome.runtime.lastError) {
          console.error("[TextShortcuts] Error setting default shortcuts:", chrome.runtime.lastError);
        } else {
          console.log("[TextShortcuts] Default shortcuts initialized");
        }
      });
    }

    // Set default settings if none exist
    if (!data.settings) {
      chrome.storage.local.set({ settings: DEFAULT_SETTINGS }, () => {
        if (chrome.runtime.lastError) {
          console.error("[TextShortcuts] Error setting default settings:", chrome.runtime.lastError);
        } else {
          console.log("[TextShortcuts] Default settings initialized");
        }
      });
    }

    // Show welcome page on first install
    if (details.reason === "install") {
      showWelcomePage();
    }
  });
});

/**
 * Show welcome page on first installation
 */
function showWelcomePage() {
  // Optionally open a welcome page or show notification
  console.log("[TextShortcuts] Welcome to TextShortcuts!");
}

/**
 * Handle messages from popup and content scripts
 * @param {Object} request - Message request object
 * @param {chrome.runtime.MessageSender} sender - Message sender
 * @param {Function} sendResponse - Response callback function
 * @returns {boolean} True if response will be sent asynchronously
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    // Validate request
    if (!request || !request.action) {
      sendResponse({ success: false, error: "Invalid request" });
      return false;
    }

    switch (request.action) {
      case "getShortcuts":
        handleGetShortcuts(sendResponse);
        return true;

      case "saveShortcuts":
        handleSaveShortcuts(request.shortcuts, sendResponse);
        return true;

      case "getSettings":
        handleGetSettings(sendResponse);
        return true;

      case "saveSettings":
        handleSaveSettings(request.settings, sendResponse);
        return true;

      default:
        sendResponse({ success: false, error: "Unknown action" });
        return false;
    }
  } catch (error) {
    console.error("[TextShortcuts] Error handling message:", error);
    sendResponse({ success: false, error: error.message });
    return false;
  }
});

/**
 * Handle get shortcuts request
 * @param {Function} sendResponse - Response callback
 */
function handleGetShortcuts(sendResponse) {
  chrome.storage.local.get("shortcuts", (data) => {
    if (chrome.runtime.lastError) {
      console.error("[TextShortcuts] Error getting shortcuts:", chrome.runtime.lastError);
      sendResponse({ shortcuts: {}, error: chrome.runtime.lastError.message });
    } else {
      sendResponse({ shortcuts: data.shortcuts || {} });
    }
  });
}

/**
 * Handle save shortcuts request
 * @param {Object<string, string>} shortcuts - Shortcuts to save
 * @param {Function} sendResponse - Response callback
 */
function handleSaveShortcuts(shortcuts, sendResponse) {
  // Validate shortcuts
  if (!shortcuts || typeof shortcuts !== "object") {
    sendResponse({ success: false, error: "Invalid shortcuts data" });
    return;
  }

  chrome.storage.local.set({ shortcuts }, () => {
    if (chrome.runtime.lastError) {
      console.error("[TextShortcuts] Error saving shortcuts:", chrome.runtime.lastError);
      sendResponse({ success: false, error: chrome.runtime.lastError.message });
    } else {
      console.log("[TextShortcuts] Shortcuts saved successfully");
      sendResponse({ success: true });
    }
  });
}

/**
 * Handle get settings request
 * @param {Function} sendResponse - Response callback
 */
function handleGetSettings(sendResponse) {
  chrome.storage.local.get("settings", (data) => {
    if (chrome.runtime.lastError) {
      console.error("[TextShortcuts] Error getting settings:", chrome.runtime.lastError);
      sendResponse({ settings: {}, error: chrome.runtime.lastError.message });
    } else {
      sendResponse({ settings: data.settings || {} });
    }
  });
}

/**
 * Handle save settings request
 * @param {Object} settings - Settings to save
 * @param {Function} sendResponse - Response callback
 */
function handleSaveSettings(settings, sendResponse) {
  // Validate settings
  if (!settings || typeof settings !== "object") {
    sendResponse({ success: false, error: "Invalid settings data" });
    return;
  }

  chrome.storage.local.set({ settings }, () => {
    if (chrome.runtime.lastError) {
      console.error("[TextShortcuts] Error saving settings:", chrome.runtime.lastError);
      sendResponse({ success: false, error: chrome.runtime.lastError.message });
    } else {
      console.log("[TextShortcuts] Settings saved successfully");
      sendResponse({ success: true });
    }
  });
}

/**
 * Handle extension icon click (optional - for future use)
 */
chrome.action.onClicked.addListener((tab) => {
  console.log("[TextShortcuts] Extension icon clicked on tab:", tab.id);
});

/**
 * Listen for storage changes and log them (for debugging)
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local") {
    for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
      console.log(`[TextShortcuts] Storage key "${key}" changed:`, {
        old: oldValue,
        new: newValue,
      });
    }
  }
});

console.log("[TextShortcuts] Background service worker initialized");
