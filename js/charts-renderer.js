/**
 * GitStory 2025 - Charts Renderer
 * 
 * Canvas-based chart rendering for vintage-styled
 * data visualizations (line charts, heatmaps, etc.)
 */

class ChartsRenderer {
  constructor() {
    this.data = null;
    this.colors = {
      gold: '#c9a227',
      secondary: '#8b6914',
      accent: '#cd853f',
      cream: '#f5e6d3',
      dark: '#1a0f08',
      paper: '#f4e4c9',
      ink: '#2c1810',
      // Contribution levels
      level0: '#3d2817',
      level1: '#5c3d1e',
      level2: '#8b5a2b',
      level3: '#b8860b',
      level4: '#daa520',
    };
  }

  /**
   * Set processed data
   * @param {Object} data - Processed data from DataProcessor
   */
  setData(data) {
    this.data = data;
  }

  /**
   * Render velocity line chart
   * @param {HTMLCanvasElement} canvas - Target canvas element
   */
  renderVelocityChart(canvas) {
    if (!canvas || !this.data?.heatmapData) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 300 * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '300px';
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = 300;
    const padding = { top: 30, right: 30, bottom: 50, left: 60 };
    
    // Get weekly totals
    const weeks = this.data.heatmapData.weeks;
    const weeklyTotals = weeks.map(week => 
      week.reduce((sum, day) => sum + (day.isCurrentYear ? day.count : 0), 0)
    );
    
    const maxValue = Math.max(...weeklyTotals, 1);
    
    // Chart dimensions
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Background (paper texture simulation)
    ctx.fillStyle = this.colors.paper;
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle grain
    this.addGrain(ctx, width, height, 0.03);
    
    // Draw grid lines
    ctx.strokeStyle = this.colors.secondary + '30';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      
      // Y-axis labels
      const value = Math.round(maxValue - (maxValue / gridLines) * i);
      ctx.fillStyle = this.colors.ink;
      ctx.font = '12px "Courier Prime", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(value.toString(), padding.left - 10, y + 4);
    }
    
    // Draw the line chart
    if (weeklyTotals.length > 0) {
      const stepX = chartWidth / (weeklyTotals.length - 1);
      
      // Area fill
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top + chartHeight);
      
      weeklyTotals.forEach((value, index) => {
        const x = padding.left + stepX * index;
        const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
        
        if (index === 0) {
          ctx.lineTo(x, y);
        } else {
          // Smooth curve
          const prevX = padding.left + stepX * (index - 1);
          const prevY = padding.top + chartHeight - (weeklyTotals[index - 1] / maxValue) * chartHeight;
          const cpX = (prevX + x) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
      });
      
      ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
      ctx.closePath();
      
      // Gradient fill
      const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
      gradient.addColorStop(0, this.colors.gold + '40');
      gradient.addColorStop(1, this.colors.gold + '05');
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Draw the line
      ctx.beginPath();
      weeklyTotals.forEach((value, index) => {
        const x = padding.left + stepX * index;
        const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          const prevX = padding.left + stepX * (index - 1);
          const prevY = padding.top + chartHeight - (weeklyTotals[index - 1] / maxValue) * chartHeight;
          const cpX = (prevX + x) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
      });
      
      ctx.strokeStyle = this.colors.gold;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
      
      // Draw dots at data points (every 4 weeks)
      weeklyTotals.forEach((value, index) => {
        if (index % 4 === 0) {
          const x = padding.left + stepX * index;
          const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
          
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = this.colors.gold;
          ctx.fill();
          ctx.strokeStyle = this.colors.dark;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    }
    
    // X-axis labels (months)
    const months = this.data.heatmapData.months;
    ctx.fillStyle = this.colors.ink;
    ctx.font = '11px "Courier Prime", monospace';
    ctx.textAlign = 'center';
    
    months.forEach(month => {
      const x = padding.left + (month.position / weeks.length) * chartWidth;
      ctx.fillText(month.name, x, height - 15);
    });
    
    // Y-axis title
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = this.colors.ink;
    ctx.font = '12px "Courier Prime", monospace';
    ctx.fillText('Contributions', 0, 0);
    ctx.restore();
    
    // Title
    ctx.fillStyle = this.colors.ink;
    ctx.font = 'bold 14px "Courier Prime", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Weekly Contribution Velocity', padding.left, 20);
  }

  /**
   * Render contribution heatmap
   * @param {HTMLElement} gridContainer - Target grid container
   * @param {HTMLElement} monthsContainer - Month labels container
   */
  renderHeatmap(gridContainer, monthsContainer) {
    if (!gridContainer || !this.data?.heatmapData) return;
    
    const { weeks, months, maxCount } = this.data.heatmapData;
    
    // Clear containers
    gridContainer.innerHTML = '';
    monthsContainer.innerHTML = '';
    
    // Render month labels
    const containerWidth = gridContainer.offsetWidth;
    const cellSize = Math.min(14, (containerWidth - 40) / weeks.length);
    
    months.forEach(month => {
      const label = document.createElement('span');
      label.className = 'month-label font-mono';
      label.textContent = month.name;
      label.style.left = `${month.position * (cellSize + 2) + 30}px`;
      monthsContainer.appendChild(label);
    });
    
    // Render grid
    weeks.forEach((week, weekIndex) => {
      const weekColumn = document.createElement('div');
      weekColumn.className = 'heatmap-week';
      
      week.forEach((day, dayIndex) => {
        const cell = document.createElement('div');
        cell.className = `heatmap-cell level-${day.level}`;
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;
        
        if (!day.isCurrentYear) {
          cell.classList.add('outside-year');
        }
        
        // Tooltip data
        cell.setAttribute('data-date', day.date);
        cell.setAttribute('data-count', day.count);
        cell.setAttribute('title', `${day.date}: ${day.count} contribution${day.count !== 1 ? 's' : ''}`);
        
        // Animation delay for staggered reveal
        const delay = (weekIndex * 7 + dayIndex) * 2;
        cell.style.animationDelay = `${delay}ms`;
        cell.classList.add('grid-cell-animate');
        
        weekColumn.appendChild(cell);
      });
      
      gridContainer.appendChild(weekColumn);
    });
  }

  /**
   * Add subtle grain texture to canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   * @param {number} opacity - Grain opacity
   */
  addGrain(ctx, width, height, opacity = 0.05) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 255 * opacity;
      data[i] += noise;     // R
      data[i + 1] += noise; // G
      data[i + 2] += noise; // B
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Render pie chart (for activity breakdown)
   * @param {HTMLCanvasElement} canvas - Target canvas
   * @param {Object} data - Breakdown data
   */
  renderPieChart(canvas, data) {
    if (!canvas || !data) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = 300 * dpr;
    canvas.height = 300 * dpr;
    canvas.style.width = '300px';
    canvas.style.height = '300px';
    ctx.scale(dpr, dpr);
    
    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    const innerRadius = 50; // Donut chart
    
    const slices = [
      { label: 'Commits', value: data.commits, color: this.colors.gold },
      { label: 'PRs', value: data.pullRequests, color: this.colors.secondary },
      { label: 'Issues', value: data.issues, color: this.colors.accent },
      { label: 'Reviews', value: data.reviews, color: this.colors.cream },
    ].filter(s => s.value > 0);
    
    const total = slices.reduce((sum, s) => sum + s.value, 0);
    if (total === 0) return;
    
    let currentAngle = -Math.PI / 2; // Start from top
    
    slices.forEach(slice => {
      const sliceAngle = (slice.value / total) * Math.PI * 2;
      
      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.lineTo(centerX, centerY);
      ctx.closePath();
      
      ctx.fillStyle = slice.color;
      ctx.fill();
      
      ctx.strokeStyle = this.colors.dark;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      currentAngle += sliceAngle;
    });
    
    // Draw inner circle (donut hole)
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = this.colors.paper;
    ctx.fill();
    ctx.strokeStyle = this.colors.dark;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Center text
    ctx.fillStyle = this.colors.ink;
    ctx.font = 'bold 24px "Bebas Neue", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toString(), centerX, centerY - 8);
    ctx.font = '10px "Courier Prime", monospace';
    ctx.fillText('TOTAL', centerX, centerY + 12);
  }

  /**
   * Render bar chart (for hourly activity)
   * @param {HTMLCanvasElement} canvas - Target canvas
   * @param {Array} hours - Hourly activity data (24 values)
   */
  renderBarChart(canvas, hours) {
    if (!canvas || !hours) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 200 * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '200px';
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const barWidth = chartWidth / 24 - 2;
    const maxValue = Math.max(...hours, 1);
    
    // Background
    ctx.fillStyle = this.colors.paper;
    ctx.fillRect(0, 0, width, height);
    
    // Draw bars
    hours.forEach((value, hour) => {
      const barHeight = (value / maxValue) * chartHeight;
      const x = padding.left + (chartWidth / 24) * hour + 1;
      const y = padding.top + chartHeight - barHeight;
      
      // Gradient
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
      gradient.addColorStop(0, this.colors.gold);
      gradient.addColorStop(1, this.colors.secondary);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Border
      ctx.strokeStyle = this.colors.dark + '50';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barWidth, barHeight);
    });
    
    // X-axis labels
    ctx.fillStyle = this.colors.ink;
    ctx.font = '10px "Courier Prime", monospace';
    ctx.textAlign = 'center';
    
    [0, 6, 12, 18].forEach(hour => {
      const x = padding.left + (chartWidth / 24) * hour + barWidth / 2;
      const label = hour === 0 ? '12AM' : hour === 12 ? '12PM' : 
                    hour < 12 ? `${hour}AM` : `${hour - 12}PM`;
      ctx.fillText(label, x, height - 15);
    });
    
    // Y-axis
    ctx.textAlign = 'right';
    ctx.fillText('0', padding.left - 10, padding.top + chartHeight);
    ctx.fillText(maxValue.toString(), padding.left - 10, padding.top + 5);
  }

  /**
   * Render composition donut chart
   * @param {HTMLCanvasElement} canvas - Target canvas
   */
  renderCompositionChart(canvas) {
    if (!canvas || !this.data?.activityBreakdown) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    const size = 280;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);
    
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 110;
    const innerRadius = 60;
    
    const data = this.data.activityBreakdown;
    const slices = [
      { label: 'Commits', value: data.commits, color: this.colors.gold },
      { label: 'PRs', value: data.pullRequests, color: this.colors.secondary },
      { label: 'Issues', value: data.issues, color: this.colors.accent },
      { label: 'Reviews', value: data.reviews, color: this.colors.cream },
    ].filter(s => s.value > 0);
    
    const total = slices.reduce((sum, s) => sum + s.value, 0);
    if (total === 0) {
      // Draw empty state
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = this.colors.level0;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
      ctx.fillStyle = this.colors.paper;
      ctx.fill();
      return;
    }
    
    let currentAngle = -Math.PI / 2;
    
    slices.forEach((slice, index) => {
      const sliceAngle = (slice.value / total) * Math.PI * 2;
      
      // Draw slice
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      
      ctx.fillStyle = slice.color;
      ctx.fill();
      
      // Slice border
      ctx.strokeStyle = this.colors.dark;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      currentAngle += sliceAngle;
    });
    
    // Center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius - 2, 0, Math.PI * 2);
    ctx.fillStyle = this.colors.paper;
    ctx.fill();
    
    // Center text
    ctx.fillStyle = this.colors.ink;
    ctx.font = 'bold 32px "Bebas Neue", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toString(), centerX, centerY - 8);
    ctx.font = '11px "Courier Prime", monospace';
    ctx.fillText('ACTIVITIES', centerX, centerY + 14);
  }

  /**
   * Render language bars
   * @param {HTMLElement} container - Target container
   * @param {Array} data - Optional array of { label, value, percent }
   */
  renderLanguageBars(container, data = null) {
    if (!container) return;
    
    container.innerHTML = '';
    
    // Use provided data or fall back to this.data.languages
    let languages;
    if (data) {
      languages = data;
    } else if (this.data?.languages?.languages) {
      languages = this.data.languages.languages.map(l => ({
        label: l.name,
        value: l.count || 0,
        percent: parseFloat(l.percentage) || 0
      }));
    } else {
      container.innerHTML = '<p class="font-mono" style="color: var(--vintage-light);">No language data available</p>';
      return;
    }
    
    if (languages.length === 0) {
      container.innerHTML = '<p class="font-mono" style="color: var(--vintage-light);">No language data available</p>';
      return;
    }
    
    // Get top 6 languages
    const topLanguages = languages.slice(0, 6);
    const maxPercent = Math.max(...topLanguages.map(l => l.percent || 0), 1);
    
    // Language colors (approximate GitHub colors)
    const langColors = {
      'JavaScript': '#f1e05a',
      'TypeScript': '#3178c6',
      'Python': '#3572A5',
      'Java': '#b07219',
      'C++': '#f34b7d',
      'C#': '#178600',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'Ruby': '#701516',
      'PHP': '#4F5D95',
      'Swift': '#F05138',
      'Kotlin': '#A97BFF',
      'Dart': '#00B4AB',
      'HTML': '#e34c26',
      'CSS': '#563d7c',
      'Shell': '#89e051',
      'Vue': '#41b883',
      'Svelte': '#ff3e00',
    };
    
    topLanguages.forEach((lang, index) => {
      const item = document.createElement('div');
      item.className = 'language-item';
      item.style.animationDelay = `${index * 100}ms`;
      
      const barWidth = maxPercent > 0 
        ? (lang.percent / maxPercent) * 100 
        : 0;
      
      const color = langColors[lang.label] || this.colors.gold;
      
      item.innerHTML = `
        <div class="language-header">
          <span class="language-name font-mono">${lang.label}</span>
          <span class="language-percent font-display">${lang.percent}%</span>
        </div>
        <div class="language-bar-bg">
          <div class="language-bar-fill" style="width: ${barWidth}%; background-color: ${color};"></div>
        </div>
      `;
      
      container.appendChild(item);
    });
  }

  /**
   * Render top repositories
   * @param {HTMLElement} container - Target container
   */
  renderTopRepos(container) {
    if (!container || !this.data?.scoredRepos) return;
    
    const repos = this.data.scoredRepos.slice(0, 5);
    container.innerHTML = '';
    
    if (repos.length === 0) {
      container.innerHTML = '<p class="font-mono" style="color: var(--vintage-light);">No repositories found</p>';
      return;
    }
    
    repos.forEach((repo, index) => {
      const card = document.createElement('div');
      card.className = 'repo-card';
      card.style.animationDelay = `${index * 150}ms`;
      
      const langColor = this.getLanguageColor(repo.language);
      
      card.innerHTML = `
        <div class="repo-rank font-display">#${index + 1}</div>
        <div class="repo-info">
          <h4 class="repo-name font-mono">${repo.name}</h4>
          <p class="repo-desc">${repo.description || 'No description'}</p>
          <div class="repo-meta">
            ${repo.language ? `<span class="repo-lang"><span class="lang-dot" style="background: ${langColor}"></span>${repo.language}</span>` : ''}
            <span class="repo-stars">★ ${repo.stargazers_count}</span>
            <span class="repo-forks">⑂ ${repo.forks_count}</span>
          </div>
        </div>
        <div class="repo-score font-display">${repo.score.toFixed(1)}</div>
      `;
      
      container.appendChild(card);
    });
  }

  /**
   * Get language color
   * @param {string} language - Programming language
   * @returns {string} - Color hex
   */
  getLanguageColor(language) {
    const colors = {
      'JavaScript': '#f1e05a',
      'TypeScript': '#3178c6',
      'Python': '#3572A5',
      'Java': '#b07219',
      'C++': '#f34b7d',
      'C#': '#178600',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'Ruby': '#701516',
      'PHP': '#4F5D95',
      'Swift': '#F05138',
      'Kotlin': '#A97BFF',
      'HTML': '#e34c26',
      'CSS': '#563d7c',
      'Shell': '#89e051',
      'Vue': '#41b883',
    };
    return colors[language] || this.colors.gold;
  }

  /**
   * Get featured repository data
   * @returns {Object|null}
   */
  getFeaturedRepo() {
    if (!this.data?.scoredRepos?.length) return null;
    return this.data.scoredRepos[0];
  }

  /**
   * Render hourly activity chart (clock-style)
   * @param {HTMLCanvasElement} canvas - Target canvas
   * @param {Array} hourCounts - Array of 24 hourly counts
   */
  renderHourlyChart(canvas, hourCounts) {
    if (!canvas || !hourCounts) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    const size = Math.min(canvas.parentElement.offsetWidth, 300);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);
    
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;
    const maxCount = Math.max(...hourCounts, 1);
    
    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 20, 0, Math.PI * 2);
    ctx.fillStyle = this.colors.paper;
    ctx.fill();
    ctx.strokeStyle = this.colors.secondary + '50';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw radial bars for each hour
    for (let hour = 0; hour < 24; hour++) {
      const angle = (hour / 24) * Math.PI * 2 - Math.PI / 2;
      const value = hourCounts[hour];
      const barLength = (value / maxCount) * radius * 0.6;
      
      const innerRadius = radius * 0.3;
      const x1 = centerX + Math.cos(angle) * innerRadius;
      const y1 = centerY + Math.sin(angle) * innerRadius;
      const x2 = centerX + Math.cos(angle) * (innerRadius + barLength);
      const y2 = centerY + Math.sin(angle) * (innerRadius + barLength);
      
      // Bar gradient
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, this.colors.secondary);
      gradient.addColorStop(1, this.colors.gold);
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    
    // Hour labels
    ctx.fillStyle = this.colors.ink;
    ctx.font = '10px "Courier Prime", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    [0, 6, 12, 18].forEach(hour => {
      const angle = (hour / 24) * Math.PI * 2 - Math.PI / 2;
      const labelRadius = radius + 12;
      const x = centerX + Math.cos(angle) * labelRadius;
      const y = centerY + Math.sin(angle) * labelRadius;
      const label = hour === 0 ? '12AM' : hour === 12 ? '12PM' : 
                    hour < 12 ? `${hour}AM` : `${hour - 12}PM`;
      ctx.fillText(label, x, y);
    });
    
    // Center decoration
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
    ctx.fillStyle = this.colors.dark;
    ctx.fill();
    ctx.fillStyle = this.colors.gold;
    ctx.font = 'bold 12px "Bebas Neue", sans-serif';
    ctx.fillText('24H', centerX, centerY);
  }

  /**
   * Render donut chart (for community/social stats)
   * @param {HTMLCanvasElement} canvas - Target canvas
   * @param {Array} data - Array of { label, value, color }
   */
  renderDonutChart(canvas, data) {
    if (!canvas || !data) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    const size = 260;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);
    
    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = 100;
    const innerRadius = 55;
    
    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
      ctx.fillStyle = this.colors.level0;
      ctx.fill();
      return;
    }
    
    let currentAngle = -Math.PI / 2;
    
    data.forEach(slice => {
      const sliceAngle = (slice.value / total) * Math.PI * 2;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      
      ctx.fillStyle = slice.color;
      ctx.fill();
      ctx.strokeStyle = this.colors.dark;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      currentAngle += sliceAngle;
    });
    
    // Inner circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius - 2, 0, Math.PI * 2);
    ctx.fillStyle = this.colors.paper;
    ctx.fill();
    
    // Center text
    ctx.fillStyle = this.colors.ink;
    ctx.font = 'bold 28px "Bebas Neue", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toLocaleString(), centerX, centerY - 5);
    ctx.font = '10px "Courier Prime", monospace';
    ctx.fillText('TOTAL', centerX, centerY + 12);
  }

  /**
   * Render a single repository card element
   * @param {Object} repo - Repository data
   * @param {number} rank - Rank number (1-5)
   * @returns {HTMLElement} - Card element
   */
  renderRepoCard(repo, rank) {
    const card = document.createElement('div');
    card.className = 'repo-card';
    card.style.animationDelay = `${(rank - 1) * 150}ms`;
    
    const langColor = this.getLanguageColor(repo.language);
    
    card.innerHTML = `
      <div class="repo-rank font-display">#${rank}</div>
      <div class="repo-info">
        <h4 class="repo-name font-mono">${repo.name}</h4>
        <p class="repo-desc">${repo.description || 'A work of code artistry'}</p>
        <div class="repo-meta">
          ${repo.language ? `<span class="repo-lang"><span class="lang-dot" style="background: ${langColor}"></span>${repo.language}</span>` : ''}
          <span class="repo-stars">★ ${(repo.stargazers_count || 0).toLocaleString()}</span>
          <span class="repo-forks">⑂ ${(repo.forks_count || 0).toLocaleString()}</span>
        </div>
      </div>
      <div class="repo-score font-display">${(repo.score || 0).toFixed(1)}</div>
    `;
    
    return card;
  }
}

export { ChartsRenderer };
