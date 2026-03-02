// js/main.js
document.addEventListener('DOMContentLoaded', () => {
  // --- Audio elements (index vs messages) ---
  const bgAudio = document.getElementById('bg-audio');       // index page audio (may be null on other pages)
  const confettiAudio = document.querySelectorAll('#confetti-audio');
  const confettiSound = confettiAudio.length ? confettiAudio[0] : null;

  // index page controls
  const playBtn = document.getElementById('play-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const confettiBtn = document.getElementById('confetti-btn');

  // messages page audio controls
  const msgAudio = document.getElementById('msg-audio');
  const playMsgBtn = document.getElementById('play-msg-music');
  const pauseMsgBtn = document.getElementById('pause-msg-music');

  // common helper: try autoplay muted then unmute on user gesture
  function tryAutoplayMuted(audioEl) {
    if (!audioEl) return;
    audioEl.muted = true;
    audioEl.volume = 0.6;
    const p = audioEl.play();
    if (p && p.catch) p.catch(()=>{ /* autoplay blocked */ });
  }

  // try autoplay for page-specific audio
  tryAutoplayMuted(bgAudio);
  tryAutoplayMuted(msgAudio);

  // unmute & fade-in on first gesture for either audio present on page
  function gestureUnmute() {
    [bgAudio, msgAudio].forEach(audioEl => {
      if (!audioEl) return;
      try {
        audioEl.muted = false;
        audioEl.play().catch(()=>{});
        // fade-in
        audioEl.volume = 0.0;
        let v = 0.0;
        const ramp = setInterval(() => {
          v += 0.06;
          audioEl.volume = Math.min(v, 0.7);
          if (audioEl.volume >= 0.7) clearInterval(ramp);
        }, 120);
      } catch(e) { /* ignore */ }
    });
    // remove listeners after first gesture
    ['click','keydown','touchstart'].forEach(ev => document.removeEventListener(ev, gestureUnmute));
  }
  ['click','keydown','touchstart'].forEach(ev => document.addEventListener(ev, gestureUnmute, { once: true }));

  // index page play/pause UI
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (!bgAudio) return;
      bgAudio.muted = false;
      bgAudio.play().catch(()=>{});
      playBtn.style.display = 'none';
      if (pauseBtn) pauseBtn.style.display = 'inline-flex';
    });
  }
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if (!bgAudio) return;
      bgAudio.pause();
      pauseBtn.style.display = 'none';
      if (playBtn) playBtn.style.display = 'inline-flex';
    });
  }

  // messages music controls
  if (playMsgBtn) {
    playMsgBtn.addEventListener('click', () => {
      if (!msgAudio) return;
      msgAudio.muted = false;
      msgAudio.play().catch(()=>{});
      playMsgBtn.style.display = 'none';
      if (pauseMsgBtn) pauseMsgBtn.style.display = 'inline-flex';
    });
  }
  if (pauseMsgBtn) {
    pauseMsgBtn.addEventListener('click', () => {
      if (!msgAudio) return;
      msgAudio.pause();
      pauseMsgBtn.style.display = 'none';
      if (playMsgBtn) playMsgBtn.style.display = 'inline-flex';
    });
  }

  // confetti: trigger visual + sound
  let confettiTimeout;
  if (confettiBtn) {
    confettiBtn.addEventListener('click', () => {
      if (typeof confetti === 'function') {
        confetti({ particleCount: 140, spread: 170, origin: { x: 0.5, y: 0.18 }, colors: ['#ff0000','#ffd700','#ffeb3b'] });
      } else {
        console.log('confetti lib missing');
      }
      if (confettiSound) {
        confettiSound.currentTime = 0;
        confettiSound.play().catch(()=>{});
        
        clearTimeout(confettiTimeout);
        confettiTimeout = setTimeout(() => {
          confettiSound.pause();
        }, 2000);
      }
    });
  }

  // --- localStorage comments logic & random greetings ---
  const KEY = 'fushou_comments_v3'; // 更新了 KEY 避免和旧的带姓名的数据冲突
	const defaultGreetings = [
		// --- 经典庆贺与福首相关 ---
		'恭喜张高华就任福首，福寿绵长！',
		'祝张高华先生任期顺利，民安物阜！',
		'福星高照，万事如意，恭贺！',
		'愿福泽四方，国泰民安。',
		'祝贺任职，事业顺达，阖家欢乐！',
		'衷心祝愿：福禄双全，心想事成！',
		'祝张先生任期有为，百姓称心！',
		'恭祝张高华福运亨通，前程似锦！',
		'愿和谐常在，福泽长存！',
		'祝福声声，安康随行！',

		// --- 偏向商业/生意兴隆的祝福 ---
		'恭贺张先生荣任福首！祝您生意兴隆通四海，财源茂盛达三江！',
		'福首纳福，瑞气盈门。祝张高华先生事业大展宏图！',
		'沾沾福首的喜气，祝张老板日进斗金，百业兴旺！',
		'贺张高华先生就任福首，愿您汇聚八方来财，财运亨通！',
		'恭喜张老板！愿您借此福运，生意更上一层楼，大展鸿图！',
		'恭祝张高华先生：福气冲天，财气傍身，运势长虹！',
		'喜逢盛事，恭贺张老板！祝您宏图大展，步步高升。',
		'福首迎福，祥瑞相伴。祝您好运连连，生意红红火火！',

		// --- 偏向亲朋好友/家庭安康的祝福 ---
		'庆贺张高华先生履新，愿您福气满满，万事顺遂！',
		'福首天降，德位相配。祝您和家人平平安安，健健康康。',
		'恭喜高华兄荣任福首，愿福运长伴，家庭和和美美！',
		'沾喜气，迎福运。祝张高华先生及各位亲朋好友皆顺遂安康。',
		'福气东来，吉星高照。祝张高华先生福寿安康，笑口常开！',
		'恭贺！愿福首的祥瑞之气，为您带来滚滚财源和无尽欢笑。',
		'福泽绵长，好运连连！祝张先生在新的一年里心想事成。',
		'贺喜张先生！愿您前程似锦，福泽广被，万事大吉。',
		'祝愿张高华先生：福星高照，鸿运当头，事事顺心如意！'
	  ];

  function loadComments() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) { return []; }
  }
  function saveComments(arr) {
    try {
      localStorage.setItem(KEY, JSON.stringify(arr));
    } catch (e) { console.warn('保存失败', e); }
  }

  const commentsContainer = document.getElementById('comments-list');
  function seedRandomIfEmpty() {
    const arr = loadComments();
    if (arr.length === 0) {
      const pick = [];
      for (let i = 0; i < 6; i++) {
        // 不再生成 name，直接保存 text
        pick.push({ ts: new Date().toLocaleString(), text: defaultGreetings[Math.floor(Math.random() * defaultGreetings.length)] });
      }
      saveComments(pick);
    }
  }

  // render comments (newest first) into commentsContainer and start rotation
  let rotateInterval = null;
  function renderComments() {
    if (!commentsContainer) return;
    const arr = loadComments().slice(-200).reverse();
    commentsContainer.innerHTML = '';
    if (arr.length === 0) {
      commentsContainer.innerHTML = '<div class="comment">暂无祝福</div>';
      return;
    }
    arr.forEach(c => {
      const d = document.createElement('div');
      d.className = 'comment';
      // 移除姓名部分，直接给出祝福语和时间
      d.innerHTML = `<span style="color:#ffd; font-size:0.9em;">(${escapeHtml(c.ts)})</span><div style="margin-top:6px;">${escapeHtml(c.text)}</div>`;
      commentsContainer.appendChild(d);
    });
    startRotate();
  }

  function startRotate() {
    if (!commentsContainer) return;
    if (rotateInterval) clearInterval(rotateInterval);
    rotateInterval = setInterval(() => {
      if (commentsContainer.children.length <= 1) return;
      const first = commentsContainer.children[0];
      const clone = first.cloneNode(true);
      commentsContainer.appendChild(clone);
      commentsContainer.removeChild(first);
    }, 3800);
  }

  function escapeHtml(s) {
    return (s + '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  // message form handling
  const form = document.getElementById('message-form');
  if (form) {
    seedRandomIfEmpty();
    renderComments();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const textEl = document.getElementById('message');
      const text = (textEl && textEl.value.trim()) || '';
      if (!text) { alert('请填写祝福内容'); return; }
      
      const arr = loadComments();
      arr.push({ ts: new Date().toLocaleString(), text });
      
      // keep last 500
      if (arr.length > 500) arr.splice(0, arr.length - 500);
      saveComments(arr);
      textEl.value = '';
      renderComments();
      alert('感谢您的祝福！'); // 修改了提示语，更自然
    });

  } else {
    seedRandomIfEmpty();
    renderComments();
  }

  if (commentsContainer) setInterval(renderComments, 8000);
});
