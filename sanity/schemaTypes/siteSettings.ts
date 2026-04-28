import { defineType, defineField } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Website-Einstellungen',
  type: 'document',
  fields: [
    defineField({ name: 'shopName', title: 'Shop-Name', type: 'string' }),
    defineField({ name: 'telefon', title: 'Telefon', type: 'string' }),
    defineField({ name: 'email', title: 'E-Mail', type: 'string' }),
    defineField({ name: 'strasse', title: 'Straße / Adresszusatz', type: 'string' }),
    defineField({ name: 'plz', title: 'PLZ', type: 'string' }),
    defineField({ name: 'ort', title: 'Ort', type: 'string' }),
    defineField({ name: 'instagramUrl', title: 'Instagram-Profil-URL', type: 'url' }),
    defineField({
      name: 'formspreeEndpoint',
      title: 'Formspree Endpunkt-ID',
      type: 'string',
      description: 'z. B. mpqynkld (nur die ID, nicht die vollständige URL)',
    }),
  ],
  preview: {
    select: { title: 'shopName' },
  },
});
