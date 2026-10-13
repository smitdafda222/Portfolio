import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {currentYear} Advanced Web Development Portfolio. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
