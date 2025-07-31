document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const board = document.querySelector('.board');
    const tiles = document.querySelectorAll('.tile');
    const status = document.querySelector('.status');
    const resetBtn = document.querySelector('.reset-btn');
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalTitle = document.querySelector('.modal-title');
    const modalMessage = document.querySelector('.modal-message');
    const modalBtns = document.querySelectorAll('.modal-btn');
    const players = document.querySelectorAll('.player');
    const tileSound = document.getElementById('tileSound');
    const winSound = document.getElementById('winSound');
    
    // Game state
    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    
    // Winning conditions
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    // Initialize game
    init();
    
    function init() {
        // Set up event listeners
        tiles.forEach(tile => {
            tile.addEventListener('click', handleTileClick);
        });
        
        resetBtn.addEventListener('click', resetGame);
        
        modalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.textContent.includes('PLAY AGAIN')) {
                    resetGame();
                }
                modalOverlay.classList.remove('active');
            });
        });
        
        // Set initial player display
        updatePlayerDisplay();
    }
    
    function handleTileClick(e) {
        const clickedTile = e.target;
        const clickedTileIndex = parseInt(clickedTile.getAttribute('data-index'));
        
        // If tile already has a value or game is inactive, return
        if (gameState[clickedTileIndex] !== '' || !gameActive) {
            return;
        }
        
        // Play sound
        tileSound.currentTime = 0;
        tileSound.play();
        
        // Update game state and UI
        gameState[clickedTileIndex] = currentPlayer;
        clickedTile.classList.add(currentPlayer.toLowerCase());
        clickedTile.textContent = currentPlayer;
        
        // Add depth pop animation
        clickedTile.style.transform = 'scale(0.9)';
        setTimeout(() => {
            clickedTile.style.transform = 'scale(1)';
        }, 100);
        
        // Check for win or draw
        checkResult();
    }
    
    function checkResult() {
        let roundWon = false;
        let winningCombo = [];
        
        // Check all winning conditions
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            
            if (gameState[a] === '' || gameState[b] === '' || gameState[c] === '') {
                continue;
            }
            
            if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
                roundWon = true;
                winningCombo = winningConditions[i];
                break;
            }
        }
        
        // If round won, highlight winning tiles and show modal
        if (roundWon) {
            highlightWinningTiles(winningCombo);
            status.textContent = `PLAYER ${currentPlayer} WINS!`;
            gameActive = false;
            
            // Play win sound
            winSound.currentTime = 0;
            winSound.play();
            
            // Show modal
            modalTitle.textContent = 'VICTORY';
            modalMessage.textContent = `PLAYER ${currentPlayer} HAS PREVAILED`;
            setTimeout(() => {
                modalOverlay.classList.add('active');
            }, 1000);
            
            return;
        }
        
        // If round drawn, show modal
        if (!gameState.includes('')) {
            status.textContent = 'GAME ENDED IN A DRAW';
            gameActive = false;
            
            modalTitle.textContent = 'DRAW';
            modalMessage.textContent = 'NO WINNER THIS ROUND';
            setTimeout(() => {
                modalOverlay.classList.add('active');
            }, 500);
            
            return;
        }
        
        // Switch player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        status.textContent = `YOUR MOVE, PLAYER ${currentPlayer}`;
        updatePlayerDisplay();
    }
    
    function highlightWinningTiles(winningCombo) {
        winningCombo.forEach(index => {
            tiles[index].classList.add('winning');
        });
        
        // Create winning line
        const firstTile = tiles[winningCombo[0]];
        const lastTile = tiles[winningCombo[2]];
        
        const firstRect = firstTile.getBoundingClientRect();
        const lastRect = lastTile.getBoundingClientRect();
        
        const boardRect = board.getBoundingClientRect();
        
        // Determine line orientation
        if (winningCombo[0] % 3 === 0 && winningCombo[2] % 3 === 2) {
            // Horizontal line
            const line = document.createElement('div');
            line.className = 'winning-line';
            line.style.top = `${firstRect.top + firstRect.height / 2 - boardRect.top}px`;
            line.style.left = `${firstRect.left - boardRect.left}px`;
            line.style.width = `${lastRect.right - firstRect.left}px`;
            board.appendChild(line);
        } else if (winningCombo[0] < 3 && winningCombo[2] > 5) {
            // Vertical line
            const line = document.createElement('div');
            line.className = 'winning-line';
            line.style.left = `${firstRect.left + firstRect.width / 2 - boardRect.left}px`;
            line.style.top = `${firstRect.top - boardRect.top}px`;
            line.style.height = `${lastRect.bottom - firstRect.top}px`;
            line.style.width = '2px';
            line.style.transform = 'rotate(90deg)';
            board.appendChild(line);
        } else if (winningCombo[0] === 0 && winningCombo[2] === 8) {
            // Diagonal top-left to bottom-right
            const line = document.createElement('div');
            line.className = 'winning-line';
            const length = Math.sqrt(
                Math.pow(lastRect.right - firstRect.left, 2) + 
                Math.pow(lastRect.bottom - firstRect.top, 2)
            );
            line.style.width = `${length}px`;
            line.style.top = `${firstRect.top + firstRect.height / 2 - boardRect.top}px`;
            line.style.left = `${firstRect.left - boardRect.left}px`;
            line.style.transformOrigin = '0 0';
            line.style.transform = `rotate(${Math.atan2(
                lastRect.bottom - firstRect.top,
                lastRect.right - firstRect.left
            )}rad)`;
            board.appendChild(line);
        } else {
            // Diagonal top-right to bottom-left
            const line = document.createElement('div');
            line.className = 'winning-line';
            const length = Math.sqrt(
                Math.pow(firstRect.right - lastRect.left, 2) + 
                Math.pow(lastRect.bottom - firstRect.top, 2)
            );
            line.style.width = `${length}px`;
            line.style.top = `${firstRect.top + firstRect.height / 2 - boardRect.top}px`;
            line.style.left = `${firstRect.right - boardRect.left}px`;
            line.style.transformOrigin = '0 0';
            line.style.transform = `rotate(${Math.atan2(
                lastRect.bottom - firstRect.top,
                lastRect.left - firstRect.right
            )}rad)`;
            board.appendChild(line);
        }
    }
    
    function updatePlayerDisplay() {
        players.forEach(player => {
            if (player.getAttribute('data-player') === currentPlayer) {
                player.classList.add('active');
            } else {
                player.classList.remove('active');
            }
        });
    }
    
    function resetGame() {
        // Reset game state
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        
        // Reset UI
        tiles.forEach(tile => {
            tile.textContent = '';
            tile.className = 'tile';
            tile.style.transform = '';
        });
        
        // Remove winning lines
        const winningLines = document.querySelectorAll('.winning-line');
        winningLines.forEach(line => line.remove());
        
        // Update status and player display
        status.textContent = `YOUR MOVE, PLAYER ${currentPlayer}`;
        updatePlayerDisplay();
    }
});