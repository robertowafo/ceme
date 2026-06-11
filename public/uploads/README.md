# Dossier d'Upload d'Images

Bienvenue dans votre dossier d'images personnalisé ! Vous pouvez téléverser (uploader) toutes vos images ici pour que l'application puisse les utiliser directement.

## 🚀 Comment ça marche ?

1. **Uploadez vos fichiers** directement dans ce dossier (`/public/uploads/`) via le navigateur de fichiers de votre espace de travail.
2. **Nommez vos images** de façon simple et claire, par exemple : `photo_culte.jpg`, `pastor_profile.png`, `evenement_jeunesse.jpg`.
3. **Faites-moi savoir** que vous avez ajouté une nouvelle image en me donnant son nom (ex: "Utilise l'image `pastor_profile.png` pour la page Équipe").

## 🔗 Comment y faire référence dans le code ?

Le dossier `/public` est servi de manière transparente par Vite à la racine de l'application. Vous ou moi pourrons afficher l'image à tout moment en utilisant simplement ce chemin d'accès relatif dans les balises `<img>` :

```html
<img src="/uploads/votre_image.jpg" ... />
```

*Remarque : Ne mettez pas `/public` dans le lien `src`, utilisez directement `/uploads/nom_de_l_image.ext`.*
