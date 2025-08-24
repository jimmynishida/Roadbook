document.addEventListener('DOMContentLoaded', () => {
    // --- 元素獲取 ---
    const puzzleContainer = document.getElementById('puzzle-container');
    const puzzleTitle = document.getElementById('puzzle-title');
    const movesCounter = document.getElementById('moves-counter');
    const completionMessage = document.getElementById('completion-message');
    const completeButton = document.getElementById('complete-button');

    // --- 遊戲設定與狀態 ---
    const TOTAL_LEVELS = 2; // ★★★ 在這裡設定總關卡數 ★★★
    let currentLevel = 0;
    let moves = 0;
    let availablePuzzles = [];
    let currentPuzzleData = null;
    let pieces = [];
    let draggedPiece = null;

    // --- 遊戲函式 ---

    // 1. 遊戲初始化 (僅執行一次)
    function initGame() {
        // 將所有可用的拼圖資料轉換為陣列並打亂順序
        availablePuzzles = Object.values(JigsawPuzzleData).sort(() => Math.random() - 0.5);
        
        if (availablePuzzles.length < TOTAL_LEVELS) {
            console.error("錯誤：可用的拼圖數量少於設定的總關卡數！");
            puzzleTitle.textContent = "拼圖資源不足！";
            return;
        }
        
        startNextLevel();
    }

    // 2. 開始新關卡
    function startNextLevel() {
        currentLevel++;
        if (currentLevel > TOTAL_LEVELS) {
            showFinalCompletion();
            return;
        }

        // 清理上一關的狀態
        puzzleContainer.innerHTML = '';
        pieces = [];
        moves = 0;
        movesCounter.textContent = `步數: 0`;
        
        // 從打亂的列表中選取下一個拼圖
        currentPuzzleData = availablePuzzles.pop(); 
        const gridSize = currentPuzzleData.gridSize;

        puzzleTitle.textContent = `第 ${currentLevel} 關：拼湊「${currentPuzzleData.title}」的回憶`;
        puzzleContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        
        // 創建拼圖碎片
        for (let i = 0; i < gridSize * gridSize; i++) {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.draggable = true;
            piece.style.backgroundImage = `url(${currentPuzzleData.imageSrc})`;
            
            // 計算 background-size 和 position
            const bgSize = gridSize * 100;
            const pieceSize = 100 / (gridSize - 1);
            const col = i % gridSize;
            const row = Math.floor(i / gridSize);
            
            piece.style.backgroundSize = `${bgSize}% ${bgSize}%`;
            piece.style.backgroundPosition = `${col * pieceSize}% ${row * pieceSize}%`;
            
            piece.dataset.index = i; // 儲存碎片的原始正確位置
            pieces.push(piece);
        }

        // 打亂碎片並加入到畫面中
        pieces.sort(() => Math.random() - 0.5);
        pieces.forEach(p => puzzleContainer.appendChild(p));

        // 綁定拖曳事件
        addEventListeners();
    }

    // 3. 綁定事件監聽器
    function addEventListeners() {
        const currentPieces = document.querySelectorAll('.puzzle-piece');
        currentPieces.forEach(piece => {
            piece.addEventListener('dragstart', onDragStart);
            piece.addEventListener('dragover', onDragOver);
            piece.addEventListener('drop', onDrop);
            piece.addEventListener('dragend', onDragEnd);
        });
    }

    // 4. 拖曳與交換邏輯 (與之前相同)
    function onDragStart(e) {
        draggedPiece = e.target;
        setTimeout(() => e.target.classList.add('invisible'), 0);
    }

    function onDragOver(e) {
        e.preventDefault();
    }

    function onDrop(e) {
        e.preventDefault();
        const droppedOnPiece = e.target;
        if (draggedPiece && draggedPiece !== droppedOnPiece) {
            const children = Array.from(puzzleContainer.children);
            const draggedIndex = children.indexOf(draggedPiece);
            const droppedIndex = children.indexOf(droppedOnPiece);

            // 交換節點
            if (draggedIndex > droppedIndex) {
                puzzleContainer.insertBefore(draggedPiece, droppedOnPiece);
            } else {
                puzzleContainer.insertBefore(draggedPiece, droppedOnPiece.nextSibling);
            }
            puzzleContainer.insertBefore(droppedOnPiece, children[draggedIndex]);
            
            moves++;
            movesCounter.textContent = `步數: ${moves}`;
            checkWin();
        }
    }

    function onDragEnd(e) {
        e.target.classList.remove('invisible');
        draggedPiece = null;
    }

    // 5. 檢查勝利條件
    function checkWin() {
        const currentPieces = [...puzzleContainer.children];
        const isWin = currentPieces.every((piece, index) => Number(piece.dataset.index) === index);

        if (isWin) {
            puzzleContainer.classList.add('completed');
            // 延遲一下，讓玩家能看到完成的拼圖，然後自動進入下一關
            setTimeout(() => {
                puzzleContainer.classList.remove('completed');
                startNextLevel();
            }, 1500); // 延遲 1.5 秒
        }
    }
    
    // 6. 顯示最終完成訊息
    function showFinalCompletion() {
        puzzleContainer.style.display = 'none';
        movesCounter.style.display = 'none';
        puzzleTitle.textContent = "挑戰成功！";
        completionMessage.classList.remove('hidden');
    }

    // 7. 綁定「繼續故事」按鈕
    completeButton.addEventListener('click', () => {
        parent.postMessage('jigsaw-game-complete', '*');
    });

    // --- 啟動遊戲 ---
    initGame();
});