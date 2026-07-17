import './styles.css';
import {AsciiOrganism} from './ascii.js';
import {render,resolve} from './router.js';
const app=document.querySelector('#app');let route;let organism;
function mount(){
  route=resolve();document.body.dataset.route=route;app.innerHTML=render(route);
  organism?.destroy();organism=null;
  const canvas=document.querySelector('#ascii-world');
  if(canvas)organism=new AsciiOrganism(canvas,route);
  requestAnimationFrame(()=>document.body.classList.add('ready'));
  app.focus?.();
}
function navigate(href,push=true){
  const base=import.meta.env.BASE_URL.replace(/\/$/,'');
  const target=href.startsWith(base)?href:`${base}${href}`;
  document.body.classList.remove('ready');document.body.classList.add('leaving');
  setTimeout(()=>{if(push)history.pushState({},'',target);scrollTo(0,0);document.body.classList.remove('leaving');mount()},320);
}
document.addEventListener('click',e=>{const link=e.target.closest('[data-link]');if(!link)return;e.preventDefault();navigate(link.getAttribute('href'))});
addEventListener('popstate',()=>navigate(location.pathname,false));
const recovered=new URLSearchParams(location.search).get('route');if(recovered)history.replaceState({},'',`${import.meta.env.BASE_URL}${recovered}`);
mount();
