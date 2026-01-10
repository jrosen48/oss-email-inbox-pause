const express = require('express');
const router = express.Router();
const { getUserInfo, getGraphClient } = require('../graph/auth');
const {
  getPausedFolder,
  moveCurrentInboxToPaused,
  moveAllPausedToInbox,
  getPausedEmailCount
} = require('../graph/mail');
const {
  createSubscription,
  deleteSubscription
} = require('../graph/subscriptions');
const {
  createOrUpdateUser,
  getUserByGraphUserId,
  updatePauseState
} = require('../db/models');

/**
 * Middleware to extract and validate access token
 */
async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const accessToken = authHeader.substring(7);

    // Get user info from token
    const userInfo = await getUserInfo(accessToken);

    // Attach to request
    req.accessToken = accessToken;
    req.userInfo = userInfo;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Apply authentication to all routes
router.use(authenticateUser);

/**
 * POST /api/pause/enable
 * Enable inbox pause for the authenticated user
 */
router.post('/pause/enable', async (req, res) => {
  try {
    const { accessToken, userInfo } = req;

    // Create or update user in database
    let user = await getUserByGraphUserId(userInfo.id);
    if (!user) {
      user = await createOrUpdateUser({
        email: userInfo.email,
        graphUserId: userInfo.id,
        graphAccessToken: accessToken,
        tokenExpiry: new Date(Date.now() + 3600000) // 1 hour
      });
    } else {
      // Update token
      await user.update({
        graphAccessToken: accessToken,
        tokenExpiry: new Date(Date.now() + 3600000)
      });
    }

    // Get or create paused folder
    const pausedFolderId = await getPausedFolder(accessToken, userInfo.id);
    await user.update({ pausedFolderId });

    // Create webhook subscription
    const subscriptionData = await createSubscription(accessToken, userInfo.id);

    // Update pause state
    await updatePauseState(user.id, {
      isPaused: true,
      subscriptionId: subscriptionData.subscriptionId,
      subscriptionExpiry: subscriptionData.expirationDateTime,
      clientState: subscriptionData.clientState
    });

    // Move current inbox emails to paused folder
    const movedCount = await moveCurrentInboxToPaused(
      accessToken,
      userInfo.id,
      pausedFolderId
    );

    res.json({
      success: true,
      message: 'Inbox pause enabled',
      movedCount,
      pausedFolderId
    });
  } catch (error) {
    console.error('Error enabling pause:', error);
    res.status(500).json({
      error: 'Failed to enable pause',
      message: error.message
    });
  }
});

/**
 * POST /api/pause/disable
 * Disable inbox pause for the authenticated user
 */
router.post('/pause/disable', async (req, res) => {
  try {
    const { accessToken, userInfo } = req;

    // Get user from database
    const user = await getUserByGraphUserId(userInfo.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete webhook subscription
    if (user.pauseState?.subscriptionId) {
      await deleteSubscription(accessToken, user.pauseState.subscriptionId);
    }

    // Move paused emails back to inbox
    let movedCount = 0;
    if (user.pausedFolderId) {
      movedCount = await moveAllPausedToInbox(
        accessToken,
        userInfo.id,
        user.pausedFolderId
      );
    }

    // Update pause state
    await updatePauseState(user.id, {
      isPaused: false,
      subscriptionId: null,
      subscriptionExpiry: null,
      clientState: null
    });

    res.json({
      success: true,
      message: 'Inbox pause disabled',
      movedCount
    });
  } catch (error) {
    console.error('Error disabling pause:', error);
    res.status(500).json({
      error: 'Failed to disable pause',
      message: error.message
    });
  }
});

/**
 * GET /api/pause/status
 * Get current pause status for the authenticated user
 */
router.get('/pause/status', async (req, res) => {
  try {
    const { accessToken, userInfo } = req;

    // Get user from database
    const user = await getUserByGraphUserId(userInfo.id);
    if (!user) {
      // User hasn't set up pause yet
      return res.json({
        isPaused: false,
        pausedCount: 0,
        subscriptionExpiry: null
      });
    }

    // Get paused email count
    let pausedCount = 0;
    if (user.pausedFolderId) {
      pausedCount = await getPausedEmailCount(
        accessToken,
        userInfo.id,
        user.pausedFolderId
      );
    }

    res.json({
      isPaused: user.pauseState?.isPaused || false,
      pausedCount,
      subscriptionExpiry: user.pauseState?.subscriptionExpiry,
      pausedFolderId: user.pausedFolderId
    });
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({
      error: 'Failed to get status',
      message: error.message
    });
  }
});

/**
 * GET /api/pause/count
 * Get count of paused emails (lightweight endpoint)
 */
router.get('/pause/count', async (req, res) => {
  try {
    const { accessToken, userInfo } = req;

    const user = await getUserByGraphUserId(userInfo.id);
    if (!user || !user.pausedFolderId) {
      return res.json({ count: 0 });
    }

    const count = await getPausedEmailCount(
      accessToken,
      userInfo.id,
      user.pausedFolderId
    );

    res.json({ count });
  } catch (error) {
    console.error('Error getting count:', error);
    res.status(500).json({
      error: 'Failed to get count',
      message: error.message
    });
  }
});

/**
 * GET /api/user
 * Get current user info (for testing)
 */
router.get('/user', (req, res) => {
  res.json({
    user: req.userInfo
  });
});

module.exports = router;
