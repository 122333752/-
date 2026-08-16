
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

// Generic scroll reveal
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.animate(
        [{opacity:0,transform:'translateY(35px)'},{opacity:1,transform:'none'}],
        {duration:720,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'}
      );
      io.unobserve(e.target);
    }
  });
},{threshold:.12});
document.querySelectorAll('.section-title,.glass,.timeline-item,.contact-card').forEach(el=>io.observe(el));

// Photography reveal
const photoObserver=new IntersectionObserver(entries=>{
  entries.forEach((e,idx)=>{
    if(e.isIntersecting){
      setTimeout(()=>e.target.classList.add('visible'), idx*80);
      photoObserver.unobserve(e.target);
    }
  });
},{threshold:.15});
document.querySelectorAll('.reveal-photo').forEach(el=>photoObserver.observe(el));

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

// Large floating dandelion canvas animation
const canvas=document.getElementById('dandelion'),ctx=canvas.getContext('2d');
let W,H,scrollBoost=0,mouse={x:-999,y:-999};

function resize(){
  const dpr=Math.min(2,devicePixelRatio||1);
  canvas.width=innerWidth*dpr;
  canvas.height=innerHeight*dpr;
  canvas.style.width=innerWidth+'px';
  canvas.style.height=innerHeight+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
  W=innerWidth;
  H=innerHeight;
}
resize();
addEventListener('resize',resize);
addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY});
addEventListener('scroll',()=>{scrollBoost=Math.min(2.2,scrollY/innerHeight)});

function makeSeed(layer){
  const ranges=[[115,210],[65,125],[30,70]];
  const [a,b]=ranges[layer];
  return {
    layer,
    x:Math.random()*W,
    y:H+Math.random()*H,
    size:a+Math.random()*(b-a),
    speed:(.15+Math.random()*.22)*(1+layer*.25),
    phase:Math.random()*6.28,
    rot:Math.random()*6.28,
    rotSpeed:(Math.random()-.5)*.0018
  };
}
const seeds=[...Array(5)].map(()=>makeSeed(0))
  .concat([...Array(8)].map(()=>makeSeed(1)),[...Array(12)].map(()=>makeSeed(2)));

function drawSeed(s){
  ctx.save();
  ctx.translate(s.x,s.y);
  ctx.rotate(s.rot);
  const alpha=[.8,.58,.34][s.layer];
  ctx.strokeStyle=`rgba(255,255,255,${alpha})`;
  ctx.fillStyle=`rgba(255,255,255,${alpha})`;
  ctx.shadowColor='white';
  ctx.shadowBlur=[28,18,9][s.layer];
  ctx.lineWidth=Math.max(1,s.size/70);

  ctx.beginPath();
  ctx.moveTo(0,s.size*.16);
  ctx.quadraticCurveTo(s.size*.04,s.size*.42,0,s.size*.72);
  ctx.stroke();

  const rays=20;
  for(let i=0;i<rays;i++){
    const ang=i/rays*Math.PI*2;
    const r=s.size*.24;
    const x=Math.cos(ang)*r,y=Math.sin(ang)*r;
    ctx.beginPath();
    ctx.moveTo(0,0);ctx.lineTo(x,y);ctx.stroke();

    const tangent=ang+Math.PI/2;
    const br=s.size*.055;
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x+Math.cos(tangent)*br,y+Math.sin(tangent)*br);
    ctx.moveTo(x,y);
    ctx.lineTo(x-Math.cos(tangent)*br,y-Math.sin(tangent)*br);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(0,0,s.size*.028,0,Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function animate(t){
  ctx.clearRect(0,0,W,H);
  for(const s of seeds){
    const wind=Math.sin(t*.00032+s.phase)*(.24+s.layer*.08);
    const dx=mouse.x-s.x,dy=mouse.y-s.y,dist=Math.hypot(dx,dy);
    if(dist<220){
      const force=(220-dist)/220;
      s.x-=dx*.008*force;
      s.y-=dy*.004*force;
    }
    s.x+=wind*(1+scrollBoost*.8);
    s.y-=s.speed*(1+scrollBoost*1.25);
    s.rot+=s.rotSpeed*(1+scrollBoost);
    if(s.y<-s.size*1.5){
      Object.assign(s,makeSeed(s.layer));
      s.y=H+s.size;
    }
    drawSeed(s);
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);


// Running section reveal animation
const runObserver=new IntersectionObserver(entries=>{
  entries.forEach((entry,idx)=>{
    if(entry.isIntersecting){
      setTimeout(()=>entry.target.classList.add('visible'), idx*90);
      runObserver.unobserve(entry.target);
    }
  });
},{threshold:.14});
document.querySelectorAll('.reveal-run').forEach(el=>runObserver.observe(el));
