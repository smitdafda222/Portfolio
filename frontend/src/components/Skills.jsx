import React from 'react';
import { useReveal } from '../hooks/useReveal';
import './Skills.css';

const Skills = ({ skillList }) => {
  const { ref, isRevealed } = useReveal();

  return (
    <section id="skills" className={`skills-section reveal ${isRevealed ? 'active' : ''}`} ref={ref}>
      <div className="container">
        <h2>My Skills</h2>
        <div className="skills-grid">
          {skillList.map((skill, index) => (
            <div 
              key={index} 
              className="skill-card glass-card fade-in-down"
              style={{ animationDelay: `${0.1 * index}s`, animationPlayState: isRevealed ? 'running' : 'paused' }}
            >
              <span className="skill-name">{skill}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
