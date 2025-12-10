/**
 * GitStory 2025 - Poster Export
 * 
 * Generates a modern aurora-styled poster (1920x1080)
 * for sharing on social media.
 */

class PosterExport {
  constructor() {
    this.width = 1920;
    this.height = 1080;
    this.colors = {
      // Dark backgrounds
      dark: '#0f0f23',
      darkSecondary: '#1a1a2e',
      surface: '#16213e',
      
      // Aurora gradients
      aurora1: '#667eea',
      aurora2: '#764ba2',
      aurora3: '#f093fb',
      aurora4: '#f5576c',
      
      // Text colors
      textPrimary: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
      textMuted: 'rgba(255, 255, 255, 0.4)',
      
      // Accents
      accent1: '#00d4ff',
      accent2: '#ff6b9d',
      accent3: '#c084fc',
      
      // GitHub green
      green: '#39d353',
    };
  }

  /**
   * Generate and download the poster
   * @param {Object} userData - Raw user data
   * @param {Object} processedData - Processed statistics
   */
  async generatePoster(userData, processedData) {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d');

    // Draw poster components
    await this.drawBackground(ctx);
    await this.drawAuroraGlow(ctx);
    await this.drawGlassOverlay(ctx);
    await this.drawHeader(ctx);
    await this.drawAvatar(ctx, userData.user);
    await this.drawUserInfo(ctx, userData.user, processedData);
    await this.drawStats(ctx, processedData.stats);
    await this.drawPersona(ctx, processedData.persona);
    await this.drawTopRepos(ctx, processedData.scoredRepos);
    await this.drawFooter(ctx);

    // Download
    this.downloadPoster(canvas);
  }

  /**
   * Draw background gradient
   */
  async drawBackground(ctx) {
    // Main dark gradient
    const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, this.colors.dark);
    gradient.addColorStop(0.5, this.colors.darkSecondary);
    gradient.addColorStop(1, this.colors.dark);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Draw aurora glow effects
   */
  async drawAuroraGlow(ctx) {
    // Aurora glow 1 - top left
    const glow1 = ctx.createRadialGradient(
      this.width * 0.2, this.height * 0.2, 0,
      this.width * 0.2, this.height * 0.2, this.width * 0.5
    );
    glow1.addColorStop(0, 'rgba(102, 126, 234, 0.3)');
    glow1.addColorStop(0.5, 'rgba(118, 75, 162, 0.15)');
    glow1.addColorStop(1, 'transparent');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, this.width, this.height);

    // Aurora glow 2 - bottom right
    const glow2 = ctx.createRadialGradient(
      this.width * 0.8, this.height * 0.8, 0,
      this.width * 0.8, this.height * 0.8, this.width * 0.5
    );
    glow2.addColorStop(0, 'rgba(240, 147, 251, 0.25)');
    glow2.addColorStop(0.5, 'rgba(245, 87, 108, 0.1)');
    glow2.addColorStop(1, 'transparent');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Draw glass overlay borders
   */
  async drawGlassOverlay(ctx) {
    const borderWidth = 40;
    
    // Outer glass border effect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    this.roundRect(ctx, borderWidth, borderWidth, this.width - borderWidth * 2, this.height - borderWidth * 2, 20);
    ctx.stroke();
    
    // Inner glass line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, borderWidth + 10, borderWidth + 10, this.width - borderWidth * 2 - 20, this.height - borderWidth * 2 - 20, 15);
    ctx.stroke();
  }

  /**
   * Draw header with title
   */
  async drawHeader(ctx) {
    // Gradient line decoration
    const lineGradient = ctx.createLinearGradient(200, 100, this.width - 200, 100);
    lineGradient.addColorStop(0, 'transparent');
    lineGradient.addColorStop(0.2, this.colors.aurora1);
    lineGradient.addColorStop(0.5, this.colors.aurora3);
    lineGradient.addColorStop(0.8, this.colors.aurora1);
    lineGradient.addColorStop(1, 'transparent');
    
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(200, 100);
    ctx.lineTo(this.width - 200, 100);
    ctx.stroke();

    // Star decorations
    ctx.fillStyle = this.colors.aurora3;
    ctx.font = '24px serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦ ✦ ✦', this.width / 2, 90);

    // Main title with gradient
    ctx.font = 'bold 72px "Space Grotesk", sans-serif';
    const titleGradient = ctx.createLinearGradient(this.width / 2 - 200, 0, this.width / 2 + 200, 0);
    titleGradient.addColorStop(0, this.colors.aurora1);
    titleGradient.addColorStop(0.5, this.colors.aurora3);
    titleGradient.addColorStop(1, this.colors.aurora1);
    ctx.fillStyle = titleGradient;
    ctx.fillText('GITSTORY 2025', this.width / 2, 180);

    // Subtitle
    ctx.font = '28px "DM Sans", sans-serif';
    ctx.fillStyle = this.colors.textSecondary;
    ctx.fillText('A Developer\'s Year in Code', this.width / 2, 220);

    // Decorative line below
    ctx.strokeStyle = lineGradient;
    ctx.beginPath();
    ctx.moveTo(300, 250);
    ctx.lineTo(this.width - 300, 250);
    ctx.stroke();
  }

  /**
   * Draw user avatar
   */
  async drawAvatar(ctx, user) {
    const avatarSize = 180;
    const avatarX = 200;
    const avatarY = 320;

    // Avatar glow
    const avatarGlow = ctx.createRadialGradient(
      avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2,
      avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 20
    );
    avatarGlow.addColorStop(0, this.colors.aurora1 + '40');
    avatarGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = avatarGlow;
    ctx.fillRect(avatarX - 30, avatarY - 30, avatarSize + 60, avatarSize + 60);

    // Avatar frame with gradient
    const frameGradient = ctx.createLinearGradient(avatarX, avatarY, avatarX + avatarSize, avatarY + avatarSize);
    frameGradient.addColorStop(0, this.colors.aurora1);
    frameGradient.addColorStop(0.5, this.colors.aurora2);
    frameGradient.addColorStop(1, this.colors.aurora3);
    
    ctx.strokeStyle = frameGradient;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 8, 0, Math.PI * 2);
    ctx.stroke();

    // Try to load avatar image
    try {
      const img = await this.loadImage(user.avatar_url);
      
      // Circular clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.clip();
      
      ctx.drawImage(img, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();
    } catch (e) {
      // Fallback: draw placeholder
      ctx.fillStyle = this.colors.surface;
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 80px "Space Grotesk", sans-serif';
      ctx.fillStyle = this.colors.aurora3;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(user.login.charAt(0).toUpperCase(), avatarX + avatarSize / 2, avatarY + avatarSize / 2);
    }
  }

  /**
   * Draw user info (name, bio, etc)
   */
  async drawUserInfo(ctx, user, processedData) {
    const startX = 420;
    const startY = 340;

    // Name
    ctx.font = 'bold 56px "Space Grotesk", sans-serif';
    ctx.fillStyle = this.colors.textPrimary;
    ctx.textAlign = 'left';
    ctx.fillText((user.name || user.login).toUpperCase(), startX, startY);

    // Username with aurora color
    ctx.font = '24px "Fira Code", monospace';
    ctx.fillStyle = this.colors.aurora3;
    ctx.fillText(`@${user.login}`, startX, startY + 40);

    // Bio (truncated)
    if (user.bio) {
      ctx.font = '22px "DM Sans", sans-serif';
      ctx.fillStyle = this.colors.textSecondary;
      const truncatedBio = user.bio.length > 80 ? user.bio.substring(0, 77) + '...' : user.bio;
      ctx.fillText(`"${truncatedBio}"`, startX, startY + 90);
    }

    // Member since
    const joinDate = new Date(user.created_at);
    ctx.font = '18px "Fira Code", monospace';
    ctx.fillStyle = this.colors.textMuted;
    ctx.fillText(`Member since ${joinDate.getFullYear()}`, startX, startY + 130);
  }

  /**
   * Draw main statistics
   */
  async drawStats(ctx, stats) {
    const statsY = 560;
    const statWidth = 200;
    const startX = (this.width - statWidth * 5) / 2;

    const statData = [
      { value: stats.totalContributions, label: 'CONTRIBUTIONS', color: this.colors.aurora1 },
      { value: stats.totalRepos, label: 'REPOSITORIES', color: this.colors.aurora2 },
      { value: stats.longestStreak, label: 'DAY STREAK', color: this.colors.aurora3 },
      { value: stats.totalStars, label: 'STARS EARNED', color: this.colors.accent1 },
      { value: stats.followers, label: 'FOLLOWERS', color: this.colors.accent2 },
    ];

    statData.forEach((stat, index) => {
      const x = startX + index * statWidth + statWidth / 2;

      // Value with color
      ctx.font = 'bold 56px "Space Grotesk", sans-serif';
      ctx.fillStyle = stat.color;
      ctx.textAlign = 'center';
      ctx.fillText(this.formatNumber(stat.value), x, statsY);

      // Label
      ctx.font = '14px "Fira Code", monospace';
      ctx.fillStyle = this.colors.textMuted;
      ctx.fillText(stat.label, x, statsY + 30);

      // Separator
      if (index < statData.length - 1) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + statWidth / 2, statsY - 40);
        ctx.lineTo(x + statWidth / 2, statsY + 40);
        ctx.stroke();
      }
    });
  }

  /**
   * Draw persona badge
   */
  async drawPersona(ctx, persona) {
    const personaY = 680;

    // Glass badge background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    this.roundRect(ctx, this.width / 2 - 250, personaY - 40, 500, 80, 16);
    ctx.fill();

    // Gradient border
    const borderGradient = ctx.createLinearGradient(this.width / 2 - 250, personaY, this.width / 2 + 250, personaY);
    borderGradient.addColorStop(0, this.colors.aurora1);
    borderGradient.addColorStop(0.5, this.colors.aurora3);
    borderGradient.addColorStop(1, this.colors.aurora1);
    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 2;
    this.roundRect(ctx, this.width / 2 - 250, personaY - 40, 500, 80, 16);
    ctx.stroke();

    // Emoji
    ctx.font = '48px serif';
    ctx.textAlign = 'center';
    ctx.fillText(persona.emoji || '🔧', this.width / 2 - 180, personaY + 15);

    // Persona name with gradient
    ctx.font = 'bold 36px "Space Grotesk", sans-serif';
    const textGradient = ctx.createLinearGradient(this.width / 2 - 120, 0, this.width / 2 + 200, 0);
    textGradient.addColorStop(0, this.colors.aurora1);
    textGradient.addColorStop(0.5, this.colors.aurora3);
    textGradient.addColorStop(1, this.colors.aurora1);
    ctx.fillStyle = textGradient;
    ctx.textAlign = 'left';
    ctx.fillText(persona.name?.toUpperCase() || persona.title?.toUpperCase() || 'THE DEVELOPER', this.width / 2 - 120, personaY);

    // Description
    ctx.font = '16px "Fira Code", monospace';
    ctx.fillStyle = this.colors.textSecondary;
    ctx.fillText(persona.description || '', this.width / 2 - 120, personaY + 25);
  }

  /**
   * Draw top repositories
   */
  async drawTopRepos(ctx, repos) {
    const reposY = 800;
    const topRepos = repos.slice(0, 3);

    // Section title
    ctx.font = 'bold 24px "Space Grotesk", sans-serif';
    ctx.fillStyle = this.colors.textPrimary;
    ctx.textAlign = 'center';
    ctx.fillText('✦ TOP PROJECTS ✦', this.width / 2, reposY);

    const repoWidth = 400;
    const startX = (this.width - repoWidth * 3 - 40) / 2;

    topRepos.forEach((repo, index) => {
      const x = startX + index * (repoWidth + 20);
      const y = reposY + 30;

      // Glass card background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      this.roundRect(ctx, x, y, repoWidth, 100, 12);
      ctx.fill();

      // Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      this.roundRect(ctx, x, y, repoWidth, 100, 12);
      ctx.stroke();

      // Rank with color
      const rankColors = [this.colors.aurora1, this.colors.aurora2, this.colors.aurora3];
      ctx.font = 'bold 32px "Space Grotesk", sans-serif';
      ctx.fillStyle = rankColors[index] || this.colors.aurora1;
      ctx.textAlign = 'center';
      ctx.fillText(`#${index + 1}`, x + 35, y + 55);

      // Repo name
      ctx.font = 'bold 20px "Fira Code", monospace';
      ctx.fillStyle = this.colors.textPrimary;
      ctx.textAlign = 'left';
      const truncName = repo.name.length > 20 ? repo.name.substring(0, 17) + '...' : repo.name;
      ctx.fillText(truncName, x + 70, y + 35);

      // Stars and forks
      ctx.font = '16px "Fira Code", monospace';
      ctx.fillStyle = this.colors.accent1;
      ctx.fillText(`★ ${repo.stargazers_count || 0}`, x + 70, y + 60);
      ctx.fillStyle = this.colors.textMuted;
      ctx.fillText(`⑂ ${repo.forks_count || 0}`, x + 160, y + 60);

      // Language
      if (repo.language) {
        ctx.fillStyle = this.colors.aurora3;
        ctx.fillText(repo.language, x + 70, y + 85);
      }
    });
  }

  /**
   * Draw footer
   */
  async drawFooter(ctx) {
    // Gradient decorative line
    const lineGradient = ctx.createLinearGradient(200, this.height - 80, this.width - 200, this.height - 80);
    lineGradient.addColorStop(0, 'transparent');
    lineGradient.addColorStop(0.2, this.colors.aurora1);
    lineGradient.addColorStop(0.5, this.colors.aurora3);
    lineGradient.addColorStop(0.8, this.colors.aurora1);
    lineGradient.addColorStop(1, 'transparent');
    
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(200, this.height - 80);
    ctx.lineTo(this.width - 200, this.height - 80);
    ctx.stroke();

    // Footer text
    ctx.font = '18px "Fira Code", monospace';
    ctx.fillStyle = this.colors.textMuted;
    ctx.textAlign = 'center';
    ctx.fillText('Generated by GitStory 2025 | Aurora Edition', this.width / 2, this.height - 50);

    // Year badge
    ctx.font = 'bold 20px "Space Grotesk", sans-serif';
    ctx.fillStyle = this.colors.aurora3;
    ctx.fillText('— 2025 —', this.width / 2, this.height - 25);
  }

  /**
   * Download the poster as PNG
   */
  downloadPoster(canvas) {
    const link = document.createElement('a');
    link.download = `gitstory-2025-poster.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Helper: Load image
   */
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * Helper: Draw rounded rectangle
   */
  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    return ctx;
  }

  /**
   * Helper: Format number
   */
  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
}

export { PosterExport };
