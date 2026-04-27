// @ts-check
import { defineConfig } from 'astro/config';
import { sanityIntegration as sanity } from '@sanity/astro';
import vercel from '@astrojs/vercel/serverless';
import react from '@astrojs/react';
import { loadEnv } from 'vite';
const env = loadEnv('', process.cwd(), '');
const projectId = env.PUBLIC_SANITY_PROJECT_ID || '0ob0nh2y';
const dataset = env.PUBLIC_SANITY_DATASET || 'production';

export default defineConfig({
  output: 'hybrid',
  adapter: vercel(),
  integrations: [
    react(),
    sanity({ projectId, dataset, useCdn: true, studioBasePath: '/studio' }),
  ],
});
