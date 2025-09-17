# Anapana Meditation Timer App 🧘‍♂️

A beautiful, feature-rich Progressive Web App (PWA) for Anapana meditation practice with advanced tracking, customizable sounds, and comprehensive analytics.

## 🌟 Features

### Core Timer Functionality
- ⏱️ **Precision Timer** - Accurate countdown with visual progress ring
- ▶️ **Play/Pause/Reset** - Full timer control with keyboard shortcuts
- 🎯 **Quick Presets** - 5, 10, 15, 20, 30, and 45-minute sessions
- ⚙️ **Custom Duration** - Set any custom time with minutes and seconds
- 🔄 **Background Operation** - Continues running when app is minimized

### Audio Features
- 🔔 **Meditation Bells** - Start, end, and interval bells with multiple sound options
  - Tibetan Bell
  - Singing Bowl
  - Soft Chime
  - Temple Gong
  - **Fallback System**: Synthesized bell sounds if audio files are missing
- 🌊 **Ambient Sounds** - Optional background sounds during meditation
  - Forest sounds
  - Rain
  - Ocean waves
  - White noise
- 🔊 **Volume Control** - Adjustable volume for all audio elements
- 🔕 **Silent Mode** - Option to disable all sounds
- ⚡ **Smart Audio Handling** - Graceful fallback when audio files are unavailable

### Progress Tracking & Analytics
- 📊 **Session Statistics** - Track total sessions, minutes, and streaks
- 📈 **Weekly Progress** - Visual chart of daily practice
- 🏆 **Achievement System** - Streak tracking and milestone celebrations
- 💾 **Data Persistence** - All data saved locally in browser
- 📤 **Export/Import** - Backup and restore your meditation data
- 📱 **Daily Reminders** - Customizable notification reminders

### User Experience
- 🎨 **Beautiful Design** - Calming gradients and smooth animations
- 📱 **Responsive Layout** - Works perfectly on desktop, tablet, and mobile
- 🌙 **Dark Mode Support** - Automatic dark/light theme detection
- ♿ **Accessibility** - Full keyboard navigation and screen reader support
- 🔧 **PWA Support** - Install on any device, works offline
- ⌨️ **Keyboard Shortcuts** - Space to play/pause, R to reset, ESC to close modals

## 🚀 Quick Start

### Option 1: Direct File Access
1. Download all files to a local directory
2. Open `index.html` in your web browser
3. Start meditating immediately!

### Option 2: Local Web Server (Recommended)
```bash
# Using Python
cd app
python -m http.server 8000

# Using Node.js
cd app
npx serve

# Using PHP
cd app
php -S localhost:8000
```
Then open `http://localhost:8000` in your browser.

### Option 3: Live Server (VS Code)
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## 📱 Installation as PWA

### Desktop (Chrome/Edge/Brave)
1. Open the app in your browser
2. Look for the install icon in the address bar
3. Click "Install" or "Add to desktop"

### Mobile (Android)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home screen"

### Mobile (iOS)
1. Open the app in Safari
2. Tap the share button
3. Select "Add to Home Screen"

## 🎯 Usage Guide

### Basic Timer Operation
1. **Set Duration**: Choose a preset or set custom time
2. **Configure Audio**: Enable/disable bells and ambient sounds
3. **Start Session**: Click play or press spacebar
4. **Focus on Breath**: Observe your breathing at the nostrils
5. **End Mindfully**: Bell will ring when time is complete

### Keyboard Shortcuts
- `Space` - Play/Pause timer
- `R` - Reset timer
- `Esc` - Close any open modal
- `Tab` - Navigate between elements

### Settings Options
- **Bell Sounds**: Choose from 4 different bell types
- **Ambient Audio**: Optional background sounds
- **Volume Control**: Adjust all audio levels
- **Interval Bells**: Optional bells during meditation
- **Daily Reminders**: Set notification times
- **Data Management**: Export/import meditation history

## 📊 Progress Tracking

### Statistics Tracked
- Total meditation sessions completed
- Total minutes meditated
- Current and longest streaks
- Average session length
- Weekly practice patterns
- Recent session history

### Data Storage
- All data stored locally in browser's localStorage
- No account required or data sent to servers
- Export feature creates JSON backup file
- Import feature restores from backup

## 🔧 Technical Details

### Technologies Used
- **Frontend**: HTML5, CSS3 (CSS Custom Properties), Vanilla JavaScript
- **PWA**: Service Worker, Web App Manifest
- **Audio**: HTML5 Audio API
- **Storage**: LocalStorage API
- **Notifications**: Web Notifications API
- **Icons**: Font Awesome 6

### Browser Support
- Chrome/Chromium 70+
- Firefox 70+
- Safari 14+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Performance
- Lightweight (~200KB total including CSS and JS)
- Fast loading with minimal dependencies
- Efficient timer using requestAnimationFrame
- Optimized images and assets

## 🎨 Customization

### Color Themes
The app uses CSS custom properties for easy theming. Key color variables:
```css
:root {
  --primary-color: #6366f1;      /* Main brand color */
  --accent-color: #10b981;       /* Success/completion color */
  --text-primary: #1f2937;       /* Main text */
  --bg-primary: #ffffff;         /* Background */
}
```

### Audio Files
Replace audio files in the `/sounds/` directory:
- `tibetan-bell.mp3` - Default meditation bell
- `singing-bowl.mp3` - Alternative bell sound
- `soft-chime.mp3` - Gentle chime option
- `temple-gong.mp3` - Deep gong sound
- `forest.mp3` - Forest ambient sounds
- `rain.mp3` - Rain ambient sounds
- `ocean.mp3` - Ocean wave sounds
- `white-noise.mp3` - White noise

### Adding New Features
The modular JavaScript structure makes it easy to add new features:
- Timer logic is in the `MeditationTimer` class
- Notifications handled by `NotificationManager`
- Audio management integrated in main class
- Data persistence methods are clearly separated

## 🐛 Troubleshooting

### Audio Not Playing
- **Fallback System Active**: App automatically uses synthesized bell sounds if audio files are missing
- Check browser autoplay policies
- Try starting timer to enable audio context
- **Add Real Audio Files**: Place MP3 files in `/sounds/` folder:
  - `tibetan-bell.mp3`, `singing-bowl.mp3`, `soft-chime.mp3`, `temple-gong.mp3`
- Check volume settings in app

### Timer Not Accurate
- Browser may throttle timers in background tabs
- Use the PWA installed version for best performance
- Check if other extensions are interfering

### Data Lost
- Export data regularly as backup
- Check if localStorage is enabled
- Ensure browser isn't clearing data
- Use private/incognito mode testing

### PWA Not Installing
- Ensure HTTPS connection (or localhost)
- Check manifest.json is accessible
- Verify service worker is registered
- Try force refresh (Ctrl+F5)

## 🤝 Contributing

This is an open-source project! Ways to contribute:

### Bug Reports
- Use GitHub issues for bug reports
- Include browser version and steps to reproduce
- Screenshots helpful for UI issues

### Feature Requests
- Suggest new meditation features
- UI/UX improvements
- Audio enhancements
- Analytics additions

### Code Contributions
- Fork the repository
- Create feature branch
- Follow existing code style
- Test thoroughly before PR

## 📄 License

MIT License - Feel free to use, modify, and distribute.

## 🙏 Acknowledgments

- **Buddhist Tradition** - For the ancient Anapana meditation technique
- **S.N. Goenka** - For popularizing Vipassana and Anapana practice
- **Open Source Community** - For the tools and libraries used

## 📞 Support

- 📧 Create an issue on GitHub for bugs/features
- 📖 Check the documentation for common questions
- 🧘‍♂️ Enjoy your meditation practice!

---

*"The mind is everything. What you think you become." - Buddha*

**May this tool support your journey toward inner peace and mindfulness.** 🕉️