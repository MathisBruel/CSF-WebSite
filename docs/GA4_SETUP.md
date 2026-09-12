# Configuration Google Analytics 4 (GA4)

## Vue d'ensemble

Ce guide explique comment configurer Google Analytics 4 avec authentification OAuth pour l'administration du site.

## Prérequis

- Un compte Google (Gmail/Google Workspace)
- Accès admin au site CSF
- Google Cloud Console

## Étape 1 : Créer un projet Google Cloud

1. Allez à [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet : "CSF Analytics"
3. Attendez que le projet soit créé

## Étape 2 : Activer les APIs Google Analytics

1. Dans Google Cloud Console, allez à **APIs & Services** → **Library**
2. Cherchez **Google Analytics Admin API** et activez-la
3. Cherchez **Google Analytics Reporting API** et activez-la

## Étape 3 : Créer les identifiants OAuth 2.0

1. Allez à **APIs & Services** → **Credentials**
2. Cliquez sur **Create Credentials** → **OAuth 2.0 Client ID**
3. Si demandé, configurez d'abord l'écran de consentement OAuth :
   - Type d'utilisateur : **External**
   - Remplissez les infos requises
   - Ajouter les scopes :
     - `https://www.googleapis.com/auth/analytics.readonly`
     - `https://www.googleapis.com/auth/analytics.edit`
   - Ajouter l'email admin comme testeur

4. Créez l'ID client OAuth 2.0 :
   - Type d'application : **Web application**
   - Nom : "CSF Analytics Admin"
   - Authorized redirect URIs : `https://votre-domaine.com/api/admin/ga-callback`
   - Cliquez sur **Create**

5. Téléchargez le JSON ou copiez :
   - **Client ID**
   - **Client Secret**

## Étape 4 : Configurer les variables d'environnement

Mettez à jour `.env` ou `.env.local` :

```
GOOGLE_CLIENT_ID="votre-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="votre-client-secret"
```

## Étape 5 : Créer une propriété Google Analytics

1. Allez à [Google Analytics](https://analytics.google.com/)
2. Créez un nouveau compte ou utilisez un existant
3. Créez une nouvelle propriété pour le site
4. Dans **Data Streams**, créez un flux Web
5. Récupérez le **Property ID** et **Measurement ID**

## Étape 6 : Configurer GA4 dans l'admin

1. Connectez-vous comme admin
2. Allez à **Administration** → **Google Analytics**
3. Cliquez sur **Se connecter avec Google**
4. Autorisez l'accès à Google Analytics
5. Entrez :
   - **Property ID** : ex. `12345678`
   - **Measurement ID** : ex. `G-XXXXXXXXXX`
6. Activez GA4 et enregistrez

## Étape 7 : (Optionnel) Configurer l'API Secret pour server-side events

Pour tracker les events côté serveur :

1. Dans GA4 → **Admin** → **Data Streams** → Select Web Stream
2. Scrollez jusqu'à **Measurement Protocol**
3. Cliquez sur **Create** pour générer un API Secret
4. Sauvegardez ce secret (vous ne pouvez pas le revoir)
5. Dans admin CSF, ajoutez-le aux settings (future implémentation)

## Événements tracés automatiquement

Le site track automatiquement :

- ✓ Page views et temps sur page
- ✓ Utilisateurs uniques et sessions
- ✓ Device, navigateur, OS, localisation
- ✓ Taux de rebond et engagement
- ✓ Événements personnalisés :
  - Registrations aux expositions
  - Uploads de documents
  - Mises à jour de profil
  - Ajouts de chats
  - Vues d'articles news

## Consentement RGPD

Un banner de consentement cookies s'affiche aux visiteurs. GA n'est activé que si l'utilisateur accepte.

## Dépannage

### "Unauthorized" lors de la connexion OAuth
- Vérifiez que l'email admin est ajouté comme testeur sur l'écran de consentement OAuth
- Vérifiez que l'utilisateur a le rôle ADMIN

### GA4 ne collecte pas de données
- Vérifiez que le Measurement ID est correct
- Attendez 24h pour que GA4 commence à afficher les données
- Vérifiez que l'utilisateur a accepté le banner de consentement

### "Invalid redirect URI"
- Vérifiez que `NEXT_PUBLIC_APP_URL` dans l'env match l'URI dans Google Cloud Console
- L'URI doit être exact : `https://domain.com/api/admin/ga-callback`

## Documentation officielle

- [Google Analytics 4 Setup](https://support.google.com/analytics/answer/10089681)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GA4 Admin API](https://developers.google.com/analytics/devguides/config/admin/v1)
