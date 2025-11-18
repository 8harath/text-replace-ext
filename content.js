/**
 * TextShortcuts Content Script
 * Handles text replacement in editable fields across web pages
 * @author Bharath K
 * @version 2.0.0
 */

/** @type {Object<string, string>} Shortcut mappings */
let shortcuts = {};

/** @type {Object} Extension settings */
let settings = {
  enabled: true,
  scope: "all",
  caseSensitive: false,
  whitelist: [],
  blacklist: [],
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

/**
 * Initialize shortcuts and settings from storage
 */
function initializeExtension() {
  chrome.storage.local.get(["shortcuts", "settings"], (data) => {
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
  });
}

// Initialize on load
initializeExtension();

/**
 * Listen for storage changes to update shortcuts and settings in real-time
 */
chrome.storage.onChanged.addListener((changes) => {
  if (changes.shortcuts) {
    shortcuts = changes.shortcuts.newValue || {};
  }
  if (changes.settings) {
    settings = { ...settings, ...changes.settings.newValue };
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
  const variables = {
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

  let processedText = text;
  for (const [variable, value] of Object.entries(variables)) {
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
      let replacement = shortcuts[trigger];
      replacement = processVariables(replacement);

      // Perform the replacement
      replaceText(element, startPos, endPos, replacement);

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
      let replacement = shortcuts[trigger];
      replacement = processVariables(replacement);

      // Perform the replacement
      replaceText(element, startPos, selectionStart, replacement);

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

// Log initialization
debugLog("Content script loaded and ready");
