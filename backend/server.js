const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./models/Task');
const Contact = require('./models/Contact');
const User = require('./models/User');
const authMiddleware = require('./middleware/authMiddleware');
const { cache, cacheStats } = require('./cache');
const taskEvents = require('./events/taskEvents');
require('./events/taskListeners'); // Register all event listeners

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic request logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Middleware to reject requests without Content-Type: application/json on POST/PUT
app.use((req, res, next) => {
  if (['POST', 'PUT'].includes(req.method) && req.headers['content-type'] !== 'application/json') {
    return res.status(400).json({ message: 'Content-Type must be application/json' });
  }
  next();
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected successfully!'))
  .catch(err => console.error('MongoDB Connection Error:', err));


// ----------------------------------------------------
// AUTHENTICATION ROUTES (MongoDB)
// ----------------------------------------------------

// Register User
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    next(err);
  }
});

// Login User
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { id: user.id, role: user.role };
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
      }
    );
  } catch (err) {
    next(err);
  }
});

// Get Current Logged In User (/me)
app.get('/api/auth/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    next(err);
  }
});


// ----------------------------------------------------
// TASK CRUD ROUTES (MongoDB - Protected)
// ----------------------------------------------------

// Get all tasks (with caching)
app.get('/api/tasks', async (req, res, next) => {
  try {
    // Step 1: Check if tasks are in cache
    const cachedTasks = cache.get('all_tasks');

    if (cachedTasks) {
      // Cache HIT — return cached data without querying MongoDB
      cacheStats.hits++;
      console.log('CACHE HIT: all_tasks');
      return res.json(cachedTasks);
    }

    // Cache MISS — query MongoDB
    cacheStats.misses++;
    console.log('CACHE MISS: all_tasks — querying MongoDB');
    const tasks = await Task.find().sort({ createdAt: -1 });

    // Step 2: Store result in cache for future requests
    cache.set('all_tasks', tasks);

    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// Get single task (with caching)
app.get('/api/tasks/:id', async (req, res, next) => {
  try {
    const cacheKey = `task_${req.params.id}`;

    // Step 1: Check cache for this specific task
    const cachedTask = cache.get(cacheKey);

    if (cachedTask) {
      // Cache HIT
      cacheStats.hits++;
      console.log(`CACHE HIT: ${cacheKey}`);
      return res.json(cachedTask);
    }

    // Cache MISS — query MongoDB
    cacheStats.misses++;
    console.log(`CACHE MISS: ${cacheKey} — querying MongoDB`);
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Step 2: Store in cache
    cache.set(cacheKey, task);

    res.json(task);
  } catch (err) {
    next(err);
  }
});

// Create task (invalidates cache + emits event)
app.post('/api/tasks', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    const { title, description, priority } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Please include a title' });
    }
    const newTask = new Task({ title, description, priority });
    const savedTask = await newTask.save();

    // Invalidate the all_tasks cache because data has changed
    cache.del('all_tasks');
    console.log('CACHE INVALIDATED: all_tasks (new task created)');

    // Step 1: Send HTTP response IMMEDIATELY (client is not waiting)
    const responseTime = new Date().toISOString();
    console.log(`[API Response] Sent at ${responseTime}`);
    res.status(201).json(savedTask);

    // Step 2: Emit event AFTER response is sent (background processing)
    taskEvents.emit('task-created', savedTask);
  } catch (err) {
    next(err);
  }
});

// Update task (invalidates cache)
app.put('/api/tasks/:id', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    const { title, description, completed, priority } = req.body;
    
    // Build update object
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (completed !== undefined) updateFields.completed = completed;
    if (priority !== undefined) updateFields.priority = priority;
    
    const task = await Task.findByIdAndUpdate(
      req.params.id, 
      { $set: updateFields }, 
      { new: true, runValidators: true } // return updated document and run validators
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Invalidate both the all_tasks list and this specific task's cache
    cache.del('all_tasks');
    cache.del(`task_${req.params.id}`);
    console.log(`CACHE INVALIDATED: all_tasks + task_${req.params.id} (task updated)`);
    
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// Delete task (invalidates cache + emits event)
app.delete('/api/tasks/:id', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Invalidate both the all_tasks list and this specific task's cache
    cache.del('all_tasks');
    cache.del(`task_${req.params.id}`);
    console.log(`CACHE INVALIDATED: all_tasks + task_${req.params.id} (task deleted)`);

    // Step 1: Send HTTP response IMMEDIATELY
    const responseTime = new Date().toISOString();
    console.log(`[API Response] Sent at ${responseTime}`);
    res.json({ message: 'Task removed' });

    // Step 2: Emit event AFTER response is sent (background processing)
    taskEvents.emit('task-deleted', task);
  } catch (err) {
    next(err);
  }
});


// ----------------------------------------------------
// AI INTEGRATION ROUTE (Gemini)
// ----------------------------------------------------
const { GoogleGenerativeAI } = require('@google/generative-ai');

app.post('/api/ai/generate-description', authMiddleware, async (req, res, next) => {
  try {
    const { title } = req.body;
    
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: 'Task title is required to generate a description.' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
      console.warn("AI API key is missing or invalid.");
      return res.status(503).json({ message: 'AI service is currently unavailable. Please configure the API key.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'antigravity-preview-latest' });

    const prompt = `You are a helpful assistant. Write a short, professional, and actionable task description for the following task title. Keep it under 2 sentences.\n\nTask Title: ${title}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedDescription = response.text().trim();

    res.json({ description: generatedDescription });
  } catch (err) {
    console.error('AI API Error:', err);
    // Graceful failure - do not crash the app, return a 500 error handled gracefully on frontend
    res.status(500).json({ message: 'Unable to generate a description right now. Please try again.' });
  }
});

// ----------------------------------------------------
// CACHE DEBUG ROUTE
// ----------------------------------------------------

app.get('/api/cache-stats', (req, res) => {
  const stats = cacheStats.getStats();
  const keys = cache.keys();
  res.json({
    ...stats,
    cachedKeys: keys,
    ttl: 60
  });
});


// ----------------------------------------------------
// CONTACT FORM ROUTE (MongoDB)
// ----------------------------------------------------

app.post('/api/contact', async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and message.' });
    }

    // Save to database
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    
    console.log('Saved contact message from:', name);
    
    res.status(200).json({ success: true, message: 'Your message has been sent successfully and saved to the database!' });
  } catch (err) {
    console.error('Error saving contact:', err);
    next(err);
  }
});


// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

// Start Server
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
