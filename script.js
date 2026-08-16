
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

// Opening animation
const introOverlay=document.getElementById('introOverlay');
const introEnter=document.getElementById('introEnter');
document.body.classList.add('intro-active');
let introClosed=false;
function closeIntro(){
  if(introClosed) return;
  introClosed=true;
  introOverlay.classList.add('is-leaving');
  introOverlay.setAttribute('aria-hidden','true');
  document.body.classList.remove('intro-active');
  setTimeout(()=>introOverlay.remove(),950);
}
introEnter.addEventListener('click',closeIntro);
setTimeout(closeIntro,5200);

// Floating dandelions: clearly visible seed heads + loose seeds, inspired by the dense floating opening reference
const canvas=document.getElementById('dandelion'),ctx=canvas.getContext('2d');
let W,H,scrollBoost=0,mouse={x:-999,y:-999};
function resize(){
  const dpr=Math.min(2,devicePixelRatio||1);
  canvas.width=innerWidth*dpr; canvas.height=innerHeight*dpr;
  canvas.style.width=innerWidth+'px'; canvas.style.height=innerHeight+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0); W=innerWidth; H=innerHeight;
}
resize(); addEventListener('resize',resize);
addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY});
addEventListener('scroll',()=>{scrollBoost=Math.min(1.8,scrollY/Math.max(innerHeight,1))},{passive:true});

function makePuff(layer){
  const mobile=W<780;
  const ranges=mobile?[[68,112],[42,76],[22,42]]:[[92,150],[56,98],[28,52]];
  const [a,b]=ranges[layer];
  return {kind:'puff',layer,x:Math.random()*W,y:Math.random()*H,size:a+Math.random()*(b-a),
    speed:.10+Math.random()*.20,drift:(Math.random()-.5)*.18,phase:Math.random()*6.28,rot:Math.random()*6.28};
}
function makeLoose(){
  return {kind:'loose',x:Math.random()*W,y:Math.random()*H,size:13+Math.random()*20,
    speed:.18+Math.random()*.28,phase:Math.random()*6.28,rot:Math.random()*6.28};
}
let particles=[];
function seedScene(){
  const mobile=W<780;
  particles=[...Array(mobile?10:14)].map(()=>makePuff(0))
    .concat([...Array(mobile?13:18)].map(()=>makePuff(1)))
    .concat([...Array(mobile?13:20)].map(()=>makePuff(2)))
    .concat([...Array(mobile?18:28)].map(()=>makeLoose()));
}
seedScene(); addEventListener('resize',seedScene);

function drawPuff(s){
  ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.rot);
  const intro=document.body.classList.contains('intro-active');
  const alpha=intro?[.88,.72,.58][s.layer]:[.24,.18,.12][s.layer];
  const core=intro?'rgba(111,102,71,.80)':'rgba(84,113,103,.25)';
  ctx.lineCap='round';
  // stem
  ctx.strokeStyle=intro?'rgba(106,117,80,.58)':'rgba(69,111,99,.16)';
  ctx.lineWidth=Math.max(1,s.size/85);
  ctx.beginPath();ctx.moveTo(0,s.size*.12);ctx.quadraticCurveTo(s.size*.05,s.size*.48,s.size*.02,s.size*.88);ctx.stroke();
  // radial seed spokes
  const rays=s.layer===0?34:(s.layer===1?28:22);
  for(let i=0;i<rays;i++){
    const ang=i/rays*Math.PI*2 + Math.sin(i*2.7)*.035;
    const rr=s.size*(.28+.05*Math.sin(i*1.9));
    const x=Math.cos(ang)*rr,y=Math.sin(ang)*rr;
    ctx.strokeStyle=`rgba(255,253,238,${alpha})`;
    ctx.lineWidth=Math.max(.7,s.size/125);
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(x,y);ctx.stroke();
    const br=s.size*.065, tangent=ang+Math.PI/2;
    ctx.beginPath();
    ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(tangent)*br,y+Math.sin(tangent)*br);
    ctx.moveTo(x,y);ctx.lineTo(x-Math.cos(tangent)*br,y-Math.sin(tangent)*br);ctx.stroke();
  }
  ctx.fillStyle=core;ctx.beginPath();ctx.arc(0,0,Math.max(2,s.size*.04),0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function drawLoose(s){
  ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.rot);
  const intro=document.body.classList.contains('intro-active');
  ctx.strokeStyle=intro?'rgba(255,252,234,.82)':'rgba(255,255,255,.16)';
  ctx.fillStyle=intro?'rgba(116,105,76,.66)':'rgba(74,109,98,.16)';
  ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,s.size*.78);ctx.stroke();
  for(let i=0;i<8;i++){
    const a=(i/8)*Math.PI*2, r=s.size*.36;
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.stroke();
  }
  ctx.beginPath();ctx.arc(0,s.size*.8,1.4,0,Math.PI*2);ctx.fill();ctx.restore();
}
function animate(t){
  ctx.clearRect(0,0,W,H);
  for(const s of particles){
    const wind=Math.sin(t*.00035+s.phase)*(.18+(s.layer||0)*.04);
    const dx=mouse.x-s.x,dy=mouse.y-s.y,dist=Math.hypot(dx,dy);
    if(dist<170){const f=(170-dist)/170;s.x-=dx*.004*f;s.y-=dy*.003*f;}
    s.x+=wind+(s.drift||0); s.y-=s.speed*(1+scrollBoost*.75); s.rot+=.00045;
    if(s.y<-s.size*1.4){s.y=H+s.size;s.x=Math.random()*W;}
    if(s.x<-80)s.x=W+60;if(s.x>W+80)s.x=-60;
    s.kind==='puff'?drawPuff(s):drawLoose(s);
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// Running carousel
const runSlides=[...document.querySelectorAll('.run-slide')];
const runDotsWrap=document.getElementById('runDots');
let runCurrent=0,runAutoplay;
runSlides.forEach((_,i)=>{
  const d=document.createElement('span');d.className='dot'+(i===0?' active':'');
  d.addEventListener('click',()=>showRun(i));runDotsWrap.appendChild(d);
});
const runDots=[...runDotsWrap.querySelectorAll('.dot')];
function showRun(i){
  runCurrent=(i+runSlides.length)%runSlides.length;
  runSlides.forEach((s,k)=>s.classList.toggle('active',k===runCurrent));
  runDots.forEach((d,k)=>d.classList.toggle('active',k===runCurrent));
  clearInterval(runAutoplay);runAutoplay=setInterval(()=>showRun(runCurrent+1),5400);
}
document.getElementById('runNext').onclick=()=>showRun(runCurrent+1);
document.getElementById('runPrev').onclick=()=>showRun(runCurrent-1);
runAutoplay=setInterval(()=>showRun(runCurrent+1),5400);

// Scroll animations across the site
const motionTargets=[
  ...document.querySelectorAll('.section-title,.glass,.timeline-item,.panel article,.contact-card,.photo-intro p,.photo-stage,.running-intro p,.run-stage,.run-quote,.section-sub')
];
motionTargets.forEach((el,i)=>{
  el.classList.add('motion-reveal');
  if(el.matches('.timeline-item:nth-child(odd),.photo-stage')) el.classList.add('motion-left');
  if(el.matches('.timeline-item:nth-child(even),.run-stage')) el.classList.add('motion-right');
});
const motionObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('motion-in');motionObserver.unobserve(entry.target);}
  });
},{threshold:.13,rootMargin:'0px 0px -5% 0px'});
motionTargets.forEach(el=>motionObserver.observe(el));

// Gentle parallax on main hero elements while browsing
let ticking=false;
addEventListener('scroll',()=>{
  if(ticking)return;ticking=true;
  requestAnimationFrame(()=>{
    const y=scrollY;
    const copy=document.querySelector('.hero-copy'),avatar=document.querySelector('.avatar');
    if(y<innerHeight*1.15){
      copy.style.transform=`translateY(${y*.055}px)`;
      avatar.style.transform=`translateY(${y*.085}px) rotate(${Math.min(y*.002,1.2)}deg)`;
    }
    ticking=false;
  });
},{passive:true});
