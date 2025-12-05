# Gestion d'émargement (statique)

Application front-end seule pour créer et gérer des événements d'émargement directement dans le navigateur (compatible GitHub Pages). Toutes les données sont stockées dans `localStorage`.

## Fonctionnalités principales
- Création et édition d'événements avec capacité, lieu et description.
- Import Excel (XLS/XLSX) des inscrits avec vérification des colonnes obligatoires `id_client`, `nom`, `email` et gestion des doublons.
- Liste d'événements filtrable (nom, dates, statut à venir/en cours/terminé).
- Tableau de bord d'un événement : statistiques temps réel (inscrits, présents, taux, ajouts sur place).
- Validation de présence : recherche, ajout manuel, marquage/annulation et scan de QR codes (via `html5-qrcode`).
- Export Excel des inscrits filtrés (tous, présents, absents, ajouts sur place).
- Réinitialisation rapide des données locales pour tester.

## Démarrage
1. Ouvrir `index.html` dans un navigateur moderne (desktop ou mobile). Aucun backend n'est requis.
2. Créer un événement depuis le bouton « Nouvel événement ».
3. Importer un fichier Excel (colonnes `id_client`, `nom`, `email` obligatoires) au moment de la création ou depuis l'onglet « Scanner/Liste/Exporter » de l'événement.
4. Ajouter des participants manuellement ou marquer leur présence via la liste ou le scanner QR.
5. Exporter les données depuis l'onglet « Exporter ».

## Dépendances front-end
- [SheetJS](https://sheetjs.com/) pour l'import/export Excel.
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) pour la lecture continue de QR codes.

> Note : pour l'usage caméra, le navigateur peut demander une autorisation. Sur certaines plateformes, l'accès caméra requiert le chargement de la page via `https` ou `localhost`.
