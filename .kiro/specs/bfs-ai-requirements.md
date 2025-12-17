# BFS AI Rival Snake - Requirements Document

## Project Overview
Implement an AI-controlled rival snake that uses Breadth-First Search (BFS) pathfinding algorithm to compete intelligently with the human player in the Retro Revival Snake game.

## Core Requirements

### 1. BFS Pathfinding Algorithm
**Requirement ID**: REQ-001  
**Priority**: High  
**Description**: Implement a BFS algorithm that finds the shortest path from the AI snake's head to the target food.

**Acceptance Criteria**:
- BFS explores all possible paths level by level
- Returns the shortest path in terms of number of moves
- Handles obstacles (walls, snake bodies) correctly
- Performance optimized for real-time gameplay (< 16ms per calculation)

### 2. Dynamic Obstacle Avoidance
**Requirement ID**: REQ-002  
**Priority**: High  
**Description**: AI snake must dynamically avoid collisions with walls, its own body, and the player snake.

**Acceptance Criteria**:
- Real-time obstacle map generation including both snakes
- Path recalculation when obstacles change
- Fallback behavior when no path to food exists
- Collision prediction for moving obstacles (player snake)

### 3. Intelligent Target Selection
**Requirement ID**: REQ-003  
**Priority**: Medium  
**Description**: AI should intelligently choose which food to target when multiple options exist or when direct path is blocked.

**Acceptance Criteria**:
- Evaluate multiple food targets if available
- Consider path length and safety when choosing targets
- Switch targets dynamically based on game state changes
- Prioritize closer food when paths are equally safe

### 4. Competitive Behavior
**Requirement ID**: REQ-004  
**Priority**: Medium  
**Description**: AI should exhibit competitive behavior against the human player.

**Acceptance Criteria**:
- Attempt to reach food before the player when possible
- Block player access to food when strategically advantageous
- Maintain aggressive but fair gameplay balance
- Adapt strategy based on current score differential

### 5. Safety-First Movement
**Requirement ID**: REQ-005  
**Priority**: High  
**Description**: When no safe path to food exists, AI must prioritize survival over food acquisition.

**Acceptance Criteria**:
- Implement survival mode when trapped or no food path available
- Find longest possible safe path to avoid immediate death
- Use space-filling algorithms to maximize survival time
- Gracefully handle dead-end situations

### 6. Performance Optimization
**Requirement ID**: REQ-006  
**Priority**: High  
**Description**: BFS calculations must not impact game performance or frame rate.

**Acceptance Criteria**:
- Path calculation completes within 16ms (60 FPS target)
- Memory usage remains under 10MB for pathfinding operations
- Efficient data structures for queue and visited nodes
- Path caching and reuse when appropriate

## Technical Specifications

### BFS Algorithm Implementation
```javascript
// Core BFS structure
class BFSPathfinder {
    findPath(start, goal, obstacles) {
        // Queue for BFS traversal
        // Visited set for cycle prevention
        // Parent tracking for path reconstruction
        // Level-by-level exploration
    }
}
```

### Data Structures Required
- **Queue**: FIFO queue for BFS node exploration
- **Set**: Visited nodes tracking
- **Map**: Parent node relationships for path reconstruction
- **Grid**: 2D representation of game board with obstacles

### Performance Targets
- **Path Calculation**: < 16ms per update
- **Memory Usage**: < 10MB for pathfinding data
- **Update Frequency**: 5-10 times per second
- **Grid Size**: 40x30 cells maximum

## Functional Requirements

### F1: Real-Time Pathfinding
The AI snake must calculate and update its path in real-time during gameplay without causing frame drops or lag.

### F2: Multi-Target Evaluation
When multiple food items exist, the AI should evaluate all targets and choose the optimal one based on:
- Path length (BFS guarantees shortest path)
- Path safety (avoiding potential traps)
- Competitive advantage (blocking player access)

### F3: Dynamic Replanning
The AI must recalculate its path when:
- Player snake moves and blocks the current path
- New food spawns closer than current target
- Current path becomes unsafe due to snake growth
- No valid path exists to current target

### F4: Fallback Behaviors
When no path to food exists, the AI should:
1. Find the longest safe path available
2. Move toward open space to avoid immediate collision
3. Execute space-filling patterns to maximize survival
4. Avoid creating self-traps when possible

## Non-Functional Requirements

### Performance
- Maintain 60 FPS during AI calculations
- Pathfinding operations complete within one frame
- Memory efficient obstacle representation

### Usability
- AI provides challenging but fair competition
- Predictable movement patterns that players can learn
- Balanced difficulty that scales with game progression

### Reliability
- Robust error handling for edge cases
- Graceful degradation when pathfinding fails
- No infinite loops or deadlock conditions

## Constraints and Assumptions

### Technical Constraints
- Browser-based JavaScript implementation
- Single-threaded execution environment
- Limited to HTML5 Canvas rendering
- Web Audio API for sound effects

### Game Constraints
- Fixed grid-based movement (40x30 cells)
- Turn-based movement system
- Single food item active at a time
- No diagonal movement allowed

### Assumptions
- Player uses standard arrow key controls
- Game runs at consistent 60 FPS
- Modern browser with ES6+ support
- Sufficient memory for pathfinding operations

## Success Criteria

### Primary Success Metrics
1. **AI Competitiveness**: AI wins 40-60% of games against average players
2. **Performance**: Maintains 60 FPS with AI active
3. **Responsiveness**: AI reacts to game changes within 200ms
4. **Reliability**: Zero crashes or infinite loops during 1000 game sessions

### Secondary Success Metrics
1. **Player Engagement**: Players report AI as challenging but fair
2. **Code Quality**: 90%+ test coverage for pathfinding algorithms
3. **Maintainability**: Clear separation of AI logic from game engine
4. **Extensibility**: Easy to modify AI difficulty or behavior

## Risk Assessment

### High Risk
- **Performance Impact**: BFS calculations may cause frame drops
- **Infinite Loops**: Poorly implemented BFS could hang the game
- **Memory Leaks**: Large pathfinding data structures not properly cleaned

### Medium Risk
- **AI Too Difficult**: Overly aggressive AI may frustrate players
- **Predictable Behavior**: Simple BFS may become too predictable
- **Edge Case Handling**: Unusual game states may break pathfinding

### Mitigation Strategies
- Implement time-bounded BFS with early termination
- Extensive testing with automated game scenarios
- Memory profiling and cleanup verification
- Difficulty adjustment mechanisms
- Comprehensive error handling and logging