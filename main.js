'use strict';

{
  let DATA_URL = 'https://raw.githubusercontent.com/teshiokayumi/english_typing_game/main/words.json';

  let wordList = [];
  let currentWordObj;
  let loc = 0;
  let startTime;
  let isPlaying = false;

  const target = document.getElementById('target');
  const japanese = document.getElementById('japanese');
  const result = document.getElementById('result');
  const startButton = document.getElementById('start-button');
  const body = document.body;

  // 新規追加要素
  const gradeBtns = document.querySelectorAll('.grade-btn');
  const customUrlInput = document.getElementById('custom-url');
  const loadCustomBtn = document.getElementById('load-custom');

  // 単語データのバリデーション
  function validateData(data) {
    if (!Array.isArray(data)) return false;
    return data.every(item =>
      typeof item.word === 'string' &&
      typeof item.japanese === 'string' &&
      item.word.length > 0
    );
  }

  // 単語データの取得
  async function loadWords(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('ネットワークエラーが発生しました');

      const data = await response.json();

      if (!validateData(data)) {
        throw new Error('JSONの形式が正しくありません (wordとjapaneseの配列が必要です)');
      }

      wordList = data;
      DATA_URL = url;
      japanese.textContent = 'データ読み込み完了！';
      target.textContent = 'Ready?';

      // ボタンの選択状態を更新
      gradeBtns.forEach(btn => {
        if (btn.dataset.url === url) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

    } catch (e) {
      console.error('Failed to load words:', e);
      japanese.textContent = 'エラー: ' + e.message;
      target.textContent = 'ERROR';
      wordList = [];
    }
  }

  function setWord() {
    if (wordList.length === 0) return;

    const randomIndex = Math.floor(Math.random() * wordList.length);
    currentWordObj = wordList[randomIndex];

    target.textContent = currentWordObj.word;
    japanese.textContent = currentWordObj.japanese;
    loc = 0;
    updateTargetDisplay();
  }

  function updateTargetDisplay() {
    const word = currentWordObj.word;
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
      loadWords(DATA_URL).then(() => {
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

  // イベントリスナー
  startButton.addEventListener('click', startGame);

  // 学年切り替え
  gradeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isPlaying) return;
      loadWords(btn.dataset.url);
    });
  });

  // カスタムURL読み込み
  loadCustomBtn.addEventListener('click', () => {
    if (isPlaying) return;
    const url = customUrlInput.value.trim();
    if (url) {
      loadWords(url);
    } else {
      japanese.textContent = 'URLを入力してください';
    }
  });

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
    result.textContent = `Clear Time: ${elapsedTime}s`;
    body.classList.remove('playing');
    body.classList.add('finished');
    startButton.textContent = 'RETRY';
    startButton.style.visibility = 'visible';
  }

  // 初期読み込み
  loadWords(DATA_URL);
}