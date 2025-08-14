// 等待網頁所有元素載入完成後再執行
document.addEventListener('DOMContentLoaded', () => {

    // --- 獲取所有需要的畫面元素 ---
    const startScreen = document.getElementById('start-screen');
    const gameArea = document.getElementById('game-area');
    const endScreen = document.getElementById('end-screen');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const scrollMap = document.getElementById('scroll-map');
    const choiceOverlay = document.getElementById('choice-overlay');
    const choiceText = document.getElementById('choice-text');
    const choiceButtons = document.getElementById('choice-buttons');
    // ... 其他元素獲取 ...

    // ========================================================
    // --- 【第1步】 複製「記憶寶物架」的 React 程式碼至此 ---
    // ========================================================
    const e = React.createElement;
    const nostalgicItems = [ { name: "Game Boy", img: "assets/gameboy.jpeg", value: 2800 }, { name: "B.B. Call 傳呼機", img: "assets/bb-call.webp", value: 1800 }, { name: "3.5吋磁碟片", img: "assets/floppydisk.jpeg", value: 15 }, { name: "Tamagotchi 電子雞", img: "assets/tamagotchi.jpeg", value: 700 }, { name: "王子麵", img: "assets/prince-noodles.png", value: 3 }, { name: "養樂多", img: "assets/yakult.jpg", value: 2 }, ];
    const puzzleData = { id: 'puz01', name: '我的 Game Boy', image: 'assets/puzzle-image-01.png' };
    const levelConfig = [ { level: 1, items: 3, memoryTime: 6000, mode: "FIND_DIFF" }, { level: 2, items: 3, memoryTime: 5000, mode: "FIND_DIFF" }, { level: 3, items: 3, memoryTime: 5000, mode: "ESTIMATE_PRICE" }, { level: 4, items: 4, memoryTime: 5000, mode: "FIND_DIFF" }, { level: 5, items: 4, memoryTime: 4000, mode: "ESTIMATE_PRICE" }, { level: 6, items: 4, memoryTime: 4000, mode: "FIND_DIFF" }, { level: 7, items: 5, memoryTime: 4000, mode: "FIND_DIFF" }, { level: 8, items: 5, memoryTime: 3500, mode: "ESTIMATE_PRICE" }, { level: 9, items: 5, memoryTime: 3500, mode: "FIND_DIFF" }, ];
    function getRandomItems(n) { const arr = nostalgicItems.slice(); const items = []; while (items.length < n && arr.length > 0) { const idx = Math.floor(Math.random() * arr.length); items.push(arr.splice(idx, 1)[0]); } return items; }
    function getShuffledItems(items) { const arr = items.slice(); const idx = Math.floor(Math.random() * arr.length); let newItem; do { newItem = nostalgicItems[Math.floor(Math.random() * nostalgicItems.length)]; } while (arr.find((x) => x.name === newItem.name)); arr[idx] = newItem; return { changedItems: arr, changedIdx: idx }; }
    function getModePrompt(mode, items) { if (mode === "FIND_DIFF") { const { changedItems, changedIdx } = getShuffledItems(items); const prompt = "咦？是不是有東西被換掉了？"; return { prompt, answer: changedIdx, changedItems }; } else if (mode === "ESTIMATE_PRICE") { const idx = Math.floor(Math.random() * items.length); const item = items[idx]; const correct = item.value; let choices = [ item.value, item.value + 500, Math.max(item.value - 500, 1), item.value + 1000 ].sort(() => Math.random() - 0.5); const answer = choices.indexOf(correct); const prompt = `猜猜看，${item.name}在當年大概多少錢？`; return { prompt, answer, choices: choices.map((v) => `${v} 元`), item, itemIndex: idx }; } }
    const sfxElements = { coin: () => document.getElementById("sfx-coin"), wrong: () => document.getElementById("sfx-wrong"), vhs: () => document.getElementById("sfx-vhs"), };
    function playSfx(name) { const el = sfxElements[name](); if (el) { el.currentTime = 0; el.play().catch(()=>{}); } }
    function generatePoster(puzzle) { /* ... 此函式內容不變 ... */ }
    
    function MemoryPuzzleApp(props) {
        const { onComplete, puzzleId } = props;
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

        const startLevel = (levelNum) => {
            const config = levelConfig[levelNum - 1];
            if (!config) { setGameStatus("PUZZLE_COMPLETE"); return; }
            setPhase("MEMORY");
            setMode(config.mode);
            const items = getRandomItems(config.items);
            setShelfItems(items);
            const timer = setTimeout(() => {
                setPhase('QUESTION');
                playSfx('vhs');
                const qData = getModePrompt(config.mode, items);
                setPrompt(qData.prompt);
                setAnswer(qData.answer);
                setQuestionData(qData);
                if (config.mode === "FIND_DIFF") setHiddenShelfItems(qData.changedItems);
            }, config.memoryTime);
            return () => clearTimeout(timer);
        };
        const handleAnswer = (isCorrect) => {
            if (phase !== 'QUESTION') return;
            setPhase('IDLE');
            if (isCorrect) {
                playSfx('coin');
                setFeedback(`拼圖碎片 ${currentLevel} 解鎖！`);
                const newUnlocked = [...unlockedPieces];
                newUnlocked[currentLevel - 1] = true;
                setUnlockedPieces(newUnlocked);
                setTimeout(() => { setFeedback(""); setCurrentLevel(prev => prev + 1); }, 1200);
            } else {
                playSfx('wrong');
                setFeedback("答錯了！再專心一點！");
                setTimeout(() => { setFeedback(""); startLevel(currentLevel); }, 1200);
            }
        };
        React.useEffect(() => {
            if (currentLevel > levelConfig.length) {
                setGameStatus("PUZZLE_COMPLETE");
            } else if (gameStatus === 'PLAYING') {
                startLevel(currentLevel);
            }
        }, [currentLevel, gameStatus]);

        const resetGame = () => { setCurrentLevel(1); setUnlockedPieces(Array(9).fill(false)); setFeedback(''); setGameStatus('PLAYING'); };
        
        // 修改：讓返回主選單的按鈕呼叫 onComplete 回呼函式
        const returnToTitle = () => { if (onComplete) onComplete(); };
        
        const renderPuzzle = () => { /* ... 此函式內容不變 ... */ };
        const renderGameScreen = () => { /* ... 此函式內容不變 ... */ };

        const renderContent = () => {
            switch (gameStatus) {
                case 'TITLE': return e("div", { className: "title-screen" }, e("h1", null, "我的時光寶物架"), e("p", null, "九宮格拼圖挑戰"), e("button", { onClick: resetGame }, "開始遊戲"));
                case 'PLAYING': return e('div', null, renderPuzzle(), renderGameScreen());
                case 'PUZZLE_COMPLETE': return e("div", { className: 'game-over-screen' }, e("h2", null, "恭喜通關！"), renderPuzzle(), e("p", null, `您成功拼湊了「${puzzleData.name}」的完整記憶！`), e("button", { onClick: () => generatePoster(puzzleData) }, "生成分享海報"), e("button", { onClick: returnToTitle }, "完成拼圖"));
                default: return e("div", null, "載入中...");
            }
        };
        return e("div", { className: "main-frame" }, renderContent());
    }


    // --- 遊戲地圖資料 ---
    const mapData = {
        'start':     { type: 'event',  pos: { x: 50, y: 92 }, text: '放學後，走出校門',     next: 'choice1' },
        'choice1':   { type: 'choice', pos: { x: 50, y: 78 }, text: '要去哪裡呢？', choices: [ { text: '去左邊的「柑仔店」', target: 'gamadim' }, { text: '去右邊的「電動間」', target: 'arcade' } ] },
        'gamadim':   { type: 'event',  pos: { x: 30, y: 65 }, text: '在柑仔店買了零食',   next: 'gamadim_puzzle'  },
        "gamadim_puzzle": { "type": "minigame-memory-puzzle", "pos": { "x": 30, "y": 60 }, "puzzleId": "puz01", "next": "choice2" },
        'arcade':    { type: 'event',  pos: { x: 70, y: 55 }, text: '在電動間打遊戲',    next: 'choice2' },
        'choice2':   { type: 'choice', pos: { x: 50, y: 45 }, text: '天色晚了，回家吧...', choices: [ { text: '走大路回家', target: 'mainroad' }, { text: '跟朋友在大樹下道別', target: 'tree' } ] },
        'mainroad':  { type: 'event',  pos: { x: 65, y: 25 }, text: '走大路回家',       next: 'end_home' },
        'tree':      { type: 'event',  pos: { x: 70, y: 35 }, text: '在大樹下玩耍道別',     next: 'end_friends' },
        'end_home':    { type: 'end', pos: { x: 60, y: 10 }, title: '溫暖的晚餐', description: '雖然平凡，但家裡的飯菜香和等待的燈光，就是一天中最安穩的時刻。這是最簡單的幸福。', img: 'https://i.imgur.com/FqA8sXv.jpg' },
        'end_friends': { type: 'end', pos: { x: 75, y: 15 }, title: '難忘的友誼', description: '青春最棒的，就是有個能陪你一起在路燈下聊天的朋友。那些無聊又閃亮的夜晚，構成了我們的少年時代。', img: 'https://i.imgur.com/gW3L3Yg.jpg' }
    };

    const MAP_HEIGHT = 2800;
    let playerPath = [];

    // --- 全新核心邏輯 (基於 async/await) ---
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    function moveToNode(nodeId) { /* ... 此函式內容不變 ... */ }
    function showChoice(nodeData) { /* ... 此函式內容不變 ... */ }
    
    // ==========================================================
    // --- 【第2步】 創建小遊戲處理函式 ---
    // ==========================================================
    function handleMemoryPuzzle(nodeData) {
        return new Promise(resolve => {
            const minigameContainer = document.getElementById('minigame-container');
            const minigameRoot = document.getElementById('minigame-root');

            const props = {
                puzzleId: nodeData.puzzleId,
                onComplete: () => {
                    ReactDOM.createRoot(minigameRoot).unmount();
                    minigameContainer.classList.add('hidden');
                    gameArea.classList.remove('hidden');
                    resolve();
                }
            };

            gameArea.classList.add('hidden');
            minigameContainer.classList.remove('hidden');

            const root = ReactDOM.createRoot(minigameRoot);
            root.render(e(MemoryPuzzleApp, props));
        });
    }

    async function runGameLogic(nodeId) {
        const nodeData = mapData[nodeId];
        if (!nodeData) return;
        await moveToNode(nodeId);

        // ==========================================================
        // --- 【第3步】 在 switch 中加入新的 case ---
        // ==========================================================
        switch (nodeData.type) {
            case 'event':
                await delay(2000);
                playerPath.push(nodeData.next);
                runGameLogic(nodeData.next);
                break;
            case 'choice':
                showChoice(nodeData);
                break;
            case 'minigame-memory-puzzle': // <-- 新增的 case
                await handleMemoryPuzzle(nodeData);
                runGameLogic(nodeData.next);
                break;
            case 'end':
                showEndScreen(nodeData);
                break;
        }
    }

    function initGame() { /* ... 此函式內容不變 ... */ }
    startButton.addEventListener('click', initGame);
    restartButton.addEventListener('click', () => { window.location.href = window.location.origin + window.location.pathname; });
    function showEndScreen(endNode, customNote = null) { /* ... 此函式內容不變 ... */ }

    // --- 分享功能 ---
    shareButton.onclick = async () => { /* ... */ };
    createStoryButton.onclick = () => { /* ... */ };
});