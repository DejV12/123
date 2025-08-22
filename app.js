// Remove no-js class
if (document.documentElement.classList.contains('no-js')) {
    document.documentElement.classList.remove('no-js');
  }
  
  // Burger / drawer
  const burger = document.getElementById('burger');
  const drawer = document.getElementById('drawer');
  if (burger && drawer) {
    burger.addEventListener('click', () => {
      const open = !drawer.classList.contains('open');
      drawer.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      drawer.setAttribute('aria-hidden', String(!open));
    });
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      drawer.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
    }));
  }
  
  // Preloader
  window.addEventListener('load', () => {
    const pre = document.getElementById('preloader');
    setTimeout(() => pre?.classList.add('hidden'), 350);
  });
  
  // Smooth anchors
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => link.addEventListener('click', (e) => {
    const id = (link.getAttribute('href') || '').slice(1);
    const target = id === 'start' ? document.querySelector('.hero') : document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }));
  
  // Hero reveal (animejs)
  (function heroReveal(){
    if (!window.anime) return;
    const tl = anime.timeline({ easing: 'easeOutQuad', duration: 520 });
    tl.add({ targets: '.hero h1', opacity: [0,1], translateY: [16,0] })
      .add({ targets: '.hero p', opacity: [0,1], translateY: [16,0] }, '-=300')
      .add({ targets: '.hero .btn', opacity: [0,1], translateY: [10,0], delay: anime.stagger(60) }, '-=320')
      .add({ targets: '.photo-card img', opacity: [0,1], scale: [0.98,1] }, '-=420');
  })();
  
  // Dialogs
  const openers = document.querySelectorAll('[data-open]');
  openers.forEach(btn => btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-open');
    const dialog = document.getElementById(id);
    dialog?.showModal();
  }));
  
  // Footer year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
  
  // LANG: konfiguracja
  let currentLang = localStorage.getItem('lang') || 'pl';
  let langInit = false;
  function applyTranslations(lang){
    if (!window.LANG || !LANG[lang]) return;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const t = LANG[lang][key];
      if (typeof t === 'string') el.textContent = t;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const t = LANG[lang][key];
      if (typeof t === 'string') el.setAttribute('placeholder', t);
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
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
    const switcher = document.querySelector('.lang-switch');
    if (switcher) switcher.setAttribute('data-lang', lang);
    document.querySelectorAll('.lang-flag').forEach(btn=>{
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    if (!window.anime || langInit === false){
      applyTranslations(lang); langInit = true; return;
    }
    anime({ targets: ['main','.site-header'], opacity: 0.25, duration: 160, easing: 'easeOutQuad', complete(){
      applyTranslations(lang);
      anime({ targets: ['main','.site-header'], opacity: 1, duration: 220, easing: 'easeOutQuad' });
    }});
  }
  
  // Nowy przełącznik języka (dwa segmenty z flagami)
  (function initLangSwitcher(){
    const container = document.querySelector('.lang-switch');
    if (!container) return;
    const plBtn = container.querySelector('.lang-flag[data-lang="pl"]');
    const enBtn = container.querySelector('.lang-flag[data-lang="en"]');
    [plBtn, enBtn].forEach(btn => btn?.addEventListener('click', ()=>{
      const lang = btn.dataset.lang;
      currentLang = lang; setLang(currentLang);
    }));
    // ustaw stan początkowy
    setLang(currentLang);
  })();
  
  // Web3Forms + konfetti po sukcesie
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
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
  }
  
  // Animowane tło (delikatne bloby)
  (function animatedBG(){
    const canvas = document.getElementById('bg');
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
  
  // Scroll-snap + dotnav (w tym poprawny START)
  (function scrollBg(){
    const sections = document.querySelectorAll('.snap');
    const setBG = (name)=>document.body.setAttribute('data-bg', name);
    const first = document.querySelector('.snap');
    if (first){ setBG(first.getAttribute('data-bg') || 'sand'); }
    const dots = document.querySelectorAll('.dotnav .dot');
    const setActiveDot = (id)=>{ dots.forEach(d=>{ const t = d.getAttribute('data-target'); d.classList.toggle('active', (id||'start')===t); }); };
    setActiveDot('start');
    window.addEventListener('scroll', ()=>{ if (window.scrollY < 40) setActiveDot('start'); }, { passive:true });
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting && entry.intersectionRatio > 0.4){
          const isHero = entry.target.classList.contains('hero');
          const secId = isHero ? 'start' : (entry.target.getAttribute('id') || '');
          const name = entry.target.getAttribute('data-bg');
          if (name) setBG(name);
          if (secId) setActiveDot(secId);
        }
      });
    }, { threshold: [0.4,0.6,0.9], rootMargin: '-68px 0px 0px 0px' });
    sections.forEach(s=>io.observe(s));
    dots.forEach(d=> d.addEventListener('click', (e)=>{ e.preventDefault(); const id = d.getAttribute('data-target'); const t = id==='start'? document.querySelector('.hero') : document.getElementById(id); t?.scrollIntoView({behavior:'smooth', block:'start'}); }));
  })();
  
  // Konfetti po sukcesie
  function fireConfetti(){
    const canvas = document.getElementById('confettiCanvas'); if (!canvas) return; const ctx = canvas.getContext('2d');
    const header = document.querySelector('.site-header');
    function resize(){ const dpr = Math.min(window.devicePixelRatio||1,2); canvas.width = Math.floor(window.innerWidth*dpr); canvas.height = Math.floor(180*dpr); canvas.style.width = window.innerWidth + 'px'; canvas.style.height = '180px'; canvas.style.top = (header?.offsetHeight||66) + 'px'; }
    resize();
    const colors = ['#D6D2C5','#E4DCC9','#D6CBB3','#B6AB97','#BCB8A7','#ffffff']; const pieces = []; const COUNT = 120; const dpr = Math.min(window.devicePixelRatio||1,2);
    for(let i=0;i<COUNT;i++) pieces.push({ x: Math.random()*canvas.width, y: -Math.random()*40, r: 2 + Math.random()*4*dpr, vx: -1 + Math.random()*2, vy: 1 + Math.random()*2, a: 0.8, color: colors[i%colors.length], tilt: Math.random()*Math.PI });
    let start = null; function step(ts){ if(!start) start = ts; const t = ts - start; ctx.clearRect(0,0,canvas.width,canvas.height); pieces.forEach(p=>{ p.x += p.vx; p.y += p.vy; p.tilt += 0.08; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(Math.sin(p.tilt)*0.6); ctx.fillStyle = p.color; ctx.globalAlpha = p.a; ctx.fillRect(-p.r, -p.r, p.r*2, p.r*2); ctx.restore(); }); if (t < 1800) requestAnimationFrame(step); else ctx.clearRect(0,0,canvas.width,canvas.height); }
    requestAnimationFrame(step);
  }
  