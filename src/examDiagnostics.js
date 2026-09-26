export const examDiagnostics = {
  mathe: {
    title: "Mathematik 3 · Kalter Einstiegstest",
    course: "Angewandte Mathematik",
    source: "Aktuelles Skript und Übung 1 zur mehrdimensionalen Differentialrechnung",
    variants: [
      [
        ["Was ist ∂/∂x von f(x,y) = x²y + 3y?", ["2xy", "x² + 3", "2x + 3y"], 0],
        ["In welche Richtung zeigt der Gradient?", ["In Richtung des stärksten Anstiegs", "Immer zur x-Achse", "Entlang einer Niveaulinie"], 0],
        ["Wann dürfen gemischte zweite Ableitungen nach Schwarz vertauscht werden?", ["Bei hinreichender Stetigkeit", "Nur bei linearen Funktionen", "Nie"], 0],
        ["Welche Information liefert das totale Differential?", ["Eine lokale lineare Änderung", "Den exakten globalen Funktionswert", "Nur Nullstellen"], 0],
        ["Was kennzeichnet einen stationären Punkt?", ["Der Gradient ist null", "Die Funktion ist überall null", "Die Hesse-Matrix fehlt"], 0],
      ],
      [
        ["Für f(x,y)=xy gilt ∂f/∂y = …", ["x", "y", "x+y"], 0],
        ["Wozu dient die Hesse-Matrix?", ["Zur Klassifikation lokaler stationärer Punkte", "Zur Bestimmung des Definitionsbereichs", "Nur zum Zeichnen von Geraden"], 0],
        ["Eine Richtungsableitung verwendet typischerweise …", ["Gradient mal Einheitsrichtung", "Nur den Funktionswert", "Eine Determinante ohne Richtung"], 0],
        ["Wofür wird die Lagrange-Methode eingesetzt?", ["Extrema mit Nebenbedingungen", "Nur Integrale", "Lineare Gleichungen ohne Nebenbedingung"], 0],
        ["Die Tangentialebene ist …", ["eine lokale lineare Approximation", "immer eine Niveaumenge", "eine globale exakte Darstellung"], 0],
      ],
    ],
  },
  netz: {
    title: "Netztechnik · Kalter Einstiegstest",
    course: "Kommunikations- und Netztechnik",
    source: "Aktuelle Foliensätze 01–03 zu Infrastruktur, OSI und Internet",
    variants: [
      [
        ["Welche Architektur bündelt Rechte und Datensicherung zentral?", ["Client/Server", "Peer-to-Peer ohne Server", "Token Ring"], 0],
        ["Auf welcher OSI-Schicht liegt Routing?", ["Layer 3", "Layer 1", "Layer 7"], 0],
        ["Welche Adresse gilt lokal auf der Sicherungsschicht?", ["MAC-Adresse", "TCP-Port", "URL"], 0],
        ["Was berechnet L/R?", ["Übertragungsverzögerung", "Ausbreitungsverzögerung", "Paketverlust"], 0],
        ["Was begrenzt den Ende-zu-Ende-Durchsatz?", ["Der Engpass", "Immer die schnellste Leitung", "Nur die Paketlänge"], 0],
      ],
      [
        ["Welche Schicht unterscheidet Anwendungen durch Ports?", ["Transport", "Bitübertragung", "Vermittlung"], 0],
        ["Was beschreibt WAN am besten?", ["Verbindung über große geografische Bereiche", "Ein einzelnes Kabel", "Nur ein Prozess im Rechner"], 0],
        ["Was passiert bei Kapselung?", ["Schichten ergänzen Steuerinformationen", "Alle Header verschwinden beim Sender", "Nur MAC-Adressen werden entfernt"], 0],
        ["Eine 16-Mbit-Datei über 4 Mbit/s benötigt näherungsweise …", ["4 s", "2 s", "64 s"], 0],
        ["Welche Verzögerung entsteht vor einer ausgelasteten Leitung?", ["Warteschlangenverzögerung", "Nur Ausbreitung", "Keine"], 0],
      ],
    ],
  },
  systemnah: {
    title: "Systemnahe Programmierung · Kalter Einstiegstest",
    course: "Systemnahe Programmierung 1",
    source: "Aktuelle Foliensätze 01–03 zu Embedded, Programmiermodell und Sprachen",
    variants: [
      [
        ["Was integriert ein Mikrocontroller typischerweise?", ["CPU, Speicher und Peripherie", "Nur einen Bildschirm", "Nur externen Hauptspeicher"], 0],
        ["Wo liegen flüchtige Laufzeitdaten beim ATmega328P?", ["SRAM", "EEPROM", "Flash"], 0],
        ["Was trennt die Harvard-Architektur?", ["Programm- und Datenspeicher", "Quellcode und Kommentare", "Tastatur und Bildschirm"], 0],
        ["Welche Phase interpretiert einen geladenen Maschinenbefehl?", ["Decode", "Fetch", "Write"], 0],
        ["Was erzeugt ein Compiler?", ["Zielcode vor der Ausführung", "Nur Eingabedaten", "Immer eine Netzwerkverbindung"], 0],
      ],
      [
        ["Welcher Speicher behält veränderliche Werte ohne Versorgung?", ["EEPROM", "SRAM", "Register"], 0],
        ["Was enthält ein Maschinenbefehl mindestens?", ["Opcode", "URL", "Dateiendung"], 0],
        ["Wofür steht die ALU?", ["Arithmetisch-logische Einheit", "Externer Programmspeicher", "Netzwerkschnittstelle"], 0],
        ["Welche Sprache liegt näher an Maschinenbefehlen?", ["Assembler", "HTML", "CSS"], 0],
        ["Warum eignet sich C für systemnahe Programmierung?", ["Hardwarezugriff bei höherer Abstraktion", "Es benötigt keine Übersetzung", "Es kennt keine Datentypen"], 0],
      ],
    ],
  },
  fsa: {
    title: "Formale Sprachen · Kalter Einstiegstest",
    course: "Formale Sprachen & Automaten",
    source: "Aktuelle Übungsunterlagen zu regulären und kontextfreien Sprachen",
    variants: [
      [
        ["Welche Länge hat das leere Wort ε?", ["0", "1", "Unendlich"], 0],
        ["Wann akzeptiert ein DEA ein Wort?", ["Nach dem ganzen Wort im Endzustand", "Beim ersten Besuch eines Endzustands", "Immer nach einem Übergang"], 0],
        ["Was unterscheidet einen NEA vom DEA?", ["Mehrere mögliche Übergänge", "Keine Zustände", "Keine Sprache"], 0],
        ["Wofür wird der CYK-Algorithmus verwendet?", ["Wortproblem für kontextfreie Grammatiken in CNF", "Sortieren von Zahlen", "IP-Routing"], 0],
        ["Was beschreibt eine Grammatik?", ["Erzeugungsregeln für Wörter", "Nur einen einzelnen Zustand", "Eine Netzwerkadresse"], 0],
      ],
      [
        ["Was ist eine Sprache über Σ?", ["Eine Menge von Wörtern über Σ", "Nur das Alphabet selbst", "Ein einzelner Buchstabe"], 0],
        ["Was erzeugt ein regulärer Ausdruck?", ["Eine reguläre Sprache", "Nur einen Zahlenwert", "Eine Hardwareadresse"], 0],
        ["Wozu dient die Determinisierung?", ["Einen äquivalenten DEA aus einem NEA gewinnen", "Eine Grammatik löschen", "Eine Matrix invertieren"], 0],
        ["Welche Normalform benötigt der klassische CYK-Algorithmus?", ["Chomsky-Normalform", "Dezimalform", "Jordan-Normalform"], 0],
        ["Was kann ein Kellerautomat zusätzlich speichern?", ["Einen Stack", "Eine IP-Adresse", "Nur den Startzustand"], 0],
      ],
    ],
  },
};
