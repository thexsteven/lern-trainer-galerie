---
type: project
title: Lerntrainer – Backend und Betrieb
status: active
updated: 2026-10-03
---

# Backend und Betrieb

Supabase-Projekt: `qsbtxputzizqqivipels` (lern-trainer), Region Frankfurt.
Frontend: https://lern-trainer.vercel.app. Änderungen werden zuerst als geschützte Vercel-Vorschau bereitgestellt.

## Verhalten

- Ohne Anmeldung läuft die App als Gast. Lernstände bleiben im localStorage dieses Browsers.
- Konten verwenden E-Mail und Passwort mit E-Mail-Bestätigung. Wiederherstellung, Abmeldung, optionaler Anzeigename, Datenexport und Kontolöschung sind integriert.
- Konto-Lernstände haben getrennte Browser-Namensräume je Benutzer. Eine persistente Warteschlange synchronisiert Änderungen nach Wiederverbindung. Gleichzeitige Änderungen benötigen eine ausdrückliche Konfliktentscheidung.
- Gastdaten werden ausschließlich auf Wunsch übernommen. Vorhandene Kontofelder behalten Vorrang; fehlende Datensätze werden ergänzt. Supabase-Sitzungsschlüssel werden nicht importiert.
- Die freiwillige Kursauswahl T-INF 25 blendet gemeinsame Prüfungstermine ein. Sie ist keine Berechtigungsprüfung und kann auch im Gastmodus geändert werden.
- Die vier privaten Angebote werden ausschließlich an das bestätigte Konto `stevenbraun3107@icloud.com` ausgeliefert. Andere Konten und Gäste erhalten weder ihre Bibliothekseinträge noch ihre Inhalte. Private Trainer benötigen zum Laden eine Internetverbindung.
- Eigene Trainer, Prompt-Erstellung und Veröffentlichung sind ein separates Vorhaben.

## Speicherung und Zugriff

`profiles`, `progress`, `quiz_results` und `user_settings` gehören jeweils einer Benutzer-ID. RLS prüft die Eigentümerschaft und zusätzlich eine noch bestehende Supabase-Sitzung. Der Browser erhält nur den öffentlichen Publishable Key.

`save_learning_state` speichert erlaubte Lernschlüssel und Quiz-Snapshots atomar und prüft die Revision. Ein Zurücksetzen synchronisiert einen leeren Wert; historische Quiz-Snapshots bleiben bis zur Kontolöschung erhalten. Eine selbst gemeldete Sicherheit ist im Ergebnis als solche gekennzeichnet.

Die Edge Function `account` validiert den Token und die lebende Sitzung. Sie liefert private Inhalte nach serverseitiger Prüfung der bestätigten E-Mail und löscht nach Bestätigung das eigene Konto. Dazu widerruft sie Sitzungen und verwendet den Service Role Key ausschließlich serverseitig. Fremde Konten können nicht als Parameter angegeben werden. Datenbank-Fremdschlüssel löschen zugehörige Daten mit dem Konto.

## Entwicklung und Veröffentlichung

1. `npm ci`; `.env.example` nach `.env.local` kopieren und den öffentlichen Publishable Key ergänzen.
2. `npm test` und `npm run build` prüfen.
3. Bei Änderungen an privaten Trainern: `npm run build:private`, anschließend die Edge Function mit `index.ts` und der generierten `private-content.json` erneut deployen. Diese generierte Datei ist ignoriert und gehört nicht in das öffentliche Frontend.
4. Neue SQL-Änderungen mit `supabase migration new <name>` anlegen und als Migration anwenden. Die drei vorhandenen Migrationen sind bereits remote angewendet.
5. Vercel enthält die beiden öffentlichen Vite-Variablen für Development, Preview und Production. Niemals einen Service Role Key als Vite-Variable speichern.
6. Der Vite-Build entfernt private Katalogeinträge, React-Module und die alte statische Compilerseite aus `dist`. Änderungen an der Zugangskontrolle immer auch anhand der tatsächlichen Build-Dateien prüfen.

Die Site URL ist `https://lern-trainer.vercel.app`. Die Auth-Allowlist enthält genaue `/konto`- und `/passwort-zuruecksetzen`-Adressen für die Produktion, die geprüfte Vorschau und lokale Entwicklungsadressen. Neue Vorschau-Adressen müssen vor E-Mail-Tests ergänzt werden.

## Prüfung und verbleibende Einrichtung

Unit- und Integrationstests decken Gast-/Kontotrennung, Offline-Warteschlange, Konflikte, Import, Quiz-Metadaten, private Direktlinks und Kurs-Prüfungstermine ab. Live-API-Tests mit zwei wegwerfbaren bestätigten Testkonten prüfen RLS für alle vier Tabellen, fremde Schreibzugriffe, Sitzungswiderruf, Kontolöschung und Abweisung privater Inhalte einschließlich gefälschter Benutzer-Metadaten. `scripts/test-supabase.mjs` benötigt eigens vorbereitete Wegwerfkonten in der ignorierten Datei `tmp/test-accounts.json`; es verändert Passwörter und löscht das zweite Konto. Niemals echte Konten verwenden.

Im Browser wurden Gast-Persistenz, öffentliche Lernlabore, Anmeldung und Übernahme des Gast-Lernstands geprüft. Das echte Besitzerkonto hat die zugestellte Bestätigungs-Mail bestätigt. Am 03.10.2026 wurden alle vier privaten Angebote mit diesem Konto geladen; die Gastbibliothek enthält keine privaten Einträge. Die Reset-Mail wurde zugestellt und ihr Link geöffnet; die anschließende Passwortänderung wurde durch einen erfolgreichen Auth-Servereintrag verifiziert. Der Betreiber hat anschließend die erneute Anmeldung bestätigt; sein Screenshot zeigt das angemeldete, synchronisierte Konto in der Vorschau.

Vor öffentlicher Kontofreigabe:

- Eigenes SMTP ist in Supabase aktiviert und nach erneutem Laden verifiziert. Bestätigungs- und Reset-Mail wurden zugestellt und ihre Links erfolgreich geöffnet. Hintergrund zum Standardversand: https://supabase.com/docs/guides/auth/auth-smtp.
- Die vom Betreiber genannte Domain `braun-steven.de` verwendet laut DNS-Prüfung am 03.10.2026 IONOS-Nameserver, IONOS-MX und den IONOS-SPF-Eintrag. Gewählter Absender: `lerntrainer@braun-steven.de`. Das Mail-Basic-Postfach ist angelegt; IONOS bestätigt seine Verwendbarkeit. SMTP wurde vom Betreiber gespeichert; Aktivierung, Host und Port wurden nach erneutem Laden im Supabase-Dashboard verifiziert. Das Passwort liegt ausschließlich in der Supabase-Konfiguration, nicht im Repository. SMTP: `smtp.ionos.de`, Port 587 mit STARTTLS; siehe https://www.ionos.de/hilfe/e-mail/allgemeine-themen/serverinformationen-fuer-imap-pop3-und-smtp/.
- SMTP-Absender ist `lerntrainer@braun-steven.de`, Anbieter IONOS SE. Die Datenschutzerklärung nennt IONOS für den Auth-E-Mail-Versand. Aufbewahrung von Betriebs-/E-Mail-Protokollen beim Anbieter noch prüfen.
- Auftragsverarbeitungsbedingungen von Supabase und Vercel im Betreiberkonto prüfen/abschließen. Die vorhandenen Texte enthalten die tatsächlichen Betreiberangaben; sie ersetzen keine rechtliche Prüfung.
- Steven hat `stevenbraun3107@icloud.com` selbst registriert und bestätigt. Alle vier privaten Trainer wurden mit diesem Konto geprüft. Es wurde kein echtes Besitzerkonto automatisch angelegt.
- Am 03.10.2026 wurde die geprüfte Vorschau auf Produktion übernommen: `dpl_3AgoYVjFqtAoAYCTKdgG3K1Bvus6`, https://lern-trainer.vercel.app. Die Konto-, Anmelde- und Reset-Seiten liefern HTTP 200, die alte öffentliche Compilerdatei HTTP 404. Die aktuellen Konto-Buttons wurden auf Produktion geprüft.

Keine Analyse- oder Marketingdienste wurden hinzugefügt. Gastdaten verlassen ohne bewusste Kontoübernahme den Browser nicht; Hosting verarbeitet unabhängig davon technisch notwendige Verbindungsdaten.
