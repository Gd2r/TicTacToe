
const Gameboard = (() => {

    let board = ["", "", "", "", "", "", "", "", ""];


    const reset = () => {
        board = ["", "", "", "", "", "", "", "", ""];
    };

    const placeMarker = (index, marker) => {
        if (board[index] === "") {
            board[index] = marker;
            return true; 
        }
        return false; 
    };

    const getBoard = () => [...board]; 

    // expose these fucntions by Gameboard.reset or .placeMarker
    return { reset, placeMarker, getBoard };
})();




// PLAYER FACTORY WITH NAME AND MARKER (X OR O)
const Player = (name, marker) => {
    return { 
        name,  
        marker  
    };
};



// here's all IIFE
const GameController = (() => {
    
    let players = [];          // Array to store player objects
    let currentPlayerIndex;    // 0 or 1 (index in players array)
    let gameOver;              // Boolean flag

    // start's new game with 2 players (duh)
    const startNewGame = (player1Name, player2Name) => {
        players = [
            Player(player1Name, "X"),
            Player(player2Name, "O")
        ];
        currentPlayerIndex = 0; 
        gameOver = false;
        Gameboard.reset();      
    };

    // whose turn to play based on player index
    const getCurrentPlayer = () => players[currentPlayerIndex];

    const checkWin = () => {
        const winCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8], // rows

            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8], // columns

            [0, 4, 8],
            [2, 4, 6] // diagonals
        ];

        
        return winCombinations.some(combination => {
            const [a, b, c] = combination;
            const board = Gameboard.getBoard();
            
            return board[a] && 
                   board[a] === board[b] && 
                   board[a] === board[c];
        });
    };

    // Check if all cells are filled
    const checkTie = () => {
        return Gameboard.getBoard().every(cell => cell !== "");
    };

    // Handle a player's turn
    const playTurn = (cellIndex) => {
        if (gameOver) return; 

        
        if (Gameboard.placeMarker(cellIndex, getCurrentPlayer().marker)) {
            if (checkWin()) {
                gameOver = true;
                return { winner: getCurrentPlayer() }; 
            }

            if (checkTie()) {
                gameOver = true;
                return { tie: true }; // Return that it's a tie
            }
            
            currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
        }
    };

    return { startNewGame, getCurrentPlayer, playTurn };
})();

const DisplayController = (() => {
    const playerForm = document.getElementById('player-form');
    const gameboard = document.getElementById('gameboard');
    const message = document.getElementById('message');
    const restartButton = document.getElementById('restart');

    const initialize = () => {
        createBoard(); 
        
        playerForm.addEventListener('submit', handleFormSubmit);
        restartButton.addEventListener('click', handleRestart);
    };

    const createBoard = () => {
        gameboard.innerHTML = ""; 
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i; 
            cell.addEventListener('click', handleCellClick);
            gameboard.appendChild(cell);
        }
    };

    const updateBoard = () => {
        const board = Gameboard.getBoard();
        document.querySelectorAll('.cell').forEach((cell, index) => {
            cell.textContent = board[index]; 
        });
    };

    const handleCellClick = (e) => {
        const cellIndex = parseInt(e.target.dataset.index);
        const result = GameController.playTurn(cellIndex);
        
        updateBoard();
        updateMessage(result);
    };

    const updateMessage = (result) => {
        if (result?.winner) {
            message.textContent = `${result.winner.name} wins!`;
        } else if (result?.tie) {
            message.textContent = "It's a tie!";
        } else {
            message.textContent = `${GameController.getCurrentPlayer().name}'s turn`;
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const player1 = document.getElementById('player1').value;
        const player2 = document.getElementById('player2').value;
        GameController.startNewGame(player1, player2);
        playerForm.reset(); // Clear input fields
        updateBoard();
        updateMessage();
    };

    const handleRestart = () => {
        GameController.startNewGame(
            document.getElementById('player1').value || "Player 1",
            document.getElementById('player2').value || "Player 2"
        );
        updateBoard();
        updateMessage();
    };

    return { initialize };
})();

document.addEventListener('DOMContentLoaded', DisplayController.initialize);