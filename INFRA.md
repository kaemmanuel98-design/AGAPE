# Infrastructure — AGAPE (Docker & déploiement)

Ce document est pensé pour être **clair pour un profil Data / ops** : commandes exactes, ordre des étapes, et où regarder en cas de problème.

---

## 1. Build de l’image Docker

À la racine du dépôt :

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="https://VOTRE-PROJET.supabase.co" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="VOTRE_CLE_ANON" \
  --build-arg NEXT_PUBLIC_SITE_URL="http://localhost:3000" \
  -t agape-app .
```

- **`-t agape-app`** : nom local de l’image (tu peux ajouter un tag, ex. `agape-app:1.0.0`).
- Les variables **`NEXT_PUBLIC_*`** doivent être présentes **au build** : elles sont intégrées au bundle client Next.js.

Sans `docker-compose`, lancer un conteneur à la main :

```bash
docker run --rm -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="https://…" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="…" \
  agape-app
```

---

## 2. Lancer l’application avec Docker Compose

1. Copier **`.env.docker.example`** vers **`.env.docker`** et remplir au minimum `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, et **`SUPABASE_SERVICE_ROLE_KEY`** si tu utilises l’inscription avec photo ou les pages **`/profile/[id]`** (voir migration `020_member_avatars.sql`).
2. Depuis la racine du projet :

```bash
docker compose up --build
```

- L’app est exposée sur **http://localhost:3000**.
- Le service **`agape-web`** inclut un **`healthcheck`** : Docker interroge régulièrement `GET /api/health` ; tant que le conteneur n’est pas « healthy », les services qui dépendent de lui (ex. profil `logs` avec Vector) ne démarrent pas.

Arrêt propre : `Ctrl+C` ou, en arrière-plan, `docker compose down`.

---

## 3. Logs et débogage

### Logs du conteneur applicatif

```bash
docker compose logs -f agape-web
```

Dernières lignes sans suivre le flux :

```bash
docker compose logs --tail=200 agape-web
```

### Logs Docker « moteur » (hors Compose)

Si tu as lancé l’image avec `docker run` :

```bash
docker logs -f <id_ou_nom_du_conteneur>
```

### Profil optionnel « agrégation »

Pour archiver les logs du conteneur `agape-web` dans un volume (fichiers NDJSON) :

```bash
docker compose --profile logs up -d
```

---

## 4. Fichiers utiles (référence rapide)

| Fichier | Rôle |
|---------|------|
| `Dockerfile` | Build multi-étape (**deps** → **builder** → **runner**), image `node:20-alpine`, healthcheck intégré dans l’image. |
| `docker-compose.yml` | Service **`agape-web`** (port **3000**), variables d’environnement, **healthcheck** Compose. |
| `.env.docker.example` | Modèle des variables pour la copie vers `.env.docker`. |

---

## 5. Routes applicatives (éviter les 404)

Ces chemins sont prévus **sans** préfixe de langue dans l’URL (middleware Next.js + layouts dédiés) :

| Route | Fichier principal |
|--------|-------------------|
| `/academy` et `/academy/[id]` | `app/academy/page.tsx`, `app/academy/[id]/page.tsx` |
| `/bible-strong` | `app/bible-strong/page.tsx` (+ `app/bible-strong/[verseId]/page.tsx` pour un verset) |
| `/rejoindre` | `app/rejoindre/page.tsx` (redirection depuis `app/[locale]/rejoindre` vers `/rejoindre`) |
| `/profile/[id]` | `app/profile/[id]/page.tsx` (espace membre après inscription ; requiert `SUPABASE_SERVICE_ROLE_KEY` côté serveur) |

---

## 6. Kubernetes et CI/CD (rappel)

Les manifests YAML vivent dans **`infrastructure/k8s/`** (déploiement, service, ingress, HPA, etc.). Le workflow GitHub **`.github/workflows/deploy.yml`** enchaîne tests, build d’image **GHCR** et déploiement optionnel si le secret **`KUBE_CONFIG`** est défini.

Pour le détail (ordre des `kubectl apply`, DNS, TLS), voir les commentaires dans les fichiers du dossier `infrastructure/k8s/` et le workflow ci-dessus.

---

## 7. Dépannage express

| Symptôme | Piste |
|----------|--------|
| Build Docker échoue sur `npm run build` | Lancer `npm run build` sur ta machine avec les mêmes `NEXT_PUBLIC_*` pour voir l’erreur TypeScript / Next. |
| Conteneur « unhealthy » | `docker compose logs agape-web` puis vérifier que `/api/health` répond (et que le port 3000 est libre sur l’hôte). |
| Page blanche / 503 sur `/api/ready` | Variables Supabase manquantes ou incorrectes dans `.env.docker`. |
