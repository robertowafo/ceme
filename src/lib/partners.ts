/*
 * Partenaires de Grâce TV.
 * Ces données sont affichées dans la page /emissions, onglet "Partenaires".
 * TODO: remplacer par un fetch /api/partners quand l'endpoint admin sera prêt.
 */

export interface Partner {
  id       : string;
  name     : string;        // Nom complet du pasteur
  ministry : string;        // Nom du ministère / émission
  church   : string;        // Nom de l'église ou organisation
  location : string;        // Pays / ville
  bio      : string;        // Courte description
  youtube  : string;        // URL chaîne YouTube (ouvre dans nouvel onglet)
  website ?: string;        // Site web optionnel
  avatar  ?: string;        // Photo du pasteur (chemin /uploads/ ou URL)
}

export const PARTNERS: Partner[] = [
  {
    id      : 'houde',
    name    : 'Pasteur HOUDE',
    ministry: 'Église Nouvelle Vie',
    church  : 'Église Nouvelle Vie',
    location: 'Canada',
    bio     : "Fondateur et pasteur principal de l'Église Nouvelle Vie au Canada. Son ministère d'enseignement biblique et d'évangélisation touche des milliers de vies à travers le monde francophone.",
    youtube : 'https://www.youtube.com/@EgliseNouvelleVie',
    website : 'https://www.nouvellevie.com',
  },
  {
    id      : 'koffi',
    name    : 'Pasteur Raymon KOFFI',
    ministry: 'Club 700',
    church  : 'Club 700',
    location: 'Afrique francophone',
    bio     : "Animateur et responsable du Club 700, émission chrétienne qui diffuse la Bonne Nouvelle, des témoignages de guérison et des enseignements transformateurs à travers l'Afrique francophone.",
    youtube : 'https://www.youtube.com/@Club700',
  },
];
