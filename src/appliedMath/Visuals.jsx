import React, { useState } from "react";
import { parseNumber } from "./model.js";

const fmt = value => Number(value.toFixed(3)).toLocaleString("de-DE");
function Slider({label,value,onChange,min=-2,max=2,step=0.25}) {
  return <label className="am-slider">{label}: {fmt(value)}<input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/></label>;
}
function Plot({label,children}) {
  return <svg className="am-plot" viewBox="0 0 360 300" role="img" aria-label={label}>
    <path d="M20 150H340M180 20V280" stroke="#8996a7"/><text x="340" y="145">x</text><text x="188" y="25">y</text>
    {children}
  </svg>;
}
export function Contours() {
  const [x,setX]=useState(1),[y,setY]=useState(0.5),[angle,setAngle]=useState(45);
  const vx=Math.cos(angle*Math.PI/180),vy=Math.sin(angle*Math.PI/180);
  const px=180+45*x,py=150-45*y,gx=2*x,gy=4*y;
  return <section className="am-panel"><h3>Niveaulinien untersuchen</h3><p>f=x²+2y². Durchgezogener Pfeil: Gradient, gestrichelter Pfeil: normierte Richtung v. Pfeile sind zur Lesbarkeit skaliert.</p>
    <Plot label={`Ellipsen von f=x²+2y²; Punkt (${x};${y}), Gradient (${gx};${gy})`}>
      <defs>{[["gradient","#006edb"],["direction","#a33e11"]].map(([id,color])=><marker key={id} id={`am-${id}`} viewBox="0 0 8 8" refX="8" refY="4" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill={color}/></marker>)}</defs>
      {[1,2,4,8].map(c=><g key={c}><ellipse cx="180" cy="150" rx={45*Math.sqrt(c)} ry={45*Math.sqrt(c/2)} fill="none" stroke="#bccbe4"/><text x={183+45*Math.sqrt(c)} y="166">{c}</text></g>)}
      <path d={`M${px} ${py}l${gx*15} ${-gy*15}`} stroke="#006edb" strokeWidth="4" markerEnd="url(#am-gradient)"/>
      <path d={`M${px} ${py}l${vx*55} ${-vy*55}`} stroke="#a33e11" strokeDasharray="6 4" strokeWidth="3" markerEnd="url(#am-direction)"/>
      <circle cx={px} cy={py} r="5" fill="#182335"/><text x={px+7} y={py-7}>P</text>
      <text x="20" y="290">Gradient ━ · Richtung ┄</text>
    </Plot>
    <Slider label="Punkt x" value={x} onChange={setX}/><Slider label="Punkt y" value={y} onChange={setY}/><Slider label="Richtungswinkel in Grad" value={angle} onChange={setAngle} min={0} max={360} step={15}/>
    <p className="am-formula">f(P)={fmt(x*x+2*y*y)}; ∇f=({fmt(gx)}; {fmt(gy)}); v=({fmt(vx)}; {fmt(vy)})</p><p>Dᵥf={fmt(gx)}·{fmt(vx)}+{fmt(gy)}·{fmt(vy)}={fmt(gx*vx+gy*vy)}. {gx===0&&gy===0?"Nullgradient: keine ausgezeichnete Richtung.":"Der Gradient steht senkrecht zur Ellipse durch P."}</p>
  </section>;
}

export function Optimization() {
  const [eta,setEta]=useState(0.1),[point,setPoint]=useState([2,1]),[answer,setAnswer]=useState(["",""]),[feedback,setFeedback]=useState("");
  const next=[point[0]*(1-2*eta),point[1]*(1-8*eta)];
  return <section className="am-panel"><h3>Nächsten Optimierungsschritt vorhersagen</h3><p>f=x²+4y², Gradient (2x;8y). Berechne den nächsten Punkt, bevor du ihn einblendest. Diese Erkundung zählt nicht als Leistungsnachweis.</p>
    <Plot label={`Optimierung, aktueller Punkt (${fmt(point[0])};${fmt(point[1])})`}>
      {[1,4,9].map(c=><ellipse key={c} cx="180" cy="150" rx={40*Math.sqrt(c)} ry={20*Math.sqrt(c)} fill="none" stroke="#bccbe4"/>)}
      <circle cx={180+40*point[0]} cy={150-40*point[1]} r="6" fill="#006edb"/><text x="25" y="35">P=({fmt(point[0])};{fmt(point[1])})</text>
    </Plot>
    <Slider label="Lernrate η" value={eta} onChange={value=>{setEta(value);setFeedback("");}} min={0.05} max={0.3} step={0.05}/>
    <div className="am-fields">{answer.map((value,i)=><label key={i}>Vorhersage {i===0?"x":"y"}<input value={value} onChange={e=>setAnswer(answer.map((a,j)=>j===i?e.target.value:a))}/></label>)}</div>
    <button onClick={()=>setFeedback(answer.every((a,i)=>parseNumber(a)!==null&&Math.abs(parseNumber(a)-next[i])<0.001)?`Richtig: (${fmt(next[0])};${fmt(next[1])}).`:`Rechne P−η(2x;8y). Ergebnis: (${fmt(next[0])};${fmt(next[1])}).`)}>Vorhersage prüfen</button>
    {feedback&&<><p role="status">{feedback}</p><button onClick={()=>{setPoint(next);setAnswer(["",""]);setFeedback("");}}>Schritt übernehmen</button></>}
    <button onClick={()=>{setPoint([2,1]);setFeedback("");}}>Visualisierung zurücksetzen</button><p>Nur für dieses quadratische Problem: 0&lt;η&lt;0,25. Bei η=0,25 oszilliert die y-Komponente; oberhalb wächst ihr Betrag.</p>
  </section>;
}

export function PointCloud() {
  const [points,setPoints]=useState([[-2,-1],[0,0],[2,1]]);
  const mean=[0,1].map(j=>points.reduce((sum,p)=>sum+p[j],0)/points.length);
  const centered=points.map(p=>p.map((v,j)=>v-mean[j]));
  const a=centered.reduce((s,p)=>s+p[0]*p[0],0)/3,b=centered.reduce((s,p)=>s+p[0]*p[1],0)/3,d=centered.reduce((s,p)=>s+p[1]*p[1],0)/3;
  const angle=Math.atan2(2*b,a-d)/2,l1=(a+d+Math.hypot(a-d,2*b))/2;
  const move=(index,x,y)=>setPoints(old=>old.map((p,i)=>i===index?[Math.max(-3,Math.min(3,x)),Math.max(-2.5,Math.min(2.5,y))]:p));
  const pointer=(e,i)=>{if(e.buttons!==1 && e.type!=="pointerdown")return;const rect=e.currentTarget.ownerSVGElement.getBoundingClientRect();move(i,((e.clientX-rect.left)*360/rect.width-180)/45,(150-(e.clientY-rect.top)*300/rect.height)/45);};
  return <section className="am-panel"><h3>Punktwolke und Hauptachse</h3><p>Ziehe einen Punkt mit Maus/Touch oder verwende die Regler. Die Daten werden nach jeder Änderung neu zentriert. Rechenaufgaben verwenden davon unabhängige feste Daten.</p>
    <Plot label="Verschiebbare Punktwolke, Achse durch den Mittelwert">
      {a+d>0&&<line x1={180+45*mean[0]-100*Math.cos(angle)} y1={150-45*mean[1]+100*Math.sin(angle)} x2={180+45*mean[0]+100*Math.cos(angle)} y2={150-45*mean[1]-100*Math.sin(angle)} stroke="#006edb" strokeWidth="3"/>}
      {points.map((p,i)=><g key={i}><circle cx={180+45*p[0]} cy={150-45*p[1]} r="12" fill="#18324c" style={{touchAction:"none",cursor:"grab"}} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);pointer(e,i);}} onPointerMove={e=>pointer(e,i)}/><text x={195+45*p[0]} y={150-45*p[1]}>{i+1}</text></g>)}
    </Plot>
    {points.map((p,i)=><div className="am-columns" key={i}><Slider label={`Punkt ${i+1} x`} value={p[0]} onChange={x=>move(i,x,p[1])} min={-3} max={3}/><Slider label={`Punkt ${i+1} y`} value={p[1]} onChange={y=>move(i,p[0],y)} min={-2.5} max={2.5}/></div>)}
    <p>μ=({fmt(mean[0])};{fmt(mean[1])}); Σ=[[{fmt(a)};{fmt(b)}],[{fmt(b)};{fmt(d)}]] (Teiler n=3).</p><p>λ₁={fmt(l1)}; erklärter Anteil: {a+d>0?`${fmt(100*l1/(a+d))} %`:"nicht definiert (keine Streuung)"}. {Math.hypot(a-d,2*b)<1e-8?"Gleiche Eigenwerte: keine eindeutige erste Achse.":"Die Achse und ihre Gegenrichtung beschreiben dieselbe Projektionsgerade."}</p>
  </section>;
}

export function Region() {
  const [horizontal,setHorizontal]=useState(false),[position,setPosition]=useState(0.5),[answer,setAnswer]=useState(""),[show,setShow]=useState(false);
  const correct=horizontal?1:position;
  return <section className="am-panel"><h3>Ein Gebiet in Streifen zerlegen</h3><p>Dreieck mit Ecken (0,0),(1,0),(1,1). Ein Streifen hält die äußere Variable fest. Trage die obere Grenze der inneren Variable für den gezeigten Streifen ein.</p>
    <svg className="am-plot" viewBox="0 0 360 270" role="img" aria-label={horizontal?"Horizontaler Streifen im Dreieck":"Vertikaler Streifen im Dreieck"}>
      <path d="M50 220L270 220L270 30Z" fill="#e4eefb" stroke="#006edb"/>
      <path d={horizontal?`M${50+position*220} ${220-position*190}H270`:`M${50+position*220} 220V${220-position*190}`} stroke="#a33e11" strokeWidth="5"/>
      <text x="35" y="245">0</text><text x="265" y="245">1 · x</text><text x="275" y="30">(1,1)</text><text x="115" y="105">y=x</text>
    </svg>
    <button aria-pressed={horizontal} onClick={()=>{setHorizontal(!horizontal);setShow(false);setAnswer("");}}>Streifen wechseln: {horizontal?"horizontal, zuerst dx":"vertikal, zuerst dy"}</button>
    <Slider label={horizontal?"Festes y":"Festes x"} min={0} max={1} step={0.1} value={position} onChange={p=>{setPosition(p);setShow(false);}}/>
    <label>Obere innere Grenze<input value={answer} onChange={e=>setAnswer(e.target.value)}/></label><button onClick={()=>setShow(true)}>Grenze prüfen</button>
    {show&&<p role="status">{parseNumber(answer)!==null&&Math.abs(parseNumber(answer)-correct)<0.001?"Richtig. ":"Noch prüfen: "}{horizontal?`Für festes y=${fmt(position)} läuft x von ${fmt(position)} bis 1. Gesamt: ∫₀¹∫ᵧ¹ f dx dy.`:`Für festes x=${fmt(position)} läuft y von 0 bis ${fmt(position)}. Gesamt: ∫₀¹∫₀ˣ f dy dx.`}</p>}
  </section>;
}

export function Graph({variant}) {
  if(variant==="polynomial")return <figure className="am-graph"><svg viewBox="0 0 540 180" role="img" aria-label="Aufgabengraph: x und y gehen sowohl zu v₁=x+y als auch zu v₂=x−y. Beide Zwischenknoten führen zum Produkt L=v₁v₂.">
    <defs><marker id="am-graph-arrow" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#6b82a1"/></marker></defs>
    {["M80 45H220","M80 45L220 135","M80 135L220 45","M80 135H220","M310 45L440 90","M310 135L440 90"].map(path=><path key={path} d={path} fill="none" stroke="#6b82a1" strokeWidth="2" markerEnd="url(#am-graph-arrow)"/>)}
    {[[45,45,"x"],[45,135,"y"],[265,45,"v₁=x+y"],[265,135,"v₂=x−y"],[480,90,"L=v₁v₂"]].map(([x,y,label])=><g key={label}><rect x={x-40} y={y-18} width="80" height="36" rx="8" fill="#e4eefb"/><text x={x} y={y+5} textAnchor="middle">{label}</text></g>)}
    </svg><figcaption>Fülle die Knotenwerte und die gleichnamigen Adjoints in den Feldern darunter aus. Ein Überstrich bezeichnet den Adjoint ∂L/∂Knoten.</figcaption></figure>;
  return <figure className="am-graph"><svg viewBox="0 0 540 130" role="img" aria-label="Verzweigter Beispielgraph: x und y führen zu v=x+y; v und x führen zu L=v²+x. Die Aufgaben darunter haben eigene Graphen.">
    <path d="M70 35L250 65M70 105L250 65M300 65H440M70 35Q300 -15 465 45" fill="none" stroke="#6b82a1" strokeWidth="2"/>
    {[[45,30,"x"],[45,105,"y"],[250,65,"v=x+y"],[460,65,"L=v²+x"]].map(([x,y,label])=><g key={label}><rect x={x-35} y={y-18} width={label.length>3?90:65} height="34" rx="8" fill="#e4eefb"/><text x={x} y={y+5} textAnchor="middle">{label}</text></g>)}
  </svg><figcaption>Beispiel: Rückwärts fließen zu x Beiträge über v und über die direkte Kante. Die Knoten und Adjoints der jeweiligen Aufgabe trägst du unten einzeln ein.</figcaption></figure>;
}
