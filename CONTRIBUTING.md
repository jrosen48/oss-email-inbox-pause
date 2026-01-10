# Contributing to OSS Email Inbox Pause

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

Be respectful, inclusive, and considerate of others.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (OS, Outlook version, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Check if the feature has been suggested
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Potential implementation approach (optional)

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**:
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**:
   - Run backend tests: `cd backend && npm test`
   - Test manually with sideloaded add-in
   - Verify webhooks work correctly

5. **Commit your changes**:
   ```bash
   git commit -m "Add feature: description"
   ```
   Use conventional commits:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `refactor:` for code refactoring
   - `test:` for tests

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create Pull Request**:
   - Provide clear description
   - Reference related issues
   - Include screenshots if UI changes

## Development Setup

See [docs/SETUP.md](docs/SETUP.md) for detailed setup instructions.

Quick start:
```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev

# Add-in
cd add-in
npm install
npm start
```

## Project Structure

```
oss-email-inbox-pause/
├── backend/          # Node.js backend service
│   ├── src/
│   │   ├── server.js     # Express server
│   │   ├── graph/        # Microsoft Graph integration
│   │   ├── db/           # Database models
│   │   └── routes/       # API routes
│   └── package.json
├── add-in/           # Outlook Add-in
│   ├── src/
│   │   ├── taskpane/     # Task pane UI
│   │   └── commands/     # Ribbon commands
│   ├── manifest.xml      # Add-in manifest
│   └── package.json
└── docs/             # Documentation
```

## Coding Standards

### JavaScript

- Use ES6+ features
- Use `const` and `let`, not `var`
- Use async/await over callbacks
- Add JSDoc comments for functions
- Handle errors appropriately

Example:
```javascript
/**
 * Move a message to the paused folder
 * @param {string} accessToken - Graph API access token
 * @param {string} userId - User's Graph ID
 * @param {string} messageId - Message ID to move
 * @param {string} pausedFolderId - Destination folder ID
 * @returns {Promise<boolean>} Success status
 */
async function moveMessageToPaused(accessToken, userId, messageId, pausedFolderId) {
  try {
    // Implementation
  } catch (error) {
    console.error('Error moving message:', error);
    throw error;
  }
}
```

### Git Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and PRs when applicable

Good:
```
feat: Add VIP sender whitelist functionality

Implements #15. Allows users to specify senders whose emails
should not be paused even when inbox pause is active.
```

## Testing

### Backend Tests

```bash
cd backend
npm test
```

Write tests for:
- API endpoints
- Email operations
- Webhook handlers
- Database operations

### Manual Testing Checklist

- [ ] Backend health endpoint responds
- [ ] Add-in loads in Outlook
- [ ] Authentication works (popup shows, token acquired)
- [ ] Pause functionality moves emails to paused folder
- [ ] Webhooks trigger when new email arrives
- [ ] Resume functionality returns emails to inbox
- [ ] UI updates correctly
- [ ] Error messages display properly

## Documentation

Update documentation when:
- Adding new features
- Changing API endpoints
- Modifying setup/deployment process
- Fixing bugs that affect user experience

## Questions?

- Open an issue for questions
- Check existing issues and documentation first
- Be patient and respectful when asking for help

## Recognition

Contributors will be acknowledged in the README. Thank you for making this project better!
