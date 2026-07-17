const GLYPHS=' .·:;+*xX#%@';
const TAU=Math.PI*2;
export class AsciiOrganism{
  constructor(canvas){
    this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});
    this.pointer={x:.5,y:.5};this.time=0;this.frame=0;this.running=true;
    this.reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.resize=()=>{const size=innerWidth<640?7:9;this.cell=size;this.cols=Math.ceil(innerWidth/size);this.rows=Math.ceil(innerHeight/(size*1.45));this.canvas.width=innerWidth;this.canvas.height=innerHeight;this.ctx.font=`${size}px "DM Mono",monospace`;this.ctx.textBaseline='top'};
    this.resize();addEventListener('resize',this.resize,{passive:true});
    addEventListener('pointermove',e=>{this.pointer.x=e.clientX/innerWidth;this.pointer.y=e.clientY/innerHeight},{passive:true});
    document.addEventListener('visibilitychange',()=>this.running=!document.hidden);
    this.loop();
  }
  field(x,y,t){
    const nx=x/this.cols*2-1,ny=y/this.rows*2-1;
    const px=this.pointer.x*2-1,py=this.pointer.y*2-1;
    const breathe=.82+Math.sin(t*.72)*.16;
    const angle=Math.atan2(ny,nx),radius=Math.hypot(nx*.92,ny);
    const membrane=Math.sin((radius-breathe)*22-Math.sin(angle*3+t)*2.8);
    const cellA=Math.sin(nx*8+Math.sin(ny*5+t)*2.2);
    const cellB=Math.cos(ny*9-Math.cos(nx*4-t*.7)*2.4);
    const spiral=Math.sin(angle*5-radius*15+t*1.5);
    const cursor=Math.exp(-Math.hypot(nx-px,ny-py)*5)*Math.sin(radius*30-t*3);
    return membrane*.34+cellA*.22+cellB*.2+spiral*.16+cursor*.55;
  }
  draw(){
    const c=this.ctx,t=this.reduce?1.7:this.time;
    c.fillStyle='#0b0b0a';c.fillRect(0,0,this.canvas.width,this.canvas.height);
    for(let y=0;y<this.rows;y++)for(let x=0;x<this.cols;x++){
      const v=this.field(x,y,t),n=Math.max(0,Math.min(1,(v+1)/2));
      const g=GLYPHS[Math.floor(n*(GLYPHS.length-1))];
      const hue=32+n*42+Math.sin(t+x*.01)*8;
      const light=25+n*55;
      c.fillStyle=`hsl(${hue} 88% ${light}%)`;
      c.globalAlpha=.18+n*.72;
      c.fillText(g,x*this.cell,y*this.cell*1.45);
    }
    c.globalAlpha=1;
  }
  loop=()=>{requestAnimationFrame(this.loop);if(!this.running)return;if(!this.reduce)this.time+=.012;this.draw()}
  destroy(){this.running=false;removeEventListener('resize',this.resize)}
}
