export const courses = [
  { slug: "mathe-funktionen", title: "Mehrdimensionale Funktionen & Ableitungen", chapters: [1, 2, 3] },
  { slug: "mathe-autodiff", title: "Autodiff, Taylor & Optimierung", chapters: [4, 5, 7] },
  { slug: "mathe-regression", title: "Regression, Lagrange & PCA", chapters: [6, 9] },
  { slug: "mathe-integrale", title: "Mehrfachintegrale & Wahrscheinlichkeitsdichten", chapters: [8] },
  { slug: "mathe-klausurwerkstatt", title: "Klausurwerkstatt – 60 Minuten", chapters: [] },
];

export const source = (chapter, page, end = page) => ({ file: "skript_studierende.pdf", chapter: String(chapter), printed: `${page}${end === page ? "" : `–${end}`}`, pdf: `${page + 4}${end === page ? "" : `–${end + 4}`}` });
export const field = (label, answer, hint, error = "Zwischenschritt prüfen", extra = {}) => ({ label, answer, hint, error, points: 1, tolerance: 0.001, ...extra });
export const task = (prompt, fields, solution, extra = {}) => ({ prompt, fields, solution: Array.isArray(solution) ? solution : [solution], ...extra });
const f = field;
const t = task;
const stages = ["Leichte Aufgabe", "Gestützte Anwendung", "Selbstständig", "Gemischter Transfer"];
function unit(id, title, page, explanation, example, prerequisites, tasks, extra = {}) {
  const chapter = Number(id.split(".")[0]);
  const citation = source(chapter, page, ["3.2","8.2"].includes(id)?page+1:page);
  const ranges = {1:[1,6],2:[7,12],3:[13,17],4:[18,25],5:[26,31],6:[32,40],7:[41,47],8:[48,53],9:[54,58]};
  const theory = source(chapter,...ranges[chapter]);
  return { id, title, chapter, source: theory, explanation, example, prerequisites, ...extra,
    tasks: tasks.map((item, index) => ({ ...item, id: `${id}-${index}`, family: id, chapter, source: index===1?citation:theory, prerequisites, stage: stages[index], independent: index >= 2, own: item.own ?? index !== 1, ...extra })) };
}

export const units = [
  unit("1.1", "Felder, Definitionsbereiche und Niveaumengen", 6,
    "ℝ ist die Menge reeller Zahlen. Ein Skalarfeld ℝ²→ℝ ordnet einem Punkt eine Zahl zu; ein Vektorfeld mehrere Komponenten. Der Definitionsbereich enthält alle erlaubten Eingaben. Eine Niveaumenge N_c enthält genau die Punkte mit f(x,y)=c. Der Graph ergänzt die Höhe f(x,y).",
    "f(x,y)=x²+2y: f(1,2)=5. N₃ erfüllt y=(3−x²)/2. Für x²+y²=c entsteht bei c>0 ein Kreis mit Radius √c, bei c=0 ein Punkt, bei c<0 die leere Menge.",
    ["Einsetzen", "Quadrate"], [
      t("f(x,y)=x²+2y. Berechne f(2,1) und die Zahl der Ausgabekomponenten.", [f("f(2,1)",6,"Quadriere zuerst x."),f("Ausgabekomponenten",1,"Skalar bedeutet eine Zahl.")], "2²+2·1=6; eine Komponente."),
      t("Skript 1.1: f=x²−y². Beschreibe N₁, N₀, N₋₁ auf Papier. Trage für N₀ die beiden Geradensteigungen aufsteigend ein; bei N₁ den positiven x-Achsenschnitt; bei N₋₁ den positiven y-Achsenschnitt.", [f("Steigung 1",-1,"Faktorisiere x²−y²."),f("Steigung 2",1,"x²=y²."),f("x-Schnitt N₁",1,"Setze y=0."),f("y-Schnitt N₋₁",1,"Setze x=0.")], "N₀: y=±x, Geradenkreuz statt glatter Hyperbel. N₁: x²−y²=1, Öffnung in x; N₋₁: y²−x²=1, Öffnung in y."),
      t("Für f(x,y)=4x²+y²: Bestimme die positiven Achsenschnitte von N₄ und f(1,2).", [f("x-Achsenschnitt",1,"y=0 setzen."),f("y-Achsenschnitt",2,"x=0 setzen."),f("f(1,2)",8,"Einsetzen.")], "4x²+y²=4 ist eine Ellipse mit Halbachsen 1 und 2; f(1,2)=8."),
      t("Ein Sensor liefert F(x,y)=(√(9−x²−y²),x+y). Bestimme die Zahl der Ausgabekomponenten, den größten erlaubten Radius und F(0,0) komponentenweise. Begründe den Definitionsbereich auf Papier.", [f("Komponenten",2,"Zähle die Ausgänge."),f("Radius",3,"Radikand ≥0."),f("F₁(0,0)",3,"√9."),f("F₂(0,0)",0,"0+0.")], "Vektorfeld auf der abgeschlossenen Scheibe x²+y²≤9. F(0,0)=(3,0).")]),
  unit("1.2", "ReLU-Neuron", 6,
    "Ein Vektor ist eine geordnete Liste. Das Skalarprodukt wᵀx summiert die Produkte gleicher Komponenten. Bias b ist ein konstanter Zusatz. Die Voraktivierung z=wᵀx+b wird durch ReLU(z)=max(0,z) auf nichtnegative Werte begrenzt.",
    "w=(2,−1), x=(1,3), b=2: z=2−3+2=1 und a=1. Bei z<0 ist a=0. Bei z=0 ist ReLU klassisch nicht differenzierbar.", ["Skalarprodukt"], [
      t("w=(1,2), x=(2,1), b=−1. Berechne z und ReLU(z).",[f("z",3,"1·2+2·1−1."),f("a",3,"Maximum von 0 und z.")],"z=3, a=3."),
      t("Skript 1.2: x=(2,−1,3), w=(1,2,−1), b=−2. Berechne z, a und Aktivität (1=aktiv, 0=inaktiv).",[f("z",-5,"Alle drei Produkte plus Bias."),f("a",0,"Negative Werte abschneiden."),f("Aktiv",0,"z>0?")],"z=2−2−3−2=−5. a=0, inaktiv."),
      t("x=(−1,2), w=(3,2), b=0. Berechne z, a und ∂a/∂x₁ an diesem Punkt.",[f("z",1,"3·(−1)+2·2."),f("a",1,"z ist positiv."),f("∂a/∂x₁",3,"Im aktiven Bereich ist a=z.")],"z=a=1; Ableitung nach x₁ ist 3."),
      t("Ein Neuron hat z=2x−y+1. Für x=1 soll a=0 gelten. Bestimme die kleinste zulässige y-Koordinate. Existiert an diesem Grenzpunkt eine klassische Ableitung nach y? 1=ja, 0=nein.",[f("y-Grenze",3,"a=0 genau für z≤0."),f("Klassisch differenzierbar",0,"Prüfe den Knick bei z=0.")],"y≥3. Bei y=3 liegt der ReLU-Knick; links Steigung −1, rechts 0.")]),
  unit("1.3", "Schichten verketten", 6,
    "Eine Matrix multipliziert einen Spaltenvektor zeilenweise. W mit m Zeilen und n Spalten bildet ℝⁿ nach ℝᵐ ab. Bei f₂∘f₁ wird zuerst f₁ berechnet. Bias-Vektoren werden erst nach dem jeweiligen Matrixprodukt addiert.",
    "f₁(x)=2x+1 und f₂(h)=3h−2 ergeben f₂(f₁(x))=6x+1. Die Biases werden also nicht einfach addiert.", ["Matrixmultiplikation"], [
      t("A=[[1,2],[0,1]], x=(1,2). Berechne Ax.",[f("Komponente 1",5,"Erste Zeile mal x."),f("Komponente 2",2,"Zweite Zeile mal x.")],"Ax=(1+4,2)=(5,2)."),
      t("Skript 1.3: f₁(x)=[[1,2],[−1,1]]x+(0,1); f₂(h)=[2,3]h−4. Für x=(1,2): h und y. Bestimme F(x)=w₁x₁+w₂x₂+b.",[f("h₁",5,"Erste Zeile."),f("h₂",2,"Bias nicht vergessen."),f("y",12,"2h₁+3h₂−4."),f("w₁",-1,"[2,3]A, erste Spalte."),f("w₂",7,"Zweite Spalte."),f("b",-1,"[2,3](0,1)−4.")],"h=(5,2), y=12; F(x)=−x₁+7x₂−1."),
      t("f₁(x)=(x₁+x₂,2x₁−x₂); f₂(h)=h₁−2h₂+3. Für x=(2,1): h, y und die beiden Koeffizienten von F.",[f("h₁",3,"2+1."),f("h₂",3,"4−1."),f("y",0,"h₁−2h₂+3."),f("Koeffizient x₁",-3,"Komposition ausmultiplizieren."),f("Koeffizient x₂",3,"x₂-Terme sammeln.")],"h=(3,3), y=0; F=−3x₁+3x₂+3."),
      t("F(x)= [1,−2] ReLU([[1,0],[0,−1]]x). An x=(2,1): versteckte Ausgabe und Gesamt-Jacobi-Zeile ausfüllen.",[f("h₁",2,"ReLU(2)."),f("h₂",0,"ReLU(−1)."),f("J[1,1]",1,"Aktive erste Zeile."),f("J[1,2]",0,"Inaktive zweite Zeile.")],"h=(2,0); J=[1,−2]diag(1,0)diag(1,−1)=[1,0].")]),
  unit("2.1", "Partielle und normierte Richtungsableitungen", 12,
    "∂f/∂x heißt: nach x ableiten und andere Variablen festhalten. ∇f ist der Spaltenvektor dieser Ableitungen. Die Norm ‖u‖ ist √(u₁²+u₂²). Für u≠0 ist v=u/‖u‖ normiert. Ist f total differenzierbar, gilt Dᵥf=∇f·v.",
    "f=x²+3y: ∇f=(2x,3). Bei (1,2) und u=(3,4) ist v=(3/5,4/5) und Dᵥf=18/5.", ["Ableitungsregeln", "Norm", "Skalarprodukt"], [
      t("f=x²+3y. Berechne ∇f(2,0).",[f("fₓ",4,"y bleibt konstant."),f("fᵧ",3,"x bleibt konstant.")],"∇f=(2x,3), also (4,3)."),
      t("Skript 2.1: f=x²y+3xy², P=(1,2), u=(3,4). Berechne ∇f(P), ‖u‖ und Dᵥf(P) mit v=u/‖u‖.",[f("fₓ",16,"2xy+3y²."),f("fᵧ",13,"x²+6xy."),f("‖u‖",5,"√(9+16)."),f("Dᵥf",20,"Gradient mit u/5 multiplizieren.","Richtung normieren")],"∇f(P)=(16,13); (48+52)/5=20, nicht 100."),
      t("f=xy²+x, P=(2,1), u=(0,−3). Berechne ∇f(P) und die normierte Richtungsableitung.",[f("fₓ",2,"y²+1."),f("fᵧ",4,"2xy."),f("Dᵥf",-4,"v=(0,−1).","Richtung normieren")],"Gradient (2,4), Einheitsrichtung (0,−1), D=−4."),
      t("Ein Temperaturfeld f=xy hat bei P=(3,4) Gradient (4,3). Ein Roboter bewegt sich mit Geschwindigkeit u=(6,8). Berechne Änderung pro Zeiteinheit und pro Wegeinheit.",[f("Pro Zeiteinheit",48,"Kettenregel ohne Normierung bei Geschwindigkeit."),f("Pro Wegeinheit",4.8,"Durch Geschwindigkeit ‖u‖=10 teilen.","Zeit- und Richtungsableitung unterscheiden")],"df/dt=∇f·u=48; pro Weglänge 48/10=4,8.")]),
  unit("2.2", "Steilster Anstieg und Tangenten", 12,
    "Für ∇f≠0 ist ∇f/‖∇f‖ die Richtung des steilsten Anstiegs, ihr negatives Gegenstück die des Abstiegs. Die maximale Steigung ist ‖∇f‖. Entlang einer glatten Niveaulinie ist ∇f orthogonal zum Tangentenvektor.",
    "f=x²+y², P=(1,0): Gradient (2,0), maximale Steigung 2. Ein Tangentenvektor ist (0,1); sein Skalarprodukt mit (2,0) ist 0.",["Gradient", "Norm"],[
      t("Ein Gradient ist (3,4). Bestimme seinen Betrag und die x-Komponente der steilsten Einheitsrichtung.",[f("Betrag",5,"Satz des Pythagoras."),f("v₁",0.6,"Durch Betrag teilen.")],"‖∇f‖=5, v=(3/5,4/5)."),
      t("Skript 2.2: f=25−x²−y², P=(3,4). Bestimme normierten Abstieg, maximale Steigung und D entlang v=(−4/5,3/5).",[f("Abstieg x",0.6,"Negativen Gradienten normieren."),f("Abstieg y",0.8,"Negativen Gradienten normieren."),f("Maximale Steigung",10,"Norm von (−6,−8)."),f("D tangential",0,"Skalarprodukt.")],"Gradient (−6,−8); Abstieg (3/5,4/5), maximale Steigung 10; 24/5−24/5=0."),
      t("f=5x+12y. Gib normierten Abstieg und die maximale Steigung an.",[f("v₁",-5/13,"−∇f normieren."),f("v₂",-12/13,"Norm ist 13."),f("Steigung",13,"√(25+144).")],"Abstieg (−5/13,−12/13), maximale Steigung 13."),
      t("f=x²+y² am Ursprung: maximale Richtungsableitung? Bestimmt der Nullgradient eine eindeutige steilste Richtung (1=ja,0=nein)? Wie viele Punkte enthält N₀?",[f("Maximale Ableitung",0,"Alle Skalarprodukte sind null."),f("Eindeutig",0,"Normierung des Nullvektors ist unmöglich."),f("Punkte in N₀",1,"x²+y²=0.")],"Alle Richtungsableitungen 0, keine ausgezeichnete Richtung; N₀ ist nur der Ursprung, keine reguläre Kurve.")]),
  unit("2.3", "Diskrete Ableitungen und Laplace", 12,
    "Die zweite Ableitung misst Krümmung. Für Rasterabstand h lautet die zweite Differenz (I₋−2I₀+I₊)/h². Der Laplace-Operator ΔI=Iₓₓ+Iᵧᵧ verwendet bei h=1 den Kern [[0,1,0],[1,−4,1],[0,1,0]]. Diagonale Nachbarn zählen hier nicht.",
    "Zeile (10,50,90): erste zentrale Differenz (90−10)/2=40, zweite Differenz 10−100+90=0. Eine lineare Rampe hat keine Krümmung.",["Zweite Ableitung"],[
      t("Drei Rasterwerte (2,5,8), h=1. Berechne erste zentrale und zweite Differenz.",[f("Erste",3,"(rechts−links)/2."),f("Zweite",0,"links−2·Mitte+rechts.")],"(8−2)/2=3; 2−10+8=0."),
      t("Skript 2.3: I=[[0,0,100],[0,100,0],[100,0,0]]. Berechne den Laplace-Wert im Zentrum. Deute das Vorzeichen auf Papier.",[f("ΔI",-400,"Vier direkte Nachbarn minus viermal Zentrum.","Diagonalpixel nicht mitzählen")],"0+0+0+0−4·100=−400. Negative Gesamtkrümmung der hellen Spitze."),
      t("Zentrum 20, links 10, rechts 30, oben 40, unten 10, h=1. Berechne Iₓₓ, Iᵧᵧ und ΔI.",[f("Iₓₓ",0,"10−40+30."),f("Iᵧᵧ",10,"40−40+10."),f("ΔI",10,"Summe.")],"Iₓₓ=0, Iᵧᵧ=10, ΔI=10."),
      t("f=x²−y². Bestimme fₓₓ, fᵧᵧ und Δf. Beweist Δf=0, dass die Fläche eben ist? 1=ja,0=nein.",[f("fₓₓ",2,"Zweimal nach x."),f("fᵧᵧ",-2,"Zweimal nach y."),f("Δf",0,"Summe."),f("Eben",0,"Die beiden Krümmungen können sich aufheben.")],"2−2=0 trotz Sattelfläche. Laplace-null bedeutet nicht krümmungsfrei.")]),
  unit("3.1", "Totale Differenzierbarkeit und Tangentialebene", 16,
    "Total differenzierbar bedeutet f(P+h)=f(P)+∇f(P)·h+r(h), wobei r(h)/‖h‖→0. Stetige partielle Ableitungen in einer offenen Umgebung reichen aus. Die Tangentialebene T=f(P)+fₓ(P)(x−a)+fᵧ(P)(y−b) ist die lineare Näherung.",
    "f=x²+y², P=(1,1): f(P)=2, ∇f(P)=(2,2). T=2+2(x−1)+2(y−1). Bei (1,1;0,9) ist T=2.",["Gradient"],[
      t("f=x²+y am Punkt (1,0). Erfasse f(P), fₓ(P), fᵧ(P).",[f("f(P)",1,"Einsetzen."),f("fₓ(P)",2,"2x."),f("fᵧ(P)",1,"Ableitung von y.")],"T=1+2(x−1)+y."),
      t("Skript 3.1: f=e^(x−y)+xy², P=(1,1). Erfasse die drei Koeffizienten T=A+B(x−1)+C(y−1) und T(1,1;0,9).",[f("A",2,"e⁰+1."),f("B",2,"e^(x−y)+y²."),f("C",1,"−e^(x−y)+2xy."),f("Näherung",2.1,"h=(0,1;−0,1).")],"A=2,B=2,C=1; T=2+0,2−0,1=2,1."),
      t("f=xy+y², P=(2,1). Bestimme A,B,C für T=A+B(x−2)+C(y−1), dann T(2,1;1,2).",[f("A",3,"2·1+1."),f("B",1,"fₓ=y."),f("C",4,"fᵧ=x+2y."),f("T",3.9,"h=(0,1;0,2).")],"T=3+(x−2)+4(y−1); 3+0,1+0,8=3,9."),
      t("f=xy/(x²+y²) außerhalb des Ursprungs, f(0,0)=0. Erfasse beide partiellen Ableitungen am Ursprung und den Grenzwert entlang y=x. Ist f dort stetig (1/0)?",[f("fₓ(0,0)",0,"Auf der x-Achse ist f=0."),f("fᵧ(0,0)",0,"Auf der y-Achse ebenso."),f("Grenzwert diagonal",0.5,"Kürze x²/(2x²)."),f("Stetig",0,"Vergleiche mit f(0,0).")],"Partielle Ableitungen 0, aber Diagonalgrenzwert 1/2. Weder stetig noch total differenzierbar.")]),
  unit("3.2", "Jacobi-Matrix ausfüllen", 16,
    "Für F:ℝⁿ→ℝᵐ hat J_F m Zeilen (Ausgaben) und n Spalten (Eingaben). Eintrag (i,j) ist ∂Fᵢ/∂xⱼ. Die Näherung ΔF≈J_F(P)Δx verlangt zuerst die Auswertung bei P.",
    "F=(x²+y,xy): J=[[2x,1],[y,x]]. Bei (1,2) ergibt Δx=(0,1;0) die Änderung (0,2;0,2).",["Partielle Ableitungen", "Matrixmultiplikation"],[
      t("F=(2x+y,x−3y). Fülle J zeilenweise aus.",[f("J[1,1]",2,"F₁ nach x."),f("J[1,2]",1,"F₁ nach y."),f("J[2,1]",1,"F₂ nach x."),f("J[2,2]",-3,"F₂ nach y.")],"J=[[2,1],[1,−3]]."),
      t("Skript 3.2: F=(x²+y,sin(xy)), P=(π,1/2), Δx=(0,1;−0,2). Fülle J(P) aus (π numerisch), dann ΔF.",[f("J[1,1]",2*Math.PI,"2x."),f("J[1,2]",1,"Konstante Ableitung."),f("J[2,1]",0,"y cos(xy)."),f("J[2,2]",0,"x cos(xy)."),f("ΔF₁",0.2*Math.PI-0.2,"Zeile 1 mal Δx."),f("ΔF₂",0,"Zeile 2 mal Δx.")],"cos(π/2)=0. J=[[2π,1],[0,0]], ΔF=(0,2π−0,2;0)."),
      t("F=(xy,x+y²), P=(2,3). Fülle J(P) aus und bestimme ΔF für Δx=(0,1;0,2).",[f("J[1,1]",3,"y."),f("J[1,2]",2,"x."),f("J[2,1]",1,"1."),f("J[2,2]",6,"2y."),f("ΔF₁",0.7,"3·0,1+2·0,2."),f("ΔF₂",1.3,"0,1+6·0,2.")],"J=[[3,2],[1,6]], ΔF=(0,7;1,3)."),
      t("F:ℝ²→ℝ³, F=(x,y,xy). Bestimme die Dimensionen von J und J(1,2)·(1,−1).",[f("Zeilen",3,"Eine je Ausgabe."),f("Spalten",2,"Eine je Eingabe."),f("ΔF₁",1,"Erste Zeile (1,0)."),f("ΔF₂",-1,"Zweite Zeile (0,1)."),f("ΔF₃",1,"Dritte Zeile (2,1).")],"J ist 3×2; das Produkt ergibt (1,−1,1).")]),
  unit("3.3", "Mehrdimensionale Kettenregel", 17,
    "Für g:ℝⁿ→ℝᵐ und f:ℝᵐ→ℝᵏ gilt bei Differenzierbarkeit J_(f∘g)(P)=J_f(g(P))J_g(P). Außen steht links und wird am Zwischenpunkt g(P) ausgewertet: (k×m)(m×n)=(k×n).",
    "g(t)=(t,t²), f(x,y)=x+y²: bei t=1 ist J_f=[1,2], J_g=(1,2)ᵀ, also h′=5. Direkt: h=t+t⁴.",["Jacobi-Matrix"],[
      t("g(t)=(t,2t), f(x,y)=3x+y. Berechne h′.",[f("h′",5,"[3,1]·(1,2).")],"3+2=5."),
      t("Skript 3.3: g(u,v)=(u²v,u+v²), f(x,y)=2x+y², P=(1,2). Erfasse g(P), J_g zeilenweise, J_f und J_(f∘g).",[f("g₁",2,"u²v."),f("g₂",5,"u+v²."),f("Jg[1,1]",4,"2uv."),f("Jg[1,2]",1,"u²."),f("Jg[2,1]",1,"1."),f("Jg[2,2]",4,"2v."),f("Jf[1,1]",2,"2."),f("Jf[1,2]",10,"2y bei y=5."),f("∂h/∂u",18,"[2,10] mal Spalte 1.","Reihenfolge und Auswertungsstelle"),f("∂h/∂v",42,"[2,10] mal Spalte 2.")],"g(P)=(2,5), Jg=[[4,1],[1,4]], Jf=[2,10]; Produkt [18,42]."),
      t("g(u,v)=(u+v,uv), f(x,y)=xy, P=(1,2). Erfasse g(P) und die Ableitungen der Komposition.",[f("g₁",3,"u+v."),f("g₂",2,"uv."),f("hᵤ",8,"[2,3]·(1,2)."),f("hᵥ",5,"[2,3]·(1,1).")],"h=u²v+uv²; Ableitungen 2uv+v²=8, u²+2uv=5."),
      t("Ein Messpfad g(t)=(cos t,sin t), Feld f=x²−y². Bei t=π/4: Erfasse h, h′ und die konstante Höhe der Tangentialgeraden h(t₀)+h′(t₀)(t−t₀) an t=t₀.",[f("h",0,"cos²−sin²."),f("h′",-2,"h=cos(2t)."),f("Höhe bei t₀",0,"Tangente trifft den Funktionswert.")],"h=cos(2t), h′=−2sin(2t), daher T=−2(t−π/4).")]),
  unit("4.1", "Rechengraph, Forward- und Reverse-Mode", 24,
    "Symbolisch werden Formeln abgeleitet; numerisch nähern Differenzenquotienten an. Autodiff wendet lokale Ableitungen entlang eines azyklischen Rechengraphen an (bis auf Rundung). Forward-Mode transportiert Tangenten in einer Eingaberichtung. Reverse-Mode startet mit Adjoint ∂L/∂L=1 und transportiert Beiträge rückwärts; ein Adjoint ist die Ableitung der Ausgabe nach einem Knoten.",
    "L=ab+c, a=2,b=3,c=1: Vorwärts L=7. Rückwärts ā=b=3, b̄=a=2, c̄=1. Bei vielen Eingängen und skalarer Ausgabe ist Reverse-Mode günstig.",["Kettenregel", "Produktregel"],[
      t("v=x², L=3v bei x=2. Berechne v,L und dL/dx.",[f("v",4,"x²."),f("L",12,"3v."),f("dL/dx",12,"3·2x.")],"v=4,L=12,dL/dx=12."),
      t("Skript 4.1: v₁=x+y, v₂=x−y, L=v₁v₂, x=3,y=2. Fülle Vorwärtswerte und Adjoints aus.",[f("v₁",5,"Summe."),f("v₂",1,"Differenz."),f("L",5,"Produkt."),f("v̄₁",1,"∂L/∂v₁=v₂."),f("v̄₂",5,"∂L/∂v₂=v₁."),f("x̄",6,"Beide Pfade addieren."),f("ȳ",-4,"Zweiter Pfad hat Minus.")],"v₁=5,v₂=1,L=5; v̄₁=1,v̄₂=5; x̄=6,ȳ=−4. Kontrolle L=x²−y²."),
      t("v=x+y, L=v²+x, x=1,y=2. Berechne v,L,v̄,x̄,ȳ.",[f("v",3,"Summe."),f("L",10,"v²+x."),f("v̄",6,"2v."),f("x̄",7,"Zusätzlichen direkten Pfad beachten.","Adjoint-Summe"),f("ȳ",6,"Nur über v.")],"v=3,L=10,v̄=6,x̄=6+1=7,ȳ=6."),
      t("F(x,y)=(xy,x²). Bei (2,3) berechne das Forward-Produkt J_F·(1,−1). Für L=F₁+2F₂ berechne anschließend beide Reverse-Gradienten.",[f("Forward 1",1,"y·1+x·(−1)."),f("Forward 2",4,"2x·1."),f("Lₓ",11,"y+4x."),f("Lᵧ",2,"x.")],"J=[[3,2],[4,0]], Jv=(1,4). [1,2]J=[11,2].")]),
  unit("4.2", "Sigmoid und lokale Ableitungen", 25,
    "Die Sigmoid-Funktion σ(z)=1/(1+e^(−z)) bildet auf (0,1) ab. Ihre lokale Ableitung ist σ(z)(1−σ(z)). Bei z=wx+b werden die Parametergradienten mit x beziehungsweise 1 multipliziert.",
    "Bei z=0 gilt σ=1/2 und σ′=1/4. Ist x=4, dann ∂a/∂w=1 und ∂a/∂b=1/4.",["Kettenregel"],[
      t("a=σ(0). Berechne a und σ′(0).",[f("a",0.5,"e⁰=1."),f("σ′",0.25,"a(1−a).")],"a=1/2, σ′=1/4."),
      t("Skript 4.2: x=2,w=1,b=−2, a=σ(wx+b). Berechne z,a,z̄ sowie ∂a/∂w und ∂a/∂b.",[f("z",0,"wx+b."),f("a",0.5,"σ(0)."),f("z̄",0.25,"a(1−a)."),f("a_w",0.5,"z̄x."),f("a_b",0.25,"z̄.")],"z=0,a=1/2,z̄=1/4; a_w=1/2,a_b=1/4."),
      t("x=−2,w=2,b=4. Für a=σ(wx+b) berechne a_w, a_b und a_x.",[f("a_w",-0.5,"z=0; σ′x."),f("a_b",0.25,"σ′."),f("a_x",0.5,"σ′w.")],"z=0, lokale Ableitung 1/4; Gradient (−1/2,1/4,1/2)."),
      t("a=σ(w·2+b), L=(a−1)²/2. Bei w=0,b=0 berechne L, ∂L/∂a und ∂L/∂w.",[f("L",0.125,"a=1/2."),f("L_a",-0.5,"a−1."),f("L_w",-0.25,"(a−1)a(1−a)·2.")],"L=1/8; L_a=−1/2; L_w=−1/4.")]),
  unit("4.3", "Verzweigte Pfade addieren", 25,
    "Wenn ein Knoten mehrfach genutzt wird, addiert sein Adjoint alle ausgehenden Beiträge. Überschreiben verliert einen Teil der Ableitung. Bei einem Produkt uv sind die lokalen Ableitungen v und u.",
    "f=x·x² bei x=2: direkter Beitrag x²=4; Pfad über x² liefert x·2x=8. Summe 12, passend zu (x³)′=3x².",["Produktregel"],[
      t("f=x·x bei x=3. Erfasse beide Pfadbeiträge und ihre Summe.",[f("Pfad links",3,"Der andere Faktor."),f("Pfad rechts",3,"Der andere Faktor."),f("Summe",6,"Addieren.")],"3+3=6."),
      t("Skript 4.3: v₁=x, v₂=sin(v₁), v₃=v₁v₂, x=π/2. Erfasse v₂,v₃,v̄₃,v̄₂,v̄₁.",[f("v₂",1,"sin(π/2)."),f("v₃",Math.PI/2,"x·1."),f("v̄₃",1,"Start am Ausgang."),f("v̄₂",Math.PI/2,"Anderer Faktor."),f("v̄₁",1,"v₂+v₁cos(v₁).","Adjoint-Summe")],"v₂=1,v₃=π/2; v̄₂=π/2; v̄₁=1+(π/2)·0=1."),
      t("v=x², L=v+xv bei x=2. Berechne v, L, v̄ und x̄.",[f("v",4,"Quadrieren."),f("L",12,"v+xv."),f("v̄",3,"1+x."),f("x̄",16,"Direkter Beitrag v plus v̄·2x.","Adjoint-Summe")],"v=4,L=12,v̄=3; x̄=4+3·4=16."),
      t("Ein Programm berechnet u=xy, v=u+x, L=uv. Bei x=1,y=2: ū aus beiden Pfaden, x̄ und ȳ.",[f("ū",5,"v+u."),f("x̄",12,"ū·y plus direkter Beitrag über v."),f("ȳ",5,"ū·x.")],"u=2,v=3; v̄=2, ū=3+2=5; x̄=5·2+2=12,ȳ=5.")]),
  unit("5.1", "Stationäre Punkte und Hesse-Test", 31,
    "Stationär heißt ∇f=0. Die Hesse-Matrix H enthält zweite Ableitungen. Für C²-Funktionen ist H nach Schwarz symmetrisch. Am stationären Punkt: positiv definit ⇒ strenges lokales Minimum; negativ definit ⇒ Maximum; indefinit ⇒ Sattel. Semidefinit reicht nicht zur Entscheidung.",
    "f=x²−y²: ∇f=(2x,−2y), stationär (0,0), H=diag(2,−2) indefinit. f=x⁴+y⁴ hat ebenfalls ein strenges Minimum, obwohl H(0)=0 ist.",["Zweite Ableitungen"],[
      t("f=x²+2y². Stationärer Punkt und det H?",[f("x",0,"2x=0."),f("y",0,"4y=0."),f("det H",8,"2·4.")],"(0,0), H=diag(2,4) positiv definit; Minimum."),
      t("Skript 5.1: f=x³+y²−6xy. Stationäre Punkte nach x sortiert: (x₁,y₁),(x₂,y₂). Bestimme det H an beiden.",[f("x₁",0,"Aus y=3x folgt 3x(x−6)=0."),f("y₁",0,"y=3x."),f("x₂",6,"Zweite Nullstelle."),f("y₂",18,"3x."),f("det H₁",-36,"H=[[6x,−6],[−6,2]]."),f("det H₂",36,"12x−36.")],"(0,0): det −36, Sattel. (6,18): Hxx=36, det 36, strenges lokales Minimum."),
      t("f=x³−3x+y². Erfasse die x-Koordinaten der stationären Punkte aufsteigend und det H jeweils.",[f("x₁",-1,"3x²−3=0."),f("x₂",1,"Zweite Wurzel."),f("det H₁",-12,"H=diag(6x,2)."),f("det H₂",12,"6·2.")],"y=0; (−1,0) Sattel, (1,0) Minimum."),
      t("f=x²+y⁴ und g=x²−y⁴ am Ursprung haben dieselbe Hesse-Matrix. Kann H allein entscheiden (1/0)? Trage f(0,1/2), g(0,1/2) und g(1/2,0) ein.",[f("H entscheidet",0,"Semidefinit ist nicht ausreichend.","Semidefinitheit"),f("f-Wert",1/16,"(1/2)⁴."),f("g entlang y",-1/16,"Minus vor y⁴."),f("g entlang x",1/4,"x².")],"H=diag(2,0); f hat Minimum, g Sattel. Höhere Ordnung macht den Unterschied.")]),
  unit("5.2", "Taylor zweiter Ordnung", 31,
    "Für f∈C² lautet T₂(P+h)=f(P)+∇f(P)ᵀh+½hᵀH(P)h. h ist die Verschiebung. Gemischte Terme erscheinen zweimal im Matrixprodukt; der Faktor ½ bleibt für die reinen Quadrate wichtig.",
    "e^(x+y) bei 0: f=1, Gradient (1,1), H=[[1,1],[1,1]]. T₂=1+x+y+x²/2+xy+y²/2.",["Hesse-Matrix"],[
      t("f=exp(x), Entwicklung bei 0: Koeffizient von x² im Taylorpolynom zweiter Ordnung?",[f("x²-Koeffizient",0.5,"f″(0)/2.","Taylor-Faktor 1/2")],"T₂=1+x+x²/2."),
      t("Skript 5.2: f=e^(2x−y), P=0. Gib die Koeffizienten in T₂=a+bx+cy+dx²+exy+fy² und T₂(0,1;0,2) an.",[f("a",1,"e⁰."),f("b",2,"fₓ(0)."),f("c",-1,"fᵧ(0)."),f("d",2,"Hxx/2.","Taylor-Faktor 1/2"),f("e",-2,"Hxy."),f("f",0.5,"Hyy/2."),f("T₂",1,"2x−y=0.")],"∇f=(2,−1), H=[[4,−2],[−2,1]]. T₂=1+2x−y+2x²−2xy+y²/2. An (0,1;0,2) genau 1."),
      t("f=e^(x+2y) bei 0. Bestimme Koeffizienten von x², xy, y² und T₂(0,2;0,1).",[f("x²",0.5,"1/2."),f("xy",2,"Gemischter Term."),f("y²",2,"4/2."),f("T₂",1.48,"s=x+2y=0,4; 1+s+s²/2.")],"T₂=1+x+2y+x²/2+2xy+2y². Ergebnis 1,48."),
      t("Ein Modell liefert f(P)=3, ∇f(P)=(1,−1), H=[[2,1],[1,4]]. Für h=(0,1;0,2): lineare Änderung, quadratischer Zusatz und T₂.",[f("Linear",-0.1,"∇f·h."),f("Quadratisch",0.11,"½(2h₁²+2h₁h₂+4h₂²)."),f("T₂",3.01,"3 plus beide Änderungen.")],"Linear −0,1; quadratisch ½(0,02+0,04+0,16)=0,11; T₂=3,01.")]),
  unit("5.3", "Definitheit in drei Dimensionen", 31,
    "Für eine symmetrische Matrix prüft Sylvester die führenden Hauptminoren Δₖ, also Determinanten der linken oberen k×k-Blöcke. Alle strikt positiv ⇔ positiv definit. Alternierende Vorzeichen −,+,− ⇔ negativ definit. Nichtnegative führende Minoren allein beweisen keine Semidefinitheit; dafür alle Hauptminoren oder Eigenwerte prüfen.",
    "diag(2,3,−1) hat Eigenwerte 2,3,−1 und ist indefinit. diag(0,−1) hat führende Minoren 0,0 und ist trotzdem nicht positiv semidefinit.",["Determinanten", "Eigenwerte"],[
      t("H=diag(2,3,4). Berechne die drei führenden Hauptminoren.",[f("Δ₁",2,"Erster Eintrag."),f("Δ₂",6,"2·3."),f("Δ₃",24,"2·3·4.")],"2,6,24 ⇒ positiv definit."),
      t("Skript 5.3: f=x²+2y²+3z²−2xy. Fülle H zeilenweise aus, dann die führenden Hauptminoren.",[f("H11",2,"fxx."),f("H12",-2,"fxy."),f("H13",0,"fxz."),f("H21",-2,"fyx."),f("H22",4,"fyy."),f("H23",0,"fyz."),f("H31",0,"fzx."),f("H32",0,"fzy."),f("H33",6,"fzz."),f("Δ₁",2,"H11."),f("Δ₂",4,"8−4."),f("Δ₃",24,"6Δ₂.")],"H=[[2,−2,0],[−2,4,0],[0,0,6]]. Minoren 2,4,24 >0: eindeutiges globales Minimum der quadratischen Funktion bei 0."),
      t("f=x²+y²−z². Bestimme die Eigenwerte von H absteigend und die Anzahl negativer Eigenwerte.",[f("λ₁",2,"Diagonale."),f("λ₂",2,"Diagonale."),f("λ₃",-2,"Diagonale."),f("Negative",1,"Vorzeichen zählen.")],"H=diag(2,2,−2): indefinit, Ursprung Sattel."),
      t("A=[[0,0],[0,−1]]. Berechne führende Minoren und kleinsten Eigenwert. Ist A positiv semidefinit (1/0)?",[f("Δ₁",0,"Erster Eintrag."),f("Δ₂",0,"Determinante."),f("λmin",-1,"Diagonalmatrix."),f("Positiv semidefinit",0,"Negative Eigenwerte verbieten dies.")],"Minoren 0,0 genügen nicht; λmin=−1.")]),
];

units.push(
  unit("6.1", "Ausgleichsgerade und Normalengleichung", 40,
    "Die Gerade ŷ=β₀+β₁x hat Bias β₀ und Steigung β₁. Residuen sind r=y−ŷ. Die Designmatrix X hat Zeilen (1,xᵢ). Der quadratische Fehler L=‖y−Xβ‖² hat Gradient 2XᵀXβ−2Xᵀy. Nullsetzen ergibt XᵀXβ=Xᵀy; eine eindeutige Lösung verlangt vollen Spaltenrang.",
    "Punkte (0,1),(1,3): X=[[1,0],[1,1]], XᵀX=[[2,1],[1,1]], Xᵀy=(4,3). Daraus β=(1,2), Residuen 0.",["Matrixmultiplikation", "Lineare Gleichungssysteme"],[
      t("Die Gerade durch (0,2),(2,6): Bias und Steigung?",[f("β₀",2,"Wert bei x=0."),f("β₁",2,"Höhendifferenz durch x-Differenz.")],"ŷ=2+2x."),
      t("Skript 6.1: (1,1),(2,3),(3,2),(4,4). Schreibe X mit Bias auf Papier; erfasse XᵀX zeilenweise, Xᵀy und β.",[f("XtX11",4,"Anzahl Punkte."),f("XtX12",10,"Summe x."),f("XtX21",10,"Symmetrie."),f("XtX22",30,"Summe x²."),f("Xty1",10,"Summe y."),f("Xty2",29,"Summe xy."),f("β₀",0.5,"Löse das 2×2-System."),f("β₁",0.8,"Eliminiere β₀.")],"X hat Zeilen (1,1),(1,2),(1,3),(1,4). System [[4,10],[10,30]]β=(10,29). β=(1/2,4/5)."),
      t("Punkte (−1,0),(0,1),(1,3). Mit Bias: erfasse XᵀX-Diagonale, Xᵀy, β und RSS.",[f("XtX11",3,"Drei Einsen."),f("XtX22",2,"Summe x²."),f("Xty1",4,"Summe y."),f("Xty2",3,"Summe xy."),f("β₀",4/3,"Offdiagonale ist 0."),f("β₁",1.5,"3/2."),f("RSS",1/6,"Residuen quadrieren.")],"XtX=diag(3,2), β=(4/3,3/2). Residuen (1/6,−1/3,1/6), RSS=1/6."),
      t("Zwei Beobachtungen haben beide x=2 und y=1,3. Bestimme det(XᵀX) und die optimale Vorhersage an x=2. Ist β eindeutig (1/0)?",[f("Determinante",0,"X=[[1,2],[1,2]]."),f("Vorhersage",2,"Mittel der beiden Ziele."),f("Eindeutig",0,"Nur β₀+2β₁ wird bestimmt.","Rangvoraussetzung")],"XtX=[[2,4],[4,8]], det=0. Alle β mit β₀+2β₁=2 minimieren den Fehler.")]),
  unit("6.2", "Regression ohne Bias und Kondition", 40,
    "Ohne Bias besteht jede Zeile von X nur aus den Merkmalen. Die Normalengleichung bleibt gültig. Bei vollem Spaltenrang gilt κ₂(XᵀX)=κ₂(X)². Große Kondition bedeutet mögliche Fehlerverstärkung. Eine explizite Inverse ist numerisch ungünstig; QR vermeidet das Produkt XᵀX.",
    "X=diag(1,2), y=(3,4): β=(3,2). κ₂(X)=2 und κ₂(XᵀX)=4.",["Normalengleichung"],[
      t("Ohne Bias: ŷ=wx, Daten (1,2),(2,4). Bestimme ∑x², ∑xy, w.",[f("∑x²",5,"1+4."),f("∑xy",10,"2+8."),f("w",2,"Quotient.")],"w=10/5=2."),
      t("Skript 6.2: X=[[1,0],[0,1],[1,1]], y=(2,3,6). Berechne XᵀX zeilenweise, Xᵀy und β.",[f("XtX11",2,"Spalte 1 mit sich."),f("XtX12",1,"Spaltenprodukt."),f("XtX21",1,"Symmetrie."),f("XtX22",2,"Spalte 2 mit sich."),f("Xty1",8,"2+6."),f("Xty2",9,"3+6."),f("β₁",7/3,"2β₁+β₂=8."),f("β₂",10/3,"β₁+2β₂=9.")],"XtX=[[2,1],[1,2]], Xty=(8,9), β=(7/3,10/3)."),
      t("X=[[1,0],[0,1],[1,−1]], y=(1,2,0), ohne Bias. Berechne XtX12, Xty, β.",[f("XtX12",-1,"Spaltenprodukt."),f("Xty1",1,"1+0."),f("Xty2",2,"2−0."),f("β₁",4/3,"System [[2,−1],[−1,2]]."),f("β₂",5/3,"Elimination.")],"XtX=[[2,−1],[−1,2]], β=(4/3,5/3)."),
      t("X=diag(1,0,01). Bestimme κ₂(X), κ₂(XᵀX). Bei relativer Störung 10⁻⁶ in der rechten Seite des X-Systems: Konditionsschranke für den relativen Lösungsfehler?",[f("κ(X)",100,"Größter/kleinster Singulärwert."),f("κ(XtX)",10000,"Quadrieren."),f("Fehlerschranke",0.0001,"κ(X)·10⁻⁶.","Konditionszahl",{tolerance:1e-8})],"κ(X)=100, κ(XtX)=10000; Schranke 10⁻⁴ bei unverändertem X.")]),
  unit("6.3", "QR und Rückwärtseinsetzen", 40,
    "Bei X=QR hat Q orthonormale Spalten: QᵀQ=I (I ist die Einheitsmatrix). R ist eine obere Dreiecksmatrix. Für vollen Spaltenrang löst man Rβ=Qᵀy von unten nach oben. Die QR-Zerlegung wird im Skript vorgegeben, nicht von Hand konstruiert.",
    "R=[[2,3],[0,5]], d=(13,10): zuerst β₁=10/5=2; dann β₀=(13−3·2)/2=3,5.",["Skalarprodukt", "Lineare Gleichungssysteme"],[
      t("R=[[2,1],[0,3]], d=(5,3). Bestimme β₂, dann β₁.",[f("β₂",1,"Letzte Zeile."),f("β₁",2,"(5−β₂)/2.")],"β=(2,1)."),
      t("Skript 6.3: Q=[[1/√2,0],[0,1],[1/√2,0]], R=[[2,1],[0,3]], y=(4,2,2). Erfasse QᵀQ zeilenweise, d=Qᵀy und β.",[f("QtQ11",1,"1/2+1/2."),f("QtQ12",0,"Spalten orthogonal."),f("QtQ21",0,"Symmetrie."),f("QtQ22",1,"1²."),f("d₁",3*Math.sqrt(2),"6/√2."),f("d₂",2,"Mittlere Komponente."),f("β₁",(3*Math.sqrt(2)-2/3)/2,"(d₁−β₂)/2."),f("β₂",2/3,"d₂/3.")],"QᵀQ=I; d=(3√2,2); β₂=2/3, β₁=3√2/2−1/3."),
      t("Q=[[1,0],[0,0,6],[0,0,8]] bedeutet Zeilen (1;0),(0;0,6),(0;0,8). R=[[2,−1],[0,5]], y=(4,3,4). Bestimme d=Qᵀy und β.",[f("d₁",4,"Erste Spalte."),f("d₂",5,"0,6·3+0,8·4."),f("β₁",2.5,"2β₁−β₂=4."),f("β₂",1,"5β₂=5.")],"d=(4,5), β=(2,5;1). Q-Spalten haben Norm 1 und Skalarprodukt 0."),
      t("Jemand verwendet Q=[[1,1],[0,1]], R=I und behauptet β=Qᵀy für y=(0,1). Berechne (QᵀQ)₁₂ und die tatsächliche Lösung von Qβ=y.",[f("QtQ12",1,"Spaltenprodukt."),f("β₁",-1,"β₂=1, β₁+β₂=0."),f("β₂",1,"Zweite Zeile.")],"Q ist nicht orthonormal, daher ist Qᵀ keine Linksinverse. β=(−1,1).")]),
  unit("7.1", "Gradient Descent und Stabilität", 46,
    "Gradient Descent aktualisiert xₖ₊₁=xₖ−η∇f(xₖ). η heißt Lernrate. Für positiv definite quadratische Funktionen mit konstanter Hesse-Matrix gilt exakt 0<η<2/λmax. Der Randwert ist ausgeschlossen: eine Komponente kann dauerhaft oszillieren. Für neuronale Netze ist dies keine globale Garantie.",
    "f=x²+4y², ∇f=(2x,8y), λmax=8. η=0,1<1/4. Von (2,1) geht es nach (1,6;0,2), dann (1,28;0,04).",["Gradient", "Eigenwerte"],[
      t("f=x², x₀=2, η=1/4. Berechne ∇f(x₀) und x₁.",[f("Gradient",4,"2x."),f("x₁",1,"2−(1/4)·4.")],"Gradient 4, x₁=1."),
      t("Skript 7.1: f=3x²+y², Start (1,2), η=0,1. Bestimme λmax, obere offene Lernratengrenze und zwei Schritte.",[f("λmax",6,"H=diag(6,2)."),f("Grenze",1/3,"2/λmax; nicht inklusive."),f("x₁",0.4,"x−0,1·6x."),f("y₁",1.6,"y−0,1·2y."),f("x₂",0.16,"Neuen Gradienten verwenden."),f("y₂",1.28,"Neuen Gradienten verwenden.")],"0<η<1/3. (0,4;1,6) → (0,16;1,28)."),
      t("f=2x²+y², Start (2,−1), η=1/4. Berechne zwei Schritte und λmax.",[f("x₁",0,"2−(1/4)·8."),f("y₁",-0.5,"−1−(1/4)·(−2)."),f("x₂",0,"Gradient x ist jetzt 0."),f("y₂",-0.25,"Noch ein Schritt."),f("λmax",4,"H=diag(4,2).")],"(0,−1/2) → (0,−1/4), η<1/2."),
      t("f=x²+4y², Start (0,1), η=1/4. Berechne y₁,y₂. Konvergiert dieser Lauf zum Minimum (1/0)?",[f("y₁",-1,"Faktor 1−8η."),f("y₂",1,"Nochmals mit −1 multiplizieren."),f("Konvergiert",0,"Betrag bleibt 1.","Offene Lernratengrenze")],"Am Rand η=2/8 ist der Faktor −1. Der Lauf oszilliert, statt zu konvergieren.")]),
  unit("7.2", "Momentum von Hand", 46,
    "Momentum speichert einen Geschwindigkeitsvektor v. Hier gilt die Skriptkonvention vₖ₊₁=γvₖ+η∇f(xₖ), xₖ₊₁=xₖ−vₖ₊₁. γ gewichtet die bisherige Bewegung. Momentum kann beschleunigen, aber auch überschwingen; die GD-Grenze allein prüft seine Stabilität nicht.",
    "f=x², x₀=1,v₀=0,η=0,1,γ=0,5: v₁=0,2,x₁=0,8; v₂=0,1+0,16=0,26,x₂=0,54.",["Gradient Descent"],[
      t("v₀=0, Gradient=6, η=0,1, γ=0,9, x₀=2. Berechne v₁ und x₁.",[f("v₁",0.6,"γv₀+ηg."),f("x₁",1.4,"x₀−v₁.")],"v₁=0,6,x₁=1,4."),
      t("Skript 7.2: f=x²+4y², x₀=(2,1), v₀=(0,0), η=0,1, γ=0,9. Erfasse v₁,x₁,v₂,x₂ komponentenweise.",[f("v₁x",0.4,"0,1·4."),f("v₁y",0.8,"0,1·8."),f("x₁",1.6,"2−0,4."),f("y₁",0.2,"1−0,8."),f("v₂x",0.68,"0,9·0,4+0,1·3,2."),f("v₂y",0.88,"0,9·0,8+0,1·1,6."),f("x₂",0.92,"x₁−v₂x."),f("y₂",-0.68,"y₁−v₂y.")],"v₁=(0,4;0,8), x₁=(1,6;0,2); v₂=(0,68;0,88), x₂=(0,92;−0,68)."),
      t("f=x², x₀=2,v₀=0,η=1/4,γ=1/2. Berechne v₁,x₁,v₂,x₂.",[f("v₁",1,"η·2x₀."),f("x₁",1,"2−1."),f("v₂",1,"1/2+1/2."),f("x₂",0,"1−1.")],"v₁=1,x₁=1,v₂=1,x₂=0."),
      t("Ein Momentum-Lauf erreicht x=0 beim Minimum von f=x², aber v=1. Für γ=1/2 und η=1/4: nächste Geschwindigkeit und Position? Bleibt er sofort stehen (1/0)?",[f("v neu",0.5,"Gradient ist 0, Erinnerung bleibt."),f("x neu",-0.5,"x−v neu."),f("Stillstand",0,"Geschwindigkeit ist nicht null.")],"v neu=1/2, x neu=−1/2. Anders als GD kann Momentum das Minimum überqueren.")]),
  unit("7.3", "Mini-Batch, SGD und MLP", 47,
    "Für Lᵢ(w)=½(wxᵢ−yᵢ)² ist der Einzelgradient xᵢ(wxᵢ−yᵢ). Full-Batch mittelt alle, Mini-Batch eine Teilmenge, SGD einen Punkt. Bei gleichmäßiger Zufallsauswahl ist der Schätzer erwartungstreu, nicht jeder Schritt fehlerfrei. Das Skript-MLP hat 64→16→10, ReLU innen, 1210 Parameter. Logits sind keine Wahrscheinlichkeiten; Softmax normiert, Kreuzentropie ist −ln(p der richtigen Klasse).",
    "D=(1,2),(2,3), w=1: Einzelgradienten −1,−2; Mittel −1,5. Mit η=0,1 wird w=1,15. MSE vergleicht Ausgaben quadratisch mit dem One-Hot-Ziel.",["Ableitungen", "Mittelwert"],[
      t("Ein Punkt (x,y)=(2,3), w=1. Berechne ½(wx−y)² und seinen Gradienten.",[f("L",0.5,"Fehler −1 quadrieren und halbieren."),f("Gradient",-2,"x(wx−y).")],"L=1/2, Gradient=−2."),
      t("Skript 7.3: D=(1,2),(2,3),(3,5), w₀=2. Berechne drei Einzelgradienten, Full-Batch-Mittel und w₁ für Batch {1,3}, η=0,1.",[f("g₁",0,"1(2−2)."),f("g₂",2,"2(4−3)."),f("g₃",3,"3(6−5)."),f("Full",5/3,"Durch 3 teilen."),f("w₁",1.85,"Batchgradient (0+3)/2.")],"Full=5/3; Batch=3/2; w₁=2−0,15=1,85."),
      t("D=(1,1),(2,4),(3,3), w=1, Batch {1,2}, η=0,1. Erfasse Full-Mittel, Batch-Mittel und neues w.",[f("Full",-4/3,"Gradienten 0,−4,0."),f("Batch",-2,"Mittel der ersten beiden."),f("w neu",1.2,"1−0,1·(−2).")],"Full=−4/3, Batch=−2, Update 1,2."),
      t("Ein 2→3→2-MLP mit Bias in beiden Schichten: Parameterzahl? Für zwei Logits (0,0) und Klasse 1: p₁ und Kreuzentropie (numerisch)?",[f("Parameter",17,"3·2+3+2·3+2."),f("p₁",0.5,"Beide Exponentialwerte gleich."),f("Kreuzentropie",Math.log(2),"−ln(1/2).")],"17 Parameter; Softmax (1/2,1/2); Verlust ln 2 ≈0,693147.")]),
  unit("8.1", "Riemann-Idee und Fubini", 52,
    "Ein Doppelintegral summiert kleine Säulen f(x,y)ΔxΔy; im Grenzwert wird die Zerlegung beliebig fein. Bei stetigem f auf einem kompakten Rechteck darf Fubini die Reihenfolge vertauschen. ∫∫1 ist Fläche; für f≥0 ist ∫∫f ein Volumen, sonst ein signiertes Volumen.",
    "∫₀¹∫₀²1 dy dx=∫₀¹2 dx=2. Für f=x ergibt die innere Integration 2x und die äußere den Wert 1.",["Stammfunktionen"],[
      t("Integriere 1 über [0,2]×[0,3].",[f("Integral",6,"Breite mal Höhe.")],"Fläche 2·3=6."),
      t("Skript 8.1: f=2x+6xy² über [0,1]×[0,2]. Nach innerem y-Integral entsteht ax. Erfasse a, Endwert und Kontrollwert bei umgekehrter Reihenfolge.",[f("a",20,"2xy+2xy³ an y=2."),f("Integral",10,"∫₀¹20x dx."),f("Kontrolle",10,"Nach x entsteht 1+3y².")],"Innen 4x+16x=20x; außen 10. Umgekehrt ∫₀²(1+3y²)dy=2+8=10."),
      t("f=x+y über [0,2]×[0,1]. Nach y-Integration ax+b: a,b und Gesamtintegral?",[f("a",1,"x·1."),f("b",0.5,"∫₀¹y dy."),f("Integral",3,"∫₀²(x+1/2)dx.")],"Innen x+1/2; insgesamt 2+1=3."),
      t("f=x−1 auf [0,2]×[0,1]. Berechne signiertes Integral und geometrisches Volumen zwischen Graph und Ebene (Integral von |f|).",[f("Signiert",0,"Positive/negative Teile heben sich auf."),f("Volumen",1,"Zwei Dreiecke mit Fläche 1/2.")],"Signiert 0; geometrisches Volumen 1. Negative Höhen nicht als negatives geometrisches Volumen zählen.")]),
  unit("8.2", "Normalbereiche und Reihenfolgewechsel", 52,
    "Ein Normalbereich lässt sich durch a≤x≤b, unten(x)≤y≤oben(x) beschreiben. Vertikale Streifen bedeuten zuerst dy. Für horizontale Streifen zuerst dx; dazu Randgleichungen nach x auflösen. Beim Wechsel können mehrere Teilgebiete nötig sein.",
    "Dreieck (0,0),(2,0),(2,1): 0≤x≤2, 0≤y≤x/2. Horizontal: 0≤y≤1, 2y≤x≤2. Fläche 1.",["Stammfunktionen", "Geradengleichungen"],[
      t("Dreieck (0,0),(1,0),(1,1). Obere Grenze y=ax und Fläche?",[f("a",1,"Gerade durch Ursprung und (1,1)."),f("Fläche",0.5,"Halbes Quadrat.")],"0≤y≤x, Fläche 1/2."),
      t("Skript 8.2: Dreieck (0,0),(3,0),(3,2). Erfasse y-Grenze ax, äußere x-Obergrenze, Koeffizient b in ∫₀³ bx³ dx nach innerer Integration von xy und Endwert.",[f("a",2/3,"Steigung der schrägen Kante."),f("x oben",3,"Rechter Rand."),f("b",2/9,"x·(ax)²/2."),f("Integral",4.5,"(2/9)·3⁴/4.")],"0≤x≤3,0≤y≤2x/3. ∫ xy dy=2x³/9; Integral 9/2. Horizontal: 0≤y≤2,3y/2≤x≤3."),
      t("Gebiet zwischen y=x² und y=x, 0≤x≤1. Erfasse Fläche und ∫∫x dA. Horizontal ist y≤x≤√y; erfasse äußere y-Obergrenze.",[f("Fläche",1/6,"∫₀¹(x−x²)dx."),f("Integral x",1/12,"∫₀¹(x²−x³)dx."),f("y oben",1,"Schnittpunkte.")],"Fläche 1/2−1/3=1/6; Moment 1/3−1/4=1/12."),
      t("L-Gebiet: [0,2]×[0,1] vereinigt mit [0,1]×[1,2]. Für horizontale Streifen ist x oben zunächst 2, dann 1. Erfasse Teilungswert y, Fläche und Integral von x+y.",[f("Teilung y",1,"Dort springt der rechte Rand."),f("Fläche",3,"2·1+1·1."),f("Integral",5,"Integriere beide disjunkten Rechtecke.")],"y∈[0,1]: x∈[0,2]; y∈[1,2]: x∈[0,1]. Integral 3+2=5. Ein einziges umschließendes Rechteck wäre falsch.")]),
  unit("8.3", "Polartransformation und Gaußintegral", 53,
    "Polarkoordinaten sind x=r cos φ,y=r sin φ. Bei einer C¹-Koordinatentransformation mit invertierbarer Ableitung und eindeutiger Zuordnung im Inneren gilt dA=|det J|dr dφ. Polar ist |det J|=r; Ursprung und Winkelschnitt sind Randmengen vom Flächenmaß 0. Der Betrag verhindert negative Flächen.",
    "Einheitskreis: ∫₀²π∫₀¹r dr dφ=π. Für e^(−r²) ist eine Stammfunktion von r e^(−r²) gleich −e^(−r²)/2. Das Gaußintegral über ℝ ist √π, sein Quadrat ist das Integral e^(−x²−y²) über ℝ².",["Substitution", "Determinante"],[
      t("Kreisradius 2: Jacobi-Faktor an r=2 und Fläche geteilt durch π?",[f("Jacobi-Faktor",2,"Der Faktor ist r.","Polar-Jacobian"),f("Fläche / π",4,"R².")],"Jacobian 2; Fläche 4π."),
      t("Skript 8.3: Integral e^(−x²−y²) auf Radius R. Ergebnis Aπ(1−e^(−R²)). Erfasse A, Integral bei R=1 und Grenzwert R→∞.",[f("A",1,"Radiales Integral (1−e^(−R²))/2, Winkel 2π."),f("R=1",Math.PI*(1-Math.exp(-1)),"π(1−e⁻¹)."),f("Grenzwert",Math.PI,"Exponentialrest verschwindet.")],"∫₀²π∫₀ᴿ e^(−r²)r dr dφ=π(1−e^(−R²)); Grenzwert π."),
      t("Integriere x²+y² über den Ring 1≤r≤2. Erfasse Potenz k im radialen Integranden rᵏ und Ergebnis geteilt durch π.",[f("k",3,"r² mal Jacobian r.","Polar-Jacobian"),f("Integral / π",7.5,"2·(2⁴−1)/4.")],"2π∫₁²r³dr=15π/2."),
      t("Transformation x=2u,y=−3v auf [0,1]². Erfasse det J, Flächenfaktor und Integral von 1 über das Bildgebiet.",[f("det J",-6,"2·(−3)."),f("Flächenfaktor",6,"Betrag der Determinante."),f("Integral",6,"Flächenfaktor mal Einheitsfläche.")],"Orientierung negativ, Fläche positiv: |det J|=6.")]),
  unit("9.1", "Lagrange und Kandidatenvergleich", 58,
    "Eine Nebenbedingung g=0 schränkt zulässige Punkte ein. Bei ∇g≠0 gilt am Extremum ∇f=λ∇g. Wir verwenden L=f−λg. Lagrange liefert Kandidaten, noch keine Klassifikation. Auf einer kompakten Menge nimmt stetiges f Maximum und Minimum an; alle Kandidaten und ggf. singuläre Randfälle vergleichen.",
    "f=x, g=x²+y²−1: (1,0)=λ(2x,2y). Kandidaten (±1,0), Werte ±1; Maximum 1, Minimum −1. Heine Abschnitt 10, Blatt 46–49 / PDF 25–28 erklärt dieselbe Methode mit anderer Vorzeichenkonvention für λ.",["Gradient", "Gleichungssysteme"],[
      t("Maximiere x auf x²+y²=4. Erfasse x,y und maximalen Wert.",[f("x",2,"Rechter Kreispunkt."),f("y",0,"Kreisrand."),f("Maximum",2,"f=x.")],"Maximum bei (2,0); Minimum bei (−2,0)."),
      t("Skript 9.1: f=2x+4y, g=x²+y²−5. Für L=f−λg: Maximalpunkt, λ dort, minimaler und maximaler Funktionswert?",[f("x max",1,"2=2λx,4=2λy ⇒ y=2x."),f("y max",2,"5x²=5."),f("λ max",1,"1=λx."),f("Minimum",-10,"Negativer Kandidat."),f("Maximum",10,"2·1+4·2.")],"Kandidaten (1,2),λ=1 und (−1,−2),λ=−1. Werte ±10, Kreis kompakt."),
      t("f=3x+4y auf x²+y²=25. Erfasse Maximalpunkt und beide Extremwerte.",[f("x",3,"Gradient parallel zu (x,y)."),f("y",4,"Normbedingung."),f("Minimum",-25,"Gegenpunkt."),f("Maximum",25,"3²+4².")],"(3,4) und (−3,−4), Werte ±25."),
      t("f=x² auf x²+y²=1. Erfasse maximalen und minimalen Wert sowie die Anzahl aller Extremstellen auf dem Kreis. Vergleiche beide Kandidatenfamilien.",[f("Maximum",1,"y=0."),f("Minimum",0,"x=0."),f("Anzahl",4,"Je zwei gegenüberliegende Punkte.")],"(±1,0) liefern 1, (0,±1) liefern 0. Beide Familien aus den Lagrange-Gleichungen nötig.")]),
  unit("9.2", "PCA vollständig rechnen", 58,
    "Zentrieren heißt den Mittelwert μ von jedem Datenpunkt abzuziehen. Nach Skript ist Σ=X̃ᵀX̃/n (nicht 1/(n−1)). Eigenvektoren erfüllen Σv=λv. Eine Hauptachse hat Norm 1; v und −v sind gleichwertig, Projektionen z=X̃v müssen ihr Vorzeichen mitwechseln. Erklärte Varianz ist λ₁/Σλᵢ. Bei Gesamtvarianz 0 ist der Anteil nicht definiert.",
    "Punkte (1,0),(−1,0): μ=0, Σ=diag(1,0), Hauptachse (1,0), Projektionen (1,−1). L=vᵀΣv−λ(vᵀv−1) liefert 2Σv−2λv=0. Der Spektralsatz liefert orthonormale Eigenachsen symmetrischer Σ; die größte λ maximiert die Varianz.",["Eigenwerte", "Norm", "Matrixmultiplikation"],[
      t("Punkte (1,1),(3,1): Mittelwert und Varianz der ersten Koordinate nach 1/n?",[f("μx",2,"Mittelwert."),f("μy",1,"Beide y gleich."),f("Var x",1,"(1+1)/2.","PCA-Normierung")],"μ=(2,1); zentriert (−1,0),(1,0); Var x=1."),
      t("Skript 9.2: (2,1),(−2,−1),(0,0). Erfasse Σ zeilenweise, Eigenwerte absteigend, normierte Hauptachse, Varianzanteil und Projektion des ersten Punktes. Beide Achsenvorzeichen sind erlaubt.",[f("Σ11",8/3,"(4+4)/3.","PCA-Normierung"),f("Σ12",4/3,"(2+2)/3."),f("Σ21",4/3,"Symmetrie."),f("Σ22",2/3,"(1+1)/3."),f("λ₁",10/3,"Spur, Rang 1."),f("λ₂",0,"Rang 1."),f("v₁",2/Math.sqrt(5),"(2,1) normieren.","Normierte Hauptachse",{signGroup:"axis"}),f("v₂",1/Math.sqrt(5),"Norm √5.","Normierte Hauptachse",{signGroup:"axis"}),f("Anteil",1,"λ₁/(λ₁+λ₂)."),f("z₁",Math.sqrt(5),"Skalarprodukt mit deiner Achse.","Konsistente Projektion",{signGroup:"axis"})],"Σ=[[8/3,4/3],[4/3,2/3]], λ=(10/3,0), v=±(2,1)/√5, Anteil 1, z₁=±√5 mit gleichem Vorzeichen."),
      t("Daten (0,1),(2,1),(4,1). Erfasse μ, Σ11, Σ22, Hauptachse und Projektion des ersten Punktes.",[f("μx",2,"Mittelwert."),f("μy",1,"Mittelwert."),f("Σ11",8/3,"Zentrierte Quadrate /3."),f("Σ22",0,"y bleibt konstant."),f("v₁",1,"x-Achse.","Normierte Hauptachse",{signGroup:"axis"}),f("v₂",0,"Keine y-Streuung.","Normierte Hauptachse",{signGroup:"axis"}),f("z₁",-2,"Erst zentrieren.","Konsistente Projektion",{signGroup:"axis"})],"μ=(2,1), Σ=diag(8/3,0); v=±(1,0); Projektion des ersten Punktes ∓2."),
      t("Σ=[[3,1],[1,3]]. Berechne beide Eigenwerte, erklärte Varianz der ersten Achse und vᵀΣv für v=(1,0). Ist diese Koordinatenachse optimal (1/0)?",[f("λ₁",4,"(3−λ)²−1=0."),f("λ₂",2,"Zweite Wurzel."),f("Anteil",2/3,"4/(4+2)."),f("Varianz v",3,"Eintrag Σ11."),f("Optimal",0,"Vergleiche 3 mit λmax.")],"λ=4,2; Hauptachse ±(1,1)/√2 erreicht Varianz 4. v=(1,0) erreicht nur 3.")]),
  unit("9.3", "Geometrische Optimierung", 58,
    "Bei festem Umfang U lautet die Rechteckbedingung 2x+2y=U, x,y>0. L=xy−λ(2x+2y−U). Die Gleichungen y=2λ, x=2λ ergeben x=y. Für den globalen Vergleich kann man y=U/2−x einsetzen und Randwerte betrachten.",
    "U=8: A=x(4−x)=4−(x−2)², Maximum 4 bei x=y=2. An den degenerierten Randpunkten ist die Fläche 0.",["Lagrange"],[
      t("Rechteckumfang 12, x=2. Bestimme y und Fläche.",[f("y",4,"2x+2y=12."),f("Fläche",8,"xy.")],"y=4, A=8."),
      t("Skript 9.3 mit U=20: Bestimme optimale Seiten, λ für L=xy−λ(2x+2y−20), maximale Fläche und zweite Ableitung der reduzierten Fläche A(x).",[f("x",5,"U/4."),f("y",5,"x=y."),f("λ",2.5,"y=2λ."),f("Amax",25,"xy."),f("A″",-2,"A=10x−x².")],"Quadrat 5×5, λ=2,5, A=25; A″=−2 und Randfläche 0 sichern globales Maximum."),
      t("Bei Umfang U=16: maximale Fläche, optimale Seitenlänge und Flächenverlust bei x=3 statt optimalem x?",[f("Amax",16,"U²/16."),f("Seite",4,"U/4."),f("Verlust",1,"Dann y=5 und Fläche 15.")],"Quadrat 4×4; 3×5 verliert 1 Flächeneinheit."),
      t("Drei Seiten eines rechteckigen Gartens erhalten Zaun, eine liegt an einer Wand. Zaunlänge 12: 2x+y=12. Bestimme optimale Tiefe x, Breite y und Fläche.",[f("x",3,"A=x(12−2x), A′=12−4x."),f("y",6,"Nebenbedingung."),f("Fläche",18,"xy.")],"x=3,y=6,A=18. Hier ist das Optimum kein Quadrat; die Nebenbedingung hat sich geändert.")]),
);

units.push(
  unit("2.topologie", "Offene Mengen und Stetigkeit", 7,
    "Eine offene Menge enthält um jeden ihrer Punkte eine kleine Kugel vollständig. Abgeschlossen heißt, alle Grenzpunkte gehören dazu. In ℝⁿ ist abgeschlossen und beschränkt gleich kompakt. Stetigkeit verlangt denselben Funktionsgrenzwert auf allen Wegen. Polynome sind überall stetig; Wurzeln verlangen nichtnegative Radikanden, Nenner dürfen nicht null sein.",
    "x²+y²<1 ist offen, nicht abgeschlossen. x²+y²≤1 ist abgeschlossen und beschränkt, also kompakt. Einzelne erfolgreiche Annäherungswege beweisen keine Stetigkeit.",["Definitionsbereiche"],[
      t("Ist die offene Einheitskreisscheibe offen (1/0), abgeschlossen (1/0)?",[f("Offen",1,"Strikte Ungleichung."),f("Abgeschlossen",0,"Rand fehlt.")],"Offen 1, abgeschlossen 0."),
      t("Eigene Ergänzung: D={x²+y²≤4}. Offen, abgeschlossen, kompakt? 1/0.",[f("Offen",0,"Rand gehört dazu."),f("Abgeschlossen",1,"Alle Grenzpunkte enthalten."),f("Kompakt",1,"Abgeschlossen und beschränkt.")],"Nicht offen; abgeschlossen und kompakt.",{own:true}),
      t("D={x>0}. Offen, abgeschlossen, beschränkt? 1/0.",[f("Offen",1,"Positive Distanz zur Geraden für jeden Punkt."),f("Abgeschlossen",0,"x=0 fehlt."),f("Beschränkt",0,"Beliebig große Koordinaten.")],"Offene, unbeschränkte Halbebene."),
      t("f(x,y)=x²y/(x²+y²) für (x,y)≠0, f(0)=0. Es gilt |f|≤|y|. Welcher Grenzwert folgt bei (x,y)→0? Ist f stetig (1/0)?",[f("Grenzwert",0,"Sandwich-Abschätzung."),f("Stetig",1,"Grenzwert stimmt mit f(0) überein.")],"0≤|f|≤|y|→0. Anders als bloße Wegtests ist dies eine allgemeine Schranke.")]),
  unit("8.dichte", "Gemeinsame Dichten und Randdichten", 51,
    "Eine Dichte p ist nichtnegativ und integriert zu 1. Wahrscheinlichkeit ist das Integral über ein Ereignis, nicht der Dichtewert an einem Punkt. Die Randdichte p_X entsteht durch Ausintegrieren von y. E[X]=∫∫xp, Cov(X,Y)=E[XY]−E[X]E[Y]. Kovarianz 0 allein beweist keine Unabhängigkeit.",
    "p=4xy auf [0,1]²: Integral 4·1/2·1/2=1; p_X=2x, p_Y=2y; E[X]=E[Y]=2/3; E[XY]=4/9, Cov=0. Hier faktorisiert p=p_Xp_Y, also sind X,Y unabhängig.",["Integrale", "Wahrscheinlichkeit"],[
      t("Konstante Dichte c auf [0,2]×[0,1]. Bestimme c und P(X≤1).",[f("c",0.5,"c·Fläche=1."),f("Wahrscheinlichkeit",0.5,"Halbe Fläche.")],"c=1/2, P=1/2."),
      t("Eigene Aufgabe zu 8.4: p=cxy auf [0,2]×[0,1], sonst 0. Bestimme c, a in p_X(x)=ax, E[X], E[Y], E[XY], Cov und P(X≤1).",[f("c",1,"∫x dx=2,∫y dy=1/2."),f("a",0.5,"y ausintegrieren."),f("E[X]",4/3,"∫₀²x²/2 dx."),f("E[Y]",2/3,"Randdichte 2y."),f("E[XY]",8/9,"∫x²·∫y²."),f("Cov",0,"E[XY]−E[X]E[Y]."),f("P",0.25,"∫₀¹x/2 dx.")],"c=1, p_X=x/2 (0≤x≤2), p_Y=2y (0≤y≤1); Mittel 4/3,2/3; Cov=0; P=1/4.",{own:true}),
      t("p=c auf dem Dreieck 0≤y≤x≤1. Erfasse c, a in p_X=ax, E[X], E[Y], E[XY] und Cov.",[f("c",2,"Fläche 1/2."),f("a",2,"Innenlänge x mal c."),f("E[X]",2/3,"∫₀¹2x² dx."),f("E[Y]",1/3,"p_Y=2(1−y)."),f("E[XY]",1/4,"∫₀¹x³ dx."),f("Cov",1/36,"1/4−2/9.")],"p_X=2x, p_Y=2(1−y), Mittel 2/3 und 1/3; Cov=1/36."),
      t("p=x+y auf [0,1]². Erfasse Normierungsintegral, p_X(1/2), E[X], E[XY] und Cov. Folgt Unabhängigkeit (1/0)?",[f("Normierung",1,"Integral x plus Integral y."),f("p_X(1/2)",1,"p_X=x+1/2."),f("E[X]",7/12,"1/3+1/4."),f("E[XY]",1/3,"1/6+1/6."),f("Cov",-1/144,"1/3−49/144."),f("Unabhängig",0,"Nichtzero Kovarianz.")],"Normierung 1; p_X=x+1/2, E=7/12, E[XY]=1/3, Cov=−1/144.")]),
  unit("3.fehler", "Vertiefung: Fehlerfortpflanzung", 14,
    "Für kleine Eingabeabweichungen liefert das totale Differential eine lineare Näherung. Worst-Case: Δf≈Σ|∂f/∂xᵢ|Δxᵢ. Bei unabhängigen zufälligen Fehlern mit Standardabweichungen sᵢ: s_f≈√Σ(∂f/∂xᵢ·sᵢ)². Das sind verschiedene Modelle, keine exakten Schranken für beliebig große Fehler.",
    "A=xy, x=2,y=3, Δx=Δy=0,1: Worst-Case≈3·0,1+2·0,1=0,5. Bei unabhängigen Standardabweichungen 0,1: √0,13≈0,3606.",["Totales Differential"],[
      t("f=2x, Δx=0,1. Linearer absoluter Fehler?",[f("Δf",0.2,"|2|Δx.")],"0,2."),
      t("Eigene Heine-Variante: I=U/R, U=10,R=100, ΔU=0,2, ΔR=1. Bestimme I und linearen Worst-Case-Fehler.",[f("I",0.1,"U/R."),f("ΔI",0.003,"ΔU/R+UΔR/R².","Fehlermodell",{tolerance:1e-6})],"I=0,1; ΔI≈0,002+0,001=0,003.",{own:true}),
      t("A=xy, x=4,y=2, Δx=0,1,Δy=0,2. Worst-Case-Fehler und relativer Fehler?",[f("ΔA",1,"2·0,1+4·0,2."),f("Relativ",0.125,"Durch A=8 teilen.")],"ΔA≈1, relativ 1/8."),
      t("f=x+y, unabhängige Standardabweichungen sₓ=3,sᵧ=4. Vergleiche s_f mit der Summe der absoluten Fehlergrenzen 3 und 4.",[f("Standardabweichung",5,"Quadratische Summe."),f("Worst Case",7,"Lineare Summe.")],"Standardabweichung 5 bei Unabhängigkeit; Worst-Case-Grenzen addieren sich zu 7.")],
    { supplementary:true, source:{file:"Mathe_Sem3_Heine_Skript_1_Differentialrechnung-mehrdimensional (1).pdf",chapter:"11 Fehlerrechnung",printed:"50–51",pdf:"29–30"} }),
  unit("8.raum", "Vertiefung: Dreifachintegrale und Kugel", 53,
    "Ein Dreifachintegral von 1 misst Volumen. In kartesischen Koordinaten werden drei Grenzen verschachtelt. Kugelkoordinaten mit Radius r, Polarwinkel θ und Azimut φ haben Volumenelement r²sinθ dr dθ dφ; θ läuft von 0 bis π für die ganze Kugel.",
    "Achtelkugel im positiven Oktanten: 0≤x≤R, 0≤y≤√(R²−x²), 0≤z≤√(R²−x²−y²). In Kugelkoordinaten θ,φ∈[0,π/2], r∈[0,R]. Volumen πR³/6; mal 8 ergibt 4πR³/3.",["Mehrfachintegrale"],[
      t("Quader mit Seiten 2,3,4: ∫∫∫1?",[f("Volumen",24,"Produkt.")],"24."),
      t("Heine-Variante: 0≤x≤1,0≤z≤x,0≤y≤x. Nach inneren zwei Integralen steht xᵏ. Erfasse k und Volumen.",[f("k",2,"x mal x."),f("Volumen",1/3,"∫₀¹x² dx.")],"V=∫₀¹x²dx=1/3.",{own:true}),
      t("Achtelkugel mit Radius 2: Volumen geteilt durch π?",[f("V/π",4/3,"R³/6.")],"8/6=4/3."),
      t("Kugelschale zwischen Radien 1 und 2: Volumen geteilt durch π und Anteil der positiven Achtelschale am Gesamtvolumen?",[f("V/π",28/3,"4(2³−1³)/3."),f("Anteil",1/8,"Symmetrie.")],"V=28π/3; ein Oktant hat 1/8.")],
    { supplementary:true, source:{file:"Mathe_Sem3_Heine_Skript_2_Integrale-mehrdimensional.pdf",chapter:"Volumenintegrale",printed:"6–7",pdf:"6–7"} }),
);

export const diagnostics = [
  ["Ableitungsregeln", "f=x³. Berechne f′(2).", 12, "Potenzregel: (xⁿ)′=nxⁿ⁻¹. Erst ableiten, dann einsetzen.", "f=x²+2x. Berechne f′(3).",8],
  ["Stammfunktionen", "∫₀²x dx?",2,"Eine Stammfunktion von x ist x²/2; oberer minus unterer Wert.","∫₀¹3x² dx?",1],
  ["Vektoren", "u=(1,2),v=(3,−1). Erste Komponente von u+v?",4,"Vektoren addiert man komponentenweise.","u=(2,−1). Zweite Komponente von 3u?",-3],
  ["Norm", "Länge des Vektors (3,4)?",5,"Die euklidische Norm ist √(x²+y²).","Länge von (0,−7)?",7],
  ["Skalarprodukt", "(1,2)·(3,4)?",11,"Gleiche Komponenten multiplizieren, dann addieren.","(2,−1)·(3,4)?",2],
  ["Matrixmultiplikation", "A=[[1,2],[3,4]], x=(2,1). Erste Komponente von Ax?",4,"Jede Zeile mit dem Spaltenvektor als Skalarprodukt verrechnen.","A=[[1,0],[2,3]], x=(1,2). Zweite Komponente von Ax?",8],
  ["Eigenwerte", "Größter Eigenwert von diag(2,5)?",5,"Av=λv. Bei einer Diagonalmatrix stehen Eigenwerte auf der Diagonale.","Kleinster Eigenwert von diag(3,−1)?",-1],
  ["Wahrscheinlichkeit", "Gleichverteilung auf [0,2]: P(X≤1)?",0.5,"Wahrscheinlichkeit ist Dichte mal Intervalllänge, hier Dichte 1/2.","Gleichverteilung auf [0,4]: P(X≤1)?",0.25],
].map(([title,prompt,answer,explanation,retry,retryAnswer],index)=>({id:`diagnose-${index}`,title,explanation,tasks:[prompt,retry].map((p,i)=>({...t(p,[f("Ergebnis",i?retryAnswer:answer,explanation)],explanation),id:`diagnose-${index}-${i}`,family:`diagnose-${index}`,chapter:0,source:source(index>=6?index===6?9:8:1,index>=6?index===6?54:51:1),own:true,independent:false}))}));

export const capstones = [
  t("Abschluss 1: f(x,y)=x²+2xy+y, P=(1,2). Beschreibe Feldtyp und Definitionsbereich. Berechne Wert, Gradient, Tangentialebene T=A+B(x−1)+C(y−2) und ihre Näherung bei (1,1;1,9). Der Pfad g(t)=(t,2t²) führt bei t=1 durch P: leite f∘g dort mit passenden Jacobi-Dimensionen ab. Bestimme die normierte Richtungsableitung für u=(3,4).",
    [f("Ausgabedimension",1,"Eine Zahl."),f("A",7,"f(P)."),f("B",6,"2x+2y."),f("C",3,"2x+1."),f("T(1,1;1,9)",7.3,"7+6·0,1−3·0,1."),f("Jg Zeilen",2,"Zwei Ausgaben."),f("Jg Spalten",1,"Ein Parameter."),f("(f∘g)′(1)",18,"[6,3]·(1,4)."),f("D normiert",6,"(6·3+3·4)/5.")],
    ["Skalarfeld auf ℝ², glatt. f(P)=7, Gradient (6,3). T=7+6(x−1)+3(y−2), Näherung 7,3.","Jg(1)=(1,4)ᵀ ist 2×1, Jf(g(1))=[6,3] ist 1×2; Produkt 18. Normierte Richtung (3/5,4/5), D=6."],{chapter:3,source:source("1–3",1,17)}),
  t("Abschluss 2: u=x+y, L=u²+xy² bei (1,1). Zeichne den verzweigten Graphen und bestimme u,L,ū,x̄,ȳ. Separat q=x²+3y²: klassifiziere den Ursprung und rechne von (1,1) mit η=1/6 zwei GD-Schritte. Begründe die Lernrate auf Papier.",
    [f("u",2,"Summe."),f("L",5,"u²+xy²."),f("ū",4,"2u."),f("x̄",5,"ū+y²."),f("ȳ",6,"ū+2xy."),f("det Hq",12,"H=diag(2,6)."),f("x₁",2/3,"1−(1/6)·2."),f("y₁",0,"1−(1/6)·6."),f("x₂",4/9,"Neuer Gradient."),f("y₂",0,"Null bleibt null."),f("Offene η-Obergrenze",1/3,"2/λmax.")],
    ["u=2,L=5,ū=4; x̄=4+1=5,ȳ=4+2=6. Beide Pfade müssen addiert werden.","∇q(0)=0, H=diag(2,6) positiv definit: Minimum. 0<η<1/3 gilt für diese Quadratik; η=1/6 ist zulässig. Schritte (2/3,0),(4/9,0)."],{chapter:5,source:source("4–5, 7",18,47)}),
  t("Abschluss 3: Regression mit Bias für (−1,2),(0,2),(1,5). Berechne Normalengleichung und β. Unabhängige PCA-Daten: (1,0),(3,0),(2,3). Zentriere sie, berechne Σ, Eigenwerte, normierte Hauptachse und erklärte Varianz. Projiziere den ersten Punkt. Leite die Varianzmaximierung unter Normbedingung per Lagrange auf Papier her.",
    [f("XtX11",3,"Drei Einsen."),f("XtX12",0,"Summe x."),f("XtX22",2,"Summe x²."),f("Xty1",9,"Summe y."),f("Xty2",3,"Summe xy."),f("β₀",3,"9/3."),f("β₁",1.5,"3/2."),f("μx",2,"Mittelwert."),f("μy",1,"Mittelwert."),f("Σ11",2/3,"Zentrierte x-Quadrate /3."),f("Σ12",0,"Zentrierte Kreuzprodukte."),f("Σ22",2,"Zentrierte y-Quadrate /3."),f("λ₁",2,"Größter Diagonaleintrag."),f("λ₂",2/3,"Kleinerer Eintrag."),f("v₁",0,"Vertikale Hauptachse.","Norm",{signGroup:"axis"}),f("v₂",1,"Norm 1.","Norm",{signGroup:"axis"}),f("Anteil",0.75,"2/(2+2/3)."),f("z₁",-1,"Zentrierter Punkt (−1,−1) mal v.","Projektion",{signGroup:"axis"})],
    ["Regression: X=[[1,−1],[1,0],[1,1]], XtX=diag(3,2), Xty=(9,3), β=(3,3/2).", "PCA: μ=(2,1), X̃=[(−1,−1),(1,−1),(0,2)], Σ=diag(2/3,2). λ=(2,2/3), v=±(0,1), Anteil 3/4, z₁=∓1.","L=vᵀΣv−λ(vᵀv−1) ⇒ Σv=λv. Größte λ maximiert die Varianz auf der Einheitskugel."],{chapter:9,source:source("6, 9",32,58)}),
  t("Abschluss 4: Dreieck D mit Ecken (0,0),(2,0),(0,1). Beschreibe beide Integrationsreihenfolgen und integriere x. Eine konstante Dichte c auf D ist zu normieren; bestimme E[X], E[Y] und P(X≤1). Separat integriere x²+y² über die Kreisscheibe mit Radius 2 in Polarkoordinaten.",
    [f("Obere Grenze y=a+bx: a",1,"Achsenabschnitt."),f("Obere Grenze y=a+bx: b",-0.5,"Steigung."),f("Obere Grenze x=c+dy: c",2,"Nach x auflösen."),f("Obere Grenze x=c+dy: d",-2,"Nach x auflösen."),f("Fläche",1,"Halbes Rechteck."),f("Integral x",2/3,"∫₀²x(1−x/2)dx."),f("Dichte c",1,"1/Fläche."),f("E[X]",2/3,"Moment mal c."),f("E[Y]",1/3,"∫₀¹y(2−2y)dy."),f("P(X≤1)",0.75,"∫₀¹(1−x/2)dx."),f("Polar Potenz r",3,"r² mal r."),f("Kreisintegral / π",8,"2∫₀²r³dr.")],
    ["Vertikal: 0≤x≤2,0≤y≤1−x/2. Horizontal: 0≤y≤1,0≤x≤2−2y. Fläche 1, Integral x=2/3.","Dichte c=1; E[X]=2/3,E[Y]=1/3; P(X≤1)=3/4. Polar: 2π∫₀²r³dr=8π."],{chapter:8,source:source(8,48,53)}),
].map((task,index)=>({...task,id:`abschluss-${index+1}`,family:`abschluss-${index+1}`,stage:"Zusammenhängender Abschluss",own:true,independent:true,prerequisites:["Kerneinheiten dieses Trainers"]}));

export const allTasks = [...units.flatMap(item => item.tasks),...capstones];
export const coreUnits = units.filter(item => !item.supplementary);
