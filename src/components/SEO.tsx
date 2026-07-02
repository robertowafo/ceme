/**
 * Composant SEO réutilisable — s'appuie sur le hoisting natif des balises
 * document de React 19 (<title>, <meta>, <link> remontent automatiquement
 * dans le <head>). Aucune dépendance externe.
 */

const SITE_URL = 'https://ceme-27o.pages.dev';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

type SEOProps = {
  title: string;
  description: string;
  image?: string;
  /** Chemin canonique (ex. "/a-propos"). Par défaut: chemin courant. */
  path?: string;
  type?: 'website' | 'article' | 'video.other';
  structuredData?: object | object[];
};

export function SEO({ title, description, image = DEFAULT_IMAGE, path, type = 'website', structuredData }: SEOProps) {
  const pathname = path ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  const url = `${SITE_URL}${pathname}`;
  const absImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;
  const schemas = structuredData ? (Array.isArray(structuredData) ? structuredData : [structuredData]) : [];

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:site_name" content="Grâce TV" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absImage} />

      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
