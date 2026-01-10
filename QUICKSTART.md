# Quick Start Guide

Get up and running in 15 minutes!

## 1. Azure AD Setup (5 minutes)

1. Go to [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations
2. Click **New registration**
3. Name: "OSS Inbox Pause", Account type: "Any", Click **Register**
4. Copy **Application (client) ID**
5. Go to **Certificates & secrets** → **New client secret** → Copy the secret value
6. Go to **API permissions** → **Add permission** → **Microsoft Graph**:
   - Add **Delegated**: `Mail.ReadWrite`, `Mail.ReadWrite.Shared`, `User.Read`
   - Add **Application**: `Mail.ReadWrite`
   - Click **Grant admin consent**

## 2. Backend Setup (3 minutes)

```bash
cd ~/oss-email-inbox-pause/backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=3000
NODE_ENV=development
BACKEND_URL=http://localhost:3000
AZURE_CLIENT_ID=your-client-id-here
AZURE_CLIENT_SECRET=your-client-secret-here
AZURE_TENANT_ID=common
DATABASE_URL=sqlite:./database.sqlite
CLIENT_STATE_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
GRAPH_API_ENDPOINT=https://graph.microsoft.com/v1.0
EOF

# Start server
npm run dev
```

Backend should now be running on http://localhost:3000

## 3. Add-in Setup (3 minutes)

```bash
cd ~/oss-email-inbox-pause/add-in

# Install dependencies
npm install

# Update config file
# Edit src/taskpane/taskpane.js and replace:
# - YOUR_AZURE_CLIENT_ID_HERE with your Azure client ID

# Update manifest
# Edit manifest.xml and replace:
# - YOUR_AZURE_APP_ID_HERE with your Azure client ID (2 places)
# - Generate new GUID for <Id> element

# Start dev server
npm start
```

Add-in should now be running on https://localhost:3001

## 4. Sideload Add-in (2 minutes)

1. Go to https://aka.ms/olksideload in your browser
2. Sign in with your Office 365 account
3. Click **Upload** under Custom Add-ins
4. Select `manifest.xml` from the add-in directory
5. Click **Upload**

## 5. Test It (2 minutes)

1. Open Outlook (web or desktop)
2. Look for "Inbox Pause" button in the ribbon
3. Click it to open the task pane
4. Click **Pause Inbox**
5. Send yourself a test email
6. Email should go to "Paused Emails" folder, not inbox!
7. Click **Resume Inbox** to return emails

## Troubleshooting

### Certificate Warning
When accessing https://localhost:3001, accept the self-signed certificate warning.

### Backend Not Starting
- Check if port 3000 is available
- Verify .env file has correct Azure credentials
- Run `npm install` again

### Add-in Not Loading
- Clear Office cache (Mac: `~/Library/Containers/com.microsoft.Outlook/Data/Library/Caches/`)
- Try removing and re-sideloading the manifest
- Check browser console for errors (right-click in task pane → Inspect)

### Webhooks Not Working
For development, webhooks won't work with localhost. Use ngrok:
```bash
brew install ngrok
ngrok http 3000
# Update BACKEND_URL in .env with the ngrok HTTPS URL
# Restart backend
```

## Next Steps

- See [docs/SETUP.md](docs/SETUP.md) for detailed setup
- See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for deploying to production
- Read [README.md](README.md) for full documentation

## Cost Comparison

- **Boomerang**: $160/year
- **This (self-hosted)**: $0/year (free tiers) or ~$10-20/month for production

Enjoy your free inbox pause! 🎉
