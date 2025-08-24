// ========================================================
// --- 遊戲核心邏輯：遊戲引擎與流程控制 ---
// ========================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- 統一宣告所有網頁元素 ---
    const startScreen = document.getElementById('start-screen');
    const gameArea = document.getElementById('game-area');
    const endScreen = document.getElementById('end-screen');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const nextChapterButton = document.getElementById('next-chapter-button');
    const scrollMap = document.getElementById('scroll-map');
    const choiceOverlay = document.getElementById('choice-overlay');
    const choiceText = document.getElementById('choice-text');
    const endTitle = document.getElementById('end-title');
    const endDescription = document.getElementById('end-description');
    const endImageContainer = document.getElementById('end-image-container');
    const shareButton = document.getElementById('share-button');
    const memoryInput = document.getElementById('memory-input');
    const createStoryButton = document.getElementById('create-story-button');

    // --- 遊戲狀態 ---
    const MAP_HEIGHT = 2800;
    let playerPath = [];
    let currentMapData = null;

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
                    document.getElementById('choice-overlay').classList.add('hidden');
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
                    document.getElementById('choice-overlay').classList.add('hidden');
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
            const nodeData = currentMapData[nodeId];
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
        const choiceButtons = document.getElementById('choice-buttons');
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
                const button = document.createElement('button');
                button.textContent = choice.text;
                button.className = 'choice-btn-overlay'; // 新增的 class
                button.onclick = () => {
                    cleanupChoiceListeners();
                    playerPath.push(choice.target);
                    runGameLogic(choice.target);
                };
                choiceButtons.appendChild(button);
                activeNodes.push({ element: button, handler: button.onclick });
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
        const nodeData = currentMapData[nodeId];
        if (!nodeData) { console.error(`執行節點錯誤: 找不到 ID 為 "${nodeId}" 的節點。`); return; }
        if (nodeData.pos) { await moveToNode(nodeId); }

        switch (nodeData.type) {
            case 'event': await delay(2000); playerPath.push(nodeData.next); runGameLogic(nodeData.next); break;
            case 'choice': showChoice(nodeData, nodeId); break;
            case 'conditional_random': const possibleEnds = nodeData.possible_ends; const randomIndex = Math.floor(Math.random() * possibleEnds.length); const nextNodeId = possibleEnds[randomIndex]; await delay(1000); runGameLogic(nextNodeId); break;
            case 'minigame-memory-puzzle': await handleMemoryPuzzle(nodeData); await delay(50); playerPath.push(nodeData.next); runGameLogic(nodeData.next); break;
            case 'minigame-arcade': await handleIframeGame(nodeData, 'arcade-game-complete'); await delay(50); playerPath.push(nodeData.next); runGameLogic(nodeData.next); break;
            case 'minigame-manga-match': await handleIframeGame(nodeData, 'manga-match-complete'); await delay(50); playerPath.push(nodeData.next); runGameLogic(nodeData.next); break;
            case 'minigame-math': await handleIframeGame(nodeData, 'math-game-complete'); await delay(50); playerPath.push(nodeData.next); runGameLogic(nodeData.next); break;
            case 'minigame-chinese-pinyin': await handleIframeGame(nodeData, 'chinese-game-complete'); await delay(50); playerPath.push(nodeData.next); runGameLogic(nodeData.next); break;
            case 'minigame-jigsaw': await handleIframeGame(nodeData, 'jigsaw-game-complete'); await delay(50); playerPath.push(nodeData.next); runGameLogic(nodeData.next); break;
            case 'minigame-room-tidy': await handleIframeGame(nodeData, 'room-tidy-complete'); await delay(50); playerPath.push(nodeData.next); runGameLogic(nodeData.next); break;
            case 'minigame-assembly': await handleIframeGame(nodeData, 'assembly-game-complete'); await delay(50); playerPath.push(nodeData.next); runGameLogic(nodeData.next); break;
            case 'end': await delay(1500); showEndScreen(nodeData); break;
        }
    }
    
    function showEndScreen(endNode) {
        endTitle.textContent = endNode.title;
        endDescription.textContent = endNode.description;
        endImageContainer.innerHTML = `<img src="${endNode.img}" alt="${endNode.title}">`;
        gameArea.classList.add('hidden');
        endScreen.classList.remove('hidden');

        if (endNode.nextChapter) {
            nextChapterButton.style.display = 'inline-block';
        } else {
            nextChapterButton.style.display = 'none';
        }
    }

    function initGame(map, chapter) { // <-- 新增 chapter 參數
        currentMapData = map;
        playerPath = [];
        scrollMap.innerHTML = '';
        gameArea.classList.remove('hidden');
        startScreen.classList.add('hidden');
        endScreen.classList.add('hidden');
        scrollMap.style.transition = 'none';
        scrollMap.style.transform = 'translateY(0px)';
        scrollMap.style.height = `${MAP_HEIGHT}px`;

        if (chapter === 'ch2') {
            scrollMap.style.backgroundImage = "url('assets/map-bg-ch2.png')";
            scrollMap.style.backgroundColor = "#5d4a43"; 
        } else {
            scrollMap.style.backgroundImage = "url('assets/map-bg-ch1.jpg')";
            scrollMap.style.backgroundColor = "#f0e6d2";
        }
        scrollMap.style.backgroundSize = "cover";
        
        const startNodeId = Object.keys(currentMapData)[0];

        Object.keys(currentMapData).forEach(nodeId => {
            const nodeData = currentMapData[nodeId];
            if (nodeData.pos) {
                const nodeDiv = document.createElement('div');
                nodeDiv.className = 'node';
                nodeDiv.dataset.nodeId = nodeId; 
                nodeDiv.style.left = `${nodeData.pos.x}%`;
                nodeDiv.style.top = `${nodeData.pos.y}%`;
                if (nodeData.type !== 'end' && nodeData.type !== 'conditional_random') {
                    const nodeImg = document.createElement('img');
                    nodeImg.src = `assets/${nodeId}.png`;
                    nodeImg.alt = nodeData.text || '';
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
        
        playerPath.push(startNodeId);
        setTimeout(() => runGameLogic(startNodeId), 100);
    }

    // --- 事件綁定 (已更新) ---
    startButton.addEventListener('click', () => initGame(mapDataCh1, 'ch1'));
    restartButton.addEventListener('click', () => initGame(mapDataCh1, 'ch1'));
    nextChapterButton.addEventListener('click', () => initGame(mapDataCh2, 'ch2'));
    if (shareButton) { shareButton.onclick = async () => { const endNode = currentMapData[playerPath[playerPath.length - 1]]; const shareData = { title: '我在「指尖的時光路書」走出了這個结局！', text: `我的青春回憶是「${endNode.title}」，也來走走看你的吧！`, url: window.location.origin + window.location.pathname }; try { if (navigator.share) { await navigator.share(shareData); } else { alert('您的瀏覽器不支援直接分享，請手動複製網址分享給朋友！'); } } catch (err) { console.error('分享失敗:', err); } }; }
    if (createStoryButton) { createStoryButton.onclick = () => { const note = memoryInput.value.trim(); if (!note) { alert('請先寫下你的回憶註解！'); return; } const storyData = { path: playerPath, note: note }; const encodedStory = btoa(JSON.stringify(storyData)); const storyUrl = `${window.location.origin}${window.location.pathname}?story=${encodedStory}`; navigator.clipboard.writeText(storyUrl).then(() => { alert('您的專屬故事連結已複製！快分享給您的孩子或朋友吧！'); }).catch(err => { alert('複製失敗，請手動複製以下連結：\n' + storyUrl); }); }; }

});