import test from "node:test";
import assert from "node:assert/strict";
import { units, capstones } from "./data.js";
import { exams } from "./exams.js";

// Independent oracles operate on functions/data, never on displayed solutions.
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const transpose=a=>a[0].map((_,j)=>a.map(row=>row[j]));
const multiply=(a,b)=>a.map(row=>transpose(b).map(column=>dot(row,column)));
const mv=(a,b)=>a.map(row=>dot(row,b));
const derivative=(fn,x,i=0)=>{const h=1e-5,a=[...x],b=[...x];a[i]+=h;b[i]-=h;return (fn(...a)-fn(...b))/(2*h);};
function integral(fn,a,b,n=400) {
  const h=(b-a)/n;let sum=fn(a)+fn(b);
  for(let i=1;i<n;i++)sum+=(i%2?4:2)*fn(a+i*h);
  return sum*h/3;
}
const doubleIntegral=(fn,a,b,lower,upper)=>integral(x=>integral(y=>fn(x,y),lower(x),upper(x),100),a,b,100);
function regression(X,y) {
  const M=multiply(transpose(X),X),d=mv(transpose(X),y),det=M[0][0]*M[1][1]-M[0][1]*M[1][0];
  const beta=[(d[0]*M[1][1]-d[1]*M[0][1])/det,(M[0][0]*d[1]-M[1][0]*d[0])/det];
  const residual=y.map((v,i)=>v-dot(X[i],beta));
  return {M,d,beta,rss:dot(residual,residual)};
}
function covariance(data) {
  const mean=transpose(data).map(column=>column.reduce((s,v)=>s+v,0)/data.length);
  const centered=data.map(row=>row.map((v,i)=>v-mean[i]));
  return {mean,matrix:multiply(transpose(centered),centered).map(row=>row.map(v=>v/data.length))};
}
function check(id,values) {
  const task=[...units.flatMap(u=>u.tasks),...capstones,...exams.flatMap(e=>e.tasks)].find(t=>t.id===id);
  assert.ok(task,id);assert.equal(task.fields.length,values.length,id);
  task.fields.forEach((field,i)=>assert.ok(Math.abs(field.answer-values[i])<1e-4,`${id} ${field.label}: data ${field.answer}, oracle ${values[i]}`));
}

test("all 27 script exercises independently recomputed",()=>{
  check("1.1-1",[-1,1,Math.sqrt(1),Math.sqrt(1)]);
  const z=dot([1,2,-1],[2,-1,3])-2;check("1.2-1",[z,Math.max(0,z),Number(z>0)]);
  const h=mv([[1,2],[-1,1]],[1,2]).map((x,i)=>x+[0,1][i]);check("1.3-1",[...h,dot([2,3],h)-4,...multiply([[2,3]],[[1,2],[-1,1]])[0],dot([2,3],[0,1])-4]);
  const fn=(x,y)=>x*x*y+3*x*y*y;const gradient=[derivative(fn,[1,2],0),derivative(fn,[1,2],1)];check("2.1-1",[...gradient,Math.hypot(3,4),dot(gradient,[3/5,4/5])]);
  const descent=[6/10,8/10];check("2.2-1",[...descent,Math.hypot(-6,-8),dot([-6,-8],[-4/5,3/5])]);
  check("2.3-1",[dot([0,1,0,1,-4,1,0,1,0],[0,0,100,0,100,0,100,0,0])]);
  const surface=(x,y)=>Math.exp(x-y)+x*y*y;const g=[derivative(surface,[1,1],0),derivative(surface,[1,1],1)];check("3.1-1",[surface(1,1),...g,surface(1,1)+dot(g,[.1,-.1])]);
  const j=[[2*Math.PI,1],[.5*Math.cos(Math.PI/2),Math.PI*Math.cos(Math.PI/2)]];check("3.2-1",[...j.flat(),...mv(j,[.1,-.2])]);
  const g2=(u,v)=>[u*u*v,u+v*v],point=g2(1,2),jg=[[4,1],[1,4]],jf=[2,2*point[1]];check("3.3-1",[...point,...jg.flat(),...jf,...multiply([jf],jg)[0]]);
  const poly=(x,y)=>(x+y)*(x-y);check("4.1-1",[3+2,3-2,poly(3,2),3-2,3+2,derivative(poly,[3,2]),derivative(poly,[3,2],1)]);
  const sigmoid=z=>1/(1+Math.exp(-z));check("4.2-1",[0,sigmoid(0),derivative(sigmoid,[0]),derivative(w=>sigmoid(2*w-2),[1]),derivative(b=>sigmoid(2+b),[-2])]);
  check("4.3-1",[Math.sin(Math.PI/2),Math.PI/2*Math.sin(Math.PI/2),1,Math.PI/2,derivative(x=>x*Math.sin(x),[Math.PI/2])]);
  check("5.1-1",[0,0,6,3*6,12*0-36,12*6-36]);
  check("5.2-1",[1,2,-1,2*2/2,2*(-1),(-1)**2/2,1+(2*.1-.2)+(2*.1-.2)**2/2]);
  check("5.3-1",[2,-2,0,-2,4,0,0,0,6,2,2*4-(-2)**2,6*(2*4-(-2)**2)]);
  const reg=regression([[1,1],[1,2],[1,3],[1,4]],[1,3,2,4]);check("6.1-1",[...reg.M.flat(),...reg.d,...reg.beta]);
  const nobias=regression([[1,0],[0,1],[1,1]],[2,3,6]);check("6.2-1",[...nobias.M.flat(),...nobias.d,...nobias.beta]);
  const Q=[[1/Math.sqrt(2),0],[0,1],[1/Math.sqrt(2),0]],d=mv(transpose(Q),[4,2,2]);check("6.3-1",[...multiply(transpose(Q),Q).flat(),...d,(d[0]-d[1]/3)/2,d[1]/3]);
  let p=[1,2];const positions=[];for(let k=0;k<2;k++){p=p.map((v,i)=>v-.1*[6,2][i]*v);positions.push(...p);}check("7.1-1",[6,2/6,...positions]);
  p=[2,1];let velocity=[0,0];const momentum=[];for(let k=0;k<2;k++){velocity=velocity.map((v,i)=>.9*v+.1*[2,8][i]*p[i]);p=p.map((v,i)=>v-velocity[i]);momentum.push(...velocity,...p);}check("7.2-1",momentum);
  const grads=[[1,2],[2,3],[3,5]].map(([x,y])=>x*(2*x-y));check("7.3-1",[...grads,grads.reduce((s,v)=>s+v)/3,2-.1*(grads[0]+grads[2])/2]);
  const integrand=(x,y)=>2*x+6*x*y*y;check("8.1-1",[integral(y=>integrand(1,y),0,2),doubleIntegral(integrand,0,1,()=>0,()=>2),doubleIntegral((y,x)=>integrand(x,y),0,2,()=>0,()=>1)]);
  check("8.2-1",[2/3,3,(2/3)**2/2,doubleIntegral((x,y)=>x*y,0,3,()=>0,x=>2*x/3)]);
  check("8.3-1",[1,2*Math.PI*integral(r=>Math.exp(-r*r)*r,0,1),2*Math.PI*integral(r=>Math.exp(-r*r)*r,0,10,4000)]);
  check("9.1-1",[1,2,1,dot([2,4],[-1,-2]),dot([2,4],[1,2])]);
  const cov=covariance([[2,1],[-2,-1],[0,0]]).matrix;check("9.2-1",[...cov.flat(),cov[0][0]+cov[1][1],0,2/Math.hypot(2,1),1/Math.hypot(2,1),1,dot([2,1],[2/Math.sqrt(5),1/Math.sqrt(5)])]);
  check("9.3-1",[20/4,20/4,20/8,20**2/16,-2]);
});

test("four capstones: automatic answers follow independent calculations",()=>{
  const field=(x,y)=>x*x+2*x*y+y,p=[1,2],g=[derivative(field,p),derivative(field,p,1)];
  check("abschluss-1",[1,field(...p),...g,field(...p)+dot(g,[.1,-.1]),2,1,derivative(t=>field(t,2*t*t),[1]),dot(g,[.6,.8])]);
  const loss=(x,y)=>(x+y)**2+x*y*y;let position=[1,1];const steps=[];
  for(let k=0;k<2;k++){position=position.map((v,i)=>v-(1/6)*[2,6][i]*v);steps.push(...position);}
  check("abschluss-2",[2,loss(1,1),4,derivative(loss,[1,1]),derivative(loss,[1,1],1),2*6,...steps,2/6]);
  const reg=regression([[1,-1],[1,0],[1,1]],[2,2,5]),cov=covariance([[1,0],[3,0],[2,3]]),m=cov.matrix;
  check("abschluss-3",[reg.M[0][0],reg.M[0][1],reg.M[1][1],...reg.d,...reg.beta,...cov.mean,m[0][0],m[0][1],m[1][1],m[1][1],m[0][0],0,1,m[1][1]/(m[0][0]+m[1][1]),dot([1-cov.mean[0],-cov.mean[1]],[0,1])]);
  const tri=fn=>doubleIntegral(fn,0,2,()=>0,x=>1-x/2),area=tri(()=>1);
  check("abschluss-4",[1,-1/2,2,-2,area,tri(x=>x),1/area,tri(x=>x)/area,tri((x,y)=>y)/area,doubleIntegral(()=>1/area,0,1,()=>0,x=>1-x/2),3,2*integral(r=>r**3,0,2)]);
});

test("all three exams: every automatic answer independently checked with analytic and numerical oracles",()=>{
  const a=(x,y)=>x*x+x*y,ga=[derivative(a,[1,2]),derivative(a,[1,2],1)];
  check("a-feld",[1,a(1,2),...ga,Math.hypot(3,4),dot(ga,[.6,.8]),a(1,2)+ga[0]*.1,derivative(t=>a(t,2*t),[1])]);
  const loss=(x,y)=>(x+y)**2+x*y;check("a-graph",[1+2,loss(1,2),2*(1+2),derivative(loss,[1,2]),derivative(loss,[1,2],1),2,3,2-3]);
  const ra=regression([[1,-1],[1,0],[1,1]],[1,1,4]);check("a-reg",[ra.M[0][0],ra.M[0][1],ra.M[1][1],...ra.d,...ra.beta,ra.rss]);
  const ca=covariance([[2,0],[-2,0],[0,1],[0,-1]]).matrix;check("a-pca",[1-.25*2,1-.25*4,.5-.25*1,0,ca[0][0],ca[1][1],ca[0][0],ca[0][0]/(ca[0][0]+ca[1][1])]);
  const tri=fn=>doubleIntegral((x,y)=>fn(x,y)/2,0,2,()=>0,x=>x),ex=tri(x=>x),ey=tri((x,y)=>y),exy=tri((x,y)=>x*y);
  check("a-integral",[1/doubleIntegral(()=>1,0,2,()=>0,x=>x),doubleIntegral(()=>.5,0,1,()=>0,x=>x),ex,ey,exy,exy-ex*ey,3,2*integral(r=>r**3,0,1)]);
  const bg=(x,y)=>x*x+y-(x*y)**2;check("b-feld",[2,1,2,1,1,1,bg(1,1),derivative(bg,[1,1])]);
  const sig=z=>1/(1+Math.exp(-z)),sl=(w,b)=>(sig(w*2+b)-1)**2/2;check("b-graph",[0,sig(0),sl(1,-2),sig(0)-1,(sig(0)-1)*sig(0)*(1-sig(0)),derivative(sl,[1,-2]),derivative(sl,[1,-2],1),-2]);
  const Q=[[1,0],[0,.6],[0,.8]],R=[[2,1],[0,2]],y=[3,1,3],d=mv(transpose(Q),y),beta=[(d[0]-d[1]/2)/2,d[1]/2],prediction=mv(multiply(Q,R),beta),res=y.map((v,i)=>v-prediction[i]);
  check("b-reg",[dot(transpose(Q)[0],transpose(Q)[0]),dot(transpose(Q)[0],transpose(Q)[1]),...d,...beta,res[1],dot(res,res)]);
  const cb=covariance([[1,2],[3,2],[5,2]]);check("b-pca",[.25*2,1-.5,.5*.5+.25*1,0,...cb.mean,cb.matrix[0][0],1-cb.mean[0]]);
  check("b-integral",[doubleIntegral(()=>1,0,2,x=>x*x,x=>2*x),doubleIntegral(x=>x,0,2,x=>x*x,x=>2*x),1/doubleIntegral(x=>x,0,1,()=>0,()=>1),integral(x=>2*x*x,0,1),integral(y=>y,0,1),integral(x=>2*x,0,.5),2*integral(r=>r,1,2),2]);
  const image=(x,y)=>x*x-y*y+2*x;check("c-feld",[image(1,1),derivative(image,[1,1]),derivative(image,[1,1],1),2,2-2,derivative(t=>image(t,t*t),[1]),derivative(image,[1,1],1),image(1,1)+.1*derivative(image,[1,1])]);
  const graph=(x,y)=>(x*y)*(x*y+x);check("c-graph",[2*1,2*1+2,graph(2,1),2,4+2,derivative(graph,[2,1]),derivative(graph,[2,1],1),2*2*(-2)]);
  const rc=regression([[1,0],[0,1],[1,1]],[1,2,4]);check("c-reg",[rc.M[0][0],rc.M[0][1],rc.M[1][1],...rc.d,...rc.beta,rc.rss]);
  const gc=[[1,2],[2,2],[3,4]].map(([x,y])=>x*(x-y));check("c-pca",[...gc,gc.reduce((a,b)=>a+b)/3,1-.1*(gc[0]+gc[2])/2,4,4/(4+1),12**2/16]);
  const density=fn=>doubleIntegral((x,y)=>fn(x,y)*(2/3)*(x+2*y),0,1,()=>0,()=>1),mx=density(x=>x),my=density((x,y)=>y),mxy=density((x,y)=>x*y);
  check("c-integral",[3+1,doubleIntegral((x,y)=>x+y,0,3,()=>0,()=>1)+doubleIntegral((x,y)=>x+y,0,1,()=>1,()=>2),density(()=>1),mx,my,mxy,mxy-mx*my,2*integral(r=>Math.exp(-r*r)*r,0,10,4000)]);
});
