# Text Replace Extension

A browser extension to quickly and efficiently replace text patterns on web pages. This project focuses on providing a customizable, easy-to-use interface for managing text replacements, supporting advanced matching, and ensuring seamless integration with modern web browsers.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Supported Browsers](#supported-browsers)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Features

- Replace words, phrases, or patterns on any web page in real time.
- Support for regular expressions and case sensitivity.
- Easy-to-use interface for creating and managing replacement rules.
- Import/export rules as JSON for sharing and backup.
- Minimal performance impact.
- Works on most modern browsers.

---

## Installation

### From the Chrome Web Store / Firefox Add-ons

1. Visit the extension page on your browser's store.
2. Click "Add to Chrome" or "Add to Firefox" (or equivalent).
3. Confirm the installation.

### Manual Installation (Development)

1. Clone this repository:
   ```bash
   git clone https://github.com/8harath/text-replace-ext.git
   ```
2. Open your browser's extension management page:
    - Chrome: `chrome://extensions/`
    - Firefox: `about:debugging#/runtime/this-firefox`
3. Enable "Developer mode".
4. Click "Load unpacked" and select the cloned repository folder.

---

## Usage

1. Click the extension icon in your browser toolbar.
2. Use the popup interface to add new replacement rules.
    - Enter the pattern to match (plain text or regex).
    - Enter the replacement text.
    - Choose case sensitivity if needed.
3. Save your rule. All matching text on web pages will be replaced automatically.
4. Manage, edit, or delete rules at any time from the extension popup.

---

## Configuration

- **Adding Rules:**  
  Use the "+" button in the popup to add a new rule. You can specify whether your pattern is a regular expression.
- **Editing/Removing Rules:**  
  Click the edit or delete button next to each rule.
- **Import/Export:**  
  Use the import/export buttons to backup or share your rules in JSON format.

---

## Supported Browsers

- Google Chrome (latest versions)
- Mozilla Firefox (latest versions)
- Microsoft Edge (Chromium-based)
- Other Chromium-based browsers

---

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (for building/minification, if applicable)
- A modern browser for testing

### Project Structure

- `src/` - Main JavaScript source files for popup, content scripts, and background logic
- `manifest.json` - Extension manifest file
- `styles/` - CSS files for UI styling
- `popup.html`, `options.html` - UI pages

### Building

If build scripts exist (e.g., using Webpack or similar):

```bash
npm install
npm run build
```

Otherwise, the extension can be loaded directly from source.

---

## Contributing

Contributions are welcome! Please open issues for bug reports and feature requests. To contribute code:

1. Fork this repository.
2. Create your feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/YourFeature`
5. Open a pull request.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for more details.

---

## Acknowledgements

- Inspired by existing text replacement browser extensions.
- Thanks to all contributors and users for their support and feedback.

---

**Enjoy customizing your web experience with Text Replace Extension!**
