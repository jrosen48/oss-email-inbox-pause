# Deployment Guide

This guide covers deploying the OSS Email Inbox Pause system to production.

## Architecture Overview

For production, you need:
1. **Backend service**: Hosted on a cloud platform with HTTPS
2. **Database**: PostgreSQL (recommended) or MySQL
3. **Add-in files**: Served via HTTPS (can be same as backend or CDN)
4. **Domain**: Optional but recommended

## Option 1: Deploy to Railway (Recommended - Free Tier)

[Railway](https://railway.app/) offers a generous free tier and simple deployment.

### 1.1 Prerequisites

- GitHub account
- Railway account (sign up at railway.app)

### 1.2 Prepare Repository

```bash
cd oss-email-inbox-pause
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository and push
gh repo create oss-email-inbox-pause --public
git remote add origin https://github.com/yourusername/oss-email-inbox-pause.git
git push -u origin main
```

### 1.3 Deploy Backend to Railway

1. Go to [railway.app](https://railway.app/)
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. Choose your `oss-email-inbox-pause` repository
5. Railway will detect the Node.js app

### 1.4 Configure Backend

1. In Railway dashboard, click on your service
2. Go to **Variables** tab
3. Add environment variables:
   ```
   PORT=3000
   NODE_ENV=production
   BACKEND_URL=https://your-app.railway.app
   AZURE_CLIENT_ID=your-client-id
   AZURE_CLIENT_SECRET=your-client-secret
   AZURE_TENANT_ID=common
   CLIENT_STATE_SECRET=your-random-secret
   JWT_SECRET=your-jwt-secret
   GRAPH_API_ENDPOINT=https://graph.microsoft.com/v1.0
   ```

4. Add PostgreSQL database:
   - In Railway, click **New**
   - Select **Database** > **PostgreSQL**
   - Railway automatically adds `DATABASE_URL` variable

5. Set root directory:
   - Go to **Settings** > **Build**
   - Set **Root Directory**: `backend`

6. Deploy:
   - Railway automatically deploys on push
   - Get your URL from **Settings** > **Domains** (e.g., `your-app.railway.app`)

### 1.5 Update Azure AD Redirect URIs

1. Go to Azure Portal > Your App Registration > **Authentication**
2. Add new redirect URI: `https://your-app.railway.app/auth/callback`
3. Save

### 1.6 Deploy Add-in

For the add-in, you have two options:

#### Option A: Serve from Backend (Simpler)

1. Copy add-in dist files to backend:
   ```bash
   cd add-in
   npm run build
   mkdir -p ../backend/public
   cp -r dist/* ../backend/public/
   ```

2. Update backend server.js to serve static files:
   ```javascript
   app.use(express.static('public'));
   ```

3. Update manifest.xml URLs to use Railway URL:
   ```xml
   <SourceLocation DefaultValue="https://your-app.railway.app/taskpane.html"/>
   ```

#### Option B: Deploy to Netlify/Vercel (Separate)

1. Build add-in:
   ```bash
   cd add-in
   npm run build
   ```

2. Deploy to Netlify:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

3. Update manifest.xml with Netlify URL

## Option 2: Deploy to Azure App Service

### 2.1 Create Azure Resources

```bash
# Install Azure CLI
brew install azure-cli  # Mac
# or download from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

# Login
az login

# Create resource group
az group create --name oss-inbox-pause-rg --location eastus

# Create App Service plan
az appservice plan create \
  --name oss-inbox-pause-plan \
  --resource-group oss-inbox-pause-rg \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --resource-group oss-inbox-pause-rg \
  --plan oss-inbox-pause-plan \
  --name oss-inbox-pause \
  --runtime "NODE|18-lts"
```

### 2.2 Create Azure Database for PostgreSQL

```bash
az postgres flexible-server create \
  --resource-group oss-inbox-pause-rg \
  --name oss-inbox-pause-db \
  --location eastus \
  --admin-user dbadmin \
  --admin-password YourSecurePassword123! \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32
```

### 2.3 Configure App Settings

```bash
az webapp config appsettings set \
  --resource-group oss-inbox-pause-rg \
  --name oss-inbox-pause \
  --settings \
    NODE_ENV=production \
    BACKEND_URL=https://oss-inbox-pause.azurewebsites.net \
    AZURE_CLIENT_ID=your-client-id \
    AZURE_CLIENT_SECRET=your-client-secret \
    AZURE_TENANT_ID=common \
    DATABASE_URL=your-postgres-connection-string \
    CLIENT_STATE_SECRET=your-secret \
    JWT_SECRET=your-jwt-secret
```

### 2.4 Deploy Code

```bash
cd backend
zip -r ../backend.zip .
az webapp deployment source config-zip \
  --resource-group oss-inbox-pause-rg \
  --name oss-inbox-pause \
  --src ../backend.zip
```

## Option 3: Deploy to Render

1. Go to [render.com](https://render.com/)
2. Click **New** > **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: oss-inbox-pause
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

5. Add environment variables (same as Railway)
6. Add PostgreSQL database (Render provides this)

## Post-Deployment Steps

### 1. Update Manifest

Update `add-in/manifest.xml` with production URLs:

```xml
<SourceLocation DefaultValue="https://your-production-url.com/taskpane.html"/>
```

Update all other URLs in manifest.

### 2. Update Add-in Config

Update `add-in/src/taskpane/taskpane.js`:

```javascript
const CONFIG = {
  backendUrl: 'https://your-production-backend.com',
  azureClientId: 'your-client-id',
  scopes: ['Mail.ReadWrite', 'Mail.ReadWrite.Shared']
};
```

Rebuild:
```bash
cd add-in
npm run build
```

### 3. Test Production Deployment

1. Sideload the updated manifest
2. Test pause/unpause functionality
3. Send test email to verify webhooks work
4. Check backend logs for errors

### 4. Monitor Subscription Renewals

The backend has a cron job that runs every 6 hours to renew subscriptions. Verify it's working:

```bash
# Check logs for "Running subscription renewal job..."
```

## Production Considerations

### Security

1. **HTTPS Only**: Ensure all URLs use HTTPS
2. **Environment Variables**: Never commit secrets to Git
3. **Rate Limiting**: Consider adding rate limiting to API endpoints
4. **CORS**: Configure CORS to only allow your add-in domain

### Database

1. **Backups**: Enable automated backups
2. **Connection Pooling**: Use connection pooling in production
3. **Migrations**: Run migrations on deployment

### Monitoring

1. **Application Logs**: Set up log aggregation (e.g., LogRocket, Datadog)
2. **Uptime Monitoring**: Use UptimeRobot or similar
3. **Error Tracking**: Consider Sentry for error tracking

### Scaling

For high usage:
1. **Database**: Upgrade to larger instance
2. **Backend**: Enable autoscaling
3. **Caching**: Add Redis for token caching
4. **CDN**: Serve add-in files from CDN

## Custom Domain (Optional)

### Using Cloudflare (Free)

1. Buy domain (e.g., Namecheap, Google Domains)
2. Add to Cloudflare
3. Update DNS:
   ```
   CNAME  @  your-app.railway.app
   ```
4. Enable "Always Use HTTPS" in Cloudflare
5. Update all URLs to use your domain

## Publishing to Microsoft AppSource (Optional)

To make your add-in publicly available:

1. Create Microsoft Partner Center account
2. Prepare submission:
   - Privacy policy URL
   - Support URL
   - Terms of use
   - App screenshots
3. Submit manifest for validation
4. Microsoft reviews (1-2 weeks)
5. Once approved, appears in Office Store

See: https://learn.microsoft.com/en-us/office/dev/store/submit-to-appsource-via-partner-center

## Maintenance

### Regular Tasks

1. **Renew Azure AD client secret** (before expiration)
2. **Update dependencies** regularly for security patches
3. **Monitor subscription renewals** - check logs for failures
4. **Database cleanup** - remove old/inactive users periodically

### Troubleshooting

#### Webhooks Not Working

1. Check `BACKEND_URL` is correct and publicly accessible
2. Verify webhook endpoint returns 202 for notifications
3. Check Azure AD permissions are granted
4. Review backend logs for webhook errors

#### Authentication Failing

1. Verify Azure AD client ID/secret are correct
2. Check redirect URIs match exactly
3. Ensure API permissions are granted and consented

#### Database Errors

1. Check `DATABASE_URL` is correct
2. Verify database is accessible from backend
3. Run migrations if schema is outdated

## Cost Estimates

### Free Tier (Personal Use)
- **Railway/Render**: Free tier
- **Database**: Railway/Render PostgreSQL (free)
- **Total**: $0/month

### Paid Tier (Multiple Users)
- **Backend**: Railway Pro ($5/month) or Azure B1 ($13/month)
- **Database**: Railway Pro ($5/month) or Azure Basic ($5/month)
- **Domain**: $10-15/year
- **Total**: ~$10-20/month

Compare to Boomerang: $160/year = $13.33/month

## Support

For deployment issues:
- Railway: https://railway.app/help
- Azure: https://docs.microsoft.com/azure/
- Render: https://render.com/docs

Report bugs: GitHub Issues
