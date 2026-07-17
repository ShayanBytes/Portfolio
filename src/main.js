import './styles.css';import gsap from 'gsap';import Lenis from '@studio-freight/lenis';import {World} from './world.js';import {resolve,render} from './router.js';
const app=document.querySelector('#app'),veil=document.querySelector('#veil'),menu=document.querySelector('#menu'),toggle=document.querySelector('.menu-toggle'),cursor=document.querySelector('.cursor');
const recovered=new URLSearchParams(location.search).get('route');
if(recovered) history.replaceState({},'',`${import.meta.env.BASE_URL}${recovered}`);
const world=new World(document.querySelector('#world'));const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let route=resolve();
const lenis=reduced?null:new Lenis({duration:1.15,smoothWheel:true});function raf(t){lenis?.raf(t);requestAnimationFrame(raf)}requestAnimationFrame(raf);
function closeMenu(){menu.classList.remove('open');toggle.setAttribute('aria-expanded','false')};toggle.onclick=()=>{const open=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open))};
function initPage(){world.route(route);document.body.dataset.route=route;document.querySelector('[data-route-code]').textContent=`0${['home','work','about','laboratory','archive','contact'].indexOf(route)+1} / ${route.toUpperCase()}`;document.querySelectorAll('.split').forEach(el=>{const txt=el.innerHTML;el.innerHTML=`<span>${txt}</span>`});gsap.fromTo('.split>span',{yPercent:110},{yPercent:0,duration:1.15,stagger:.08,ease:'power4.out'});gsap.fromTo('.reveal',{y:45,opacity:0},{y:0,opacity:1,duration:.9,stagger:.08,delay:.25,ease:'power3.out'});document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-mode]').forEach(x=>x.classList.remove('active'));b.classList.add('active');world.mode(b.dataset.mode)});document.querySelectorAll('.magnet').forEach(el=>{el.onpointermove=e=>{const r=el.getBoundingClientRect();gsap.to(el,{x:(e.clientX-r.left-r.width/2)*.12,y:(e.clientY-r.top-r.height/2)*.12,duration:.4})};el.onpointerleave=()=>gsap.to(el,{x:0,y:0,duration:.7,ease:'elastic.out(1,.4)'})});const time=document.querySelector('[data-time]');if(time){const tick=()=>time.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date());tick();setInterval(tick,1000)}initAscii();}
function navigate(url,push=true){
  const base=import.meta.env.BASE_URL.replace(/\/$/,'');
  const target=url.startsWith(base)?url:`${base}${url}`;
  const next=target.split('/').filter(Boolean).pop()||'home';
  if(next===route){closeMenu();return}
  gsap.to(veil,{scaleY:1,duration:.65,ease:'power4.inOut',onComplete:()=>{
    if(push)history.pushState({},'',target);
    route=resolve();app.innerHTML=render(route);scrollTo(0,0);closeMenu();initPage();
    gsap.set(veil,{transformOrigin:'top'});
    gsap.to(veil,{scaleY:0,duration:.7,ease:'power4.inOut',onComplete:()=>gsap.set(veil,{transformOrigin:'bottom'})});
  }});
}
document.addEventListener('click',e=>{const a=e.target.closest('[data-link]');if(!a)return;e.preventDefault();navigate(a.getAttribute('href'))});addEventListener('popstate',()=>navigate(location.pathname,false));
function initAscii(){const c=document.querySelector('#ascii');if(!c)return;const img=c.previousElementSibling,ctx=c.getContext('2d');const chars=' .·:+*#%@';let mx=.5;const draw=()=>{const w=70,h=Math.round(w*1.3);c.width=w;c.height=h;ctx.drawImage(img,0,0,w,h);const d=ctx.getImageData(0,0,w,h).data;ctx.clearRect(0,0,w,h);ctx.font='2px monospace';ctx.fillStyle='#d9ff43';for(let y=0;y<h;y+=2)for(let x=0;x<w;x++){const i=(y*w+x)*4,b=(d[i]+d[i+1]+d[i+2])/765;ctx.fillText(chars[Math.floor(b*(chars.length-1))],x,y)}c.style.opacity=String(1-Math.abs(mx-.5)*2)};img.onload=draw;if(img.complete)draw();c.parentElement.onpointermove=e=>{const r=c.getBoundingClientRect();mx=(e.clientX-r.left)/r.width;c.style.clipPath=`inset(0 ${Math.max(0,(1-mx)*100)}% 0 0)`}}
if(matchMedia('(hover:hover)').matches){addEventListener('pointermove',e=>gsap.to(cursor,{x:e.clientX,y:e.clientY,duration:.25,ease:'power2.out'}));document.addEventListener('mouseover',e=>cursor.classList.toggle('active',!!e.target.closest('a,button')))}
app.innerHTML=render(route);initPage();
