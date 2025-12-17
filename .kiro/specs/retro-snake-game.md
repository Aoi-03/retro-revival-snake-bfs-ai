# Retro Revival Snake Game with AI Rival

## Overview
A modern take on the classic Snake game featuring retro aesthetics, smooth gameplay, and an intelligent AI opponent. Players compete against an AI snake in real-time on the same board.

## Core Features

### 1. Game Mechanics
- **Classic Snake Movement**: Arrow key controls with continuous movement
- **Food System**: Randomly spawned food items that increase snake length
- **Collision Detection**: Wall and self-collision ends the game
- **Score System**: Points based on food consumed and survival time
- **Dual Snake Gameplay**: Player vs AI snake on shared board

### 2. AI Rival System
- **BFS Pathfinding AI**: Uses Breadth-First Search algorithm for optimal pathfinding
- **Competitive Intelligence**: Strategic blocking, interception, and food racing
- **Dynamic Strategy**: Adapts behavior based on score differential and game state
- **Survival Mode**: Prioritizes safety when no food path exists

### 3. Retro Visual Design
- **Pixel Art Style**: 8-bit inspired graphics with crisp pixel rendering
- **Retro Color Palette**: Classic green/amber terminal colors with neon accents
- **CRT Effect**: Optional scanlines and screen curvature
- **Retro Typography**: Pixel-perfect bitmap fonts

### 4. Audio Experience
- **Chiptune Soundtrack**: 8-bit style background music
- **Sound Effects**: Retro beeps for movement, eating, and game events
- **Audio Controls**: Volume adjustment and mute options

## Technical Requirements

### Technology Stack
- **Frontend**: HTML5 Canvas, JavaScript (ES6+), CSS3
- **Build Tool**: Vite for development and bundling
- **Audio**: Web Audio API for sound generation
- **Storage**: LocalStorage for high scores and settings

### Performance Targets
- **Frame Rate**: Consistent 60 FPS gameplay
- **Responsiveness**: <16ms input lag
- **Load Time**: <2 seconds initial load
- **Memory Usage**: <50MB peak memory

### Browser Support
- Modern browsers with Canvas and Web Audio API support
- Mobile responsive design for touch controls

## Game States

### 1. Main Menu
- Start Game button
- Settings menu (audio, difficulty, controls)
- High Scores display
- Credits/About section

### 2. Gameplay
- Real-time snake movement for both player and AI
- Score display for both snakes
- Food counter and timer
- Pause functionality

### 3. Game Over
- Winner announcement (Player/AI/Draw)
- Final scores comparison
- Restart and menu options
- High score recording

## AI Implementation Details

### BFS Pathfinding Algorithm
```
1. Use Breadth-First Search to find shortest path to food
2. Explore all positions level by level (guarantees shortest path)
3. Implement competitive strategies (blocking, interception)
4. Fallback to survival mode when no food path exists
5. Dynamic strategy adjustment based on game state
```

### Competitive Strategies
- **Food Racing**: Direct competition for food acquisition
- **Path Blocking**: Strategic positioning to block player access
- **Interception**: Predicting and intercepting player movements
- **Territorial Control**: Claiming strategic board positions

### Difficulty Scaling
- **Easy**: Slower updates, basic BFS pathfinding only
- **Medium**: Standard speed, competitive strategies enabled
- **Hard**: Fast updates, aggressive blocking, predictive behavior

## File Structure
```
retro-revival-kiro-snake/
├── src/
│   ├── game/
│   │   ├── Game.js          # Main game controller
│   │   ├── Snake.js         # Snake entity class
│   │   ├── Food.js          # Food system
│   │   └── Board.js         # Game board management
│   ├── ai/
│   │   ├── AISnake.js       # AI snake implementation
│   │   └── pathfinding.js   # BFS pathfinding algorithm
│   ├── graphics/
│   │   ├── Renderer.js      # Canvas rendering engine
│   │   └── effects.js       # Visual effects (CRT, particles)
│   ├── audio/
│   │   ├── AudioManager.js  # Sound system
│   │   └── sounds/          # Audio assets
│   ├── ui/
│   │   ├── Menu.js          # Menu system
│   │   └── HUD.js           # In-game UI
│   └── utils/
│       ├── input.js         # Input handling
│       └── storage.js       # LocalStorage utilities
├── assets/
│   ├── sprites/             # Pixel art assets
│   └── fonts/               # Retro fonts
├── index.html
├── style.css
└── main.js
```

## Development Phases

### Phase 1: Core Game Engine
- [ ] Basic snake movement and controls
- [ ] Food spawning and consumption
- [ ] Collision detection system
- [ ] Score tracking

### Phase 2: AI Implementation
- [ ] Basic AI snake with simple pathfinding
- [ ] Collision avoidance algorithms
- [ ] AI difficulty levels

### Phase 3: Visual Polish
- [ ] Retro graphics and animations
- [ ] CRT effects and visual enhancements
- [ ] Responsive UI design

### Phase 4: Audio & Final Features
- [ ] Chiptune audio system
- [ ] Menu system and game states
- [ ] High score persistence
- [ ] Mobile controls

## Success Criteria
- Smooth 60 FPS gameplay on target devices
- Engaging AI opponent that provides fair challenge
- Authentic retro aesthetic that evokes nostalgia
- Intuitive controls and clear game feedback
- Replayable gameplay with progression system

## Future Enhancements
- Multiplayer support (local and online)
- Power-ups and special food types
- Tournament mode with multiple AI opponents
- Level editor for custom boards
- Achievement system