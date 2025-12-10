# 🎬 GitStory 2025 - Vintage Cinema Edition

*A vintage cinematic experience that transforms your GitHub contributions into a film-noir style journey through your year in code.*

## ✨ Features

### 🎥 **Cinematic Experience**
- **12 Beautiful Slides**: Each telling a different part of your GitHub story
- **Vintage Film Noir Design**: Sepia tones, aged paper textures, film grain effects
- **Smooth Animations**: Typewriter effects, film reel transitions, vintage reveals
- **Desktop-First**: Optimized for desktop experience with keyboard/mouse controls

### 📊 **Live GitHub Data**
- **Real-time Statistics**: Fetches live data from GitHub API
- **Smart Repository Scoring**: 12-factor algorithm to rank your best projects
- **Activity Pattern Analysis**: Discover your coding persona and productivity patterns
- **Language Detection**: Automatic analysis of your programming language diversity

### 🎨 **Vintage Design System**
- **Film Noir Color Palette**: Dark browns, muted golds, sepia accents
- **Typography**: Playfair Display (serif), Bebas Neue (display), Courier Prime (mono)
- **Visual Effects**: Film grain, vignette, aged paper textures
- **Authentic Animations**: Projector start-up, reel spinning, flicker effects

### 🎮 **Interactive Controls**
- **Keyboard Navigation**: Arrow keys, spacebar, escape, enter
- **Mouse Controls**: Click left/right for navigation
- **Auto-Advance**: 8 seconds per slide with pause capability
- **Fullscreen Mode**: Immersive cinema experience

### 📷 **Export Features**
- **Movie Poster**: Download vintage-style poster of your GitHub year
- **High Resolution**: 1920x1080 poster with film frame
- **Social Sharing**: Share your GitStory on social media
- **Multiple Themes**: Vintage, noir, sepia, blueprint options

## 🏗️ **Project Structure**

```
gitstory-vintage/
├── index.html                    # Main entry point
├── css/
│   ├── vintage-theme.css         # Film noir design system
│   ├── animations.css            # Vintage transitions & effects
│   ├── charts.css                # Data visualization styles
│   └── responsive.css            # Desktop-first responsive design
├── js/
│   ├── app.js                    # Main application controller
│   ├── github-api.js             # GitHub API integration
│   ├── vintage-slides.js         # Slide management system
│   ├── data-processor.js         # Data analysis algorithms
│   ├── charts-renderer.js        # Canvas/SVG chart rendering
│   └── poster-export.js          # Movie poster generation
├── assets/
│   ├── fonts/                    # Custom vintage fonts
│   ├── textures/                 # Paper/film grain textures
│   └── icons/                    # Vintage-style UI icons
└── README.md                     # This file
```

## 🎭 **The 11 Cinematic Slides**

### **Slide 1: GitStory Wrapped**
- Enter your gitub username
- Add github token (should be optinal)
- Play story button

### **Slide 2: Title Card**
- Vintage film reel opening animation
- Username with typewriter effect
- User avatar with vintage frame
- Location, company, and join date

### **Slide 2: Velocity Chronicle**
- Line chart showing daily contributions
- Aged paper background with hand-drawn style
- Total contributions, daily average, best streak

### **Slide 3: Grid Tapestry**
- Full-year contribution heatmap
- Vintage quilt pattern styling
- Color-coded contribution levels

### **Slide 4: Composition Ledger**
- Pie chart showing activity breakdown
- Antique accounting book design
- Commits vs PRs vs Issues vs Reviews

### **Slide 5: Daily Routine**
- Bar chart of hourly activity patterns
- Train schedule board aesthetic
- Peak coding hours and busiest day

### **Slide 6: Productivity Hours**
- Time-of-day analysis with persona
- Vintage clock face visualization
- Morning/Afternoon/Evening/Night breakdown

### **Slide 7: Community Standing**
- Social register style display
- Followers, stars, repositories count
- Community engagement metrics

### **Slide 8: Language Portfolio**
- Type specimen book design
- Top programming languages with percentages
- Language diversity score

### **Slide 9: Top 5 Repositories**
- Library card catalog aesthetic
- Repository scoring with 12 factors
- Stars, forks, language, score display

### **Slide 10: Featured Repository**
- Movie poster spotlight on #1 repo
- Detailed repository information
- Direct link to GitHub repository

### **Slide 11: Grand Finale**
- Vintage movie credits style
- Downloadable poster with confetti
- Share and restart options

## 🧬 **Coding Personas**

Based on your activity patterns, you'll be assigned one of these vintage personas:

- **🌙 Night Owl**: Peak activity after 10 PM
- **🌅 Early Bird**: Peak activity before noon
- **🗓️ Weekend Warrior**: >35% commits on weekends
- **🎨 Grid Painter**: 1200+ contributions (green squares everywhere)
- **⚡ The Consistent**: 400+ contributions, steady contributor
- **⭐ Community Star**: 500+ followers or 1000+ total stars
- **🔧 The Tinkerer**: Default - you're exploring!

## 🎨 **Design System**

### **Color Palette**
```css
--vintage-primary: #2c1810;      /* Dark brown */
--vintage-secondary: #8b6914;    /* Muted gold */
--vintage-accent: #cd853f;        /* Peru/sepia */
--vintage-cream: #f5e6d3;         /* Antique paper */
--vintage-dark: #1a0f08;          /* Near black */
--vintage-gray: #704214;          /* Dark olive */
--vintage-light: #d4a574;         /* Light brown */
```

### **Typography**
- **Serif**: Playfair Display (headings, vintage feel)
- **Display**: Bebas Neue (titles, cinematic impact)
- **Monospace**: Courier Prime (code, data, typewriter effect)

### **Visual Effects**
- **Sepia Filter**: `filter: sepia(0.3)`
- **Film Grain**: Subtle noise overlay
- **Vignette**: Darkened edges for vintage look
- **Aged Paper**: Texture overlay for authenticity

## 🚀 **Getting Started**

### **Prerequisites**
- Modern web browser with ES6+ support
- GitHub account (for data fetching)
- Optional: GitHub Personal Access Token (for higher rate limits)

### **Installation**
1. Clone or download the project
2. Open `index.html` in your web browser
3. The app will automatically load data for `hoojinguyen`

### **GitHub Token (Optional)**
For enhanced features and higher rate limits:
1. Create a GitHub Personal Access Token
2. Scopes: `repo`, `read:org`, `read:user`
3. Add token through the app interface
4. Benefits: 5000 requests/hour vs 60 without token

### **Usage**
- **Navigation**: Use arrow keys or click left/right sides of slides
- **Pause**: Press spacebar or click pause button
- **Fullscreen**: Press F11 or click fullscreen button
- **Export**: Click camera button to download poster

## 📊 **Data Sources**

### **GitHub API Endpoints**
- `/users/{username}` - Basic profile information
- `/users/{username}/repos` - Repository list
- `/users/{username}/events` - Activity patterns
- `github-contributions-api.jogruber.de` - Contribution heatmap

### **Rate Limits**
- **Without Token**: 60 requests/hour
- **With Token**: 5000 requests/hour
- **Caching**: 5-minute local cache to optimize performance

## 🎯 **Repository Scoring Algorithm**

Projects are ranked using 12 factors:

1. **Stars** (25%): Logarithmic scale for popularity
2. **Forks** (20%): Community engagement
3. **Recent Activity** (25%): Freshness with time decay
4. **Originality** (15%): Bonus for non-forked projects
5. **Description Quality** (10%): Well-documented projects
6. **Size** (5%): Project complexity indicator

## 🛠️ **Technical Implementation**

### **Frontend Technologies**
- **HTML5**: Semantic structure with accessibility
- **CSS3**: Vintage styling with animations
- **Vanilla JavaScript**: No frameworks, pure ES6+
- **Canvas API**: Chart rendering and poster generation

### **Performance Features**
- **Lazy Loading**: Charts render when slides become visible
- **Caching**: 5-minute cache for API responses
- **Optimized Animations**: CSS transforms over JavaScript
- **Responsive Design**: Desktop-first with mobile support

### **Browser Compatibility**
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Mobile**: Touch controls and responsive layout

## 🎬 **Customization**

### **Themes**
The app supports multiple vintage themes:
- **Vintage**: Default sepia and brown tones
- **Noir**: Black and white dramatic style
- **Sepia**: Enhanced vintage photo effect
- **Blueprint**: Technical drawing aesthetic

### **Personalization**
- **Username**: Change target GitHub user
- **Slide Duration**: Adjust auto-advance timing
- **Theme Selection**: Choose preferred vintage style
- **Export Quality**: High-resolution poster options

## 📱 **Controls Reference**

### **Keyboard Shortcuts**
- **← / A**: Previous slide
- **→ / D**: Next slide
- **Space**: Play/Pause
- **Enter**: Fullscreen
- **Escape**: Exit fullscreen

### **Mouse Controls**
- **Click Left 1/3**: Previous slide
- **Click Right 2/3**: Next slide
- **Hover**: Pause auto-advance
- **Double-click**: Fullscreen toggle

## 🔧 **Development**

### **Local Development**
1. Open project in VS Code or preferred editor
2. Use Live Server extension for hot reload
3. Open browser developer tools for debugging
4. Test with different GitHub usernames

### **Building for Production**
- Minify CSS and JavaScript files
- Optimize images and assets
- Enable gzip compression on server
- Test across different browsers

## 📄 **License**

MIT License - Feel free to use, modify, and distribute

## 🤝 **Contributing**

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🙏 **Acknowledgments**

- **GitHub API**: For providing the data
- **Google Fonts**: Playfair Display, Bebas Neue, Courier Prime
- **Vintage Design**: Inspired by classic film noir aesthetics
- **GitStory Concept**: Original idea by the open source community

---

**Made with 💜 and vintage aesthetics for developers who appreciate the classics**

*Transform your GitHub contributions into a cinematic journey through your year in code.*