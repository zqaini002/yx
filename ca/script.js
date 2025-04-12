(function() {
    const BASE_DUST = 15;
const LEVEL_INCREASE_PERCENT = 3;
    const ERASER_SIZE = 40;
    let currentLevel = 0;
    let score = 0;
    const MAGNET_DURATION = 5000;
    const FREEZE_DURATION = 8000;
     // 初始从第0关开始
    let clothActive = false;
    let freezeTimeActive = false;
    let magnetActive = false;

    // 初始化游戏
    function initGame() {
        const config = levelConfigs[currentLevel] || {dustCount: 15, pattern: 'random'};
        createDust(config);
        setupEventListeners();
        initPowerups();
        
        // 添加关卡过渡动画
        const levelElement = document.getElementById('level');
        levelElement.textContent = `第${currentLevel + 1}关`;
        levelElement.style.transform = 'scale(1.2)';
        setTimeout(() => levelElement.style.transform = 'scale(1)', 500);
    }

    // 创建灰尘粒子
    // 新增关卡配置
    const levelConfigs = [
  {dustCount: 15, pattern: 'random'},
  {dustCount: 20, pattern: 'cluster'},
  {dustCount: 25, pattern: 'spiral'},
      {dustCount: 15, speed: 1, pattern: 'random'},
      { dustCount: 20, speed: 1.2, pattern: 'cluster' },
      { dustCount: 25, speed: 1.5, pattern: 'spiral' },
      { dustCount: 30, speed: 1.8, pattern: 'grid' },      { dustCount: 35, speed: 2.1, pattern: 'random' },
      
      // 6-10关
      { dustCount: 40, speed: 2.4, pattern: 'spiral' },
      { dustCount: 45, speed: 2.5, pattern: 'grid' },
      { dustCount: 50, speed: 2.6, pattern: 'random' },
      { dustCount: 55, speed: 2.7, pattern: 'cluster' },
      { dustCount: 60, speed: 2.8, pattern: 'spiral' },
      
      // 11-15关
      { dustCount: 65, speed: 2.9, pattern: 'grid' },
      { dustCount: 70, speed: 3.0, pattern: 'random' },
      { dustCount: 75, speed: 3.1, pattern: 'cluster' },
      { dustCount: 80, speed: 3.2, pattern: 'spiral' },
      { dustCount: 85, speed: 3.3, pattern: 'grid' },
      
      // 16-20关
      { dustCount: 90, speed: 3.4, pattern: 'random' },
      { dustCount: 95, speed: 3.5, pattern: 'cluster' },
      { dustCount: 100, speed: 3.6, pattern: 'spiral' },
      { dustCount: 105, speed: 3.7, pattern: 'grid' },
      { dustCount: 110, speed: 3.8, pattern: 'random' },
      
      // 21-25关
      { dustCount: 115, speed: 3.9, pattern: 'cluster' },
      { dustCount: 120, speed: 4.0, pattern: 'spiral' },
      { dustCount: 125, speed: 4.1, pattern: 'grid' },
      { dustCount: 130, speed: 4.2, pattern: 'random' },
      { dustCount: 135, speed: 4.3, pattern: 'cluster' },
      
      // 26-30关
      { dustCount: 140, speed: 4.4, pattern: 'spiral' },
      { dustCount: 145, speed: 4.5, pattern: 'grid' },
      { dustCount: 150, speed: 4.6, pattern: 'random' },
      { dustCount: 155, speed: 4.7, pattern: 'cluster' },
      { dustCount: 160, speed: 4.8, pattern: 'spiral' }
    ];
    
    
    
    // 修改后的createDust函数
    function createDust(config) {
      const gameArea = document.getElementById('game-area');
      gameArea.innerHTML = '';
      
      // 获取游戏区域尺寸
      const rect = gameArea.getBoundingClientRect();
      const areaWidth = rect.width;
      const areaHeight = rect.height;
      
      // 创建测试元素获取灰尘尺寸
      const testDust = document.createElement('div');
      testDust.className = 'dust';
      gameArea.appendChild(testDust);
      const dustRect = testDust.getBoundingClientRect();
      const dustWidth = dustRect.width;
      const dustHeight = dustRect.height;
      gameArea.removeChild(testDust);

      // 安全边距（5%）
      const margin = 0.05;
      const maxX = (areaWidth - dustWidth) / areaWidth * (1 - margin*2);
      const maxY = (areaHeight - dustHeight) / areaHeight * (1 - margin*2);

      for(let i = 0; i < config.dustCount; i++) {
        const dust = document.createElement('div');
        dust.className = 'dust';
        
        // 实现不同生成模式
        switch(config.pattern) {
          case 'cluster': {
            const baseX = 40 + Math.random() * 10;
            const baseY = 40 + Math.random() * 10;
            dust.style.left = Math.min(maxX, Math.max(margin*100, baseX)) + '%';
            dust.style.top = Math.min(maxY, Math.max(margin*100, baseY)) + '%';
            break;
          }
          case 'spiral': {
            const angle = (i / config.dustCount) * Math.PI * 2;
            const spiralX = 50 + Math.cos(angle) * 25;
            const spiralY = 50 + Math.sin(angle) * 25;
            dust.style.left = Math.min(maxX, Math.max(margin*100, spiralX)) + '%';
            dust.style.top = Math.min(maxY, Math.max(margin*100, spiralY)) + '%';
            break;
          }
          case 'grid': {
            const cols = Math.sqrt(config.dustCount);
            const row = Math.floor(i / cols);
            const col = i % cols;
            const gridX = (col * 90 / (cols - 1)) + 5;
            const gridY = (row * 90 / (cols - 1)) + 5;
            dust.style.left = gridX + '%';
            dust.style.top = gridY + '%';
            break;
          }
          default: { // random
            const randomX = Math.random() * (100 - margin*200) + margin*100;
            const randomY = Math.random() * (100 - margin*200) + margin*100;
            dust.style.left = Math.min(maxX, randomX) + '%';
            dust.style.top = Math.min(maxY, randomY) + '%';
          }
        }
        
        gameArea.appendChild(dust);
      }
    }

    // 事件监听设置
    function setupEventListeners() {
        const gameArea = document.getElementById('game-area');
        let isDragging = false;

        // 触摸事件
        gameArea.addEventListener('touchstart', handleStart);
        gameArea.addEventListener('touchmove', handleMove);
        gameArea.addEventListener('touchend', handleEnd);

        // 鼠标事件
        gameArea.addEventListener('mousedown', handleStart);
        gameArea.addEventListener('mousemove', handleMove);
        gameArea.addEventListener('mouseup', handleEnd);

        function handleStart(e) {
            isDragging = true;
            handleMove(e);
        }

        function handleMove(e) {
            if (!isDragging) return;
            
            const rect = gameArea.getBoundingClientRect();
            let clientX, clientY;

            if (e.touches) {
                clientX = e.touches[0].clientX - rect.left;
                clientY = e.touches[0].clientY - rect.top;
            } else {
                clientX = e.clientX - rect.left + window.scrollX;
                clientY = e.clientY - rect.top + window.scrollY;
            }

            checkCollision(clientX, clientY);
        }

        function handleEnd() {
            isDragging = false;
        }
    }

    // 碰撞检测
    function checkCollision(x, y) {
        const dusts = document.getElementsByClassName('dust');
        
        Array.from(dusts).forEach(dust => {
            if(clothActive) {
                const rect = dust.getBoundingClientRect();
                const dustX = rect.left + rect.width/2;
                const dustY = rect.top + rect.height/2;
                
                if(Math.abs(x - dustX) < ERASER_SIZE*2 && Math.abs(y - dustY) < ERASER_SIZE*2) {
                    removeDust(dust);
                }
            }
            const rect = dust.getBoundingClientRect();
            const dustX = rect.left + rect.width/2;
            const dustY = rect.top + rect.height/2;

            const distance = Math.sqrt(Math.pow(x - dustX, 2) + Math.pow(y - dustY, 2));
            if (distance < ERASER_SIZE) {
                removeDust(dust);
            }
        });
    }

    // 移除灰尘
    function removeDust(dust) {
        dust.style.transform = 'scale(2)';
        dust.style.opacity = '0';
        
        setTimeout(() => {
            dust.remove();
            updateScore();
            checkWin();
        }, 300);
    }

    // 更新得分
    function updateScore() {
        score += 5;
        document.getElementById('score').textContent = `得分：${score}`;
    }

    // 胜利检测
    function checkWin() {
        if (document.getElementsByClassName('dust').length === 0) {
            currentLevel++;
            
            currentLevel = (currentLevel + 1) % levelConfigs.length;

            document.getElementById('level').classList.add('level-up');
            setTimeout(() => {
                document.getElementById('level').textContent = `第${currentLevel + 1}关`;
                createDust(levelConfigs[currentLevel]);
                document.getElementById('level').classList.remove('level-up');
            }, 1000);
        }
    }

    function gameOver() {
        const gameArea = document.getElementById('game-area');
        const overlay = document.getElementById('game-over-layer');
        
        gameArea.style.display = 'none';
        overlay.style.display = 'flex';
        document.getElementById('final-score').textContent = score;
        
        document.getElementById('restart-btn').onclick = () => {
            currentLevel = 0;
            score = 0;
            document.getElementById('score').textContent = '得分：0';
            overlay.style.display = 'none';
            gameArea.style.display = 'block';
            initGame();
        };
    }
    // 启动游戏
    initGame();

    // 初始化道具系统
    function initPowerups() {
        document.getElementById('magnet-btn').addEventListener('click', activateMagnet);
        document.getElementById('freeze-btn').addEventListener('click', activateFreeze);
    }

    // 磁铁道具功能
    function activateMagnet() {
        if(magnetActive) return;
        magnetActive = true;
        setTimeout(() => magnetActive = false, MAGNET_DURATION);
    }

    // 时间冻结功能
    function activateFreeze() {
        if(freezeTimeActive) return;
        freezeTimeActive = true;
        setTimeout(() => freezeTimeActive = false, FREEZE_DURATION);
    }


})();