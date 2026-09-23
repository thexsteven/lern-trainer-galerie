import test from "node:test";
import assert from "node:assert/strict";
import { allTasks, coreUnits, units } from "./data.js";
import { exams } from "./exams.js";
import { DAY, EXAM_TIME, STORAGE_KEY, changeSession, chapterStats, checkTask, emptyState, examAnswer, finishExam, grade, latestSession, loadState, openTask, parseNumber, remaining, selfPoints, startExam, trainingGoal } from "./model.js";

const answers = task => Object.fromEntries(task.fields.map((field,i)=>[i,String(field.answer)]));
const find = id => allTasks.find(task=>task.id===id);
const now = new Date(2026,8,23,10).getTime();
function solve(state,task,time=now) {
  const opened=openTask(state,task,time);
  return checkTask(changeSession(opened,task.id,{answers:answers(task)}),task,time);
}

test("numeric inputs reject empty/invalid values, accept fractions and decimal commas",()=>{
  for(const value of [""," ","1/0","NaN","Infinity","1+2","Math.PI","1,2,3","0x10","1/2/3","1e999","1;2"])assert.equal(parseNumber(value),null,value);
  assert.equal(parseNumber("−0,5"),-0.5);
  assert.equal(parseNumber(" 1 / 3 "),1/3);
  assert.equal(parseNumber("-2,5 / 0,5"),-5);
  assert.equal(parseNumber("1e-4"),0.0001);
});

test("27 original exercise families each have four distinct stages with sources and metadata",()=>{
  const ids=[];
  for(let chapter=1;chapter<=9;chapter++)for(let exercise=1;exercise<=3;exercise++){
    const unit=units.find(unit=>unit.id===`${chapter}.${exercise}`);
    assert.ok(unit);
    assert.equal(unit.tasks.length,4);
    assert.ok(unit.explanation&&unit.example&&unit.prerequisites.length);
    assert.equal(new Set(unit.tasks.map(task=>task.prompt)).size,4);
    assert.equal(unit.tasks[1].own,false);
    assert.ok(unit.tasks[2].independent&&unit.tasks[3].independent);
  }
  assert.ok(units.some(u=>u.id==="8.dichte"&&!u.supplementary));
  for(const task of allTasks){
    ids.push(task.id);assert.ok(task.source.file&&task.source.chapter&&task.source.printed&&task.source.pdf);
    assert.ok(task.solution.length&&task.fields.length&&task.prerequisites.length);
    for(const field of task.fields)assert.ok(Number.isFinite(field.answer)&&field.hint&&field.error&&field.points>0);
    assert.equal(grade(task,answers(task)).score,grade(task,answers(task)).total);
    assert.equal(grade(task,{}).score,0);
  }
  assert.equal(new Set(ids).size,ids.length);
});

test("counterexamples: unnormalized direction, swapped chain, missing adjoint, Taylor half and polar Jacobian",()=>{
  for(const [id,fieldIndex,bad] of [["2.1-1",3,"100"],["3.3-1",8,"42"],["4.3-2",3,"12"],["5.2-1",3,"4"],["5.1-3",0,"1"],["9.2-1",0,"4"],["8.3-2",0,"2"],["7.1-3",2,"1"]]) {
    const task=find(id),input=answers(task);input[fieldIndex]=bad;
    assert.equal(grade(task,input).fields[fieldIndex].correct,false,id);
  }
});

test("PCA accepts either axis sign but requires unit length and consistent projections",()=>{
  const task=find("9.2-1"),input=answers(task);
  for(const i of [6,7,9])input[i]=String(-task.fields[i].answer);
  assert.equal(grade(task,input).score,10);
  input[9]=String(task.fields[9].answer);
  assert.ok(grade(task,input).score<10);
  input[6]="2";input[7]="1";
  assert.equal(grade(task,input).fields[6].correct,false);
});

test("reading, help, repeated attempts and invalid input cannot fabricate first-time mastery",()=>{
  const task=find("2.1-2");let state=openTask(emptyState(),task,now);
  state=checkTask(state,task,now);
  assert.equal(latestSession(state,task.id).checks,0);
  state=changeSession(state,task.id,{answers:{...answers(task),2:"12"}});
  state=checkTask(state,task,now);
  assert.equal(chapterStats(state,coreUnits)[1].earned,2);
  state=solve(state,task);
  assert.equal(chapterStats(state,coreUnits)[1].earned,2,"second try does not rewrite first score");
  const assisted=find("2.1-3");state=openTask(state,assisted,now);
  state=changeSession(state,assisted.id,{helped:true,solution:true});state=solve(state,assisted);
  assert.equal(chapterStats(state,coreUnits)[1].count,1,"assisted answers excluded");
  state=openTask(state,task,now+DAY,true);state=solve(state,task,now+DAY);
  assert.equal(latestSession(state,task.id).confirmed,true);
  assert.equal(chapterStats(state,coreUnits)[1].count,1,"known repeat is not new evidence");
  assert.equal(state.due[task.family].at,now+4*DAY);
});

test("versioned storage round-trip preserves answers and deadline, isolated reset does not touch personal data",()=>{
  const values=new Map([["lern-trainer-personal-v1","personal"]]);
  const storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
  let state=solve(emptyState(),find("1.1-2"));state=startExam(state,exams[0],true,now);
  state=examAnswer(state,exams[0].tasks[0].id,0,"1",now+1000);
  storage.setItem(STORAGE_KEY,JSON.stringify(state));assert.deepEqual(loadState(storage).state,state);
  assert.equal(remaining(loadState(storage).state.activeExam,now+60000),59*60000);
  storage.setItem(STORAGE_KEY,JSON.stringify(emptyState()));assert.equal(storage.getItem("lern-trainer-personal-v1"),"personal");
  storage.setItem(STORAGE_KEY,"broken");assert.ok(loadState(storage).warning);
});

test("all exam variants cover nine chapters and sum to 100, grading freezes at deadline",()=>{
  for(const exam of exams){
    assert.equal(exam.tasks.reduce((sum,t)=>sum+t.fields.reduce((s,f)=>s+f.points,0)+t.rubric.reduce((s,r)=>s+r.points,0),0),100);
    assert.deepEqual([...new Set(exam.tasks.flatMap(t=>t.chapters))].sort((a,b)=>a-b),[1,2,3,4,5,6,7,8,9]);
    let state=startExam(emptyState(),exam,true,now);
    for(const task of exam.tasks)for(const [i,value] of Object.entries(answers(task)))state=examAnswer(state,task.id,i,value,now+1000);
    const before=state;state=examAnswer(state,exam.tasks[0].id,0,"999",now+EXAM_TIME);
    assert.equal(state,before);
    state=finishExam(state,exam,now+EXAM_TIME);
    assert.equal(state.examHistory[0].auto,80);
    assert.equal(state.examHistory[0].timedOut,true);
    assert.equal(state.activeExam,null);
    assert.equal(finishExam(state,exam,now+EXAM_TIME),state);
    assert.equal(startExam(state,exam,true,now+DAY).activeExam.known,true);
  }
});

test("training target cannot hide weak chapters, same-day exams, known or interrupted runs",()=>{
  let state=emptyState();
  for(const unit of coreUnits)state=solve(state,unit.tasks[2]);
  const base=state;
  for(const [i,exam] of exams.entries()){
    state=startExam(state,exam,true,now+(i===2?DAY:0));
    state={...state,activeExam:{...state.activeExam,answers:Object.fromEntries(exam.tasks.map(t=>[t.id,answers(t)]))}};
    state=finishExam(state,exam,now+(i===2?DAY:0)+1000);
    const run=state.examHistory.at(-1);run.self=Object.fromEntries(exam.tasks.flatMap(t=>t.rubric.map((_,j)=>[`${t.id}-${j}`,2])));
  }
  assert.equal(trainingGoal(state,coreUnits).reached,true);
  assert.equal(selfPoints(state.examHistory[0]),20);
  for(const flag of ["known","interrupted"]){const bad={...state,examHistory:state.examHistory.map((run,i)=>i===1?{...run,[flag]:true}:run)};assert.equal(trainingGoal(bad,coreUnits).reached,false);}
  const sameDay={...state,examHistory:state.examHistory.map(run=>({...run,startedAt:now,finishedAt:now+1000}))};
  assert.equal(trainingGoal(sameDay,coreUnits).reached,false);
  const weak={...state,sessions:{...state.sessions,[coreUnits.find(u=>u.chapter===8).tasks[2].id]:[]}};
  assert.equal(trainingGoal(weak,coreUnits).reached,false);
  assert.equal(trainingGoal(base,coreUnits).reached,false);
});
