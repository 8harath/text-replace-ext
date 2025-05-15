// Global variables
let shortcuts = {};
let settings = {
  enabled: true,
  scope: "all", // 'all', 'whitelist', 'blacklist'
};
let lastTriggeredElement = null; // Track the last triggered element

// Load shortcuts and settings when content script initializes
chrome.storage.local.get(["shortcuts", "settings"], (data) => {
  if (data.shortcuts) {
    shortcuts = data.shortcuts;
  } else {
    // Set default shortcuts if none exist
    shortcuts = {
      "/mail": "example@gmail.com",
      "/name": "John Doe",
    };
    chrome.storage.local.set({ shortcuts });
  }

  if (data.settings) {
    settings = { ...settings, ...data.settings };
  }
});

// Listen for storage changes to update shortcuts and settings in real-time
chrome.storage.onChanged.addListener((changes) => {
  if (changes.shortcuts) {
    shortcuts = changes.shortcuts.newValue;
  }
  if (changes.settings) {
    settings = { ...settings, ...changes.settings.newValue };
  }
});

// Check if the current site is allowed based on settings
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

// Track the last few characters typed to detect triggers
let inputBuffer = "";
const MAX_BUFFER_LENGTH = 20; // Maximum length to track

// Main event listener for all input events
document.addEventListener("input", handleInput, true);
document.addEventListener("keydown", handleKeyDown, true);
document.addEventListener("paste", handlePaste, true); // Add paste event listener

// Handle input events to detect trigger words
function handleInput(event) {
  if (!isSiteAllowed() || !isEditableElement(event.target)) return;

  const element = event.target;

  // Store reference to the last triggered element
  lastTriggeredElement = element;

  // Get current cursor position and text
  let cursorPos;
  let text;

  if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
    cursorPos = element.selectionStart;
    text = element.value;
  } else if (element.getAttribute("contenteditable") === "true") {
    const selection = window.getSelection();
    cursorPos = selection.anchorOffset;
    text = element.textContent;
  } else {
    return;
  }

  // Update input buffer with the last typed character
  if (cursorPos > 0 && cursorPos <= text.length) {
    const lastChar = text.charAt(cursorPos - 1);
    inputBuffer += lastChar;

    // Keep buffer at reasonable size
    if (inputBuffer.length > MAX_BUFFER_LENGTH) {
      inputBuffer = inputBuffer.substring(inputBuffer.length - MAX_BUFFER_LENGTH);
    }

    // Check for triggers in the buffer
    Object.keys(shortcuts).forEach((trigger) => {
      if (inputBuffer.endsWith(trigger)) {
        // Replace the trigger with the shortcut content
        const replacement = shortcuts[trigger];

        // Calculate positions for replacement
        const startPos = cursorPos - trigger.length;
        const endPos = cursorPos;

        // Perform the replacement
        replaceText(element, startPos, endPos, replacement);

        // Reset buffer after replacement
        inputBuffer = "";

        // Prevent default to avoid duplicate input
        event.preventDefault();

        // Break the loop after first match
        return;
      }
    });
  }
}

// Handle keydown events to detect space or enter after a trigger
function handleKeyDown(event) {
  if (!lastTriggeredElement || !isEditableElement(event.target) || Object.keys(shortcuts).length === 0) return;

  // Only process on space or enter key
  if (event.key !== " " && event.key !== "Enter") return;

  const element = event.target;

  // Get the current text and selection
  const { text, selectionStart, selectionEnd } = getTextAndSelection(element);

  // Find the word before the cursor
  const wordBeforeCursor = getWordBeforeCursor(text, selectionStart);

  // Check if the word is a trigger
  if (wordBeforeCursor && shortcuts.hasOwnProperty(wordBeforeCursor)) {
    // Calculate positions for replacement
    const startPos = selectionStart - wordBeforeCursor.length;
    const replacement = shortcuts[wordBeforeCursor];

    // Perform the replacement
    replaceText(element, startPos, selectionStart, replacement);

    // Prevent the space or enter from being added
    event.preventDefault();
  }
}

// Handle paste events to include clipboard text
async function handlePaste(event) {
  if (!isEditableElement(event.target)) return;

  const element = event.target;

  // Get clipboard text
  const clipboardText = await navigator.clipboard.readText();

  // Get current cursor position and text
  const { text, selectionStart, selectionEnd } = getTextAndSelection(element);

  // Find the word before the cursor
  const wordBeforeCursor = getWordBeforeCursor(text, selectionStart);

  // Check if the word is a trigger
  if (wordBeforeCursor && shortcuts.hasOwnProperty(wordBeforeCursor)) {
    // Calculate positions for replacement
    const startPos = selectionStart - wordBeforeCursor.length;
    const replacement = shortcuts[wordBeforeCursor];

    // Modify the replacement to include clipboard text
    const modifiedReplacement = `${replacement} ${clipboardText}`; // Example: Add clipboard text after replacement

    // Perform the replacement
    replaceText(element, startPos, selectionStart, modifiedReplacement);

    // Prevent the default paste behavior
    event.preventDefault();
  }
}

// Helper function to check if an element is editable
function isEditableElement(element) {
  if (!element) return false;

  return (
    (element.tagName === "INPUT" &&
      (element.type === "text" || element.type === "email" || element.type === "search" || element.type === "url")) ||
    element.tagName === "TEXTAREA" ||
    element.getAttribute("contenteditable") === "true"
  );
}

// Helper function to get text and selection from an element
function getTextAndSelection(element) {
  let text, selectionStart, selectionEnd;

  if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
    text = element.value;
    selectionStart = element.selectionStart;
    selectionEnd = element.selectionEnd;
  } else if (element.getAttribute("contenteditable") === "true") {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    text = element.textContent;
    selectionStart = range.startOffset;
    selectionEnd = range.endOffset;
  }

  return { text, selectionStart, selectionEnd };
}

// Helper function to get the word before the cursor
function getWordBeforeCursor(text, cursorPos) {
  if (!text || cursorPos === 0) return null;

  // Find the start of the current word
  let startPos = cursorPos - 1;
  while (startPos >= 0 && !/\s/.test(text[startPos])) {
    startPos--;
  }
  startPos++; // Move past the whitespace

  // Extract the word
  const word = text.substring(startPos, cursorPos);

  // Only return if it starts with '/'
  return word.startsWith("/") ? word : null;
}

// Helper function to replace text in an element
function replaceText(element, startPos, endPos, replacement) {
  if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
    const originalValue = element.value;
    element.value = originalValue.substring(0, startPos) + replacement + originalValue.substring(endPos);

    // Set cursor position after the replacement
    const newPosition = startPos + replacement.length;
    element.setSelectionRange(newPosition, newPosition);
  } else if (element.getAttribute("contenteditable") === "true") {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    // Get the text node where the cursor is
    const textNode = range.startContainer;

    if (textNode.nodeType === Node.TEXT_NODE) {
      const originalText = textNode.nodeValue;
      textNode.nodeValue = originalText.substring(0, startPos) + replacement + originalText.substring(endPos);

      // Set cursor position after the replacement
      const newRange = document.createRange();
      newRange.setStart(textNode, startPos + replacement.length);
      newRange.setEnd(textNode, startPos + replacement.length);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  }

  // Dispatch input event to ensure framework compatibility
  const inputEvent = new Event("input", { bubbles: true });
  element.dispatchEvent(inputEvent);
}

// Add mutation observer to handle dynamically added elements
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "childList") {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // If a new editable element is added, make sure our listeners work on it
          if (isEditableElement(node)) {
            node.addEventListener("input", handleInput, true);
            node.addEventListener("keydown", handleKeyDown, true);
          }
        }
      }
    }
  }
});

// Start observing the document
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Debug logging function (remove in production)
function debugLog(message, data) {
  if (typeof data !== "undefined") {
    console.log(`[TextShortcuts] ${message}:`, data);
  } else {
    console.log(`[TextShortcuts] ${message}`);
  }
}
