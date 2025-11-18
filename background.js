/**
 * TextShortcuts Background Service Worker
 * Manages extension initialization, message handling, context menus, and keyboard commands
 * @author Bharath K
 * @version 2.1.0
 */

/**
 * Default shortcuts to be set on first installation
 * @const {Object<string, Object>}
 */
const DEFAULT_SHORTCUTS = {
  "/mail": {
    content: "example@gmail.com",
    category: "Personal",
    usageCount: 0,
    createdAt: Date.now(),
  },
  "/name": {
    content: "John Doe",
    category: "Personal",
    usageCount: 0,
    createdAt: Date.now(),
  },
  "/phone": {
    content: "(123) 456-7890",
    category: "Personal",
    usageCount: 0,
    createdAt: Date.now(),
  },
  "/addr": {
    content: "123 Main St, Anytown, USA",
    category: "Personal",
    usageCount: 0,
    createdAt: Date.now(),
  },
  "/date": {
    content: "{date}",
    category: "Variables",
    usageCount: 0,
    createdAt: Date.now(),
  },
  "/time": {
    content: "{time}",
    category: "Variables",
    usageCount: 0,
    createdAt: Date.now(),
  },
  "/sig": {
    content: "Best regards,\nJohn Doe",
    category: "Professional",
    usageCount: 0,
    createdAt: Date.now(),
  },
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
  showQuickInsertMenu: true,
  trackStatistics: true,
};

/**
 * Default custom variables
 * @const {Object<string, string>}
 */
const DEFAULT_CUSTOM_VARS = {
  "{username}": "YourUsername",
  "{company}": "Your Company",
};

/**
 * Context menu IDs
 * @const {string}
 */
const CONTEXT_MENU_ID = "textshortcuts-insert";
const CONTEXT_MENU_PARENT = "textshortcuts-parent";

/**
 * Initialize extension on installation or update
 * Sets default shortcuts, settings, and creates context menus
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log("[TextShortcuts] Extension installed/updated:", details.reason);

  // Initialize storage
  chrome.storage.local.get(["shortcuts", "settings", "customVariables", "statistics"], (data) => {
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

    // Set default custom variables if none exist
    if (!data.customVariables) {
      chrome.storage.local.set({ customVariables: DEFAULT_CUSTOM_VARS }, () => {
        if (chrome.runtime.lastError) {
          console.error("[TextShortcuts] Error setting custom variables:", chrome.runtime.lastError);
        } else {
          console.log("[TextShortcuts] Custom variables initialized");
        }
      });
    }

    // Initialize statistics if none exist
    if (!data.statistics) {
      const statistics = {
        totalReplacements: 0,
        lastUsed: null,
        mostUsedTrigger: null,
      };
      chrome.storage.local.set({ statistics }, () => {
        if (chrome.runtime.lastError) {
          console.error("[TextShortcuts] Error initializing statistics:", chrome.runtime.lastError);
        } else {
          console.log("[TextShortcuts] Statistics initialized");
        }
      });
    }

    // Show welcome page on first install
    if (details.reason === "install") {
      showWelcomePage();
    }
  });

  // Create context menus
  createContextMenus();
});

/**
 * Create context menus for quick shortcut insertion
 */
function createContextMenus() {
  // Remove existing menus first
  chrome.contextMenus.removeAll(() => {
    // Create parent menu
    chrome.contextMenus.create({
      id: CONTEXT_MENU_PARENT,
      title: "Insert TextShortcut",
      contexts: ["editable"],
    });

    // Load shortcuts and create menu items
    chrome.storage.local.get(["shortcuts"], (data) => {
      const shortcuts = data.shortcuts || {};
      const triggers = Object.keys(shortcuts).slice(0, 10); // Limit to 10 for performance

      if (triggers.length === 0) {
        chrome.contextMenus.create({
          id: "no-shortcuts",
          parentId: CONTEXT_MENU_PARENT,
          title: "No shortcuts available",
          contexts: ["editable"],
          enabled: false,
        });
      } else {
        triggers.forEach((trigger) => {
          const shortcut = shortcuts[trigger];
          const content = typeof shortcut === "string" ? shortcut : shortcut.content;
          const preview = content.length > 30 ? content.substring(0, 30) + "..." : content;

          chrome.contextMenus.create({
            id: `shortcut-${trigger}`,
            parentId: CONTEXT_MENU_PARENT,
            title: `${trigger} → ${preview}`,
            contexts: ["editable"],
          });
        });

        // Add "More shortcuts..." option
        if (Object.keys(shortcuts).length > 10) {
          chrome.contextMenus.create({
            id: "more-shortcuts",
            parentId: CONTEXT_MENU_PARENT,
            title: `+ ${Object.keys(shortcuts).length - 10} more shortcuts...`,
            contexts: ["editable"],
            enabled: false,
          });
        }
      }
    });
  });
}

/**
 * Handle context menu clicks
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId.toString().startsWith("shortcut-")) {
    const trigger = info.menuItemId.replace("shortcut-", "");

    // Get the shortcut and insert it
    chrome.storage.local.get(["shortcuts"], (data) => {
      const shortcuts = data.shortcuts || {};
      const shortcut = shortcuts[trigger];

      if (shortcut) {
        const content = typeof shortcut === "string" ? shortcut : shortcut.content;

        // Send message to content script to insert the text
        chrome.tabs.sendMessage(tab.id, {
          action: "insertText",
          text: content,
          trigger: trigger,
        });

        // Update statistics
        updateStatistics(trigger);
      }
    });
  }
});

/**
 * Handle keyboard commands
 */
chrome.commands.onCommand.addListener((command) => {
  console.log("[TextShortcuts] Command received:", command);

  if (command === "quick_insert") {
    // Send message to content script to show quick insert menu
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "showQuickInsert",
        });
      }
    });
  }
});

/**
 * Show welcome page on first installation
 */
function showWelcomePage() {
  console.log("[TextShortcuts] Welcome to TextShortcuts v2.1.0!");
  // Optionally open a welcome page or show notification
}

/**
 * Update usage statistics for a shortcut
 * @param {string} trigger - The trigger that was used
 */
function updateStatistics(trigger) {
  chrome.storage.local.get(["shortcuts", "statistics", "settings"], (data) => {
    const settings = data.settings || DEFAULT_SETTINGS;

    // Only track if statistics are enabled
    if (!settings.trackStatistics) return;

    const shortcuts = data.shortcuts || {};
    const statistics = data.statistics || {
      totalReplacements: 0,
      lastUsed: null,
      mostUsedTrigger: null,
    };

    // Update shortcut usage count
    if (shortcuts[trigger]) {
      if (typeof shortcuts[trigger] === "string") {
        // Convert old format to new format
        shortcuts[trigger] = {
          content: shortcuts[trigger],
          category: "Uncategorized",
          usageCount: 1,
          createdAt: Date.now(),
        };
      } else {
        shortcuts[trigger].usageCount = (shortcuts[trigger].usageCount || 0) + 1;
        shortcuts[trigger].lastUsed = Date.now();
      }
    }

    // Update global statistics
    statistics.totalReplacements = (statistics.totalReplacements || 0) + 1;
    statistics.lastUsed = Date.now();

    // Find most used trigger
    let maxCount = 0;
    let mostUsed = null;
    Object.entries(shortcuts).forEach(([key, value]) => {
      const count = typeof value === "string" ? 0 : (value.usageCount || 0);
      if (count > maxCount) {
        maxCount = count;
        mostUsed = key;
      }
    });
    statistics.mostUsedTrigger = mostUsed;

    // Save updated data
    chrome.storage.local.set({ shortcuts, statistics }, () => {
      if (chrome.runtime.lastError) {
        console.error("[TextShortcuts] Error updating statistics:", chrome.runtime.lastError);
      }
    });
  });
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

      case "getCustomVariables":
        handleGetCustomVariables(sendResponse);
        return true;

      case "saveCustomVariables":
        handleSaveCustomVariables(request.customVariables, sendResponse);
        return true;

      case "getStatistics":
        handleGetStatistics(sendResponse);
        return true;

      case "updateStatistics":
        updateStatistics(request.trigger);
        sendResponse({ success: true });
        return false;

      case "resetStatistics":
        handleResetStatistics(sendResponse);
        return true;

      case "refreshContextMenu":
        createContextMenus();
        sendResponse({ success: true });
        return false;

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
 * @param {Object<string, Object>} shortcuts - Shortcuts to save
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
      // Refresh context menus
      createContextMenus();
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
 * Handle get custom variables request
 * @param {Function} sendResponse - Response callback
 */
function handleGetCustomVariables(sendResponse) {
  chrome.storage.local.get("customVariables", (data) => {
    if (chrome.runtime.lastError) {
      console.error("[TextShortcuts] Error getting custom variables:", chrome.runtime.lastError);
      sendResponse({ customVariables: {}, error: chrome.runtime.lastError.message });
    } else {
      sendResponse({ customVariables: data.customVariables || {} });
    }
  });
}

/**
 * Handle save custom variables request
 * @param {Object<string, string>} customVariables - Custom variables to save
 * @param {Function} sendResponse - Response callback
 */
function handleSaveCustomVariables(customVariables, sendResponse) {
  if (!customVariables || typeof customVariables !== "object") {
    sendResponse({ success: false, error: "Invalid custom variables data" });
    return;
  }

  chrome.storage.local.set({ customVariables }, () => {
    if (chrome.runtime.lastError) {
      console.error("[TextShortcuts] Error saving custom variables:", chrome.runtime.lastError);
      sendResponse({ success: false, error: chrome.runtime.lastError.message });
    } else {
      console.log("[TextShortcuts] Custom variables saved successfully");
      sendResponse({ success: true });
    }
  });
}

/**
 * Handle get statistics request
 * @param {Function} sendResponse - Response callback
 */
function handleGetStatistics(sendResponse) {
  chrome.storage.local.get(["statistics", "shortcuts"], (data) => {
    if (chrome.runtime.lastError) {
      console.error("[TextShortcuts] Error getting statistics:", chrome.runtime.lastError);
      sendResponse({ statistics: {}, error: chrome.runtime.lastError.message });
    } else {
      const statistics = data.statistics || {
        totalReplacements: 0,
        lastUsed: null,
        mostUsedTrigger: null,
      };
      const shortcuts = data.shortcuts || {};

      sendResponse({ statistics, shortcuts });
    }
  });
}

/**
 * Handle reset statistics request
 * @param {Function} sendResponse - Response callback
 */
function handleResetStatistics(sendResponse) {
  chrome.storage.local.get("shortcuts", (data) => {
    const shortcuts = data.shortcuts || {};

    // Reset usage counts in shortcuts
    Object.keys(shortcuts).forEach((trigger) => {
      if (typeof shortcuts[trigger] === "object") {
        shortcuts[trigger].usageCount = 0;
        delete shortcuts[trigger].lastUsed;
      }
    });

    // Reset global statistics
    const statistics = {
      totalReplacements: 0,
      lastUsed: null,
      mostUsedTrigger: null,
    };

    chrome.storage.local.set({ shortcuts, statistics }, () => {
      if (chrome.runtime.lastError) {
        console.error("[TextShortcuts] Error resetting statistics:", chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        console.log("[TextShortcuts] Statistics reset successfully");
        sendResponse({ success: true });
      }
    });
  });
}

/**
 * Listen for storage changes and update context menus
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local") {
    // Refresh context menus if shortcuts changed
    if (changes.shortcuts) {
      createContextMenus();
    }

    // Log changes for debugging
    for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
      console.log(`[TextShortcuts] Storage key "${key}" changed`);
    }
  }
});

console.log("[TextShortcuts] Background service worker initialized v2.1.0");
