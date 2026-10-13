import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';

// ---------- Eagerly loaded pages (small / always needed) ----------
import Home from './pages/Home';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';

// ---------- Lazy-loaded pages (loaded only when user navigates to them) ----------
const Projects = lazy(() => import('./pages/Projects'));
const Contact  = lazy(() => import('./pages/Contact'));
const Tasks    = lazy(() => import('./pages/Tasks'));

import './App.css';

function App() {
  return (
    <div className="app-container">
      <NavBar />

      <main className="main-content">
        {/* Suspense shows the fallback UI while a lazy component is loading */}
        <Suspense fallback={
          <div className="lazy-loading-fallback">
            <div className="lazy-spinner"></div>
            <p>Loading page...</p>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/login" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

export default App;
