/* Bé Học Tiếng Anh – ứng dụng học tiếng Anh cho trẻ beginner.
   Không cần build: mở index.html qua một web server tĩnh là chạy. */
'use strict';

const $ = (s, el = document) => el.querySelector(s);
const app = $('#app');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a, n) => shuffle(a).slice(0, n);
const topicOf = (id) => TOPICS.find((t) => t.id === id);
const isPro = (t) => t.track === 'pro';
const stepsOf = (t) => (isPro(t) ? STEPS_PRO : STEPS);

/* ---------- Ngày tháng ---------- */
const pad = (n) => String(n).padStart(2, '0');
const dstr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => dstr(new Date());
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return dstr(d); };

/* ---------- Lưu trữ (localStorage) ---------- */
const KEY = 'beHocTiengAnh.v1';
const defaults = () => ({
  name: '', avatar: '🐶', ownedAvatars: ['🐶', '🐱'],
  points: 0, coins: 0, stars: 0, streak: 0, lastDay: '',
  daily: { date: '', done: 0 }, goal: 3, track: 'kids',
  words: {}, progress: {}, saved: [], badges: [], spoken: 0,
  reminder: { on: false, time: '18:00', lastNotified: '' },
});
let S;
function load() {
  try { S = Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = defaults(); }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* bộ nhớ đầy hoặc bị chặn */ } renderTop(); }
load();

/* ---------- Âm thanh ---------- */
let voice = null;
function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices().filter((v) => /^en[-_]/i.test(v.lang));
  voice = vs.find((v) => /en[-_]US/i.test(v.lang) && /female|samantha|google|zira|aria/i.test(v.name)) || vs.find((v) => /en[-_]US/i.test(v.lang)) || vs[0] || null;
}
if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function say(text, rate = 0.8) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; u.rate = rate; u.pitch = 1.1;
  if (voice) u.voice = voice;
  speechSynthesis.speak(u);
}
let actx;
function sfx(kind) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const seq = { good: [[660, 0], [880, 0.12]], bad: [[220, 0], [180, 0.14]], win: [[523, 0], [659, 0.12], [784, 0.24], [1047, 0.36]] }[kind];
    seq.forEach(([f, t]) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = kind === 'bad' ? 'sawtooth' : 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, actx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.18, actx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + t + 0.2);
      o.connect(g); g.connect(actx.destination); o.start(actx.currentTime + t); o.stop(actx.currentTime + t + 0.22);
    });
  } catch (e) { /* trình duyệt không hỗ trợ */ }
}

/* ---------- Thông báo trong app ---------- */
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.innerHTML = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3500);
}

/* ---------- Ôn tập ngắt quãng (Leitner) ---------- */
const INTERVALS = [0, 1, 2, 4, 7, 14];
function srsTouch(id, ok) {
  const w = S.words[id] || { box: 0, due: today() };
  w.box = ok ? Math.min(5, w.box + 1) : 1;
  w.due = addDays(INTERVALS[w.box]);
  S.words[id] = w;
}
const dueWords = () => ALL_WORDS.filter((w) => S.words[w.id] && S.words[w.id].due <= today());

/* ---------- Điểm thưởng, chuỗi ngày, huy hiệu ---------- */
function checkBadges() {
  const got = [];
  const has = (id) => S.badges.includes(id);
  const give = (id, cond) => { if (cond && !has(id)) { S.badges.push(id); got.push(BADGES.find((b) => b.id === id)); } };
  const done = Object.keys(S.progress).length > 0;
  give('first', done);
  give('streak3', S.streak >= 3); give('streak7', S.streak >= 7);
  give('points100', S.points >= 100); give('points500', S.points >= 500);
  give('stars10', S.stars >= 10); give('speaker', S.spoken >= 10);
  give('saver', S.saved.length >= 5);
  give('master', TOPICS.some((t) => stepsOf(t).every((s) => ((S.progress[t.id] || {})[s.key] || 0) >= 1)));
  return got;
}
function award({ topicId, stepKey, points, stars }) {
  const first = topicId && !((S.progress[topicId] || {})[stepKey] > 0) && stars > 0;
  if (first) points += 20;
  if (topicId) {
    const p = (S.progress[topicId] = S.progress[topicId] || {});
    const prev = p[stepKey] || 0;
    if (stars > prev) { S.stars += stars - prev; p[stepKey] = stars; }
  }
  S.points += points; S.coins += points;
  if (S.lastDay !== today()) { S.streak = S.lastDay === addDays(-1) ? S.streak + 1 : 1; S.lastDay = today(); }
  if (S.daily.date !== today()) S.daily = { date: today(), done: 0 };
  S.daily.done++;
  const badges = checkBadges();
  save();
  return { points, badges, first };
}
const dailyDone = () => (S.daily.date === today() ? S.daily.done : 0);
const starsFor = (c, t) => { const r = c / t; return r >= 0.9 ? 3 : r >= 0.7 ? 2 : r >= 0.4 ? 1 : 0; };
const level = () => Math.floor(S.points / 100) + 1;

/* ---------- Khung giao diện ---------- */
function renderTop() {
  const el = $('#top');
  if (!S.name) { el.innerHTML = ''; return; }
  el.innerHTML = `<a class="who" href="#/rewards"><span class="av">${S.avatar}</span><span><b>${esc(S.name)}</b><small>Cấp ${level()}</small></span></a>
    <div class="stats"><span title="Ngôi sao">⭐ ${S.stars}</span><span title="Xu">🪙 ${S.coins}</span><span title="Chuỗi ngày">🔥 ${S.streak}</span></div>`;
}
function setNav(active) {
  document.querySelectorAll('#nav a').forEach((a) => a.classList.toggle('on', a.dataset.k === active));
  $('#nav').style.display = S.name && active !== 'hide' ? '' : 'none';
}
const stars3 = (n) => '★★★'.slice(0, n) + '☆☆☆'.slice(0, 3 - n);
const view = (html, nav = 'home') => { app.innerHTML = html; setNav(nav); window.scrollTo(0, 0); };
const back = (href, label = '← Quay lại') => `<a class="back" href="${href}">${label}</a>`;

let cleanup = null; // dọn dẹp khi rời màn hình (ví dụ tắt micro)

/* ---------- Màn chào lần đầu ---------- */
function viewWelcome() {
  let av = '🐶';
  view(`<section class="card center welcome">
    <div class="big">👋</div><h1>Chào bạn nhỏ!</h1>
    <p>Mình cùng học tiếng Anh mà chơi nhé. Bạn tên là gì?</p>
    <input id="nm" class="input" maxlength="16" placeholder="Nhập tên của bạn" autocomplete="off">
    <p class="muted">Chọn bạn đồng hành:</p>
    <div class="avs">${['🐶', '🐱'].map((e) => `<button class="avbtn ${e === av ? 'sel' : ''}" data-e="${e}">${e}</button>`).join('')}</div>
    <button class="btn" id="go">Bắt đầu học! 🚀</button></section>`, 'hide');
  app.querySelectorAll('.avbtn').forEach((b) => b.onclick = () => { av = b.dataset.e; app.querySelectorAll('.avbtn').forEach((x) => x.classList.toggle('sel', x === b)); });
  $('#go').onclick = () => {
    const n = $('#nm').value.trim();
    if (!n) { $('#nm').focus(); return; }
    S.name = n; S.avatar = av; save(); say('Hello ' + n + '!'); location.hash = '#/';
  };
}

/* ---------- Trang chủ ---------- */
function viewHome() {
  const due = dueWords().length, done = dailyDone(), goal = S.goal, pro = S.track === 'pro';
  const pct = Math.min(100, Math.round((done / goal) * 100));
  view(`<div class="tabs"><button data-t="kids" class="${pro ? '' : 'on'}">🧒 Bé học</button><button data-t="pro" class="${pro ? 'on' : ''}">💼 Người đi làm</button></div>
    <section class="hero">
      <div><h1>Xin chào, ${esc(S.name)}! ${S.avatar}</h1>
      <p>${done >= goal ? 'Giỏi quá! Hôm nay bạn đã hoàn thành mục tiêu 🎉' : pro ? 'Luyện tiếng Anh công việc 10 phút mỗi ngày nhé!' : 'Hôm nay mình học một chút nhé!'}</p></div>
    </section>
    <section class="card goal"><div class="row"><b>🎯 Mục tiêu hôm nay</b><span>${Math.min(done, goal)}/${goal} bài</span></div>
      <div class="bar"><i style="width:${pct}%"></i></div></section>
    ${due ? `<a class="card review" href="#/review"><span class="big">🔁</span><span><b>Ôn tập hôm nay</b><small>${due} từ đang chờ bạn nhớ lại</small></span><span class="go">›</span></a>` : ''}
    <h2>${pro ? 'Chọn chuyên ngành' : 'Chọn chủ đề'}</h2>
    <div class="grid">${TOPICS.filter((t) => isPro(t) === pro).map((t) => {
      const p = S.progress[t.id] || {}, st = stepsOf(t); const got = st.reduce((a, s) => a + (p[s.key] || 0), 0);
      return `<a class="topic" style="--c:${t.color}" href="#/topic/${t.id}"><span class="em">${t.emoji}</span><b>${t.name}</b>
        <div class="bar sm"><i style="width:${Math.round((got / (st.length * 3)) * 100)}%"></i></div><small>⭐ ${got}/${st.length * 3}</small></a>`;
    }).join('')}</div>`, 'home');
  app.querySelectorAll('.tabs button').forEach((b) => b.onclick = () => { S.track = b.dataset.t; save(); viewHome(); });
}

/* ---------- Trang chủ đề ---------- */
function viewTopic(id) {
  const t = topicOf(id); if (!t) return (location.hash = '#/');
  const p = S.progress[id] || {}, steps = stepsOf(t), pro = isPro(t);
  if (S.track !== t.track) { S.track = t.track || 'kids'; save(); }
  view(`${back('#/')}
    <section class="topichead" style="--c:${t.color}"><span class="big">${t.emoji}</span><div><h1>${t.name}</h1><p>${t.words.length} ${pro ? 'thuật ngữ' : 'từ vựng'} • ${pro ? `${t.phrases.length} mẫu câu • ${t.dialogs.length} tình huống • 1 email` : '1 bài đọc'}</p></div></section>
    <div class="steps">${steps.map((s, i) => `<a class="step" style="--c:${t.color}" href="#/${s.key}/${id}">
      <span class="num">${i + 1}</span><span class="em">${s.emoji}</span><span class="txt"><b>${s.name}</b><small>${s.desc}</small></span>
      <span class="st">${stars3(p[s.key] || 0)}</span></a>`).join('')}</div>
    <h2>${pro ? 'Thuật ngữ trong chuyên ngành' : 'Từ vựng trong chủ đề'}</h2>
    <div class="wordlist">${t.words.map(wordRow).join('')}</div>
    ${pro ? `<h2>Mẫu câu thường dùng</h2><div class="wordlist">${t.phrases.map((ph) => `<div class="wrow"><span class="txt"><b>${ph.en}</b><small>${ph.vi}</small></span><button class="ibtn" data-say="${esc(ph.en)}" aria-label="Nghe">🔊</button></div>`).join('')}</div>` : ''}`, 'home');
  bindWordRows();
}
function wordRow(w) {
  return `<div class="wrow"><span class="em">${w.emoji}</span><span class="txt"><b>${w.en}</b><small>${w.vi}</small></span>
    <button class="ibtn" data-say="${esc(w.en)}" aria-label="Nghe">🔊</button>
    <button class="ibtn ${S.saved.includes(w.id) ? 'on' : ''}" data-save="${w.id}" aria-label="Lưu">${S.saved.includes(w.id) ? '❤️' : '🤍'}</button></div>`;
}
function bindWordRows() {
  app.querySelectorAll('[data-say]').forEach((b) => b.onclick = () => say(b.dataset.say));
  app.querySelectorAll('[data-save]').forEach((b) => b.onclick = () => { toggleSave(b.dataset.save); const on = S.saved.includes(b.dataset.save); b.textContent = on ? '❤️' : '🤍'; b.classList.toggle('on', on); });
}
function toggleSave(id) {
  const i = S.saved.indexOf(id);
  if (i >= 0) S.saved.splice(i, 1); else S.saved.push(id);
  const nb = checkBadges(); save(); nb.forEach(badgeToast);
}
const badgeToast = (b) => toast(`🎉 Huy hiệu mới: <b>${b.e} ${b.name}</b>`);

/* ---------- Kết quả chung ---------- */
function finish({ topicId, stepKey, correct, total, again, extraPoints = 0, title }) {
  const stars = starsFor(correct, total);
  const r = award({ topicId, stepKey, points: correct * 5 + stars * 5 + extraPoints, stars });
  sfx(stars ? 'win' : 'bad');
  const msg = ['Cố gắng lần sau nhé! 💪', 'Khá lắm! 👍', 'Tuyệt vời! 🌟', 'Xuất sắc! 🏆'][stars];
  view(`<section class="card center result"><div class="big pop">${stars === 3 ? '🏆' : stars ? '🎉' : '🌈'}</div>
    <h1>${msg}</h1><p>${title || ''}</p>
    <div class="stars">${[1, 2, 3].map((i) => `<span class="${i <= stars ? 'on' : ''}" style="animation-delay:${i * 0.2}s">★</span>`).join('')}</div>
    <p>Đúng <b>${correct}/${total}</b></p>
    <div class="reward">+${r.points} 🪙 điểm thưởng${r.first ? ' <small>(đã gồm +20 lần đầu)</small>' : ''}</div>
    ${r.badges.map((b) => `<div class="newbadge">${b.e} Huy hiệu mới: <b>${b.name}</b></div>`).join('')}
    <div class="actions"><button class="btn ghost" id="again">Làm lại 🔄</button>
    <a class="btn" href="${topicId ? '#/topic/' + topicId : '#/'}">Tiếp tục ➜</a></div></section>`, 'hide');
  $('#again').onclick = again;
}

/* ---------- Bộ câu hỏi trắc nghiệm dùng chung ---------- */
function distract(word, n, sameTopic = true) {
  const pool = ALL_WORDS.filter((w) => w.id !== word.id && (!sameTopic || w.topic === word.topic));
  const tp = isPro(topicOf(word.topic));
  const extra = ALL_WORDS.filter((w) => w.id !== word.id && !pool.includes(w) && isPro(topicOf(w.topic)) === tp);
  return pick(pool, n).concat(pick(extra, Math.max(0, n - pool.length)));
}
const Q = {
  listen: (w) => ({ word: w, speak: w.en, prompt: '<button class="speakbig" data-sp>🔊</button><p>Nghe và chọn hình đúng</p>',
    opts: shuffle([w, ...distract(w, 3)]).map((x) => ({ html: `<span class="oe">${x.emoji}</span>`, ok: x.id === w.id })), grid: true }),
  emoji: (w) => ({ word: w, prompt: `<div class="qe">${w.emoji}</div><p>Đây là gì?</p>`,
    opts: shuffle([w, ...distract(w, 3)]).map((x) => ({ html: x.en, ok: x.id === w.id })) }),
  vi: (w) => ({ word: w, speak: w.en, prompt: `<div class="qw">${w.en} <button class="ibtn" data-sp>🔊</button></div><p>Nghĩa của từ này là gì?</p>`,
    opts: shuffle([w, ...distract(w, 3)]).map((x) => ({ html: x.vi, ok: x.id === w.id })) }),
  en: (w) => ({ word: w, prompt: `<div class="qw">${w.vi}</div><p>Từ tiếng Anh là gì?</p>`,
    opts: shuffle([w, ...distract(w, 3)]).map((x) => ({ html: x.en, ok: x.id === w.id })) }),
};
Q.listenVi = (w) => ({ word: w, speak: w.en, prompt: '<button class="speakbig" data-sp>🔊</button><p>Nghe và chọn nghĩa đúng</p>',
  opts: shuffle([w, ...distract(w, 3)]).map((x) => ({ html: x.vi, ok: x.id === w.id })) });
Q.blank = (w) => {
  const re = new RegExp(w.en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  if (!re.test(w.ex)) return Q.en(w);
  return { word: w, speak: w.ex, prompt: `<div class="qw sm">${w.ex.replace(re, '_____')}</div><p>${w.exVi}</p>`,
    opts: shuffle([w, ...distract(w, 3)]).map((x) => ({ html: x.en, ok: x.id === w.id })) };
};
Q.phrase = (ph, t) => ({ speak: ph.en, long: true, prompt: '<button class="speakbig" data-sp>🔊</button><p>Nghe câu và chọn nghĩa đúng</p>',
  opts: shuffle([ph, ...pick(t.phrases.filter((x) => x !== ph), 3)]).map((x) => ({ html: x.vi, ok: x === ph })) });
Q.dialog = (d) => {
  const last = d.lines[d.lines.length - 1][1];
  return { speak: last, say: d.o[d.a], why: d.why, long: true,
    prompt: `<div class="scene">🎬 ${d.scene}</div><div class="chat">${d.lines.map((l) => `<div class="bub"><b>${l[0]}</b>${l[1]}</div>`).join('')}</div><p>Bạn trả lời thế nào?</p>`,
    opts: shuffle(d.o.map((x, k) => ({ html: x, ok: k === d.a }))) };
};
function mixedQuestions(words, n) {
  const kids = ['listen', 'emoji', 'vi', 'en'], pro = ['listenVi', 'vi', 'blank', 'en'];
  return shuffle(words).slice(0, n).map((w, i) => { const k = isPro(topicOf(w.topic)) ? pro : kids; return Q[k[i % k.length]](w); });
}

function runQuiz({ questions, topicId, stepKey, title, again, srs = true }) {
  let i = 0, correct = 0;
  const show = () => {
    const q = questions[i];
    view(`<div class="quizhead"><a class="x" href="${topicId ? '#/topic/' + topicId : '#/'}">✕</a>
      <div class="bar"><i style="width:${(i / questions.length) * 100}%"></i></div><span>${i + 1}/${questions.length}</span></div>
      <section class="card center q"><div class="prompt">${q.prompt}</div>
      <div class="opts ${q.grid ? 'grid2' : ''} ${q.long ? 'long' : ''}">${q.opts.map((o, k) => `<button class="opt" data-k="${k}">${o.html}</button>`).join('')}</div>
      <div class="fb" id="fb"></div></section>`, 'hide');
    app.querySelectorAll('[data-sp]').forEach((b) => b.onclick = () => say(q.speak));
    if (q.speak) setTimeout(() => say(q.speak), 350);
    app.querySelectorAll('.opt').forEach((b) => b.onclick = () => {
      const o = q.opts[+b.dataset.k];
      app.querySelectorAll('.opt').forEach((x, k) => { x.disabled = true; if (q.opts[k].ok) x.classList.add('right'); });
      if (!o.ok) b.classList.add('wrong'); else correct++;
      if (srs && q.word) srsTouch(q.word.id, o.ok);
      sfx(o.ok ? 'good' : 'bad');
      const sp = q.word ? q.word.en : q.say; if (sp) say(sp);
      $('#fb').innerHTML = `<div class="${o.ok ? 'ok' : 'no'}">${o.ok ? 'Đúng rồi! 🎉' : 'Chưa đúng, cố lên! 💪'}${q.word ? `<small>${q.word.emoji} ${q.word.en} = ${q.word.vi}</small>` : ''}${q.why ? `<small>💡 ${q.why}</small>` : ''}</div>
        <button class="btn" id="nx">${i + 1 < questions.length ? 'Tiếp tục ➜' : 'Xem kết quả 🏁'}</button>`;
      $('#nx').onclick = () => { i++; if (i < questions.length) show(); else { save(); finish({ topicId, stepKey, correct, total: questions.length, again, title }); } };
    });
  };
  show();
}

/* ---------- Bước 1: Học từ mới (thẻ ghi nhớ) ---------- */
function viewLearn(id) {
  const t = topicOf(id); let i = 0, revealed = false;
  const show = () => {
    const w = t.words[i];
    view(`<div class="quizhead"><a class="x" href="#/topic/${id}">✕</a><div class="bar"><i style="width:${(i / t.words.length) * 100}%"></i></div><span>${i + 1}/${t.words.length}</span></div>
      <section class="card center flash" style="--c:${t.color}">
        <button class="ibtn heart ${S.saved.includes(w.id) ? 'on' : ''}" id="sv">${S.saved.includes(w.id) ? '❤️' : '🤍'}</button>
        <div class="fe">${w.emoji}</div><div class="fw ${w.en.length > 12 ? 'sm' : ''}">${w.en}</div>
        <div class="row c"><button class="btn small" id="sp">🔊 Nghe</button><button class="btn small ghost" id="sl">🐢 Chậm</button></div>
        <div id="more" class="more">${revealed ? moreHtml(w) : '<button class="btn ghost" id="rv">Xem nghĩa 👀</button>'}</div></section>
      <div class="actions"><button class="btn ghost" id="pv" ${i === 0 ? 'disabled' : ''}>← Trước</button><button class="btn" id="nx">${i + 1 < t.words.length ? 'Từ tiếp ➜' : 'Hoàn thành 🏁'}</button></div>`, 'hide');
    const hear = () => say(w.en);
    $('#sp').onclick = hear; $('#sl').onclick = () => say(w.en, 0.4);
    $('#sv').onclick = (e) => { toggleSave(w.id); const on = S.saved.includes(w.id); e.target.textContent = on ? '❤️' : '🤍'; e.target.classList.toggle('on', on); };
    const rv = $('#rv'); if (rv) rv.onclick = () => { revealed = true; $('#more').innerHTML = moreHtml(w); bindEx(w); };
    if (revealed) bindEx(w);
    $('#pv').onclick = () => { i--; revealed = false; show(); };
    $('#nx').onclick = () => {
      if (!S.words[w.id]) S.words[w.id] = { box: 1, due: addDays(1) };
      revealed = false; i++;
      if (i < t.words.length) show(); else { save(); finish({ topicId: id, stepKey: 'learn', correct: t.words.length, total: t.words.length, title: isPro(t) ? 'Bạn đã học xong thuật ngữ!' : 'Bạn đã học xong từ mới!', again: () => viewLearn(id) }); }
    };
    setTimeout(hear, 300);
  };
  const moreHtml = (w) => `<div class="vi">${w.vi}</div><button class="ex" data-ex>“${w.ex}” 🔊<small>${w.exVi}</small></button>`;
  const bindEx = (w) => { const b = $('[data-ex]'); if (b) b.onclick = () => say(w.ex, 0.75); };
  show();
}

/* ---------- Bước 2: Luyện nghe ---------- */
function viewListen(id) {
  const t = topicOf(id);
  const qs = () => (isPro(t) ? shuffle(shuffle(t.words).slice(0, 6).map(Q.listenVi).concat(shuffle(t.phrases).slice(0, 4).map((ph) => Q.phrase(ph, t)))) : shuffle(t.words).map(Q.listen));
  const go = () => runQuiz({ questions: qs(), topicId: id, stepKey: 'listen', title: 'Luyện nghe: ' + t.name, again: go });
  go();
}

/* ---------- Bước 3: Luyện phát âm ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const norm = (s) => s.toLowerCase().replace(/[^a-z ]/g, '').trim();
const toks = (s) => norm(s).split(/\s+/).filter(Boolean);
function matches(alts, target) {
  const tt = toks(target);
  if (tt.length === 1) return alts.some((a) => toks(a).includes(tt[0]));
  return alts.some((a) => { const at = new Set(toks(a)); return tt.filter((x) => at.has(x)).length / tt.length >= 0.75; });
}
function viewSpeak(id) {
  const t = topicOf(id), items = isPro(t) ? t.phrases : t.words, phr = isPro(t); let i = 0, ok = 0, tries = 0, rec = null;
  cleanup = () => { try { rec && rec.abort(); } catch (e) { /* bỏ qua */ } };
  const next = () => { i++; tries = 0; if (i < items.length) show(); else { save(); finish({ topicId: id, stepKey: 'speak', correct: ok, total: items.length, title: 'Luyện phát âm: ' + t.name, again: () => viewSpeak(id) }); } };
  const show = () => {
    const w = items[i];
    view(`<div class="quizhead"><a class="x" href="#/topic/${id}">✕</a><div class="bar"><i style="width:${(i / items.length) * 100}%"></i></div><span>${i + 1}/${items.length}</span></div>
      <section class="card center flash" style="--c:${t.color}"><div class="fe">${phr ? '🗣️' : w.emoji}</div><div class="fw ${phr ? 'phrase' : ''}">${w.en}</div><div class="muted">${w.vi}</div>
      <div class="row c"><button class="btn small" id="sp">🔊 Nghe mẫu</button></div>
      <div class="micwrap">${SR ? '<button class="mic" id="mic" aria-label="Nói">🎤</button><p id="ms">Bấm micro rồi nói to ' + (phr ? 'cả câu' : 'từ') + ' này nhé!</p>'
        : '<p class="muted">Trình duyệt này chưa hỗ trợ nhận diện giọng nói (hãy dùng Chrome hoặc Safari để chấm điểm tự động). Bạn nghe mẫu rồi tự nói theo nhé!</p><button class="btn" id="self">Mình nói xong rồi ✅</button>'}</div>
      <div id="fb" class="fb"></div></section>
      <div class="actions"><button class="btn ghost" id="skip">Bỏ qua</button></div>`, 'hide');
    const done = (good, text) => {
      if (good) { ok++; S.spoken++; sfx('good'); } else sfx('bad');
      $('#fb').innerHTML = `<div class="${good ? 'ok' : 'no'}">${text}</div><button class="btn" id="nx">${i + 1 < items.length ? 'Tiếp ➜' : 'Xem kết quả 🏁'}</button>`;
      $('#nx').onclick = next; const m = $('.micwrap'); if (m) m.style.display = 'none';
    };
    $('#sp').onclick = () => say(w.en, 0.7); setTimeout(() => say(w.en, 0.7), 300);
    $('#skip').onclick = next;
    if (!SR) { $('#self').onclick = () => done(true, 'Giỏi lắm! 🎉'); return; }
    $('#mic').onclick = () => {
      const mic = $('#mic'), ms = $('#ms');
      speechSynthesis.cancel();
      rec = new SR(); rec.lang = 'en-US'; rec.maxAlternatives = 5; rec.interimResults = false;
      mic.classList.add('live'); ms.textContent = 'Đang nghe bạn nói…';
      rec.onresult = (e) => {
        const alts = Array.from(e.results[0]).map((a) => norm(a.transcript));
        const hit = matches(alts, w.en);
        if (hit) done(true, 'Phát âm rất tốt! 🎉');
        else { tries++; ms.textContent = `Mình nghe được: “${alts[0] || '…'}”. ${tries >= 2 ? '' : 'Thử lại nhé!'}`; if (tries >= 2) done(false, `Không sao! ${phr ? 'Câu' : 'Từ'} đúng là “${w.en}”. Lần sau sẽ tốt hơn 💪`); }
      };
      rec.onerror = (e) => { ms.textContent = e.error === 'not-allowed' ? 'Hãy cho phép dùng micro để luyện nói nhé.' : 'Mình chưa nghe rõ, thử lại nhé!'; };
      rec.onend = () => mic.classList.remove('live');
      try { rec.start(); } catch (e) { /* đang chạy */ }
    };
  };
  show();
}

/* ---------- Bước 4: Đọc hiểu ---------- */
function viewRead(id) {
  const t = topicOf(id), r = t.reading; let showVi = false;
  view(`${back('#/topic/' + id)}
    <section class="card read"><h1>${isPro(t) ? '📧' : '📖'} ${r.title}</h1>
      <div class="row"><button class="btn small" id="all">🔊 Nghe cả bài</button><button class="btn small ghost" id="tr">🇻🇳 Dịch</button></div>
      <p class="tip">Chạm vào từng câu để nghe nhé!</p>
      <div class="passage">${r.text.map((s, k) => `<button class="sent" data-k="${k}">${s}</button>`).join(' ')}</div>
      <div class="trans" id="vi" hidden>${r.vi}</div>
      <button class="btn" id="qs">Trả lời câu hỏi ➜</button></section>`, 'home');
  app.querySelectorAll('.sent').forEach((b) => b.onclick = () => say(r.text[+b.dataset.k], 0.75));
  $('#all').onclick = () => say(r.text.join(' '), 0.75);
  $('#tr').onclick = () => { showVi = !showVi; $('#vi').hidden = !showVi; };
  $('#qs').onclick = () => {
    const go = () => runQuiz({ srs: false, topicId: id, stepKey: 'read', title: 'Đọc hiểu: ' + r.title, again: () => viewRead(id),
      questions: r.qs.map((q) => ({ speak: null, prompt: `<div class="qw sm">${q.q}</div>`, opts: shuffle(q.o.map((x, k) => ({ html: x, ok: k === q.a }))) })) });
    go();
  };
}

/* ---------- Hội thoại tình huống (người đi làm) ---------- */
function viewDialog(id) {
  const t = topicOf(id);
  const go = () => runQuiz({ srs: false, questions: shuffle(t.dialogs).map(Q.dialog), topicId: id, stepKey: 'dialog', title: 'Hội thoại: ' + t.name, again: go });
  go();
}

/* ---------- Bài kiểm tra ---------- */
function viewTest(id) {
  const t = topicOf(id);
  const build = () => (isPro(t)
    ? shuffle(mixedQuestions(t.words, 6).concat(shuffle(t.dialogs).slice(0, 4).map(Q.dialog)))
    : mixedQuestions(t.words.concat(t.words), 10));
  const go = () => runQuiz({ questions: build(), topicId: id, stepKey: 'test', title: 'Kiểm tra: ' + t.name, again: go });
  go();
}

/* ---------- Ôn tập hằng ngày ---------- */
function viewReview() {
  const due = dueWords();
  if (!due.length) {
    const learned = Object.keys(S.words).length;
    return view(`<section class="card center"><div class="big">✅</div><h1>Hôm nay không có từ cần ôn!</h1>
      <p>${learned ? 'Bạn đã nhớ hết các từ đến hạn rồi. Giỏi lắm!' : 'Hãy học vài từ mới ở một chủ đề, rồi quay lại đây ôn tập nhé.'}</p><a class="btn" href="#/">Về trang chủ</a></section>`, 'review');
  }
  const go = () => runQuiz({ questions: mixedQuestions(due, Math.min(10, due.length)), title: `Ôn tập ${Math.min(10, due.length)} từ`, again: viewReview });
  view(`<section class="card center"><div class="big">🔁</div><h1>Ôn tập hôm nay</h1><p>Có <b>${due.length}</b> từ cần ôn. Ôn đều mỗi ngày giúp bạn nhớ lâu hơn!</p>
    <button class="btn" id="st">Bắt đầu ôn ➜</button></section>`, 'review');
  $('#st').onclick = go;
}

/* ---------- Từ đã lưu ---------- */
function viewSaved() {
  const ws = S.saved.map((id) => ALL_WORDS.find((w) => w.id === id)).filter(Boolean);
  view(`<h1>💾 Từ đã lưu</h1>${ws.length ? `<button class="btn" id="pl">🔁 Luyện các từ đã lưu</button><div class="wordlist">${ws.map(wordRow).join('')}</div>`
    : '<section class="card center"><div class="big">🤍</div><p>Chưa có từ nào. Bấm trái tim ở từ bạn thích để lưu lại và lặp lại bất cứ lúc nào.</p></section>'}`, 'saved');
  bindWordRows();
  const pl = $('#pl');
  if (pl) pl.onclick = () => { const go = () => runQuiz({ questions: mixedQuestions(ws, Math.min(10, Math.max(4, ws.length))), title: 'Luyện từ đã lưu', again: go }); go(); };
}

/* ---------- Phần thưởng ---------- */
function viewRewards() {
  const nextLv = 100 - (S.points % 100);
  view(`<h1>🏆 Phần thưởng</h1>
    <section class="card center"><div class="av big">${S.avatar}</div><h2>${esc(S.name)} • Cấp ${level()}</h2>
      <div class="bar"><i style="width:${S.points % 100}%"></i></div><small>Còn ${nextLv} điểm nữa để lên cấp ${level() + 1}</small>
      <div class="stat3"><div><b>${S.points}</b><small>Điểm</small></div><div><b>${S.stars}</b><small>Ngôi sao</small></div><div><b>${S.coins}</b><small>Xu 🪙</small></div></div></section>
    <h2>Huy hiệu</h2><div class="badges">${BADGES.map((b) => `<div class="badge ${S.badges.includes(b.id) ? 'got' : ''}"><span>${S.badges.includes(b.id) ? b.e : '🔒'}</span><b>${b.name}</b><small>${b.desc}</small></div>`).join('')}</div>
    <h2>Cửa hàng bạn đồng hành</h2><p class="muted">Dùng xu để mở khoá nhân vật mới.</p>
    <div class="avs">${AVATARS.map((a) => { const own = S.ownedAvatars.includes(a.e); return `<button class="avbtn ${S.avatar === a.e ? 'sel' : ''}" data-e="${a.e}" data-c="${a.cost}">${a.e}<small>${own ? (S.avatar === a.e ? 'Đang dùng' : 'Đã có') : '🪙 ' + a.cost}</small></button>`; }).join('')}</div>`, 'rewards');
  app.querySelectorAll('.avbtn').forEach((b) => b.onclick = () => {
    const e = b.dataset.e, c = +b.dataset.c;
    if (!S.ownedAvatars.includes(e)) {
      if (S.coins < c) return toast('Bạn chưa đủ xu 🪙. Làm thêm bài tập nhé!');
      S.coins -= c; S.ownedAvatars.push(e); sfx('win');
    }
    S.avatar = e; save(); viewRewards();
  });
}

/* ---------- Cài đặt & nhắc nhở ---------- */
function viewSettings() {
  const r = S.reminder, perm = 'Notification' in window ? Notification.permission : 'unsupported';
  view(`<h1>⚙️ Cài đặt</h1>
    <section class="card"><h2>⏰ Nhắc học mỗi ngày</h2>
      <label class="switch"><input type="checkbox" id="ron" ${r.on ? 'checked' : ''}><span>Bật nhắc nhở</span></label>
      <label class="field">Giờ nhắc <input type="time" id="rt" class="input" value="${r.time}"></label>
      <p class="muted">${perm === 'unsupported' ? 'Trình duyệt chưa hỗ trợ thông báo, app vẫn nhắc khi bạn mở lại.' : perm === 'denied' ? 'Thông báo đang bị chặn. Hãy bật lại trong cài đặt trình duyệt.' : 'App sẽ nhắc khi đang mở hoặc đã cài vào màn hình chính.'}</p>
      <div class="row"><button class="btn small ghost" id="test">Thử thông báo</button><button class="btn small ghost" id="ics">📅 Thêm vào lịch điện thoại</button></div>
      <p class="muted">Mẹo: thêm vào lịch (Google/Apple Calendar) để được nhắc hằng ngày ngay cả khi không mở app.</p></section>
    <section class="card"><h2>🎯 Mục tiêu mỗi ngày</h2><div class="avs">${[1, 3, 5].map((n) => `<button class="avbtn goalb ${S.goal === n ? 'sel' : ''}" data-n="${n}">${n}<small>bài</small></button>`).join('')}</div></section>
    <section class="card"><h2>👤 Hồ sơ</h2><label class="field">Tên <input id="nm" class="input" maxlength="16" value="${esc(S.name)}"></label>
      <button class="btn small danger" id="reset">Xoá toàn bộ tiến trình</button></section>`, 'settings');
  const apply = async () => {
    S.reminder.time = $('#rt').value || '18:00';
    S.reminder.on = $('#ron').checked;
    if (S.reminder.on && 'Notification' in window && Notification.permission === 'default') await Notification.requestPermission();
    save(); checkReminder();
  };
  $('#ron').onchange = apply; $('#rt').onchange = apply;
  $('#test').onclick = async () => { if ('Notification' in window && Notification.permission === 'default') await Notification.requestPermission(); notify(true); };
  $('#ics').onclick = downloadIcs;
  app.querySelectorAll('.goalb').forEach((b) => b.onclick = () => { S.goal = +b.dataset.n; save(); viewSettings(); });
  $('#nm').onchange = () => { S.name = $('#nm').value.trim() || S.name; save(); };
  $('#reset').onclick = () => { if (confirm('Xoá hết điểm, sao và tiến trình học?')) { localStorage.removeItem(KEY); load(); location.hash = '#/'; location.reload(); } };
}
function downloadIcs() {
  const [h, m] = S.reminder.time.split(':');
  const d = new Date(); const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${h}${m}00`;
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BeHocTiengAnh//VI', 'BEGIN:VEVENT', 'UID:be-hoc-tieng-anh@local',
    `DTSTAMP:${stamp}`, `DTSTART:${stamp}`, 'DURATION:PT15M', 'RRULE:FREQ=DAILY', 'SUMMARY:Đến giờ học tiếng Anh rồi! 🎓',
    'DESCRIPTION:Học 10 phút mỗi ngày để giỏi tiếng Anh nhé!', 'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', 'DESCRIPTION:Học tiếng Anh nào!', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'nhac-hoc-tieng-anh.ics'; a.click();
}

/* ---------- Nhắc nhở hằng ngày ---------- */
function notify(force) {
  const title = `Đến giờ học rồi, ${S.name || 'bạn nhỏ'}! 🎓`;
  const body = S.streak ? `Giữ chuỗi ${S.streak} ngày 🔥 nào! Chỉ cần 10 phút thôi.` : 'Mình cùng học vài từ tiếng Anh nhé!';
  toast(`⏰ <b>${title}</b><br>${body}`);
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const opts = { body, icon: 'icon.svg', tag: 'daily' };
  if (navigator.serviceWorker && navigator.serviceWorker.ready) navigator.serviceWorker.ready.then((r) => r.showNotification(title, opts)).catch(() => new Notification(title, opts));
  else new Notification(title, opts);
  if (!force) { S.reminder.lastNotified = today(); save(); }
}
function checkReminder() {
  const r = S.reminder;
  if (!S.name || !r.on || r.lastNotified === today() || S.lastDay === today()) return;
  const now = new Date();
  if (`${pad(now.getHours())}:${pad(now.getMinutes())}` >= r.time) { notify(false); if (!('Notification' in window) || Notification.permission !== 'granted') { r.lastNotified = today(); save(); } }
}

/* ---------- Điều hướng ---------- */
const routes = {
  '': viewHome, topic: viewTopic, learn: viewLearn, listen: viewListen, speak: viewSpeak,
  read: viewRead, dialog: viewDialog, test: viewTest, review: viewReview, saved: viewSaved, rewards: viewRewards, settings: viewSettings,
};
function route() {
  if (cleanup) { cleanup(); cleanup = null; }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  if (!S.name) return viewWelcome();
  const [name = '', arg] = location.hash.replace(/^#\/?/, '').split('/');
  if (arg && !topicOf(arg)) return (location.hash = '#/');
  (routes[name] || viewHome)(arg);
}
window.addEventListener('hashchange', route);
document.addEventListener('visibilitychange', () => { if (!document.hidden) checkReminder(); });
setInterval(checkReminder, 30000);
renderTop(); route(); setTimeout(checkReminder, 1500);

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
