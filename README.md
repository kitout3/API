# Gestion d'émargement (statique)

Application front-end seule (HTML/CSS/JS) pour créer et gérer des événements d'émargement directement dans le navigateur (compatible GitHub Pages). Toutes les données restent dans `localStorage`.

## Fonctionnalités
- Création d'événement via un bouton « Nouvel événement » (aucune fenêtre automatique) avec capacité maximale optionnelle.
- Import Excel au format CRM attendu, avec validation des entêtes et résumé des doublons/ajouts.
- Statistiques en temps réel : inscrits, présents, taux de présence et de remplissage, capacité max, ajouts sur place.
- Gestion des présences : recherche, filtres, ajout manuel (UUID auto si ID vide), annulation d'émargement, scan QR codes (ID client seul).
- Export Excel filtré (tous, présents, absents, sur place).
- Réinitialisation locale pour repartir de zéro.

## Format Excel requis
L'application attend au minimum les colonnes suivantes :

- `ID d'inscription`
- `Contact`
- `Adresse email (Contact) (Relation)`

Les colonnes suivantes sont acceptées mais optionnelles (et conservées en métadonnées) :

- `Rôle principal`
- `Événement`
- `Créé le`
- `Gérant (Contact) (Relation)`
- `Créé le (Contact) (Relation)`
- `Statut (Contact) (Relation)`

> Si aucune capacité n'est fournie, elle est renseignée automatiquement avec le nombre de lignes importées.

## Démarrage
1. Ouvrir `index.html` dans un navigateur moderne (https requis pour l'accès caméra hors localhost).
2. Cliquer sur « Nouvel événement », renseigner les champs, puis importer le fichier Excel (XLS/XLSX) conforme au modèle ci-dessus.
3. Sauvegarder l'événement : les participants importés sont ajoutés, prêts à être recherchés, marqués présents, scannés, ou enrichis manuellement.
4. Exporter à tout moment depuis l'onglet « Exporter ».

## Dépendances embarquées
- [SheetJS](https://sheetjs.com/) pour l'import/export Excel.
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) pour la lecture continue de QR codes.

> Aucun backend n'est requis ; tout se déroule côté navigateur.
