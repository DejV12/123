/* =====================
   APP.JS — v25
   - Burger Creative‑Tim (klasa .is-open + aria, auto‑close)
   - Preloader, smooth anchors, anime hero
   - Dialogi (RODO)
   - i18n: PL/EN z flagami i płynnym przejściem
   - Web3Forms + KONFETTI na CAŁĄ STRONĘ (od headera do dołu dokumentu)
   - Animowane tło (bloby)
   - Scroll‑snap + dotnav + dynamiczne tło + poprawny START
===================== */

// Helpery
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

// 1) Remove no-js class
if (document.documentElement.classList.contains('no-js')) {
  document.documentElement.classList.remove('no-js');
}

// 2) Burger / Drawer (Creative‑Tim like)
(function initBurger(){
  const burger = $('#burger');
  const drawer = $('#drawer');
  if (!burger || !drawer) return;

  const openNav = () => {
    drawer.classList.add('open');
    burger.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
  };
  const closeNav = () => {
    drawer.classList.remove('open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
  };
  const toggle = (e) => {
    e?.stopPropagation?.();
    drawer.classList.contains('open') ? closeNav() : openNav();
  };

  burger.addEventListener('click', toggle);
  // zamknij po kliknięciu w link
  $$('#drawer a').forEach(a => a.addEventListener('click', closeNav));
  // klik poza
  document.addEventListener('click', (e) => {
    if (!drawer.contains(e.target) && !burger.contains(e.target)) closeNav();
  });
  // ESC / Resize
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeNav(); });
  window.addEventListener('resize', closeNav);
})();

// 3) Preloader
window.addEventListener('load', () => {
  const pre = $('#preloader');
  setTimeout(() => pre?.classList.add('hidden'), 350);
});

// 4) Smooth anchors (wewnętrzne #)
(function smoothAnchors(){
  const links = $$('a[href^="#"]');
  links.forEach(link => link.addEventListener('click', (e) => {
    const id = (link.getAttribute('href') || '').slice(1);
    if (!id) return;
    const target = id === 'start' ? $('.hero') : document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }));
})();

// 5) Hero reveal (animejs)
(function heroReveal(){
  if (!window.anime) return;
  const tl = anime.timeline({ easing: 'easeOutQuad', duration: 520 });
  tl.add({ targets: '.hero h1', opacity: [0,1], translateY: [16,0] })
    .add({ targets: '.hero p', opacity: [0,1], translateY: [16,0] }, '-=300')
    .add({ targets: '.hero .btn', opacity: [0,1], translateY: [10,0], delay: anime.stagger(60) }, '-=320')
    .add({ targets: '.photo-card img', opacity: [0,1], scale: [0.98,1] }, '-=420');
})();

// 6) Dialogi (np. RODO)
(function dialogs(){
  const openers = $$('[data-open]');
  openers.forEach(btn => btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-open');
    const dialog = document.getElementById(id);
    dialog?.showModal();
  }));
})();

// 7) Footer rok
(function year(){ const y = $('#year'); if (y) y.textContent = new Date().getFullYear(); })();

// 8) i18n (PL/EN – flag switch)
let currentLang = localStorage.getItem('lang') || 'pl';
let langInit = false;
function applyTranslations(lang){
  if (!window.LANG || !LANG[lang]) return;
  document.documentElement.lang = lang;
  $$('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const t = LANG[lang][key];
    if (typeof t === 'string') el.textContent = t;
  });
  $$('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const t = LANG[lang][key];
    if (typeof t === 'string') el.setAttribute('placeholder', t);
  });
  $$('[data-i18n-attr]').forEach(el => {
    const defs = el.getAttribute('data-i18n-attr').split(',');
    defs.forEach(def => {
      const [attr, key] = def.split(':');
      const t = LANG[lang][key];
      if (t) el.setAttribute(attr, t);
    });
  });
  localStorage.setItem('lang', lang);
}
function setLang(lang){
  const switcher = $('.lang-switch');
  if (switcher) switcher.setAttribute('data-lang', lang);
  $$('.lang-flag').forEach(btn=>{
    btn.classList.toggle('active', btn.dataset.lang === lang);
    btn.setAttribute('aria-checked', String(btn.dataset.lang === lang));
  });
  if (!window.anime || langInit === false){ applyTranslations(lang); langInit = true; return; }
  anime({ targets: ['main','.site-header'], opacity: 0.25, duration: 160, easing: 'easeOutQuad', complete(){
    applyTranslations(lang);
    anime({ targets: ['main','.site-header'], opacity: 1, duration: 220, easing: 'easeOutQuad' });
  }});
}
(function initLangSwitcher(){
  const container = $('.lang-switch');
  if (!container) { applyTranslations(currentLang); return; }
  const plBtn = container.querySelector('.lang-flag[data-lang="pl"]');
  const enBtn = container.querySelector('.lang-flag[data-lang="en"]');
  [plBtn, enBtn].forEach(btn => btn?.addEventListener('click', ()=>{
    currentLang = btn.dataset.lang || 'pl';
    setLang(currentLang);
  }));
  setLang(currentLang);
})();

// 9) Web3Forms + konfetti (po sukcesie)
(function contact(){
  const contactForm = $('#contactForm');
  if (!contactForm) return;
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = contactForm.querySelector('.form-status');
    status.textContent = (LANG[currentLang] && LANG[currentLang]['form.sending']) || 'Wysyłam…';
    const data = new FormData(contactForm);
    const payload = Object.fromEntries(data.entries());
    try{
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success){
        status.textContent = (LANG[currentLang] && LANG[currentLang]['form.success']) || 'Dziękuję! Wiadomość wysłana.';
        contactForm.reset();
        fireConfetti();
      } else {
        status.textContent = (LANG[currentLang] && LANG[currentLang]['form.error']) || 'Coś poszło nie tak. Spróbuj ponownie.';
      }
    }catch(err){
      status.textContent = (LANG[currentLang] && LANG[currentLang]['form.error']) || 'Coś poszło nie tak. Spróbuj ponownie.';
    }
  });
})();

// 10) Animowane tło (delikatne bloby)
(function animatedBG(){
  const canvas = $('#bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dpr;
  const colors = ['#E4DCC9','#D6D2C5','#D6CBB3','#B6AB97','#BCB8A7'];
  const blobs = [];
  const COUNT = 22;
  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = Math.floor(innerWidth * dpr);
    h = canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
  }
  window.addEventListener('resize', resize); resize();
  function rand(a,b){ return Math.random()*(b-a)+a; }
  for (let i=0;i<COUNT;i++){
    blobs.push({ x: rand(0,w), y: rand(0,h), r: rand(40*dpr, 120*dpr), vx: rand(-0.06,0.06), vy: rand(-0.05,0.05), c: colors[i%colors.length], a: rand(0.04,0.08) });
  }
  function step(){
    ctx.clearRect(0,0,w,h); ctx.globalCompositeOperation = 'lighter';
    for (const b of blobs){
      b.x += b.vx; b.y += b.vy;
      if (b.x < -b.r) b.x = w + b.r; if (b.x > w + b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = h + b.r; if (b.y > h + b.r) b.y = -b.r;
      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      grad.addColorStop(0, hexToRgba(b.c, b.a)); grad.addColorStop(1, hexToRgba(b.c, 0));
      ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over'; requestAnimationFrame(step);
  }
  function hexToRgba(hex, a){ const c = hex.replace('#',''); const r = parseInt(c.substring(0,2),16); const g = parseInt(c.substring(2,4),16); const b = parseInt(c.substring(4,6),16); return `rgba(${r},${g},${b},${a})`; }
  step();
})();

// 11) Scroll-snap + dotnav + dynamiczne tło + poprawny START
(function scrollBg(){
  const sections = $$('.snap');
  const dots = $$('.dotnav .dot');
  const setBG = (name)=> document.body.setAttribute('data-bg', name);
  const setActiveDot = (id)=> { dots.forEach(d=> d.classList.toggle('active', (id||'start') === d.getAttribute('data-target'))); };

  // stan początkowy
  const first = sections[0];
  if (first) setBG(first.getAttribute('data-bg') || 'sand');
  setActiveDot('start');
  window.addEventListener('scroll', ()=>{ if (window.scrollY < 40) setActiveDot('start'); }, { passive:true });

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting && entry.intersectionRatio > 0.45){
        const isHero = entry.target.classList.contains('hero');
        const id = isHero ? 'start' : (entry.target.getAttribute('id') || '');
        const name = entry.target.getAttribute('data-bg');
        if (name) setBG(name);
        if (id) setActiveDot(id);
      }
    });
  }, { threshold: [0.45,0.6,0.9], rootMargin: '-68px 0px 0px 0px' });
  sections.forEach(s=> io.observe(s));

  // klik w kropki
  dots.forEach(d=> d.addEventListener('click', (e)=>{
    e.preventDefault();
    const id = d.getAttribute('data-target');
    const t = id === 'start' ? $('.hero') : document.getElementById(id);
    t?.scrollIntoView({ behavior:'smooth', block:'start' });
  }));
})();

// 12) KONFETTI: płótno na CAŁĄ DŁUGOŚĆ STRONY
function fireConfetti(){
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const header = document.querySelector('.site-header');

  // Canvas na całą stronę (od spodu paska do dołu dokumentu)
  function resize(){
    const dpr = Math.min(window.devicePixelRatio||1,2);
    const headerH = (header?.offsetHeight || 66);
    const docH = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      document.documentElement.offsetHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight
    );
    const cssH = Math.max(docH - headerH, 0);
    const cssW = window.innerWidth;

    canvas.style.position = 'absolute';   // ważne: przewija się z dokumentem
    canvas.style.top = headerH + 'px';
    canvas.style.left = '0';
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';

    canvas.width  = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
  }
  resize();

  const dpr = Math.min(window.devicePixelRatio||1,2);
  const colors = ['#D6D2C5','#E4DCC9','#D6CBB3','#B6AB97','#BCB8A7','#ffffff'];
  const pieces = [];
  const COUNT = 140;

  // Start w obrębie aktualnego viewportu (żeby zawsze było widać)
  const viewTop = Math.floor(window.scrollY * dpr);
  const viewH   = Math.floor(window.innerHeight * dpr);
  const spawnTop = Math.max(viewTop - 60*dpr, 0);
  const spawnBottom = Math.min(viewTop + viewH * 0.4, canvas.height);

  // prędkość zależna od wysokości canvasu
  const duration = 2600 + Math.min(2400, canvas.height * 0.45);
  const baseVy = (canvas.height / duration) * 2.4;

  for(let i=0;i<COUNT;i++){
    pieces.push({
      x: Math.random()*canvas.width,
      y: spawnTop + Math.random()*(spawnBottom - spawnTop + 1),
      r: 2 + Math.random()* (4*dpr),
      vx: (-0.8 + Math.random()*1.6)*dpr,
      vy: baseVy * (0.8 + Math.random()*1.3),
      a: 0.9,
      color: colors[i%colors.length],
      tilt: Math.random()*Math.PI
    });
  }

  let start = null;
  function step(ts){
    if(!start) start = ts;
    const t = ts - start;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    pieces.forEach(p=>{
      p.x += p.vx; p.y += p.vy; p.tilt += 0.08;
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(Math.sin(p.tilt)*0.6);
      ctx.fillStyle = p.color; ctx.globalAlpha = p.a;
      ctx.fillRect(-p.r, -p.r, p.r*2, p.r*2);
      ctx.restore();
    });

    if (t < duration) requestAnimationFrame(step);
    else ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  requestAnimationFrame(step);
}

