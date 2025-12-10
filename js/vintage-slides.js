/**
 * GitStory 2025 - Vintage Slides
 * 
 * Manages individual slide components and their
 * specific behaviors, animations, and content.
 */

class VintageSlides {
  constructor() {
    this.slides = new Map();
    this.initialized = false;
  }

  /**
   * Initialize slide components
   */
  init() {
    if (this.initialized) return;
    
    // Register slide handlers
    this.slides.set('welcome', new WelcomeSlide());
    this.slides.set('title', new TitleCardSlide());
    this.slides.set('velocity', new VelocitySlide());
    this.slides.set('heatmap', new HeatmapSlide());
    
    this.initialized = true;
  }

  /**
   * Get slide by ID
   * @param {string} id - Slide identifier
   * @returns {BaseSlide}
   */
  getSlide(id) {
    return this.slides.get(id);
  }

  /**
   * Trigger slide enter animation
   * @param {string} id - Slide identifier
   * @param {Object} data - Slide data
   */
  onEnter(id, data) {
    const slide = this.slides.get(id);
    if (slide) {
      slide.onEnter(data);
    }
  }

  /**
   * Trigger slide exit animation
   * @param {string} id - Slide identifier
   */
  onExit(id) {
    const slide = this.slides.get(id);
    if (slide) {
      slide.onExit();
    }
  }
}

/**
 * Base slide class
 */
class BaseSlide {
  constructor(elementId) {
    this.elementId = elementId;
    this.element = null;
    this.hasEntered = false;
  }

  /**
   * Get the slide DOM element
   * @returns {HTMLElement}
   */
  getElement() {
    if (!this.element) {
      this.element = document.getElementById(this.elementId);
    }
    return this.element;
  }

  /**
   * Called when slide becomes active
   * @param {Object} data - Optional data
   */
  onEnter(data) {
    this.hasEntered = true;
  }

  /**
   * Called when slide becomes inactive
   */
  onExit() {
    // Override in subclass
  }

  /**
   * Animate number counting up
   * @param {HTMLElement} element - Target element
   * @param {number} target - Target number
   * @param {number} duration - Animation duration in ms
   */
  animateNumber(element, target, duration = 1000) {
    if (!element) return;
    
    const start = 0;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * easeProgress);
      
      element.textContent = current.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  /**
   * Apply typewriter effect
   * @param {HTMLElement} element - Target element
   * @param {string} text - Text to type
   * @param {number} speed - Characters per second
   */
  typewrite(element, text, speed = 50) {
    if (!element) return Promise.resolve();
    
    return new Promise((resolve) => {
      element.textContent = '';
      let index = 0;
      
      const type = () => {
        if (index < text.length) {
          element.textContent += text.charAt(index);
          index++;
          setTimeout(type, 1000 / speed);
        } else {
          resolve();
        }
      };
      
      type();
    });
  }

  /**
   * Stagger reveal child elements
   * @param {HTMLElement} parent - Parent element
   * @param {string} selector - Child selector
   * @param {number} delay - Delay between reveals in ms
   */
  staggerReveal(parent, selector, delay = 100) {
    if (!parent) return;
    
    const children = parent.querySelectorAll(selector);
    children.forEach((child, index) => {
      child.style.opacity = '0';
      child.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        child.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
        child.style.opacity = '1';
        child.style.transform = 'translateY(0)';
      }, index * delay);
    });
  }
}

/**
 * Welcome Slide (Slide 1)
 */
class WelcomeSlide extends BaseSlide {
  constructor() {
    super('slide-welcome');
  }

  onEnter(data) {
    super.onEnter(data);
    
    const element = this.getElement();
    if (!element) return;
    
    // Trigger vintage reveal animations
    const reveals = element.querySelectorAll('.vintage-reveal');
    reveals.forEach((el, index) => {
      el.style.animationDelay = `${index * 0.2}s`;
    });
  }
}

/**
 * Title Card Slide (Slide 2)
 */
class TitleCardSlide extends BaseSlide {
  constructor() {
    super('slide-title');
  }

  onEnter(data) {
    super.onEnter(data);
    
    const element = this.getElement();
    if (!element) return;
    
    // Avatar reveal animation
    const avatar = element.querySelector('.vintage-avatar');
    if (avatar) {
      avatar.classList.add('photo-reveal');
    }
    
    // Stagger reveal details
    this.staggerReveal(element, '.detail-item:not([hidden])', 200);
    
    // Year badge animation
    const yearBadge = element.querySelector('.year-badge');
    if (yearBadge) {
      setTimeout(() => {
        yearBadge.classList.add('vintage-reveal');
      }, 800);
    }
  }
}

/**
 * Velocity Slide (Slide 3)
 */
class VelocitySlide extends BaseSlide {
  constructor() {
    super('slide-velocity');
  }

  onEnter(data) {
    super.onEnter(data);
    
    const element = this.getElement();
    if (!element) return;
    
    // Animate statistics numbers
    const statNumbers = element.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
      const target = parseInt(stat.textContent.replace(/,/g, '')) || 0;
      if (target > 0) {
        this.animateNumber(stat, target, 1500);
      }
    });
    
    // Card entrance
    const card = element.querySelector('.vintage-card');
    if (card) {
      card.classList.add('film-reel-enter');
    }
  }
}

/**
 * Heatmap Slide (Slide 4)
 */
class HeatmapSlide extends BaseSlide {
  constructor() {
    super('slide-heatmap');
  }

  onEnter(data) {
    super.onEnter(data);
    
    const element = this.getElement();
    if (!element) return;
    
    // Card entrance
    const card = element.querySelector('.vintage-card');
    if (card) {
      card.classList.add('film-reel-enter');
    }
    
    // Cells animate via CSS with grid-cell-animate class
    // Added during rendering in charts-renderer.js
  }
}

export { VintageSlides, BaseSlide };
