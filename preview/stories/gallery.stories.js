import { mountArc } from "../../canvas-animations/arc.js";
import { mountSpiral } from "../../canvas-animations/spiral.js";
let sequence = 0;
function renderCanvas(kind, maxDpr=2) {
  const root=document.createElement("div");
  root.style.cssText="background:#000;color:#fff;min-height:100vh;display:grid;place-items:center;padding:18px;font-family:system-ui,sans-serif;";
  const view=document.createElement("div");
  view.style.cssText=kind==="Arc" ? "width:min(100%,1280px);aspect-ratio:1280/860;overflow:hidden;" : "width:min(100%,672px);aspect-ratio:1;overflow:hidden;";
  const canvas=document.createElement("canvas");
  canvas.id="awful-gallery-"+(++sequence);
  canvas.setAttribute("aria-label",kind+" gallery");
  canvas.style.cssText="display:block;width:100%;height:100%";
  view.append(canvas);root.append(view);
  requestAnimationFrame(async ()=>{
    if(!root.isConnected)return;
    const dispose=await (kind==="Arc"?mountArc:mountSpiral)(canvas.id,{maxDpr});
    if(!root.isConnected){dispose();return;}
    const observer=new MutationObserver(()=>{
      if(!root.isConnected){dispose();observer.disconnect();}
    });
    observer.observe(document.body,{childList:true,subtree:true});
  });
  return root;
}
export default {title:"Animations/Canvas galleries",argTypes:{maxDpr:{control:{type:"range",min:1,max:3,step:.5}}}};
export const Arc={args:{maxDpr:2},render:args=>renderCanvas("Arc",args.maxDpr)};
export const Spiral={args:{maxDpr:2},render:args=>renderCanvas("Spiral",args.maxDpr)};
export const ArcNativeDpr={args:{maxDpr:3},render:args=>renderCanvas("Arc",args.maxDpr)};
export const SpiralLowDpr={args:{maxDpr:1},render:args=>renderCanvas("Spiral",args.maxDpr)};
