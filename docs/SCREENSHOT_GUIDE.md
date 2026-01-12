# Screenshot Guide for AppSource Submission

AppSource requires 3-5 high-quality screenshots showing your add-in in action.

## Screenshot Requirements

- **Resolution**: 1366x768 or similar (16:9 aspect ratio preferred)
- **Format**: PNG or JPG
- **Count**: 3-5 screenshots
- **Content**: Show the add-in interface and key features

## Required Screenshots

### 1. Add-in Taskpane - Active State
**Filename**: `screenshot-1-active.png`

Show the add-in taskpane when inbox is active:
- Status indicator showing green "active" state
- "Pause Inbox" button visible
- "0 emails paused" counter
- Clean, professional appearance

### 2. Add-in Taskpane - Paused State
**Filename**: `screenshot-2-paused.png`

Show the add-in taskpane when inbox is paused:
- Status indicator showing red "paused" state
- "Resume Inbox" button visible
- Counter showing paused emails (e.g., "5 emails paused")
- Support/donation link visible

### 3. Outlook Integration
**Filename**: `screenshot-3-integration.png`

Show the add-in integrated in Outlook:
- Full Outlook window with add-in taskpane open
- Shows how it appears in the Outlook interface
- Ribbon button or menu item (if applicable)

### 4. Paused Folder (Optional)
**Filename**: `screenshot-4-folder.png`

Show the "Paused Emails" folder in action:
- Outlook folder list with "Paused Emails" folder visible
- Emails inside the paused folder
- Demonstrates the core functionality

### 5. Settings/Info (Optional)
**Filename**: `screenshot-5-info.png`

Show additional features:
- Privacy information
- Support links
- GitHub Sponsors integration

## How to Take Screenshots

### Option 1: Development Environment
1. Run backend locally: `cd backend && npm run dev`
2. Run add-in locally: `cd add-in && npm start`
3. Sideload in Outlook Web with personal Microsoft account
4. Use browser screenshot tools or macOS Screenshot (Cmd+Shift+4)

### Option 2: After AppSource Approval
1. Install your own add-in from AppSource
2. Take screenshots in real Outlook environment
3. Update AppSource listing with real screenshots

### Option 3: Mockups (Quick Start)
1. Open `docs/screenshot-mockup.html` in browser
2. Use browser screenshot tools to capture
3. Edit as needed in image editor

## Screenshot Tips

- Use a clean, uncluttered email environment
- Blur or redact any sensitive information
- Ensure good contrast and readability
- Show the add-in in a realistic context
- Include annotations or callouts if helpful

## Where to Save

Save all screenshots in: `/Users/jrosenb8/oss-email-inbox-pause/docs/screenshots/`

Name them according to the filenames above for easy reference.
