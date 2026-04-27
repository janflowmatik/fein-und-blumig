import { defineType, defineField } from 'sanity';

export const homePage = defineType({
  name: 'homePage',
  title: 'Startseite',
  type: 'document',
  fields: [
    defineField({
      name: 'willkommenText',
      title: 'Willkommen-Text',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'ladenText',
      title: 'Der Laden – Text',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'wareText',
      title: 'Unsere Ware – Text',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'teamText',
      title: 'Das Team – Text',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero-Hintergrundbild',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'willkommenImage',
      title: 'Willkommen-Bild (3:4 Hochformat)',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'ladenGrossImage',
      title: 'Laden-Bild (groß)',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'galerieImages',
      title: 'Galerie-Bilder (max. 30)',
      type: 'array',
      validation: (Rule) => Rule.max(30),
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt-Text',
              type: 'string',
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Startseite' }),
  },
});
