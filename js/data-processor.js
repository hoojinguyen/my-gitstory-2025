/**
 * GitStory 2025 - Data Processor
 * 
 * Processes raw GitHub data into meaningful statistics,
 * repository scoring, and activity pattern analysis.
 */

class DataProcessor {
  constructor() {
    this.year = new Date().getFullYear();
  }

  /**
   * Process all data
   * @param {Object} rawData - Raw data from GitHub API
   * @returns {Object} - Processed data
   */
  processAll(rawData) {
    const { user, repos, events, contributions, languages } = rawData;
    
    // Calculate user activity per repo from events
    const repoActivity = this.calculateRepoActivity(events);
    
    // Get repos where user actually contributed (commits, PRs)
    const topContributedRepos = this.getTopContributedRepos(events, repos);
    
    return {
      stats: this.calculateStats(contributions, repos, user),
      heatmapData: this.processHeatmap(contributions),
      activityBreakdown: this.calculateActivityBreakdown(events),
      hourlyActivity: this.calculateHourlyActivity(events),
      scoredRepos: this.scoreRepositories(repos, repoActivity),
      topContributedRepos, // NEW: Repos where user actually contributed
      repoActivity,
      languages,
      persona: this.determinePersona(contributions, repos, user, events),
    };
  }

  /**
   * Calculate user's activity (commits, PRs) per repository from events
   * @param {Array} events - GitHub events
   * @returns {Object} - Map of repo name to activity counts
   */
  calculateRepoActivity(events) {
    const activity = {};
    
    for (const event of events || []) {
      const repoName = event.repo?.name?.split('/')[1] || event.repo?.name;
      if (!repoName) continue;
      
      if (!activity[repoName]) {
        activity[repoName] = { commits: 0, pullRequests: 0, issues: 0, total: 0 };
      }
      
      switch (event.type) {
        case 'PushEvent':
          const commitCount = event.payload?.commits?.length || 1;
          activity[repoName].commits += commitCount;
          activity[repoName].total += commitCount;
          break;
        case 'PullRequestEvent':
          activity[repoName].pullRequests++;
          activity[repoName].total++;
          break;
        case 'PullRequestReviewEvent':
        case 'PullRequestReviewCommentEvent':
          activity[repoName].pullRequests++;
          activity[repoName].total++;
          break;
        case 'IssuesEvent':
        case 'IssueCommentEvent':
          activity[repoName].issues++;
          activity[repoName].total++;
          break;
        case 'CreateEvent':
        case 'DeleteEvent':
        case 'WatchEvent':
        case 'ForkEvent':
          activity[repoName].total++;
          break;
      }
    }
    
    return activity;
  }

  /**
   * Get top contributed repos - repos where user actually made commits/PRs
   * This includes both owned repos and repos user contributed to
   * @param {Array} events - GitHub events
   * @param {Array} ownedRepos - User's owned repos for metadata
   * @returns {Array} - Top repos with contribution data
   */
  getTopContributedRepos(events, ownedRepos = []) {
    const repoContributions = {};
    const repoMetadata = {};
    
    // Create lookup for owned repos
    const ownedRepoMap = {};
    for (const repo of ownedRepos) {
      ownedRepoMap[repo.name] = repo;
      ownedRepoMap[repo.full_name] = repo;
    }
    
    // Analyze events to find repos with actual contributions
    for (const event of events || []) {
      const fullRepoName = event.repo?.name; // e.g., "owner/repo"
      const repoName = fullRepoName?.split('/')[1] || fullRepoName;
      if (!repoName || !fullRepoName) continue;
      
      if (!repoContributions[fullRepoName]) {
        repoContributions[fullRepoName] = {
          name: repoName,
          fullName: fullRepoName,
          commits: 0,
          pullRequests: 0,
          reviews: 0,
          issues: 0,
          total: 0,
          lastActivity: null,
        };
      }
      
      const contrib = repoContributions[fullRepoName];
      const eventDate = new Date(event.created_at);
      
      // Track last activity date
      if (!contrib.lastActivity || eventDate > contrib.lastActivity) {
        contrib.lastActivity = eventDate;
      }
      
      // Count meaningful contributions (commits and PRs are most important)
      switch (event.type) {
        case 'PushEvent':
          const commitCount = event.payload?.commits?.length || 1;
          contrib.commits += commitCount;
          contrib.total += commitCount * 2; // Weight commits higher
          break;
        case 'PullRequestEvent':
          if (event.payload?.action === 'opened' || event.payload?.action === 'closed') {
            contrib.pullRequests++;
            contrib.total += 3; // PRs are very valuable
          }
          break;
        case 'PullRequestReviewEvent':
          contrib.reviews++;
          contrib.total += 2;
          break;
        case 'PullRequestReviewCommentEvent':
          contrib.reviews++;
          contrib.total += 1;
          break;
        case 'IssuesEvent':
          if (event.payload?.action === 'opened') {
            contrib.issues++;
            contrib.total += 1;
          }
          break;
        case 'IssueCommentEvent':
          contrib.issues++;
          contrib.total += 0.5;
          break;
      }
      
      // Store repo URL if available
      if (event.repo?.url) {
        repoMetadata[fullRepoName] = {
          url: `https://github.com/${fullRepoName}`,
          htmlUrl: `https://github.com/${fullRepoName}`,
        };
      }
    }
    
    // Filter to only repos with actual commits or PRs (real contributions)
    const contributedRepos = Object.values(repoContributions)
      .filter(repo => repo.commits > 0 || repo.pullRequests > 0 || repo.reviews > 0)
      .map(repo => {
        // Merge with owned repo data if available
        const ownedRepo = ownedRepoMap[repo.name] || ownedRepoMap[repo.fullName];
        const metadata = repoMetadata[repo.fullName] || {};
        
        return {
          name: repo.name,
          full_name: repo.fullName,
          description: ownedRepo?.description || `Contributed ${repo.commits} commits`,
          language: ownedRepo?.language || null,
          stargazers_count: ownedRepo?.stargazers_count || 0,
          forks_count: ownedRepo?.forks_count || 0,
          html_url: ownedRepo?.html_url || metadata.htmlUrl || `https://github.com/${repo.fullName}`,
          isOwned: !!ownedRepo,
          userActivity: {
            commits: repo.commits,
            pullRequests: repo.pullRequests,
            reviews: repo.reviews,
            issues: repo.issues,
            total: repo.total,
          },
          score: repo.total, // Score based on contribution weight
          lastActivity: repo.lastActivity,
        };
      })
      .sort((a, b) => b.score - a.score);
    
    return contributedRepos;
  }

  /**
   * Calculate contribution statistics
   * @param {Object} contributions - Contribution data
   * @param {Array} repos - Repository list
   * @param {Object} user - User profile
   * @returns {Object} - Statistics
   */
  calculateStats(contributions, repos, user) {
    const contribArray = contributions?.contributions || [];
    const yearContribs = contribArray.filter(c => 
      new Date(c.date).getFullYear() === this.year
    );
    
    // Total contributions
    const totalContributions = yearContribs.reduce((sum, c) => sum + c.count, 0);
    
    // Daily average
    const daysInYear = this.getDaysElapsedInYear();
    const dailyAverage = daysInYear > 0 ? totalContributions / daysInYear : 0;
    
    // Best day
    const bestDay = yearContribs.reduce((best, c) => 
      c.count > best.count ? c : best, 
      { date: '', count: 0 }
    );
    
    // Longest streak
    const longestStreak = this.calculateLongestStreak(yearContribs);
    
    // Current streak
    const currentStreak = this.calculateCurrentStreak(yearContribs);
    
    // Active days
    const activeDays = yearContribs.filter(c => c.count > 0).length;
    
    return {
      totalContributions,
      dailyAverage,
      bestDay,
      longestStreak,
      currentStreak,
      activeDays,
      totalRepos: repos.length,
      publicRepos: user.public_repos,
      followers: user.followers,
      following: user.following,
      totalStars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
      totalForks: repos.reduce((sum, r) => sum + r.forks_count, 0),
    };
  }

  /**
   * Get days elapsed in current year
   * @returns {number}
   */
  getDaysElapsedInYear() {
    const now = new Date();
    const startOfYear = new Date(this.year, 0, 1);
    const diffTime = now - startOfYear;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  /**
   * Calculate longest contribution streak
   * @param {Array} contributions - Daily contribution data
   * @returns {number} - Longest streak in days
   */
  calculateLongestStreak(contributions) {
    let maxStreak = 0;
    let currentStreak = 0;
    
    // Sort by date
    const sorted = [...contributions].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    for (const day of sorted) {
      if (day.count > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return maxStreak;
  }

  /**
   * Calculate current contribution streak
   * @param {Array} contributions - Daily contribution data
   * @returns {number} - Current streak in days
   */
  calculateCurrentStreak(contributions) {
    const today = new Date().toISOString().split('T')[0];
    const sorted = [...contributions]
      .filter(c => c.date <= today)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let streak = 0;
    for (const day of sorted) {
      if (day.count > 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  /**
   * Process heatmap data
   * @param {Object} contributions - Contribution data
   * @returns {Object} - Heatmap ready data
   */
  processHeatmap(contributions) {
    const contribArray = contributions?.contributions || [];
    const yearContribs = contribArray.filter(c => 
      new Date(c.date).getFullYear() === this.year
    );
    
    // Create a map for quick lookup
    const contribMap = new Map();
    for (const c of yearContribs) {
      contribMap.set(c.date, c.count);
    }
    
    // Generate all weeks of the year
    const weeks = [];
    const startDate = new Date(this.year, 0, 1);
    
    // Adjust to start from Sunday
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);
    
    let currentDate = new Date(startDate);
    let weekData = [];
    
    while (currentDate.getFullYear() <= this.year) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const count = contribMap.get(dateStr) || 0;
      
      weekData.push({
        date: dateStr,
        count,
        level: this.getContributionLevel(count),
        dayOfWeek: currentDate.getDay(),
        isCurrentYear: currentDate.getFullYear() === this.year,
      });
      
      if (weekData.length === 7) {
        weeks.push(weekData);
        weekData = [];
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Add remaining days
    if (weekData.length > 0) {
      weeks.push(weekData);
    }
    
    // Calculate max for scaling
    const maxCount = Math.max(...yearContribs.map(c => c.count), 1);
    
    return {
      weeks,
      maxCount,
      months: this.getMonthLabels(weeks),
    };
  }

  /**
   * Get contribution level (0-4)
   * @param {number} count - Contribution count
   * @returns {number} - Level 0-4
   */
  getContributionLevel(count) {
    if (count === 0) return 0;
    if (count <= 3) return 1;
    if (count <= 6) return 2;
    if (count <= 9) return 3;
    return 4;
  }

  /**
   * Get month labels for heatmap
   * @param {Array} weeks - Week data
   * @returns {Array} - Month labels with positions
   */
  getMonthLabels(weeks) {
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let lastMonth = -1;
    
    weeks.forEach((week, index) => {
      const firstDay = week.find(d => d.isCurrentYear);
      if (firstDay) {
        const month = new Date(firstDay.date).getMonth();
        if (month !== lastMonth) {
          months.push({
            name: monthNames[month],
            position: index,
          });
          lastMonth = month;
        }
      }
    });
    
    return months;
  }

  /**
   * Calculate activity breakdown by type
   * @param {Array} events - GitHub events
   * @returns {Object} - Activity breakdown
   */
  calculateActivityBreakdown(events) {
    const breakdown = {
      commits: 0,
      pullRequests: 0,
      issues: 0,
      reviews: 0,
      other: 0,
    };
    
    for (const event of events) {
      switch (event.type) {
        case 'PushEvent':
          breakdown.commits += event.payload?.commits?.length || 1;
          break;
        case 'PullRequestEvent':
          breakdown.pullRequests++;
          break;
        case 'IssuesEvent':
        case 'IssueCommentEvent':
          breakdown.issues++;
          break;
        case 'PullRequestReviewEvent':
        case 'PullRequestReviewCommentEvent':
          breakdown.reviews++;
          break;
        default:
          breakdown.other++;
      }
    }
    
    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
    
    return {
      ...breakdown,
      total,
      percentages: {
        commits: total > 0 ? ((breakdown.commits / total) * 100).toFixed(1) : 0,
        pullRequests: total > 0 ? ((breakdown.pullRequests / total) * 100).toFixed(1) : 0,
        issues: total > 0 ? ((breakdown.issues / total) * 100).toFixed(1) : 0,
        reviews: total > 0 ? ((breakdown.reviews / total) * 100).toFixed(1) : 0,
      },
    };
  }

  /**
   * Calculate hourly activity distribution
   * @param {Array} events - GitHub events
   * @returns {Object} - Hourly activity data
   */
  calculateHourlyActivity(events) {
    const hours = Array(24).fill(0);
    const days = Array(7).fill(0);
    
    for (const event of events) {
      const date = new Date(event.created_at);
      hours[date.getHours()]++;
      days[date.getDay()]++;
    }
    
    // Find peak hour
    const peakHour = hours.indexOf(Math.max(...hours));
    
    // Find busiest day
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const busiestDayIndex = days.indexOf(Math.max(...days));
    
    // Calculate time of day breakdown
    const timeOfDay = {
      morning: hours.slice(6, 12).reduce((a, b) => a + b, 0),   // 6am - 12pm
      afternoon: hours.slice(12, 18).reduce((a, b) => a + b, 0), // 12pm - 6pm
      evening: hours.slice(18, 22).reduce((a, b) => a + b, 0),   // 6pm - 10pm
      night: [...hours.slice(22), ...hours.slice(0, 6)].reduce((a, b) => a + b, 0), // 10pm - 6am
    };
    
    const totalTimeOfDay = Object.values(timeOfDay).reduce((a, b) => a + b, 0);
    
    return {
      hours,
      days,
      peakHour,
      peakHourFormatted: this.formatHour(peakHour),
      busiestDay: dayNames[busiestDayIndex],
      busiestDayIndex,
      timeOfDay,
      timeOfDayPercentages: {
        morning: totalTimeOfDay > 0 ? ((timeOfDay.morning / totalTimeOfDay) * 100).toFixed(1) : 0,
        afternoon: totalTimeOfDay > 0 ? ((timeOfDay.afternoon / totalTimeOfDay) * 100).toFixed(1) : 0,
        evening: totalTimeOfDay > 0 ? ((timeOfDay.evening / totalTimeOfDay) * 100).toFixed(1) : 0,
        night: totalTimeOfDay > 0 ? ((timeOfDay.night / totalTimeOfDay) * 100).toFixed(1) : 0,
      },
    };
  }

  /**
   * Format hour to readable string
   * @param {number} hour - Hour (0-23)
   * @returns {string}
   */
  formatHour(hour) {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${suffix}`;
  }

  /**
   * Score repositories by importance
   * Factors in user's actual commits, PRs, and activity
   * @param {Array} repos - Repository list
   * @param {Object} repoActivity - User's activity per repo from events
   * @returns {Array} - Scored and sorted repositories
   */
  scoreRepositories(repos, repoActivity = {}) {
    const now = new Date();
    
    // Find max activity to normalize scores
    const maxActivity = Math.max(
      ...Object.values(repoActivity).map(a => a.total || 0),
      1
    );
    
    const scored = repos.map(repo => {
      let score = 0;
      const activity = repoActivity[repo.name] || { commits: 0, pullRequests: 0, issues: 0, total: 0 };
      
      // 1. User's commits and activity (35%) - MOST IMPORTANT
      // This reflects repos the user actually worked on
      const userActivityScore = Math.min(35, (activity.total / maxActivity) * 35 + 
        (activity.commits > 0 ? 10 : 0) + 
        (activity.pullRequests > 0 ? 5 : 0));
      
      // 2. Recent activity (20%) - time decay
      const lastUpdate = new Date(repo.pushed_at);
      const daysSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 20 - (daysSinceUpdate / 15));
      
      // 3. Stars (15%) - logarithmic scale
      const starsScore = Math.log10(repo.stargazers_count + 1) * 10;
      
      // 4. Forks (10%) - logarithmic scale
      const forksScore = Math.log10(repo.forks_count + 1) * 8;
      
      // 5. Originality (10%) - bonus for non-forked
      const originalityScore = repo.fork ? 0 : 10;
      
      // 6. Description quality (5%)
      const descScore = repo.description ? 
        Math.min(5, repo.description.length / 40) : 0;
      
      // 7. Size/complexity (5%)
      const sizeScore = Math.min(5, Math.log10(repo.size + 1));
      
      score = userActivityScore + recencyScore + starsScore + forksScore + 
              originalityScore + descScore + sizeScore;
      
      return {
        ...repo,
        score: Math.round(score * 10) / 10,
        userActivity: activity,
        scoreBreakdown: {
          userActivity: Math.round(userActivityScore * 10) / 10,
          recency: Math.round(recencyScore * 10) / 10,
          stars: Math.round(starsScore * 10) / 10,
          forks: Math.round(forksScore * 10) / 10,
          originality: originalityScore,
          description: Math.round(descScore * 10) / 10,
          size: Math.round(sizeScore * 10) / 10,
        },
      };
    });
    
    // Sort by score descending
    return scored.sort((a, b) => b.score - a.score);
  }

  /**
   * Determine user's coding persona
   * @param {Object} contributions - Contribution data
   * @param {Array} repos - Repository list
   * @param {Object} user - User profile
   * @param {Array} events - GitHub events
   * @returns {Object} - Persona information
   */
  determinePersona(contributions, repos, user, events) {
    const hourlyData = this.calculateHourlyActivity(events);
    const contribArray = contributions?.contributions || [];
    const yearContribs = contribArray.filter(c => 
      new Date(c.date).getFullYear() === this.year
    );
    
    const totalContribs = yearContribs.reduce((sum, c) => sum + c.count, 0);
    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    
    // Calculate weekend vs weekday ratio
    const weekdayContribs = yearContribs.filter(c => {
      const day = new Date(c.date).getDay();
      return day > 0 && day < 6;
    }).reduce((sum, c) => sum + c.count, 0);
    
    const weekendContribs = totalContribs - weekdayContribs;
    const weekendRatio = totalContribs > 0 ? weekendContribs / totalContribs : 0;
    
    // Determine persona based on patterns
    const personas = [
      {
        id: 'night-owl',
        name: 'Night Owl',
        emoji: '🌙',
        description: 'You do your best work when the world sleeps.',
        condition: () => hourlyData.peakHour >= 22 || hourlyData.peakHour < 4,
      },
      {
        id: 'early-bird',
        name: 'Early Bird',
        emoji: '🌅',
        description: 'First light, first commit. You start before others wake.',
        condition: () => hourlyData.peakHour >= 5 && hourlyData.peakHour < 9,
      },
      {
        id: 'weekend-warrior',
        name: 'Weekend Warrior',
        emoji: '🗓️',
        description: 'Your weekends are for passion projects and side quests.',
        condition: () => weekendRatio > 0.35,
      },
      {
        id: 'grid-painter',
        name: 'Grid Painter',
        emoji: '🎨',
        description: 'Your contribution graph is a masterpiece of green.',
        condition: () => totalContribs >= 1200,
      },
      {
        id: 'consistent',
        name: 'The Consistent',
        emoji: '⚡',
        description: 'Steady progress, reliable output. You show up every day.',
        condition: () => totalContribs >= 400,
      },
      {
        id: 'community-star',
        name: 'Community Star',
        emoji: '⭐',
        description: 'Your work inspires others. The community looks up to you.',
        condition: () => user.followers >= 500 || totalStars >= 1000,
      },
    ];
    
    // Find matching persona
    const matchedPersona = personas.find(p => p.condition()) || {
      id: 'tinkerer',
      name: 'The Tinkerer',
      emoji: '🔧',
      description: 'Curious explorer of code, always learning and experimenting.',
    };
    
    return {
      ...matchedPersona,
      stats: {
        totalContribs,
        weekendRatio: Math.round(weekendRatio * 100),
        peakHour: hourlyData.peakHourFormatted,
        followers: user.followers,
        stars: totalStars,
      },
    };
  }

  /**
   * Calculate score for a single repository
   * @param {Object} repo - Repository object
   * @returns {number} - Score value
   */
  calculateRepoScore(repo) {
    const now = new Date();
    let score = 0;
    
    // Stars (25%)
    const starsScore = Math.log10((repo.stargazers_count || 0) + 1) * 25;
    
    // Forks (20%)
    const forksScore = Math.log10((repo.forks_count || 0) + 1) * 20;
    
    // Recent activity (25%)
    const lastUpdate = new Date(repo.pushed_at || repo.updated_at);
    const daysSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60 * 24);
    const activityScore = Math.max(0, 25 - (daysSinceUpdate / 10));
    
    // Originality (15%)
    const originalityScore = repo.fork ? 0 : 15;
    
    // Description (10%)
    const descScore = repo.description ? Math.min(10, repo.description.length / 20) : 0;
    
    // Size (5%)
    const sizeScore = Math.min(5, Math.log10((repo.size || 0) + 1));
    
    score = starsScore + forksScore + activityScore + originalityScore + descScore + sizeScore;
    return Math.round(score * 10) / 10;
  }

  /**
   * Detect persona from user data and stats
   * @param {Object} userData - Raw user data
   * @param {Object} stats - Processed stats
   * @returns {Object} - Persona with title, emoji, description
   */
  detectPersona(userData, stats) {
    const { user, repos, events } = userData;
    const hourlyData = this.calculateHourlyActivity(events || []);
    const totalStars = repos?.reduce((sum, r) => sum + (r.stargazers_count || 0), 0) || 0;
    
    // Peak hour based persona
    const peakHour = hourlyData.peakHour;
    
    if (peakHour >= 22 || peakHour < 4) {
      return {
        title: 'Night Owl',
        emoji: '🌙',
        description: 'You do your best work when the world sleeps.'
      };
    }
    
    if (peakHour >= 5 && peakHour < 9) {
      return {
        title: 'Early Bird',
        emoji: '🌅',
        description: 'First light, first commit. You start before others wake.'
      };
    }
    
    // Stats based persona
    if (stats.totalContributions >= 1200) {
      return {
        title: 'Grid Painter',
        emoji: '🎨',
        description: 'Your contribution graph is a masterpiece of green.'
      };
    }
    
    if (user?.followers >= 500 || totalStars >= 1000) {
      return {
        title: 'Community Star',
        emoji: '⭐',
        description: 'Your work inspires others. The community looks up to you.'
      };
    }
    
    if (stats.longestStreak >= 30) {
      return {
        title: 'The Consistent',
        emoji: '⚡',
        description: 'Steady progress, reliable output. You show up every day.'
      };
    }
    
    // Default
    return {
      title: 'The Tinkerer',
      emoji: '🔧',
      description: 'Curious explorer of code, always learning and experimenting.'
    };
  }
}

export { DataProcessor };
