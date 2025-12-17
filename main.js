// Browser-compatible version - all classes will be defined globally

class GameApp {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.game = null;
        this.audioManager = new AudioManager();
        
        this.initializeUI();
        this.setupEventListeners();
    }
    
    initializeUI() {
        // Get UI elements
        this.menuOverlay = document.getElementById('menu-overlay');
        this.gameOverOverlay = document.getElementById('game-over-overlay');
        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.menuBtn = document.getElementById('menu-btn');
        
        // Score elements
        this.playerScoreEl = document.getElementById('player-score');
        this.aiScoreEl = document.getElementById('ai-score');
        this.finalPlayerScoreEl = document.getElementById('final-player-score');
        this.finalAiScoreEl = document.getElementById('final-ai-score');
        this.winnerTextEl = document.getElementById('winner-text');
    }
    
    setupEventListeners() {
        // Menu buttons
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.startGame());
        this.menuBtn.addEventListener('click', () => this.showMainMenu());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.game && this.game.isRunning) {
                this.game.handleInput(e.key);
            }
        });
        
        // Prevent arrow key scrolling
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
    }
    
    startGame() {
        this.hideAllOverlays();
        
        // Initialize new game
        this.game = new Game(this.canvas, this.ctx);
        this.game.onScoreUpdate = (playerScore, aiScore) => {
            this.updateScores(playerScore, aiScore);
        };
        this.game.onGameOver = (winner, playerScore, aiScore) => {
            this.showGameOver(winner, playerScore, aiScore);
        };
        
        // Start the game
        this.game.start();
        this.audioManager.playBackgroundMusic();
    }
    
    updateScores(playerScore, aiScore) {
        this.playerScoreEl.textContent = playerScore;
        this.aiScoreEl.textContent = aiScore;
    }
    
    showGameOver(winner, playerScore, aiScore) {
        this.finalPlayerScoreEl.textContent = playerScore;
        this.finalAiScoreEl.textContent = aiScore;
        
        if (winner === 'player') {
            this.winnerTextEl.textContent = 'VICTORY!';
            this.winnerTextEl.style.color = '#00ff41';
        } else if (winner === 'ai') {
            this.winnerTextEl.textContent = 'AI WINS!';
            this.winnerTextEl.style.color = '#ff4141';
        } else {
            this.winnerTextEl.textContent = 'DRAW!';
            this.winnerTextEl.style.color = '#ffff41';
        }
        
        this.gameOverOverlay.classList.remove('hidden');
        this.audioManager.stopBackgroundMusic();
    }
    
    showMainMenu() {
        this.hideAllOverlays();
        this.menuOverlay.classList.remove('hidden');
        this.audioManager.stopBackgroundMusic();
        
        // Reset scores
        this.updateScores(0, 0);
    }
    
    hideAllOverlays() {
        this.menuOverlay.classList.add('hidden');
        this.gameOverOverlay.classList.add('hidden');
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GameApp();
});