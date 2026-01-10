# Setup Guide

This guide will walk you through setting up the OSS Email Inbox Pause system from scratch.

## Prerequisites

- Node.js 18+ and npm
- Office 365 subscription with Outlook
- Azure account (free tier is sufficient)
- PostgreSQL database (or use SQLite for development)

## Part 1: Azure AD Application Registration

### 1.1 Create Azure AD Application

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the details:
   - **Name**: `OSS Inbox Pause`
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: Leave blank for now (we'll add it later)
5. Click **Register**

### 1.2 Note Your Application IDs

After registration, note these values (you'll need them later):
- **Application (client) ID**: Found on the Overview page
- **Directory (tenant) ID**: Found on the Overview page

### 1.3 Create Client Secret

1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description: `Backend Service`
4. Set expiration: 24 months (or as per your policy)
5. Click **Add**
6. **Important**: Copy the secret **Value** immediately - you won't be able to see it again!

### 1.4 Configure API Permissions

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**
5. Add these permissions:
   - `Mail.ReadWrite`
   - `Mail.ReadWrite.Shared`
   - `User.Read`
6. Click **Add permissions**
7. Click **Add a permission** again
8. Select **Microsoft Graph** > **Application permissions**
9. Add:
   - `Mail.ReadWrite` (for backend webhook operations)
10. Click **Add permissions**
11. Click **Grant admin consent for [Your Organization]** (requires admin)

### 1.5 Configure Redirect URIs

1. Go to **Authentication**
2. Click **Add a platform** > **Single-page application**
3. Add redirect URIs:
   - `https://localhost:3001` (development)
   - Your production URL (when deploying)
4. Under **Implicit grant and hybrid flows**, enable:
   - Access tokens
   - ID tokens
5. Click **Configure**

### 1.6 Expose an API

1. Go to **Expose an API**
2. Click **Add a scope**
3. Accept the default Application ID URI or customize it
4. Create a scope:
   - **Scope name**: `access_as_user`
   - **Who can consent**: Admins and users
   - **Admin consent display name**: `Access OSS Inbox Pause as user`
   - **Admin consent description**: `Allows the app to access inbox pause on behalf of the user`
   - **User consent display name**: `Access your inbox pause settings`
   - **User consent description**: `Allows the app to control inbox pause for your emails`
   - **State**: Enabled
5. Click **Add scope**

## Part 2: Backend Setup

### 2.1 Install Dependencies

```bash
cd backend
npm install
```

### 2.2 Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
BACKEND_URL=https://localhost:3000

# Azure AD Configuration (from Part 1)
AZURE_CLIENT_ID=your-client-id-from-azure
AZURE_CLIENT_SECRET=your-client-secret-from-azure
AZURE_TENANT_ID=common

# Database Configuration
# For development with SQLite:
DATABASE_URL=sqlite:./database.sqlite

# For production with PostgreSQL:
# DATABASE_URL=postgresql://user:password@host:5432/database

# Security (generate random strings)
CLIENT_STATE_SECRET=generate-random-string-here
JWT_SECRET=another-random-string-here

# Microsoft Graph
GRAPH_API_ENDPOINT=https://graph.microsoft.com/v1.0
```

### 2.3 Generate Random Secrets

Generate secure random strings for `CLIENT_STATE_SECRET` and `JWT_SECRET`:

```bash
# On Mac/Linux:
openssl rand -hex 32

# Or use Node:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.4 Initialize Database

```bash
npm run migrate
```

This creates the necessary database tables.

### 2.5 Start Backend Server

```bash
# Development mode (with hot reload):
npm run dev

# Or production mode:
npm start
```

The server should start on `http://localhost:3000`.

Test the health endpoint:
```bash
curl http://localhost:3000/health
```

## Part 3: Add-in Setup

### 3.1 Install Dependencies

```bash
cd add-in
npm install
```

### 3.2 Configure Add-in

#### Update manifest.xml

Edit `add-in/manifest.xml`:

1. Replace `YOUR_AZURE_APP_ID_HERE` with your Azure Application (client) ID:
   ```xml
   <WebApplicationInfo>
     <Id>your-client-id-here</Id>
     <Resource>api://localhost:3001/your-client-id-here</Resource>
   ```

2. Update the `<Id>` element at the top to a unique GUID:
   ```xml
   <Id>12345678-1234-1234-1234-123456789abc</Id>
   ```
   Generate a GUID at [guidgenerator.com](https://www.guidgenerator.com/) or use:
   ```bash
   node -e "console.log(require('crypto').randomUUID())"
   ```

#### Update taskpane.js

Edit `add-in/src/taskpane/taskpane.js`:

1. Replace `YOUR_AZURE_CLIENT_ID_HERE` with your Azure Application ID:
   ```javascript
   const CONFIG = {
     backendUrl: 'http://localhost:3000',
     azureClientId: 'your-client-id-here',
     scopes: ['Mail.ReadWrite', 'Mail.ReadWrite.Shared']
   };
   ```

### 3.3 Start Add-in Development Server

```bash
npm start
```

This starts a webpack dev server on `https://localhost:3001`.

**Note**: You'll see a certificate warning - this is normal for development. Accept it to continue.

## Part 4: Sideload the Add-in

### 4.1 For Outlook on Mac and Web

1. Open your browser and go to [https://aka.ms/olksideload](https://aka.ms/olksideload)
2. Sign in with your Office 365 account
3. Click **Upload** (under "Custom Addins")
4. Select the `manifest.xml` file from your `add-in/` directory
5. Click **Upload**

The add-in should now appear in your Outlook ribbon!

### 4.2 For Outlook Desktop (Windows)

1. Open Outlook desktop
2. Go to **File** > **Info** > **Manage Add-ins**
3. This opens the Office Add-ins store in your browser
4. Follow steps from 4.1

### 4.3 Troubleshooting Sideload

If you encounter issues:

1. **Certificate Error**: Make sure you've accepted the self-signed certificate by visiting `https://localhost:3001` in your browser
2. **Manifest Validation Error**: Use the [Office Add-in Validator](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/troubleshoot-manifest)
3. **Add-in Not Appearing**: Clear Office cache:
   - Mac: `~/Library/Containers/com.microsoft.Outlook/Data/Library/Caches/`
   - Windows: `%LOCALAPPDATA%\Microsoft\Office\16.0\Wef\`

## Part 5: Test the Add-in

### 5.1 Open the Add-in

1. In Outlook, look for the "Inbox Pause" button in the ribbon
2. Click it to open the task pane
3. You should see the Inbox Pause interface

### 5.2 Test Pause Functionality

1. Click **Pause Inbox**
2. The add-in will:
   - Authenticate you with Azure AD (popup)
   - Create a webhook subscription
   - Move current inbox emails to "Paused Emails" folder
3. Send yourself a test email from another account
4. The email should automatically be moved to "Paused Emails" folder
5. Click **Resume Inbox** to return all emails to inbox

## Part 6: Debugging

### Backend Debugging

View logs in the terminal where you ran `npm run dev`.

Common issues:
- **401 Unauthorized**: Check Azure AD app permissions
- **500 Internal Server Error**: Check backend logs for details
- **Webhook not triggering**: Verify `BACKEND_URL` is publicly accessible (see Part 7)

### Add-in Debugging

#### On Mac:

1. Enable developer tools:
   ```bash
   defaults write com.microsoft.Outlook OfficeWebAddinDeveloperExtras -bool true
   ```
2. Right-click in the task pane and select **Inspect Element**

#### On Web:

1. Right-click in the task pane > **Inspect**
2. Check Console tab for errors

## Part 7: Making Webhooks Work

**Important**: Microsoft Graph webhooks require a publicly accessible HTTPS endpoint. `localhost` won't work for webhooks!

For development, use a tunneling service:

### Option A: ngrok (Recommended for Testing)

```bash
# Install ngrok
brew install ngrok  # Mac
# or download from https://ngrok.com/

# Start ngrok tunnel
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`) and update your `.env`:
```env
BACKEND_URL=https://abc123.ngrok.io
```

Restart the backend server.

### Option B: localtunnel

```bash
npm install -g localtunnel
lt --port 3000
```

### Option C: Deploy to Cloud (Production)

For production use, deploy the backend to a cloud service (see DEPLOYMENT.md).

## Part 8: Verify Everything Works

### 8.1 Check Backend Health

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-09T...",
  "version": "0.1.0"
}
```

### 8.2 Check Webhook Endpoint

```bash
curl https://your-ngrok-url.ngrok.io/webhooks/graph
```

Expected response:
```json
{
  "message": "Webhook endpoint is active",
  "timestamp": "..."
}
```

### 8.3 Test Full Flow

1. Open Outlook add-in
2. Click "Pause Inbox"
3. Wait for success message
4. Send test email from another account
5. Verify email appears in "Paused Emails" folder (not inbox)
6. Click "Resume Inbox"
7. Verify email returns to inbox

## Next Steps

- See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- See [../README.md](../README.md) for usage guide
- Check backend logs for any errors

## Getting Help

- Review [Microsoft Graph webhook documentation](https://learn.microsoft.com/en-us/graph/change-notifications-delivery-webhooks)
- Check [Office Add-ins documentation](https://learn.microsoft.com/en-us/office/dev/add-ins/outlook/outlook-add-ins-overview)
- Open an issue on GitHub if you encounter problems
