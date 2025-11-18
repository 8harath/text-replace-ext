# TextShortcuts User Guide

Welcome to TextShortcuts! This guide will help you get the most out of the extension.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Your First Shortcut](#creating-your-first-shortcut)
3. [Using Shortcuts](#using-shortcuts)
4. [Dynamic Variables](#dynamic-variables)
5. [Managing Shortcuts](#managing-shortcuts)
6. [Settings and Configuration](#settings-and-configuration)
7. [Import and Export](#import-and-export)
8. [Tips and Best Practices](#tips-and-best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Use Cases and Examples](#use-cases-and-examples)

---

## Getting Started

### Installation

1. Install the extension from your browser's extension store (or load from source)
2. Look for the TextShortcuts icon in your browser toolbar
3. Click the icon to open the popup interface

### First Launch

When you first install TextShortcuts, you'll see some default shortcuts:
- `/mail` → example@gmail.com
- `/name` → John Doe
- `/phone` → (123) 456-7890
- `/addr` → 123 Main St, Anytown, USA

These are just examples - feel free to edit or delete them!

---

## Creating Your First Shortcut

Let's create a shortcut for your email address:

1. **Open the extension popup** by clicking the icon
2. **Click the + button** (top right)
3. **Enter your trigger:** `/myemail`
4. **Enter your replacement text:** `your.email@example.com`
5. **Click Save**

That's it! Now whenever you type `/myemail` followed by space or enter, it will expand to your email address.

---

## Using Shortcuts

### Basic Usage

1. **Open any text field** on any website (Gmail, Twitter, Google Docs, etc.)
2. **Type your trigger** (e.g., `/myemail`)
3. **Press Space or Enter**
4. **Watch it expand!**

### What Works

Shortcuts work in:
- ✅ Input fields (text, email, search, URL, tel)
- ✅ Textareas
- ✅ Contenteditable elements (like Google Docs, Medium, etc.)
- ✅ Most web applications

### What Doesn't Work

Shortcuts don't work in:
- ❌ Password fields (for security)
- ❌ Some proprietary rich text editors
- ❌ Native desktop applications

---

## Dynamic Variables

TextShortcuts supports special variables that are replaced with current values:

### Available Variables

| Variable | Output Example | Description |
|----------|---------------|-------------|
| `{date}` | 11/18/2025 | Current date (locale format) |
| `{time}` | 2:30:45 PM | Current time (locale format) |
| `{datetime}` | 11/18/2025, 2:30:45 PM | Date and time |
| `{year}` | 2025 | Current year |
| `{month}` | 11 | Current month (01-12) |
| `{day}` | 18 | Current day (01-31) |
| `{hour}` | 14 | Current hour (00-23) |
| `{minute}` | 30 | Current minute (00-59) |
| `{second}` | 45 | Current second (00-59) |
| `{timestamp}` | 1700318445000 | Unix timestamp |

### Example Use Cases

**Meeting Notes Template:**
```
Trigger: /meeting
Content:
## Meeting Notes - {date}
Time: {time}
Attendees:
Notes:
```

**Log Entry:**
```
Trigger: /log
Content: [{datetime}]
```

**Email Signature with Date:**
```
Trigger: /sig
Content:
Best regards,
John Doe
Sent on {date}
```

**Dated Todo:**
```
Trigger: /todo
Content: - [ ] {date} -
```

---

## Managing Shortcuts

### Viewing Shortcuts

All your shortcuts are listed in the main popup view. Each shows:
- **Trigger text** (in bold)
- **First 50 characters** of replacement text
- **Edit and Delete buttons**

### Searching Shortcuts

Use the search bar at the top to filter shortcuts:
- Search by trigger text
- Search by content
- Results update as you type

### Editing Shortcuts

1. Click the **Edit** button on any shortcut
2. Modify the trigger or content
3. Click **Save**

**Note:** Changing the trigger creates a new shortcut and removes the old one.

### Deleting Shortcuts

1. Click the **Delete** button on any shortcut
2. Confirm the deletion
3. The shortcut is permanently removed

---

## Settings and Configuration

Click the **settings icon** (⚙️) to access configuration options.

### General Settings

**Enable Extension**
- Toggle to turn the extension on/off globally
- Useful for temporary disabling without removing the extension

**Theme**
- **Light**: Always use light theme
- **Dark**: Always use dark theme
- **System (Auto)**: Follow your system's theme preference

### Scope Settings

Control where shortcuts work:

**All websites (default)**
- Shortcuts work everywhere

**Only on selected websites (Whitelist)**
1. Select "Only on selected websites"
2. Add domains where shortcuts should work
3. Example: `gmail.com`, `docs.google.com`
4. Shortcuts will ONLY work on these sites

**Except on selected websites (Blacklist)**
1. Select "Except on selected websites"
2. Add domains where shortcuts should NOT work
3. Example: `banking-site.com`, `work-portal.com`
4. Shortcuts will work everywhere EXCEPT these sites

**Adding Sites:**
- Enter domain without `http://` or `https://`
- Examples: `gmail.com`, `reddit.com`, `docs.google.com`
- Click "Add" to include in the list

### About Tab

View information about:
- How the extension works
- Privacy policy
- Developer contact
- Version information

---

## Import and Export

### Exporting Shortcuts

**To backup your shortcuts:**

1. Settings → General → Export
2. Click "Copy to Clipboard"
3. Paste into a text file
4. Save the file (e.g., `my-shortcuts.json`)

**When to export:**
- Before major changes
- To share with others
- To transfer to another browser
- Regular backups

### Importing Shortcuts

**To restore or load shortcuts:**

1. Settings → General → Import
2. Paste your JSON data
3. Click "Import"
4. Confirm if you have existing shortcuts (will be overwritten)

**JSON Format:**
```json
{
  "/mail": "your.email@example.com",
  "/phone": "(123) 456-7890",
  "/sig": "Best regards,\nYour Name"
}
```

---

## Tips and Best Practices

### Choosing Triggers

**Good Triggers:**
- ✅ Start with `/` for easy recognition
- ✅ Short and memorable: `/mail`, `/phone`, `/addr`
- ✅ Descriptive: `/workemail`, `/homeemail`
- ✅ Consistent naming: `/gmail`, `/outlook`

**Avoid:**
- ❌ Very short triggers: `/e`, `/a` (too easy to trigger accidentally)
- ❌ Common words: `/the`, `/and`, `/is`
- ❌ Numbers only: `/123`

### Organizing Shortcuts

**Categories:**
Use prefixes to organize related shortcuts:
- `/work-` for work-related: `/work-email`, `/work-phone`
- `/home-` for personal: `/home-addr`, `/home-phone`
- `/code-` for code snippets: `/code-func`, `/code-loop`

### Common Shortcuts to Create

**Personal Information:**
- Email addresses
- Phone numbers
- Physical addresses
- Social media handles

**Professional:**
- Work email signature
- Meeting templates
- Project codes
- Common responses

**Productivity:**
- Date/time stamps
- Todo templates
- Log entry formats
- Meeting notes templates

**Development:**
- Code snippets
- Lorem ipsum text
- Test data
- Common commands

---

## Troubleshooting

### Shortcut Not Working

**Check these:**

1. **Is the extension enabled?**
   - Settings → General → Check "Enable Extension" is ON

2. **Is the trigger correct?**
   - Check for typos
   - Triggers are case-sensitive (if enabled in settings)
   - Make sure you typed it exactly as saved

3. **Is the site allowed?**
   - Check Settings → Scope
   - If using whitelist, make sure site is added
   - If using blacklist, make sure site is not blocked

4. **Did you press Space or Enter?**
   - Shortcuts trigger on Space or Enter key
   - Some shortcuts trigger as you type

5. **Is the field supported?**
   - Password fields don't support shortcuts (by design)
   - Some proprietary editors might not work

### Extension Not Loading

1. **Reload the extension:**
   - Go to `chrome://extensions/`
   - Click the reload icon on TextShortcuts

2. **Check for errors:**
   - Right-click extension icon → "Inspect popup"
   - Check console for errors

3. **Reinstall if needed:**
   - Remove the extension
   - Restart browser
   - Reinstall

### Cursor Position Wrong

If cursor position is incorrect after replacement:
- This is a known issue with some contenteditable fields
- Report the specific website to help us improve
- Workaround: Use arrow keys to reposition

### Import Failed

If import doesn't work:
- **Check JSON format**: Must be valid JSON
- **Use proper syntax**: `{"trigger": "content"}`
- **Escape special characters**: Use `\n` for newlines
- **No trailing commas**: Last item shouldn't have comma

---

## Use Cases and Examples

### For Email

```
/gmail → your.email@gmail.com
/work → firstname.lastname@company.com
/temp → tempmail+{timestamp}@gmail.com
/sig →
Best regards,
John Doe
Product Manager
john.doe@company.com
+1 (123) 456-7890
```

### For Development

```
/lorem → Lorem ipsum dolor sit amet, consectetur adipiscing elit.
/func → function functionName() {\n  // TODO: implement\n}
/log → console.log('[{datetime}]', )
/todo → // TODO: {date} -
/comment → /**\n * Description\n * @param {type} name - description\n */
```

### For Customer Support

```
/hello → Hello! Thank you for contacting us. How can I help you today?
/thanks → Thank you for your patience. Is there anything else I can help you with?
/ticket → Ticket #{timestamp} - Created on {datetime}
/followup → I'll follow up with you on {date} regarding this issue.
```

### For Social Media

```
/twitter → @yourusername
/linkedin → linkedin.com/in/yourprofile
/website → https://yourwebsite.com
/hashtags → #productivity #automation #textshortcuts
```

### For Students

```
/email → student.name@university.edu
/id → Student ID: 123456789
/citation → Author. ({year}). Title. Publisher.
/header →
Name: Your Name
Date: {date}
Course:
Assignment:
```

### For Writers

```
/draft → [DRAFT - {date}]
/edited → [Last edited: {datetime}]
/chapter →
## Chapter X
Date: {date}
Word Count:

/outline →
- Introduction
- Main Points
  - Point 1
  - Point 2
  - Point 3
- Conclusion
```

---

## Advanced Tips

### Multi-line Shortcuts

To create multi-line shortcuts in the interface:
- Just press Enter in the content field
- The extension preserves line breaks

### Using with Other Tools

**TextShortcuts works great with:**
- Grammar checkers (Grammarly, LanguageTool)
- Password managers (LastPass, 1Password)
- Clipboard managers
- Other productivity extensions

**Potential conflicts:**
- Other text expansion tools might conflict
- Disable one if you experience issues

### Performance Optimization

For best performance:
- Keep total shortcuts under 1000
- Avoid very long replacement text (>10,000 characters)
- Use specific triggers (not too short)
- Disable on sites where not needed (using blacklist)

---

## Privacy and Security

**Your data is safe:**
- All data stored locally in your browser
- No data sent to external servers
- No tracking or analytics
- Open source code (auditable)

**Best practices:**
- Don't store sensitive data in shortcuts (passwords, SSNs, etc.)
- Use for frequently-typed public information
- Export backups to secure location
- Review shortcuts regularly

---

## Keyboard Shortcuts

Currently, the extension uses:
- **Space** or **Enter**: Trigger shortcut expansion

Future versions may include:
- Global keyboard shortcut to open popup
- Quick insert menu
- Shortcut management hotkeys

---

## Getting Help

**If you need help:**

1. **Check this guide** - Most questions answered here
2. **Check the README** - Technical documentation
3. **GitHub Issues** - Report bugs or request features
4. **Email support** - [8harath.k@gmail.com](mailto:8harath.k@gmail.com)

---

## Version History

**Version 2.0.0** (Current)
- Added dynamic variable support ({date}, {time}, etc.)
- Improved performance with debouncing
- Enhanced error handling
- Better documentation
- Refactored codebase with JSDoc comments

**Version 1.0.0**
- Initial release
- Basic text replacement
- Import/Export functionality
- Theme support
- Site-specific control

---

**Happy typing with TextShortcuts!**

Save time, type less, do more.

---

*Last Updated: November 18, 2025*
*Version: 2.0.0*
