/**
 * GitStory 2025 - Poster Export
 * 
 * Generates a vintage movie poster style image (1920x1080)
 * for sharing on social media.
 */

class PosterExport {
  constructor() {
    this.width = 1920;
    this.height = 1080;
    this.colors = {
      dark: '#1a0f08',
      primary: '#2c1810',
      secondary: '#8b6914',
      gold: '#cd853f',
      cream: '#f5e6d3',
      accent: '#d4a373',
      light: '#a89080',
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
    await this.drawFilmBorder(ctx);
    await this.drawHeader(ctx);
    await this.drawAvatar(ctx, userData.user);
    await this.drawUserInfo(ctx, userData.user, processedData);
    await this.drawStats(ctx, processedData.stats);
    await this.drawPersona(ctx, processedData.persona);
    await this.drawTopRepos(ctx, processedData.scoredRepos);
    await this.drawFooter(ctx);
    await this.addFilmGrain(ctx);

    // Download
    this.downloadPoster(canvas);
  }

  /**
   * Draw background gradient
   */
  async drawBackground(ctx) {
    // Main gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, this.colors.dark);
    gradient.addColorStop(0.5, this.colors.primary);
    gradient.addColorStop(1, this.colors.dark);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle vignette
    const vignette = ctx.createRadialGradient(
      this.width / 2, this.height / 2, this.height * 0.3,
      this.width / 2, this.height / 2, this.height * 0.8
    );
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Draw film strip borders
   */
  async drawFilmBorder(ctx) {
    const borderWidth = 60;
    const holeSize = 20;
    const holeSpacing = 40;

    // Left border
    ctx.fillStyle = this.colors.dark;
    ctx.fillRect(0, 0, borderWidth, this.height);

    // Right border
    ctx.fillRect(this.width - borderWidth, 0, borderWidth, this.height);

    // Film holes - left
    ctx.fillStyle = this.colors.primary;
    for (let y = 30; y < this.height; y += holeSpacing) {
      this.roundRect(ctx, 20, y, holeSize, holeSize * 0.6, 3);
      ctx.fill();
    }

    // Film holes - right
    for (let y = 30; y < this.height; y += holeSpacing) {
      this.roundRect(ctx, this.width - 40, y, holeSize, holeSize * 0.6, 3);
      ctx.fill();
    }

    // Inner frame
    ctx.strokeStyle = this.colors.gold;
    ctx.lineWidth = 4;
    ctx.strokeRect(80, 30, this.width - 160, this.height - 60);

    // Double frame
    ctx.strokeStyle = this.colors.secondary + '80';
    ctx.lineWidth = 2;
    ctx.strokeRect(90, 40, this.width - 180, this.height - 80);
  }

  /**
   * Draw header with title
   */
  async drawHeader(ctx) {
    // Decorative line
    ctx.strokeStyle = this.colors.gold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(200, 100);
    ctx.lineTo(this.width - 200, 100);
    ctx.stroke();

    // Star decorations
    ctx.fillStyle = this.colors.gold;
    ctx.font = '24px serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ ★ ★', this.width / 2, 90);

    // Main title
    ctx.font = 'bold 72px "Bebas Neue", Impact, sans-serif';
    ctx.fillStyle = this.colors.gold;
    ctx.letterSpacing = '8px';
    ctx.fillText('GITSTORY 2025', this.width / 2, 180);

    // Subtitle
    ctx.font = 'italic 28px "Playfair Display", Georgia, serif';
    ctx.fillStyle = this.colors.cream;
    ctx.fillText('A Developer\'s Cinematic Journey', this.width / 2, 220);

    // Decorative line below
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

    // Avatar frame
    ctx.strokeStyle = this.colors.gold;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 10, 0, Math.PI * 2);
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

      // Sepia overlay
      ctx.save();
      ctx.globalCompositeOperation = 'color';
      ctx.fillStyle = '#a08060';
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } catch (e) {
      // Fallback: draw placeholder
      ctx.fillStyle = this.colors.secondary;
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 80px "Bebas Neue", sans-serif';
      ctx.fillStyle = this.colors.gold;
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
    ctx.font = 'bold 56px "Bebas Neue", Impact, sans-serif';
    ctx.fillStyle = this.colors.cream;
    ctx.textAlign = 'left';
    ctx.fillText((user.name || user.login).toUpperCase(), startX, startY);

    // Username
    ctx.font = '24px "Courier Prime", Courier, monospace';
    ctx.fillStyle = this.colors.gold;
    ctx.fillText(`@${user.login}`, startX, startY + 40);

    // Bio (truncated)
    if (user.bio) {
      ctx.font = 'italic 22px "Playfair Display", Georgia, serif';
      ctx.fillStyle = this.colors.light;
      const truncatedBio = user.bio.length > 80 ? user.bio.substring(0, 77) + '...' : user.bio;
      ctx.fillText(`"${truncatedBio}"`, startX, startY + 90);
    }

    // Member since
    const joinDate = new Date(user.created_at);
    ctx.font = '18px "Courier Prime", Courier, monospace';
    ctx.fillStyle = this.colors.secondary;
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
      { value: stats.totalContributions, label: 'CONTRIBUTIONS' },
      { value: stats.totalRepos, label: 'REPOSITORIES' },
      { value: stats.longestStreak, label: 'DAY STREAK' },
      { value: stats.totalStars, label: 'STARS EARNED' },
      { value: stats.followers, label: 'FOLLOWERS' },
    ];

    statData.forEach((stat, index) => {
      const x = startX + index * statWidth + statWidth / 2;

      // Value
      ctx.font = 'bold 56px "Bebas Neue", Impact, sans-serif';
      ctx.fillStyle = this.colors.gold;
      ctx.textAlign = 'center';
      ctx.fillText(this.formatNumber(stat.value), x, statsY);

      // Label
      ctx.font = '14px "Courier Prime", Courier, monospace';
      ctx.fillStyle = this.colors.light;
      ctx.fillText(stat.label, x, statsY + 30);

      // Separator
      if (index < statData.length - 1) {
        ctx.strokeStyle = this.colors.secondary + '50';
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

    // Badge background
    ctx.fillStyle = this.colors.secondary + '40';
    this.roundRect(ctx, this.width / 2 - 250, personaY - 40, 500, 80, 10);
    ctx.fill();

    // Border
    ctx.strokeStyle = this.colors.gold;
    ctx.lineWidth = 2;
    this.roundRect(ctx, this.width / 2 - 250, personaY - 40, 500, 80, 10);
    ctx.stroke();

    // Emoji
    ctx.font = '48px serif';
    ctx.textAlign = 'center';
    ctx.fillText(persona.emoji || '🔧', this.width / 2 - 180, personaY + 15);

    // Persona name
    ctx.font = 'bold 36px "Bebas Neue", sans-serif';
    ctx.fillStyle = this.colors.gold;
    ctx.textAlign = 'left';
    ctx.fillText(persona.name?.toUpperCase() || persona.title?.toUpperCase() || 'THE DEVELOPER', this.width / 2 - 120, personaY);

    // Description
    ctx.font = '16px "Courier Prime", monospace';
    ctx.fillStyle = this.colors.light;
    ctx.fillText(persona.description || '', this.width / 2 - 120, personaY + 25);
  }

  /**
   * Draw top repositories
   */
  async drawTopRepos(ctx, repos) {
    const reposY = 800;
    const topRepos = repos.slice(0, 3);

    // Section title
    ctx.font = 'bold 24px "Bebas Neue", sans-serif';
    ctx.fillStyle = this.colors.cream;
    ctx.textAlign = 'center';
    ctx.fillText('★ TOP PROJECTS ★', this.width / 2, reposY);

    const repoWidth = 400;
    const startX = (this.width - repoWidth * 3 - 40) / 2;

    topRepos.forEach((repo, index) => {
      const x = startX + index * (repoWidth + 20);
      const y = reposY + 30;

      // Repo card background
      ctx.fillStyle = this.colors.dark + '80';
      this.roundRect(ctx, x, y, repoWidth, 100, 8);
      ctx.fill();

      // Border
      ctx.strokeStyle = this.colors.secondary;
      ctx.lineWidth = 1;
      this.roundRect(ctx, x, y, repoWidth, 100, 8);
      ctx.stroke();

      // Rank
      ctx.font = 'bold 32px "Bebas Neue", sans-serif';
      ctx.fillStyle = this.colors.gold;
      ctx.textAlign = 'center';
      ctx.fillText(`#${index + 1}`, x + 35, y + 55);

      // Repo name
      ctx.font = 'bold 20px "Courier Prime", monospace';
      ctx.fillStyle = this.colors.cream;
      ctx.textAlign = 'left';
      const truncName = repo.name.length > 20 ? repo.name.substring(0, 17) + '...' : repo.name;
      ctx.fillText(truncName, x + 70, y + 35);

      // Stars and forks
      ctx.font = '16px "Courier Prime", monospace';
      ctx.fillStyle = this.colors.gold;
      ctx.fillText(`★ ${repo.stargazers_count || 0}`, x + 70, y + 60);
      ctx.fillStyle = this.colors.light;
      ctx.fillText(`⑂ ${repo.forks_count || 0}`, x + 160, y + 60);

      // Language
      if (repo.language) {
        ctx.fillStyle = this.colors.secondary;
        ctx.fillText(repo.language, x + 70, y + 85);
      }
    });
  }

  /**
   * Draw footer
   */
  async drawFooter(ctx) {
    // Decorative line
    ctx.strokeStyle = this.colors.gold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(200, this.height - 80);
    ctx.lineTo(this.width - 200, this.height - 80);
    ctx.stroke();

    // Footer text
    ctx.font = '18px "Courier Prime", monospace';
    ctx.fillStyle = this.colors.light;
    ctx.textAlign = 'center';
    ctx.fillText('Generated by GitStory 2025 | github.com/gitstory', this.width / 2, this.height - 50);

    // Year badge
    ctx.font = 'bold 20px "Bebas Neue", sans-serif';
    ctx.fillStyle = this.colors.gold;
    ctx.fillText('— 2025 —', this.width / 2, this.height - 25);
  }

  /**
   * Add film grain effect
   */
  async addFilmGrain(ctx) {
    const imageData = ctx.getImageData(0, 0, this.width, this.height);
    const pixels = imageData.data;

    for (let i = 0; i < pixels.length; i += 4) {
      const noise = (Math.random() - 0.5) * 20;
      pixels[i] += noise;     // R
      pixels[i + 1] += noise; // G
      pixels[i + 2] += noise; // B
    }

    ctx.putImageData(imageData, 0, 0);
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
