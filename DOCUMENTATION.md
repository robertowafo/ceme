# Manuel Technique & Architecture de la Plateforme (CEME - Grâce TV)

Ce guide s'adresse aux développeurs reprenant le projet. Il présente en détail la structure globale, l'architecture technique, les flux de données dynamiques ainsi que les directives d'évolution pour maintenir ou étendre l'application sans difficulté.

---

## 🏛️ Vue d'Ensemble & Stack Technique

La plateforme est une application web **Full-stack moderne** alliant la réactivité d'un Front-end interactif à la sécurité d'un serveur mandataire Back-end.

*   **Front-end** : React (v18), TypeScript, Vite (compilateur / bundler), Tailwind CSS (style utilitaire), Lucide-react (icônes vectorielles) et Motion (transitions et micro-animations).
*   **Back-end** : Serveur Express (Node.js/TypeScript) configuré pour proxyfier de manière sécurisée les requêtes vers l'API YouTube Data v3, évitant ainsi d'exposer la clé primaire de développement (`YOUTUBE_API_KEY`) au navigateur client.
*   **Base de Données / API Externe** : YouTube Data API v3 servant de système de gestion de contenu (CMS) temps réel (vidéos, cultes directs, replays et playlists).

---

## 📁 Structure du Projet et Arborescence

Voici la cartographie complète des fichiers pour localiser rapidement les éléments :

```text
├── .env                  # Variables d'environnement locales (clé API, etc.) (Hors Git)
├── .env.example          # Gabarit des variables requises en production / dev
├── package.json          # Définition des dépendances npm et des scripts système
├── tsconfig.json         # Configuration globale du compilateur TypeScript
├── server.ts             # Serveur de production et d'API Express (Serveur mandataire)
├── vite.config.ts        # Configuration du compilateur et du middleware de développement Vite
├── index.html            # Point d’entrée HTML brut servi au navigateur
│
└── src/
    ├── main.tsx          # Initialisation de React et point d'ancrage dans le DOM
    ├── App.tsx           # Config des routes déclaratives React Router (BrowserRouter)
    ├── index.css         # Styles globaux, polices Google (Inter, Space Grotesk) et imports Tailwind
    │
    ├── components/       # Composants graphiques modulaires réutilisables
    │   ├── TestimonialCross.tsx   # Croix dorée interactive (Section témoignages sous forme de croisillon)
    │   └── layout/                # Conteneurs et barres de navigation globales
    │       ├── Navbar.tsx         # Barre de navigation en-tête intelligente
    │       ├── Footer.tsx         # Pied de page avec liens d'accès et d'histoire
    │       └── RootLayout.tsx     # Enveloppe de structure de page (Header/Footer + Outlet réactif)
    │
    └── pages/            # Écrans principaux associés aux routes
        ├── Home.tsx      # Accueil immersif, cultes à venir, présentation
        ├── About.tsx     # Histoire de l'église, photo du Révérend Essomba, fiches de vision
        ├── Live.tsx      # Page Direct active : Retransmission Culte direct ou Web-TV h24 VMix
        ├── Sermons.tsx   # Médiathèque dynamique et asynchrone reliée aux catégories de playlists
        ├── Schedule.tsx  # Calendrier hebdomadaire et mensuel des temps de prière
        ├── Prayer.tsx    # Formulaire de requêtes de prières orienté intercession
        ├── JoinUs.tsx    # Portails pour s'inscrire aux ministères locaux ou de jeunesse
        ├── Give.tsx      # Formulaire de dîmes, dons (Mobile Money, Virement) sécurisé
        ├── Blog.tsx      # Flux d'édification spirituelle et nouvelles
        └── Contact.tsx   # Formulaire de contact, géolocalisation et ralliement physique
```

---

## ⚙️ Architecture Full-Stack & Flux de Données

Afin de préserver la sécurité de la clé API YouTube (`AIzaSy...`) et d'assurer des performances maximales sans subir de blocages de quota (*Rate Limits*), le serveur implémente une passerelle de données intelligente.

```
┌─────────────────┐        Requête API        ┌──────────────┐        Requête GraphQL/JSON      ┌──────────────────┐
│  FRONT-END (UI) ├──────────────────────────>│  SERVEUR API ├─────────────────────────────────>│  YOUTUBE API v3  │
│  (React/Vite)   │<──────────────────────────┤ (Express.ts) │<─────────────────────────────────┤ (Google Servers) │
└─────────────────┘       Données JSON        └──────┬───────┘          Données brutes          └──────────────────┘
                            Formates                 │
                                                     ▼
                                            ┌────────────────┐
                                            │ CACHE INTERNE  │
                                            │  (TTL: 15 min) │
                                            └────────────────┘
```

### 1. Le Serveur Mandataire (`server.ts`)
Situé à la racine, le fichier instancie une application Express écoutant sur le port de conteneur standard `3000`. Ses rôles principaux sont :
1.  **Résolution du Canal** : À partir de l'identifiant personnalisé de la chaîne (`@gracetelevision-hc4tv`), le service convertit de façon automatique le handle en identifiant brut grâce à la méthode `forHandle`, et extrait la playlist maîtresse d'envois (*uploads*).
2.  **Mise en cache temporaire** : Un cache en mémoire avec une durée de vie (TTL) de 15 minutes évite d'appeler l'API YouTube à chaque chargement d'utilisateur, conservant les quotas de requête intacts.
3.  **Filtrage Intelligent des Prédicateurs** : Le serveur analyse de manière sémantique les titres des vidéos pour attribuer dynamiquement le prédicateur :
    *   Si présence de "Marie Charlotte", "Maman Marie" etc. ➔ `Maman Marie Charlotte ESSOMBA`.
    *   Si présence de "Alphonse", "Reverend", "Rev" etc. ➔ `Rev. Dr. Alphonse ESSOMBA`.
    *   Cas générique ➔ `Rev. Dr. Alphonse ESSOMBA` (Valeur par défaut idéale).

### 2. Les Points de Terminaison (API Routes)

Actuellement, le serveur expose les trois points de terminaison suivants au client React :

*   `/api/youtube/live` : Examine si un événement en direct est actif sur la chaîne. S'il n'y a pas de direct à l'instant T, il retourne le dernier enregistrement en direct ou la vidéo la plus récente comme sauvegarde esthétique pour que l'écran ne soit jamais vide.
*   `/api/youtube/playlists` : Récupère l'intégralité des playlists publiques créées par la chaîne. Ces playlists servent de catégories d'exploration dans le volet sermons.
*   `/api/youtube/sermons` : Télécharge le flux d'envois récents (jusqu'à 50 sermons réels) et les cartographie avec leurs métadonnées : titre, description, date de parution, vignette haute résolution, identifiant unique de lecture YouTube, et l'enseignant associé.

---

## 📺 Système de Diffusion : Direct & Web-TV Continue H24

La page de diffusion (`src/pages/Live.tsx`) dispose de deux onglets innovants conçus pour le confort des fidèles :

### Onglet A : Le Direct Officiel
Il se synchronise en temps réel sur la route `/api/youtube/live`.
*   **Si la régie lance un direct sur YouTube** : Le badge passe au rouge clignotant (`RETRASTRANSMISSION EN DIRECT`) et l'application charge immédiatement l'iframe de diffusion native en direct.
*   **Si la régie est hors ligne** : L'écran affiche un panneau temporaire invitant à s'abonner et montrant une icône d'état d'attente prophétique, évitant de charger des iframes erronées.

### Onglet B : La Web-TV Continue H24 (Intégration VMix / Flux HHL)
Afin de pouvoir diffuser du contenu édifiant sans interruption, une Web-TV h24 a été ajoutée. Elle accepte une configuration souple pilotée par la régie technique du CEME :
*   **Intégration d'iframe VMix personnalisée** : Un bouton de configuration (`⚙ Configurer le flux`) est disponible sur l'onglet H24 pour les administrateurs.
*   **Persistance locale saine** : Le lien de flux saisi est stocké dans le stockage navigateur (`localStorage` sous la clé `ceme_h24_vmix_url`). Le site s'adapte en temps réel à l'URL entrée.
*   **Extraction automatique d'identifiant** : Un filtre d'URL (`getEmbedUrl`) analyse le texte fourni : si le développeur colle un code d'iframe brut, un lien de partage de vidéo classique ou un lien de diffusion YouTube classique, le filtre extrait de façon transparente la bonne adresse de retransmission (`embed`) pour éviter les erreurs d'affichage.

---

## 📖 Détails des Pages Front-end

1.  **Acceuil (`Home.tsx`)** : Vitrine visuelle. Elle affiche le verset d'ancrage (Exode 17:11-15), introduit le triptyque de la vision chrétienne du CEME, et oriente l'utilisateur vers le signal en direct ou les actions d'engagement communautaire.
2.  **Histoire et Vision (`About.tsx`)** : Contient l'historique de fondation de la chapelle (2001), et la fameuse photo officielle du Révérend Dr Alphonse ESSOMBA BOUNOUNGOU (chargée depuis les ressources stables sous le chemin `/uploads/reverand_essomba.png`).
3.  **Sermons chrétiens (`Sermons.tsx`)** : Une médiathèque avancée qui a éliminé tous les contenus fictifs. Elle présente à présent les contenus réels provenant de *Grâce TV*. Les filtres déroulants permettent de trier les messages par Playlists (les séries) et par Prédicateurs de manière 100% dynamique.
4.  **Calendrier (`Schedule.tsx`)** : Agenda des activités récurrentes (Intercession du lundi, Culte d'élévation du dimanche, Veillée des sentinelles).
5.  **Formulaires (`Prayer.tsx`, `JoinUs.tsx`, `Contact.tsx`)** : Points de contact interactifs avec validation de champs TypeScript et feedbacks esthétiques par notifications animées.
6.  **Dîmes & Offrandes (`Give.tsx`)** : Interface claire et sécurisée listant les canaux de contribution (Orange Money, MTN Mobile Money, Virement bancaire Express Union) avec fiches d'instructions pas à pas.

---

## 🛠️ Instructions pour les Développeurs Futures

### 1. Variables d'Environnement
Afin de changer de chaîne ou de configurer de nouvelles clés API en production, ajoutez toujours les variables dans le panneau de configuration / réglages de l'hébergeur (Cloud Run, Netlify, etc.) ou dans le fichier local `.env` :

```env
# Clé YouTube Data API v3 (Actuelle configurée : Grâce TV)
YOUTUBE_API_KEY="AIzaSy..."
```

### 2. Démarrage en Mode Développement
Pour lancer le serveur Express avec rechargement automatique de concert avec le middleware de développement Vite :
```bash
npm run dev
```

### 3. Compilation et Build de Production
Le projet utilise un processus de bundle optimisé en deux étapes définies dans le fichier `package.json` :
1.  Vite compile l'intégralité du Front-end statique dans le sous-dossier `/dist`.
2.  `esbuild` prend le point d'entrée serveur `server.ts` et le compile en un fichier auto-suffisant autonome `dist/server.cjs` au format CommonJS, évitant ainsi de s'emmêler avec la gestion stricte des modules ES natifs de Node.js en production.

Pour exécuter le build complet :
```bash
npm run build
```
Le serveur final de production démarre ensuite par :
```bash
npm run start
```

### 4. Styles Graphiques & Thématique
La direction artistique repose sur des tons spirituels sobres et valorisants :
*   **Or Céleste** (`text-gold` / `#c5a880`) pour les boutons clés, surlignages, bordures de structure de croix et animations de focus.
*   **Bourgogne Profond** (`text-burgundy` / `#800020`) pour les encadrés d'honneur spirituelle et titrages alternatifs.
*   **Gris Profond & Off-White** pour une lecture confortable de jour comme de nuit sans fatiguer les yeux.

---

*Ce document fait foi de spécification d'architecture technique globale de la plateforme Grâce TV (CEME).*
