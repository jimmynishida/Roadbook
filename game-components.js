// ========================================================
// --- 遊戲內建元件：所有 React 小遊戲都存放在此 ---
// ========================================================

var e = React.createElement;

// --- 「柑仔店」小遊戲的輔助函式 ---
function getRandomItems(n, category) { let sourceItems = nostalgicItems; if (category) { sourceItems = nostalgicItems.filter(item => item.category === category); } const arr = sourceItems.slice(); const items = []; while (items.length < n && arr.length > 0) { const idx = Math.floor(Math.random() * arr.length); items.push(arr.splice(idx, 1)[0]); } return items; }
function getShuffledItems(items) { const arr = items.slice(); const idx = Math.floor(Math.random() * arr.length); let newItem; do { newItem = nostalgicItems[Math.floor(Math.random() * nostalgicItems.length)]; } while (arr.find((x) => x.name === newItem.name)); arr[idx] = newItem; return { changedItems: arr, changedIdx: idx }; }
function getModePrompt(mode, items) { if (mode === "FIND_DIFF") { const { changedItems, changedIdx } = getShuffledItems(items); const prompt = "咦？是不是有東西掉了？"; return { prompt, answer: changedIdx, changedItems }; } else if (mode === "ESTIMATE_PRICE") { const idx = Math.floor(Math.random() * items.length); const item = items[idx]; const correct = item.value; let choices = [ item.value, item.value + 500, Math.max(item.value - 500, 1), item.value + 1000 ].sort(() => Math.random() - 0.5); const answer = choices.indexOf(correct); const prompt = `猜猜看，${item.name}老闆，這個多少錢？`; return { prompt, answer, choices: choices.map((v) => `${v} 元`), item, itemIndex: idx }; } }
function generatePoster(puzzle) { const canvas = document.createElement('canvas'); canvas.width = 600; canvas.height = 800; const ctx = canvas.getContext('2d'); ctx.fillStyle = '#1A202C'; ctx.fillRect(0, 0, 600, 800); const img = new Image(); img.crossOrigin = 'Anonymous'; img.src = puzzle.image; img.onload = () => { ctx.drawImage(img, 50, 150, 500, 500); ctx.fillStyle = '#F7FAFC'; ctx.font = 'bold 48px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('記憶解鎖！', 300, 80); ctx.font = '24px sans-serif'; ctx.fillText(`我成功拼湊了「${puzzle.name}」`, 300, 700); const link = document.createElement('a'); link.download = `我的懷舊記憶-${puzzle.id}.png`; link.href = canvas.toDataURL('image/png'); link.click(); }; img.onerror = () => { alert('海報圖片載入失敗'); }; }

// --- 「柑仔店」小遊戲的 React 元件主體 ---
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

// --- 音效的通用函式 (因為 React 元件也需要) ---
const sfxElements = { coin: () => document.getElementById("sfx-coin"), wrong: () => document.getElementById("sfx-wrong"), vhs: () => document.getElementById("sfx-vhs"), };
function playSfx(name) { const el = sfxElements[name](); if (el) { el.currentTime = 0; el.play().catch(()=>{}); } }