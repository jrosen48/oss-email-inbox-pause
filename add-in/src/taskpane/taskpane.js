import * as msal from '@azure/msal-browser';

// Configuration
const CONFIG = {
  backendUrl: process.env.NODE_ENV === 'production'
    ? 'https://oss-email-inbox-pause-production.up.railway.app'
    : 'http://localhost:3000',
  azureClientId: 'a6fc8ff3-d18b-4d22-86a2-ed7cf95ec535',
  scopes: ['Mail.ReadWrite', 'Mail.ReadWrite.Shared']
};

// MSAL configuration with Nested App Authentication
const msalConfig = {
  auth: {
    clientId: CONFIG.azureClientId,
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  },
  system: {
    allowNativeBroker: true, // Enable NAA
    windowHashTimeout: 90000,
    iframeHashTimeout: 10000,
    loadFrameTimeout: 10000
  }
};

let msalInstance;
let accessToken = null;
let currentStatus = null;

// Initialize Office Add-in
Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    initialize();
  }
});

async function initialize() {
  try {
    // Initialize MSAL
    msalInstance = new msal.PublicClientApplication(msalConfig);
    await msalInstance.initialize();

    // Get access token
    accessToken = await getAccessToken();

    // Load initial status
    await refreshStatus();

    // Setup event listeners
    setupEventListeners();

    // Show app
    document.getElementById('loading').style.display = 'none';
    document.getElementById('app').classList.add('ready');
  } catch (error) {
    console.error('Initialization error:', error);
    showError('Failed to initialize. Please reload the add-in.');
  }
}

function setupEventListeners() {
  document.getElementById('toggle-button').addEventListener('click', handleToggle);
}

async function getAccessToken() {
  try {
    const accounts = msalInstance.getAllAccounts();

    if (accounts.length === 0) {
      // No cached account, need to sign in
      const loginResponse = await msalInstance.loginPopup({
        scopes: CONFIG.scopes
      });
      return loginResponse.accessToken;
    }

    // Try silent token acquisition
    const silentRequest = {
      scopes: CONFIG.scopes,
      account: accounts[0]
    };

    try {
      const response = await msalInstance.acquireTokenSilent(silentRequest);
      return response.accessToken;
    } catch (silentError) {
      if (silentError instanceof msal.InteractionRequiredAuthError) {
        // Silent acquisition failed, use popup
        const response = await msalInstance.acquireTokenPopup({
          scopes: CONFIG.scopes
        });
        return response.accessToken;
      }
      throw silentError;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error('Failed to authenticate. Please try again.');
  }
}

async function refreshStatus() {
  try {
    const response = await fetch(`${CONFIG.backendUrl}/api/pause/status`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get status');
    }

    currentStatus = await response.json();
    updateUI(currentStatus);
  } catch (error) {
    console.error('Error refreshing status:', error);
    showError('Failed to load status. Please check your connection.');
  }
}

function updateUI(status) {
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const pauseCount = document.getElementById('pause-count');
  const toggleButton = document.getElementById('toggle-button');

  if (status.isPaused) {
    statusDot.className = 'status-dot paused';
    statusText.textContent = 'Inbox is paused';
    pauseCount.textContent = `${status.pausedCount} email${status.pausedCount !== 1 ? 's' : ''} paused`;
    toggleButton.className = 'toggle-button resume';
    toggleButton.textContent = 'Resume Inbox';
  } else {
    statusDot.className = 'status-dot active';
    statusText.textContent = 'Inbox is active';
    pauseCount.textContent = status.pausedCount > 0
      ? `${status.pausedCount} email${status.pausedCount !== 1 ? 's' : ''} in paused folder`
      : 'No emails paused';
    toggleButton.className = 'toggle-button pause';
    toggleButton.textContent = 'Pause Inbox';
  }
}

async function handleToggle() {
  const button = document.getElementById('toggle-button');
  button.disabled = true;
  hideError();

  try {
    const endpoint = currentStatus.isPaused
      ? `${CONFIG.backendUrl}/api/pause/disable`
      : `${CONFIG.backendUrl}/api/pause/enable`;

    button.textContent = currentStatus.isPaused ? 'Resuming...' : 'Pausing...';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Operation failed');
    }

    const result = await response.json();

    // Show success message
    const action = currentStatus.isPaused ? 'resumed' : 'paused';
    Office.context.ui.displayDialogAsync(
      `Inbox ${action} successfully! ${result.movedCount} emails ${action === 'paused' ? 'moved to paused folder' : 'returned to inbox'}.`,
      { height: 30, width: 30 }
    );

    // Refresh status
    await refreshStatus();
  } catch (error) {
    console.error('Toggle error:', error);
    showError(error.message || 'Failed to toggle pause. Please try again.');
  } finally {
    button.disabled = false;
  }
}

function showError(message) {
  const errorEl = document.getElementById('error-message');
  errorEl.textContent = message;
  errorEl.style.display = 'block';
}

function hideError() {
  document.getElementById('error-message').style.display = 'none';
}

// Auto-refresh status every 30 seconds
setInterval(async () => {
  if (accessToken) {
    try {
      await refreshStatus();
    } catch (error) {
      console.error('Auto-refresh error:', error);
    }
  }
}, 30000);
