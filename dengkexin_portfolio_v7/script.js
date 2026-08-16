
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

// Dandelion opening animation — big, soft, white and fluffy
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
  const fade=Math.max(.12,1-scrollYNow/(innerHeight*1.15));
  canvas.style.opacity=String(fade);
},{passive:true});

function makeBloom(layer,initial=true){
  const mobile=W<720;
  const ranges=mobile?[[100,168],[64,112],[38,70]]:[[150,245],[90,155],[52,92]];
  const [lo,hi]=ranges[layer];
  return {
    layer,
    x:Math.random()*W,
    y:initial?Math.random()*(H+220)-110:H+130+Math.random()*230,
    size:lo+Math.random()*(hi-lo),
    vy:(.055+Math.random()*.11)*(1+layer*.16),
    vx:(Math.random()-.5)*.085,
    phase:Math.random()*Math.PI*2,
    rot:(Math.random()-.5)*.18,
    spin:(Math.random()-.5)*.00035,
    opacity:[.94,.82,.66][layer]
  };
}

function buildBlooms(){
  const mobile=W<720;
  return [
    ...Array.from({length:mobile?5:7},()=>makeBloom(0)),
    ...Array.from({length:mobile?7:10},()=>makeBloom(1)),
    ...Array.from({length:mobile?9:13},()=>makeBloom(2))
  ];
}
let blooms=buildBlooms();
addEventListener('resize',()=>{blooms=buildBlooms()},{passive:true});

function drawBloom(s,t){
  ctx.save();
  ctx.translate(s.x,s.y);
  ctx.rotate(s.rot);
  const a=s.opacity;
  const R=s.size*.46;

  // warm white halo makes every flower read as a plump cotton-ball rather than thin black seeds
  const glow=ctx.createRadialGradient(0,0,R*.05,0,0,R*1.18);
  glow.addColorStop(0,`rgba(255,251,226,${a*.98})`);
  glow.addColorStop(.34,`rgba(255,255,247,${a*.88})`);
  glow.addColorStop(.72,`rgba(255,255,255,${a*.42})`);
  glow.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=glow;
  ctx.beginPath();ctx.arc(0,0,R*1.18,0,Math.PI*2);ctx.fill();

  ctx.globalCompositeOperation='screen';
  ctx.shadowColor='rgba(255,255,255,.95)';
  ctx.shadowBlur=s.layer===0?12:8;

  // many soft tufts clustered around the sphere
  const rings=s.layer===0?5:4;
  for(let ring=0;ring<rings;ring++){
    const count=18+ring*8;
    const rr=R*(.18+ring*(.16));
    for(let i=0;i<count;i++){
      const ang=(i/count)*Math.PI*2 + ring*.39 + Math.sin(t*.00035+s.phase+ring)*.018;
      const jitter=Math.sin(i*2.31+s.phase)*R*.035;
      const x=Math.cos(ang)*(rr+jitter);
      const y=Math.sin(ang)*(rr+jitter)*.96;
      const puff=R*(.075 + .02*Math.sin(i*1.7+s.phase));
      const g=ctx.createRadialGradient(x,y,0,x,y,puff*1.9);
      g.addColorStop(0,`rgba(255,255,255,${a*.95})`);
      g.addColorStop(.46,`rgba(255,252,235,${a*.66})`);
      g.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=g;
      ctx.beginPath();ctx.arc(x,y,puff*1.9,0,Math.PI*2);ctx.fill();
    }
  }

  // subtle creamy center, no black stalks or dark seed bodies
  const core=ctx.createRadialGradient(0,0,0,0,0,R*.2);
  core.addColorStop(0,`rgba(255,229,145,${a*.66})`);
  core.addColorStop(.45,`rgba(255,246,213,${a*.46})`);
  core.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=core;ctx.beginPath();ctx.arc(0,0,R*.2,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function animateDandelions(t){
  ctx.clearRect(0,0,W,H);
  for(const s of blooms){
    const breeze=Math.sin(t*.00028+s.phase)*(.10+s.layer*.025);
    const dx=pointer.x-s.x,dy=pointer.y-s.y,dist=Math.hypot(dx,dy);
    if(dist<190){
      const f=(190-dist)/190;
      s.x-=dx*.0017*f; s.y-=dy*.0008*f;
    }
    s.x+=s.vx+breeze;
    s.y-=s.vy;
    s.rot+=s.spin;
    if(s.y<-s.size*1.4 || s.x<-s.size*1.4 || s.x>W+s.size*1.4){
      Object.assign(s,makeBloom(s.layer,false));
      s.x=Math.random()*W;
    }
    drawBloom(s,t);
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
