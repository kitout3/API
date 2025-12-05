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
Application front-end seule pour créer et gérer des événements d'émargement directement dans le navigateur (compatible GitHub Pages). Toutes les données sont stockées dans `localStorage`.

## Fonctionnalités principales
- Création et édition d'événements avec capacité.
- Import Excel (XLS/XLSX) des inscrits au format CRM attendu (`ID d’inscription`, `Contact`, `Adresse email (Contact) (Relation)`) avec gestion des doublons.
- Création et édition d'événements avec capacité, lieu et description.
- Import Excel (XLS/XLSX) des inscrits avec vérification des colonnes obligatoires `id_client`, `nom`, `email` et gestion des doublons.
- Liste d'événements filtrable (nom, dates, statut à venir/en cours/terminé).
- Tableau de bord d'un événement : statistiques temps réel (inscrits, présents, taux, ajouts sur place).
- Validation de présence : recherche, ajout manuel, marquage/annulation et scan de QR codes (via `html5-qrcode`).
- Export Excel des inscrits filtrés (tous, présents, absents, ajouts sur place).
- Réinitialisation rapide des données locales pour tester.

## Démarrage
1. Ouvrir `index.html` dans un navigateur moderne (desktop ou mobile). Aucun backend n'est requis.
2. Créer un événement depuis le bouton « Nouvel événement » (la fenêtre ne s'affiche plus automatiquement ailleurs).
3. Importer un fichier Excel (colonnes `ID d’inscription`, `Contact`, `Adresse email (Contact) (Relation)` obligatoires). La capacité est renseignée automatiquement selon le nombre de lignes importées si aucun maximum n'est saisi.
2. Créer un événement depuis le bouton « Nouvel événement ».
3. Importer un fichier Excel (colonnes `id_client`, `nom`, `email` obligatoires) au moment de la création ou depuis l'onglet « Scanner/Liste/Exporter » de l'événement.
4. Ajouter des participants manuellement ou marquer leur présence via la liste ou le scanner QR.
5. Exporter les données depuis l'onglet « Exporter ».

## Dépendances front-end
- [SheetJS](https://sheetjs.com/) pour l'import/export Excel.
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) pour la lecture continue de QR codes.

> Note : pour l'usage caméra, le navigateur peut demander une autorisation. Sur certaines plateformes, l'accès caméra requiert le chargement de la page via `https` ou `localhost`.
