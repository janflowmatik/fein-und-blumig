# Kontaktformular: Formspree → Vercel Serverless + Resend

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Formspree durch eine eigene Astro API Route ersetzen, die E-Mails via Resend versendet.

**Architecture:** Eine einzelne API Route (`/api/kontakt`) nimmt FormData entgegen, validiert sie und ruft die Resend API auf. Beide Formulare werden von nativem HTML-POST auf `fetch()` umgestellt und zeigen Erfolgs- bzw. Fehlermeldungen im UI.

**Tech Stack:** Astro 4 (hybrid SSR), `@astrojs/vercel/serverless`, `resend` npm-Paket, TypeScript, `import.meta.env`

---

## File Map

| Aktion | Datei | Zweck |
|---|---|---|
| Erstellen | `src/pages/api/kontakt.ts` | POST-Handler: Validierung + Resend-Aufruf |
| Ändern | `.env` | RESEND_API_KEY + CONTACT_EMAIL_TO hinzufügen |
| Ändern | `.env.example` | Neue Variablen dokumentieren |
| Ändern | `src/components/Kontakt.astro` | form auf fetch umstellen, formspreeId entfernen |
| Ändern | `src/components/Willkommen.astro` | form auf fetch umstellen, formspreeId entfernen |
| Ändern | `src/pages/index.astro` | formspreeId-Props aus beiden Komponenten entfernen |
| Ändern | `sanity/schemaTypes/siteSettings.ts` | formspreeEndpoint-Feld entfernen |
| Ändern | `src/pages/datenschutz.astro` | Abschnitt 5 von Formspree auf Resend umschreiben |

---

## Task 1: Resend installieren + lokale Env Vars anlegen

**Files:**
- Modify: `.env`
- Modify: `.env.example`

- [ ] **Schritt 1: Resend SDK installieren**

```bash
npm install resend
```

Erwartete Ausgabe: `added 1 package` (oder ähnlich, kein Fehler)

- [ ] **Schritt 2: `.env` um die neuen Variablen erweitern**

Die Datei enthält bereits die Sanity-Variablen. Folgende zwei Zeilen am Ende anhängen:

```
RESEND_API_KEY=re_DEIN_KEY_HIER
CONTACT_EMAIL_TO=jan@byflowmatik.de
```

`RESEND_API_KEY` bleibt zunächst als Platzhalter – der echte Key wird in Schritt 8 eingefügt.

- [ ] **Schritt 3: `.env.example` aktualisieren**

Datei aktuell:
```
PUBLIC_SANITY_PROJECT_ID=dein_project_id
PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=
```

Ersetzen durch:
```
PUBLIC_SANITY_PROJECT_ID=dein_project_id
PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=
RESEND_API_KEY=re_...
CONTACT_EMAIL_TO=kontakt@example.de
```

- [ ] **Schritt 4: Committen**

```bash
git add .env.example
git commit -m "chore: Resend installieren + Env-Vars dokumentieren"
```

(`.env` nicht committen – ist in `.gitignore`)

---

## Task 2: API Route erstellen

**Files:**
- Create: `src/pages/api/kontakt.ts`

- [ ] **Schritt 1: Datei erstellen**

`src/pages/api/kontakt.ts` mit folgendem Inhalt:

```typescript
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();
  const name = data.get('name')?.toString().trim() ?? '';
  const email = data.get('email')?.toString().trim() ?? '';
  const nachricht = data.get('nachricht')?.toString().trim() ?? '';

  if (!name || !email || !nachricht) {
    return new Response(
      JSON.stringify({ error: 'Alle Felder sind Pflichtfelder.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(
      JSON.stringify({ error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const resend = new Resend(import.meta.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: import.meta.env.CONTACT_EMAIL_TO,
    replyTo: email,
    subject: `Neue Kontaktanfrage von ${name}`,
    text: `Name: ${name}\nE-Mail: ${email}\n\nNachricht:\n${nachricht}`,
  });

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Beim Senden ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
```

- [ ] **Schritt 2: TypeScript prüfen**

```bash
npx astro check
```

Erwartete Ausgabe: keine Fehler. Warnungen über fehlende Env-Var-Typen sind OK.

- [ ] **Schritt 3: Committen**

```bash
git add src/pages/api/kontakt.ts
git commit -m "feat: API Route /api/kontakt mit Resend"
```

---

## Task 3: Kontakt.astro umstellen

**Files:**
- Modify: `src/components/Kontakt.astro`

- [ ] **Schritt 1: Datei vollständig ersetzen**

Die Props-Schnittstelle ändern (formspreeId entfernen), das Form-Element anpassen (kein `action`/`method` mehr, Feldname `_replyto` → `email`) und einen neuen `<script>`-Block für den fetch-Handler hinzufügen. Der bestehende Karten-Script bleibt erhalten.

Kompletter neuer Inhalt der Datei:

```astro
---
interface Props {
  mapsEmbedUrl?: string;
}

const { mapsEmbedUrl } = Astro.props;
---
<section id="kontakt" aria-label="Kontakt">
  <div class="section-inner">
    <div class="kontakt-layout">
      <div class="">
        <p class="section-label">Schreiben Sie uns</p>
        <h2 class="section-title">Kontakt</h2>
        <div class="divider" aria-hidden="true"></div>
        <form id="kontakt-form" aria-label="Kontaktformular" novalidate>
          <div class="form-group">
            <label class="form-label" for="k-name">Ihr Name</label>
            <input id="k-name" name="name" type="text" class="form-input" required autocomplete="name" />
          </div>
          <div class="form-group">
            <label class="form-label" for="k-email">E-Mail-Adresse</label>
            <input id="k-email" name="email" type="email" class="form-input" required autocomplete="email" />
          </div>
          <div class="form-group">
            <label class="form-label" for="k-msg">Ihre Nachricht</label>
            <textarea id="k-msg" name="nachricht" class="form-textarea" required></textarea>
          </div>
          <button type="submit" class="form-submit" id="kontakt-btn">Nachricht senden</button>
          <p class="form-error" id="kontakt-error" aria-live="polite"></p>
          <p class="form-privacy">Mit dem Absenden werden Ihre Daten zur Bearbeitung Ihrer Anfrage verarbeitet. Weitere Informationen finden Sie in unserer <a href="/datenschutz">Datenschutzerklärung</a>.</p>
        </form>
      </div>
      <div class="">
        {mapsEmbedUrl && <div class="map-box">
          <div class="map-placeholder" id="map-placeholder">
            <p class="map-placeholder-text">
              Diese Karte wird von Google Maps bereitgestellt.<br />
              Zum Laden stimmen Sie bitte der Nutzung zu.
            </p>
            <button class="map-consent-btn" id="map-consent-btn">Karte laden</button>
          </div>
          <iframe
            id="maps-iframe"
            data-src={mapsEmbedUrl}
            width="100%" height="100%"
            style="border:0;border-radius:2px;display:none;"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
            title="Standort fein und blumig"
          ></iframe>
        </div>}
        <p class="body-text" style="margin-top:1.5rem;">
          Ob Hochzeit, Geburtstag, Genesung, für ein Dankeschön, Tischschmuck oder vieles mehr – kommen Sie gerne vorbei. Wir freuen uns auf Sie!
        </p>
      </div>
    </div>
  </div>
</section>

<script>
  // Karten-Logik
  const iframe = document.getElementById('maps-iframe') as HTMLIFrameElement | null;
  const placeholder = document.getElementById('map-placeholder');

  function loadMap() {
    if (!iframe || !iframe.dataset.src) return;
    iframe.src = iframe.dataset.src;
    iframe.removeAttribute('data-src');
    iframe.style.display = '';
    placeholder?.remove();
  }

  if (localStorage.getItem('fab_cookies') === 'accepted') loadMap();
  document.addEventListener('cookiesAccepted', loadMap);
  document.getElementById('map-consent-btn')?.addEventListener('click', () => {
    localStorage.setItem('fab_cookies', 'accepted');
    document.dispatchEvent(new Event('cookiesAccepted'));
    loadMap();
  });

  // Formular-Logik
  const form = document.getElementById('kontakt-form') as HTMLFormElement | null;
  const btn = document.getElementById('kontakt-btn') as HTMLButtonElement | null;
  const errorEl = document.getElementById('kontakt-error');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!btn || !errorEl) return;

    btn.disabled = true;
    btn.textContent = 'Wird gesendet…';
    errorEl.textContent = '';

    try {
      const res = await fetch('/api/kontakt', { method: 'POST', body: new FormData(form) });
      const json = await res.json();

      if (json.ok) {
        form.innerHTML = `
          <div class="form-success">
            <p class="form-success-title">Vielen Dank!</p>
            <p class="form-success-text">Ihre Nachricht ist bei uns eingegangen. Wir melden uns so bald wie möglich.</p>
          </div>
        `;
      } else {
        btn.disabled = false;
        btn.textContent = 'Nachricht senden';
        errorEl.textContent = json.error ?? 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
      }
    } catch {
      btn.disabled = false;
      btn.textContent = 'Nachricht senden';
      errorEl.textContent = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
    }
  });
</script>

<style>
  #kontakt { background: var(--white); }
  .kontakt-layout {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 5rem; align-items: start;
  }
  .map-box {
    width: 100%; aspect-ratio: 4/3;
    background: var(--rose-pale); border-radius: 2px; overflow: hidden;
    position: relative;
  }
  .map-placeholder {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 1.2rem; padding: 2rem; text-align: center;
  }
  .map-placeholder-text {
    font-size: 0.88rem; line-height: 1.7;
    color: var(--bark-light); max-width: 240px;
  }
  .map-consent-btn {
    padding: 0.6rem 1.6rem;
    background: var(--rose-deep); color: white;
    border: none; border-radius: 2px; cursor: pointer;
    font-family: 'Jost', sans-serif; font-size: 0.78rem;
    letter-spacing: 0.1em; text-transform: uppercase;
    transition: background 0.2s;
  }
  .map-consent-btn:hover { background: var(--rose-dark); }
  .form-error {
    color: var(--rose-deep); font-size: 0.88rem;
    margin-top: 0.5rem; min-height: 1.2em;
  }
  .form-success { padding: 1.5rem 0; }
  .form-success-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.6rem; color: var(--bark); margin-bottom: 0.5rem;
  }
  .form-success-text { font-size: 1rem; color: var(--bark-light); line-height: 1.7; }
  @media (max-width: 768px) {
    .kontakt-layout { grid-template-columns: 1fr; gap: 3rem; }
  }
</style>
```

- [ ] **Schritt 2: Dev-Server starten und Formular im Browser testen**

```bash
npm run dev
```

- Formular unter `http://localhost:4321/#kontakt` aufrufen
- Felder ausfüllen und absenden → Erfolgsmeldung muss erscheinen
- Felder leer lassen und absenden → Browser-Validierung greift (kein Request)

- [ ] **Schritt 3: Committen**

```bash
git add src/components/Kontakt.astro
git commit -m "feat: Kontakt.astro auf fetch + Resend umgestellt"
```

---

## Task 4: Willkommen.astro umstellen

**Files:**
- Modify: `src/components/Willkommen.astro`

- [ ] **Schritt 1: Props-Schnittstelle anpassen**

In `src/components/Willkommen.astro` die Interface-Definition oben im Frontmatter ändern:

```typescript
// ALT:
interface Props {
  text?: string;
  imageUrl?: string;
  formspreeId?: string;
  regularHours?: RegularHour[];
  specialHours?: SpecialHour[];
  adresse?: string;
  instagramUrl?: string;
}

const {
  text,
  imageUrl,
  formspreeId,
  regularHours = [],
  specialHours = [],
  adresse,
  instagramUrl,
} = Astro.props;

// NEU:
interface Props {
  text?: string;
  imageUrl?: string;
  regularHours?: RegularHour[];
  specialHours?: SpecialHour[];
  adresse?: string;
  instagramUrl?: string;
}

const {
  text,
  imageUrl,
  regularHours = [],
  specialHours = [],
  adresse,
  instagramUrl,
} = Astro.props;
```

- [ ] **Schritt 2: Formular-Block im Template ersetzen**

Den Block ab Zeile 107 (`<div class="">` mit dem Schnellkontakt-Formular) ersetzen:

```astro
      <div class="">
        <p class="section-label">Schreiben Sie uns</p>
        <h2 class="section-title">Schnellkontakt</h2>
        <div class="divider" aria-hidden="true"></div>
        <form id="willkommen-form" aria-label="Schnellkontaktformular" novalidate>
          <div class="form-group">
            <label class="form-label" for="w-name">Ihr Name</label>
            <input id="w-name" name="name" type="text" class="form-input" required autocomplete="name" />
          </div>
          <div class="form-group">
            <label class="form-label" for="w-email">E-Mail</label>
            <input id="w-email" name="email" type="email" class="form-input" required autocomplete="email" />
          </div>
          <div class="form-group">
            <label class="form-label" for="w-msg">Nachricht</label>
            <textarea id="w-msg" name="nachricht" class="form-textarea" required></textarea>
          </div>
          <button type="submit" class="form-submit" id="willkommen-btn">Nachricht senden</button>
          <p class="form-error" id="willkommen-error" aria-live="polite"></p>
          <p class="form-privacy">Mit dem Absenden werden Ihre Daten zur Bearbeitung Ihrer Anfrage verarbeitet. Weitere Informationen finden Sie in unserer <a href="/datenschutz">Datenschutzerklärung</a>.</p>
        </form>
      </div>
```

- [ ] **Schritt 3: `<script>`-Block am Ende der Datei hinzufügen** (vor `<style>`)

```astro
<script>
  const form = document.getElementById('willkommen-form') as HTMLFormElement | null;
  const btn = document.getElementById('willkommen-btn') as HTMLButtonElement | null;
  const errorEl = document.getElementById('willkommen-error');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!btn || !errorEl) return;

    btn.disabled = true;
    btn.textContent = 'Wird gesendet…';
    errorEl.textContent = '';

    try {
      const res = await fetch('/api/kontakt', { method: 'POST', body: new FormData(form) });
      const json = await res.json();

      if (json.ok) {
        form.innerHTML = `
          <div class="form-success">
            <p class="form-success-title">Vielen Dank!</p>
            <p class="form-success-text">Ihre Nachricht ist bei uns eingegangen. Wir melden uns so bald wie möglich.</p>
          </div>
        `;
      } else {
        btn.disabled = false;
        btn.textContent = 'Nachricht senden';
        errorEl.textContent = json.error ?? 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
      }
    } catch {
      btn.disabled = false;
      btn.textContent = 'Nachricht senden';
      errorEl.textContent = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
    }
  });
</script>
```

- [ ] **Schritt 4: Styles für Feedback ergänzen** (in den bestehenden `<style>`-Block einfügen)

```css
  .form-error {
    color: var(--rose-deep); font-size: 0.88rem;
    margin-top: 0.5rem; min-height: 1.2em;
  }
  .form-success { padding: 1.5rem 0; }
  .form-success-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.6rem; color: var(--bark); margin-bottom: 0.5rem;
  }
  .form-success-text { font-size: 1rem; color: var(--bark-light); line-height: 1.7; }
```

- [ ] **Schritt 5: Im Browser testen**

Schnellkontakt-Formular unter `http://localhost:4321/#willkommen` testen – gleiche Kriterien wie Task 3 Schritt 2.

- [ ] **Schritt 6: Committen**

```bash
git add src/components/Willkommen.astro
git commit -m "feat: Willkommen.astro auf fetch + Resend umgestellt"
```

---

## Task 5: index.astro – formspreeId-Props entfernen

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Schritt 1: Prop bei `<Willkommen>` entfernen**

Zeile 91 löschen:
```astro
      formspreeId={settings?.formspreeEndpoint}
```

- [ ] **Schritt 2: Prop bei `<Kontakt>` entfernen**

Zeile 124 löschen:
```astro
      formspreeId={settings?.formspreeEndpoint}
```

- [ ] **Schritt 3: TypeScript prüfen**

```bash
npx astro check
```

Erwartete Ausgabe: keine Fehler.

- [ ] **Schritt 4: Committen**

```bash
git add src/pages/index.astro
git commit -m "chore: formspreeId-Props aus index.astro entfernen"
```

---

## Task 6: Sanity-Schema aufräumen

**Files:**
- Modify: `sanity/schemaTypes/siteSettings.ts`

- [ ] **Schritt 1: formspreeEndpoint-Feld entfernen**

Den folgenden Block aus der `fields`-Array entfernen:

```typescript
    defineField({
      name: 'formspreeEndpoint',
      title: 'Formspree Endpunkt-ID',
      type: 'string',
      description: 'z. B. mpqynkld (nur die ID, nicht die vollständige URL)',
    }),
```

- [ ] **Schritt 2: Committen**

```bash
git add sanity/schemaTypes/siteSettings.ts
git commit -m "chore: formspreeEndpoint aus Sanity-Schema entfernen"
```

---

## Task 7: Datenschutzerklärung aktualisieren

**Files:**
- Modify: `src/pages/datenschutz.astro`

- [ ] **Schritt 1: Abschnitt 5 ersetzen**

Den gesamten Block von `<h2>5. Kontaktformular – Formspree</h2>` bis zum schließenden `</p>` (nach dem Formspree-Link) ersetzen durch:

```html
    <h2>5. Kontaktformular</h2>
    <p>
      Auf dieser Website steht ein Kontaktformular zur Verfügung. Nachrichten, die über das
      Formular gesendet werden, werden auf unseren Servern (Vercel Inc., San Francisco, CA, USA)
      verarbeitet. Der E-Mail-Versand erfolgt über den Dienst Resend (Resend Inc., San Francisco,
      CA, USA). Dabei werden die von Ihnen eingegebenen Daten (Name, E-Mail-Adresse, Nachricht)
      an Resend übermittelt.
    </p>
    <p>
      Wir verwenden Ihre Daten ausschließlich zur Bearbeitung Ihrer Anfrage und geben sie nicht
      an Dritte weiter. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an
      der Bearbeitung von Kundenanfragen). Speicherdauer: bis zur abschließenden Bearbeitung
      Ihrer Anfrage, längstens 2 Jahre. Die Datenübermittlung in die USA erfolgt auf Basis von
      EU-Standardvertragsklauseln gemäß Art. 46 Abs. 2 lit. c DSGVO.<br />
      Datenschutzerklärung Resend:
      <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
        resend.com/legal/privacy-policy
      </a>
    </p>
```

- [ ] **Schritt 2: Committen**

```bash
git add src/pages/datenschutz.astro
git commit -m "legal: Datenschutz Abschnitt 5 von Formspree auf Resend aktualisieren"
```

---

## Task 8: Env Vars in Vercel eintragen + finaler Deploy

**Hinweis:** Dieser Task erfordert manuelle Aktion im Vercel-Dashboard und die Eingabe des echten Resend API Keys.

- [ ] **Schritt 1: Resend API Key holen**

Im [Resend-Dashboard](https://resend.com) unter **API Keys** einen neuen Key erstellen. Den Key kopieren.

- [ ] **Schritt 2: Env Vars in Vercel eintragen**

Im Vercel-Dashboard für das Projekt `fein-und-blumig` unter **Settings → Environment Variables** folgende Variablen für alle Environments (Production, Preview, Development) eintragen:

| Name | Wert |
|---|---|
| `RESEND_API_KEY` | `re_...` (aus Schritt 1) |
| `CONTACT_EMAIL_TO` | `jan@byflowmatik.de` |

- [ ] **Schritt 3: Lokale `.env` aktualisieren**

Den Platzhalter in `.env` mit dem echten Key ersetzen:

```
RESEND_API_KEY=re_ECHTER_KEY_HIER
```

- [ ] **Schritt 4: Lokalen Formular-Test mit echtem Key durchführen**

```bash
npm run dev
```

Formular ausfüllen und absenden → E-Mail sollte bei `jan@byflowmatik.de` ankommen.

- [ ] **Schritt 5: Git push → automatischer Vercel-Deploy**

```bash
git push
```

Vercel deployt automatisch. Im Vercel-Dashboard unter **Deployments** den Status prüfen.

- [ ] **Schritt 6: Produktions-Formular testen**

Auf der Live-URL das Formular ausfüllen und absenden → E-Mail prüfen.
