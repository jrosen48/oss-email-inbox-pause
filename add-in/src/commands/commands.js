// Commands for ribbon buttons (if needed in future)
// Currently, the main functionality is in the task pane

Office.onReady(() => {
  console.log('Commands loaded');
});

// Function to open task pane (called by ribbon button)
function openTaskPane(event) {
  Office.context.ui.displayDialogAsync(
    window.location.origin + '/taskpane.html',
    { height: 60, width: 30 },
    (result) => {
      if (result.status === Office.AsyncResultStatus.Failed) {
        console.error('Failed to open task pane:', result.error.message);
      }
    }
  );

  event.completed();
}

// Register function (Office will call this)
if (typeof Office !== 'undefined') {
  Office.actions.associate('openTaskPane', openTaskPane);
}
