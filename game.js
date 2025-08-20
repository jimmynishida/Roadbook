// 【★★★ game.js 最終完整版 0820★★★】

document.addEventListener('DOMContentLoaded', () => {

    // --- 統一宣告所有網頁元素 ---
    const startScreen = document.getElementById('start-screen');
    const gameArea = document.getElementById('game-area');
    const endScreen = document.getElementById('end-screen');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const scrollMap = document.getElementById('scroll-map');
    const choiceOverlay = document.getElementById('choice-overlay');
    const choiceText = document.getElementById('choice-text');
    const choiceButtons = document.getElementById('choice-buttons');
    const shareButton = document.getElementById('share-button');
    const memoryInput = document.getElementById('memory-input');
    const createStoryButton = document.getElementById('create-story-button');
    const endTitle = document.getElementById('end-title');
    const endDescription = document.getElementById('end-description');
    const endImageContainer = document.getElementById('end-image-container');

    // ========================================================
    // --- 「記憶寶物架」小遊戲 React 程式碼 ---
    // ========================================================
    const e = React.createElement;
    const nostalgicItems = [ { name: "Game Boy", img: "assets/gameboy.jpeg", value: 2800, category: "electronics" }, { name: "B.B. Call 傳呼機", img: "assets/bb-call.webp", value: 1800, category: "electronics" }, { name: "Tamagotchi 電子雞", img: "assets/tamagotchi.jpeg", value: 700, category: "toy" }, { name: "王子麵", img: "assets/prince-noodles.png", value: 3, category: "snack" }, { name: "養樂多", img: "assets/yakult.jpg", value: 2, category: "snack" }, { name: "箭牌口香糖", img: "assets/doublemint.jpeg", value: 7, category: "snack" }, { name: "乖乖", img: "assets/guai-guai.png", value: 5, category: "snack" }, { name: "森永牛奶糖", img: "assets/morinaga-caramel.png", value: 5, category: "snack" }, { name: "黑松沙士", img: "assets/sarsaparilla.png", value: 7, category: "snack" } ];
    const puzzleData = { id: 'puz01', name: '今天吃什麼呢？', image: 'assets/puzzle-image-01.png' };
    const levelConfig = [ { level: 1, items: 3, memoryTime: 6000, mode: "FIND_DIFF" }, { level: 2, items: 3, memoryTime: 5000, mode: "FIND_DIFF" }, { level: 3, items: 3, memoryTime: 5000, mode: "ESTIMATE_PRICE" }, { level: 4, items: 4, memoryTime: 5000, mode: "FIND_DIFF" }, { level: 5, items: 4, memoryTime: 4000, mode: "ESTIMATE_PRICE" }, { level: 6, items: 4, memoryTime: 4000, mode: "FIND_DIFF" }, { level: 7, items: 5, memoryTime: 4000, mode: "FIND_DIFF" }, { level: 8, items: 5, memoryTime: 3500, mode: "ESTIMATE_PRICE" }, { level: 9, items: 5, memoryTime: 3500, mode: "FIND_DIFF" }, ];
    function getRandomItems(n, category) { let sourceItems = nostalgicItems; if (category) { sourceItems = nostalgicItems.filter(item => item.category === category); } const arr = sourceItems.slice(); const items = []; while (items.length < n && arr.length > 0) { const idx = Math.floor(Math.random() * arr.length); items.push(arr.splice(idx, 1)[0]); } return items; }
    function getShuffledItems(items) { const arr = items.slice(); const idx = Math.floor(Math.random() * arr.length); let newItem; do { newItem = nostalgicItems[Math.floor(Math.random() * nostalgicItems.length)]; } while (arr.find((x) => x.name === newItem.name)); arr[idx] = newItem; return { changedItems: arr, changedIdx: idx }; }
    function getModePrompt(mode, items) { if (mode === "FIND_DIFF") { const { changedItems, changedIdx } = getShuffledItems(items); const prompt = "咦？是不是有東西掉了？"; return { prompt, answer: changedIdx, changedItems }; } else if (mode === "ESTIMATE_PRICE") { const idx = Math.floor(Math.random() * items.length); const item = items[idx]; const correct = item.value; let choices = [ item.value, item.value + 500, Math.max(item.value - 500, 1), item.value + 1000 ].sort(() => Math.random() - 0.5); const answer = choices.indexOf(correct); const prompt = `猜猜看，${item.name}老闆，這個多少錢？`; return { prompt, answer, choices: choices.map((v) => `${v} 元`), item, itemIndex: idx }; } }
    const sfxElements = { coin: () => document.getElementById("sfx-coin"), wrong: () => document.getElementById("sfx-wrong"), vhs: () => document.getElementById("sfx-vhs"), };
    function playSfx(name) { const el = sfxElements[name](); if (el) { el.currentTime = 0; el.play().catch(()=>{}); } }
    function generatePoster(puzzle) { const canvas = document.createElement('canvas'); canvas.width = 600; canvas.height = 800; const ctx = canvas.getContext('2d'); ctx.fillStyle = '#1A202C'; ctx.fillRect(0, 0, 600, 800); const img = new Image(); img.crossOrigin = 'Anonymous'; img.src = puzzle.image; img.onload = () => { ctx.drawImage(img, 50, 150, 500, 500); ctx.fillStyle = '#F7FAFC'; ctx.font = 'bold 48px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('記憶解鎖！', 300, 80); ctx.font = '24px sans-serif'; ctx.fillText(`我成功拼湊了「${puzzle.name}」`, 300, 700); const link = document.createElement('a'); link.download = `我的懷舊記憶-${puzzle.id}.png`; link.href = canvas.toDataURL('image/png'); link.click(); }; img.onerror = () => { alert('海報圖片載入失敗'); }; }
    function MemoryPuzzleApp(props) {
        const { onComplete, puzzleId, category } = props;
        const [gameStatus, setGameStatus] = React.useState("TITLE");
        const [currentLevel, setCurrentLevel] = React.useState(1);
        const [unlockedPieces, setUnlockedPieces] = React.useState(Array(9).fill(false));
        const [feedback, setFeedback] = React.useState("");
        const [phase, setPhase] = React.useState('IDLE');
        const [shelfItems, setShelfItems] = React.useState([]);
        const [hiddenShelfItems, setHiddenShelfItems] = React.useState([]);
        const [answer, setAnswer] = React.useState(null);
        const [mode, setMode] = React.useState("FIND_DIFF");
        const [prompt, setPrompt] = React.useState("");
        const [questionData, setQuestionData] = React.useState(null);
        const startLevel = (levelNum) => { const config = levelConfig[levelNum - 1]; if (!config) { setGameStatus("PUZZLE_COMPLETE"); return; } setPhase("MEMORY"); setMode(config.mode); const items = getRandomItems(config.items, category); setShelfItems(items); const timer = setTimeout(() => { setPhase('QUESTION'); playSfx('vhs'); const qData = getModePrompt(config.mode, items); setPrompt(qData.prompt); setAnswer(qData.answer); setQuestionData(qData); if (config.mode === "FIND_DIFF") setHiddenShelfItems(qData.changedItems); }, config.memoryTime); return () => clearTimeout(timer); };
        const handleAnswer = (isCorrect) => { if (phase !== 'QUESTION') return; setPhase('IDLE'); if (isCorrect) { playSfx('coin'); setFeedback(`拼圖碎片 ${currentLevel} 解鎖！`); const newUnlocked = [...unlockedPieces]; newUnlocked[currentLevel - 1] = true; setUnlockedPieces(newUnlocked); setTimeout(() => { setFeedback(""); setCurrentLevel(prev => prev + 1); }, 1200); } else { playSfx('wrong'); setFeedback("答錯了！再專心一點！"); setTimeout(() => { setFeedback(""); startLevel(currentLevel); }, 1200); } };
        React.useEffect(() => { if (currentLevel > levelConfig.length) { setGameStatus("PUZZLE_COMPLETE"); } else if (gameStatus === 'PLAYING') { startLevel(currentLevel); } }, [currentLevel, gameStatus]);
        const resetGame = () => { setCurrentLevel(1); setUnlockedPieces(Array(9).fill(false)); setFeedback(''); setGameStatus('PLAYING'); };
        const renderPuzzle = () => { const pieces = []; for (let i = 0; i < 9; i++) { pieces.push(e('div', { key: i, className: `puzzle-piece ${unlockedPieces[i] ? 'unlocked' : ''}`, style: { backgroundImage: `url(${puzzleData.image})`, backgroundPosition: `${(i % 3) * 50}% ${(Math.floor(i / 3)) * 50}%` } })); } return e('div', {className: 'puzzle-container'}, e('p', {style: {color: '#fff', fontSize: '1.1em'}}, puzzleData.name), e('div', {className: 'puzzle-grid'}, pieces)); };
        const renderGameScreen = () => { if (phase === 'IDLE') return e('div', {className: 'feedback'}, feedback); const isMemoryPhase = phase === 'MEMORY'; return e(React.Fragment, null, e("div", { style: { color: isMemoryPhase ? "#E383B9" : "#6EDCFF", minHeight: '40px' } }, isMemoryPhase ? "記住貨架上的寶物吧！" : prompt), isMemoryPhase ? e("div", { className: "shelf" }, shelfItems.map((item, i) => e("div", { key: i, className: "shelf-slot" }, item && e("img", { src: item.img, alt: item.name, className: "item-realistic" })))) : (mode === "FIND_DIFF" ? e("div", { className: "shelf" }, hiddenShelfItems.map((item, i) => e("div", { key: i, className: "shelf-slot", style:{cursor:'pointer'}, onClick: () => handleAnswer(i === answer) }, item && e("img", { src: item.img, alt: item.name, className: "item-realistic" })))) : e("div", {style: {textAlign: 'center'}}, questionData.choices.map((c, i) => e("button", { key: i, className: "price-btn", onClick: () => handleAnswer(i === answer) }, c)))), isMemoryPhase && e("div", { className: "timer-bar-container" }, e("div", { className: "timer-bar", style: { animationDuration: `${levelConfig[currentLevel-1].memoryTime}ms` } }))); };
        const renderContent = () => {
            switch (gameStatus) {
                case 'TITLE': return e("div", { className: "title-screen" }, e("h1", null, "柑仔店有什麼？"), e("p", null, "九宮格拼圖挑戰"), e("button", { onClick: resetGame }, "開始遊戲"));
                case 'PLAYING': return e('div', { className: "memory-game-layout" }, renderPuzzle(), renderGameScreen());
                case 'PUZZLE_COMPLETE': return e("div", { className: 'game-over-screen' }, e("h2", null, "恭喜通關！"), e('div', { className: 'puzzle-container' }, e('p', { style: { color: '#fff', fontSize: '1.1em' } }, puzzleData.name), e('div', { className: 'puzzle-grid complete', style: { backgroundImage: `url(${puzzleData.image})` } })), e("p", null, `您成功拼湊了「${puzzleData.name}」的完整記憶！`), e("button", { onClick: () => generatePoster(puzzleData) }, "生成分享海報"), e("button", { onClick: onComplete }, "完成拼圖"));
                default: return e("div", null, "載入中...");
            }
        };
        return e("div", { className: "main-frame" }, renderContent());
    }
    
    // --- 遊戲資料與狀態 ---
    const MAP_HEIGHT = 2800;
    let playerPath = [];
    const mapData = {
        'start': { type: 'choice', pos: { x: 50, y: 92 }, text: '放學了...', choices: [ { text: '走，先去柑仔店', target: 'gamadim' } ] },
        'gamadim': { type: 'choice', pos: { x: 60, y: 50 }, text: '在柑仔店門口', choices: [ { text: '進去看看有什麼好吃的', target: 'gamadim_puzzle' } ] },
        'gamadim_puzzle': { type: "minigame-memory-puzzle", pos: { x: 28, y: 78 }, next: 'choice_activities', categoryFilter: "snack" },
        'choice_activities': { type: 'choice', pos: { x: 50, y: 60 }, text: '要去哪裡呢？', choices: [ { text: '去看漫畫', target: 'bookstore' }, { text: '去「電動間」打遊戲', target: 'arcade' }, { text: '今天廟口有熱鬧', target: 'yataixi' } ] },
        'bookstore': { type: 'minigame-manga-match', pos: { x: 25, y: 45 }, text: '哇！幽遊白書有新的了', gameUrl: 'manga-match.html', next: 'random_end_router'},
        'arcade': { type: 'minigame-arcade', pos: { x: 75, y: 45 }, text: '走，打電動去', gameUrl: 'neon-strike.html', next: 'random_end_router'},
        'yataixi': { type: 'event', pos: { x: 50, y: 30 }, text: '史艷文真厲害...', next: 'random_end_router'},
        'random_end_router': {
            type: 'conditional_random',
            pos: { x: 50, y: 20 },
            possible_ends: [ 'end_home_normal', 'end_home_late', 'end_home_alone' ]
        },
        'end_home_normal': { type: 'end', id: 'end_home_normal', pos: { x: 50, y: 10 }, title: '我回來了！', description: '回到家，家人早已準備好熱騰騰的飯菜，平凡的日常最是溫暖。', img: 'assets/end_home_normal.jpeg' },
        'end_home_late': { type: 'end', id: 'end_home_late', pos: { x: 75, y: 15 }, title: '媽媽：「又跑到哪裡瘋啦！」', description: '「這麼晚才回來！」雖然被媽媽念了一頓，但聞到熟悉的飯菜香，心還是暖的。', img: 'assets/end_home_late.jpeg' },
        'end_home_alone': { type: 'end', id: 'end_home_alone', pos: { x: 25, y: 15 }, title: '爸媽還是沒回來...', description: '回到家，才想起爸媽今晚有事不回來。打開燈，空無一人的客廳更顯寂靜...', img: 'assets/end_home_alone.png' }
    };

    // --- 核心遊戲函式 ---
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    function handleIframeGame(nodeData, completionMessage) {
        return new Promise(resolve => {
            const minigameContainer = document.getElementById('minigame-container');
            const iframe = document.createElement('iframe');
            iframe.src = nodeData.gameUrl;
            iframe.style.width = '100%'; iframe.style.height = '100%'; iframe.style.border = 'none';
            minigameContainer.innerHTML = '';
            minigameContainer.appendChild(iframe);
            gameArea.classList.add('hidden');
            minigameContainer.classList.remove('hidden');
            const messageHandler = function(event) {
                if (event.source !== iframe.contentWindow) return;
                if (event.data === completionMessage) {
                    window.removeEventListener('message', messageHandler);
                    minigameContainer.classList.add('hidden');
                    gameArea.classList.remove('hidden');
                    resolve();
                }
            };
            window.addEventListener('message', messageHandler);
        });
    }

    function handleMemoryPuzzle(nodeData) {
        return new Promise(resolve => {
            const minigameContainer = document.getElementById('minigame-container');
            const minigameRoot = document.getElementById('minigame-root');
            const root = ReactDOM.createRoot(minigameRoot);
            const props = {
                category: nodeData.categoryFilter,
                puzzleId: puzzleData.id, 
                onComplete: () => {
                    root.unmount(); 
                    minigameContainer.classList.add('hidden');
                    gameArea.classList.remove('hidden');
                    resolve();
                }
            };
            gameArea.classList.add('hidden');
            minigameContainer.classList.remove('hidden');
            root.render(e(MemoryPuzzleApp, props));
        });
    }

    function moveToNode(nodeId) {
        return new Promise(resolve => {
            const nodeData = mapData[nodeId];
            if (!nodeData || !nodeData.pos) { 
                console.error("Node not found or has no position:", nodeId); 
                return resolve();
            }
            const targetY = (nodeData.pos.y / 100 * MAP_HEIGHT);
            const anchorRatio = nodeData.anchorY || 0.85;
            const scrollAmount = targetY - (window.innerHeight * anchorRatio);
            
            const safetyTimeout = setTimeout(() => {
                console.log(`Safety timeout triggered for node: ${nodeId}`);
                scrollMap.removeEventListener('transitionend', onTransitionEnd);
                resolve();
            }, 3100);

            const onTransitionEnd = () => { 
                clearTimeout(safetyTimeout);
                scrollMap.removeEventListener('transitionend', onTransitionEnd); 
                resolve(); 
            };

            scrollMap.addEventListener('transitionend', onTransitionEnd, { once: true });
            scrollMap.style.transition = 'transform 3s ease-in-out';
            scrollMap.style.transform = `translateY(-${scrollAmount}px)`;
        });
    }

    function showChoice(nodeData, currentNodeId) {
        choiceText.textContent = nodeData.text;
        choiceButtons.innerHTML = ''; 
        choiceOverlay.classList.remove('hidden');
        const activeNodes = []; 

        function cleanupChoiceListeners() {
            activeNodes.forEach(({ element, handler }) => {
                element.classList.remove('choice-active');
                element.removeEventListener('click', handler);
            });
            choiceOverlay.classList.add('hidden');
        }

        if (nodeData.choices.length > 1) {
            nodeData.choices.forEach(choice => {
                const targetNodeId = choice.target;
                const targetNodeElement = document.querySelector(`.node[data-node-id="${targetNodeId}"]`);
                if (targetNodeElement) {
                    targetNodeElement.classList.add('choice-active'); 
                    const choiceHandler = () => {
                        cleanupChoiceListeners();
                        playerPath.push(targetNodeId);
                        runGameLogic(targetNodeId);
                    };
                    targetNodeElement.addEventListener('click', choiceHandler, { once: true });
                    activeNodes.push({ element: targetNodeElement, handler: choiceHandler });
                } else {
                    console.error(`錯誤：在 'showChoice' 中找不到目標節點 DOM 元素，ID: ${targetNodeId}`);
                }
            });
        } else if (nodeData.choices.length === 1) {
            const currentNodeElement = document.querySelector(`.node[data-node-id="${currentNodeId}"]`);
            if (currentNodeElement) {
                currentNodeElement.classList.add('choice-active');
                const targetNodeId = nodeData.choices[0].target;
                const choiceHandler = () => {
                    cleanupChoiceListeners();
                    playerPath.push(targetNodeId);
                    runGameLogic(targetNodeId);
                };
                currentNodeElement.addEventListener('click', choiceHandler, { once: true });
                activeNodes.push({ element: currentNodeElement, handler: choiceHandler });
            }
        }
    }

    async function runGameLogic(nodeId) {
        const nodeData = mapData[nodeId];
        if (!nodeData) { console.error(`執行節點錯誤: 找不到 ID 為 "${nodeId}" 的節點。`); return; }
        
        if (nodeData.pos) {
            await moveToNode(nodeId);
        }

        switch (nodeData.type) {
            case 'event': 
                await delay(2000); 
                playerPath.push(nodeData.next); 
                runGameLogic(nodeData.next); 
                break;
            case 'choice': 
                showChoice(nodeData, nodeId); 
                break;
            case 'conditional_random':
                const possibleEnds = nodeData.possible_ends;
                const randomIndex = Math.floor(Math.random() * possibleEnds.length);
                const nextNodeId = possibleEnds[randomIndex];
                runGameLogic(nextNodeId);
                break;
            case 'minigame-memory-puzzle': 
                await handleMemoryPuzzle(nodeData); 
                await delay(50);
                playerPath.push(nodeData.next);
                runGameLogic(nodeData.next); 
                break;
            case 'minigame-arcade':
                await handleIframeGame(nodeData, 'arcade-game-complete');
                await delay(50);
                playerPath.push(nodeData.next);
                runGameLogic(nodeData.next);
                break;
            case 'minigame-manga-match':
                await handleIframeGame(nodeData, 'manga-match-complete');
                await delay(50);
                playerPath.push(nodeData.next);
                runGameLogic(nodeData.next);
                break;
            case 'end': 
                await delay(1500); 
                showEndScreen(nodeData); 
                break;
        }
    }
    
    function showEndScreen(endNode) {
        endTitle.textContent = endNode.title;
        endDescription.textContent = endNode.description;
        endImageContainer.innerHTML = `<img src="${endNode.img}" alt="${endNode.title}">`;
        gameArea.classList.add('hidden');
        endScreen.classList.remove('hidden');
    }

    function initGame() {
        playerPath = [];
        scrollMap.innerHTML = '';
        gameArea.classList.remove('hidden');
        startScreen.classList.add('hidden');
        endScreen.classList.add('hidden');
        scrollMap.style.transition = 'none';
        scrollMap.style.transform = 'translateY(0px)';
        scrollMap.style.height = `${MAP_HEIGHT}px`;

        Object.keys(mapData).forEach(nodeId => {
            const nodeData = mapData[nodeId];
            if (nodeData.pos) {
                const nodeDiv = document.createElement('div');
                nodeDiv.className = 'node';
                nodeDiv.dataset.nodeId = nodeId; 
                nodeDiv.style.left = `${nodeData.pos.x}%`;
                nodeDiv.style.top = `${nodeData.pos.y}%`;
                
                if (nodeData.type !== 'end' && nodeData.type !== 'conditional_random') {
                    const nodeImg = document.createElement('img');
                    nodeImg.src = `assets/${nodeId}.png`; 
                    nodeImg.alt = nodeData.text || nodeId;
                    
                    const nodeText = document.createElement('p');
                    nodeText.textContent = nodeData.text || '';

                    nodeDiv.appendChild(nodeImg);
                    nodeDiv.appendChild(nodeText);
                }
                scrollMap.appendChild(nodeDiv);
            }
        });
        
        const homeIconDiv = document.createElement('div');
        homeIconDiv.className = 'node';
        homeIconDiv.style.left = '50%';
        homeIconDiv.style.top = '5%';
        const homeImg = document.createElement('img');
        homeImg.src = 'assets/home.png';
        homeImg.style.width = '100px';
        homeImg.style.height = '100px';
        homeIconDiv.appendChild(homeImg);
        
        const startNode = 'start';
        playerPath.push(startNode);
        setTimeout(() => runGameLogic(startNode), 100);
    }

    // --- 事件綁定 ---
    startButton.addEventListener('click', initGame);
    restartButton.addEventListener('click', () => { window.location.href = window.location.origin + window.location.pathname; });
    if (shareButton) { shareButton.onclick = async () => { const endNode = mapData[playerPath[playerPath.length - 1]]; const shareData = { title: '我在「指尖的時光路書」走出了這個结局！', text: `我的青春回憶是「${endNode.title}」，也來走走看你的吧！`, url: window.location.origin + window.location.pathname }; try { if (navigator.share) { await navigator.share(shareData); } else { alert('您的瀏覽器不支援直接分享，請手動複製網址分享給朋友！'); } } catch (err) { console.error('分享失敗:', err); } }; }
    if (createStoryButton) { createStoryButton.onclick = () => { const note = memoryInput.value.trim(); if (!note) { alert('請先寫下你的回憶註解！'); return; } const storyData = { path: playerPath, note: note }; const encodedStory = btoa(JSON.stringify(storyData)); const storyUrl = `${window.location.origin}${window.location.pathname}?story=${encodedStory}`; navigator.clipboard.writeText(storyUrl).then(() => { alert('您的專屬故事連結已複製！快分享給您的孩子或朋友吧！'); }).catch(err => { alert('複製失敗，請手動複製以下連結：\n' + storyUrl); }); }; }

});