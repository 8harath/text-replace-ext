# TextShortcuts - Browser Extension

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Manifest](https://img.shields.io/badge/manifest-v3-orange.svg)

A powerful browser extension that automatically replaces trigger text with custom content as you type, featuring dynamic variables, theme support, and site-specific control.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
  - [Creating Shortcuts](#creating-shortcuts)
  - [Using Variables](#using-variables)
  - [Managing Settings](#managing-settings)
- [Advanced Features](#advanced-features)
- [Supported Browsers](#supported-browsers)
- [Development](#development)
- [Contributing](#contributing)
- [Privacy](#privacy)
- [License](#license)
- [Support](#support)

---

## Features

### Core Functionality
- **Real-time Text Replacement**: Automatically replaces trigger text (e.g., `/mail`) with your custom content as you type
- **Dynamic Variables**: Use built-in variables like `{date}`, `{time}`, `{datetime}` for dynamic content
- **Smart Trigger Detection**: Works across all input fields, textareas, and contenteditable elements
- **Case Sensitivity**: Optional case-sensitive matching for triggers

### User Interface
- **Modern UI**: Clean, intuitive interface with Material Design icons
- **Dark/Light Theme**: System-aware theme with manual override options
- **Search Functionality**: Quickly find shortcuts by trigger or content
- **Import/Export**: Backup and share your shortcuts as JSON

### Advanced Control
- **Site-Specific Control**: Enable shortcuts on all sites, whitelist specific sites, or blacklist certain domains
- **Enable/Disable Toggle**: Quickly turn the extension on/off
- **Debounced Input**: Optimized performance with minimal impact on typing

### Privacy & Performance
- **100% Local**: All data stored locally in your browser
- **No Data Collection**: No analytics, no tracking, no external servers
- **Lightweight**: Minimal memory footprint and CPU usage
- **Secure**: No external dependencies or network requests

---

## Installation

### From Source (Development)

1. Clone this repository:
   ```bash
   git clone https://github.com/8harath/text-replace-ext.git
   cd text-replace-ext
   ```

2. Load the extension in your browser:

   **Chrome/Edge/Brave:**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the `text-replace-ext` folder

   **Firefox:**
   - Navigate to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select any file in the `text-replace-ext` folder

3. The extension icon should appear in your browser toolbar

---

## Quick Start

1. **Click the extension icon** in your browser toolbar
2. **Add your first shortcut:**
   - Click the "+" button
   - Enter a trigger (e.g., `/email`)
   - Enter your replacement text (e.g., `john.doe@example.com`)
   - Click "Save"
3. **Try it out:**
   - Open any text field on any website
   - Type `/email` followed by space or enter
   - Watch it automatically expand to your email address!

---

## Usage

### Creating Shortcuts

1. Click the TextShortcuts icon in your toolbar
2. Click the **+ button** to add a new shortcut
3. Enter your **trigger** (e.g., `/sig`, `/addr`, `/phone`)
4. Enter your **replacement text**
5. Click **Save**

**Tips:**
- Triggers typically start with `/` for easy recognition
- Keep triggers short and memorable
- Use descriptive triggers that relate to the content

### Using Variables

TextShortcuts supports dynamic variables that are replaced with current values:

| Variable | Description | Example Output |
|----------|-------------|----------------|
| `{date}` | Current date | `11/18/2025` |
| `{time}` | Current time | `2:30:45 PM` |
| `{datetime}` | Date and time | `11/18/2025, 2:30:45 PM` |
| `{year}` | Current year | `2025` |
| `{month}` | Current month (01-12) | `11` |
| `{day}` | Current day (01-31) | `18` |
| `{hour}` | Current hour (00-23) | `14` |
| `{minute}` | Current minute (00-59) | `30` |
| `{second}` | Current second (00-59) | `45` |
| `{timestamp}` | Unix timestamp | `1700318445000` |

**Example Shortcuts:**
```
Trigger: /date
Content: {date}

Trigger: /timestamp
Content: Meeting on {date} at {time}

Trigger: /log
Content: [{datetime}] Log entry:
```

### Managing Settings

Click the **settings icon** (⚙️) to access:

#### General Tab
- **Enable Extension**: Master on/off switch
- **Theme**: Choose Light, Dark, or System (Auto)
- **Import/Export**: Backup or restore your shortcuts

#### Scope Tab
- **All websites**: Shortcuts work everywhere (default)
- **Only on selected websites**: Whitelist specific domains
- **Except on selected websites**: Blacklist specific domains

Add domains in the format: `example.com` or `mail.google.com`

#### About Tab
- Extension information
- Privacy policy
- Developer contact

---

## Advanced Features

### Site-Specific Configuration

**Whitelist Mode** (shortcuts only work on listed sites):
1. Go to Settings → Scope tab
2. Select "Only on selected websites"
3. Add domains (e.g., `gmail.com`, `docs.google.com`)
4. Save settings

**Blacklist Mode** (shortcuts don't work on listed sites):
1. Go to Settings → Scope tab
2. Select "Except on selected websites"
3. Add domains to exclude
4. Save settings

### Import/Export Shortcuts

**Export:**
1. Settings → General → Export
2. Copy the JSON to clipboard
3. Save to a file for backup

**Import:**
1. Settings → General → Import
2. Paste your JSON data
3. Click "Import" (will overwrite existing shortcuts)

### Search and Filter

Use the search bar in the main popup to quickly find shortcuts:
- Search by trigger text
- Search by replacement content
- Results update in real-time

---

## Supported Browsers

- ✅ Google Chrome (latest)
- ✅ Microsoft Edge (Chromium-based)
- ✅ Brave Browser
- ✅ Opera
- ✅ Vivaldi
- ✅ Mozilla Firefox (with minor adaptations)
- ✅ Any Chromium-based browser

**Minimum Versions:**
- Chrome/Edge/Brave: Version 88+
- Firefox: Version 109+ (for Manifest V3 support)

---

## Development

### Project Structure

```
text-replace-ext/
├── manifest.json          # Extension manifest (Manifest V3)
├── popup.html            # Popup UI structure
├── popup.js              # Popup logic
├── popup.css             # Popup styling
├── content.js            # Content script (text replacement)
├── background.js         # Background service worker
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

### Key Files

**content.js** (content.js:1)
- Handles text replacement in web pages
- Monitors input events and detects triggers
- Processes variables and performs replacements

**background.js** (background.js:1)
- Service worker for extension lifecycle
- Manages storage operations
- Handles message passing

**popup.js** (popup.js:1)
- Popup UI logic
- Shortcut management
- Settings control

### Technologies Used

- **Manifest V3**: Latest Chrome extension standard
- **Chrome Storage API**: Local data persistence
- **Vanilla JavaScript**: No external dependencies
- **CSS Variables**: Theme support
- **Material Symbols**: Icon library

### Building from Source

No build process required! The extension runs directly from source:

```bash
git clone https://github.com/8harath/text-replace-ext.git
cd text-replace-ext
# Load in browser as described in Installation section
```

### Development Tips

1. **Enable Debug Logging**: Uncomment the debug logs in `content.js:514`
2. **Hot Reload**: Use an extension like "Extension Reloader" for faster development
3. **Test Across Sites**: Test on various websites (Gmail, Google Docs, Reddit, etc.)
4. **Check Console**: Open DevTools → Console for error messages

---

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### How to Contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages: `git commit -m 'Add amazing feature'`
6. Push to your fork: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Reporting Issues

Found a bug? Have a feature request?

1. Check existing [Issues](https://github.com/8harath/text-replace-ext/issues)
2. Create a new issue with:
   - Clear description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Browser version and OS

---

## Privacy

**TextShortcuts is committed to your privacy:**

- ✅ **No data collection**: We don't collect any user data
- ✅ **No analytics**: No tracking or usage statistics
- ✅ **No external servers**: All processing happens locally
- ✅ **No network requests**: Extension works 100% offline
- ✅ **Local storage only**: Data never leaves your device

**Permissions Explained:**
- `storage`: Store shortcuts and settings locally
- `activeTab`: Access current tab for text replacement

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Bharath K

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
...
```

---

## Support

### Getting Help

- **Documentation**: Check this README and [USER_GUIDE.md](USER_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/8harath/text-replace-ext/issues)
- **Email**: [8harath.k@gmail.com](mailto:8harath.k@gmail.com)

### Frequently Asked Questions

**Q: Why isn't my shortcut working?**
- Check if the extension is enabled (Settings → General)
- Verify the trigger text is correct (case-sensitive if enabled)
- Check if the site is in your blacklist

**Q: Can I sync shortcuts across devices?**
- Currently, shortcuts are stored locally only
- Use Import/Export to manually transfer shortcuts
- Chrome Sync integration is planned for future versions

**Q: Does this work in password fields?**
- No, for security reasons, shortcuts don't work in password fields

**Q: Can I use regex patterns?**
- Not currently, but this feature is planned for future releases

**Q: How many shortcuts can I create?**
- Limited only by browser storage (typically several thousand)

---

## Roadmap

### Planned Features
- [ ] Chrome Sync support for cross-device shortcuts
- [ ] Regular expression support for advanced matching
- [ ] Keyboard shortcuts for quick shortcut insertion
- [ ] Shortcut categories and tags
- [ ] Usage statistics and analytics (local only)
- [ ] Multi-language support
- [ ] Cloud backup options (optional)
- [ ] Snippet templates library

---

## Acknowledgements

- **Icons**: [Material Symbols](https://fonts.google.com/icons)
- **Inspiration**: TextExpander, AutoHotkey, and similar tools
- **Community**: Thanks to all contributors and users

---

## Developer

**Bharath K**
- Email: [8harath.k@gmail.com](mailto:8harath.k@gmail.com)
- GitHub: [@8harath](https://github.com/8harath)

---

**Made with ❤️ for productivity enthusiasts**

⭐ Star this repo if you find it useful!

---

**Version**: 2.0.0
**Last Updated**: November 18, 2025
**License**: MIT
**Status**: Active Development
