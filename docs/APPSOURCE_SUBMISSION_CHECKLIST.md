# AppSource Submission Checklist

Use this checklist to ensure your submission is complete and ready for Microsoft review.

## Pre-Submission Requirements

### ✅ Completed Items

- [x] **Azure AD App Registration**
  - Client ID: `a6fc8ff3-d18b-4d22-86a2-ed7cf95ec535`
  - API Permissions: `Mail.ReadWrite`, `Mail.ReadWrite.Shared`
  - Redirect URIs configured

- [x] **Backend Deployment**
  - Railway: https://oss-email-inbox-pause-production.up.railway.app
  - Health check working: `/health`
  - Database: PostgreSQL
  - Cost protection: Trial plan with $5 credit

- [x] **Add-in Files**
  - Manifest.xml updated with unique GUID
  - Icons created (16x16, 32x32, 64x64, 80x80, 128x128)
  - Built and deployed to Railway

- [x] **Documentation**
  - GitHub Pages enabled: https://jrosen48.github.io/oss-email-inbox-pause/
  - Privacy Policy: https://jrosen48.github.io/oss-email-inbox-pause/PRIVACY.html
  - Terms of Use: https://jrosen48.github.io/oss-email-inbox-pause/TERMS.html
  - Support: https://jrosen48.github.io/oss-email-inbox-pause/SUPPORT.html

- [x] **Monetization**
  - GitHub Sponsors configured
  - Donation link in add-in UI
  - Free pricing model

### 📋 TODO Before Submission

- [ ] **Microsoft Partner Center Account**
  - Register at: https://partner.microsoft.com/dashboard
  - Choose: Individual Account (recommended)
  - Complete profile information
  - Verify email address
  - Accept agreements (MPN Agreement, App Developer Agreement)
  - Wait for approval (1-2 days)

- [ ] **Screenshots**
  - Take 3-5 screenshots using mockup: `docs/screenshot-mockup.html`
  - Save in: `docs/screenshots/`
  - Required screenshots:
    - [ ] Active state (inbox not paused)
    - [ ] Paused state (inbox paused with count)
    - [ ] Full Outlook integration view
    - [ ] (Optional) Paused folder with emails
    - [ ] (Optional) Settings/info screen

- [ ] **Test Manifest**
  - Validate manifest.xml: https://appsource.microsoft.com/en-us/marketplace/apps?page=1&product=office
  - Test all URLs in manifest are accessible
  - Verify icons load correctly

## Submission Information

### Basic Info

| Field | Value |
|-------|-------|
| **App Name** | Inbox Pause |
| **App ID** | aa6a4920-6003-f751-33c8-e45ecc948822 |
| **Version** | 1.0.0.0 |
| **Publisher** | Joshua Rosenberg |
| **Category** | Productivity |
| **Pricing** | Free |

### URLs

| Type | URL |
|------|-----|
| **App URL** | https://oss-email-inbox-pause-production.up.railway.app |
| **Support** | https://jrosen48.github.io/oss-email-inbox-pause/SUPPORT.html |
| **Privacy** | https://jrosen48.github.io/oss-email-inbox-pause/PRIVACY.html |
| **Terms** | https://jrosen48.github.io/oss-email-inbox-pause/TERMS.html |
| **GitHub** | https://github.com/jrosen48/oss-email-inbox-pause |

### Description

**Short Description (80 chars max):**
```
Pause your inbox to focus - free, open-source alternative to Boomerang
```

**Long Description:**
```
Temporarily pause incoming emails to focus on important work. Free, open-source alternative to Boomerang's inbox pause. New emails are automatically moved to a 'Paused Emails' folder and returned to your inbox when you're ready. No email content is accessed - only folder operations. Perfect for deep work sessions, meetings, or when you need uninterrupted focus time.

Key Features:
• One-click pause/resume for your inbox
• Automatic email sorting to "Paused Emails" folder
• No email content access - only folder operations
• Works with Outlook Web and Desktop
• 100% free and open source
• Privacy-focused with secure Microsoft authentication
• Self-hostable for complete control

How It Works:
1. Click "Pause Inbox" in the add-in
2. New emails are automatically moved to a "Paused Emails" folder
3. Focus on your work without interruptions
4. Click "Resume" when ready - all paused emails return to inbox

Perfect For:
✓ Deep work sessions
✓ Important meetings
✓ Focused project time
✓ Email-free mornings or afternoons
✓ Anyone who pays $180/year for Boomerang

Privacy & Security:
• Open source - verify the code yourself
• No email content is read or stored
• Only folder operations and metadata
• Microsoft OAuth authentication
• Self-hostable option available

Support:
This is a free, community-supported project. Help keep it running:
• GitHub Sponsors: https://github.com/sponsors/jrosen48
• Report issues: https://github.com/jrosen48/oss-email-inbox-pause/issues
• Source code: https://github.com/jrosen48/oss-email-inbox-pause

Why This Add-in?
Boomerang charges $180/year for inbox pause. This add-in provides the same core functionality for free, with complete transparency and privacy control.
```

### Keywords (5-7 keywords)

```
inbox pause, email management, productivity, focus, boomerang alternative, open source, email organization
```

### Support Contact

| Field | Value |
|-------|-------|
| **Email** | jrosenb8@utk.edu |
| **Website** | https://jrosen48.github.io/oss-email-inbox-pause/ |

## Submission Steps

1. **Log into Partner Center**
   - Go to: https://partner.microsoft.com/dashboard/office/overview
   - Navigate to: Office Store → Overview → Create a new app

2. **Upload Manifest**
   - Upload: `/Users/jrosenb8/oss-email-inbox-pause/add-in/dist/manifest.xml`
   - System will validate and extract metadata

3. **Add Screenshots**
   - Upload 3-5 PNG/JPG screenshots
   - From: `docs/screenshots/`
   - Recommended resolution: 1366x768

4. **Fill Out Listing Details**
   - Copy information from this checklist
   - Add all URLs (support, privacy, terms)
   - Select category: Productivity
   - Select platforms: Outlook Web, Outlook Desktop

5. **Testing Notes for Microsoft**
```
TEST ACCOUNT INFO:
This add-in requires users to authenticate with their own Microsoft account. No test account needed - reviewers should use their own Outlook account.

TESTING STEPS:
1. Install the add-in in Outlook
2. Click "Inbox Pause" button in the ribbon
3. Click "Pause Inbox" - this creates a "Paused Emails" folder
4. Send a test email to your own account
5. Verify the email moves to "Paused Emails" folder automatically
6. Click "Resume Inbox" to return emails to inbox

AZURE AD APP:
Client ID: a6fc8ff3-d18b-4d22-86a2-ed7cf95ec535
Permissions: Mail.ReadWrite, Mail.ReadWrite.Shared

BACKEND:
Deployed on Railway: https://oss-email-inbox-pause-production.up.railway.app
Health check: https://oss-email-inbox-pause-production.up.railway.app/health

NOTE: This is an open-source project. Source code available at:
https://github.com/jrosen48/oss-email-inbox-pause
```

6. **Submit for Review**
   - Review all information
   - Click "Submit for validation"
   - Wait 3-5 business days for Microsoft review

## After Submission

### What Happens Next

1. **Automatic Validation** (immediate)
   - Manifest validation
   - URL accessibility checks
   - Icon and asset validation

2. **Manual Review** (3-5 business days)
   - Microsoft tests your add-in
   - Reviews privacy policy and terms
   - Checks functionality matches description

3. **Possible Outcomes**
   - ✅ **Approved**: Add-in goes live on AppSource
   - ⚠️ **Changes Requested**: Fix issues and resubmit
   - ❌ **Rejected**: Major issues - review feedback and resubmit

### If Approved

- Add-in appears on AppSource within 24 hours
- Users can install directly from Outlook
- You'll receive a notification email
- Update your README with AppSource link

### If Changes Requested

- Review feedback in Partner Center
- Make necessary fixes
- Update manifest/documentation
- Resubmit for review

## Post-Approval Checklist

- [ ] Update README with AppSource install link
- [ ] Announce on GitHub
- [ ] Share on social media (optional)
- [ ] Monitor GitHub Issues for user feedback
- [ ] Plan future updates based on feedback

## Resources

- **Partner Center Dashboard**: https://partner.microsoft.com/dashboard
- **Office Add-ins Validation**: https://learn.microsoft.com/en-us/office/dev/store/validation-policies
- **AppSource Requirements**: https://learn.microsoft.com/en-us/office/dev/store/office-store-submission-checklist
- **Manifest Documentation**: https://learn.microsoft.com/en-us/office/dev/add-ins/develop/add-in-manifests

---

**Last Updated**: January 12, 2026
**Manifest GUID**: aa6a4920-6003-f751-33c8-e45ecc948822
