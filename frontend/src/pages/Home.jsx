import React from 'react';
import Header from '../components/Header';
import About from '../components/About';
import Skills from '../components/Skills';
import Education from '../components/Education';
import Projects from './Projects';
import Contact from './Contact';

const Home = () => {
  const mySkills = [
    'HTML5', 'CSS3', 'JavaScript (ES6+)', 
    'React.js', 'Node.js', 'Express', 
    'MongoDB', 'Git & GitHub', 'RESTful APIs'
  ];

  return (
    <div className="home-page fade-in-down">
      <section id="home"><Header name="Prince Suvagiya" /></section>
      <section id="about"><About /></section>
      <section id="skills"><Skills skillList={mySkills} /></section>
      <section id="education"><Education /></section>
      <section id="projects"><Projects /></section>
      <section id="contact"><Contact /></section>
    </div>
  );
};

export default Home;
