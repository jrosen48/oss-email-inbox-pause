const { getGraphClient, getApplicationToken } = require('./auth');

const PAUSED_FOLDER_NAME = 'Paused Emails';

/**
 * Get or create the "Paused Emails" folder
 */
async function getPausedFolder(accessToken, userId) {
  const client = getGraphClient(accessToken);

  try {
    // First, try to find existing folder
    const folders = await client
      .api(`/users/${userId}/mailFolders`)
      .filter(`displayName eq '${PAUSED_FOLDER_NAME}'`)
      .get();

    if (folders.value && folders.value.length > 0) {
      return folders.value[0].id;
    }

    // Create folder if it doesn't exist
    const newFolder = await client
      .api(`/users/${userId}/mailFolders`)
      .post({
        displayName: PAUSED_FOLDER_NAME,
        isHidden: false // Set to true if you want it hidden from UI
      });

    return newFolder.id;
  } catch (error) {
    console.error('Error getting/creating paused folder:', error);
    throw error;
  }
}

/**
 * Move a message to the paused folder
 */
async function moveMessageToPaused(accessToken, userId, messageId, pausedFolderId) {
  const client = getGraphClient(accessToken);

  try {
    await client
      .api(`/users/${userId}/messages/${messageId}/move`)
      .post({
        destinationId: pausedFolderId
      });

    console.log(`Moved message ${messageId} to paused folder for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error moving message to paused folder:', error);
    throw error;
  }
}

/**
 * Move all paused emails back to inbox
 */
async function moveAllPausedToInbox(accessToken, userId, pausedFolderId) {
  const client = getGraphClient(accessToken);

  try {
    // Get inbox folder ID
    const inbox = await client.api(`/users/${userId}/mailFolders/inbox`).get();
    const inboxId = inbox.id;

    // Get all messages in paused folder
    const messages = await client
      .api(`/users/${userId}/mailFolders/${pausedFolderId}/messages`)
      .select('id')
      .top(999) // Max per request
      .get();

    if (!messages.value || messages.value.length === 0) {
      console.log(`No paused messages to move for user ${userId}`);
      return 0;
    }

    // Move each message back to inbox
    let movedCount = 0;
    for (const message of messages.value) {
      try {
        await client
          .api(`/users/${userId}/messages/${message.id}/move`)
          .post({
            destinationId: inboxId
          });
        movedCount++;
      } catch (error) {
        console.error(`Error moving message ${message.id}:`, error);
        // Continue with other messages
      }
    }

    console.log(`Moved ${movedCount} messages back to inbox for user ${userId}`);
    return movedCount;
  } catch (error) {
    console.error('Error moving paused emails to inbox:', error);
    throw error;
  }
}

/**
 * Move current inbox emails to paused folder (when enabling pause)
 */
async function moveCurrentInboxToPaused(accessToken, userId, pausedFolderId) {
  const client = getGraphClient(accessToken);

  try {
    // Get all messages currently in inbox
    const messages = await client
      .api(`/users/${userId}/mailFolders/inbox/messages`)
      .select('id')
      .top(999)
      .get();

    if (!messages.value || messages.value.length === 0) {
      console.log(`No inbox messages to move for user ${userId}`);
      return 0;
    }

    // Move each message to paused folder
    let movedCount = 0;
    for (const message of messages.value) {
      try {
        await client
          .api(`/users/${userId}/messages/${message.id}/move`)
          .post({
            destinationId: pausedFolderId
          });
        movedCount++;
      } catch (error) {
        console.error(`Error moving message ${message.id}:`, error);
        // Continue with other messages
      }
    }

    console.log(`Moved ${movedCount} inbox messages to paused folder for user ${userId}`);
    return movedCount;
  } catch (error) {
    console.error('Error moving inbox to paused folder:', error);
    throw error;
  }
}

/**
 * Get count of emails in paused folder
 */
async function getPausedEmailCount(accessToken, userId, pausedFolderId) {
  const client = getGraphClient(accessToken);

  try {
    const folder = await client
      .api(`/users/${userId}/mailFolders/${pausedFolderId}`)
      .select('totalItemCount')
      .get();

    return folder.totalItemCount || 0;
  } catch (error) {
    console.error('Error getting paused email count:', error);
    throw error;
  }
}

module.exports = {
  getPausedFolder,
  moveMessageToPaused,
  moveAllPausedToInbox,
  moveCurrentInboxToPaused,
  getPausedEmailCount
};
