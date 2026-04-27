import { defineType, defineField } from 'sanity';

export const event = defineType({
  name: 'event',
  title: 'Ankündigung / Event',
  type: 'document',
  fields: [
    defineField({ name: 'titel', title: 'Titel', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'text', title: 'Beschreibung (optional)', type: 'string' }),
    defineField({ name: 'datum', title: 'Datum (optional, z. B. 10. Mai 2026)', type: 'string' }),
    defineField({ name: 'aktiv', title: 'Im Banner anzeigen', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'titel', subtitle: 'datum' },
  },
});
