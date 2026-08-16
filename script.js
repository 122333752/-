
// Tabs
document.querySelectorAll('.tab').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.target).classList.add('active');
  });
});

// PPT carousel
const slides=[...document.querySelectorAll('.slide')];
const dotsWrap=document.getElementById('dots');
let current=0, autoplay;
slides.forEach((_,i)=>{
  const d=document.createElement('span');
  d.className='dot'+(i===0?' active':'');
  d.addEventListener('click',()=>showSlide(i));
  dotsWrap.appendChild(d);
});
const dots=[...document.querySelectorAll('.dot')];
function showSlide(i){
  current=(i+slides.length)%slides.length;
  slides.forEach((s,k)=>s.classList.toggle('active',k===current));
  dots.forEach((d,k)=>d.classList.toggle('active',k===current));
  clearInterval(autoplay);
  autoplay=setInterval(()=>showSlide(current+1),5000);
}
document.getElementById('next').onclick=()=>showSlide(current+1);
document.getElementById('prev').onclick=()=>showSlide(current-1);
autoplay=setInterval(()=>showSlide(current+1),5000);

// Springy / jelly scroll reveal
const revealObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('is-bouncy');
      revealObserver.unobserve(entry.target);
    }
  });
},{threshold:.12,rootMargin:'0px 0px -3% 0px'});

document.querySelectorAll('.section-title,.glass,.timeline-item,.contact-card,.photo-stage,.ppt-stage,.running-stage,.running-intro,.photo-intro').forEach((el,i)=>{
  el.classList.add('reveal-bouncy');
  el.style.animationDelay=((i%3)*55)+'ms';
  revealObserver.observe(el);
});

// Photography carousel
const photoSlides=[...document.querySelectorAll('.photo-slide')];
const photoDotsWrap=document.getElementById('photoDots');
let photoCurrent=0, photoAutoplay;
photoSlides.forEach((_,i)=>{
  const d=document.createElement('span');
  d.className='dot'+(i===0?' active':'');
  d.addEventListener('click',()=>showPhoto(i));
  photoDotsWrap.appendChild(d);
});
const photoDots=[...photoDotsWrap.querySelectorAll('.dot')];
function showPhoto(i){
  photoCurrent=(i+photoSlides.length)%photoSlides.length;
  photoSlides.forEach((s,k)=>s.classList.toggle('active',k===photoCurrent));
  photoDots.forEach((d,k)=>d.classList.toggle('active',k===photoCurrent));
  clearInterval(photoAutoplay);
  photoAutoplay=setInterval(()=>showPhoto(photoCurrent+1),5200);
}
document.getElementById('photoNext').onclick=()=>showPhoto(photoCurrent+1);
document.getElementById('photoPrev').onclick=()=>showPhoto(photoCurrent-1);
photoAutoplay=setInterval(()=>showPhoto(photoCurrent+1),5200);

// Photography lightbox
const lightbox=document.getElementById('lightbox');
const lightboxImg=lightbox.querySelector('img');
document.querySelectorAll('[data-lightbox]').forEach(card=>{
  card.addEventListener('click',()=>{
    lightboxImg.src=card.dataset.lightbox;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  });
});
function closeLightbox(){
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}
lightbox.querySelector('.lightbox-close').onclick=closeLightbox;
lightbox.addEventListener('click',e=>{
  if(e.target===lightbox) closeLightbox();
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape') closeLightbox();
});

// Dandelion opening animation — visible immediately over the hero
const canvas=document.getElementById('dandelion'),ctx=canvas.getContext('2d');
let W,H,scrollYNow=0,pointer={x:-999,y:-999};

function resizeCanvas(){
  const dpr=Math.min(2,window.devicePixelRatio||1);
  canvas.width=innerWidth*dpr;
  canvas.height=innerHeight*dpr;
  canvas.style.width=innerWidth+'px';
  canvas.style.height=innerHeight+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
  W=innerWidth; H=innerHeight;
}
resizeCanvas();
addEventListener('resize',resizeCanvas);
addEventListener('pointermove',e=>{pointer.x=e.clientX;pointer.y=e.clientY},{passive:true});
addEventListener('scroll',()=>{
  scrollYNow=window.scrollY||0;
  const fade=Math.max(0,1-scrollYNow/(innerHeight*.78));
  canvas.style.opacity=String(fade);
},{passive:true});

function makeFluff(layer,initial=true){
  const ranges=[[48,78],[30,52],[18,34]];
  const [lo,hi]=ranges[layer];
  return {
    layer,
    x:Math.random()*W,
    y:initial?Math.random()*(H+120)-60:H+80+Math.random()*180,
    size:lo+Math.random()*(hi-lo),
    vy:(.12+Math.random()*.20)*(1+layer*.18),
    vx:(Math.random()-.5)*.16,
    phase:Math.random()*Math.PI*2,
    rot:(Math.random()-.5)*.55,
    spin:(Math.random()-.5)*.0015,
    opacity:[.82,.68,.52][layer]
  };
}
const fluffs=[
  ...Array.from({length:12},()=>makeFluff(0)),
  ...Array.from({length:18},()=>makeFluff(1)),
  ...Array.from({length:24},()=>makeFluff(2))
];

function drawFluff(s,t){
  ctx.save();
  ctx.translate(s.x,s.y);
  ctx.rotate(s.rot);
  const a=s.opacity;
  const r=s.size*.36;
  const stem=s.size*.54;
  // tiny seed + stem
  ctx.lineCap='round';
  ctx.strokeStyle=`rgba(82,103,88,${a*.58})`;
  ctx.lineWidth=Math.max(.7,s.size/55);
  ctx.beginPath(); ctx.moveTo(0,r*.20); ctx.quadraticCurveTo(s.size*.05,stem*.52,s.size*.02,stem); ctx.stroke();
  ctx.fillStyle=`rgba(113,91,60,${a*.62})`;
  ctx.beginPath(); ctx.ellipse(s.size*.02,stem+s.size*.035,s.size*.035,s.size*.075,s.rot,0,Math.PI*2); ctx.fill();
  // fluffy parachute
  const rays=22;
  ctx.strokeStyle=`rgba(246,248,238,${a})`;
  ctx.shadowColor=`rgba(255,255,255,${a})`;
  ctx.shadowBlur=s.layer===0?10:6;
  ctx.lineWidth=Math.max(.6,s.size/72);
  for(let i=0;i<rays;i++){
    const ang=(i/rays)*Math.PI*2 + Math.sin(t*.0007+s.phase)*.025;
    const rr=r*(.78+Math.sin(i*2.17+s.phase)*.14);
    const x=Math.cos(ang)*rr, y=Math.sin(ang)*rr*.72;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(x,y); ctx.stroke();
    const twig=s.size*.09;
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x+Math.cos(ang+.75)*twig,y+Math.sin(ang+.75)*twig*.7);
    ctx.moveTo(x,y);
    ctx.lineTo(x+Math.cos(ang-.75)*twig,y+Math.sin(ang-.75)*twig*.7);
    ctx.stroke();
  }
  ctx.fillStyle=`rgba(245,247,234,${a})`;
  ctx.beginPath();ctx.arc(0,0,Math.max(1.2,s.size*.035),0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function animateDandelions(t){
  ctx.clearRect(0,0,W,H);
  for(const s of fluffs){
    const breeze=Math.sin(t*.00045+s.phase)*(.18+s.layer*.055);
    const dx=pointer.x-s.x,dy=pointer.y-s.y,dist=Math.hypot(dx,dy);
    if(dist<125){
      const f=(125-dist)/125;
      s.x-=dx*.0045*f; s.y-=dy*.002*f;
    }
    s.x+=s.vx+breeze;
    s.y-=s.vy;
    s.rot+=s.spin;
    if(s.y<-110 || s.x<-100 || s.x>W+100){
      Object.assign(s,makeFluff(s.layer,false));
      s.x=Math.random()*W;
    }
    drawFluff(s,t);
  }
  requestAnimationFrame(animateDandelions);
}
requestAnimationFrame(animateDandelions);

// Running carousel
const runSlides=[...document.querySelectorAll('.run-slide')];
const runDotsWrap=document.getElementById('runDots');
let runCurrent=0,runAutoplay;
runSlides.forEach((_,i)=>{
  const d=document.createElement('span');
  d.className='dot'+(i===0?' active':'');
  d.addEventListener('click',()=>showRun(i));
  runDotsWrap.appendChild(d);
});
const runDots=[...runDotsWrap.querySelectorAll('.dot')];
function showRun(i){
  runCurrent=(i+runSlides.length)%runSlides.length;
  runSlides.forEach((slide,k)=>slide.classList.toggle('active',k===runCurrent));
  runDots.forEach((dot,k)=>dot.classList.toggle('active',k===runCurrent));
  clearInterval(runAutoplay);
  runAutoplay=setInterval(()=>showRun(runCurrent+1),5600);
}
document.getElementById('runNext').onclick=()=>showRun(runCurrent+1);
document.getElementById('runPrev').onclick=()=>showRun(runCurrent-1);
runAutoplay=setInterval(()=>showRun(runCurrent+1),5600);

// Swipe support on mobile for all three showcases
function addSwipe(el,onPrev,onNext){
  let startX=0,startY=0;
  el.addEventListener('touchstart',e=>{
    startX=e.changedTouches[0].clientX; startY=e.changedTouches[0].clientY;
  },{passive:true});
  el.addEventListener('touchend',e=>{
    const dx=e.changedTouches[0].clientX-startX;
    const dy=e.changedTouches[0].clientY-startY;
    if(Math.abs(dx)>48 && Math.abs(dx)>Math.abs(dy)*1.25){
      dx>0?onPrev():onNext();
    }
  },{passive:true});
}
addSwipe(document.querySelector('.slides'),()=>showSlide(current-1),()=>showSlide(current+1));
addSwipe(document.querySelector('.photo-slides'),()=>showPhoto(photoCurrent-1),()=>showPhoto(photoCurrent+1));
addSwipe(document.querySelector('.running-slides'),()=>showRun(runCurrent-1),()=>showRun(runCurrent+1));
