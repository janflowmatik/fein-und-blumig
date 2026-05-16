import { defineType, defineField } from 'sanity';

const bildArray = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'array',
    validation: (Rule) => Rule.max(14),
    of: [
      {
        type: 'image',
        options: { hotspot: true },
        fields: [
          defineField({ name: 'alt', title: 'Alt-Text', type: 'string' }),
        ],
      },
    ],
  });

export const leistungenBilder = defineType({
  name: 'leistungenBilder',
  title: 'Leistungen – Bildergalerien',
  type: 'document',
  fields: [
    defineField({ name: 'hochzeitTitel',      title: 'Hochzeit – Überschrift',  type: 'string' }),
    defineField({ name: 'hochzeitKarteText',  title: 'Hochzeit – Kartentext',   type: 'text', rows: 3 }),
    defineField({ name: 'hochzeitModalText',  title: 'Hochzeit – Modaltext',    type: 'text', rows: 5 }),
    bildArray('hochzeitBilder',  'Hochzeit – Bilder (max. 14)'),

    defineField({ name: 'geschenkeTitel',     title: 'Geschenke – Überschrift', type: 'string' }),
    defineField({ name: 'geschenkeKarteText', title: 'Geschenke – Kartentext',  type: 'text', rows: 3 }),
    defineField({ name: 'geschenkeModalText', title: 'Geschenke – Modaltext',   type: 'text', rows: 5 }),
    bildArray('geschenkeBilder', 'Geschenke – Bilder (max. 14)'),

    defineField({ name: 'pflanzenTitel',      title: 'Pflanzen – Überschrift',  type: 'string' }),
    defineField({ name: 'pflanzenKarteText',  title: 'Pflanzen – Kartentext',   type: 'text', rows: 3 }),
    defineField({ name: 'pflanzenModalText',  title: 'Pflanzen – Modaltext',    type: 'text', rows: 5 }),
    bildArray('pflanzenBilder',  'Pflanzen – Bilder (max. 14)'),

    defineField({ name: 'straeuseTitel',      title: 'Sträuße – Überschrift',   type: 'string' }),
    defineField({ name: 'straeusKarteText',   title: 'Sträuße – Kartentext',    type: 'text', rows: 3 }),
    defineField({ name: 'straeusModalText',   title: 'Sträuße – Modaltext',     type: 'text', rows: 5 }),
    bildArray('straeuseBilder',  'Sträuße – Bilder (max. 14)'),
  ],
  preview: {
    prepare: () => ({ title: 'Leistungen – Bilder' }),
  },
});
