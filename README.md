# Agape

Application Next.js + Supabase + PWA pour l'ecosysteme Agape.

## Deploiement simple via fork GitHub

1. Forkez ce repository sur votre compte GitHub.
2. Dans votre fork, gardez `master` comme branche de production.
3. Sur Vercel, cliquez sur `Add New Project` puis importez votre fork GitHub.
4. Ajoutez les variables d'environnement de `.env.example` dans Vercel.
5. Lancez les migrations SQL Supabase du dossier `supabase/migrations/`.
6. Deployez.

## Variables d'environnement

Copiez `.env.example` vers `.env.local` en local.

Variables minimales (Vercel → Settings → Environment Variables) :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (serveur uniquement — inscription `/join`, profils publics)
- `NEXT_PUBLIC_SITE_URL` (URL Vercel en prod, ex. `https://votre-projet.vercel.app`)

Supabase → Authentication → Redirect URLs : ajoutez `https://votre-projet.vercel.app/auth/callback`.

Après le premier déploiement, testez `https://votre-projet.vercel.app/join` (inscription).

## Avant de deployer

Lancez :

```bash
npm install
npm run deploy:check
npm run build
```

Le script `deploy:check` verifie les assets de marque et rappelle les prerequis de deploiement.

## Connexion Vercel

- Framework : `Next.js`
- Build command : `npm run build`
- Install command : `npm install`
- Production branch : `master`

## Installation sur smartphone sans store

### iPhone / iPad

1. Ouvrez le site deploye dans Safari.
2. Appuyez sur `Partager`.
3. Choisissez `Sur l'ecran d'accueil`.
4. Validez.

L'application s'installera avec son icone PWA Apple sans passer par l'App Store.

### Android

1. Ouvrez le site dans Chrome.
2. Appuyez sur `Installer l'application` ou `Ajouter a l'ecran d'accueil`.
3. Validez.

## Branding

- Logo officiel : `public/agape-logo-final.png`
- Avatar professionnel : `public/agape-profile-pro.svg`
- Favicon et icones PWA : routes `app/branding/*`

Si votre export Windows a cree `agape-logo-final.png.png`, l'application le tolere aussi automatiquement, mais le nom recommande reste `agape-logo-final.png`.

Vous pouvez reutiliser `agape-profile-pro.svg` comme image de profil sur GitHub, Vercel ou dans vos supports de communication.
