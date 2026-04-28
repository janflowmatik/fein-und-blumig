import { createClient } from '@sanity/client';
import { createImageUrlBuilder as imageUrlBuilder } from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';
const isConfigured = Boolean(projectId);

export const client = isConfigured
  ? createClient({ projectId, dataset, apiVersion: '2024-01-01', useCdn: true })
  : null;

const builder = isConfigured && client ? imageUrlBuilder(client) : null;

export function urlFor(source: SanityImageSource) {
  if (!builder) return { url: () => '' } as any;
  return builder.image(source).format('webp');
}

async function sanityFetch(query: string) {
  if (!client) return null;
  return client.fetch(query);
}

export async function getSiteSettings() {
  return sanityFetch(`*[_type == "siteSettings"][0]`);
}

export async function getOpeningHours() {
  return sanityFetch(`*[_type == "openingHours"][0]`);
}

export async function getHomePage() {
  return sanityFetch(`*[_type == "homePage"][0]`);
}

export async function getActiveEvents() {
  return sanityFetch(`*[_type == "event" && aktiv == true] | order(_createdAt asc)`);
}

export async function getLeistungenBilder() {
  return sanityFetch(`*[_type == "leistungenBilder"][0]`);
}
