const { getUserByGraphUserId } = require('../db/models');
const { getApplicationToken, getGraphClient } = require('./auth');
const { moveMessageToPaused } = require('./mail');
const { validateNotification } = require('./subscriptions');

/**
 * Process a webhook notification from Microsoft Graph
 */
async function processNotification(notification) {
  try {
    console.log('Processing notification:', JSON.stringify(notification, null, 2));

    // Extract user ID and message ID from resource URL
    // Resource format: "Users/{userId}/Messages/{messageId}"
    const resourceParts = notification.resource.split('/');
    const userIdIndex = resourceParts.findIndex(p => p.toLowerCase() === 'users') + 1;
    const messageIdIndex = resourceParts.findIndex(p => p.toLowerCase() === 'messages') + 1;

    if (userIdIndex === 0 || messageIdIndex === 0) {
      console.error('Could not parse resource URL:', notification.resource);
      return;
    }

    const graphUserId = resourceParts[userIdIndex];
    const messageId = resourceParts[messageIdIndex];

    console.log(`New message ${messageId} for user ${graphUserId}`);

    // Get user from database
    const user = await getUserByGraphUserId(graphUserId);
    if (!user) {
      console.error(`User not found: ${graphUserId}`);
      return;
    }

    // Check if user has pause enabled
    if (!user.pauseState || !user.pauseState.isPaused) {
      console.log(`Pause not enabled for user ${graphUserId}`);
      return;
    }

    // Validate client state
    try {
      validateNotification(notification, user.pauseState.clientState);
    } catch (error) {
      console.error('Notification validation failed:', error);
      return;
    }

    // Check if we have a paused folder ID
    if (!user.pausedFolderId) {
      console.error(`No paused folder ID for user ${graphUserId}`);
      return;
    }

    // Get application token to perform the move operation
    const appToken = await getApplicationToken();

    // Move the message to paused folder
    await moveMessageToPaused(appToken, graphUserId, messageId, user.pausedFolderId);

    console.log(`Successfully processed notification for message ${messageId}`);
  } catch (error) {
    console.error('Error processing notification:', error);
    throw error;
  }
}

/**
 * Handle validation request from Microsoft Graph when creating subscription
 */
function handleValidationRequest(validationToken) {
  console.log('Received validation request');
  return validationToken;
}

module.exports = {
  processNotification,
  handleValidationRequest
};
