# Design: Kontaktformular – Formspree → Vercel Serverless + Resend

**Datum:** 2026-05-16  
**Status:** Genehmigt

---

## Ziel

Formspree als Drittanbieter ersetzen durch eine eigene Lösung:
- Vercel Serverless Function (Astro API Route) verarbeitet Formulardaten serverseitig
- Resend versendet die E-Mail an die Empfängeradresse
- Kein externer Dienst erhält Nutzerdaten außer Resend (DSGVO-konform via SCCs)

---

## Architektur

```
Browser
  │  fetch POST /api/kontakt  { name, email, nachricht }
  ▼
src/pages/api/kontakt.ts          ← Astro Server Endpoint (SSR)
  │  Input-Validierung
  │  Resend SDK → E-Mail an CONTACT_EMAIL_TO
  ▼
JSON { ok: true } oder { error: "..." }
  │
Browser: Erfolgsanzeige oder Fehlermeldung
```

---

## Komponenten

### 1. API Route – `src/pages/api/kontakt.ts`

- Methode: `POST`
- Liest `name`, `email`, `nachricht` aus dem Request-Body (FormData)
- Validierung: alle drei Felder Pflicht; E-Mail muss gültiges Format haben
- Bei Validierungsfehler: JSON `{ error: "..." }` mit Status 400
- Ruft Resend auf:
  - `from`: `onboarding@resend.dev`
  - `to`: `process.env.CONTACT_EMAIL_TO`
  - `replyTo`: E-Mail-Adresse des Absenders
  - `subject`: `Neue Kontaktanfrage von {name}`
  - `text`: Name, E-Mail, Nachricht
- Bei Resend-Fehler: JSON `{ error: "..." }` mit Status 500
- Bei Erfolg: JSON `{ ok: true }` mit Status 200

### 2. Formulare – `Kontakt.astro` und `Willkommen.astro`

Beide Formulare werden von nativem HTML-POST auf JavaScript-fetch umgestellt:

- `action`- und `method`-Attribute entfernen
- `<script>`-Block mit submit-Handler:
  - Formular-Daten als FormData senden
  - Button während des Requests deaktivieren + Text "Wird gesendet…"
  - **Erfolg:** Formular-Element durch Erfolgsmeldung ersetzen:
    - Überschrift: „Vielen Dank!"
    - Text: „Ihre Nachricht ist bei uns eingegangen. Wir melden uns so bald wie möglich."
    - Stil passt zum restlichen Design (Farben, Typografie)
  - **Fehler:** Fehlermeldung unter dem Button einblenden; Formular bleibt ausgefüllt und absendbar

### 3. Sanity-Schema – `sanity/schemaTypes/siteSettings.ts`

- `formspreeEndpoint`-Feld entfernen
- Props `formspreeId` aus `Kontakt.astro`, `Willkommen.astro` und `index.astro` entfernen

### 4. Datenschutzerklärung – `src/pages/datenschutz.astro`

- Abschnitt 5 „Kontaktformular – Formspree" ersetzen durch:
  - Titel: „Kontaktformular"
  - Inhalt: Daten werden auf eigenen Servern (Vercel, EU/USA) verarbeitet; E-Mail-Versand via Resend (Resend Inc., San Francisco); Rechtsgrundlage Art. 6 Abs. 1 lit. f DSGVO; Link zur Resend-Datenschutzerklärung

---

## Environment Variables

| Variable | Beschreibung | Test-Wert |
|---|---|---|
| `RESEND_API_KEY` | API Key aus dem Resend-Dashboard | – (geheim) |
| `CONTACT_EMAIL_TO` | Empfänger-E-Mail | `jan@byflowmatik.de` |

Lokal: `.env` (nicht in Git).  
Produktion: Vercel Environment Variables im Dashboard eintragen.

---

## Abhängigkeiten

- `resend` npm-Paket (offizielles Resend SDK)

---

## Out of Scope

- Domain-Verifizierung bei Resend (später, wenn Kundenmail eingetragen wird)
- Spam-Schutz / Honeypot (separates Thema)
- E-Mail-Templates (HTML-E-Mail; Plain-Text reicht für diese Phase)
