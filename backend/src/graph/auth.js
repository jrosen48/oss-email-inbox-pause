const msal = require('@azure/msal-node');
const { Client } = require('@microsoft/microsoft-graph-client');

// MSAL configuration for application (daemon) authentication
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID || 'common'}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
  }
};

const confidentialClientApplication = new msal.ConfidentialClientApplication(msalConfig);

// Token cache (in-memory for now - consider Redis for production)
const tokenCache = new Map();

/**
 * Get access token for application (daemon) access
 * Used for backend operations like moving emails via webhooks
 */
async function getApplicationToken() {
  const tokenRequest = {
    scopes: ['https://graph.microsoft.com/.default'],
  };

  try {
    const response = await confidentialClientApplication.acquireTokenByClientCredential(tokenRequest);
    return response.accessToken;
  } catch (error) {
    console.error('Error acquiring application token:', error);
    throw error;
  }
}

/**
 * Exchange user token for on-behalf-of token
 * Used when add-in passes user token to backend
 */
async function getOnBehalfOfToken(userToken) {
  const tokenRequest = {
    oboAssertion: userToken,
    scopes: ['https://graph.microsoft.com/Mail.ReadWrite'],
  };

  try {
    const response = await confidentialClientApplication.acquireTokenOnBehalfOf(tokenRequest);
    return response.accessToken;
  } catch (error) {
    console.error('Error acquiring OBO token:', error);
    throw error;
  }
}

/**
 * Get Microsoft Graph client for user
 * @param {string} accessToken - User's access token
 */
function getGraphClient(accessToken) {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    }
  });
}

/**
 * Get user info from access token
 */
async function getUserInfo(accessToken) {
  try {
    const client = getGraphClient(accessToken);
    const user = await client.api('/me').select('id,mail,userPrincipalName').get();
    return {
      id: user.id,
      email: user.mail || user.userPrincipalName
    };
  } catch (error) {
    console.error('Error getting user info:', error);
    throw error;
  }
}

/**
 * Validate access token by attempting to fetch user info
 */
async function validateToken(accessToken) {
  try {
    await getUserInfo(accessToken);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  getApplicationToken,
  getOnBehalfOfToken,
  getGraphClient,
  getUserInfo,
  validateToken,
  confidentialClientApplication
};
