/**
 * GitStory 2025 - Main Application Controller
 * 
 * Handles slide navigation, keyboard/mouse controls,
 * auto-advance, and orchestrates all modules.
 */

import { githubAPI, GitHubAPIError } from './github-api.js';
import { DataProcessor } from './data-processor.js';
import { ChartsRenderer } from './charts-renderer.js';
import { AuroraSlides } from './aurora-slides.js';
import { PosterExport } from './poster-export.js';

class GitStoryApp {
  constructor() {
    // State
    this.currentSlide = 0;
    this.totalSlides = 0;
    this.isPlaying = false; // Auto-advance disabled by default
    this.autoAdvanceTimer = null;
    this.autoAdvanceDelay = 12000; // 12 seconds if enabled
    
    // Data
    this.userData = null;
    this.processedData = null;
    
    // Modules
    this.dataProcessor = new DataProcessor();
    this.chartsRenderer = new ChartsRenderer();
    this.auroraSlides = new AuroraSlides();
    this.posterExport = new PosterExport();
    
    // DOM Elements
    this.elements = {};
    
    // Bind methods
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  /**
   * Initialize the application
   */
  init() {
    this.cacheElements();
    this.setupEventListeners();
    this.countSlides();
    this.updateSlideCounter();
    
    // Focus on username input
    setTimeout(() => {
      this.elements.usernameInput?.focus();
    }, 1500); // After curtain animation
    
    console.log('🎬 GitStory 2025 initialized');
  }

  /**
   * Cache DOM elements
   */
  cacheElements() {
    this.elements = {
      // Slides
      slideContainer: document.querySelector('.slide-container'),
      slides: document.querySelectorAll('.slide'),
      
      // Form
      form: document.getElementById('github-form'),
      usernameInput: document.getElementById('github-username'),
      tokenInput: document.getElementById('github-token'),
      playBtn: document.getElementById('play-story-btn'),
      errorMessage: document.getElementById('error-message'),
      errorText: document.getElementById('error-text'),
      
      // Navigation
      navControls: document.getElementById('nav-controls'),
      btnPrev: document.getElementById('btn-prev'),
      btnNext: document.getElementById('btn-next'),
      btnPlay: document.getElementById('btn-play'),
      btnFullscreen: document.getElementById('btn-fullscreen'),
      iconPause: document.getElementById('icon-pause'),
      iconPlay: document.getElementById('icon-play'),
      
      // Progress
      slideProgress: document.getElementById('slide-progress'),
      slideCounter: document.getElementById('slide-counter'),
      currentSlideNum: document.getElementById('current-slide'),
      totalSlidesNum: document.getElementById('total-slides'),
      
      // Loading
      loadingOverlay: document.getElementById('loading-overlay'),
      loadingStatus: document.getElementById('loading-status'),
      
      // Title Card Elements
      userAvatar: document.getElementById('user-avatar'),
      userName: document.getElementById('user-name'),
      userTagline: document.getElementById('user-tagline'),
      userDetails: document.getElementById('user-details'),
      detailLocation: document.getElementById('detail-location'),
      locationText: document.getElementById('location-text'),
      detailCompany: document.getElementById('detail-company'),
      companyText: document.getElementById('company-text'),
      detailJoined: document.getElementById('detail-joined'),
      joinedText: document.getElementById('joined-text'),
      
      // Velocity Chart
      velocityChart: document.getElementById('velocity-chart'),
      totalContributions: document.getElementById('total-contributions'),
      dailyAverage: document.getElementById('daily-average'),
      bestStreak: document.getElementById('best-streak'),
      bestDay: document.getElementById('best-day'),
      
      // Heatmap
      heatmapContainer: document.getElementById('heatmap-container'),
      heatmapMonths: document.getElementById('heatmap-months'),
      heatmapGrid: document.getElementById('heatmap-grid'),
    };
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Form submission
    this.elements.form?.addEventListener('submit', this.handleFormSubmit);
    
    // Keyboard navigation
    document.addEventListener('keydown', this.handleKeyDown);
    
    // Click navigation
    this.elements.slideContainer?.addEventListener('click', this.handleClick);
    
    // Navigation buttons
    this.elements.btnPrev?.addEventListener('click', () => this.prevSlide());
    this.elements.btnNext?.addEventListener('click', () => this.nextSlide());
    this.elements.btnPlay?.addEventListener('click', () => this.toggleAutoAdvance());
    this.elements.btnFullscreen?.addEventListener('click', () => this.toggleFullscreen());
    
    // Finale buttons
    const downloadBtn = document.getElementById('btn-download-poster');
    const restartBtn = document.getElementById('btn-restart');
    
    downloadBtn?.addEventListener('click', () => this.handleDownloadPoster());
    restartBtn?.addEventListener('click', () => this.handleRestart());
    
    // Visibility change (pause when tab hidden)
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  /**
   * Handle download poster click
   */
  handleDownloadPoster() {
    if (!this.userData || !this.processedData) {
      console.warn('No data available for poster generation');
      return;
    }
    
    this.posterExport.generatePoster(this.userData, this.processedData);
  }

  /**
   * Handle restart/new story click
   */
  handleRestart() {
    // Reset state
    this.userData = null;
    this.processedData = null;
    this.currentSlide = 0;
    this.isPlaying = true;
    this.pauseAutoAdvance();
    
    // Hide nav controls
    this.elements.navControls?.setAttribute('hidden', '');
    document.getElementById('slide-counter')?.setAttribute('hidden', '');
    
    // Reset progress
    if (this.elements.slideProgress) {
      this.elements.slideProgress.style.width = '0%';
    }
    
    // Go back to welcome slide
    this.elements.slides.forEach(slide => slide.classList.remove('active'));
    this.elements.slides[0]?.classList.add('active');
    
    // Reset form
    if (this.elements.usernameInput) {
      this.elements.usernameInput.value = '';
      this.elements.usernameInput.focus();
    }
    if (this.elements.tokenInput) {
      this.elements.tokenInput.value = '';
    }
    
    this.enableForm();
  }

  /**
   * Count total slides
   */
  countSlides() {
    this.totalSlides = this.elements.slides.length;
    if (this.elements.totalSlidesNum) {
      this.elements.totalSlidesNum.textContent = this.totalSlides;
    }
  }

  /**
   * Handle form submission
   * @param {Event} e - Submit event
   */
  async handleFormSubmit(e) {
    e.preventDefault();
    
    const username = this.elements.usernameInput?.value.trim();
    const token = this.elements.tokenInput?.value.trim();
    
    if (!username) {
      this.showError('Please enter a GitHub username');
      return;
    }
    
    // Set token if provided
    if (token) {
      githubAPI.setToken(token);
    }
    
    // Hide error, show loading
    this.hideError();
    this.showLoading();
    this.disableForm();
    
    try {
      // Fetch all data
      this.userData = await githubAPI.fetchAllData(username, (status) => {
        this.updateLoadingStatus(status);
      });
      
      // Process data
      this.updateLoadingStatus('Processing your story...');
      this.processedData = this.dataProcessor.processAll(this.userData);
      
      // Populate slides
      await this.populateSlides();
      
      // Hide loading, show navigation
      this.hideLoading();
      this.showNavControls();
      
      // Go to title card (no auto-advance)
      this.goToSlide(1);
      // User controls navigation manually
      
    } catch (error) {
      console.error('Error fetching data:', error);
      this.hideLoading();
      this.enableForm();
      
      if (error instanceof GitHubAPIError) {
        this.showError(error.getUserFriendlyMessage());
      } else {
        this.showError('Something went wrong. Please try again.');
      }
    }
  }

  /**
   * Populate slides with user data
   */
  async populateSlides() {
    const { user, contributions } = this.userData;
    const { stats, heatmapData } = this.processedData;
    
    // Title Card (Slide 2)
    this.elements.userAvatar.src = user.avatar_url;
    this.elements.userAvatar.alt = `${user.login}'s GitHub avatar`;
    this.elements.userName.textContent = user.name || user.login;
    
    if (user.bio) {
      this.elements.userTagline.textContent = user.bio;
    }
    
    if (user.location) {
      this.elements.detailLocation.hidden = false;
      this.elements.locationText.textContent = user.location;
    }
    
    if (user.company) {
      this.elements.detailCompany.hidden = false;
      this.elements.companyText.textContent = user.company;
    }
    
    const joinDate = new Date(user.created_at);
    this.elements.detailJoined.hidden = false;
    this.elements.joinedText.textContent = `Joined ${joinDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })}`;
    
    // Velocity Stats (Slide 3)
    this.elements.totalContributions.textContent = stats.totalContributions.toLocaleString();
    this.elements.dailyAverage.textContent = stats.dailyAverage.toFixed(1);
    this.elements.bestStreak.textContent = stats.longestStreak;
    this.elements.bestDay.textContent = stats.bestDay.count;
    
    // Render charts when slides become visible
    this.chartsRenderer.setData(this.processedData);
  }

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyDown(e) {
    // Ignore when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    
    switch (e.key) {
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        this.nextSlide();
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        this.prevSlide();
        break;
      case ' ':
        e.preventDefault();
        this.toggleAutoAdvance();
        break;
      case 'Enter':
        if (this.currentSlide > 0) {
          e.preventDefault();
          this.toggleFullscreen();
        }
        break;
      case 'Escape':
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        break;
    }
  }

  /**
   * Handle click navigation
   * @param {MouseEvent} e - Mouse event
   */
  handleClick(e) {
    // Only on story slides (not welcome)
    if (this.currentSlide === 0) return;
    
    // Ignore clicks on buttons and interactive elements
    if (e.target.closest('button, a, input, .nav-controls')) return;
    
    const rect = this.elements.slideContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    // Left 1/3 = previous, Right 2/3 = next
    if (x < width / 3) {
      this.prevSlide();
    } else {
      this.nextSlide();
    }
  }

  /**
   * Handle visibility change
   */
  handleVisibilityChange() {
    if (document.hidden) {
      this.pauseAutoAdvance(true);
    } else if (this.isPlaying && this.currentSlide > 0) {
      this.startAutoAdvance();
    }
  }

  /**
   * Navigate to a specific slide
   * @param {number} index - Slide index
   */
  goToSlide(index) {
    if (index < 0 || index >= this.totalSlides) return;
    
    const prevSlide = this.elements.slides[this.currentSlide];
    const nextSlide = this.elements.slides[index];
    
    // Update active state
    prevSlide?.classList.remove('active');
    nextSlide?.classList.add('active');
    
    // Trigger slide-specific animations/rendering
    this.onSlideEnter(index);
    
    this.currentSlide = index;
    this.updateSlideCounter();
    this.updateProgress();
    this.updateNavButtons();
  }

  /**
   * Go to next slide
   */
  nextSlide() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.goToSlide(this.currentSlide + 1);
      this.resetAutoAdvance();
    }
  }

  /**
   * Go to previous slide
   */
  prevSlide() {
    if (this.currentSlide > 1) { // Don't go back to welcome
      this.goToSlide(this.currentSlide - 1);
      this.resetAutoAdvance();
    }
  }

  /**
   * Called when entering a slide
   * @param {number} index - Slide index
   */
  onSlideEnter(index) {
    const delay = 300;
    
    switch (index) {
      case 2: // Velocity Chronicle
        setTimeout(() => {
          this.chartsRenderer.renderVelocityChart(this.elements.velocityChart);
        }, delay);
        break;
        
      case 3: // Grid Tapestry (Heatmap)
        setTimeout(() => {
          this.chartsRenderer.renderHeatmap(this.elements.heatmapGrid, this.elements.heatmapMonths);
        }, delay);
        break;
        
      case 4: // Composition Ledger (Commits/PRs/Issues pie)
        setTimeout(() => {
          this.populateCompositionSlide();
        }, delay);
        break;
        
      case 5: // Daily Routine (Day of week chart)
        setTimeout(() => {
          this.populateDailyRoutineSlide();
        }, delay);
        break;
        
      case 6: // Productivity Hours (Hourly chart)
        setTimeout(() => {
          this.populateProductivitySlide();
        }, delay);
        break;
        
      case 7: // Community Standing (Social stats)
        setTimeout(() => {
          this.populateCommunitySlide();
        }, delay);
        break;
        
      case 8: // Language Portfolio
        setTimeout(() => {
          this.populateLanguageSlide();
        }, delay);
        break;
        
      case 9: // Top 5 Repos
        setTimeout(() => {
          this.populateTopReposSlide();
        }, delay);
        break;
        
      case 10: // Featured Repo
        setTimeout(() => {
          this.populateFeaturedRepoSlide();
        }, delay);
        break;
        
      case 11: // Grand Finale
        setTimeout(() => {
          this.populateGrandFinaleSlide();
        }, delay);
        break;
    }
  }

  /**
   * Populate Composition Ledger slide (Slide 5)
   */
  populateCompositionSlide() {
    const { stats } = this.processedData;
    const { events } = this.userData;
    
    // Count event types
    let commits = 0, prs = 0, issues = 0, reviews = 0;
    events.forEach(event => {
      switch (event.type) {
        case 'PushEvent':
          commits += event.payload?.commits?.length || 1;
          break;
        case 'PullRequestEvent':
          prs++;
          break;
        case 'IssuesEvent':
          issues++;
          break;
        case 'PullRequestReviewEvent':
          reviews++;
          break;
      }
    });
    
    const total = commits + prs + issues + reviews || 1;
    
    // Update stat values with counts and percentages
    const commitsCountEl = document.getElementById('commits-count');
    const prsCountEl = document.getElementById('prs-count');
    const issuesCountEl = document.getElementById('issues-count');
    const reviewsCountEl = document.getElementById('reviews-count');
    
    const commitsPercentEl = document.getElementById('commits-percent');
    const prsPercentEl = document.getElementById('prs-percent');
    const issuesPercentEl = document.getElementById('issues-percent');
    const reviewsPercentEl = document.getElementById('reviews-percent');
    
    if (commitsCountEl) commitsCountEl.textContent = commits.toLocaleString();
    if (prsCountEl) prsCountEl.textContent = prs.toLocaleString();
    if (issuesCountEl) issuesCountEl.textContent = issues.toLocaleString();
    if (reviewsCountEl) reviewsCountEl.textContent = reviews.toLocaleString();
    
    if (commitsPercentEl) commitsPercentEl.textContent = `${Math.round((commits / total) * 100)}%`;
    if (prsPercentEl) prsPercentEl.textContent = `${Math.round((prs / total) * 100)}%`;
    if (issuesPercentEl) issuesPercentEl.textContent = `${Math.round((issues / total) * 100)}%`;
    if (reviewsPercentEl) reviewsPercentEl.textContent = `${Math.round((reviews / total) * 100)}%`;
    
    // Render pie chart with aurora colors
    const canvas = document.getElementById('composition-chart');
    if (canvas) {
      // Use aurora color scheme
      const activityBreakdown = {
        commits: commits,
        pullRequests: prs,
        issues: issues,
        reviews: reviews
      };
      this.chartsRenderer.renderCompositionChart(canvas, activityBreakdown);
    }
  }

  /**
   * Populate Daily Routine slide (Slide 6)
   * Note: This slide shows hourly activity in the HTML
   */
  populateDailyRoutineSlide() {
    const { events } = this.userData;
    
    // Count by hour for the bar chart
    const hourCounts = new Array(24).fill(0);
    events.forEach(event => {
      const hour = new Date(event.created_at).getHours();
      hourCounts[hour]++;
    });
    
    const maxHour = hourCounts.indexOf(Math.max(...hourCounts));
    
    // Find busiest day of week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = new Array(7).fill(0);
    events.forEach(event => {
      const day = new Date(event.created_at).getDay();
      dayCounts[day]++;
    });
    const maxDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
    
    // Update insights using actual HTML element IDs
    const peakHourEl = document.getElementById('peak-hour');
    const busiestDayEl = document.getElementById('busiest-day');
    
    if (peakHourEl) peakHourEl.textContent = `${maxHour}:00`;
    if (busiestDayEl) busiestDayEl.textContent = days[maxDayIndex].slice(0, 3);
    
    // Render hourly bar chart
    const canvas = document.getElementById('hourly-chart');
    if (canvas) {
      this.chartsRenderer.renderBarChart(canvas, hourCounts);
    }
  }

  /**
   * Populate Productivity Hours slide (Slide 7)
   */
  populateProductivitySlide() {
    const { events } = this.userData;
    
    // Count by hour
    const hourCounts = new Array(24).fill(0);
    events.forEach(event => {
      const hour = new Date(event.created_at).getHours();
      hourCounts[hour]++;
    });
    
    // Calculate time period distributions
    const morning = hourCounts.slice(6, 12).reduce((a, b) => a + b, 0);
    const afternoon = hourCounts.slice(12, 18).reduce((a, b) => a + b, 0);
    const evening = hourCounts.slice(18, 22).reduce((a, b) => a + b, 0);
    const night = [...hourCounts.slice(22), ...hourCounts.slice(0, 6)].reduce((a, b) => a + b, 0);
    const total = morning + afternoon + evening + night || 1;
    
    // Update percentage elements
    const morningEl = document.getElementById('morning-percent');
    const afternoonEl = document.getElementById('afternoon-percent');
    const eveningEl = document.getElementById('evening-percent');
    const nightEl = document.getElementById('night-percent');
    
    if (morningEl) morningEl.textContent = `${Math.round((morning / total) * 100)}%`;
    if (afternoonEl) afternoonEl.textContent = `${Math.round((afternoon / total) * 100)}%`;
    if (eveningEl) eveningEl.textContent = `${Math.round((evening / total) * 100)}%`;
    if (nightEl) nightEl.textContent = `${Math.round((night / total) * 100)}%`;
    
    // Determine persona based on time preference
    const maxPeriod = Math.max(morning, afternoon, evening, night);
    let personaName = 'The Night Owl';
    let personaEmoji = '🦉';
    let personaDesc = 'Burns midnight oil crafting code';
    
    if (maxPeriod === morning) {
      personaName = 'The Early Bird';
      personaEmoji = '🌅';
      personaDesc = 'Catches bugs at dawn';
    } else if (maxPeriod === afternoon) {
      personaName = 'The Steady Craftsman';
      personaEmoji = '⚒️';
      personaDesc = 'Prime time productivity';
    } else if (maxPeriod === evening) {
      personaName = 'The Twilight Coder';
      personaEmoji = '🌆';
      personaDesc = 'Creates magic at dusk';
    }
    
    const personaNameEl = document.getElementById('persona-name');
    const personaEmojiEl = document.getElementById('persona-emoji');
    const personaDescEl = document.getElementById('persona-desc');
    
    if (personaNameEl) personaNameEl.textContent = personaName;
    if (personaEmojiEl) personaEmojiEl.textContent = personaEmoji;
    if (personaDescEl) personaDescEl.textContent = personaDesc;
    
    // Highlight the dominant time segment on the clock
    const segments = { morning, afternoon, evening, night };
    Object.entries(segments).forEach(([period, value]) => {
      const segment = document.getElementById(`seg-${period}`);
      if (segment) {
        const opacity = Math.max(0.3, value / maxPeriod);
        segment.style.opacity = opacity;
      }
    });
  }

  /**
   * Populate Community Standing slide (Slide 8)
   */
  populateCommunitySlide() {
    const { user, repos } = this.userData;
    
    // User stats - using actual HTML element IDs
    const followersEl = document.getElementById('followers-count');
    const starsEl = document.getElementById('total-stars');
    const reposEl = document.getElementById('public-repos');
    const forksEl = document.getElementById('total-forks');
    
    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
    
    if (followersEl) followersEl.textContent = (user.followers || 0).toLocaleString();
    if (starsEl) starsEl.textContent = totalStars.toLocaleString();
    if (reposEl) reposEl.textContent = (user.public_repos || repos.length).toLocaleString();
    if (forksEl) forksEl.textContent = totalForks.toLocaleString();
  }

  /**
   * Populate Language Portfolio slide (Slide 9)
   */
  populateLanguageSlide() {
    const { repos } = this.userData;
    
    // Count languages
    const langCounts = {};
    repos.forEach(repo => {
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
      }
    });
    
    // Sort and get top languages
    const sortedLangs = Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1]);
    
    const topLangs = sortedLangs.slice(0, 6);
    const totalReposWithLang = sortedLangs.reduce((sum, [_, count]) => sum + count, 0);
    
    // Update language count
    const langCountEl = document.getElementById('language-count');
    if (langCountEl) langCountEl.textContent = sortedLangs.length;
    
    // Render language bars - using actual HTML element ID
    const container = document.getElementById('language-list');
    if (container) {
      const data = topLangs.map(([lang, count]) => ({
        label: lang,
        value: count,
        percent: Math.round((count / totalReposWithLang) * 100)
      }));
      this.chartsRenderer.renderLanguageBars(container, data);
    }
  }

  /**
   * Populate Top 5 Repos slide (Slide 10)
   */
  populateTopReposSlide() {
    // Use the pre-computed scored repos which factor in user activity (commits, PRs)
    const { scoredRepos } = this.processedData;
    const topRepos = scoredRepos?.slice(0, 5) || [];
    
    // Render repo cards - using actual HTML element ID
    const container = document.getElementById('repo-catalog');
    if (container) {
      container.innerHTML = '';
      
      if (topRepos.length === 0) {
        container.innerHTML = '<p class="font-mono" style="color: var(--text-muted);">No repositories found</p>';
        return;
      }
      
      topRepos.forEach((repo, index) => {
        const card = this.chartsRenderer.renderRepoCard(repo, index + 1);
        container.appendChild(card);
      });
    }
  }

  /**
   * Populate Featured Repo slide (Slide 11)
   */
  populateFeaturedRepoSlide() {
    // Use the pre-computed scored repos which factor in user activity
    const { scoredRepos } = this.processedData;
    
    const featured = scoredRepos?.[0];
    if (!featured) return;
    
    // Update featured repo info - using actual HTML element IDs
    const nameEl = document.getElementById('featured-name');
    const descEl = document.getElementById('featured-description');
    const langEl = document.getElementById('featured-language');
    const starsEl = document.getElementById('featured-stars');
    const forksEl = document.getElementById('featured-forks');
    const scoreEl = document.getElementById('featured-score');
    const linkEl = document.getElementById('featured-link');
    
    if (nameEl) nameEl.textContent = featured.name;
    if (descEl) descEl.textContent = featured.description || 'A remarkable piece of work';
    if (langEl) langEl.textContent = featured.language || 'Multiple';
    if (starsEl) starsEl.textContent = (featured.stargazers_count || 0).toLocaleString();
    if (forksEl) forksEl.textContent = (featured.forks_count || 0).toLocaleString();
    if (scoreEl) scoreEl.textContent = (featured.score || 0).toFixed(1);
    if (linkEl) linkEl.href = featured.html_url || '#';
  }

  /**
   * Populate Grand Finale slide (Slide 12)
   */
  populateGrandFinaleSlide() {
    const { user, repos } = this.userData;
    const { stats } = this.processedData;
    
    // Persona detection
    const persona = this.dataProcessor.detectPersona(this.userData, stats);
    
    const personaEmojiEl = document.getElementById('finale-persona-emoji');
    const personaNameEl = document.getElementById('finale-persona-name');
    
    if (personaEmojiEl) personaEmojiEl.textContent = persona.emoji || '🔧';
    if (personaNameEl) personaNameEl.textContent = persona.title || 'The Developer';
    
    // Summary stats - using actual HTML element IDs
    const contribEl = document.getElementById('finale-contributions');
    const reposEl = document.getElementById('finale-repos');
    const streakEl = document.getElementById('finale-streak');
    
    if (contribEl) contribEl.textContent = stats.totalContributions.toLocaleString();
    if (reposEl) reposEl.textContent = repos.length.toLocaleString();
    if (streakEl) streakEl.textContent = `${stats.longestStreak} days`;
  }

  /**
   * Update slide counter display
   */
  updateSlideCounter() {
    if (this.elements.currentSlideNum) {
      // Show 1-indexed for users, skip welcome slide
      const displayNum = this.currentSlide > 0 ? this.currentSlide : 1;
      this.elements.currentSlideNum.textContent = displayNum;
    }
  }

  /**
   * Update progress bar
   */
  updateProgress() {
    if (this.elements.slideProgress) {
      // Progress through story slides (not counting welcome)
      const storySlides = this.totalSlides - 1;
      const progress = this.currentSlide > 0 
        ? ((this.currentSlide) / storySlides) * 100 
        : 0;
      this.elements.slideProgress.style.width = `${progress}%`;
    }
  }

  /**
   * Update navigation button states
   */
  updateNavButtons() {
    if (this.elements.btnPrev) {
      this.elements.btnPrev.disabled = this.currentSlide <= 1;
    }
    if (this.elements.btnNext) {
      this.elements.btnNext.disabled = this.currentSlide >= this.totalSlides - 1;
    }
  }

  /**
   * Start auto-advance timer
   */
  startAutoAdvance() {
    if (!this.isPlaying) return;
    
    this.autoAdvanceTimer = setTimeout(() => {
      if (this.currentSlide < this.totalSlides - 1) {
        this.nextSlide();
        this.startAutoAdvance();
      } else {
        this.pauseAutoAdvance();
      }
    }, this.autoAdvanceDelay);
  }

  /**
   * Pause auto-advance
   * @param {boolean} temporary - If true, don't update playing state
   */
  pauseAutoAdvance(temporary = false) {
    clearTimeout(this.autoAdvanceTimer);
    this.autoAdvanceTimer = null;
    
    if (!temporary) {
      this.isPlaying = false;
      this.updatePlayButton();
    }
  }

  /**
   * Reset auto-advance timer
   */
  resetAutoAdvance() {
    if (this.isPlaying) {
      clearTimeout(this.autoAdvanceTimer);
      this.startAutoAdvance();
    }
  }

  /**
   * Toggle auto-advance
   */
  toggleAutoAdvance() {
    if (this.isPlaying) {
      this.pauseAutoAdvance();
    } else {
      this.isPlaying = true;
      this.updatePlayButton();
      this.startAutoAdvance();
    }
  }

  /**
   * Update play/pause button icon
   */
  updatePlayButton() {
    if (this.elements.iconPause && this.elements.iconPlay) {
      this.elements.iconPause.hidden = !this.isPlaying;
      this.elements.iconPlay.hidden = this.isPlaying;
      this.elements.btnPlay.setAttribute('aria-label', 
        this.isPlaying ? 'Pause auto-advance' : 'Resume auto-advance'
      );
    }
  }

  /**
   * Toggle fullscreen mode
   */
  async toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.warn('Fullscreen not supported:', error);
    }
  }

  /**
   * Show loading overlay
   */
  showLoading() {
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.hidden = false;
      this.elements.loadingOverlay.setAttribute('aria-hidden', 'false');
    }
  }

  /**
   * Hide loading overlay
   */
  hideLoading() {
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.hidden = true;
      this.elements.loadingOverlay.setAttribute('aria-hidden', 'true');
    }
  }

  /**
   * Update loading status text
   * @param {string} status - Status message
   */
  updateLoadingStatus(status) {
    if (this.elements.loadingStatus) {
      this.elements.loadingStatus.textContent = status;
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    if (this.elements.errorMessage && this.elements.errorText) {
      this.elements.errorText.textContent = message;
      this.elements.errorMessage.hidden = false;
    }
  }

  /**
   * Hide error message
   */
  hideError() {
    if (this.elements.errorMessage) {
      this.elements.errorMessage.hidden = true;
    }
  }

  /**
   * Disable form inputs
   */
  disableForm() {
    if (this.elements.usernameInput) this.elements.usernameInput.disabled = true;
    if (this.elements.tokenInput) this.elements.tokenInput.disabled = true;
    if (this.elements.playBtn) this.elements.playBtn.disabled = true;
  }

  /**
   * Enable form inputs
   */
  enableForm() {
    if (this.elements.usernameInput) this.elements.usernameInput.disabled = false;
    if (this.elements.tokenInput) this.elements.tokenInput.disabled = false;
    if (this.elements.playBtn) this.elements.playBtn.disabled = false;
  }

  /**
   * Show navigation controls
   */
  showNavControls() {
    if (this.elements.navControls) {
      this.elements.navControls.hidden = false;
    }
    if (this.elements.slideCounter) {
      this.elements.slideCounter.hidden = false;
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new GitStoryApp();
  app.init();
  
  // Expose for debugging
  window.gitStoryApp = app;
});

export { GitStoryApp };
