import React, { useState } from 'react';
import { useReveal } from '../hooks/useReveal';
import './Contact.css';

const Contact = () => {
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const { ref, isRevealed } = useReveal(0.05);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, message })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(data.message || 'Message sent successfully!');
        setMessage('');
        setName('');
        setEmail('');
      } else {
        alert(`Error: ${data.message || 'Something went wrong.'}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to connect to the server. Please ensure the backend is running.');
    }
  };

  return (
    <div className={`contact-page reveal ${isRevealed ? 'active' : ''}`} ref={ref}>
      <h2>Contact Me</h2>
      
      <div className="contact-container">
        <form onSubmit={handleSubmit} className="contact-form glass-card">
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input 
              type="text" 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Your Name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Your Message:</label>
            <textarea 
              id="message" 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              rows="5"
              placeholder="Type your message here..."
              required
            ></textarea>
            <div className="char-count">
              {message.length} characters
            </div>
          </div>
          
          <button type="submit" className="btn-primary">
            Send Message <span className="arrow">&rarr;</span>
          </button>
        </form>

        <div className="live-preview glass-card">
          <h3>Live Preview</h3>
          <div className="preview-box">
            {message ? message : <span className="placeholder-text">Your message will appear here...</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
