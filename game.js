// 等待網頁所有元素載入完成後再執行
document.addEventListener('DOMContentLoaded', () => {

    // --- 獲取所有需要的畫面元素 (此處不變) ---
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
    const memoryNoteArea = document.getElementById('memory-note-area');

    // --- 遊戲地圖資料 (此處不變) ---
    const mapData = {
        'start':     { type: 'event',  pos: { x: 50, y: 92 }, text: '放學後，走出校門',     next: 'choice1' },
        'choice1':   { type: 'choice', pos: { x: 50, y: 78 }, text: '要去哪裡呢？',
            choices: [
                { text: '去左邊的「柑仔店」', target: 'gamadim' },
                { text: '去右邊的「電動間」', target: 'arcade' }
            ]
        },
        'gamadim':   { type: 'event',  pos: { x: 30, y: 65 }, text: '在柑仔店買了零食',   next: 'choice2' },
        'arcade':    { type: 'event',  pos: { x: 70, y: 55 }, text: '在電動間打遊戲',    next: 'choice2' },
        'choice2':   { type: 'choice', pos: { x: 50, y: 45 }, text: '天色晚了，回家吧...',
            choices: [
                { text: '走大路回家', target: 'mainroad' },
                { text: '跟朋友在大樹下道別', target: 'tree' }
            ]
        },
        'mainroad':  { type: 'event',  pos: { x: 65, y: 25 }, text: '走大路回家',       next: 'end_home' },
        'tree':      { type: 'event',  pos: { x: 70, y: 35 }, text: '在大樹下玩耍道別',     next: 'end_friends' },
        'end_home':    { type: 'end', pos: { x: 60, y: 10 }, title: '溫暖的晚餐', description: '雖然平凡，但家裡的飯菜香和等待的燈光，就是一天中最安穩的時刻。這是最簡單的幸福。', img: 'https://i.imgur.com/FqA8sXv.jpg' },
        'end_friends': { type: 'end', pos: { x: 75, y: 15 }, title: '難忘的友誼', description: '青春最棒的，就是有個能陪你一起在路燈下聊天的朋友。那些無聊又閃亮的夜晚，構成了我們的少年時代。', img: 'https://i.imgur.com/gW3L3Yg.jpg' }
    };

    const MAP_HEIGHT = 2800;
    let playerPath = [];

    // ==========================================================
    // --- 【全新核心邏輯】 ---
    // ==========================================================

    /**
     * 創建一個可等待的延遲函式
     * @param {number} ms - 等待的毫秒數
     * @returns {Promise<void>}
     */
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    /**
     * 捲動地圖到指定節點，並回傳一個Promise，在動畫結束後完成
     * @param {string} nodeId - 目標節點的ID
     * @returns {Promise<void>}
     */
    function moveToNode(nodeId) {
        return new Promise(resolve => {
            const nodeData = mapData[nodeId];
            const targetY = (nodeData.pos.y / 100 * MAP_HEIGHT);
            const scrollAmount = targetY - (window.innerHeight * 0.85);

            const onTransitionEnd = () => {
                scrollMap.removeEventListener('transitionend', onTransitionEnd);
                resolve();
            };
            scrollMap.addEventListener('transitionend', onTransitionEnd, { once: true });
            
            scrollMap.style.transition = 'transform 3s ease-in-out';
            scrollMap.style.transform = `translateY(-${scrollAmount}px)`;
        });
    }

    /**
     * 處理選擇介面的顯示與邏輯
     * @param {object} nodeData - 選擇節點的資料
     */
    function showChoice(nodeData) {
        choiceText.textContent = nodeData.text;
        choiceButtons.innerHTML = '';
        nodeData.choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choice.text;
            button.onclick = () => {
                choiceOverlay.classList.add('hidden');
                playerPath.push(choice.target);
                runGameLogic(choice.target); // 點擊後，繼續執行遊戲主流程
            };
            choiceButtons.appendChild(button);
        });
        choiceOverlay.classList.remove('hidden');
    }

    /**
     * 遊戲主流程控制器 (非同步函式)
     * @param {string} nodeId - 要處理的節點ID
     */
    async function runGameLogic(nodeId) {
        const nodeData = mapData[nodeId];
        if (!nodeData) return;

        // 步驟 1: 移動到節點位置，並「等待」動畫完成
        await moveToNode(nodeId);

        // 步驟 2: 根據節點類型，執行對應操作
        switch (nodeData.type) {
            case 'event':
                // 等待 2 秒，讓玩家觀看
                await delay(2000);
                // 繼續執行下一個節點
                playerPath.push(nodeData.next);
                runGameLogic(nodeData.next);
                break;
            
            case 'choice':
                // 顯示選擇介面，等待玩家點擊 (流程會在此暫停)
                showChoice(nodeData);
                break;

            case 'end':
                // 顯示結局畫面
                showEndScreen(nodeData);
                break;
        }
    }

    /**
     * 遊戲初始化
     */
    function initGame() {
        // 重置狀態
        playerPath = [];
        scrollMap.innerHTML = '';
        gameArea.classList.remove('hidden');
        startScreen.classList.add('hidden');
        endScreen.classList.add('hidden');
        
        // 準備地圖，但無動畫
        scrollMap.style.transition = 'none';
        scrollMap.style.transform = 'translateY(0px)';
        scrollMap.style.height = `${MAP_HEIGHT}px`;

        // 啟動遊戲主流程
        playerPath.push('start');
        setTimeout(() => runGameLogic('start'), 100); // 短暫延遲後啟動，確保畫面穩定
    }
    
    // --- 按鈕事件綁定 ---
    startButton.addEventListener('click', initGame);
    restartButton.addEventListener('click', () => {
        // 直接刷新頁面，最乾淨的重置方式
        window.location.href = window.location.origin + window.location.pathname;
    });

    // --- 分享相關功能 (保持不變) ---
    function showEndScreen(endNode, customNote = null) {
        document.getElementById('end-title').textContent = endNode.title;
        document.getElementById('end-description').textContent = customNote || endNode.description;
        document.getElementById('end-image-container').innerHTML = `<img src="${endNode.img}" alt="${endNode.title}">`;
        gameArea.classList.add('hidden');
        endScreen.classList.remove('hidden');
    }

    // 分享和生成故事連結的功能保持不變
    shareButton.addEventListener('click', async () => { /* ... */ });
    createStoryButton.addEventListener('click', () => { /* ... */ });
    
    // 為了程式碼的完整性，將不變的分享函式貼上
    shareButton.onclick = async () => {
        const endNode = mapData[playerPath[playerPath.length - 1]];
        const shareData = {
            title: '我在「指尖的時光路書」走出了這個结局！',
            text: `我的青春回憶是「${endNode.title}」，也來走走看你的吧！`,
            url: window.location.origin + window.location.pathname
        };
        try {
            if (navigator.share) { await navigator.share(shareData); }
            else { alert('您的瀏覽器不支援直接分享，請手動複製網址分享給朋友！'); }
        } catch (err) { console.error('分享失敗:', err); }
    };
    createStoryButton.onclick = () => {
        const note = memoryInput.value.trim();
        if (!note) { alert('請先寫下你的回憶註解！'); return; }
        const storyData = { path: playerPath, note: note };
        const encodedStory = btoa(JSON.stringify(storyData));
        const storyUrl = `${window.location.origin}${window.location.pathname}?story=${encodedStory}`;
        navigator.clipboard.writeText(storyUrl).then(() => {
            alert('您的專屬故事連結已複製！快分享給您的孩子或朋友吧！');
        }).catch(err => { alert('複製失敗，請手動複製以下連結：\n' + storyUrl); });
    };
});