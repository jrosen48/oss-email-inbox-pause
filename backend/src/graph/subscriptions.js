const { getGraphClient } = require('./auth');
const { PauseState } = require('../db/models');
const { Op } = require('sequelize');
const crypto = require('crypto');

/**
 * Create a Graph webhook subscription for a user's mailbox
 */
async function createSubscription(accessToken, userId) {
  const client = getGraphClient(accessToken);

  // Generate unique client state for validation
  const clientState = crypto.randomBytes(16).toString('hex');

  // Calculate expiration (max 3 days for messages)
  const expirationDateTime = new Date();
  expirationDateTime.setHours(expirationDateTime.getHours() + 71); // 71 hours (~3 days minus buffer)

  const subscription = {
    changeType: 'created',
    notificationUrl: `${process.env.BACKEND_URL}/webhooks/graph`,
    resource: `/users/${userId}/mailFolders('inbox')/messages`,
    expirationDateTime: expirationDateTime.toISOString(),
    clientState: clientState
  };

  try {
    const response = await client
      .api('/subscriptions')
      .post(subscription);

    console.log(`Created subscription ${response.id} for user ${userId}`);

    return {
      subscriptionId: response.id,
      expirationDateTime: new Date(response.expirationDateTime),
      clientState: clientState
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

/**
 * Renew an existing subscription
 */
async function renewSubscription(accessToken, subscriptionId) {
  const client = getGraphClient(accessToken);

  // Calculate new expiration (3 days from now)
  const expirationDateTime = new Date();
  expirationDateTime.setHours(expirationDateTime.getHours() + 71);

  try {
    const response = await client
      .api(`/subscriptions/${subscriptionId}`)
      .patch({
        expirationDateTime: expirationDateTime.toISOString()
      });

    console.log(`Renewed subscription ${subscriptionId}`);

    return new Date(response.expirationDateTime);
  } catch (error) {
    console.error('Error renewing subscription:', error);
    throw error;
  }
}

/**
 * Delete a subscription
 */
async function deleteSubscription(accessToken, subscriptionId) {
  const client = getGraphClient(accessToken);

  try {
    await client
      .api(`/subscriptions/${subscriptionId}`)
      .delete();

    console.log(`Deleted subscription ${subscriptionId}`);
    return true;
  } catch (error) {
    // If subscription doesn't exist (404), consider it already deleted
    if (error.statusCode === 404) {
      console.log(`Subscription ${subscriptionId} already deleted or not found`);
      return true;
    }
    console.error('Error deleting subscription:', error);
    throw error;
  }
}

/**
 * Renew subscriptions that are about to expire
 * This function should be called by a cron job
 */
async function renewExpiringSubscriptions() {
  try {
    // Find all paused states with subscriptions expiring in the next 24 hours
    const expiringThreshold = new Date();
    expiringThreshold.setHours(expiringThreshold.getHours() + 24);

    const expiringStates = await PauseState.findAll({
      where: {
        isPaused: true,
        subscriptionId: { [Op.ne]: null },
        subscriptionExpiry: {
          [Op.lte]: expiringThreshold,
          [Op.gt]: new Date() // Not already expired
        }
      },
      include: ['user']
    });

    console.log(`Found ${expiringStates.length} subscriptions to renew`);

    for (const state of expiringStates) {
      try {
        // Get fresh token (in production, you'd need to handle refresh tokens)
        const accessToken = state.user.graphAccessToken;
        if (!accessToken) {
          console.error(`No access token for user ${state.userId}`);
          continue;
        }

        const newExpiry = await renewSubscription(accessToken, state.subscriptionId);

        // Update database
        await state.update({
          subscriptionExpiry: newExpiry
        });

        console.log(`Successfully renewed subscription for user ${state.userId}`);
      } catch (error) {
        console.error(`Failed to renew subscription for user ${state.userId}:`, error);
        // If renewal fails, mark as unpaused to avoid missing emails
        await state.update({
          isPaused: false,
          subscriptionId: null,
          subscriptionExpiry: null
        });
      }
    }

    return expiringStates.length;
  } catch (error) {
    console.error('Error in renewExpiringSubscriptions:', error);
    throw error;
  }
}

/**
 * Validate webhook notification
 */
function validateNotification(notification, expectedClientState) {
  if (!notification.clientState) {
    throw new Error('Missing clientState in notification');
  }

  if (notification.clientState !== expectedClientState) {
    throw new Error('Invalid clientState in notification');
  }

  return true;
}

module.exports = {
  createSubscription,
  renewSubscription,
  deleteSubscription,
  renewExpiringSubscriptions,
  validateNotification
};
