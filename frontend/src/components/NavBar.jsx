import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for Active Links
  useEffect(() => {
    // Only observe sections when on the home page
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }

    const sections = ['home', 'about', 'skills', 'education', 'projects', 'contact'];
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px', 
        threshold: 0
      }
    );

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => {
      sections.forEach((id) => {
        const element = document.getElementById(id);
        if (element) observer.unobserve(element);
      });
    };
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };



  return (
    <nav className={`navbar glass-nav ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="logo fade-in-down" style={{ animationDelay: '0.1s' }}>Portfolio.</div>
        
        <div className={`menu-icon ${isMobileMenuOpen ? 'active' : ''}`} onClick={toggleMobileMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <ul className={`nav-links ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
          <li className="fade-in-down" style={{ animationDelay: '0.2s' }}>
            <a href="/#home" className={`nav-link ${activeSection === 'home' ? 'active' : ''}`} onClick={closeMobileMenu}>Home</a>
          </li>
          <li className="fade-in-down" style={{ animationDelay: '0.3s' }}>
            <a href="/#about" className={`nav-link ${activeSection === 'about' ? 'active' : ''}`} onClick={closeMobileMenu}>About</a>
          </li>
          <li className="fade-in-down" style={{ animationDelay: '0.4s' }}>
            <a href="/#skills" className={`nav-link ${activeSection === 'skills' ? 'active' : ''}`} onClick={closeMobileMenu}>Skills</a>
          </li>
          <li className="fade-in-down" style={{ animationDelay: '0.5s' }}>
            <a href="/#education" className={`nav-link ${activeSection === 'education' ? 'active' : ''}`} onClick={closeMobileMenu}>Education</a>
          </li>
          <li className="fade-in-down" style={{ animationDelay: '0.6s' }}>
            <a href="/#projects" className={`nav-link ${activeSection === 'projects' ? 'active' : ''}`} onClick={closeMobileMenu}>Projects</a>
          </li>
          <li className="fade-in-down" style={{ animationDelay: '0.7s' }}>
            <a href="/#contact" className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`} onClick={closeMobileMenu}>Contact</a>
          </li>
          <li className="fade-in-down" style={{ animationDelay: '0.8s' }}>
            <Link to="/tasks" className={`nav-link ${location.pathname === '/tasks' ? 'active' : ''}`} onClick={closeMobileMenu}>Tasks</Link>
          </li>
        </ul>
        
        <div 
          className="settings-icon fade-in-down glass-btn" 
          style={{ animationDelay: '0.8s', cursor: 'pointer' }} 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
