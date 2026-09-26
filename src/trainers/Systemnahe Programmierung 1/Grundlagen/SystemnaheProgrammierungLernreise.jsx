import React from "react";
import CourseTrainer from "../../../components/CourseTrainer.jsx";

const units = [
  {
    shortTitle: "Embedded & Arduino",
    title: "Eingebettete Systeme und Zielhardware",
    lead: "Ein eingebettetes System verarbeitet Informationen als Teil eines größeren technischen Produkts. Seine Hardware wird für eine konkrete Aufgabe, begrenzte Energie und direkte Ein-/Ausgabe ausgelegt.",
    sections: [
      {
        title: "Mikroprozessor oder Mikrocontroller?",
        body: "Ein Mikroprozessor ist vor allem die zentrale Recheneinheit und benötigt externe Komponenten. Ein Mikrocontroller integriert Prozessor, Speicher und Peripherie auf einem Baustein. Das macht ihn für kompakte, energiearme Steuerungsaufgaben geeignet.",
      },
      {
        title: "ATmega328P auf dem Arduino Uno",
        body: "Der Arduino Uno Rev3 ist ein Mikrocontroller-Board mit ATmega328P. Das Board ergänzt Spannungsversorgung, USB-Anbindung, Takt, LEDs und zugängliche Pins. Der Mikrocontroller verarbeitet das Programm; das Board erleichtert Entwicklung und Anschluss.",
        points: ["14 digitale Ein-/Ausgänge D0–D13", "6 analoge Eingänge D14–D19 mit 10-Bit-Auflösung", "Flash für Programmcode, SRAM für Laufzeitdaten, EEPROM für persistente Daten"],
      },
      {
        title: "Hardware lesen, bevor man programmiert",
        body: "Pinbelegung, Schaltbild und Datenblatt beantworten unterschiedliche Fragen: Der Pinout zeigt verfügbare Kontakte und Zusatzfunktionen, das Schaltbild die Verdrahtung des Boards, das Datenblatt die Eigenschaften und Register des Mikrocontrollers.",
      },
    ],
    example: "Ein batteriebetriebener Temperaturregler liest einen Sensor, vergleicht den Wert und schaltet einen Ausgang. Ein Mikrocontroller genügt: geringe Leistungsaufnahme, integrierte I/Os und Speicher; ein leistungsstarker Desktop-Prozessor wäre unnötig.",
    source: "Einführung, S. 2–25, besonders S. 4–10 und 12–23.",
    quiz: {
      question: "Warum passt ein Mikrocontroller gut zu einem einfachen batteriebetriebenen Sensorgerät?",
      choices: ["Weil er immer ein Desktop-Betriebssystem ausführt", "Weil CPU, Speicher und Peripherie kompakt integriert sind", "Weil er keine Ein-/Ausgänge besitzt", "Weil er nur mit externem Hauptspeicher arbeitet"],
      answer: 1,
      explanation: "Die hohe Integration senkt Platz-, Energie- und Zusatzhardwarebedarf. Genau das ist bei eingebetteten Steuerungen meist wichtiger als maximale Rechenleistung.",
    },
    diagnostic: {
      question: "Welche Komponente unterscheidet den Mikrocontroller besonders vom reinen Mikroprozessor?",
      choices: ["Integrierte Speicher- und Peripherieblöcke", "Ein Bildschirm als Pflichtbestandteil", "Eine Internetverbindung"],
      answer: 0,
      feedback: "Vergleiche nicht nur Taktraten. Entscheidend ist, welche Systembestandteile bereits auf demselben Chip integriert sind.",
      firstStep: "Liste auf, was ein vollständiges Steuergerät braucht: Rechnen, Speichern und Ein-/Ausgabe. Beim Mikrocontroller steckt davon viel im selben Baustein.",
    },
    cheat: { title: "Speicher im Mikrocontroller", when: "Wenn Programm, flüchtige Werte und dauerhafte Einstellungen zugeordnet werden.", steps: "Programmcode → Flash. Laufzeitdaten → SRAM. Daten ohne Versorgung behalten → EEPROM.", example: "Kalibrierwert nach Neustart behalten → EEPROM." },
    guided: {
      title: "Speicher auswählen",
      prompt: "Ein Kalibrierwert soll nach dem Ausschalten erhalten bleiben und gelegentlich geändert werden. Welcher Speicher passt?",
      choices: ["SRAM", "EEPROM", "ALU", "CPU-Takt"],
      answer: 1,
      hint: "Gesucht ist ein nichtflüchtiger Datenspeicher, nicht der Programmspeicher.",
      explanation: "EEPROM behält Daten ohne Versorgung und eignet sich für veränderliche, persistente Einstellungen.",
    },
    transfer: {
      title: "Neue Situation",
      prompt: "Während einer Messung werden die letzten zehn Sensorwerte nur bis zum nächsten Neustart benötigt. Wo gehören sie hin?",
      choices: ["SRAM", "EEPROM", "Flash für Programmcode", "USB-Buchse"],
      answer: 0,
      explanation: "Flüchtige Laufzeitdaten gehören ins SRAM; Persistenz ist hier ausdrücklich nicht erforderlich.",
    },
    reflection: "Entwirf in Worten ein eingebettetes System aus deinem Alltag. Begründe Zielhardware, zwei benötigte Ein-/Ausgänge und die Wahl für Flash, SRAM oder EEPROM.",
  },
  {
    shortTitle: "Architektur & ISA",
    title: "Wie der Prozessor Programme ausführt",
    lead: "Das Programmiermodell beschreibt die für Programmierende sichtbare Maschine: Datenformate, Register, Befehlssatz, Befehlsformate und Adressierungsarten. Interne Transistordetails bleiben ausgeblendet.",
    sections: [
      {
        title: "Von Neumann und Harvard",
        body: "Von-Neumann-Systeme legen Befehle und Daten im selben Speicher ab und nutzen denselben Übertragungsweg; der gemeinsame Bus kann zum Engpass werden. Harvard-Systeme trennen Programm- und Datenspeicher samt Bussen. Der ATmega328P nutzt Flash für Code und SRAM für Daten und kann Zugriffe überlappen.",
      },
      {
        title: "Fetch – Decode – Execute – Write",
        body: "Fetch lädt den nächsten Befehl und erhöht den Befehlszähler. Decode zerlegt ihn in Steuerinformationen. Execute führt die arithmetische oder logische Operation aus. Write schreibt das Ergebnis in Register oder Speicher zurück. Die AVR-Architektur überlappt Fetch und Execute in einer zweistufigen Pipeline.",
      },
      {
        title: "Befehlssatz und Daten",
        body: "Ein Maschinenbefehl besteht aus Opcode und gegebenenfalls Operanden beziehungsweise Adressfeldern. Der 8-Bit-ATmega besitzt 32 Universalregister an der ALU. Sein RISC-Befehlssatz setzt auf vergleichsweise einfache Befehle und viele Register; komplexere Aufgaben benötigen dadurch oft mehrere Befehle.",
      },
    ],
    example: "LDI r0, 5 lädt den unmittelbaren Wert 5. LDI r1, 3 lädt 3. ADD r0, r1 liest beide Register, addiert in der ALU und schreibt 8 nach r0. MOV r3, r0 kopiert anschließend das Ergebnis nach r3.",
    source: "Programmiermodell, S. 3–32, besonders S. 9–21 und 28–32.",
    quiz: {
      question: "Welcher Vorteil folgt direkt aus getrennten Programm- und Datenbussen der Harvard-Architektur?",
      choices: ["Code und Daten können parallel geholt werden", "Es werden keine Register mehr benötigt", "Jeder Befehl wird automatisch objektorientiert", "Ein Betriebssystem ist zwingend vorhanden"],
      answer: 0,
      explanation: "Getrennte Speicher und Busse ermöglichen gleichzeitige Zugriffe. Dadurch wird der gemeinsame Von-Neumann-Übertragungsweg als Engpass vermieden.",
    },
    diagnostic: {
      question: "Was verursacht den klassischen Von-Neumann-Flaschenhals?",
      choices: ["Der gemeinsame Weg für Befehle und Daten", "Zu viele getrennte Busse", "Die Existenz von EEPROM"],
      answer: 0,
      feedback: "Betrachte den Datenweg, nicht die Programmiersprache: Befehle und Daten konkurrieren um denselben Bus.",
      firstStep: "Zeichne CPU, einen gemeinsamen Speicher und genau einen Bus. Frage dann, ob Befehl und Datum gleichzeitig über diesen einen Weg passen.",
    },
    cheat: { title: "Befehlszyklus", when: "Wenn die Ausführung einer Maschinenanweisung erklärt wird.", steps: "Fetch → Decode → Execute → Write. Dazu jeweils Ort und Wirkung nennen.", example: "ADD: holen, als Addition decodieren, ALU addiert, Ergebnis zurückschreiben." },
    guided: {
      title: "Registerlauf verfolgen",
      prompt: "r0 = 5 und r1 = 3. Nach ADD r0, r1 und anschließend MOV r3, r0: Welcher Wert steht in r3?",
      choices: ["2", "3", "5", "8"],
      answer: 3,
      hint: "ADD schreibt das Ergebnis in den zuerst genannten Zieloperanden; MOV kopiert danach diesen Wert.",
      explanation: "ADD setzt r0 auf 8; MOV kopiert die 8 aus r0 nach r3.",
    },
    transfer: {
      title: "Neue Befehlsfolge",
      prompt: "r2 = 4 und r4 = 6. ADD r2, r4; MOV r5, r2. Was steht anschließend in r5?",
      choices: ["2", "4", "6", "10"],
      answer: 3,
      explanation: "Der Zieloperand r2 erhält 4 + 6 = 10; MOV kopiert 10 nach r5.",
    },
    reflection: "Leite für den Befehl ADD r2, r4 jeden Schritt des Fetch-Decode-Execute-Write-Zyklus her und benenne die beteiligten Komponenten.",
  },
  {
    shortTitle: "Sprachen & Übersetzung",
    title: "Von Maschinencode zu C und zurück",
    lead: "Programmiersprachen unterscheiden sich im Abstraktionsniveau. Prozessoren führen Maschinencode aus; Assemblersprache macht einzelne Maschinenbefehle lesbarer; Hochsprachen drücken größere Zusammenhänge aus und benötigen Übersetzung.",
    sections: [
      {
        title: "Maschine, Assembler, Hochsprache",
        body: "Maschinencode ist hardwareabhängig und direkt ausführbar. Assembler ersetzt Bitmuster durch Mnemonics und wird im Wesentlichen 1:1 übersetzt. Hochsprachen sind abstrakter, produktiver und häufig portabler, müssen aber in eine zur Zielplattform passende Form übertragen werden.",
      },
      {
        title: "Compiler und Interpreter",
        body: "Ein Compiler übersetzt das gesamte Programm vor der Ausführung; das Ergebnis kann anschließend wiederholt gestartet werden. Ein Interpreter übersetzt und führt schrittweise aus. Das erleichtert schnelles Testen, verursacht aber Laufzeitaufwand – in Schleifen wiederholt.",
      },
      {
        title: "Paradigmen und die Rolle von C",
        body: "Imperativ-prozedurale Programme bestehen aus veränderlichem Zustand und Prozeduren; objektorientierte Programme strukturieren Zustand und Verhalten in Klassen und Objekten. C bleibt systemnah, weil Registerzugriffe sowie Bit-, Shift- und Inkrementoperationen präzise formulierbar sind, bietet aber mehr Abstraktion als Assembler.",
      },
    ],
    example: "Für eine zeitkritische Mikrocontroller-Regelung wird C vorab für den ATmega kompiliert. Die CPU führt den erzeugten Maschinencode ohne laufende Quelltextübersetzung aus. Derselbe Binärcode läuft nicht automatisch auf einer anderen Prozessorfamilie, weil Befehlssatz und Zielplattform abweichen.",
    source: "Programmiersprachen, S. 2–20, besonders S. 3–8 und 11–20.",
    quiz: {
      question: "Welche Übersetzungsstrategie ist für eine wiederholt ausgeführte, zeitkritische Schleife typischerweise günstiger?",
      choices: ["Vorab kompilieren", "Jede Zeile in jedem Schleifendurchlauf neu interpretieren", "Den Quelltext direkt ohne Übersetzung an die CPU senden", "Nur Variablennamen ändern"],
      answer: 0,
      explanation: "Beim kompilierten Programm fällt die Übersetzung nicht in jedem Schleifendurchlauf an. Für harte Echtzeitanforderungen reicht das allein noch nicht als Garantie, vermeidet aber den beschriebenen Interpreter-Overhead.",
    },
    diagnostic: {
      question: "Wann entsteht beim Interpreter der zusätzliche Übersetzungsaufwand?",
      choices: ["Während der Programmausführung", "Nur beim Entwurf der Hardware", "Er entfällt immer vollständig"],
      answer: 0,
      feedback: "Trenne Übersetzungszeitpunkt und Ausführungszeitpunkt: Beim Interpreter liegen beide eng zusammen.",
      firstStep: "Frage, ob schon vor dem Start ein vollständiges Zielprogramm erzeugt wurde. Wenn nicht, muss während der Ausführung übersetzt werden.",
    },
    cheat: { title: "Compiler vs. Interpreter", when: "Wenn Übersetzungszeit, Laufzeit und Wiederverwendung verglichen werden.", steps: "Compiler: ganzes Programm vorab → ausführbares Ergebnis. Interpreter: schrittweise während der Ausführung.", example: "Schleife 1.000×: Interpreter kann dieselbe Zeile wiederholt übersetzen." },
    guided: {
      title: "Werkzeug auswählen",
      prompt: "Ein Programm soll nach einmaliger Übersetzung auf demselben Zielgerät oft ohne erneuten Übersetzungslauf starten. Was passt?",
      choices: ["Compiler", "Nur ein Texteditor", "Pinout", "Oszilloskop"],
      answer: 0,
      hint: "Gesucht ist ein dauerhaft nutzbares Übersetzungsergebnis.",
      explanation: "Der Compiler erzeugt vorab ein Zielprogramm, das anschließend wiederholt ausgeführt werden kann.",
    },
    transfer: {
      title: "Neue Begründung",
      prompt: "Warum läuft ein für x86-Windows erzeugtes Programm nicht automatisch direkt auf einem ATmega328P?",
      choices: ["Der Zielprozessor hat einen anderen Befehlssatz und eine andere Plattform", "C darf nie kompiliert werden", "Der ATmega kennt keine Bits", "Windows-Dateien besitzen keine Daten"],
      answer: 0,
      explanation: "Kompilierter Maschinencode ist auf Zielarchitektur und Plattform ausgerichtet; der ATmega versteht andere Maschinenbefehle.",
    },
    reflection: "Leite eine Übersetzungskette für ein kleines C-Programm auf dem Arduino her: vom Quelltext bis zu den ausgeführten Maschinenbefehlen. Nenne dabei mindestens drei Abstraktionsebenen.",
  },
];

export default function SystemnaheProgrammierungLernreise() {
  return <CourseTrainer course="Systemnahe Programmierung 1" title="Hardware nah denken" subtitle="Von eingebetteten Systemen über Rechnerarchitekturen bis zu Maschinencode, Assembler und C." units={units} />;
}
