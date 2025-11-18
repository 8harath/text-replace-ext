# Contributing to TextShortcuts

Thank you for considering contributing to TextShortcuts! We welcome contributions from everyone, whether you're fixing a bug, adding a feature, improving documentation, or suggesting ideas.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Contributing Code](#contributing-code)
  - [Improving Documentation](#improving-documentation)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

---

## Code of Conduct

This project adheres to a simple code of conduct:

- **Be respectful**: Treat everyone with respect and kindness
- **Be collaborative**: Work together to improve the project
- **Be constructive**: Provide helpful feedback
- **Be patient**: Remember that everyone was a beginner once

---

## How Can I Contribute?

### Reporting Bugs

Found a bug? Help us fix it!

1. **Search existing issues** to avoid duplicates
2. **Create a new issue** with:
   - Clear, descriptive title
   - Steps to reproduce the bug
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - Browser version and OS
   - Extension version

**Bug Report Template:**
```markdown
**Description:**
Brief description of the bug

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. Type...
4. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Extension Version: 2.0.0

**Screenshots:**
[Attach screenshots if applicable]
```

### Suggesting Features

Have an idea? We'd love to hear it!

1. **Search existing issues** for similar suggestions
2. **Create a feature request** with:
   - Clear use case
   - Expected behavior
   - Why this feature would be useful
   - Potential implementation approach (optional)

**Feature Request Template:**
```markdown
**Feature Description:**
What feature would you like to see?

**Use Case:**
Why is this feature needed?

**Proposed Solution:**
How should this feature work?

**Alternatives Considered:**
What alternatives have you considered?

**Additional Context:**
Add any other context, screenshots, or examples
```

### Contributing Code

Ready to code? Awesome!

1. **Fork the repository**
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```
3. **Make your changes** following our [coding guidelines](#coding-guidelines)
4. **Test thoroughly** on multiple browsers
5. **Commit your changes** with clear messages
6. **Push to your fork**
7. **Open a Pull Request**

### Improving Documentation

Documentation improvements are always welcome!

- Fix typos or grammatical errors
- Clarify confusing sections
- Add examples or tutorials
- Improve code comments
- Translate documentation

---

## Development Setup

### Prerequisites

- A Chromium-based browser (Chrome, Edge, Brave) or Firefox
- Git
- Text editor (VS Code, Sublime, etc.)
- Basic knowledge of JavaScript, HTML, CSS

### Setup Steps

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/text-replace-ext.git
   cd text-replace-ext
   ```

2. **Load the extension in your browser:**

   **Chrome/Edge/Brave:**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `text-replace-ext` folder

   **Firefox:**
   - Navigate to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select any file in the folder

3. **Make changes and reload:**
   - Edit the source files
   - Click the reload icon on the extension card
   - Test your changes

---

## Coding Guidelines

### JavaScript Style

- **Use modern JavaScript (ES6+)**
- **Use const/let** instead of var
- **Use template literals** for string interpolation
- **Use arrow functions** for callbacks
- **Add JSDoc comments** for functions
- **Handle errors gracefully** with try-catch
- **Use meaningful variable names**

**Example:**
```javascript
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
  };

  let processedText = text;
  for (const [variable, value] of Object.entries(variables)) {
    processedText = processedText.replace(new RegExp(escapeRegex(variable), "g"), value);
  }

  return processedText;
}
```

### Code Organization

- **Keep functions small and focused** (single responsibility)
- **Group related functions together**
- **Add comments for complex logic**
- **Use consistent naming conventions**:
  - Functions: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Classes: `PascalCase`
  - Private variables: `_privateVar` (prefix with underscore)

### Error Handling

Always handle errors gracefully:

```javascript
function replaceText(element, startPos, endPos, replacement) {
  try {
    // Your code here
  } catch (error) {
    console.error("[TextShortcuts] Error replacing text:", error);
    // Optionally show user-friendly message
  }
}
```

### Performance Considerations

- **Debounce frequent operations**
- **Use event delegation** when possible
- **Avoid unnecessary DOM manipulations**
- **Cache selectors** instead of querying repeatedly
- **Use efficient algorithms** (avoid nested loops when possible)

### Browser Compatibility

- Test on multiple browsers (Chrome, Edge, Firefox)
- Use Chrome Extension APIs appropriately
- Avoid browser-specific features without polyfills
- Check for API availability before use:
  ```javascript
  if (typeof chrome !== "undefined" && chrome.runtime) {
    // Safe to use Chrome APIs
  }
  ```

---

## Commit Guidelines

### Commit Message Format

Use clear, descriptive commit messages:

```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat: Add variable support for dynamic date/time insertion

fix: Resolve cursor position issue in contenteditable elements

docs: Update README with variable usage examples

refactor: Simplify text replacement logic in content.js

perf: Add debouncing to input event handler for better performance
```

### Best Practices

- **Use present tense** ("Add feature" not "Added feature")
- **Use imperative mood** ("Move cursor to..." not "Moves cursor to...")
- **Keep first line under 72 characters**
- **Reference issues** when applicable (`Fixes #123`)
- **Be descriptive** but concise

---

## Pull Request Process

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] All tests pass (if applicable)
- [ ] Documentation is updated
- [ ] Tested on multiple browsers
- [ ] No console errors or warnings
- [ ] Commit messages are clear and descriptive

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
How was this tested?
- [ ] Chrome
- [ ] Edge
- [ ] Firefox
- [ ] Other: ___

## Screenshots
[If applicable]

## Related Issues
Fixes #123
Relates to #456

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have tested my changes
- [ ] I have updated the documentation
- [ ] No new warnings or errors
```

### Review Process

1. **Automated checks** will run (if configured)
2. **Maintainers will review** your code
3. **Feedback will be provided** (if needed)
4. **Changes may be requested**
5. **Approval and merge** once everything looks good

### After Merge

- Your contribution will be credited
- Changes will be included in the next release
- You'll be added to the contributors list

---

## Testing

### Manual Testing Checklist

Test your changes thoroughly:

#### Basic Functionality
- [ ] Shortcuts trigger correctly
- [ ] Text replacement works in input fields
- [ ] Text replacement works in textareas
- [ ] Text replacement works in contenteditable elements
- [ ] Cursor position is correct after replacement
- [ ] Variables are processed correctly

#### UI Testing
- [ ] Popup opens and displays correctly
- [ ] Shortcuts can be added/edited/deleted
- [ ] Search functionality works
- [ ] Settings can be changed and saved
- [ ] Import/Export works correctly
- [ ] Theme switching works

#### Edge Cases
- [ ] Empty triggers are rejected
- [ ] Special characters in triggers
- [ ] Very long replacement text
- [ ] Multiple rapid triggers
- [ ] Shortcuts with overlapping triggers

#### Browser Testing
- [ ] Chrome (latest)
- [ ] Edge (latest)
- [ ] Firefox (latest, if applicable)

### Test Sites

Test on various popular websites:
- Gmail (mail.google.com)
- Google Docs (docs.google.com)
- Reddit (reddit.com)
- Twitter/X (twitter.com)
- Notion (notion.so)

---

## Questions?

If you have questions about contributing:

- **Check the README**: Most common questions are answered there
- **Search existing issues**: Someone may have asked before
- **Create a discussion**: Use GitHub Discussions for questions
- **Email the maintainer**: [8harath.k@gmail.com](mailto:8harath.k@gmail.com)

---

## Recognition

All contributors will be recognized in:
- README Contributors section
- Release notes
- GitHub contributors page

---

**Thank you for contributing to TextShortcuts!**

Your contributions help make this extension better for everyone.

---

*Last Updated: November 18, 2025*
