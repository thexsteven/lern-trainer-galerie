---
type: note
title: Formale Sprachen und Automaten – Material und Lernfolge
status: active
updated: 2026-09-14
tags: [dhbw, automaten, lerntrainer]
---

Quellenordner (read-only): `G:/Meine Ablage/01_Studium/DHBW Mosbach/Formale Sprachen & Automaten/`.
Alle Seitenangaben sind PDF-Seiten, gezählt ab 1. Im Hauptskript stimmen sie mit den Foliennummern überein. Die Übersicht beruht auf Dateiinventar, Gliederungen und gezielt geprüften Inhalten; sie ist keine vollständige fachliche Prüfung aller 600 Seiten.

| Datei | Umfang | Inhalte und Fundstellen | Voraussetzungen |
| --- | --- | --- | --- |
| FSA-handout (old).pdf | 480 S. | Gliederung S. 6; Grundlagen S. 26–43; reguläre Sprachen S. 44–181, darunter DEA S. 66–78, NEA ab S. 79, Umwandlungen ab S. 104, Minimierung ab S. 125, Pumping-Lemma ab S. 146; Grammatiken/Kellerautomaten S. 182–276; Turingmaschinen S. 277–326; Entscheidbarkeit S. 327–412; Berechenbarkeit S. 413–445; Komplexität S. 446–480 | Mengen, Funktionen, Wörter; später Induktion, Quantoren und Algorithmen |
| Reguläre Sprachen - Anmerkungen, Übungsaufgaben und Lösungen.pdf | 48 S. | Reguläre Ausdrücke S. 1–6; DEA S. 7–14; NEA/Determinisierung S. 15–22; Umwandlungen S. 23–30; rechtslineare Grammatiken S. 31–33; Pumping-Lemma und Beweise S. 34–47; S. 48 ohne extrahierten Text | Grundlagen, Übergänge; für Beweise Induktion und Quantoren |
| Kontextfreie Sprachen - Anmerkungen, Übungsaufgaben und Lösungen.pdf | 47 S. | Rechtslineare Grammatiken S. 1–3; Reduktion/Normalformen S. 4–13; CYK S. 14–30; Kellerautomaten/Palindrome S. 31–37; Äquivalenz und Anwendungen S. 38–47 | Ableitungen, Nichtterminale, Mengen, Stack |
| CYK-Algorithmus.pdf | 13 S. | Teilwörter/Tabelle S. 1–6; Induktionsbeweis S. 7; Beispiel S. 8; Speicherbedarf/Datenstruktur S. 9–11; Algorithmus S. 12–13 | Kontextfreie Grammatik in Chomsky-Normalform; dynamische Programmierung |
| Beweis der Äquivalenz von Kontextfreien Grammatiken und Kellerautomaten.pdf | 12 S. | Grammatik → Kellerautomat S. 1–6; Korrektur der umgekehrten Konstruktion S. 7; Beweis Kellerautomat → Grammatik S. 8–12 | Linksableitung, Konfiguration, Stack und vollständige Induktion |

## Lernfolge und Stand

1. Alphabet, Wort, leeres Wort, Sprache → erster DEA-Wortlauf: erste Einheit in der Galerie verfügbar; der Vorwissenscheck ist im Trainer integriert. Steven wünscht einen Einstieg ab Alphabet, Wort und Zustand. Im Chat: Länge von ε unbekannt; Zustand A und Ablehnung für den Wechselautomaten bei 101 richtig beantwortet. Das belegt diese beiden Antworten, keine allgemeine Sicherheit. Lernziel dieser Einheit: einen vollständigen Wortlauf selbst verfolgen und Akzeptanz begründen.
2. Reguläre Ausdrücke, NEA, Umwandlungen, Minimierung: noch nicht als Lerneinheit aufbereitet.
3. Pumping-Lemma, Quantoren und Abschlusseigenschaften: noch offen.
4. Grammatiken, Chomsky-Hierarchie, Normalformen: noch offen.
5. CYK und Kellerautomaten, anschließend Äquivalenzbeweise: noch offen.
6. Turingmaschinen → Entscheidbarkeit → Berechenbarkeit → Komplexität: noch offen.

Bekannte Grundlagen bleiben im Trainer zugänglich. Aus ausbleibenden Antworten werden keine persönlichen Wissenslücken abgeleitet.

## Quellenhinweise und offene Punkte

- Das Hauptskript trägt den Zusatz „old“ und nennt DHBW Stuttgart. Ob es vollständig zum aktuellen Mosbacher Prüfungsstoff gehört, ist nicht belegt.
- CYK-Inhalte überschneiden sich zwischen der separaten Datei und der Ergänzung zu kontextfreien Sprachen; kein zusätzlicher Lernblock allein wegen der zweiten Datei.
- Die Beweisergänzung benennt auf S. 7 eine unvollständige Konstruktionsvorschrift und ergänzt die Regel `[pZq] → c` für passende Übergänge, die das Stacksymbol entfernen. Bei einer späteren Einheit beide Quellen zusammen verwenden.
- Auch „Kontextfreie Sprachen - Anmerkungen, Übungsaufgaben und Lösungen.pdf“, S. 7, korrigiert die Konstruktion zur Entfernung einfacher Regeln. „CYK-Algorithmus.pdf“, S. 13, weist auf den fehlenden Sonderfall ε im Pseudocode hin. Für spätere Einheiten berücksichtigen.
- PDF-Textextraktion beschädigt teilweise mathematische Zeichen und erfasst Diagramme nicht zuverlässig. Die zentrale Automatendefinition und Akzeptanzregel wurden auf gerenderten S. 69–70 visuell geprüft.

## Eignung für die kurze Demonstration

Der DEA aus Hauptskript S. 67–72 ist geeignet: drei Zustände, Alphabet `{a,b}`, ein akzeptierender Zustand. Ein eigenes kurzes Testwort macht jeden Übergang sichtbar. Insbesondere zeigt `abab`, warum das Erreichen eines Endzustands nach einem Präfix noch nicht genügt. Die Wortwahl ist ein eigenes didaktisches Beispiel, die Automatendefinition stammt aus dem Skript.

Die spätere Aufnahme kann in höchstens 45 Sekunden Lesen, Antwort, Zwischenschritt, Hinweis und erneuten Versuch exemplarisch zeigen. Das ist ein Ausschnitt des Lernablaufs, keine Zeitvorgabe für das Lernen und kein Nachweis umfassenden Verständnisses.
