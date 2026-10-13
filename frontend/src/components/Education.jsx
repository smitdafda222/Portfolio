import React from 'react';
import { useReveal } from '../hooks/useReveal';
import './Education.css';

const Education = () => {
  const { ref, isRevealed } = useReveal();

  const educationData = [
    { 
      degree: "Master of Computer Applications", 
      institution: "Tech University", 
      year: "2023 - 2025",
      description: "Specialized in Advanced Web Technologies and Cloud Computing. Graduated with Honors."
    },
    { 
      degree: "Bachelor of Science in IT", 
      institution: "State College", 
      year: "2020 - 2023",
      description: "Focused on Software Engineering, Database Management, and UI/UX Design."
    },
    { 
      degree: "High School Diploma", 
      institution: "City High School", 
      year: "2018 - 2020",
      description: "Science stream with core subjects in Mathematics, Physics, and Computer Science."
    }
  ];

  return (
    <section id="education" className={`education-section reveal ${isRevealed ? 'active' : ''}`} ref={ref}>
      <div className="container">
        <h2>Education</h2>
        
        <div className="timeline">
          {educationData.map((edu, index) => (
            <div 
              key={index} 
              className="timeline-item fade-in-down"
              style={{ animationDelay: `${0.2 * index}s`, animationPlayState: isRevealed ? 'running' : 'paused' }}
            >
              <div className="timeline-dot"></div>
              <div className="glass-card education-card">
                <div className="education-card-header">
                  <h3>{edu.degree}</h3>
                  <span className="year">{edu.year}</span>
                </div>
                <h4>{edu.institution}</h4>
                <p className="education-desc">{edu.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Education;
