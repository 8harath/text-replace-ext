# Changelog

All notable changes to TextShortcuts will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-11-18

### 🚀 Added

#### Keyboard Shortcuts
- **Ctrl+Shift+S** (Cmd+Shift+S on Mac) to open extension popup
- **Ctrl+Shift+Space** (Cmd+Shift+Space on Mac) to show quick insert menu
- Keyboard navigation in quick insert menu (Arrow keys, Enter, Esc)

#### Quick Insert Menu
- Beautiful floating menu to browse and insert shortcuts
- Real-time search and filtering
- Keyboard navigation support
- Shows shortcut categories and usage statistics
- Sorted by most-used shortcuts
- Dark mode support

#### Context Menu Integration
- Right-click on any text field → "Insert TextShortcut"
- Shows up to 10 most recently used shortcuts
- One-click insertion from context menu
- Automatically updates when shortcuts change

#### Custom Variables
- Define your own variables (e.g., `{username}`, `{company}`)
- Variables are processed along with built-in date/time variables
- Manage custom variables from settings
- Perfect for repetitive personal information

#### Usage Statistics (Local Only)
- Track how many times each shortcut is used
- See your most-used shortcuts
- Last used timestamp for each shortcut
- Total replacements counter
- Can be disabled in settings for privacy
- All data stored locally, never sent anywhere

#### Shortcut Categories
- Organize shortcuts into categories (Personal, Professional, etc.)
- Filter and sort by category
- Categories shown in quick insert menu
- Default categories: Personal, Professional, Variables, Uncategorized

#### Enhanced Shortcut Format
- Shortcuts now support metadata (category, usage count, timestamps)
- Backwards compatible with simple string format
- Automatic migration from old format to new format

### 📈 Improved

- **Performance**: Optimized shortcut matching algorithm
- **UX**: Added visual feedback with toast notifications
- **Accessibility**: Better keyboard navigation support
- **UI**: Polished quick insert menu design
- **Code Quality**: Enhanced JSDoc documentation throughout

### 🔧 Changed

- Updated to version 2.1.0
- Manifest updated with new permissions (`contextMenus`)
- Content script now injects CSS for UI elements
- Background worker enhanced with statistics tracking

### 🐛 Fixed

- Improved handling of shortcuts with special characters
- Better support for contenteditable elements
- Fixed cursor position in some edge cases

---

## [2.0.0] - 2025-11-18

### 🚀 Added

#### Dynamic Variables
- Added 10 built-in variables for dates and times
  - `{date}`: Current date
  - `{time}`: Current time
  - `{datetime}`: Date and time combined
  - `{year}`, `{month}`, `{day}`: Date components
  - `{hour}`, `{minute}`, `{second}`: Time components
  - `{timestamp}`: Unix timestamp

#### Performance Improvements
- Implemented debounced input handling (10ms delay)
- Increased buffer size to 50 characters
- Optimized text replacement algorithms
- Better memory management

#### Code Quality
- Added comprehensive JSDoc documentation
- Improved error handling with try-catch blocks
- Better code organization and modularity
- Consistent error logging with [TextShortcuts] prefix

#### Documentation
- Completely rewrote README.md
- Created CONTRIBUTING.md
- Added USER_GUIDE.md
- Added MIT LICENSE
- Included FAQs and troubleshooting

### 📈 Improved

- Enhanced support for contenteditable elements
- Better event dispatching for framework compatibility
- More input types supported (tel)
- Improved case sensitivity handling

### 🔧 Changed

- Updated manifest to version 2.0.0
- Content script runs at `document_idle` for better performance
- Settings now include `caseSensitive` option

---

## [1.0.0] - 2025-11-17

### 🚀 Initial Release

#### Core Features
- Real-time text replacement as you type
- Trigger-based shortcuts (e.g., `/mail` → email)
- Works across all input fields and textareas
- Support for contenteditable elements

#### Settings
- Enable/disable extension globally
- Theme support (Light/Dark/System)
- Site-specific control (whitelist/blacklist)
- Case-sensitive matching option

#### User Interface
- Clean, modern popup interface
- Search shortcuts functionality
- Add/Edit/Delete shortcuts
- Material Design icons

#### Data Management
- Import/Export shortcuts as JSON
- Local storage only (100% private)
- Real-time sync across tabs
- No external servers or tracking

---

## Upgrade Notes

### 2.0.0 → 2.1.0

- **New Permissions**: The extension now requests `contextMenus` permission for right-click menu integration
- **Data Migration**: Shortcuts are automatically migrated from string format to object format (backwards compatible)
- **Settings**: New settings added: `showQuickInsertMenu` and `trackStatistics` (both enabled by default)
- **Keyboard Shortcuts**: You may need to configure keyboard shortcuts in chrome://extensions/shortcuts

### 1.0.0 → 2.0.0

- **Backwards Compatible**: All existing shortcuts continue to work
- **New Variables**: Start using `{date}`, `{time}`, etc. in your shortcuts
- **Performance**: Extension is now faster and more efficient
- **Documentation**: Check the new USER_GUIDE.md for detailed usage instructions

---

## Future Plans

### Planned for 2.2.0
- [ ] Sync shortcuts across devices (Chrome Sync API)
- [ ] Regex pattern support for advanced matching
- [ ] Shortcut folders for better organization
- [ ] Template library with pre-made shortcuts
- [ ] Backup reminder and auto-backup
- [ ] Statistics dashboard

### Planned for 3.0.0
- [ ] Multi-language support
- [ ] Cloud backup options (optional)
- [ ] Team/organization features
- [ ] Advanced snippet editor
- [ ] Conditional replacements
- [ ] Rich text formatting support

---

## Links

- **Repository**: https://github.com/8harath/text-replace-ext
- **Issues**: https://github.com/8harath/text-replace-ext/issues
- **Documentation**: [README.md](README.md) | [USER_GUIDE.md](USER_GUIDE.md)
- **License**: MIT

---

**Made with ❤️ by Bharath K**
