/**
 * GitStory 2025 - GitHub API Integration
 * 
 * Handles all GitHub API calls with caching and rate limiting.
 * Supports both authenticated and unauthenticated requests.
 */

const GITHUB_API_BASE = 'https://api.github.com';
const CONTRIBUTIONS_API = 'https://github-contributions-api.jogruber.de/v4';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

/**
 * GitHub API Client
 */
class GitHubAPI {
  constructor() {
    this.token = null;
    this.rateLimitRemaining = null;
    this.rateLimitReset = null;
  }

  /**
   * Set the authentication token
   * @param {string} token - GitHub Personal Access Token
   */
  setToken(token) {
    if (token && token.trim()) {
      this.token = token.trim();
      // Clear cache when token changes
      cache.clear();
    }
  }

  /**
   * Get request headers
   * @returns {Headers}
   */
  getHeaders() {
    const headers = new Headers({
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    });

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    return headers;
  }

  /**
   * Check cache for existing data
   * @param {string} key - Cache key
   * @returns {any|null}
   */
  getFromCache(key) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    cache.delete(key);
    return null;
  }

  /**
   * Store data in cache
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  setCache(key, data) {
    cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Make an API request with caching
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<any>}
   */
  async request(endpoint, options = {}) {
    const cacheKey = `${endpoint}:${this.token ? 'auth' : 'noauth'}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const url = endpoint.startsWith('http') ? endpoint : `${GITHUB_API_BASE}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: this.getHeaders(),
      });

      // Update rate limit info
      this.rateLimitRemaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '0');
      this.rateLimitReset = parseInt(response.headers.get('X-RateLimit-Reset') || '0');

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new GitHubAPIError(
          error.message || `HTTP ${response.status}`,
          response.status,
          this.rateLimitRemaining
        );
      }

      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      if (error instanceof GitHubAPIError) {
        throw error;
      }
      throw new GitHubAPIError(error.message, 0, this.rateLimitRemaining);
    }
  }

  /**
   * Get user profile
   * @param {string} username - GitHub username
   * @returns {Promise<Object>}
   */
  async getUser(username) {
    return this.request(`/users/${encodeURIComponent(username)}`);
  }

  /**
   * Get user's repositories
   * @param {string} username - GitHub username
   * @param {Object} options - Query options
   * @returns {Promise<Array>}
   */
  async getRepos(username, options = {}) {
    const { sort = 'updated', per_page = 100, page = 1 } = options;
    const query = new URLSearchParams({ sort, per_page, page }).toString();
    return this.request(`/users/${encodeURIComponent(username)}/repos?${query}`);
  }

  /**
   * Get all user repositories (paginated)
   * @param {string} username - GitHub username
   * @returns {Promise<Array>}
   */
  async getAllRepos(username) {
    const allRepos = [];
    let page = 1;
    const per_page = 100;

    while (true) {
      const repos = await this.getRepos(username, { per_page, page });
      allRepos.push(...repos);

      if (repos.length < per_page) {
        break;
      }
      page++;

      // Safety limit
      if (page > 10) break;
    }

    return allRepos;
  }

  /**
   * Get user's public events
   * @param {string} username - GitHub username
   * @param {number} page - Page number
   * @returns {Promise<Array>}
   */
  async getEvents(username, page = 1) {
    return this.request(`/users/${encodeURIComponent(username)}/events/public?per_page=100&page=${page}`);
  }

  /**
   * Get all recent events (up to 300)
   * @param {string} username - GitHub username
   * @returns {Promise<Array>}
   */
  async getAllEvents(username) {
    const allEvents = [];
    
    // GitHub only returns last 90 days / 300 events
    for (let page = 1; page <= 3; page++) {
      try {
        const events = await this.getEvents(username, page);
        allEvents.push(...events);
        if (events.length < 100) break;
      } catch (e) {
        break;
      }
    }

    return allEvents;
  }

  /**
   * Get contribution data from external API
   * @param {string} username - GitHub username
   * @param {number} year - Year to fetch
   * @returns {Promise<Object>}
   */
  async getContributions(username, year = new Date().getFullYear()) {
    const cacheKey = `contributions:${username}:${year}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${CONTRIBUTIONS_API}/${encodeURIComponent(username)}?y=${year}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch contributions: ${response.status}`);
      }

      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Contributions API error:', error);
      // Return empty structure on error
      return {
        total: { [year]: 0 },
        contributions: [],
      };
    }
  }

  /**
   * Get rate limit status
   * @returns {Promise<Object>}
   */
  async getRateLimit() {
    return this.request('/rate_limit');
  }

  /**
   * Get current rate limit info
   * @returns {Object}
   */
  getRateLimitInfo() {
    return {
      remaining: this.rateLimitRemaining,
      resetAt: this.rateLimitReset ? new Date(this.rateLimitReset * 1000) : null,
    };
  }

  /**
   * Validate if a username exists
   * @param {string} username - GitHub username
   * @returns {Promise<boolean>}
   */
  async validateUser(username) {
    try {
      await this.getUser(username);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Fetch all data needed for GitStory
   * @param {string} username - GitHub username
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>}
   */
  async fetchAllData(username, onProgress = () => {}) {
    const year = new Date().getFullYear();
    const results = {
      user: null,
      repos: [],
      events: [],
      contributions: null,
      languages: {},
      error: null,
    };

    try {
      // Step 1: Get user profile
      onProgress('Fetching profile...');
      results.user = await this.getUser(username);

      // Step 2: Get repositories
      onProgress('Loading repositories...');
      results.repos = await this.getAllRepos(username);

      // Step 3: Get events
      onProgress('Analyzing activity...');
      results.events = await this.getAllEvents(username);

      // Step 4: Get contributions
      onProgress('Fetching contributions...');
      results.contributions = await this.getContributions(username, year);

      // Step 5: Aggregate languages from repos
      onProgress('Processing languages...');
      results.languages = this.aggregateLanguages(results.repos);

      onProgress('Complete!');
      return results;
    } catch (error) {
      results.error = error;
      throw error;
    }
  }

  /**
   * Aggregate language statistics from repositories
   * @param {Array} repos - Array of repository objects
   * @returns {Object} - Language breakdown with percentages
   */
  aggregateLanguages(repos) {
    const languageCounts = {};
    let totalBytes = 0;

    for (const repo of repos) {
      if (repo.language && !repo.fork) {
        const bytes = repo.size * 1024; // Approximate
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + bytes;
        totalBytes += bytes;
      }
    }

    // Convert to percentages and sort
    const languages = Object.entries(languageCounts)
      .map(([name, bytes]) => ({
        name,
        bytes,
        percentage: totalBytes > 0 ? ((bytes / totalBytes) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 10); // Top 10 languages

    return {
      languages,
      total: totalBytes,
      count: Object.keys(languageCounts).length,
    };
  }
}

/**
 * Custom error class for GitHub API errors
 */
class GitHubAPIError extends Error {
  constructor(message, status, rateLimitRemaining) {
    super(message);
    this.name = 'GitHubAPIError';
    this.status = status;
    this.rateLimitRemaining = rateLimitRemaining;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isRateLimited() {
    return this.status === 403 && this.rateLimitRemaining === 0;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  getUserFriendlyMessage() {
    if (this.isNotFound) {
      return 'User not found. Please check the username and try again.';
    }
    if (this.isRateLimited) {
      return 'Rate limit exceeded. Please add a GitHub token or wait a moment.';
    }
    if (this.isUnauthorized) {
      return 'Invalid GitHub token. Please check your token and try again.';
    }
    return `GitHub API error: ${this.message}`;
  }
}

// Export singleton instance
export const githubAPI = new GitHubAPI();
export { GitHubAPI, GitHubAPIError };
