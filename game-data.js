// ========================================================
// --- 遊戲資料：所有可變動的遊戲內容都存放在此 ---
// ========================================================

// --- 「柑仔店」小遊戲的物品資料 ---
var nostalgicItems = [
    { name: "Game Boy", img: "assets/gameboy.jpeg", value: 2800, category: "electronics" },
    { name: "B.B. Call 傳呼機", img: "assets/bb-call.webp", value: 1800, category: "electronics" },
    { name: "Tamagotchi 電子雞", img: "assets/tamagotchi.jpeg", value: 700, category: "toy" },
    { name: "王子麵", img: "assets/prince-noodles.png", value: 3, category: "snack" },
    { name: "養樂多", img: "assets/yakult.jpg", value: 2, category: "snack" },
    { name: "箭牌口香糖", img: "assets/doublemint.jpeg", value: 7, category: "snack" },
    { name: "乖乖", img: "assets/guai-guai.png", value: 5, category: "snack" },
    { name: "森永牛奶糖", img: "assets/morinaga-caramel.png", value: 5, category: "snack" },
    { name: "黑松沙士", img: "assets/sarsaparilla.png", value: 7, category: "snack" }
];

// --- 「柑仔店」小遊戲的拼圖設定 ---
var puzzleData = {
    id: 'puz01',
    name: '今天吃什麼呢？',
    image: 'assets/puzzle-image-01.png'
};

// --- 「柑仔店」小遊戲的關卡設定 ---
var levelConfig = [
    { level: 1, items: 3, memoryTime: 6000, mode: "FIND_DIFF" }, { level: 2, items: 3, memoryTime: 5000, mode: "FIND_DIFF" },
    { level: 3, items: 3, memoryTime: 5000, mode: "ESTIMATE_PRICE" }, { level: 4, items: 4, memoryTime: 5000, mode: "FIND_DIFF" },
    { level: 5, items: 4, memoryTime: 4000, mode: "ESTIMATE_PRICE" }, { level: 6, items: 4, memoryTime: 4000, mode: "FIND_DIFF" },
    { level: 7, items: 5, memoryTime: 4000, mode: "FIND_DIFF" }, { level: 8, items: 5, memoryTime: 3500, mode: "ESTIMATE_PRICE" },
    { level: 9, items: 5, memoryTime: 3500, mode: "FIND_DIFF" },
];

// --- 第一章地圖資料 ---
var mapDataCh1 = {
    'start': { type: 'choice', pos: { x: 50, y: 92 }, text: '放學了...', choices: [ { text: '走，先去柑仔店', target: 'gamadim' } ] },
    'gamadim': { type: 'choice', pos: { x: 60, y: 50 }, text: '在柑仔店門口', choices: [ { text: '進去看看有什麼好吃的', target: 'gamadim_puzzle' } ] },
    'gamadim_puzzle': { type: "minigame-memory-puzzle", pos: { x: 28, y: 78 }, next: 'choice_activities', categoryFilter: "snack" },
    'choice_activities': { type: 'choice', pos: { x: 50, y: 60 }, text: '要去哪裡呢？', choices: [ { text: '去看漫畫', target: 'bookstore' }, { text: '去「電動間」打遊戲', target: 'arcade' }, { text: '今天廟口有熱鬧', target: 'yataixi' } ] },
    'bookstore': { type: 'minigame-manga-match', pos: { x: 25, y: 45 }, text: '哇！幽遊白書有新的了', gameUrl: 'manga-match.html', next: 'random_end_router'},
    'arcade': { type: 'minigame-arcade', pos: { x: 75, y: 45 }, text: '走，打電動去', gameUrl: 'neon-strike.html', next: 'random_end_router'},
    'yataixi': { type: 'event', pos: { x: 50, y: 30 }, text: '史艷文真厲害...', next: 'random_end_router'},
    'random_end_router': { type: 'conditional_random', pos: { x: 50, y: 20 }, possible_ends: [ 'end_home_normal', 'end_home_late', 'end_home_alone' ] },
    'end_home_normal': { type: 'end', id: 'end_home_normal', pos: { x: 50, y: 10 }, title: '我回來了！', description: '回到家，家人早已準備好熱騰騰的飯菜...', img: 'assets/end_home_normal.jpeg', nextChapter: true },
    'end_home_late': { type: 'end', id: 'end_home_late', pos: { x: 75, y: 15 }, title: '媽媽：「又跑到哪裡瘋啦！」', description: '「這麼晚才回來！」雖然被媽媽念了一頓...', img: 'assets/end_home_late.jpeg', nextChapter: true },
    'end_home_alone': { type: 'end', id: 'end_home_alone', pos: { x: 25, y: 15 }, title: '爸媽還是沒回來...', description: '回到家，才想起爸媽今晚有事不回來...', img: 'assets/end_home_alone.png', nextChapter: true }
};

// --- 第二章地圖資料 ---
var mapDataCh2 = {
    'ch2_start': { type: 'choice', pos: { x: 50, y: 92 }, text: '我回來了...', choices: [{ text: '回家功課一大堆', target: 'ch2_homework_math' }] },
    'ch2_homework_math': { type: 'minigame-math', pos: { x: 65, y: 80 }, text: '先算數學吧！', gameUrl: 'homework-game.html', next: 'ch2_homework_chinese' },
    'ch2_homework_chinese': { type: 'minigame-chinese-pinyin', pos: { x: 35, y: 70 }, text: '再來是國語作業', gameUrl: 'chinese-game.html', next: 'ch2_choice_after_homework' },
    'ch2_choice_after_homework': { type: 'choice', pos: { x: 50, y: 60 }, text: '作業寫完了！要做什麼呢？', choices: [ { text: '看電視', target: 'ch2_watch_tv' }, { text: '整理房間', target: 'ch2_tidy_room' }, { text: '幫忙家庭代工', target: 'ch2_assembly' } ]},
    'ch2_watch_tv': { type: 'minigame-jigsaw', pos: { x: 50, y: 48 }, text: '來看電視！', gameUrl: 'jigsaw-game.html', next: 'ch2_random_mom_shout' },
    'ch2_random_mom_shout': { type: 'conditional_random', pos: { x: 50, y: 38 }, possible_ends: [ 'ch2_tidy_room', 'ch2_assembly' ] },
    'ch2_tidy_room': { type: 'minigame-room-tidy', pos: { x: 25, y: 25 }, text: '只好去整理房間了', gameUrl: 'room-tidy.html', next: 'ch2_end' },
    'ch2_assembly': { type: 'minigame-assembly', pos: { x: 75, y: 25 }, text: '來幫忙做點加工', gameUrl: 'assembly-game.html', next: 'ch2_end' },
    'ch2_end': { type: 'end', id: 'ch2_end', pos: { x: 50, y: 10 }, title: '太睏了', description: '明天去廟仔口搧尪仔標...', img: 'assets/ch2_end.png' }
};

// --- 注音遊戲資料 ---
var BopomofoGameData = {
    level1: { char: "貓", song: "assets/audio/bgm-level1.mp3", bpm: 120, notes: [ { symbol: "ㄇ", time: 1.0 }, { symbol: "ㄠ", time: 1.5 }, { symbol: "ˊ", time: 2.0 } ] },
    level2: { char: "狗", song: "assets/audio/bgm-level2.mp3", bpm: 130, notes: [ { symbol: "ㄍ", time: 1.0 }, { symbol: "ㄡ", time: 1.5 }, { symbol: "ˇ", time: 2.0 } ] },
};

// --- 記憶拼圖資料 ---
var JigsawPuzzleData = {
    'tv_show_01': { id: 'tv_show_03', title: '小甜甜', imageSrc: 'assets/puzzles/Candy-Candy.jpeg', gridSize: 3 },
    'tv_show_02': { id: 'tv_show_01', title: '海王子', imageSrc: 'assets/puzzles/Triton-of-the-Sea.jpeg', gridSize: 3 },
    'tv_show_03': { id: 'tv_show_02', title: '無敵鐵金剛', imageSrc: 'assets/puzzles/Mazinger-Z.jpeg', gridSize: 4 }
    'tv_show_04': { id: 'tv_show_03', title: '北海小英雄', imageSrc: 'assets/puzzles/Vicky-The-Viking.jpeg', gridSize: 3 },
    'tv_show_05': { id: 'tv_show_04', title: '科學小飛俠', imageSrc: 'assets/puzzles/Science-Ninja-Team-Gatchaman.jpeg', gridSize: 4 }
    'tv_show_06': { id: 'tv_show_03', title: '小天使', imageSrc: 'assets/puzzles/Arupusu-no-Shoojo-Haiji.jpeg', gridSize: 3 },
    'tv_show_07': { id: 'tv_show_01', title: '原子小金剛', imageSrc: 'assets/puzzles/Astro-Boy.jpeg', gridSize: 3 },
    'tv_show_08': { id: 'tv_show_02', title: '寶馬王子', imageSrc: 'assets/puzzles/ripon.jpg', gridSize: 4 }
    'tv_show_09': { id: 'tv_show_03', title: '萬里尋母', imageSrc: 'assets/puzzles/Haha-Wo-Tazunete-Sanzen-Ri.jpeg', gridSize: 3 },
    'tv_show_010': { id: 'tv_show_04', title: '小英的故事', imageSrc: 'assets/puzzles/Perinu-Monogatari.jpg', gridSize: 4 }
    // 未來可以繼續新增更多拼圖...
};