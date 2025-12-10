/**
 * GitStory 2025 - Charts Renderer
 * 
 * Canvas-based chart rendering for modern aurora-styled
 * data visualizations (line charts, heatmaps, etc.)
 */

class ChartsRenderer {
  constructor() {
    this.data = null;
    // Modern Aurora color palette
    this.colors = {
      // Aurora gradients
      aurora1: '#667eea',
      aurora2: '#764ba2',
      aurora3: '#f093fb',
      aurora4: '#f5576c',
      
      // Background colors
      dark: '#0f0f23',
      darkSecondary: '#1a1a2e',
      surface: '#16213e',
      
      // Text colors
      textPrimary: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
      textMuted: 'rgba(255, 255, 255, 0.4)',
      
      // Chart specific
      gridLine: 'rgba(255, 255, 255, 0.1)',
      gridLineFaint: 'rgba(255, 255, 255, 0.05)',
      
      // Contribution levels (green theme for heatmap)
      level0: 'rgba(255, 255, 255, 0.05)',
      level1: '#0e4429',
      level2: '#006d32',
      level3: '#26a641',
      level4: '#39d353',
      
      // Accent colors for charts
      accent1: '#00d4ff',
      accent2: '#ff6b9d',
      accent3: '#c084fc',
      accent4: '#fbbf24',
      accent5: '#34d399',
    };
    
    // Gradient definitions for reuse
    this.gradients = {};
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
    
    // Dark background with subtle gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, this.colors.dark);
    bgGradient.addColorStop(1, this.colors.darkSecondary);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = this.colors.gridLine;
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
      ctx.fillStyle = this.colors.textMuted;
      ctx.font = '12px "Fira Code", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(value.toString(), padding.left - 10, y + 4);
    }
    
    // Draw the line chart
    if (weeklyTotals.length > 0) {
      const stepX = chartWidth / (weeklyTotals.length - 1);
      
      // Area fill with aurora gradient
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
      
      // Aurora gradient fill
      const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
      gradient.addColorStop(0, this.colors.aurora1 + '60');
      gradient.addColorStop(0.5, this.colors.aurora2 + '30');
      gradient.addColorStop(1, this.colors.aurora3 + '05');
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Draw the line with glow effect
      ctx.shadowColor = this.colors.aurora1;
      ctx.shadowBlur = 15;
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
      
      // Create line gradient
      const lineGradient = ctx.createLinearGradient(padding.left, 0, width - padding.right, 0);
      lineGradient.addColorStop(0, this.colors.aurora1);
      lineGradient.addColorStop(0.5, this.colors.aurora2);
      lineGradient.addColorStop(1, this.colors.aurora3);
      
      ctx.strokeStyle = lineGradient;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Draw glowing dots at data points (every 4 weeks)
      weeklyTotals.forEach((value, index) => {
        if (index % 4 === 0) {
          const x = padding.left + stepX * index;
          const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
          
          // Outer glow
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.fillStyle = this.colors.aurora1 + '30';
          ctx.fill();
          
          // Inner dot
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = this.colors.aurora3;
          ctx.fill();
        }
      });
    }
    
    // X-axis labels (months)
    const months = this.data.heatmapData.months;
    ctx.fillStyle = this.colors.textMuted;
    ctx.font = '11px "Fira Code", monospace';
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
    ctx.fillStyle = this.colors.textSecondary;
    ctx.font = '12px "Fira Code", monospace';
    ctx.fillText('Contributions', 0, 0);
    ctx.restore();
    
    // Title with gradient effect
    ctx.fillStyle = this.colors.textPrimary;
    ctx.font = 'bold 14px "Space Grotesk", sans-serif';
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
    
    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();
    
    // Render grid - simplified animation for better performance
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
        
        // Simplified animation - only animate by week, not each cell
        // This reduces animation complexity significantly
        cell.style.opacity = '0';
        cell.style.transform = 'scale(0.8)';
        
        weekColumn.appendChild(cell);
      });
      
      fragment.appendChild(weekColumn);
    });
    
    gridContainer.appendChild(fragment);
    
    // Batch animate weeks for better performance
    requestAnimationFrame(() => {
      const weekColumns = gridContainer.querySelectorAll('.heatmap-week');
      weekColumns.forEach((week, weekIndex) => {
        setTimeout(() => {
          const cells = week.querySelectorAll('.heatmap-cell');
          cells.forEach(cell => {
            cell.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            cell.style.opacity = '1';
            cell.style.transform = 'scale(1)';
          });
        }, weekIndex * 15); // Stagger by week, not by cell
      });
    });
  }

  /**
   * Add subtle grain texture to canvas (optional for dark mode)
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   * @param {number} opacity - Grain opacity
   */
  addGrain(ctx, width, height, opacity = 0.02) {
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
    
    // Modern aurora colors for pie slices
    const slices = [
      { label: 'Commits', value: data.commits, color: this.colors.aurora1 },
      { label: 'PRs', value: data.pullRequests, color: this.colors.aurora2 },
      { label: 'Issues', value: data.issues, color: this.colors.aurora3 },
      { label: 'Reviews', value: data.reviews, color: this.colors.accent1 },
    ].filter(s => s.value > 0);
    
    const total = slices.reduce((sum, s) => sum + s.value, 0);
    if (total === 0) return;
    
    let currentAngle = -Math.PI / 2; // Start from top
    
    slices.forEach(slice => {
      const sliceAngle = (slice.value / total) * Math.PI * 2;
      
      // Draw slice with glow
      ctx.shadowColor = slice.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.lineTo(centerX, centerY);
      ctx.closePath();
      
      ctx.fillStyle = slice.color;
      ctx.fill();
      ctx.shadowBlur = 0;
      
      ctx.strokeStyle = this.colors.dark;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      currentAngle += sliceAngle;
    });
    
    // Draw inner circle (donut hole) with glass effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = this.colors.dark;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Center text
    ctx.fillStyle = this.colors.textPrimary;
    ctx.font = 'bold 28px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toString(), centerX, centerY - 8);
    ctx.font = '10px "Fira Code", monospace';
    ctx.fillStyle = this.colors.textMuted;
    ctx.fillText('TOTAL', centerX, centerY + 15);
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
    canvas.height = 220 * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '220px';
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = 220;
    const padding = { top: 30, right: 25, bottom: 50, left: 55 };
    
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const barWidth = Math.max(8, (chartWidth / 24) - 4);
    const barGap = (chartWidth - barWidth * 24) / 23;
    const maxValue = Math.max(...hours, 1);
    
    // Dark background with subtle gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, this.colors.dark);
    bgGradient.addColorStop(1, this.colors.darkSecondary);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Grid lines
    ctx.strokeStyle = this.colors.gridLineFaint;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }
    
    // Find peak hour for highlighting
    const peakHour = hours.indexOf(Math.max(...hours));
    
    // Draw bars with aurora gradient and rounded tops
    hours.forEach((value, hour) => {
      const barHeight = Math.max(2, (value / maxValue) * chartHeight);
      const x = padding.left + (barWidth + barGap) * hour;
      const y = padding.top + chartHeight - barHeight;
      
      // Aurora gradient - highlight peak hour
      const gradient = ctx.createLinearGradient(x, y + barHeight, x, y);
      if (hour === peakHour && value > 0) {
        // Peak hour gets special treatment
        gradient.addColorStop(0, '#00f5ff');
        gradient.addColorStop(0.5, '#a855f7');
        gradient.addColorStop(1, '#ec4899');
        ctx.shadowColor = '#00f5ff';
        ctx.shadowBlur = 15;
      } else {
        gradient.addColorStop(0, this.colors.aurora1 + 'cc');
        gradient.addColorStop(0.5, this.colors.aurora2 + 'cc');
        gradient.addColorStop(1, this.colors.aurora3 + 'cc');
        ctx.shadowColor = this.colors.aurora2;
        ctx.shadowBlur = 6;
      }
      
      // Draw rounded bar
      ctx.fillStyle = gradient;
      ctx.beginPath();
      const radius = Math.min(4, barWidth / 2);
      ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 0, 0]);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    
    // X-axis labels (every 3 hours)
    ctx.fillStyle = this.colors.textSecondary;
    ctx.font = '11px "Fira Code", monospace';
    ctx.textAlign = 'center';
    
    [0, 3, 6, 9, 12, 15, 18, 21].forEach(hour => {
      const x = padding.left + (barWidth + barGap) * hour + barWidth / 2;
      const label = hour === 0 ? '12AM' : hour === 12 ? '12PM' : 
                    hour < 12 ? `${hour}AM` : `${hour - 12}PM`;
      ctx.fillText(label, x, height - 12);
    });
    
    // Y-axis labels
    ctx.textAlign = 'right';
    ctx.fillStyle = this.colors.textMuted;
    for (let i = 0; i <= 4; i++) {
      const value = Math.round((maxValue / 4) * (4 - i));
      const y = padding.top + (chartHeight / 4) * i + 4;
      ctx.fillText(value.toString(), padding.left - 10, y);
    }
    
    // Title
    ctx.fillStyle = this.colors.textPrimary;
    ctx.font = 'bold 13px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Activity by Hour', padding.left, 18);
  }

  /**
   * Render composition donut chart
   * @param {HTMLCanvasElement} canvas - Target canvas
   * @param {Object} activityData - Optional activity breakdown data
   */
  renderCompositionChart(canvas, activityData = null) {
    const data = activityData || this.data?.activityBreakdown;
    if (!canvas || !data) return;
    
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
    
    // Aurora colors for composition
    const slices = [
      { label: 'Commits', value: data.commits || 0, color: this.colors.aurora1 },
      { label: 'PRs', value: data.pullRequests || 0, color: this.colors.aurora2 },
      { label: 'Issues', value: data.issues || 0, color: this.colors.aurora3 },
      { label: 'Reviews', value: data.reviews || 0, color: this.colors.accent1 },
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
      ctx.fillStyle = this.colors.dark;
      ctx.fill();
      
      // Empty state text
      ctx.fillStyle = this.colors.textMuted;
      ctx.font = '14px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No activity data', centerX, centerY);
      return;
    }
    
    let currentAngle = -Math.PI / 2;
    
    slices.forEach((slice, index) => {
      const sliceAngle = (slice.value / total) * Math.PI * 2;
      
      // Draw slice with glow
      ctx.shadowColor = slice.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      
      ctx.fillStyle = slice.color;
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Slice border
      ctx.strokeStyle = this.colors.dark;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      currentAngle += sliceAngle;
    });
    
    // Center circle (glass effect)
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius - 2, 0, Math.PI * 2);
    ctx.fillStyle = this.colors.dark;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Center text
    ctx.fillStyle = this.colors.textPrimary;
    ctx.font = 'bold 32px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toString(), centerX, centerY - 8);
    ctx.fillStyle = this.colors.textMuted;
    ctx.font = '11px "Fira Code", monospace';
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
      container.innerHTML = '<p class="font-mono" style="color: var(--text-secondary);">No language data available</p>';
      return;
    }
    
    if (languages.length === 0) {
      container.innerHTML = '<p class="font-mono" style="color: var(--text-secondary);">No language data available</p>';
      return;
    }
    
    // Get top 6 languages
    const topLanguages = languages.slice(0, 6);
    const maxPercent = Math.max(...topLanguages.map(l => l.percent || 0), 1);
    
    // Modern vibrant language colors
    const langColors = {
      'JavaScript': '#f7df1e',
      'TypeScript': '#3178c6',
      'Python': '#3572A5',
      'Java': '#b07219',
      'C++': '#f34b7d',
      'C#': '#68217a',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'Ruby': '#cc342d',
      'PHP': '#777BB4',
      'Swift': '#F05138',
      'Kotlin': '#A97BFF',
      'Dart': '#00B4AB',
      'HTML': '#e34c26',
      'CSS': '#264de4',
      'Shell': '#89e051',
      'Vue': '#41b883',
      'Svelte': '#ff3e00',
      'React': '#61dafb',
    };
    
    topLanguages.forEach((lang, index) => {
      const item = document.createElement('div');
      item.className = 'language-item';
      item.style.animationDelay = `${index * 100}ms`;
      
      const barWidth = maxPercent > 0 
        ? (lang.percent / maxPercent) * 100 
        : 0;
      
      const color = langColors[lang.label] || this.colors.aurora1;
      
      item.innerHTML = `
        <div class="language-header">
          <span class="language-name font-mono">${lang.label}</span>
          <span class="language-percent font-display">${lang.percent}%</span>
        </div>
        <div class="language-bar-bg">
          <div class="language-bar-fill" style="width: ${barWidth}%; background: linear-gradient(90deg, ${color}, ${color}dd);"></div>
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
      container.innerHTML = '<p class="font-mono" style="color: var(--text-secondary);">No repositories found</p>';
      return;
    }
    
    repos.forEach((repo, index) => {
      const card = document.createElement('div');
      card.className = 'repo-card glass-card';
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
      'JavaScript': '#f7df1e',
      'TypeScript': '#3178c6',
      'Python': '#3572A5',
      'Java': '#b07219',
      'C++': '#f34b7d',
      'C#': '#68217a',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'Ruby': '#cc342d',
      'PHP': '#777BB4',
      'Swift': '#F05138',
      'Kotlin': '#A97BFF',
      'HTML': '#e34c26',
      'CSS': '#264de4',
      'Shell': '#89e051',
      'Vue': '#41b883',
      'React': '#61dafb',
      'Svelte': '#ff3e00',
    };
    return colors[language] || this.colors.aurora1;
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
    
    // Background circle with glass effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 20, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw radial bars for each hour with aurora gradient
    for (let hour = 0; hour < 24; hour++) {
      const angle = (hour / 24) * Math.PI * 2 - Math.PI / 2;
      const value = hourCounts[hour];
      const barLength = (value / maxCount) * radius * 0.6;
      
      const innerRadius = radius * 0.3;
      const x1 = centerX + Math.cos(angle) * innerRadius;
      const y1 = centerY + Math.sin(angle) * innerRadius;
      const x2 = centerX + Math.cos(angle) * (innerRadius + barLength);
      const y2 = centerY + Math.sin(angle) * (innerRadius + barLength);
      
      // Aurora gradient
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, this.colors.aurora1);
      gradient.addColorStop(0.5, this.colors.aurora2);
      gradient.addColorStop(1, this.colors.aurora3);
      
      ctx.shadowColor = this.colors.aurora2;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    // Hour labels
    ctx.fillStyle = this.colors.textMuted;
    ctx.font = '10px "Fira Code", monospace';
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
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.fillStyle = this.colors.aurora3;
    ctx.font = 'bold 12px "Space Grotesk", sans-serif';
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
      
      // Glow effect
      ctx.shadowColor = slice.color;
      ctx.shadowBlur = 10;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      
      ctx.fillStyle = slice.color;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = this.colors.dark;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      currentAngle += sliceAngle;
    });
    
    // Inner circle (glass effect)
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius - 2, 0, Math.PI * 2);
    ctx.fillStyle = this.colors.dark;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Center text
    ctx.fillStyle = this.colors.textPrimary;
    ctx.font = 'bold 28px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toLocaleString(), centerX, centerY - 5);
    ctx.fillStyle = this.colors.textMuted;
    ctx.font = '10px "Fira Code", monospace';
    ctx.fillText('TOTAL', centerX, centerY + 12);
  }

  /**
   * Render a single repository card element
   * Shows repos where user actually contributed
   * @param {Object} repo - Repository data with userActivity
   * @param {number} rank - Rank number (1-5)
   * @returns {HTMLElement} - Card element
   */
  renderRepoCard(repo, rank) {
    const card = document.createElement('div');
    card.className = 'repo-card glass-card';
    card.style.animationDelay = `${(rank - 1) * 150}ms`;
    
    const langColor = this.getLanguageColor(repo.language);
    const activity = repo.userActivity || {};
    
    // Build activity badges showing user's contributions
    const activityBadges = [];
    if (activity.commits > 0) {
      activityBadges.push(`<span class="activity-badge commits" title="Your commits"><span class="badge-icon">📝</span> ${activity.commits} commits</span>`);
    }
    if (activity.pullRequests > 0) {
      activityBadges.push(`<span class="activity-badge prs" title="Your PRs"><span class="badge-icon">🔀</span> ${activity.pullRequests} PRs</span>`);
    }
    if (activity.reviews > 0) {
      activityBadges.push(`<span class="activity-badge reviews" title="Your reviews"><span class="badge-icon">👀</span> ${activity.reviews} reviews</span>`);
    }
    
    const activityHtml = activityBadges.length > 0 
      ? `<div class="repo-activity">${activityBadges.join('')}</div>` 
      : '';
    
    // Calculate total contributions for display
    const totalContribs = (activity.commits || 0) + (activity.pullRequests || 0) + (activity.reviews || 0);
    
    // Show if this is an external repo (not owned by user)
    const externalBadge = repo.isOwned === false 
      ? '<span class="external-badge" title="External contribution">🌐</span>' 
      : '';
    
    card.innerHTML = `
      <div class="repo-rank font-display">#${rank}</div>
      <div class="repo-info">
        <h4 class="repo-name font-mono">
          ${externalBadge}${repo.name}
        </h4>
        <p class="repo-desc">${repo.description || 'Your code contributions'}</p>
        <div class="repo-meta">
          ${repo.language ? `<span class="repo-lang"><span class="lang-dot" style="background: ${langColor}; box-shadow: 0 0 6px ${langColor}"></span>${repo.language}</span>` : ''}
          ${repo.stargazers_count > 0 ? `<span class="repo-stars">★ ${repo.stargazers_count.toLocaleString()}</span>` : ''}
          ${repo.forks_count > 0 ? `<span class="repo-forks">⑂ ${repo.forks_count.toLocaleString()}</span>` : ''}
        </div>
        ${activityHtml}
      </div>
      <div class="repo-contribution-score">
        <span class="contrib-number font-display">${totalContribs}</span>
        <span class="contrib-label font-mono">contribs</span>
      </div>
    `;
    
    return card;
  }
}

export { ChartsRenderer };
