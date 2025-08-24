document.addEventListener('DOMContentLoaded', () => {
    // --- 元素獲取 ---
    const puzzleContainer = document.getElementById('puzzle-container');
    const puzzleTitle = document.getElementById('puzzle-title');
    const movesCounter = document.getElementById('moves-counter');
    const completionMessage = document.getElementById('completion-message');
    const completeButton = document.getElementById('complete-button');

    // --- 遊戲設定與狀態 ---
    const TOTAL_LEVELS = 2; 
    let currentLevel = 0;
    let moves = 0;
    let availablePuzzles = [];
    let draggedPiece = null;

    // --- 遊戲函式 ---
    
    function initGame() {
        availablePuzzles = Object.values(JigsawPuzzleData).sort(() => Math.random() - 0.5);
        if (availablePuzzles.length < TOTAL_LEVELS) {
            console.error("錯誤：可用的拼圖數量少於設定的總關卡數！");
            puzzleTitle.textContent = "拼圖資源不足！";
            return;
        }
        startNextLevel();
    }

    function startNextLevel() {
        currentLevel++;
        if (currentLevel > TOTAL_LEVELS) {
            showFinalCompletion();
            return;
        }

        puzzleContainer.innerHTML = '';
        moves = 0;
        movesCounter.textContent = `步數: 0`;
        
        const currentPuzzleData = availablePuzzles.pop(); 
        const gridSize = currentPuzzleData.gridSize;

        puzzleTitle.textContent = `第 ${currentLevel} 關：拼湊「${currentPuzzleData.title}」的回憶`;
        puzzleContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        
        let pieces = [];
        for (let i = 0; i < gridSize * gridSize; i++) {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.draggable = true;
            piece.style.backgroundImage = `url(${currentPuzzleData.imageSrc})`;
            
            const bgSize = gridSize * 100;
            const pieceSize = 100 / (gridSize - 1);
            const col = i % gridSize;
            const row = Math.floor(i / gridSize);
            
            piece.style.backgroundSize = `${bgSize}% ${bgSize}%`;
            piece.style.backgroundPosition = `${col * pieceSize}% ${row * pieceSize}%`;
            
            piece.dataset.correctIndex = i;
            pieces.push(piece);
        }

        // 確保拼圖至少有一個碎片錯位，避免初始狀態即完成
        do {
            pieces.sort(() => Math.random() - 0.5);
        } while (isSolved(pieces));
        
        pieces.forEach(p => puzzleContainer.appendChild(p));
        addEventListeners();
    }

    function addEventListeners() {
        const currentPieces = document.querySelectorAll('.puzzle-piece');
        currentPieces.forEach(piece => {
            piece.addEventListener('dragstart', onDragStart);
            piece.addEventListener('dragover', onDragOver);
            piece.addEventListener('drop', onDrop);
            piece.addEventListener('dragend', onDragEnd);
        });
    }

    function onDragStart(e) {
        draggedPiece = e.target;
        setTimeout(() => e.target.classList.add('invisible'), 0);
    }

    function onDragOver(e) { e.preventDefault(); }

    function onDrop(e) {
        e.preventDefault();
        const droppedOnPiece = e.target;
        if (draggedPiece && draggedPiece !== droppedOnPiece) {
            const children = Array.from(puzzleContainer.children);
            const draggedIndex = children.indexOf(draggedPiece);
            const droppedIndex = children.indexOf(droppedOnPiece);

            puzzleContainer.replaceChild(draggedPiece, droppedOnPiece);
            puzzleContainer.insertBefore(droppedOnPiece, children[draggedIndex]);
            
            moves++;
            movesCounter.textContent = `步數: ${moves}`;
            
            if (isSolved(Array.from(puzzleContainer.children))) {
                puzzleContainer.classList.add('completed');
                setTimeout(() => {
                    puzzleContainer.classList.remove('completed');
                    startNextLevel();
                }, 1500);
            }
        }
    }

    function onDragEnd(e) {
        e.target.classList.remove('invisible');
        draggedPiece = null;
    }

    function isSolved(piecesToCheck) {
        return piecesToCheck.every((piece, index) => Number(piece.dataset.correctIndex) === index);
    }
    
    function showFinalCompletion() {
        puzzleContainer.style.display = 'none';
        movesCounter.style.display = 'none';
        puzzleTitle.textContent = "挑戰成功！";
        completionMessage.classList.remove('hidden');
    }

    completeButton.addEventListener('click', () => {
        parent.postMessage('jigsaw-game-complete', '*');
    });

    initGame();
});