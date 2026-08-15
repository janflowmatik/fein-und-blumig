// @ts-check
import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import { loadEnv } from 'vite';
const env = loadEnv('', process.cwd(), '');
const projectId = env.PUBLIC_SANITY_PROJECT_ID || '0ob0nh2y';
const dataset = env.PUBLIC_SANITY_DATASET || 'production';

export default defineConfig({
  output: 'static',
  adapter: vercel(),
  // Astro 5 aktiviert checkOrigin standardmaessig. Hinter Vercels Proxy
  // schlaegt der Origin/Host-Vergleich fehl, wodurch jeder FormData-POST
  // mit 403 abgewiesen wird und /api/kontakt nie erreicht wird.
  // Unter Astro 4 war der Schutz ohnehin inaktiv.
  security: {
    checkOrigin: false,
  },
  integrations: [
    react(),
    sanity({ projectId, dataset, useCdn: true, studioBasePath: '/studio' }),
  ],
});
