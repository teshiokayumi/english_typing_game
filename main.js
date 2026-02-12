'use strict';

{
  // JSONの取得先 (将来的にGitHubのURLに変更可能)
  const DATA_URL = 'words.json'; 
  
  let wordList = [];
  let currentWordObj;
  let loc = 0;
  let startTime;
  let isPlaying = false;
  let timerId;

  const target = document.getElementById('target');
  const japanese = document.getElementById('japanese');
  const result = document.getElementById('result');
  const startButton = document.getElementById('start-button');
  const body = document.body;

  // 単語データの取得
  async function loadWords() {
    try {
      const response = await fetch(DATA_URL);
      wordList = await response.json();
    } catch (e) {
      console.error('Failed to load words:', e);
      japanese.textContent = 'データの読み込みに失敗しました';
    }
  }

  function setWord() {
    // リストからランダムに1つ選ぶ
    const randomIndex = Math.floor(Math.random() * wordList.length);
    currentWordObj = wordList[randomIndex];
    
    // 表示の更新
    target.textContent = currentWordObj.word;
    japanese.textContent = currentWordObj.japanese;
    loc = 0;
    updateTargetDisplay();
  }

  function updateTargetDisplay() {
    const word = currentWordObj.word;
    // タイピング済みの文字に .typed クラスを適用するためのHTML構造
    target.innerHTML = '';
    for (let i = 0; i < word.length; i++) {
        const span = document.createElement('span');
        span.textContent = word[i];
        if (i < loc) {
            span.className = 'typed';
        }
        target.appendChild(span);
    }
  }

  function startGame() {
    if (isPlaying) return;
    
    if (wordList.length === 0) {
      loadWords().then(() => {
        if (wordList.length > 0) start();
      });
    } else {
      start();
    }
  }

  function start() {
    isPlaying = true;
    loc = 0;
    startTime = Date.now();
    result.textContent = '';
    body.classList.add('playing');
    body.classList.remove('finished');
    startButton.style.visibility = 'hidden';
    setWord();
  }

  startButton.addEventListener('click', startGame);

  window.addEventListener('keydown', e => {
    if (!isPlaying) return;

    if (e.key === currentWordObj.word[loc]) {
      loc++;
      updateTargetDisplay();

      if (loc === currentWordObj.word.length) {
        finishGame();
      }
    }
  });

  function finishGame() {
    isPlaying = false;
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
    result.textContent = `Excellent! Clear Time: ${elapsedTime}s`;
    body.classList.remove('playing');
    body.classList.add('finished');
    startButton.textContent = 'RETRY';
    startButton.style.visibility = 'visible';
  }

  // 初期読み込み
  loadWords();
}