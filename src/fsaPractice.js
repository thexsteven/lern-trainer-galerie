export const FSA_GOALS = [
  { id: "fsa-grundlagen", title: "Alphabet, Wörter und ε", goal: "basics" },
  { id: "fsa-wortlauf", title: "DEA-Wortläufe und Akzeptanz", goal: "dfa" },
  { id: "fsa-regulaere-ausdruecke", title: "Reguläre Ausdrücke lesen und anwenden", goal: "regex" },
];

export const DFA = { transitions: [[0, 1], [1, 2], [2, 2]], start: 0, finals: [1] };

export function wordPath(word) {
  return [...word].reduce((path, symbol) => [...path, DFA.transitions[path.at(-1)][symbol === "a" ? 0 : 1]], [DFA.start]);
}

const showWord = (word) => word || "ε";

export function makeFsaTask(goal, word, index) {
  const id = `${goal}:${index}:${word || "epsilon"}`;
  if (goal === "dfa") {
    const path = wordPath(word);
    return { id, word, type: "dfa", prompt: `Verfolge das Wort ${showWord(word)} vollständig.`, answer: path.join(" "), accepted: DFA.finals.includes(path.at(-1)), hint: "Beginne in q0. Lies jedes Zeichen einmal und verwende die Übergangstabelle.", explanation: `Zustandsfolge: ${path.map((state) => `q${state}`).join(" → ")}. ${DFA.finals.includes(path.at(-1)) ? "Akzeptiert" : "Nicht akzeptiert"}: Entscheidend ist der Zustand nach dem ganzen Wort.` };
  }
  const type = index % 5;
  const tasks = [
    { prompt: `Welche Länge hat das Wort ${showWord(word)}?`, answer: String(word.length), hint: "Zähle die Zeichen. ε enthält kein Zeichen.", explanation: `|${showWord(word)}| = ${word.length}.` },
    { prompt: `Gehört ${showWord(word + (word.length % 2 ? "c" : ""))} zu den Wörtern über Σ = {a,b}? Antworte mit ja oder nein.`, answer: word.length % 2 ? "nein" : "ja", hint: "Jedes Zeichen muss im Alphabet liegen. Auch ε ist ein Wort über diesem Alphabet.", explanation: word.length % 2 ? "Nein. Das Zeichen c gehört nicht zu Σ = {a,b}." : "Ja. Alle Zeichen liegen im Alphabet; auch das leere Wort ist zulässig." },
    { prompt: `Verknüpfe ${showWord(word)} mit ba. Gib das entstandene Wort ein.`, answer: `${word}ba`, hint: "Schreibe das zweite Wort direkt hinter das erste.", explanation: `Die Konkatenation ergibt ${word}ba.` },
    { prompt: `Was ergibt ${showWord(word)} · ε? Gib das Wort ein (leeres Wort als ε).`, answer: showWord(word), hint: "Das leere Wort fügt kein Zeichen hinzu.", explanation: `${showWord(word)} · ε = ${showWord(word)}.` },
    { prompt: `Ist ${word.length % 2 ? showWord(word) : `{${showWord(word)}, ${word}a}`} ein Wort oder eine Sprache?`, answer: word.length % 2 ? "wort" : "sprache", hint: "Eine Sprache ist eine Menge von Wörtern; ein Wort ist eine Zeichenfolge.", explanation: word.length % 2 ? "Eine einzelne Zeichenfolge ist ein Wort." : "Die geschweiften Klammern bezeichnen eine Menge von Wörtern, also eine Sprache." },
  ];
  return { id, word, type: "basics", ...tasks[type] };
}

export function createFsaRound(goal, history = [], mode = "focus") {
  if (goal === "regex") {
    const tasks = regexTasks();
    const errors = new Set(history.filter(task => !task.correct || task.helpUsed || !task.firstAttempt).map(task => task.id));
    if (mode === "errors" || mode === "review") tasks.sort((left, right) => Number(errors.has(right.id)) - Number(errors.has(left.id)));
    return { tasks, index: 0, attempts: 0, helpUsed: false, taskHelpUsed: false, feedback: null, results: [], finished: false };
  }
  const seen = new Set(history.map((task) => task.id));
  const pool = Array.from({ length: 255 }, (_, index) => {
    const word = (index + 1).toString(2).slice(1).replaceAll("0", "a").replaceAll("1", "b");
    return makeFsaTask(goal, word, goal === "dfa" ? 0 : index % 5);
  });
  const errors = mode === "errors" || mode === "review"
    ? history.filter((task) => !task.correct || task.helpUsed || !task.firstAttempt).map((task) => pool.find((candidate) => candidate.id === task.id)).filter(Boolean)
    : [];
  const uniqueErrors = [...new Map(errors.map((task) => [task.id, task])).values()];
  const fresh = pool.filter((task) => !seen.has(task.id));
  // Preserve one task per foundational skill; DEA rounds vary the word.
  const selected = goal === "basics" && !uniqueErrors.length
    ? Array.from({ length: 5 }, (_, index) => fresh.find((task) => task.id.startsWith(`basics:${index}:`)) || pool.find((task) => task.id.startsWith(`basics:${index}:`)))
    : [...uniqueErrors, ...fresh, ...pool];
  const tasks = [...new Map(selected.map((task) => [task.id, task])).values()].slice(0, 5);
  return { tasks, index: 0, attempts: 0, helpUsed: false, taskHelpUsed: false, feedback: null, results: [], finished: false };
}

export function checkFsaAnswer(task, answer, acceptance) {
  if (task.type === "regex") return checkRegexAnswer(task, answer);
  const normalized = answer.trim().toLocaleLowerCase("de");
  if (task.type === "dfa") {
    const states = normalized.replaceAll(/q/g, "").split(/[\s,;→-]+/).filter(Boolean);
    return states.join(" ") === task.answer && acceptance === String(task.accepted);
  }
  return normalized === task.answer;
}

function regexTasks() {
  const source = "Eigene Übungsaufgabe. Themenbezug: Reguläre Sprachen – Anmerkungen, Übungsaufgaben und Lösungen, PDF S. 2 und 5–6.";
  const listFormat = "Alle gesuchten Wörter angeben, durch Komma trennen. Reihenfolge egal; optionale Mengenklammern sind erlaubt. Das leere Wort als ε oder epsilon schreiben. Groß- und Kleinschreibung der Buchstaben unterscheiden sich.";
  return [
    { id: "regex:empty", type: "regex", skill: "empty", prompt: "Welche Wörter enthält L(ε + ∅)? Gib die vollständige Sprache an.", answerFormat: listFormat,
      hint: "ε bezeichnet ein Wort der Länge 0. ∅ enthält kein einziges Wort. + vereinigt die beiden Sprachen.", explanation: "L(ε + ∅) = {ε} ∪ ∅ = {ε}. Die Antwort ist das leere Wort ε, nicht die leere Menge ∅. Auch ∅* enthält ε, weil null Wiederholungen erlaubt sind.", source },
    { id: "regex:membership", type: "regex", skill: "membership", prompt: "r = (a+b)*b(a+b)(a+b). Welche der Wörter baa, aba, abba, ab und ε gehören zu L(r)? Gib alle passenden Wörter aus dieser Liste an.", answerFormat: listFormat,
      hint: "Die letzten beiden Faktoren liefern genau zwei Zeichen. Das feste b muss deshalb an drittletzter Stelle stehen; davor ist ein beliebiger Präfix erlaubt.", explanation: "Genau baa und abba passen. Zerlegung: ε · b · a · a bzw. a · b · b · a. Bei aba ist das drittletzte Zeichen a. ab und ε sind zu kurz.", source },
    { id: "regex:concatenation", type: "regex", skill: "concatenation", prompt: "Bestimme die vollständige endliche Sprache L((a+ε)b). Gib alle Wörter an.", answerFormat: listFormat,
      hint: "Wähle in der Klammer a oder ε und hänge danach in beiden Fällen das b an. ε fügt kein Zeichen hinzu.", explanation: "L((a+ε)b) = {a, ε} · {b} = {ab, b}. Das b liegt außerhalb der Wahl: ε und a allein gehören nicht zur Sprache.", source },
    { id: "regex:star", type: "regex", skill: "star", prompt: "Gib ein Wort der Länge genau 6 aus L((ab)*) an. Schreibe das Wort selbst, keinen regulären Ausdruck.", answerFormat: "Ein einzelnes Wort nur aus den Kleinbuchstaben a und b; keine Trennzeichen oder Mengenklammern.",
      hint: "Der Stern wiederholt die ganze Klammer ab. Ein Block hat Länge 2; für Länge 6 brauchst du drei Blöcke.", explanation: "Die einzige passende Antwort ist ababab = ab · ab · ab. (ab)* wiederholt ganze Blöcke; ab* hätte eine andere Bedeutung. ε liegt zwar in L((ab)*), hat aber Länge 0.", source },
    { id: "regex:construct", type: "regex", skill: "construct", prompt: "Konstruiere ein Wort der Länge genau 5 aus L(c*(a+b)c*). Zusätzlich muss vor und nach dem einzigen a oder b mindestens ein c stehen. Schreibe genau ein solches Wort.", answerFormat: "Ein einzelnes Wort nur aus den Kleinbuchstaben a, b und c; keine Trennzeichen oder Mengenklammern. Mehrere verschiedene Lösungen sind richtig.",
      hint: "Wähle genau ein mittleres Zeichen a oder b. Die übrigen vier Zeichen sind c; verteile sie so, dass auf jeder Seite mindestens eines steht.", explanation: "Zum Beispiel ccacc: zwei c, dann a, dann zwei c. Auch caccc, cccac, cbccc, ccbcc und cccbc erfüllen alle Bedingungen. Das mittlere Wahlzeichen darf weder fehlen noch zweimal vorkommen.", source },
  ];
}

function checkRegexAnswer(task, answer) {
  const word = answer.trim();
  if (task.skill === "star") return word === "ababab";
  if (task.skill === "construct") return word.length === 5 && /^c+[ab]c+$/.test(word);
  const content = word.startsWith("{") && word.endsWith("}") ? word.slice(1, -1).trim() : word;
  const words = new Set(content.split(/[,;\s]+/).filter(Boolean).map(item => item === "epsilon" ? "ε" : item));
  const expected = { empty: ["ε"], membership: ["baa", "abba"], concatenation: ["ab", "b"] }[task.skill];
  return Boolean(expected) && words.size === expected.length && expected.every(item => words.has(item));
}
