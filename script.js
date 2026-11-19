/* Aditya & Shreya — one continuous, scroll-directed wedding invitation.
   No framework or animation runtime dependency. Motion stays GPU transform-based. */
(() => {
  'use strict';
  const $ = (q, scope = document) => scope.querySelector(q);
  const $$ = (q, scope = document) => Array.from(scope.querySelectorAll(q));
  const clamp = (n, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
  const lerp = (a,b,t) => a+(b-a)*t;
  const smooth = p => p*p*(3-2*p);
  const mobile = () => matchMedia('(max-width: 700px)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const main = $('#siteMain'), film = $('#film'), opening = $('#opening');
  const scenes = $$('.film-scene'), dots = $('#chapterDots'), transition = $('#transition');
  const toast = $('#toast'), music = $('#music'), soundButton = $('#soundButton');
  const chapterNames = ['THE INVITATION','FAMILY BLESSINGS','SUFI NIGHT','HALDI CARNIVAL','THE BARAAT','RECEPTION','SACRED WEDDING'];
  const transitions = [
    {type:'folio',kicker:'WITH THE BLESSINGS OF GANESHA',label:'OUR FAMILIES'},
    {type:'stars',kicker:'FROM PRAYERS TO THE NIGHT',label:'SUFI NIGHT'},
    {type:'marigolds',kicker:'THE SUN RISES ON OUR JOY',label:'HALDI CARNIVAL'},
    {type:'dhol',kicker:'THE DRUMS BEGIN',label:'THE BARAAT'},
    {type:'shards',kicker:'A THOUSAND LIGHTS AWAIT',label:'THE RECEPTION'},
    {type:'fire',kicker:'BEFORE THE SACRED FIRE',label:'THE WEDDING'}
  ];
  const photoSources = [
    {id:'photo-hero',real:'https://images.pexels.com/photos/6543940/pexels-photo-6543940.jpeg?auto=compress&cs=tinysrgb&w=1200',fallback:'assets/fallback-hero.webp'},
    {id:'photo-family',real:'https://images.pexels.com/photos/35872894/pexels-photo-35872894.jpeg?auto=compress&cs=tinysrgb&w=1200',fallback:'assets/fallback-wedding.webp'},
    {id:'photo-sufi',real:'https://images.pexels.com/photos/35474670/pexels-photo-35474670.jpeg?auto=compress&cs=tinysrgb&w=1200',fallback:'assets/fallback-sufi.webp'},
    {id:'photo-haldi',real:'https://images.pexels.com/photos/35457632/pexels-photo-35457632.jpeg?auto=compress&cs=tinysrgb&w=1200',fallback:'assets/fallback-haldi.webp'},
    {id:'photo-baraat',real:'https://images.pexels.com/photos/35457634/pexels-photo-35457634.jpeg?auto=compress&cs=tinysrgb&w=1200',fallback:'assets/fallback-baraat.webp'},
    {id:'photo-reception',real:'https://images.pexels.com/photos/20058062/pexels-photo-20058062.jpeg?auto=compress&cs=tinysrgb&w=1200',fallback:'assets/fallback-reception.webp'},
    {id:'photo-wedding',real:'https://images.pexels.com/photos/35872894/pexels-photo-35872894.jpeg?auto=compress&cs=tinysrgb&w=1200',fallback:'assets/fallback-wedding.webp'}
  ];
  // For actual published invitation, replace these demo source URLs with genuine
  // couple photographs, then remove demo disclaimer in the footer.
  function ensurePhoto(index) {
    const src = photoSources[index]; if (!src || src.tried) return;
    src.tried = true;
    const node = document.getElementById(src.id);
    if (!node) return;
    node.classList.add('is-loading');
    let fallbackUsed = false;
    node.addEventListener('error', () => {
      if (!fallbackUsed) { fallbackUsed = true; node.src = src.fallback; }
      else node.classList.remove('is-loading');
    });
    node.addEventListener('load', () => node.classList.remove('is-loading'));
    node.src = window.__INVITE_OFFLINE_PREVIEW__ ? src.fallback : src.real;
  }
  [0,1].forEach(ensurePhoto);

  let toastTimeout;
  function notify(txt) {
    toast.textContent = txt;
    toast.classList.add('is-visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('is-visible'), 2900);
  }
  let soundOn = false;
  async function setSound(shouldPlay) {
    soundOn = !!shouldPlay;
    soundButton.setAttribute('aria-pressed', String(soundOn));
    soundButton.setAttribute('aria-label', soundOn ? 'Turn off music' : 'Turn on music');
    $('#soundText').textContent = soundOn ? 'SOUND ON' : 'SOUND OFF';
    $('#soundIcon').textContent = soundOn ? '♪' : '♫';
    if (!soundOn) {music.pause();return;}
    try {
      music.volume = 0;
      await music.play();
      const start = performance.now();
      const fade = (t) => {
        if (!soundOn) return;
        const p = clamp((t-start)/2100);
        music.volume = .4 * smooth(p);
        if (p < 1) requestAnimationFrame(fade);
      };
      requestAnimationFrame(fade);
    } catch {
      soundOn = false;
      soundButton.setAttribute('aria-pressed', 'false');
      $('#soundText').textContent = 'SOUND OFF';
      notify('Music is optional. Tap Sound to try again.');
    }
  }
  soundButton.addEventListener('click',() => setSound(!soundOn));

  let entered = false;
  function openInvite(skip = false) {
    if (entered) return;
    entered = true;
    if (!skip) setSound(true); // First tap allows mobile browsers to start audio.
    main.removeAttribute('inert');
    document.body.classList.add('is-entered');
    opening.classList.add('is-dropping');
    const lag = reduced || skip ? 0 : 1050;
    setTimeout(() => opening.classList.add('is-opening','is-expanding'),lag);
    setTimeout(() => {
      opening.classList.add('is-hidden');
      document.body.classList.remove('is-locked');
      opening.setAttribute('aria-hidden','true');
      $('#enterButton').setAttribute('tabindex','-1');
      requestUpdate();
      fx.burst(innerWidth*.5,innerHeight*.37,52,'gold');
    },lag + (reduced || skip ? 70 : 900));
  }
  $('#enterButton').addEventListener('click',()=>openInvite(false));
  $('#skipOpening').addEventListener('click',()=>openInvite(true));
  opening.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target===opening)openInvite(false)});

  const menuButton = $('#menuButton'), jumpMenu = $('#jumpMenu');
  menuButton.addEventListener('click',()=>{
    const state = jumpMenu.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded',String(state));
  });
  document.addEventListener('click',e=>{
    if (!jumpMenu.contains(e.target) && !menuButton.contains(e.target)) {
      jumpMenu.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded','false');
    }
  });
  const jumpTo = i => {
    const rect = film.getBoundingClientRect();
    const top = window.scrollY + rect.top;
    const usable = film.offsetHeight - innerHeight;
    window.scrollTo({top:top + (i/(scenes.length-1))*usable,behavior:reduced?'instant':'smooth'});
  };
  scenes.forEach((s,i)=>{
    const button = document.createElement('button');
    button.type='button';
    button.title=chapterNames[i];
    button.setAttribute('aria-label','Jump to '+chapterNames[i]);
    button.addEventListener('click',()=>jumpTo(i));
    dots.appendChild(button);
  });
  $$('[data-goto]').forEach(b => b.addEventListener('click',()=>{jumpMenu.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');jumpTo(Number(b.dataset.goto))}));
  $('#backTop').addEventListener('click',()=>window.scrollTo({top:0,behavior:reduced?'instant':'smooth'}));
  jumpMenu.querySelector('a[href="#visit"]').addEventListener('click',()=>{
    jumpMenu.classList.remove('is-open'); menuButton.setAttribute('aria-expanded','false');
  });

  // Exact IST times. '11 December midnight' means 00:00 on 12 December by convention.
  const address = 'Shivdhara Resort, Chitrasani, Deesa Highway, Palanpur, Gujarat, India';
  const events={
    sufi:{title:'Sufi Night — Aditya & Shreya',start:'20261210T190000',end:'20261210T220000'},
    haldi:{title:'Haldi Carnival — Aditya & Shreya',start:'20261211T103000',end:'20261211T123000'},
    baraat:{title:'Baraat — Aditya & Shreya',start:'20261211T170000',end:'20261211T193000'},
    reception:{title:'Reception & Dinner — Aditya & Shreya',start:'20261211T193000',end:'20261211T223000'},
    wedding:{title:'Wedding Ceremony — Aditya & Shreya',start:'20261212T000000',end:'20261212T020000'}
  };
  const esc = str=>str.replace(/\\/g,'\\\\').replace(/,/g,'\\,').replace(/;/g,'\\;').replace(/\n/g,'\\n');
  const toUtc = s=> new Date(`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}T${s.slice(9,11)}:${s.slice(11,13)}:${s.slice(13,15)}+05:30`).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  function calendar(ids){
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Aditya Shreya Wedding Invitation//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
    ids.forEach(id=>{const e=events[id];if(!e)return;
      lines.push('BEGIN:VEVENT',`UID:${id}-2026-aditya-shreya@wedding.invite`,'DTSTAMP:20261120T000000Z',`DTSTART:${toUtc(e.start)}`,`DTEND:${toUtc(e.end)}`,`SUMMARY:${esc(e.title)}`,`LOCATION:${esc(address)}`,'DESCRIPTION:With love from the Agrawal and Kothari families.','END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n')],{type:'text/calendar;charset=utf-8'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='Aditya-Shreya-Wedding.ics';a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),3200);
    notify('Calendar file downloaded');
  }
  $$('[data-event]').forEach(b=>b.addEventListener('click',()=>calendar([b.dataset.event])));
  $('#calendarAll').addEventListener('click',()=>calendar(Object.keys(events)));
  $('#copyVenue').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(address);notify('Venue address copied');}
    catch{notify(address);}
  });
  $('#shareButton').addEventListener('click',async()=>{
    try {if(navigator.share) await navigator.share({title:'Aditya & Shreya Wedding',text:'You are warmly invited to our wedding celebrations.',url:location.href});
    else {await navigator.clipboard.writeText(location.href);notify('Invitation link copied');}}
    catch(e){if(e.name!=='AbortError')notify('Share this invitation link with your family');}
  });

  // Main film engine: transition intensity follows scroll position (and reverses).
  let currentChapter = -1, activeTransition = -1, scheduled=false;
  const markDots = $$('#chapterDots button');
  function refresh() {
    scheduled=false;
    if(!entered)return;
    const rect=film.getBoundingClientRect();
    const total = Math.max(1,rect.height-innerHeight);
    const p = clamp((-rect.top)/total);
    const position = p*(scenes.length-1);
    const floor = Math.min(scenes.length-1,Math.floor(position));
    const local = floor===scenes.length-1 ? 0 : position-floor;
    const showNext = floor < scenes.length-1 && local >= .70;
    const current = showNext ? floor+1 : floor;
    if(current !== currentChapter){
      currentChapter=current;
      scenes.forEach((el,i)=>{el.classList.toggle('is-current',i===current);el.setAttribute('aria-hidden',String(i!==current));});
      markDots.forEach((el,i)=>{el.classList.toggle('is-active',i===current);el.setAttribute('aria-current',i===current?'step':'false')});
      $('#chapterCount').textContent=String(current+1).padStart(2,'0');
      $('#chapterLabel').textContent=chapterNames[current];
      [current-1,current,current+1].forEach(ensurePhoto);
      fx.setTheme(scenes[current].dataset.tone);
    }
    const phase = clamp((local-.44)/.52);
    const isTransition = floor < scenes.length-1 && local>.44 && local<.96 && !reduced;
    const cover = isTransition ? Math.pow(Math.sin(Math.PI*phase),.68) : 0;
    if(isTransition){
      if(activeTransition!==floor){
        activeTransition=floor;
        transition.dataset.type=transitions[floor].type;
        $('#transitionKicker').textContent=transitions[floor].kicker;
        $('#transitionName').textContent=transitions[floor].label;
        fx.burst(innerWidth*.5,innerHeight*.55,20,scenes[current].dataset.tone);
      }
      transition.classList.add('is-active');
      transition.style.setProperty('--cover',cover.toFixed(4));
      transition.style.setProperty('--phase',phase.toFixed(4));
      transition.style.setProperty('--spin',`${(phase*475).toFixed(2)}deg`);
    } else {
      activeTransition=-1;
      transition.style.setProperty('--cover','0');
      transition.classList.remove('is-active');
    }
    // Slight camera drift + foreground depth with touch scroll direction.
    const drift = current===floor ? local : local-1;
    scenes[current].style.setProperty('--camera-scale',(1.05+Math.abs(drift)*.09).toFixed(3));
    scenes[current].style.setProperty('--camera-y',`${(drift*-30).toFixed(1)}px`);
    scenes[current].style.setProperty('--camera-x',`${(Math.sin(position*Math.PI*.45)*-13).toFixed(1)}px`);
    scenes[current].style.setProperty('--copy-y',`${(drift*-19).toFixed(1)}px`);
    scenes[current].style.setProperty('--copy-opacity',(1-Math.min(.44,cover*.45)).toFixed(3));
    if(current===1) scenes[current].style.setProperty('--paper-scale',(1.04-Math.abs(drift)*.05).toFixed(3));
    if(current===3) scenes[current].style.setProperty('--rotate',`${(position*90).toFixed(2)}deg`);
    if(current===4) scenes[current].style.setProperty('--rotate',`${(position*-52).toFixed(2)}deg`);
    if(current===5) scenes[current].style.setProperty('--shine-x',`${((local-.5)*115).toFixed(2)}%`);
    const doc=document.documentElement;
    const all=Math.max(1,doc.scrollHeight-innerHeight);
    $('#pageProgress').style.width=`${(window.scrollY/all*100).toFixed(2)}%`;
    $('#swipeCue').style.opacity= p>.93 ? '0' : '1';
    const finale = $('#visit');
    const fr = finale.getBoundingClientRect();
    const arrive = smooth(clamp((innerHeight-fr.top)/(innerHeight*.88)));
    finale.style.setProperty('--reveal-radius',`${(15+arrive*170).toFixed(2)}%`);
  }
  function requestUpdate(){if(scheduled)return;scheduled=true;requestAnimationFrame(refresh)}
  addEventListener('scroll',requestUpdate,{passive:true});
  addEventListener('resize',requestUpdate,{passive:true});
  addEventListener('orientationchange',requestUpdate,{passive:true});
  document.addEventListener('visibilitychange',requestUpdate);

  // Touch bursts for guests. Different rituals use distinct particle shapes.
  $$('[data-magic]').forEach(btn=>btn.addEventListener('click',e=>{
    const tone = btn.closest('.film-scene').dataset.tone;
    fx.burst(innerWidth*.5,innerHeight*.52,74,tone);
    if(navigator.vibrate)navigator.vibrate(15);
  }));

  const fx = (()=>{
    const canvas=$('#magicCanvas'),ctx=canvas.getContext('2d',{alpha:true});
    if(!ctx || reduced) return {setTheme(){},burst(){}};
    let w=0,h=0,dpr=1,last=0,prev=0,theme='gold',base=[],burstParticles=[];
    const colors={gold:['#ffe2a1','#f5bd63','#fff7d6'],parchment:['#f8e1ab','#fff0d2'],sufi:['#d7dcff','#fff3d8','#a8a4ee'],haldi:['#ffde57','#f9a52f','#fff2aa'],baraat:['#efb55d','#c93f48','#fff0c7'],reception:['#fff3ee','#e8c9f0','#f6deb6'],wedding:['#ffc16c','#f87e35','#ffe9b6']};
    const rand=(a,b)=>a+Math.random()*(b-a),pick=arr=>arr[Math.floor(Math.random()*arr.length)];
    function resize(){w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,1.6);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);base=Array.from({length:mobile()?18:36},()=>make(true));}
    function make(seed){const ember=theme==='wedding';return {x:rand(0,w),y:seed?rand(0,h):ember?h+15:-20,vx:rand(-.25,.25),vy:ember?rand(-1.2,-.4):rand(.15,.42),r:rand(1,3.7),p:rand(0,6.28),alpha:rand(.12,.44),type:theme};}
    function particle(p,t,a){ctx.save();ctx.translate(p.x,p.y);ctx.globalAlpha=a;ctx.fillStyle=p.color||pick(colors[p.type]||colors.gold);ctx.rotate(p.p+t*.00028);
      if(p.type==='haldi'||p.type==='parchment'){ctx.beginPath();ctx.ellipse(0,0,p.r*.6,p.r*1.5,0,0,Math.PI*2);ctx.fill()}
      else if(p.type==='baraat'){ctx.fillRect(-p.r*.4,-p.r,p.r*.8,p.r*2.7)}
      else if(p.type==='sufi'||p.type==='reception'){ctx.beginPath();ctx.moveTo(0,-p.r*2.2);ctx.lineTo(p.r*.4,-p.r*.4);ctx.lineTo(p.r*2.2,0);ctx.lineTo(p.r*.4,p.r*.4);ctx.lineTo(0,p.r*2.2);ctx.lineTo(-p.r*.4,p.r*.4);ctx.lineTo(-p.r*2.2,0);ctx.lineTo(-p.r*.4,-p.r*.4);ctx.closePath();ctx.fill()}
      else if(p.type==='wedding'){ctx.shadowColor='#ff8736';ctx.shadowBlur=12;ctx.beginPath();ctx.ellipse(0,0,p.r*.6,p.r*1.2,0,0,Math.PI*2);ctx.fill()}
      else{ctx.beginPath();ctx.arc(0,0,p.r*.6,0,Math.PI*2);ctx.fill()}
      ctx.restore()}
    function tick(t){requestAnimationFrame(tick);if(document.hidden||!entered||t-last<30)return;const dt=Math.min(2,(t-prev||30)/30);last=t;prev=t;ctx.clearRect(0,0,w,h);
      for(const p of base){p.y+=p.vy*dt;p.x+=(p.vx+Math.sin(p.p+t*.00035)*.15)*dt;if(p.y>h+18||p.y<-20)Object.assign(p,make(false));particle(p,t,p.alpha)}
      for(let i=burstParticles.length-1;i>=0;i--){const p=burstParticles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.type==='wedding'?-.014:.055)*dt;p.life-=.018*dt;if(p.life<=0){burstParticles.splice(i,1);continue}particle(p,t,p.life*.85)}
    }
    function setTheme(s){if(s===theme)return;theme=s;base=Array.from({length:mobile()?18:36},()=>make(true))}
    function burst(x,y,n=60,kind=theme){const pal=colors[kind]||colors.gold;const len=Math.min(n,mobile()?65:95);for(let i=0;i<len;i++){const a=i/len*Math.PI*2+Math.random()*.3,v=rand(1.3,kind==='baraat'?8:6);burstParticles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-2,r:rand(1,4),p:rand(0,6.28),life:rand(.5,1),color:pick(pal),type:kind});}if(burstParticles.length>220)burstParticles.splice(0,burstParticles.length-220)}
    addEventListener('resize',resize,{passive:true});resize();requestAnimationFrame(tick);return {setTheme,burst};
  })();
  requestUpdate();
})();
