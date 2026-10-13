const NodeCache = require('node-cache');

// Create a cache instance with a TTL (Time To Live) of 60 seconds
// After 60 seconds, cached data expires automatically
const cache = new NodeCache({ stdTTL: 60 });

// Simple stats tracker for cache hits and misses
const cacheStats = {
  hits: 0,
  misses: 0,
  getStats() {
    return {
      hits: this.hits,
      misses: this.misses,
      totalRequests: this.hits + this.misses,
      hitRate: this.hits + this.misses > 0
        ? ((this.hits / (this.hits + this.misses)) * 100).toFixed(1) + '%'
        : '0%'
    };
  },
  reset() {
    this.hits = 0;
    this.misses = 0;
  }
};

module.exports = { cache, cacheStats };
