import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemaTypes';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID as string;
const dataset = (import.meta.env.PUBLIC_SANITY_DATASET as string) || 'production';

export default defineConfig({
  name: 'fein-und-blumig',
  title: 'fein und blumig',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Inhalte')
          .items([
            S.listItem()
              .title('Website-Einstellungen')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
              ),
            S.listItem()
              .title('Öffnungszeiten')
              .id('openingHours')
              .child(
                S.document()
                  .schemaType('openingHours')
                  .documentId('openingHours')
              ),
            S.listItem()
              .title('Startseite (Texte & Bilder)')
              .id('homePage')
              .child(
                S.document()
                  .schemaType('homePage')
                  .documentId('homePage')
              ),
            S.listItem()
              .title('Leistungen – Bildergalerien')
              .id('leistungenBilder')
              .child(
                S.document()
                  .schemaType('leistungenBilder')
                  .documentId('leistungenBilder')
              ),
            S.listItem()
              .title('Info-Hinweise (Hurtig-Markt)')
              .id('infoButton')
              .child(
                S.document()
                  .schemaType('infoButton')
                  .documentId('infoButton')
              ),
            S.divider(),
            S.documentTypeListItem('event').title('Ankündigungen / Events'),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});
