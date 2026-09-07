import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();
  const honeypot = data.get('website')?.toString() ?? '';
  if (honeypot) {
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  const name = data.get('name')?.toString().trim() ?? '';
  const email = data.get('email')?.toString().trim() ?? '';
  const nachricht = data.get('nachricht')?.toString().trim() ?? '';

  if (!name || !email || !nachricht) {
    return new Response(
      JSON.stringify({ error: 'Alle Felder sind Pflichtfelder.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (name.length > 200 || email.length > 254 || nachricht.length > 5000) {
    return new Response(
      JSON.stringify({ error: 'Ein oder mehrere Felder überschreiten die maximale Länge.' }),
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

  const { error } = await resend.emails.send({
    from: 'kontakt@feinundblumig.de',
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

// Crawler (u. a. Googlebot) rufen diese URL per GET auf. Ohne eigenen Handler
// erzeugt Astro intern eine 404 und versucht die vorgerenderte 404.html per
// fetch nachzuladen - das schlaegt in der Vercel-Function fehl und laesst sie
// mit 500 abstuerzen. Ein expliziter 405 beendet die Anfrage sauber.
export const ALL: APIRoute = () =>
  new Response(
    JSON.stringify({ error: 'Method Not Allowed' }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'POST',
        'X-Robots-Tag': 'noindex',
      },
    }
  );
