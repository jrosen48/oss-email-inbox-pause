const express = require('express');
const router = express.Router();
const { processNotification, handleValidationRequest } = require('../graph/webhooks');

/**
 * POST /webhooks/graph
 * Endpoint to receive webhook notifications from Microsoft Graph
 */
router.post('/graph', async (req, res) => {
  try {
    // Handle validation request (when creating subscription)
    if (req.query && req.query.validationToken) {
      const validationToken = handleValidationRequest(req.query.validationToken);
      return res.type('text/plain').send(validationToken);
    }

    // Handle notification
    const notifications = req.body.value;

    if (!notifications || !Array.isArray(notifications)) {
      return res.status(400).json({ error: 'Invalid notification format' });
    }

    // Process each notification (usually just one, but can be batched)
    for (const notification of notifications) {
      // Process asynchronously - don't wait for completion
      processNotification(notification).catch(error => {
        console.error('Error processing notification:', error);
      });
    }

    // Respond immediately with 202 Accepted
    // Microsoft expects a response within 3 seconds
    res.status(202).send();
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /webhooks/graph
 * Test endpoint to verify webhook is accessible
 */
router.get('/graph', (req, res) => {
  res.json({
    message: 'Webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
