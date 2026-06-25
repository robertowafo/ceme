const SITE_URL = 'https://ceme-27o.pages.dev';

// Schema TelevisionStation — page d'accueil
export const tvStationSchema = {
  '@context': 'https://schema.org',
  '@type': 'TelevisionStation',
  name: 'Grâce TV',
  alternateName: 'Grace Television',
  url: SITE_URL,
  logo: `${SITE_URL}/logo-gracetv.png`,
  image: `${SITE_URL}/og-image.png`,
  slogan: 'La Bonne Nouvelle Partout Partout',
  description:
    'Chaîne de télévision chrétienne basée à Yaoundé, Cameroun. Diffusion 24/7 de cultes, sermons, études bibliques et musique chrétienne, partout.',
  foundingDate: '2011-03-14',
  founder: { '@type': 'Person', name: 'Rev. Dr Alphonse ESSOMBA BOUNOUGOU' },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Emombo Auberge, BP 6065',
    addressLocality: 'Yaoundé',
    addressRegion: 'Centre',
    addressCountry: 'CM',
  },
  broadcastAffiliateOf: { '@type': 'Organization', name: 'CREOLINK' },
};

// Schema WebSite
export const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Grâce TV',
  url: SITE_URL,
};

// Schema Person — fondateur (page À propos)
export const founderSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Rev. Dr Alphonse ESSOMBA BOUNOUGOU',
  jobTitle: 'Pasteur fondateur',
  worksFor: { '@type': 'Organization', name: 'Grâce TV' },
  affiliation: { '@type': 'Organization', name: "Chapelle de l'Éternel Mon Étendard" },
};

// Schema ReligiousOrganization — église CEME (page /eglise)
export const churchSchema = {
  '@context': 'https://schema.org',
  '@type': 'Church',
  name: "Chapelle de l'Éternel Mon Étendard",
  alternateName: 'CEME',
  url: `${SITE_URL}/eglise`,
  foundingDate: '2001-01-05',
  founder: { '@type': 'Person', name: 'Rev. Dr Alphonse ESSOMBA BOUNOUGOU' },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Emombo Auberge, BP 6065',
    addressLocality: 'Yaoundé',
    addressRegion: 'Centre',
    addressCountry: 'CM',
  },
};
