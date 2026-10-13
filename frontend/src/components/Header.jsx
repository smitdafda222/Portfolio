import React, { useState, useEffect, useCallback } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import './Header.css';

const Header = ({ name }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Intentionally left empty as per user request to remove hover effect on orb
  }, []);

  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  return (
    <header className="hero-section">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          interactivity: {
            events: {
              onHover: { enable: true, mode: "grab" },
            },
            modes: {
              grab: { distance: 140, links: { opacity: 0.5 } },
            },
          },
          particles: {
            color: { value: "#A0AABF" },
            links: {
              color: "#A0AABF",
              distance: 150,
              enable: true,
              opacity: 0.2,
              width: 1,
            },
            move: {
              enable: true,
              speed: 0.8,
              direction: "none",
              random: false,
              straight: false,
              outModes: { default: "bounce" },
            },
            number: {
              density: { enable: true, area: 800 },
              value: 60,
            },
            opacity: { value: 0.3 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 3 } },
          },
          detectRetina: true,
        }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
      />

      <div className="hero-container">
        <div className="hero-content">
          <h2 className="stagger-1">Hi There, I'm</h2>
          <h1 className="stagger-2 gradient-text">{name}</h1>
          <p className="stagger-3">I Am Into Web Development</p>

          <div className="hero-buttons stagger-4">
            <button className="btn-primary">
              About Me <span className="arrow">&rarr;</span>
            </button>
            <div className="social-buttons">
              <a href="https://www.linkedin.com/in/prince-suvagiya/" target="_blank" rel="noopener noreferrer"><button className="btn-outline">LinkedIn</button></a>
              <a href="https://github.com/SuvagiyaPrince" target="_blank" rel="noopener noreferrer"><button className="btn-outline">GitHub</button></a>
            </div>
          </div>
        </div>

        <div className="hero-visual stagger-5">
          <div className="glass-orb">
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
