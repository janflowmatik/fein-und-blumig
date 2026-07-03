import { defineType, defineField } from 'sanity';

export const infoButton = defineType({
  name: 'infoButton',
  title: 'Info-Hinweise (Hurtig-Markt)',
  type: 'document',
  fields: [
    defineField({
      name: 'aktiv',
      title: 'Info-Button & Banner anzeigen',
      description: 'Schaltet die Info-Pill (Hero + Öffnungszeiten) und das Banner unter den Leistungen gemeinsam an/aus.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'pillText',
      title: 'Text des Info-Buttons',
      description: 'Erscheint als Pill im Hero (unter dem Button) und bei den Öffnungszeiten.',
      type: 'string',
      initialValue: 'Zeit verpasst? Jetzt auch 24/7 im Hurtig-Markt in Steinfeld!',
      validation: (R) => R.max(120),
    }),
    defineField({
      name: 'bannerText',
      title: 'Banner-Text unter den Leistungen',
      type: 'text',
      rows: 3,
      initialValue:
        'Liebe Kunden, sie finden unsere Produkte und Gutscheine nun auch 24/7 im Hurtig-Markt in Steinfeld. Viel Freude damit!',
    }),
  ],
  preview: {
    select: { title: 'pillText', aktiv: 'aktiv' },
    prepare({ title, aktiv }) {
      return {
        title: 'Info-Hinweise',
        subtitle: `${aktiv ? '🟢 Aktiv' : '⚪️ Aus'} · ${title ?? ''}`,
      };
    },
  },
});
