// GA4: Mess-ID und Events für den Flowmatik-Monatsreport (Schema wie STS).
// gtag läuft im Consent Mode, ohne Einwilligung sendet GA4 nur cookielose Pings.

export const GA_ID = 'G-GFCF3WJ8JB';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(name: string, params: Record<string, string>) {
  window.gtag?.('event', name, params);
}

function abschnitt(el: Element) {
  return el.closest<HTMLElement>('section[id]')?.id ?? 'sonstiges';
}

let started = false;
export function initTracking() {
  if (started) return;
  started = true;

  document.addEventListener('click', (e) => {
    const el = (e.target as Element | null)?.closest<HTMLElement>('a, button');
    if (!el) return;
    const href = el.getAttribute('href') ?? '';
    const location = abschnitt(el);

    if (href.startsWith('tel:')) track('phone_click', { location });
    else if (href.startsWith('mailto:')) track('email_click', { location });
    else if (href.includes('instagram.com')) track('cta_click', { cta_name: 'instagram', location });
    else if (el.matches('.karte') && el.dataset.modal) track('service_click', { service_name: el.dataset.modal, location });
    else if (el.id === 'galerie-mehr-btn') track('cta_click', { cta_name: 'galerie_mehr', location });
    else if (el.id === 'map-consent-btn') track('route_click', { location });
  }, { capture: true });

  // Einmal je Seitenaufruf: Abschnitt zur Hälfte sichtbar (hohe Abschnitte: halbe Bildschirmhöhe sichtbar)
  const sections = document.querySelectorAll<HTMLElement>('main section[id]');
  if (!sections.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      if (en.intersectionRatio < 0.5 && en.intersectionRect.height < innerHeight / 2) continue;
      track('section_view', { section_name: en.target.id });
      io.unobserve(en.target);
    }
  }, { threshold: Array.from({ length: 11 }, (_, i) => i / 10) });
  sections.forEach((s) => io.observe(s));
}
