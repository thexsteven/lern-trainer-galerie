export const STORAGE_KEY = "lern-trainer-angewandte-mathe-v1";
export const DAY = 86400000;
export const EXAM_TIME = 60 * 60000;

// Deliberately a numeric parser, not a symbolic evaluator. Each matrix/vector cell
// uses its own field, so decimal commas never conflict with component separators.
export function parseNumber(input) {
  if (typeof input !== "string" || !input.trim()) return null;
  const value = input.trim().replaceAll("−", "-").replaceAll(",", ".");
  const number = "[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:[eE][+-]?\\d+)?";
  if (!new RegExp(`^${number}(?:\\s*/\\s*${number})?$`).test(value)) return null;
  const parts = value.split("/").map(Number);
  const result = parts.length === 2 ? parts[0] / parts[1] : parts[0];
  return Number.isFinite(result) ? result : null;
}

export function grade(task, answers = {}) {
  const values = task.fields.map((_, i) => parseNumber(answers[i]));
  const close = (value, expected, tolerance) => value !== null && Math.abs(value - expected) <= tolerance;
  const signs = {};
  for (const item of task.fields) {
    if (!item.signGroup || signs[item.signGroup]) continue;
    const group = task.fields.map((field, i) => ({ field, value: values[i] })).filter(entry => entry.field.signGroup === item.signGroup);
    // One shared sign for the entire eigenvector AND its projections.
    signs[item.signGroup] = [1,-1].sort((a,b) =>
      group.filter(({field,value})=>close(value,b*field.answer,field.tolerance)).length -
      group.filter(({field,value})=>close(value,a*field.answer,field.tolerance)).length)[0];
  }
  const fields = task.fields.map((item,i) => ({
    label:item.label, valid:values[i] !== null,
    correct:close(values[i],item.answer*(signs[item.signGroup] || 1),item.tolerance),
    points:item.points, error:item.error, hint:item.hint,
  }));
  return { fields, score:fields.reduce((sum,item)=>sum+(item.correct?item.points:0),0), total:fields.reduce((sum,item)=>sum+item.points,0), valid:fields.every(item=>item.valid) };
}

export function emptyState() {
  return { version:1, read:[], sessions:{}, due:{}, diagnostics:{}, seenExams:[], examHistory:[], activeExam:null, selection:{}, notes:"" };
}

export function loadState(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { state:emptyState(), warning:"" };
    const state = JSON.parse(raw);
    if (state?.version !== 1 || !Array.isArray(state.read) || !Array.isArray(state.examHistory) ||
      !Array.isArray(state.seenExams) || !state.sessions || typeof state.sessions !== "object" ||
      !Object.values(state.sessions).every(runs=>Array.isArray(runs) && runs.every(run=>run && typeof run.checks === "number"))) {
      return { state:emptyState(), warning:"Gespeicherter Mathe-Lernstand ist nicht lesbar. Es wurde kein Leistungsnachweis übernommen." };
    }
    const active = state.activeExam;
    if (active && (!Number.isFinite(active.startedAt) || !Number.isFinite(active.deadline) || active.deadline !== active.startedAt + EXAM_TIME || !active.answers)) {
      return { state:{...emptyState(),...state,activeExam:null}, warning:"Ungültiger Prüfungstimer: Lauf verworfen, ohne Leistungsnachweis." };
    }
    return { state:{...emptyState(),...state}, warning:"" };
  } catch {
    return { state:emptyState(), warning:"Lokaler Speicher nicht lesbar. Dieser Lernstand ist nicht dauerhaft gesichert." };
  }
}

export const localDay = (time) => new Date(time).toLocaleDateString("sv-SE");
export const latestSession = (state,id) => state.sessions[id]?.at(-1);
export function openTask(state,task,now=Date.now(),restart=false) {
  if (latestSession(state,task.id) && !restart) return state;
  const runs = state.sessions[task.id] || [];
  const run = { startedAt:now, answers:{}, checks:0, helped:false, solution:false, known:runs.length>0, feedback:null };
  return {...state,sessions:{...state.sessions,[task.id]:[...runs,run]}};
}
export function changeSession(state,id,change) {
  const runs = state.sessions[id];
  if (!runs?.length) return state;
  return {...state,sessions:{...state.sessions,[id]:[...runs.slice(0,-1),{...runs.at(-1),...change}]}};
}
export function checkTask(state,task,now=Date.now()) {
  const run = latestSession(state,task.id);
  if (!run) return state;
  const result = grade(task,run.answers);
  // Invalid entries get an input error without consuming a mathematical attempt.
  if (!result.valid) return changeSession(state,task.id,{feedback:result});
  const first = run.checks === 0;
  const good = result.score === result.total;
  const prior = state.sessions[task.id].slice(0,-1);
  const confirmed = first && good && !run.helped && prior.some(old => old.completedAt && localDay(old.completedAt)<localDay(now));
  const next = changeSession(state,task.id,{
    checks:run.checks+1, feedback:result, completedAt:now,
    firstScore:first?result.score:run.firstScore, firstTotal:first?result.total:run.firstTotal,
    firstUnaided:first?!run.helped:run.firstUnaided, confirmed:run.confirmed || confirmed,
  });
  const due = state.due[task.family];
  const reviewStage = good && !run.helped && due && due.at<=now ? Math.min((due.stage || 0)+1,2) : 0;
  return {...next,due:{...state.due,[task.family]:{stage:reviewStage,at:now+[1,3,7][reviewStage]*DAY, taskId:task.id}}};
}

export function chapterStats(state,units) {
  return Array.from({length:9},(_,i)=>{
    const chapter = i+1;
    const tasks = units.filter(unit=>unit.chapter===chapter && !unit.supplementary).flatMap(unit=>unit.tasks);
    const firsts = tasks.filter(task=>task.independent).map(task=>state.sessions[task.id]?.[0]).filter(run=>run?.checks>0 && run.firstUnaided);
    const earned = firsts.reduce((sum,run)=>sum+run.firstScore,0);
    const possible = firsts.reduce((sum,run)=>sum+run.firstTotal,0);
    return {chapter,earned,possible,count:firsts.length, percent:possible?Math.round(100*earned/possible):null,
      // An assisted-only chapter cannot reach the target by reading.
      passed:possible>0 && earned/possible>=0.8,
      practiced:units.filter(unit=>unit.chapter===chapter && !unit.supplementary).every(unit=>unit.tasks.slice(1).some(task=>state.sessions[task.id]?.some(run=>run.checks>0))) };
  });
}

export function startExam(state,exam,allowed,now=Date.now()) {
  if (state.activeExam || !allowed) return state;
  return {...state,seenExams:[...new Set([...state.seenExams,exam.id])],activeExam:{
    id:exam.id,startedAt:now,deadline:now+EXAM_TIME,answers:{}, index:0, allowed,
    known:state.seenExams.includes(exam.id), interrupted:false,
  }};
}
export const remaining = (run,now=Date.now()) => Math.max(0,run.deadline-now);
export function examAnswer(state,taskId,index,value,now=Date.now()) {
  const run=state.activeExam;
  if (!run || now>=run.deadline) return state;
  return {...state,activeExam:{...run,answers:{...run.answers,[taskId]:{...run.answers[taskId],[index]:value}}}};
}
export function finishExam(state,exam,now=Date.now()) {
  const run=state.activeExam;
  if (!run || run.id!==exam.id) return state;
  const results=exam.tasks.map(task=>({id:task.id,...grade(task,run.answers[task.id])}));
  return {...state,activeExam:null,examHistory:[...state.examHistory,{
    ...run,finishedAt:Math.min(now,run.deadline),timedOut:now>=run.deadline,
    // Late recovery cannot retroactively certify an uninterrupted run.
    interrupted:run.interrupted || now>run.deadline+5000,
    results,auto:results.reduce((sum,item)=>sum+item.score,0), self:{},
  }]};
}
export function selfPoints(result) {
  return Object.values(result.self || {}).reduce((sum,value)=>sum+(Number.isFinite(value)?Math.max(0,Math.min(2,value)):0),0);
}
export function trainingGoal(state,units) {
  const chapters=chapterStats(state,units);
  const qualifying=state.examHistory.filter(run=>!run.known && !run.interrupted && run.allowed && run.finishedAt-run.startedAt<=EXAM_TIME && run.auto+selfPoints(run)>=90);
  const distinct=[...new Map(qualifying.map(run=>[run.id,run])).values()].sort((a,b)=>a.startedAt-b.startedAt);
  const examsPassed=distinct.length>=3 && localDay(distinct.at(-1).startedAt)>localDay(distinct[0].startedAt);
  return {chapters,qualifying:distinct,examsPassed,reached:chapters.every(ch=>ch.practiced&&ch.passed)&&examsPassed};
}
