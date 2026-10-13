import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReveal } from '../hooks/useReveal';
import { getTasks, createTask, updateTask, deleteTask, generateDescription } from '../api';
import './Tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isAdmin = localStorage.getItem('role') === 'admin';
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.reload();
  };
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  // Notification state
  const [notification, setNotification] = useState(null);
  
  const { ref, isRevealed } = useReveal();

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);
  
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
  };

  const handleEditTaskClick = (task) => {
    setEditingTaskId(task._id);
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority || 'medium');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      if (editingTaskId) {
        const updatedTask = await updateTask(editingTaskId, { title, description, priority });
        setTasks(prev => prev.map(t => t._id === editingTaskId ? updatedTask : t));
        showNotification('Task updated successfully!');
      } else {
        const savedTask = await createTask({ title, description, priority });
        setTasks([savedTask, ...tasks]);
        showNotification('Task created successfully!');
      }
      cancelEdit();
    } catch (err) {
      showNotification(err.message || (editingTaskId ? 'Failed to update task' : 'Failed to create task'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!title.trim()) {
      showNotification('Please enter a task title first to generate a description.', 'error');
      return;
    }
    
    setIsGenerating(true);
    try {
      const data = await generateDescription(title);
      setDescription(data.description);
      showNotification('AI-generated content — please review before using.', 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const updatedTask = await updateTask(task._id, { completed: !task.completed });
      setTasks(prev => prev.map(t => t._id === task._id ? updatedTask : t));
      showNotification(`Task marked as ${updatedTask.completed ? 'completed' : 'pending'}`);
    } catch (err) {
      showNotification(err.message || 'Failed to update task', 'error');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t._id !== id));
      showNotification('Task deleted successfully');
    } catch (err) {
      showNotification(err.message || 'Failed to delete task', 'error');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className={`projects-page reveal ${isRevealed ? 'active' : ''}`} ref={ref}>
        <div className="projects-header">
          <div>
            <h2>Task Management</h2>
          </div>
          <div className="auth-corner">
            <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', padding: '0.5rem 1rem' }}>Login</Link>
          </div>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Access Restricted</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>You will only see the tasks if you are logged in.</p>
          <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`projects-page reveal ${isRevealed ? 'active' : ''}`} ref={ref}>
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="projects-header">
        <div>
          <h2>Task Management</h2>
        </div>
        <div className="auth-corner">
          {isLoggedIn ? (
            <button className="btn-outline" onClick={handleLogout} style={{ padding: '0.5rem 1rem', borderRadius: '20px' }}>Logout</button>
          ) : (
            <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', padding: '0.5rem 1rem' }}>Login</Link>
          )}
        </div>
      </div>


          {isAdmin && (
            <div className="task-form-container glass-card">
              <h3>{editingTaskId ? 'Edit Task' : 'Create New Task'}</h3>
              <form onSubmit={handleSubmitTask} className="task-form">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Task Title *"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="glass-input"
                  />
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Description</label>
                    <button 
                      type="button" 
                      className="btn-outline" 
                      onClick={handleGenerateDescription}
                      disabled={isGenerating || !title.trim()}
                      style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', borderRadius: '15px' }}
                    >
                      {isGenerating ? 'Generating...' : '✨ Generate with AI'}
                    </button>
                  </div>
                  <textarea
                    placeholder="Task Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="glass-input"
                    rows="3"
                  ></textarea>
                </div>
                <div className="form-group">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="glass-input"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <div className="form-actions" style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn-primary" disabled={isSubmitting || !title.trim()}>
                    {isSubmitting ? (editingTaskId ? 'Updating...' : 'Creating...') : (editingTaskId ? 'Update Task' : 'Add Task')}
                  </button>
                  {editingTaskId && (
                    <button type="button" className="btn-outline" onClick={cancelEdit} disabled={isSubmitting} style={{ padding: '0.8rem 1.5rem', borderRadius: '30px' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {loading && (
            <div className="spinner-container">
              <div className="spinner"></div>
              <p>Loading tasks...</p>
            </div>
          )}

          {error && (
            <div className="error-message glass-card">
              <p>Error: {error}</p>
              {error.includes('No token') || error.includes('not valid') ? (
                <a href="/login" className="btn-primary" style={{ textDecoration: 'none' }}>Go to Login</a>
              ) : (
                <button onClick={fetchTasks} className="btn-primary">
                  Retry Fetch <span className="arrow">&rarr;</span>
                </button>
              )}
            </div>
          )}

          {!loading && !error && tasks.length === 0 && (
            <div className="no-results glass-card">
              <p>No tasks found. Create one above!</p>
            </div>
          )}

      {!loading && !error && (
        <div className="tasks-list">
          {tasks.map((task, index) => (
            <div 
              key={task._id} 
              className={`task-card glass-card fade-in-down ${task.completed ? 'completed' : ''}`}
              style={{ animationDelay: `${0.05 * (index % 10)}s` }}
            >
              <div className="task-content">
                <h4>{task.title}</h4>
                {task.description && <p className="task-desc">{task.description}</p>}
                <div className="task-meta">
                  <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
                  <span className="date-badge">
                    {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Just now'}
                  </span>
                </div>
              </div>
              {isAdmin && (
                <div className="task-actions">
                  <button 
                    className="btn-delete"
                    onClick={() => handleEditTaskClick(task)}
                    style={{ borderColor: 'rgba(255, 165, 0, 0.4)' }}
                    title="Edit Task"
                  >
                    ✏️
                  </button>
                  <button 
                    className={`btn-toggle ${task.completed ? 'active' : ''}`}
                    onClick={() => handleToggleComplete(task)}
                  >
                    {task.completed ? '✅ Done' : '⏳ Pending'}
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDeleteTask(task._id)}
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;
