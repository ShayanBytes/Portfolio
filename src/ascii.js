const GLYPHS=' .·:;+*xX#%@';
const ROUTE_SHAPES={
  enter:['cell','hand','spiral','bloom','wave'],
  home:['brackets','bloom','terminal','wave'],
  work:['folder','monitor','terminal','folders'],
  about:['profile','hand','cell','brackets'],
  contact:['signal','envelope','wave','bloom']
};
const PALETTES={
  enter:[28,74],home:[155,205],work:[35,58],about:[195,245],contact:[5,42]
};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,x)=>{x=clamp((x-a)/(b-a));return x*x*(3-2*x)};
const ellipse=(x,y,cx,cy,rx,ry)=>1-Math.hypot((x-cx)/rx,(y-cy)/ry);
const box=(x,y,cx,cy,rx,ry)=>1-Math.max(Math.abs(x-cx)/rx,Math.abs(y-cy)/ry);
const ring=(v,w=.1)=>1-Math.abs(v)/w;

export class AsciiOrganism{
  constructor(canvas,route='enter'){
    this.canvas=canvas;this.route=route;this.ctx=canvas.getContext('2d',{alpha:true});
    this.pointer={x:.5,y:.5};this.time=0;this.running=true;
    this.reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.resize=()=>{const size=innerWidth<640?7:9;this.cell=size;this.cols=Math.ceil(innerWidth/size);this.rows=Math.ceil(innerHeight/(size*1.45));this.canvas.width=innerWidth;this.canvas.height=innerHeight;this.ctx.font=`${size}px "DM Mono",monospace`;this.ctx.textBaseline='top'};
    this.onPointer=e=>{this.pointer.x=e.clientX/innerWidth;this.pointer.y=e.clientY/innerHeight};
    this.onVisibility=()=>this.running=!document.hidden;
    this.resize();addEventListener('resize',this.resize,{passive:true});
    addEventListener('pointermove',this.onPointer,{passive:true});
    document.addEventListener('visibilitychange',this.onVisibility);
    this.loop();
  }
  shape(name,x,y,t){
    const pulse=1+Math.sin(t*.75)*.08;
    if(name==='cell') return ring(ellipse(x,y,0,0,.65*pulse,.72*pulse),.2)+ellipse(x,y,.13,-.08,.18,.23)*.7;
    if(name==='spiral'){const a=Math.atan2(y,x),r=Math.hypot(x,y);return .78-Math.abs(Math.sin(a*3-r*12+t))*1.2-r*.45}
    if(name==='bloom'){const a=Math.atan2(y,x),r=Math.hypot(x,y);return .8-r*1.2+Math.cos(a*7+t)*.23+Math.sin(r*18-t)*.12}
    if(name==='wave') return Math.sin(x*7+t*1.4)+Math.cos(y*8-t*.9)-Math.hypot(x,y)*.65;
    if(name==='hand'){
      let v=ellipse(x,y,.02,.24,.31,.38);
      v=Math.max(v,ellipse(x,y,-.27,-.05,.11,.43));
      v=Math.max(v,ellipse(x,y,-.09,-.18,.095,.53));
      v=Math.max(v,ellipse(x,y,.09,-.2,.09,.5));
      v=Math.max(v,ellipse(x,y,.26,-.12,.085,.41));
      v=Math.max(v,ellipse(x,y,.38,.17,.12,.33));
      return v;
    }
    if(name==='folder'){const body=box(x,y,0,.08,.65,.42),tab=box(x,y,-.34,-.38,.25,.12);return Math.max(ring(body,.1),ring(tab,.12),body*.16)}
    if(name==='folders'){return Math.max(this.shape('folder',x+.18,y+.12,t),this.shape('folder',x-.18,y-.14,t+1)*.8)}
    if(name==='monitor'){const screen=box(x,y,0,-.08,.63,.4),stand=box(x,y,0,.45,.08,.19),base=box(x,y,0,.64,.3,.055);return Math.max(ring(screen,.09),stand,base)+Math.sin(x*18+t)*screen*.16}
    if(name==='terminal'){const frame=box(x,y,0,0,.67,.48),prompt=box(x,y,-.3,.05,.22,.035),caret=box(x,y,.04,.05,.025,.1);return Math.max(ring(frame,.08),prompt,caret*(.5+.5*Math.sin(t*4)))}
    if(name==='brackets'){const l=Math.max(box(x,y,-.48,0,.05,.52),box(x,y,-.35,-.47,.18,.05),box(x,y,-.35,.47,.18,.05));return Math.max(l,this.shape('bracketsRight',x,y,t))}
    if(name==='bracketsRight')return Math.max(box(x,y,.48,0,.05,.52),box(x,y,.35,-.47,.18,.05),box(x,y,.35,.47,.18,.05));
    if(name==='profile'){const skull=ellipse(x,y,.02,-.18,.34,.43),neck=box(x,y,.1,.36,.18,.28),shoulders=ellipse(x,y,0,.7,.7,.32);return Math.max(ring(skull,.12),neck*.55,shoulders*.45)}
    if(name==='signal'){const r=Math.hypot(x,y);return Math.max(ring(r-.22,.08),ring(r-.48,.08),ring(r-.74,.08),ellipse(x,y,0,0,.06,.06))}
    if(name==='envelope'){const frame=box(x,y,0,0,.67,.43),diag=1-Math.abs(Math.abs(y+.04)-Math.abs(x)*.56)/.08;return Math.max(ring(frame,.08),diag*frame)}
    return 0;
  }
  field(x,y,t){
    let nx=x/this.cols*2-1,ny=y/this.rows*2-1;
    const zoom=1+.18*Math.sin(t*.38)+.08*Math.sin(t*1.13);
    nx*=zoom;ny*=zoom;
    const shapes=ROUTE_SHAPES[this.route]||ROUTE_SHAPES.enter;
    const cycle=t/5.4,index=Math.floor(cycle)%shapes.length,next=(index+1)%shapes.length;
    const mix=smooth(.18,.82,cycle-Math.floor(cycle));
    const a=this.shape(shapes[index],nx,ny,t),b=this.shape(shapes[next],nx,ny,t);
    const px=this.pointer.x*2-1,py=this.pointer.y*2-1;
    const cursor=Math.exp(-Math.hypot(nx-px,ny-py)*5)*Math.sin(Math.hypot(nx-px,ny-py)*28-t*3)*.42;
    const texture=Math.sin(nx*11+Math.sin(ny*6+t)*2)*.1+Math.cos(ny*12-t*.7)*.08;
    return a*(1-mix)+b*mix+cursor+texture;
  }
  draw(){
    const c=this.ctx,t=this.reduce?2.2:this.time,[h0,h1]=PALETTES[this.route]||PALETTES.enter;
    c.clearRect(0,0,this.canvas.width,this.canvas.height);
    for(let y=0;y<this.rows;y++)for(let x=0;x<this.cols;x++){
      const v=this.field(x,y,t),n=clamp((v+.3)/1.35);
      if(n<.08)continue;
      const g=GLYPHS[Math.floor(n*(GLYPHS.length-1))];
      const hue=h0+(h1-h0)*n+Math.sin(t*.5+x*.018)*7;
      c.fillStyle=`hsl(${hue} 84% ${28+n*54}%)`;c.globalAlpha=.1+n*.86;
      c.fillText(g,x*this.cell,y*this.cell*1.45);
    }
    c.globalAlpha=1;
  }
  loop=()=>{requestAnimationFrame(this.loop);if(!this.running)return;if(!this.reduce)this.time+=.014;this.draw()}
  destroy(){this.running=false;removeEventListener('resize',this.resize);removeEventListener('pointermove',this.onPointer);document.removeEventListener('visibilitychange',this.onVisibility)}
}
