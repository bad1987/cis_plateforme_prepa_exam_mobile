# Plateforme de Préparation aux Examens - Frontend

Ce document explique comment configurer et démarrer le frontend de la plateforme de préparation aux examens.

## Prérequis

- Node.js (v14 ou supérieur)
- npm (v6 ou supérieur)
- Expo CLI
- Backend de l'application déjà configuré et en cours d'exécution

## Installation

1. Clonez le dépôt et accédez au dossier frontend :

```bash
git clone https://github.com/votre-utilisateur/plateforme_prepa_exam.git
cd plateforme_prepa_exam/frontend
```

2. Installez les dépendances :

```bash
npm install
```

3. Créez un fichier `.env` à la racine du dossier frontend.

**Important** : Pour connaître l'adresse IP à utiliser dans le fichier `.env`, démarrez d'abord le serveur Expo :

```bash
npx expo start
```

Vous verrez une sortie similaire à celle-ci :
```
› Metro waiting on exp://192.168.1.5:19000
```

Notez l'adresse IP (dans cet exemple, `192.168.1.5`). Arrêtez le serveur Expo (Ctrl+C) et créez le fichier `.env` avec le contenu suivant :

```
API_URL=http://192.168.1.5:3000/api
```

Remplacez `192.168.1.5` par l'adresse IP affichée dans votre terminal. Cette configuration est nécessaire car le frontend et le backend seront testés sur la même machine.

## Démarrage de l'application

1. Assurez-vous que le backend est en cours d'exécution.

2. Démarrez l'application frontend :

```bash
npx expo start
```

3. Vous pouvez maintenant :
   - Scanner le code QR avec l'application Expo Go sur votre appareil Android ou iOS
   - Appuyer sur `a` pour ouvrir l'application sur un émulateur Android
   - Appuyer sur `i` pour ouvrir l'application sur un simulateur iOS
   - Appuyer sur `w` pour ouvrir l'application dans un navigateur web

## Fonctionnalités principales

L'application mobile offre les fonctionnalités suivantes :

### Authentification

- Inscription d'un nouvel utilisateur
- Connexion d'un utilisateur existant
- Réinitialisation de mot de passe

### Navigation principale

- **Accueil** : Affiche un résumé des activités récentes et des examens disponibles
- **Examens** : Liste tous les examens disponibles
- **Ressources** : Fournit des ressources d'étude et des conseils
- **Profil** : Gère les informations de l'utilisateur et affiche l'historique des quiz

### Préparation aux examens

- Parcourir les examens et les matières
- Consulter les questions par matière
- Lire les notes de cours
- Passer des quiz interactifs
- Voir les résultats détaillés des quiz
- Suivre les progrès via l'historique des quiz

## Comptes de test

Vous pouvez utiliser les comptes suivants pour tester l'application :

1. **Compte étudiant 1** :
   - Email : etudiant1@example.com
   - Mot de passe : etudiant123

2. **Compte étudiant 2** :
   - Email : etudiant2@example.com
   - Mot de passe : etudiant123

## Dépannage

Si vous rencontrez des problèmes lors de la configuration ou de l'exécution du frontend, voici quelques solutions courantes :

1. **Erreur de connexion à l'API** : Vérifiez que le backend est en cours d'exécution et que l'adresse IP dans le fichier `.env` est correcte.

2. **Erreur "User not found"** : Assurez-vous que vous utilisez un compte valide et que le backend est correctement configuré.

3. **Problèmes d'affichage** : Si certains éléments ne s'affichent pas correctement, essayez de redémarrer l'application ou de vider le cache :
   ```bash
   npx expo start -c
   ```

4. **Erreurs d'installation** : Si vous rencontrez des erreurs lors de l'installation des dépendances, essayez de supprimer le dossier `node_modules` et le fichier `package-lock.json`, puis réinstallez :
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

Pour toute autre question ou problème, n'hésitez pas à ouvrir une issue sur le dépôt GitHub du projet.
