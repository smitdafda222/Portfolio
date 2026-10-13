// events/taskEvents.js
// ---------------------------------------------------
// Event Emitter module using Node.js built-in EventEmitter.
// No external library is needed — EventEmitter is part of Node.js core.
// ---------------------------------------------------

const EventEmitter = require('events');

// Create a custom class that extends EventEmitter
// This gives us the ability to emit and listen for custom events
class TaskEvents extends EventEmitter {}

// Export a single shared instance so all files use the same emitter
module.exports = new TaskEvents();
