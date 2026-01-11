# Privacy Policy

**Last updated: January 11, 2026**

## Introduction

OSS Email Inbox Pause ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our Outlook add-in.

## Information We Collect

### Authentication Information
- **Microsoft Account Information**: When you authenticate with Microsoft, we receive your email address and user ID to identify you.
- **Access Tokens**: We temporarily store OAuth tokens to access Microsoft Graph API on your behalf.

### Email Data
- **Folder Information**: We access your Outlook folders to create and manage the "Paused" folder.
- **Email Metadata**: We access email metadata (sender, subject, received date) only when moving emails to/from the paused folder.
- **No Email Content**: We do NOT read, store, or analyze the content of your emails.

## How We Use Your Information

We use the collected information solely to:
- Authenticate you with Microsoft services
- Move emails to and from your "Paused" folder
- Maintain your pause state (enabled/disabled)
- Renew Microsoft Graph API subscriptions

## Data Storage

- **Database**: We store your user ID, email address, pause state, and folder IDs in a secure PostgreSQL database hosted on Railway.
- **Access Tokens**: Tokens are stored temporarily and encrypted.
- **Email Content**: We do NOT store any email content.

## Data Sharing

We do NOT:
- Sell your data to third parties
- Share your data with advertisers
- Use your data for marketing purposes

We may share data only when:
- Required by law
- Necessary to protect our rights or safety

## Third-Party Services

We use the following third-party services:
- **Railway**: Database and application hosting
- **Microsoft Graph API**: Email operations
- **Microsoft Azure AD**: Authentication

Each service has its own privacy policy:
- Railway Privacy Policy: https://railway.app/legal/privacy
- Microsoft Privacy Statement: https://privacy.microsoft.com/privacystatement

## Data Retention

- **Active Users**: Data is retained as long as you use the add-in
- **Inactive Users**: Data may be deleted after 90 days of inactivity
- **Account Deletion**: You can request deletion by contacting us

## Your Rights

You have the right to:
- Access your stored data
- Request data deletion
- Revoke access to your Microsoft account
- Export your data

## Security

We implement industry-standard security measures:
- HTTPS encryption for all communications
- Encrypted database connections
- Secure token storage
- Regular security updates

## Changes to This Policy

We may update this Privacy Policy. We will notify users of significant changes by:
- Updating the "Last updated" date
- Posting a notice in the add-in
- Sending an email notification (for major changes)

## Contact Us

For privacy concerns or data requests:
- **Email**: jrosenb8@utk.edu
- **GitHub Issues**: https://github.com/jrosen48/oss-email-inbox-pause/issues

## Children's Privacy

This service is not intended for children under 13. We do not knowingly collect data from children.

## International Users

Your data may be transferred to and processed in the United States, where our servers are located.

---

By using OSS Email Inbox Pause, you agree to this Privacy Policy.
