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

// Schema LocalBusiness — page Contact
export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'Church'],
  '@id': `${SITE_URL}/contact`,
  name: "Chapelle de l'Éternel Mon Étendard — Grâce TV",
  alternateName: ['CEME', 'Grâce TV'],
  url: SITE_URL,
  logo: `${SITE_URL}/logo-gracetv.png`,
  image: `${SITE_URL}/og-image.png`,
  description: "Chaîne de télévision chrétienne et église évangélique basée à Yaoundé, Cameroun. Diffusion 24/7, cultes, prières et programmes d'évangélisation.",
  email: 'contact@chapelle-eternel.org',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Emombo Auberge, BP 6065',
    addressLocality: 'Yaoundé',
    addressRegion: 'Centre',
    postalCode: 'BP 6065',
    addressCountry: 'CM',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 3.8667,
    longitude: 11.5167,
  },
  areaServed: { '@type': 'Country', name: 'Cameroun' },
  sameAs: [
    'https://www.youtube.com/@GraceTV',
  ],
};

// Helper BreadcrumbList
export function breadcrumbSchema(crumbs: { name: string; url?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      ...(c.url ? { item: `${SITE_URL}${c.url}` } : {}),
    })),
  };
}

// Helper BlogPosting
export function blogPostingSchema(post: {
  id: string; title: string; excerpt?: string;
  publishedAt: string; author: string; coverImage?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt ?? post.title,
    url: `${SITE_URL}/eglise/blog/${post.id}`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { '@type': 'Person', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'Grâce TV',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo-gracetv.png` },
    },
    image: post.coverImage ? (post.coverImage.startsWith('http') ? post.coverImage : `${SITE_URL}${post.coverImage}`) : `${SITE_URL}/og-image.png`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/eglise/blog/${post.id}` },
  };
}

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
