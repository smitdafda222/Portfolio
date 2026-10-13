import React from 'react';
import { useReveal } from '../hooks/useReveal';
import './About.css';

const About = () => {
  const { ref, isRevealed } = useReveal();

  return (
    <section id="about" className={`about-section reveal ${isRevealed ? 'active' : ''}`} ref={ref}>
      <div className="container glass-card">
        <h2>About Me</h2>
        <div className="about-content">
          <p>
            Hello! I am a passionate Full-Stack Web Developer dedicated to building
            modern, responsive, and robust web applications. I love learning new
            technologies and applying them to solve real-world problems.
          </p>
          <p>
            My journey in web development started with simple HTML/CSS pages, and
            now I enjoy building complex applications using React on the frontend
            and Node.js/Express on the backend.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
