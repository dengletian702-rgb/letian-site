// The live layer: stickers you can peel and flip, a kaomoji that watches the cursor, the giant name that
// shies away from it, screens that scroll themselves, the tape that speeds up with you, and three city clocks.
// The page reads complete without it; the clocks fall back to written UTC offsets.
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // ---- clocks ----
  const zones = $$('.zone');
  const nowLine = document.querySelector('[data-nowline]');
  const tip = document.querySelector('[data-tip]');
  const time = (tz) => new Intl.DateTimeFormat('zh-CN', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());
  const hour = (tz) => +new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: 'numeric', hourCycle: 'h23' }).format(new Date());
  const names = { 'Asia/Shanghai': '北京', 'Australia/Sydney': '悉尼', 'Pacific/Auckland': '奥克兰' };
  const tick = () => {
    zones.forEach((el) => {
      const tz = el.dataset.tz, h = hour(tz), day = h >= 8 && h < 22;
      el.querySelector('.clock').textContent = time(tz);
      const here = el.classList.contains('here');
      const k = day ? '(・∀・)' : '(－_－) zzZ';
      const say = here ? '你也在这边，打这个是本地电话。' + (day ? '现在是白天' : '现在是夜里，先发微信吧') : (day ? '那边是白天' : '那边是夜里，先发微信吧');
      el.querySelector('.state').innerHTML = `${say} <span class="kao" aria-hidden="true">${k}</span>`;
    });
    if (nowLine) nowLine.textContent = '此刻 ' + Object.entries(names).map(([tz, n]) => `${n} ${time(tz)}`).join(' · ');
  };
  const mine = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const region = /^(Asia\/(Shanghai|Chongqing|Chungking|Harbin|Urumqi|Kashgar)|PRC)$/.test(mine) ? 'cn'
    : /^Australia\//.test(mine) ? 'au'
    : /^(Pacific\/(Auckland|Chatham)|NZ)$/.test(mine) ? 'nz' : '';
  const match = zones.find((z) => z.dataset.cc === region);
  if (match) match.classList.add('here');
  else if (tip) tip.textContent = '都通到我本人。你不在这三地的话，微信或 WhatsApp 最省事。';
  tick();
  setInterval(tick, 15000);

  // ---- reveals ----
  $$('.lineup tr').forEach((tr, i) => tr.style.setProperty('--d', `${(i % 9) * 0.08}s`));
  const items = $$('.case, .lineup tr, [data-story], [data-reveal]');
  const showAll = () => {
    items.forEach((el) => el.classList.add('in'));
    $$('[data-scrub]').forEach((el) => el.style.setProperty('--p', 1));
  };
  if (!('IntersectionObserver' in window) || still) showAll();
  else {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    }), { rootMargin: '0px 0px -12% 0px' });
    items.forEach((el) => io.observe(el));
    addEventListener('scroll', () => { if (innerHeight + scrollY >= root.scrollHeight - 4) showAll(); }, { passive: true });
  }
  addEventListener('beforeprint', showAll);

  // ---- the screenshots scroll by themselves whenever their stage is on screen, and rest when it is not ----
  const stages = [...new Set($$('.roll, .pan').map((img) => img.closest('.stage')))].filter(Boolean);
  if (!('IntersectionObserver' in window)) stages.forEach((st) => st.classList.add('play'));
  else {
    const playing = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('play', e.isIntersecting)));
    stages.forEach((st) => playing.observe(st));
  }
  window.__showAll = showAll; // the capture script calls this

  // ---- the lit sentence ----
  const lit = $$('[data-run] .nm');
  if (lit.length) {
    let j = 0;
    lit[0].classList.add('lit');
    if (!still) setInterval(() => { lit[j].classList.remove('lit'); j = (j + 1) % lit.length; lit[j].classList.add('lit'); }, 1800);
  }

  // ---- faces: eyes follow the pointer, moods follow what you do ----
  const faces = $$('[data-face]');
  const moods = { normal: ['•', 'ᴗ', '•'], blink: ['－', 'ᴗ', '－'], happy: ['^', '▽', '^'], sleepy: ['－', '_', '－'], wow: ['⊙', 'o', '⊙'], focus: ['ò', 'ㅂ', 'ó'] };
  const setMood = (face, m) => {
    if (face.dataset.mood === m) return;
    face.dataset.mood = m;
    const [l, mo, r] = moods[m];
    const eyes = face.querySelectorAll('.eye');
    if (!eyes.length) return; // the drawn faces read data-mood in CSS
    eyes[0].textContent = l; eyes[1].textContent = r;
    face.querySelector('.mo').textContent = mo;
  };
  faces.forEach((f) => setMood(f, 'normal'));
  let hold = 0, idleT = 0;
  const base = () => (Date.now() < hold ? null : 'normal');
  const all = (m, ms = 0) => { if (ms) hold = Date.now() + ms; faces.forEach((f) => setMood(f, m)); };
  const wake = () => {
    clearTimeout(idleT);
    if (faces.some((f) => f.dataset.mood === 'sleepy')) all('normal');
    idleT = setTimeout(() => all('sleepy'), 12000);
  };
  wake();
  if (!still) {
    const blink = () => {
      faces.forEach((f) => { if (f.dataset.mood === 'normal') { setMood(f, 'blink'); setTimeout(() => setMood(f, 'normal'), 150); } });
      setTimeout(blink, 2600 + Math.random() * 3200);
    };
    setTimeout(blink, 2000);
  }
  faces.forEach((f) => f.addEventListener('click', () => {
    all('happy', 1400);
    f.classList.remove('hop'); void f.offsetWidth; f.classList.add('hop');
    setTimeout(() => { if (base()) all('normal'); }, 1450);
  }));
  document.addEventListener('pointerover', (e) => {
    if (Date.now() < hold) return;
    const hot = e.target.closest('a, .btn, .act, .stk, .field button');
    if (faces.some((f) => f.dataset.mood === 'focus')) return;
    all(hot ? 'happy' : 'normal');
  });
  const msg = document.getElementById('msg');
  if (msg) {
    msg.addEventListener('input', () => { all(msg.value ? 'focus' : 'normal'); wake(); });
    msg.addEventListener('blur', () => all(msg.value ? 'happy' : 'normal'));
  }

  // ---- one pointer loop: eyes, the giant name, tilt ----
  const giant = $$('[data-giant] span');
  let px = -1e4, py = -1e4, queued = false;
  const frame = () => {
    queued = false;
    faces.forEach((f) => {
      const r = f.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1, k = Math.min(d / 60, 1) * r.width * 0.022;
      f.style.setProperty('--ex', `${(dx / d) * k}px`);
      f.style.setProperty('--ey', `${(dy / d) * k}px`);
    });
    giant.forEach((s) => {
      const r = s.getBoundingClientRect();
      if (r.bottom < 0) return;
      const dx = r.left + r.width / 2 - px, dy = r.top + r.height / 2 - py;
      const d = Math.hypot(dx, dy) || 1, f = Math.max(0, 1 - d / 360);
      s.style.setProperty('--tx', `${(dx / d) * f * 46}px`);
      s.style.setProperty('--ty', `${(dy / d) * f * 30}px`);
      s.style.setProperty('--tr', `${(dx > 0 ? 1 : -1) * f * 10}deg`);
    });
  };
  if (!still) {
    addEventListener('pointermove', (e) => {
      px = e.clientX; py = e.clientY; wake();
      if (!queued) { queued = true; requestAnimationFrame(frame); }
    }, { passive: true });
  }

  if (fine && !still) {
    $$('[data-tilt]').forEach((st) => {
      st.addEventListener('pointermove', (e) => {
        const r = st.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
        st.style.setProperty('--ry', `${nx * 12}deg`);
        st.style.setProperty('--rx', `${-ny * 8}deg`);
      });
      st.addEventListener('pointerleave', () => { st.style.setProperty('--ry', '0deg'); st.style.setProperty('--rx', '0deg'); });
    });
  }

  // ---- stickers: drag to move, tap to flip ----
  let z = 10;
  $$('.stk').forEach((el) => {
    const label = el.querySelector('span');
    const front = label.innerHTML, back = el.dataset.back;
    let sx = 0, sy = 0, ox = 0, oy = 0, dx = 0, dy = 0, moved = false, down = false, lastX = 0;
    el.setAttribute('aria-pressed', 'false');
    const flip = () => {
      const turned = el.getAttribute('aria-pressed') === 'true';
      const swap = () => { label.innerHTML = turned ? front : back; el.setAttribute('aria-pressed', String(!turned)); };
      if (still || !label.animate) return swap();
      label.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: 130, easing: 'linear' }).onfinish = () => {
        swap();
        label.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 180, easing: 'cubic-bezier(.2,1.6,.4,1)' });
      };
    };
    el.addEventListener('pointerdown', (e) => {
      if (e.button) return;
      down = true; moved = false; sx = e.clientX; sy = e.clientY; ox = dx; oy = dy; lastX = e.clientX;
      el.setPointerCapture(e.pointerId);
      el.style.zIndex = ++z;
    });
    el.addEventListener('pointermove', (e) => {
      if (!down) return;
      const mx = e.clientX - sx, my = e.clientY - sy;
      if (!moved && Math.hypot(mx, my) < 5) return;
      moved = true; el.classList.add('lift');
      dx = ox + mx; dy = oy + my;
      el.style.setProperty('--dx', `${dx}px`);
      el.style.setProperty('--dy', `${dy}px`);
      el.style.setProperty('--sw', `${clamp((e.clientX - lastX) * 1.5, -14, 14)}deg`);
      lastX = e.clientX;
    });
    const up = () => {
      if (!down) return;
      down = false; el.classList.remove('lift'); el.style.setProperty('--sw', '0deg');
      if (!moved) flip();
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
    el.addEventListener('click', (e) => e.preventDefault());
  });

  // ---- 日隙: every print in its case opens in a lightbox ----
  // Without script each print links straight to its picture or clip.
  const lb = document.getElementById('lb');
  const shots = $$('[data-lb]');
  if (lb && lb.showModal && shots.length) {
    const stage = lb.querySelector('[data-lb-stage]');
    const title = lb.querySelector('[data-lb-title]');
    const count = lb.querySelector('[data-lb-count]');
    const sound = lb.querySelector('[data-lb-sound]');
    let k = 0;
    const syncSound = (v) => {
      sound.setAttribute('aria-pressed', String(!v.muted));
      sound.textContent = v.muted ? '开声音' : '静音';
    };
    const show = (i) => {
      k = (i + shots.length) % shots.length;
      const a = shots[k], alt = a.querySelector('img').alt;
      stage.replaceChildren();
      if (a.dataset.lb === 'video') {
        // the clip is only fetched once someone opens it; it starts muted and loops
        const v = document.createElement('video');
        v.muted = true; v.loop = true; v.playsInline = true; v.controls = true; v.preload = 'auto';
        v.setAttribute('playsinline', '');
        v.setAttribute('aria-label', alt);
        v.poster = a.dataset.poster;
        v.src = a.href;
        v.addEventListener('volumechange', () => syncSound(v));
        stage.append(v);
        if (!still) v.play().catch(() => {});
        syncSound(v);
        sound.hidden = false;
      } else {
        const img = new Image();
        img.src = a.href; img.alt = alt; img.width = 1280; img.height = 720;
        stage.append(img);
        sound.hidden = true;
      }
      title.textContent = `${a.dataset.title} · ${a.dataset.kind}`;
      count.textContent = `${k + 1} / ${shots.length}`;
    };
    shots.forEach((a, i) => a.addEventListener('click', (e) => { e.preventDefault(); show(i); lb.showModal(); }));
    lb.querySelector('[data-lb-prev]').addEventListener('click', () => show(k - 1));
    lb.querySelector('[data-lb-next]').addEventListener('click', () => show(k + 1));
    lb.querySelector('[data-lb-close]').addEventListener('click', () => lb.close());
    sound.addEventListener('click', () => {
      const v = stage.querySelector('video');
      if (!v) return;
      v.muted = !v.muted;
      if (!v.muted && v.paused) v.play().catch(() => {});
    });
    lb.addEventListener('keydown', (e) => {
      if (e.target.closest('video')) return; // the player keeps its own arrow keys
      if (e.key === 'ArrowLeft') show(k - 1);
      else if (e.key === 'ArrowRight') show(k + 1);
    });
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); }); // a click on the dark backdrop
    lb.addEventListener('close', () => { stage.replaceChildren(); shots[k].focus(); });
    // swipe left or right on a phone
    let tx = null;
    stage.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (tx === null) return;
      const d = e.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(d) > 50) show(k + (d < 0 ? 1 : -1));
    });
  }

  // ---- scroll: the tape speeds up with you, the four characters grow into place, fast scrolling surprises the face ----
  const track = document.querySelector('[data-tape]');
  const scrubs = $$('[data-scrub]');
  let lastY = scrollY, boost = 0, x = 0, dir = 1, lastT = performance.now(), wowT = 0;
  const scrub = () => {
    scrubs.forEach((el) => {
      const r = el.getBoundingClientRect();
      const p = clamp((innerHeight - r.top) / (innerHeight * 0.55 + r.height * 0.5), 0, 1);
      el.style.setProperty('--p', p.toFixed(3));
    });
  };
  if (!still) {
    addEventListener('scroll', () => {
      const now = performance.now(), dy = scrollY - lastY, dt = Math.max(now - lastT, 1);
      if (dy) dir = dy > 0 ? 1 : -1;
      boost = clamp(boost + Math.abs(dy) * 0.25, 0, 40);
      if (Math.abs(dy / dt) > 3.2 && Date.now() > hold && !faces.some((f) => f.dataset.mood === 'focus')) {
        all('wow', 700); clearTimeout(wowT); wowT = setTimeout(() => all('normal'), 720);
      }
      lastY = scrollY; lastT = now; wake();
      requestAnimationFrame(scrub);
    }, { passive: true });
    scrub();
    if (track) {
      let half = track.scrollWidth / 2, visible = true;
      addEventListener('resize', () => { half = track.scrollWidth / 2; });
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(track);
      const run = () => {
        if (visible && !document.hidden) {
          x -= (0.6 + boost) * dir;
          boost *= 0.92;
          if (x <= -half) x += half;
          if (x > 0) x -= half;
          track.style.transform = `translate3d(${x}px,0,0)`;
        }
        requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
    }
  } else showAll();
})();
