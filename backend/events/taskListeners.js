// events/taskListeners.js
// ---------------------------------------------------
// Event Listeners for task events.
// These run in the background AFTER the API response has been sent.
// ---------------------------------------------------

const taskEvents = require('./taskEvents');

// ---------------------------------------------------
// Helper: Simulate a slow notification process (2 seconds)
// In real apps, this could be sending an email, push notification, etc.
// ---------------------------------------------------
function simulateSlowNotification(message) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(message);
    }, 2000); // 2-second delay to simulate slow processing
  });
}

// ---------------------------------------------------
// Listener: task-created
// Fires AFTER a new task is saved and the API response is sent
// ---------------------------------------------------
taskEvents.on('task-created', async (task) => {
  const startTime = new Date();
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('[EVENT RECEIVED] task-created');
  console.log(`[Notification] Task "${task.title}" created at ${startTime.toISOString()}`);
  console.log('[Background] Starting slow notification process (2 seconds)...');

  // Simulate a slow background operation (e.g., sending email)
  const result = await simulateSlowNotification(
    `Notification sent for task: "${task.title}"`
  );

  const endTime = new Date();
  console.log(`[Background] ${result}`);
  console.log(`[Background] Notification completed at ${endTime.toISOString()}`);
  console.log(`[Background] Processing took ${endTime - startTime}ms`);
  console.log('═══════════════════════════════════════════════════');
  console.log('');
});

// ---------------------------------------------------
// Listener: task-deleted
// Fires AFTER a task is deleted and the API response is sent
// ---------------------------------------------------
taskEvents.on('task-deleted', async (task) => {
  const startTime = new Date();
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('[EVENT RECEIVED] task-deleted');
  console.log(`[Notification] Task "${task.title}" deleted at ${startTime.toISOString()}`);
  console.log('[Background] Starting cleanup notification (2 seconds)...');

  // Simulate a slow background cleanup
  const result = await simulateSlowNotification(
    `Cleanup notification sent for deleted task: "${task.title}"`
  );

  const endTime = new Date();
  console.log(`[Background] ${result}`);
  console.log(`[Background] Cleanup completed at ${endTime.toISOString()}`);
  console.log(`[Background] Processing took ${endTime - startTime}ms`);
  console.log('═══════════════════════════════════════════════════');
  console.log('');
});

// ---------------------------------------------------
// Listener: error
// Catches any error emitted from the event system
// ---------------------------------------------------
taskEvents.on('error', (err) => {
  console.error('');
  console.error('═══════════════════════════════════════════════════');
  console.error('[EVENT ERROR]', err.message);
  console.error('═══════════════════════════════════════════════════');
  console.error('');
});

console.log('[Events] Task event listeners registered successfully');
