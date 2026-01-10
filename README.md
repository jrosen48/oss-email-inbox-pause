# OSS Email Inbox Pause

An open-source alternative to Boomerang's inbox pause functionality for Outlook. Automatically pauses incoming emails by moving them to a "Paused" folder, then returns them to your inbox when you're ready.

## Features

- **Real-time Inbox Pause**: Automatically move incoming emails to a paused folder
- **Cross-platform**: Works on Outlook Mac Desktop and Outlook Web
- **Simple UI**: Clean toggle button directly in Outlook
- **Secure**: Uses Microsoft Graph API with OAuth authentication
- **Cost-effective**: Free and open source (vs $160/year for Boomerang)

## Architecture

- **Backend**: Node.js + Express service with Microsoft Graph webhooks
- **Frontend**: Outlook Add-in with Office.js
- **Database**: PostgreSQL or SQLite for user state management

## Prerequisites

- Office 365 subscription with Outlook
- Azure AD account (for app registration)
- Node.js 18+ and npm
- (Optional) PostgreSQL database or use SQLite

## Quick Start

### 1. Azure AD Setup

Register an application in Azure AD:
1. Go to [Azure Portal](https://portal.azure.com) > Azure Active Directory > App registrations
2. Create new registration: "OSS Inbox Pause"
3. Configure API permissions: `Mail.ReadWrite`
4. Create client secret
5. Note your Client ID, Tenant ID, and Client Secret

See `docs/SETUP.md` for detailed instructions.

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Azure AD credentials
npm run migrate  # Set up database
npm run dev      # Start development server
```

### 3. Add-in Setup

```bash
cd add-in
npm install
npm start        # Start development server
# Navigate to https://aka.ms/olksideload to sideload the add-in
```

## Project Structure

```
oss-email-inbox-pause/
├── backend/          # Node.js backend service
│   ├── src/
│   │   ├── server.js
│   │   ├── graph/    # Microsoft Graph integration
│   │   ├── db/       # Database models and migrations
│   │   └── routes/   # API endpoints
│   └── package.json
├── add-in/           # Outlook Add-in
│   ├── manifest.xml
│   ├── src/
│   │   ├── taskpane/ # UI components
│   │   └── commands/ # Ribbon commands
│   └── package.json
└── docs/             # Documentation
```

## Development

### Backend Development
```bash
cd backend
npm run dev       # Start with hot reload
npm test          # Run tests
npm run lint      # Lint code
```

### Add-in Development
```bash
cd add-in
npm start         # Start dev server and sideload
npm run build     # Build for production
```

## Testing

1. Start the backend server
2. Sideload the add-in in Outlook
3. Click the "Inbox Pause" button in the ribbon
4. Send yourself a test email - it should be moved to the Paused folder
5. Click "Resume" to return emails to inbox

## Deployment

See `docs/DEPLOYMENT.md` for deployment instructions.

### Recommended Hosting Options
- **Backend**: Railway, Render, Azure App Service
- **Database**: Railway PostgreSQL, Azure Database
- **Add-in**: Same backend or GitHub Pages

## How It Works

1. User clicks "Pause Inbox" in Outlook
2. Add-in sends request to backend
3. Backend creates Microsoft Graph webhook subscription for user's mailbox
4. When new email arrives, Graph sends webhook notification to backend
5. Backend checks if user has pause enabled
6. If paused, backend moves email to "Paused" folder via Graph API
7. When user clicks "Resume", all paused emails return to inbox

## License

MIT License - see LICENSE file

## Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## Acknowledgments

- Inspired by Boomerang for Outlook
- Built with Microsoft Graph API and Office.js
- Uses MSAL for authentication

## Support

- Issues: [GitHub Issues](https://github.com/yourusername/oss-email-inbox-pause/issues)
- Documentation: See `docs/` folder
- Microsoft Graph API: [Documentation](https://learn.microsoft.com/en-us/graph/)

## Roadmap

- [ ] Scheduled unpause (set specific time)
- [ ] VIP sender whitelist
- [ ] Batch email release
- [ ] Statistics dashboard
- [ ] Mobile support (iOS/Android Outlook apps)
