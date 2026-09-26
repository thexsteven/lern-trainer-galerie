import React from "react";
import CourseTrainer from "../../../components/CourseTrainer.jsx";

const units = [
  {
    shortTitle: "Infrastruktur",
    title: "Vom Mainframe zum vernetzten Arbeitsplatz",
    lead: "Netze entstehen nicht nur aus Kabeln. Sie verbinden Endgeräte, Dienste und Organisationsformen so, dass gemeinsame Ressourcen für den Benutzer transparent nutzbar werden.",
    sections: [
      {
        title: "Historische Abhängigkeit",
        body: "Beim Mainframe lagen Rechenleistung und Daten zentral; Terminals dienten nur Ein- und Ausgabe. Der PC brachte Rechenleistung auf den Schreibtisch. Vernetzung machte anschließend zentrale Dienste wie Rechteverwaltung, Dateiablage und Datensicherung wieder gemeinsam nutzbar.",
      },
      {
        title: "Client/Server, Peer-to-Peer und Heterogenität",
        body: "Ein Server bündelt Dienste und Administration. Im Peer-to-Peer-Netz kann jeder Rechner Client und Server sein, wodurch Rechte, Freigaben und Sicherungen dezentral gepflegt werden müssen. Heterogen ist ein Netz, wenn auf Betriebssystem-, Protokoll- oder physikalischer Ebene unterschiedliche Elemente zusammenspielen.",
        points: ["Betriebssystemebene: etwa Windows, macOS und Linux", "Protokollebene: etwa TCP/IP und historische IPX-Netze", "Physikalische Ebene: etwa Ethernet, Funk oder frühere Token-Ring-Segmente"],
      },
      {
        title: "LAN und WAN",
        body: "Ein LAN deckt einen lokalen Bereich ab; ein WAN verbindet große geografische Bereiche. Historisch reichte die Entwicklung von festen Frame-Relay-Verbindungen über ISDN und ADSL/VDSL bis zu VPNs über das Internet. Die konkrete Technik ändert sich, die Aufgabe bleibt: entfernte Netze zuverlässig verbinden.",
      },
    ],
    example: "Eine Firma mit acht Arbeitsplätzen möchte Benutzerrechte, Projektdateien und Backups zentral verwalten. Ein Server übernimmt Authentifizierung, Dateiablage und Sicherung; die PCs sind Clients. Zwei Betriebssysteme und WLAN plus Ethernet machen das Gesamtnetz zugleich heterogen.",
    source: "Entwicklung der IT-Infrastruktur, S. 2–4, 29–30, 45 und 51–63.",
    quiz: {
      question: "Welche Architektur passt am besten zu zentralen Benutzerrechten und zentraler Datensicherung?",
      choices: ["Reines Peer-to-Peer-Netz", "Client/Server-Netz", "Nur eine Punkt-zu-Punkt-Verbindung", "Ein Netz ohne gemeinsame Dienste"],
      answer: 1,
      explanation: "Beim Client/Server-Prinzip werden Dienste und Administration gezielt auf Servern gebündelt. Peer-to-Peer verteilt diese Aufgaben auf die einzelnen Rechner.",
    },
    diagnostic: {
      question: "Wo müssten Benutzerrechte in einem reinen Peer-to-Peer-Netz typischerweise gepflegt werden?",
      choices: ["An jedem freigebenden Rechner", "Nur beim Internetprovider", "Nur am Netzwerkkabel"],
      answer: 0,
      feedback: "Trenne Dienst und Transport: Benutzerrechte gehören zur Verwaltung der freigegebenen Ressource, nicht zum Kabel oder Provider.",
      firstStep: "Frage zuerst: Welcher Rechner besitzt die freigegebene Datei? Ohne zentralen Server muss genau dieser Rechner den Zugriff regeln.",
    },
    cheat: { title: "Client/Server vs. Peer-to-Peer", when: "Wenn Organisation und Administration eines Netzes verglichen werden.", steps: "1. Ort des Dienstes bestimmen. 2. Ort der Rechteverwaltung bestimmen. 3. Backup-Verantwortung prüfen.", example: "Zentrale Dateiablage + zentrale Rechte = Client/Server." },
    guided: {
      title: "Netzform begründen",
      prompt: "Vier Rechner tauschen gelegentlich Dateien aus. Es gibt kein zentrales Konto und jede Freigabe wird lokal eingerichtet. Welche Einordnung folgt?",
      choices: ["Peer-to-Peer", "Mainframe mit Terminals", "Leitungsvermittlung", "WAN-Provider"],
      answer: 0,
      hint: "Suche nach einem Rechner, der dauerhaft zentrale Dienste bereitstellt.",
      explanation: "Ohne zentralen Server übernehmen die Teilnehmer wechselnd Client- und Serverrollen: Peer-to-Peer.",
    },
    transfer: {
      title: "Neue Situation",
      prompt: "Ein Standort in Berlin greift per verschlüsseltem Tunnel über das Internet auf das Firmennetz in Mosbach zu. Welche Begriffe beschreiben die Verbindung am treffendsten?",
      choices: ["LAN über Token Ring", "WAN-Verbindung mittels VPN", "Peer-to-Peer ohne Netz", "Nur eine lokale Busverbindung"],
      answer: 1,
      explanation: "Die Standorte liegen geografisch auseinander, also WAN; der geschützte Tunnel über das Internet ist ein VPN.",
    },
    reflection: "Leite für einen kleinen Betrieb mit fünf PCs selbst her, wann Peer-to-Peer noch vertretbar wäre und ab welchem organisatorischen Problem du einen Server empfehlen würdest.",
  },
  {
    shortTitle: "OSI & TCP/IP",
    title: "Kommunikation in Schichten denken",
    lead: "Schichten trennen Aufgaben. Eine Schicht nutzt die Dienste der darunterliegenden Schicht und bietet der darüberliegenden einen definierten Dienst an. Dadurch lassen sich Teile weiterentwickeln, ohne die gesamte Kommunikation neu zu bauen.",
    sections: [
      {
        title: "Die sieben OSI-Schichten",
        body: "Von unten nach oben: 1 Bitübertragung (Medium und Signale), 2 Sicherung (MAC, Medienzugriff, erste Fehlererkennung), 3 Vermittlung (logische Adressen und Routing), 4 Transport (Ende-zu-Ende-Transport, Ports, TCP/UDP), 5 Sitzung, 6 Darstellung (Formate, Kodierung, Kompression, Verschlüsselung) und 7 Anwendung (Netzdienste für Programme).",
      },
      {
        title: "TCP/IP als praktisches Modell",
        body: "Das TCP/IP-Modell fasst die OSI-Schichten 5 bis 7 in der Anwendungsschicht zusammen. Darunter liegen Transport, Internet und Netzzugang. HTTP oder SMTP gehören zur Anwendung, TCP/UDP zum Transport, IP zur Internetschicht; Ethernet oder WLAN decken die unteren Aufgaben ab.",
      },
      {
        title: "Kapselung",
        body: "Beim Senden ergänzt jede Schicht ihre Steuerinformationen. Die Anwendung liefert Daten, der Transport ergänzt etwa Ports, IP ergänzt logische Adressen und die Sicherung ergänzt den lokalen Rahmen. Beim Empfänger werden die Informationen in umgekehrter Reihenfolge entfernt.",
      },
    ],
    example: "Beim Aufruf einer HTTPS-Seite erzeugt der Browser Anwendungsdaten. TCP ordnet sie einer Verbindung über Ports zu, IP routet Pakete über Netze, Ethernet oder WLAN transportiert Rahmen zum nächsten Knoten und die physikalische Schicht überträgt Bits als elektrische, optische oder Funksignale.",
    source: "Das OSI-Modell, S. 2–18; TCP/IP-Kommunikationsmodell, S. 19–33.",
    quiz: {
      question: "Auf welcher OSI-Schicht werden IP-Adressen ausgewertet und Routing-Entscheidungen getroffen?",
      choices: ["Layer 1 – Physical", "Layer 2 – Data Link", "Layer 3 – Network", "Layer 6 – Presentation"],
      answer: 2,
      explanation: "Layer 3, die Vermittlungs- oder Network-Schicht, übernimmt logische Adressierung und Routing. MAC-Adressen gehören dagegen zu Layer 2.",
    },
    diagnostic: {
      question: "Welche Adresse dient der lokalen, physikalischen Adressierung auf der Sicherungsschicht?",
      choices: ["MAC-Adresse", "TCP-Port", "URL"],
      answer: 0,
      feedback: "Ordne erst die Reichweite zu: MAC gilt lokal im Segment, IP ermöglicht segmentübergreifende Vermittlung.",
      firstStep: "Beginne unten: Layer 1 überträgt Signale. Die direkt darüberliegende Sicherungsschicht braucht eine lokale Adresse – das ist die MAC-Adresse.",
    },
    cheat: { title: "Adresse nach Reichweite", when: "Wenn MAC, IP und Port verwechselt werden.", steps: "Lokal zum nächsten Knoten: MAC (L2). Über Netze zum Zielhost: IP (L3). Zur Anwendung im Host: Port (L4).", example: "Webserver: Ziel-IP findet den Rechner, Port 443 den HTTPS-Dienst." },
    guided: {
      title: "Schicht bestimmen",
      prompt: "Ein Switch entscheidet anhand der Ziel-MAC-Adresse, an welchen lokalen Port ein Rahmen geht. Welche Schicht ist zentral?",
      choices: ["OSI 2", "OSI 3", "OSI 4", "OSI 7"],
      answer: 0,
      hint: "MAC-Adresse und Rahmen gehören zusammen.",
      explanation: "Switching anhand von MAC-Adressen ist eine Aufgabe der Sicherungsschicht (Layer 2).",
    },
    transfer: {
      title: "Neue Situation",
      prompt: "Ein Server lauscht gleichzeitig auf Port 25 für SMTP und Port 443 für HTTPS. Welche Schicht unterscheidet diese Anwendungen durch Ports?",
      choices: ["Bitübertragung", "Sicherung", "Vermittlung", "Transport"],
      answer: 3,
      explanation: "TCP- und UDP-Ports gehören zur Transportschicht und ordnen Datenströme den Anwendungen zu.",
    },
    reflection: "Erkläre den Weg einer Chatnachricht vom Textfeld bis zum Funksignal und nenne für mindestens vier Schichten die jeweils ergänzte Information oder Aufgabe.",
  },
  {
    shortTitle: "Internet & Leistung",
    title: "Paketvermittlung, Verzögerung und Durchsatz",
    lead: "Das Internet ist ein Netz aus Netzen. Endsysteme senden Pakete über Zugangsnetze und Router. Entscheidend ist nicht nur, ob ein Paket ankommt, sondern auch wie Übertragungsrate, Weg und Auslastung die Laufzeit beeinflussen.",
    sections: [
      {
        title: "Store-and-forward",
        body: "Ein Router empfängt bei Store-and-forward zunächst das vollständige Paket und sendet es dann über die nächste Leitung. Die reine Übertragungsverzögerung beträgt L/R: Paketlänge L in Bit geteilt durch Rate R in Bit/s.",
      },
      {
        title: "Vier Verzögerungsarten",
        body: "Verarbeitung prüft Header und Fehler. Warteschlange entsteht vor einer belegten Leitung. Übertragung legt alle Bits auf die Leitung (L/R). Ausbreitung bewegt ein Bit durch das Medium (d/s). Die Verzögerungen aller Knoten addieren sich; volle Puffer führen zu Paketverlust.",
      },
      {
        title: "Durchsatz und Engpass",
        body: "Der durchschnittliche Durchsatz ist F/T. Auf einem Pfad begrenzt die langsamste relevante Leitung den Ende-zu-Ende-Durchsatz: min(R₁, R₂, …). Für eine große Datei gilt näherungsweise Übertragungszeit = Dateigröße / Engpassrate. Bit/s und Byte sowie dezimale und binäre Präfixe müssen sauber getrennt werden.",
      },
    ],
    example: "Ein Paket mit 12.000 Bit wird auf eine 6-Mbit/s-Leitung gelegt: 12.000 / 6.000.000 s = 0,002 s = 2 ms Übertragungsverzögerung. Die Ausbreitungszeit kommt zusätzlich hinzu.",
    source: "Computernetzwerke und das Internet, S. 2–8, 40–73, besonders S. 44–68.",
    quiz: {
      question: "Wie groß ist die Übertragungsverzögerung für 12.000 Bit bei 6 Mbit/s?",
      choices: ["0,2 ms", "2 ms", "20 ms", "72 ms"],
      answer: 1,
      explanation: "L/R = 12.000 bit / 6.000.000 bit/s = 0,002 s. Mit ×1000 werden daraus 2 ms.",
    },
    diagnostic: {
      question: "Welche Formel beschreibt die Zeit, um alle Paketbits auf die Leitung zu legen?",
      choices: ["L/R", "d/s", "F×T"],
      answer: 0,
      feedback: "Achte auf die gesuchte Größe: Paketbits geteilt durch Bits pro Sekunde ergibt Sekunden.",
      firstStep: "Schreibe die Einheiten hin: bit ÷ (bit/s) = s. Damit muss die Paketlänge durch die Rate geteilt werden.",
    },
    cheat: { title: "Netzlaufzeit auseinanderhalten", when: "Bei Aufgaben zu Paketlaufzeit und Dateitransfer.", steps: "Übertragung L/R; Ausbreitung d/s; Durchsatz min(Rᵢ); Dateiübertragung F/min(Rᵢ).", example: "24 Mbit über 3 Mbit/s Engpass → 8 s." },
    guided: {
      title: "Engpass anwenden",
      prompt: "Eine 24-Mbit-Datei läuft über Leitungen mit 6 Mbit/s und 3 Mbit/s. Wie lange dauert sie näherungsweise?",
      choices: ["4 s", "6 s", "8 s", "9 s"],
      answer: 2,
      hint: "Bestimme zuerst min(6, 3). Teile danach die Dateigröße durch diese Rate.",
      explanation: "Der Engpass liefert 3 Mbit/s. 24 Mbit / 3 Mbit/s = 8 s.",
    },
    transfer: {
      title: "Neue Rechnung",
      prompt: "Eine 16-Mbit-Datei durchläuft 8-Mbit/s- und 4-Mbit/s-Leitungen. Welche Mindestzeit folgt aus dem Engpass?",
      choices: ["2 s", "4 s", "8 s", "12 s"],
      answer: 1,
      explanation: "min(8, 4) = 4 Mbit/s; 16 Mbit / 4 Mbit/s = 4 s.",
    },
    reflection: "Leite für einen Videoanruf her, warum hohe Bandbreite allein keine gleichmäßige Qualität garantiert. Beziehe mindestens Warteschlange, Paketverlust und variable Verzögerung ein.",
  },
];

export default function NetztechnikLernreise() {
  return <CourseTrainer course="Kommunikations- und Netztechnik" title="Netze wirklich verstehen" subtitle="Vom historischen Aufbau über OSI und TCP/IP bis zur berechenbaren Leistung paketvermittelter Netze." units={units} />;
}
