/**
 * TextShortcuts Content Script
 * Handles text replacement in editable fields across web pages
 * @author Bharath K
 * @version 2.1.0
 */

/** @type {Object<string, Object>} Shortcut mappings */
let shortcuts = {};

/** @type {Object<string, string>} Custom variables */
let customVariables = {};

/** @type {Object} Extension settings */
let settings = {
  enabled: true,
  scope: "all",
  caseSensitive: false,
  whitelist: [],
  blacklist: [],
  showQuickInsertMenu: true,
  trackStatistics: true,
};

/** @type {HTMLElement|null} Last triggered element */
let lastTriggeredElement = null;

/** @type {string} Input buffer for tracking typed characters */
let inputBuffer = "";

/** @type {number} Maximum buffer length */
const MAX_BUFFER_LENGTH = 50;

/** @type {number} Debounce timeout ID */
let debounceTimeout = null;

/** @type {number} Debounce delay in milliseconds */
const DEBOUNCE_DELAY = 10;

/** @type {HTMLElement|null} Quick insert menu element */
let quickInsertMenu = null;

/** @type {number} Selected shortcut index in quick insert menu */
let selectedShortcutIndex = 0;

/** @type {Array<string>} Filtered shortcuts for quick insert */
let filteredShortcuts = [];

/**
 * Initialize shortcuts, settings, and custom variables from storage
 */
function initializeExtension() {
  chrome.storage.local.get(["shortcuts", "settings", "customVariables"], (data) => {
    if (data.shortcuts) {
      shortcuts = data.shortcuts;
    } else {
      shortcuts = {
        "/mail": "example@gmail.com",
        "/name": "John Doe",
        "/date": "{date}",
        "/time": "{time}",
      };
      chrome.storage.local.set({ shortcuts });
    }

    if (data.settings) {
      settings = { ...settings, ...data.settings };
    }

    if (data.customVariables) {
      customVariables = data.customVariables;
    }
  });
}

// Initialize on load
initializeExtension();

/**
 * Listen for storage changes to update shortcuts, settings, and custom variables in real-time
 */
chrome.storage.onChanged.addListener((changes) => {
  if (changes.shortcuts) {
    shortcuts = changes.shortcuts.newValue || {};
  }
  if (changes.settings) {
    settings = { ...settings, ...changes.settings.newValue };
  }
  if (changes.customVariables) {
    customVariables = changes.customVariables.newValue || {};
  }
});

/**
 * Check if the current site is allowed based on settings
 * @returns {boolean} Whether the extension should run on current site
 */
function isSiteAllowed() {
  if (!settings.enabled) return false;
  if (settings.scope === "all") return true;

  const currentHost = window.location.hostname;

  if (settings.scope === "whitelist" && settings.whitelist) {
    return settings.whitelist.some((site) => currentHost.includes(site));
  }

  if (settings.scope === "blacklist" && settings.blacklist) {
    return !settings.blacklist.some((site) => currentHost.includes(site));
  }

  return true;
}

/**
 * Process variable placeholders in replacement text
 * @param {string} text - Text containing variables
 * @returns {string} Processed text with variables replaced
 */
function processVariables(text) {
  if (!text) return text;

  const now = new Date();
  const builtInVariables = {
    "{date}": now.toLocaleDateString(),
    "{time}": now.toLocaleTimeString(),
    "{datetime}": now.toLocaleString(),
    "{year}": now.getFullYear().toString(),
    "{month}": (now.getMonth() + 1).toString().padStart(2, "0"),
    "{day}": now.getDate().toString().padStart(2, "0"),
    "{hour}": now.getHours().toString().padStart(2, "0"),
    "{minute}": now.getMinutes().toString().padStart(2, "0"),
    "{second}": now.getSeconds().toString().padStart(2, "0"),
    "{timestamp}": now.getTime().toString(),
  };

  // Merge built-in and custom variables
  const allVariables = { ...builtInVariables, ...customVariables };

  let processedText = text;
  for (const [variable, value] of Object.entries(allVariables)) {
    processedText = processedText.replace(new RegExp(escapeRegex(variable), "g"), value);
  }

  return processedText;
}

/**
 * Escape special regex characters
 * @param {string} string - String to escape
 * @returns {string} Escaped string
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Get clipboard content if available
 * @returns {Promise<string>} Clipboard text
 */
async function getClipboardContent() {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      return await navigator.clipboard.readText();
    }
  } catch (error) {
    console.warn("[TextShortcuts] Clipboard access denied:", error);
  }
  return "";
}

/**
 * Main event listener for input events
 */
document.addEventListener("input", handleInput, true);
document.addEventListener("keydown", handleKeyDown, true);

/**
 * Handle input events to detect trigger words
 * @param {Event} event - Input event
 */
function handleInput(event) {
  if (!isSiteAllowed() || !isEditableElement(event.target)) return;

  // Debounce for performance
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }

  debounceTimeout = setTimeout(() => {
    processInput(event.target);
  }, DEBOUNCE_DELAY);
}

/**
 * Process input from editable element
 * @param {HTMLElement} element - The editable element
 */
function processInput(element) {
  lastTriggeredElement = element;

  const { text, cursorPos } = getTextAndCursor(element);
  if (!text || cursorPos === 0) return;

  // Update input buffer with the last typed character
  if (cursorPos > 0 && cursorPos <= text.length) {
    const lastChar = text.charAt(cursorPos - 1);
    inputBuffer += lastChar;

    // Keep buffer at reasonable size
    if (inputBuffer.length > MAX_BUFFER_LENGTH) {
      inputBuffer = inputBuffer.substring(inputBuffer.length - MAX_BUFFER_LENGTH);
    }

    // Check for triggers in the buffer
    checkAndReplaceTrigger(element, text, cursorPos);
  }
}

/**
 * Check for trigger matches and perform replacement
 * @param {HTMLElement} element - The editable element
 * @param {string} text - Current text content
 * @param {number} cursorPos - Current cursor position
 */
function checkAndReplaceTrigger(element, text, cursorPos) {
  // Sort triggers by length (longest first) to match longer triggers first
  const sortedTriggers = Object.keys(shortcuts).sort((a, b) => b.length - a.length);

  for (const trigger of sortedTriggers) {
    const bufferToCheck = settings.caseSensitive ? inputBuffer : inputBuffer.toLowerCase();
    const triggerToCheck = settings.caseSensitive ? trigger : trigger.toLowerCase();

    if (bufferToCheck.endsWith(triggerToCheck)) {
      // Calculate positions for replacement
      const startPos = cursorPos - trigger.length;
      const endPos = cursorPos;

      // Get replacement text and process variables
      const shortcut = shortcuts[trigger];
      let replacement = typeof shortcut === "string" ? shortcut : shortcut.content;
      replacement = processVariables(replacement);

      // Perform the replacement
      replaceText(element, startPos, endPos, replacement);

      // Update statistics
      updateStatisticsForTrigger(trigger);

      // Reset buffer after replacement
      inputBuffer = "";

      // Break after first match to avoid multiple replacements
      break;
    }
  }
}

/**
 * Handle keydown events to detect space or enter after a trigger
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyDown(event) {
  if (!isSiteAllowed() || !isEditableElement(event.target)) return;

  // Only process on space or enter key
  if (event.key !== " " && event.key !== "Enter") return;

  const element = event.target;
  const { text, selectionStart } = getTextAndSelection(element);

  // Find the word before the cursor
  const wordBeforeCursor = getWordBeforeCursor(text, selectionStart);

  // Check if the word is a trigger
  if (wordBeforeCursor && hasShortcut(wordBeforeCursor)) {
    const trigger = findMatchingTrigger(wordBeforeCursor);
    if (trigger) {
      // Calculate positions for replacement
      const startPos = selectionStart - wordBeforeCursor.length;
      const shortcut = shortcuts[trigger];
      let replacement = typeof shortcut === "string" ? shortcut : shortcut.content;
      replacement = processVariables(replacement);

      // Perform the replacement
      replaceText(element, startPos, selectionStart, replacement);

      // Update statistics
      updateStatisticsForTrigger(trigger);

      // Prevent the space or enter from being added
      event.preventDefault();

      // Reset buffer
      inputBuffer = "";
    }
  }
}

/**
 * Check if a shortcut exists for the given word
 * @param {string} word - Word to check
 * @returns {boolean} Whether a shortcut exists
 */
function hasShortcut(word) {
  return findMatchingTrigger(word) !== null;
}

/**
 * Find matching trigger considering case sensitivity
 * @param {string} word - Word to match
 * @returns {string|null} Matching trigger or null
 */
function findMatchingTrigger(word) {
  if (settings.caseSensitive) {
    return shortcuts.hasOwnProperty(word) ? word : null;
  }

  const lowerWord = word.toLowerCase();
  for (const trigger of Object.keys(shortcuts)) {
    if (trigger.toLowerCase() === lowerWord) {
      return trigger;
    }
  }
  return null;
}

/**
 * Check if an element is editable
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} Whether element is editable
 */
function isEditableElement(element) {
  if (!element) return false;

  const editableInputTypes = ["text", "email", "search", "url", "tel", "password"];

  return (
    (element.tagName === "INPUT" && editableInputTypes.includes(element.type)) ||
    element.tagName === "TEXTAREA" ||
    element.getAttribute("contenteditable") === "true" ||
    element.isContentEditable
  );
}

/**
 * Get text content and cursor position from element
 * @param {HTMLElement} element - The editable element
 * @returns {{text: string, cursorPos: number}} Text and cursor position
 */
function getTextAndCursor(element) {
  let text = "";
  let cursorPos = 0;

  try {
    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
      text = element.value || "";
      cursorPos = element.selectionStart || 0;
    } else if (element.isContentEditable) {
      const selection = window.getSelection();
      text = element.textContent || "";
      cursorPos = selection.anchorOffset || 0;
    }
  } catch (error) {
    console.warn("[TextShortcuts] Error getting text and cursor:", error);
  }

  return { text, cursorPos };
}

/**
 * Get text and selection range from element
 * @param {HTMLElement} element - The editable element
 * @returns {{text: string, selectionStart: number, selectionEnd: number}} Text and selection
 */
function getTextAndSelection(element) {
  let text = "";
  let selectionStart = 0;
  let selectionEnd = 0;

  try {
    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
      text = element.value || "";
      selectionStart = element.selectionStart || 0;
      selectionEnd = element.selectionEnd || 0;
    } else if (element.isContentEditable) {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      text = element.textContent || "";
      selectionStart = range.startOffset || 0;
      selectionEnd = range.endOffset || 0;
    }
  } catch (error) {
    console.warn("[TextShortcuts] Error getting text and selection:", error);
  }

  return { text, selectionStart, selectionEnd };
}

/**
 * Get the word before the cursor
 * @param {string} text - Full text content
 * @param {number} cursorPos - Cursor position
 * @returns {string|null} Word before cursor or null
 */
function getWordBeforeCursor(text, cursorPos) {
  if (!text || cursorPos === 0) return null;

  try {
    // Find the start of the current word
    let startPos = cursorPos - 1;
    while (startPos >= 0 && !/\s/.test(text[startPos])) {
      startPos--;
    }
    startPos++; // Move past the whitespace

    // Extract the word
    const word = text.substring(startPos, cursorPos);

    // Only return if it starts with '/' (trigger prefix)
    return word.startsWith("/") ? word : null;
  } catch (error) {
    console.warn("[TextShortcuts] Error getting word before cursor:", error);
    return null;
  }
}

/**
 * Replace text in an element
 * @param {HTMLElement} element - The editable element
 * @param {number} startPos - Start position of text to replace
 * @param {number} endPos - End position of text to replace
 * @param {string} replacement - Replacement text
 */
function replaceText(element, startPos, endPos, replacement) {
  try {
    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
      const originalValue = element.value || "";
      element.value = originalValue.substring(0, startPos) + replacement + originalValue.substring(endPos);

      // Set cursor position after the replacement
      const newPosition = startPos + replacement.length;
      element.setSelectionRange(newPosition, newPosition);

      // Dispatch input event for framework compatibility
      dispatchInputEvent(element);
    } else if (element.isContentEditable) {
      replaceInContentEditable(element, startPos, endPos, replacement);
    }
  } catch (error) {
    console.error("[TextShortcuts] Error replacing text:", error);
  }
}

/**
 * Replace text in contenteditable element
 * @param {HTMLElement} element - The contenteditable element
 * @param {number} startPos - Start position
 * @param {number} endPos - End position
 * @param {string} replacement - Replacement text
 */
function replaceInContentEditable(element, startPos, endPos, replacement) {
  try {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;

    if (textNode.nodeType === Node.TEXT_NODE) {
      const originalText = textNode.nodeValue || "";
      textNode.nodeValue = originalText.substring(0, startPos) + replacement + originalText.substring(endPos);

      // Set cursor position after the replacement
      const newRange = document.createRange();
      const newPosition = startPos + replacement.length;
      newRange.setStart(textNode, newPosition);
      newRange.setEnd(textNode, newPosition);
      selection.removeAllRanges();
      selection.addRange(newRange);

      // Dispatch input event
      dispatchInputEvent(element);
    }
  } catch (error) {
    console.warn("[TextShortcuts] Error replacing in contenteditable:", error);
  }
}

/**
 * Dispatch input event for framework compatibility
 * @param {HTMLElement} element - The element to dispatch event on
 */
function dispatchInputEvent(element) {
  try {
    const inputEvent = new Event("input", { bubbles: true, cancelable: true });
    element.dispatchEvent(inputEvent);

    // Also dispatch change event for some frameworks
    const changeEvent = new Event("change", { bubbles: true, cancelable: true });
    element.dispatchEvent(changeEvent);
  } catch (error) {
    console.warn("[TextShortcuts] Error dispatching events:", error);
  }
}

/**
 * Mutation observer to handle dynamically added elements
 */
const observer = new MutationObserver((mutations) => {
  try {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE && isEditableElement(node)) {
            // Element already has listeners from event delegation
            // This is just for tracking if needed in future
          }
        }
      }
    }
  } catch (error) {
    console.warn("[TextShortcuts] Error in mutation observer:", error);
  }
});

// Start observing the document
if (document.body) {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
} else {
  // Wait for document body to be available
  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

/**
 * Debug logging (only in development)
 * @param {string} message - Log message
 * @param {*} data - Optional data to log
 */
function debugLog(message, data) {
  // Uncomment for debugging
  // if (typeof data !== "undefined") {
  //   console.log(`[TextShortcuts] ${message}:`, data);
  // } else {
  //   console.log(`[TextShortcuts] ${message}`);
  // }
}

/**
 * Update statistics for a trigger
 * @param {string} trigger - The trigger that was used
 */
function updateStatisticsForTrigger(trigger) {
  if (!settings.trackStatistics) return;

  try {
    chrome.runtime.sendMessage({
      action: "updateStatistics",
      trigger: trigger,
    });
  } catch (error) {
    console.warn("[TextShortcuts] Error updating statistics:", error);
  }
}

/**
 * Listen for messages from background script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === "insertText") {
      // Insert text from context menu
      insertTextAtCursor(request.text);
      if (request.trigger) {
        updateStatisticsForTrigger(request.trigger);
      }
      sendResponse({ success: true });
    } else if (request.action === "showQuickInsert") {
      // Show quick insert menu
      showQuickInsertMenu();
      sendResponse({ success: true });
    }
  } catch (error) {
    console.error("[TextShortcuts] Error handling message:", error);
    sendResponse({ success: false, error: error.message });
  }
});

/**
 * Insert text at cursor position
 * @param {string} text - Text to insert
 */
function insertTextAtCursor(text) {
  const activeElement = document.activeElement;

  if (!isEditableElement(activeElement)) {
    showNotification("Please focus on a text field first", "error");
    return;
  }

  const { selectionStart, selectionEnd } = getTextAndSelection(activeElement);
  const processedText = processVariables(text);

  replaceText(activeElement, selectionStart, selectionEnd, processedText);
}

/**
 * Show quick insert menu
 */
function showQuickInsertMenu() {
  if (!settings.showQuickInsertMenu || quickInsertMenu) return;

  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "textshortcuts-overlay";
  overlay.addEventListener("click", hideQuickInsertMenu);

  // Create menu
  quickInsertMenu = document.createElement("div");
  quickInsertMenu.className = "textshortcuts-quick-insert";

  // Header
  const header = document.createElement("div");
  header.className = "textshortcuts-header";
  header.innerHTML = `
    <h3 class="textshortcuts-title">Quick Insert</h3>
    <button class="textshortcuts-close-btn" aria-label="Close">×</button>
  `;
  header.querySelector(".textshortcuts-close-btn").addEventListener("click", hideQuickInsertMenu);

  // Search input
  const searchContainer = document.createElement("div");
  searchContainer.className = "textshortcuts-search";
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search shortcuts...";
  searchInput.addEventListener("input", (e) => filterShortcutsInMenu(e.target.value));
  searchInput.addEventListener("keydown", handleMenuKeydown);
  searchContainer.appendChild(searchInput);

  // Shortcuts list
  const shortcutsList = document.createElement("div");
  shortcutsList.className = "textshortcuts-shortcuts-list";

  // Footer
  const footer = document.createElement("div");
  footer.className = "textshortcuts-footer";
  footer.innerHTML = `
    <div><kbd>↑</kbd> <kbd>↓</kbd> Navigate | <kbd>Enter</kbd> Insert | <kbd>Esc</kbd> Close</div>
    <div>${Object.keys(shortcuts).length} shortcuts</div>
  `;

  // Assemble menu
  quickInsertMenu.appendChild(header);
  quickInsertMenu.appendChild(searchContainer);
  quickInsertMenu.appendChild(shortcutsList);
  quickInsertMenu.appendChild(footer);

  document.body.appendChild(overlay);
  document.body.appendChild(quickInsertMenu);

  // Render shortcuts
  filterShortcutsInMenu("");

  // Focus search input
  setTimeout(() => searchInput.focus(), 100);
}

/**
 * Hide quick insert menu
 */
function hideQuickInsertMenu() {
  if (!quickInsertMenu) return;

  const overlay = document.querySelector(".textshortcuts-overlay");
  if (overlay) overlay.remove();

  quickInsertMenu.remove();
  quickInsertMenu = null;
  selectedShortcutIndex = 0;
  filteredShortcuts = [];
}

/**
 * Filter shortcuts in menu
 * @param {string} query - Search query
 */
function filterShortcutsInMenu(query) {
  if (!quickInsertMenu) return;

  const lowerQuery = query.toLowerCase();
  filteredShortcuts = Object.keys(shortcuts).filter((trigger) => {
    const shortcut = shortcuts[trigger];
    const content = typeof shortcut === "string" ? shortcut : shortcut.content;
    return (
      trigger.toLowerCase().includes(lowerQuery) || content.toLowerCase().includes(lowerQuery)
    );
  });

  // Sort by usage count if available
  filteredShortcuts.sort((a, b) => {
    const aShortcut = shortcuts[a];
    const bShortcut = shortcuts[b];
    const aCount = typeof aShortcut === "object" ? (aShortcut.usageCount || 0) : 0;
    const bCount = typeof bShortcut === "object" ? (bShortcut.usageCount || 0) : 0;
    return bCount - aCount;
  });

  selectedShortcutIndex = 0;
  renderShortcutsList();
}

/**
 * Render shortcuts list
 */
function renderShortcutsList() {
  if (!quickInsertMenu) return;

  const shortcutsList = quickInsertMenu.querySelector(".textshortcuts-shortcuts-list");
  shortcutsList.innerHTML = "";

  if (filteredShortcuts.length === 0) {
    shortcutsList.innerHTML = `
      <div class="textshortcuts-empty-state">No shortcuts found</div>
    `;
    return;
  }

  filteredShortcuts.forEach((trigger, index) => {
    const shortcut = shortcuts[trigger];
    const content = typeof shortcut === "string" ? shortcut : shortcut.content;
    const category = typeof shortcut === "object" ? shortcut.category || "Uncategorized" : "Uncategorized";
    const usageCount = typeof shortcut === "object" ? shortcut.usageCount || 0 : 0;

    const preview = content.length > 50 ? content.substring(0, 50) + "..." : content;

    const item = document.createElement("div");
    item.className = "textshortcuts-shortcut-item";
    if (index === selectedShortcutIndex) {
      item.classList.add("selected");
    }

    item.innerHTML = `
      <div class="textshortcuts-shortcut-info">
        <div class="textshortcuts-shortcut-trigger">${escapeHtml(trigger)}</div>
        <div class="textshortcuts-shortcut-content">${escapeHtml(preview)}</div>
      </div>
      <div class="textshortcuts-shortcut-meta">
        <span class="textshortcuts-shortcut-category">${escapeHtml(category)}</span>
        ${usageCount > 0 ? `<span class="textshortcuts-shortcut-count">${usageCount} uses</span>` : ""}
      </div>
    `;

    item.addEventListener("click", () => insertShortcutFromMenu(trigger));
    shortcutsList.appendChild(item);
  });

  // Scroll selected item into view
  const selectedItem = shortcutsList.querySelector(".selected");
  if (selectedItem) {
    selectedItem.scrollIntoView({ block: "nearest" });
  }
}

/**
 * Handle keyboard navigation in menu
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleMenuKeydown(event) {
  if (!quickInsertMenu) return;

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      selectedShortcutIndex = Math.min(selectedShortcutIndex + 1, filteredShortcuts.length - 1);
      renderShortcutsList();
      break;

    case "ArrowUp":
      event.preventDefault();
      selectedShortcutIndex = Math.max(selectedShortcutIndex - 1, 0);
      renderShortcutsList();
      break;

    case "Enter":
      event.preventDefault();
      if (filteredShortcuts.length > 0 && filteredShortcuts[selectedShortcutIndex]) {
        insertShortcutFromMenu(filteredShortcuts[selectedShortcutIndex]);
      }
      break;

    case "Escape":
      event.preventDefault();
      hideQuickInsertMenu();
      break;
  }
}

/**
 * Insert shortcut from menu
 * @param {string} trigger - Trigger to insert
 */
function insertShortcutFromMenu(trigger) {
  const shortcut = shortcuts[trigger];
  if (!shortcut) return;

  const content = typeof shortcut === "string" ? shortcut : shortcut.content;
  insertTextAtCursor(content);
  updateStatisticsForTrigger(trigger);
  hideQuickInsertMenu();

  showNotification(`Inserted: ${trigger}`, "success");
}

/**
 * Show notification toast
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info)
 */
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `textshortcuts-notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

/**
 * Escape HTML for safe rendering
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Log initialization
debugLog("Content script loaded and ready v2.1.0");
