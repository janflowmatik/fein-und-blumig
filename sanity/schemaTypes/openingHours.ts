import { defineType, defineField } from 'sanity';

export const openingHours = defineType({
  name: 'openingHours',
  title: 'Öffnungszeiten',
  type: 'document',
  fields: [
    defineField({
      name: 'regularHours',
      title: 'Reguläre Öffnungszeiten',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'tag',
              title: 'Wochentag',
              type: 'string',
              options: {
                list: [
                  'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag',
                  'Freitag', 'Samstag', 'Sonntag',
                ],
              },
            }),
            defineField({ name: 'von', title: 'Von (z. B. 09:00)', type: 'string' }),
            defineField({ name: 'bis', title: 'Bis (z. B. 12:00)', type: 'string' }),
            defineField({ name: 'von2', title: 'Nachmittag von (optional)', type: 'string' }),
            defineField({ name: 'bis2', title: 'Nachmittag bis (optional)', type: 'string' }),
            defineField({ name: 'geschlossen', title: 'Geschlossen', type: 'boolean' }),
          ],
          preview: {
            select: { title: 'tag', subtitle: 'von' },
          },
        },
      ],
    }),
    defineField({
      name: 'specialHours',
      title: 'Sonder-Öffnungszeiten / Events',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Beschriftung (z. B. Sa. 9. Mai)', type: 'string' }),
            defineField({ name: 'von', title: 'Von', type: 'string' }),
            defineField({ name: 'bis', title: 'Bis', type: 'string' }),
            defineField({ name: 'note', title: 'Hinweis (z. B. Muttertag)', type: 'string' }),
            defineField({ name: 'aktiv', title: 'Anzeigen', type: 'boolean', initialValue: true }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'von' },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Öffnungszeiten' }),
  },
});
