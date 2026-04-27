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
    bildArray('hochzeitBilder',  'Hochzeitsfloristik (max. 14)'),
    bildArray('geschenkeBilder', 'Geschenke (max. 14)'),
    bildArray('pflanzenBilder',  'Pflanzen und Dekoriertes (max. 14)'),
    bildArray('straeuseBilder',  'Schnittblumen und Sträuße (max. 14)'),
  ],
  preview: {
    prepare: () => ({ title: 'Leistungen – Bilder' }),
  },
});
