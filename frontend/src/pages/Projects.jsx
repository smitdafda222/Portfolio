import React, { useState, useEffect } from 'react';
import { useReveal } from '../hooks/useReveal';
import './Projects.css';

const Projects = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { ref, isRevealed } = useReveal();

  const GITHUB_USERNAME = 'SuvagiyaPrince';
  const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;

  const fetchRepositories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err.message || 'Failed to fetch repositories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  const filteredData = data.filter((repo) =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`projects-page reveal ${isRevealed ? 'active' : ''}`} ref={ref}>
      <div className="projects-header">
        <h2>My Projects</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input"
          />
        </div>
      </div>

      {loading && (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading repositories...</p>
        </div>
      )}

      {error && (
        <div className="error-message glass-card">
          <p>Error: {error}</p>
          <button onClick={fetchRepositories} className="btn-primary">
            Retry Fetch <span className="arrow">&rarr;</span>
          </button>
        </div>
      )}

      {!loading && !error && filteredData.length === 0 && (
        <div className="no-results glass-card">
          <p>No repositories found matching "{searchTerm}".</p>
        </div>
      )}

      {!loading && !error && (
        <div className="projects-grid">
          {filteredData.map((repo, index) => (
            <div 
              key={repo.id} 
              className="repo-card glass-card fade-in-down"
              style={{ animationDelay: `${0.05 * (index % 10)}s` }}
            >
              <h3>
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                  {repo.name}
                </a>
              </h3>
              <p className="repo-desc">
                {repo.description ? repo.description : 'No description provided.'}
              </p>
              <div className="repo-footer">
                <div className="repo-stats">
                  <span className="stars">⭐ {repo.stargazers_count}</span>
                  {repo.language && <span className="language">🔹 {repo.language}</span>}
                </div>
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="btn-outline repo-btn">
                  GitHub
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
