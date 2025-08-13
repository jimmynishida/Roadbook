document.addEventListener('DOMContentLoaded', () => {

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

    const mapData = {
        'start':     { type: 'event',  pos: { x: 50, y: 92 }, text: '放學後，走出校門',     next: 'choice1' },
        'choice1':   { type: 'choice', pos: { x: 50, y: 78 }, text: '要去哪裡呢？',
            choices: [ { text: '去左邊的「柑仔店」', target: 'gamadim' }, { text: '去右邊的「電動間」', target: 'arcade' } ]
        },
        'gamadim':   { type: 'event',  pos: { x: 30, y: 65 }, text: '在柑仔店買了零食',   next: 'choice2' },
        'arcade':    { type: 'event',  pos: { x: 70, y: 55 }, text: '在電動間打遊戲',    next: 'choice2' },
        'choice2':   { type: 'choice', pos: { x: 50, y: 45 }, text: '天色晚了，回家吧...',
            choices: [ { text: '走大馬路回家', target: 'mainroad' }, { text: '跟朋友在大樹下道別', target: 'tree' } ]
        },
        'mainroad':  { type: 'event',  pos: { x: 65, y: 25 }, text: '走大路回家',       next: 'end_home' },
        'tree':      { type: 'event',  pos: { x: 70, y: 35 }, text: '在大樹下玩耍道別',     next: 'end_friends' },
        'end_home':    { type: 'end', pos: { x: 60, y: 10 }, title: '溫暖的晚餐', description: '雖然平凡，但家裡的飯菜香和等待的燈光，就是一天中最安穩的時刻。這是最簡單的幸福。', img: 'https://i.imgur.com/FqA8sXv.jpg' },
        'end_friends': { type: 'end', pos: { x: 75, y: 15 }, title: '難忘的友誼', description: '青春最棒的，就是有個能陪你一起在路燈下聊天的朋友。那些無聊又閃亮的夜晚，構成了我們的少年時代。', img: 'https://i.imgur.com/gW3L3Yg.jpg' }
    };

    const MAP_HEIGHT = 2800;
    let playerPath = [];

    function initGame() {
        playerPath = [];
        scrollMap.innerHTML = '';
        scrollMap.style.transition = 'none';
        
        scrollMap.style.height = `${MAP_HEIGHT}px`;
        for (const nodeId in mapData) {
            const nodeData = mapData[nodeId];
            const nodeElement = document.createElement('div');
            nodeElement.className = 'node';
            nodeElement.id = `node-${nodeId}`;
            nodeElement.style.left = `${nodeData.pos.x}%`;
            nodeElement.style.top = `${nodeData.pos.y}%`;
            scrollMap.appendChild(nodeElement);
        }

        gameArea.classList.add('hidden');
        endScreen.classList.add('hidden');
        startScreen.classList.remove('hidden'); // 確保每次都從開始畫面開始

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('story')) {
            const storyData = JSON.parse(atob(urlParams.get('story')));
            playStoryMode(storyData);
        }
    }

    function startGame() {
        startScreen.classList.add('hidden');
        gameArea.classList.remove('hidden');

        const startNode = mapData['start'];
        const initialY = (startNode.pos.y / 100 * MAP_HEIGHT) - (window.innerHeight * 0.85);
        scrollMap.style.transform = `translateY(-${initialY}px)`;
        setTimeout(() => {
            moveToNode('start');
        }, 500);
    }
    
    function moveToNode(nodeId, isStoryMode = false) {
        if (!isStoryMode) { playerPath.push(nodeId); }
        const nodeData = mapData[nodeId];
        if (!nodeData) {
            console.error("錯誤：找不到節點資料 for ID:", nodeId);
            return;
        }
        const targetY = (nodeData.pos.y / 100 * MAP_HEIGHT);
        const scrollAmount = targetY - (window.innerHeight * 0.85);
        scrollMap.style.transition = 'transform 3s ease-in-out';
        scrollMap.style.transform = `translateY(-${scrollAmount}px)`;
        setTimeout(() => { handleNodeType(nodeId, isStoryMode); }, 3100);
    }

    function handleNodeType(nodeId, isStoryMode = false) {
        const nodeData = mapData[nodeId];
        if (isStoryMode && nodeData.type === 'choice') { return; }

        switch (nodeData.type) {
            case 'event':
                moveToNode(nodeData.next, isStoryMode);
                break;
            case 'choice':
                choiceText.textContent = nodeData.text;
                choiceButtons.innerHTML = '';
                nodeData.choices.forEach(choice => {
                    const button = document.createElement('button');
                    button.className = 'choice-btn';
                    button.textContent = choice.text;
                    button.onclick = () => {
                        choiceOverlay.classList.add('hidden');
                        moveToNode(choice.target, isStoryMode);
                    };
                    choiceButtons.appendChild(button);
                });
                choiceOverlay.classList.remove('hidden');
                break;
            case 'end':
                showEndScreen(nodeData);
                break;
        }
    }

    function showEndScreen(endNode, customNote = null) {
        const title = endNode?.title ?? '旅程的一個終點';
        const description = customNote || (endNode?.description ?? '每一段回憶，都值得珍藏。');
        const imageUrl = endNode?.img ?? 'https://i.imgur.com/gW3L3Yg.jpg';

        document.getElementById('end-title').textContent = title;
        document.getElementById('end-description').textContent = description;
        document.getElementById('end-image-container').innerHTML = `<img src="${imageUrl}" alt="${title}">`;
        
        gameArea.classList.add('hidden');
        endScreen.classList.remove('hidden');
    }

    function playStoryMode(storyData) {
        startScreen.classList.add('hidden');
        gameArea.classList.remove('hidden');
        memoryNoteArea.style.display = 'none';

        const { path, note } = storyData;
        let currentStep = 0;
        
        const initialY = (mapData[path[0]].pos.y / 100 * MAP_HEIGHT) - (window.innerHeight * 0.85);
        scrollMap.style.transform = `translateY(-${initialY}px)`;
        
        function nextStep() {
            if (currentStep < path.length) {
                const nodeId = path[currentStep];
                const nodeData = mapData[nodeId];
                moveToNode(nodeId, true);
                currentStep++;
                if (nodeData.type !== 'end') { setTimeout(nextStep, 3200); } 
                else { setTimeout(() => showEndScreen(nodeData, note), 3100); }
            }
        }
        setTimeout(nextStep, 500);
    }
    
    // --- 按鈕事件綁定 ---
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', initGame);

    shareButton.addEventListener('click', async () => {
        const endNode = mapData[playerPath[playerPath.length - 1]];
        if (!endNode) return;
        const shareData = {
            title: '我在「指尖的時光路書」走出了這個结局！',
            text: `我的青春回憶是「${endNode.title}」，也來走走看你的吧！`,
            url: window.location.origin + window.location.pathname
        };
        try {
            if (navigator.share) { await navigator.share(shareData); } 
            else { alert('您的瀏覽器不支援直接分享，請手動複製網址分享給朋友！'); }
        } catch (err) { console.error('分享失敗:', err); }
    });

    createStoryButton.addEventListener('click', () => {
        const note = memoryInput.value.trim();
        if (!note) { alert('請先寫下你的回憶註解！'); return; }
        const storyData = { path: playerPath, note: note };
        const encodedStory = btoa(JSON.stringify(storyData));
        const storyUrl = `${window.location.origin}${window.location.pathname}?story=${encodedStory}`;
        navigator.clipboard.writeText(storyUrl).then(() => {
            alert('您的專屬故事連結已複製！快分享給您的孩子或朋友吧！');
        }).catch(err => { alert('複製失敗，請手動複製以下連結：\n' + storyUrl); });
    });

    // --- 遊戲啟動 ---
    initGame();
});