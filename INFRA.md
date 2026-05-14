# Infrastructure production — AGAPE

Ce document décrit l’architecture conteneurisée (Docker, Compose, Kubernetes) et le pipeline CI/CD. Les chemins métier **`/academy`** et **`/bible-strong`** sont servis par la même application Next.js ; en production tu peux en plus exposer **`academy.agape.com`** et **`bible.agape.com`** grâce au middleware et aux Ingress.

---

## 1. Prérequis

- **Docker** et **Docker Compose** (local).
- Un cluster **Kubernetes** (EKS, GKE, AKS, k3s, etc.) avec :
  - un **Ingress Controller** (ex. NGINX Ingress) ;
  - éventuellement **cert-manager** + un `ClusterIssuer` (ex. `letsencrypt-prod`) pour le TLS ;
  - des **Load Balancers** compatibles avec `Service` de type `LoadBalancer` (selon le cloud).
- Un projet **Supabase** (URL + clé anon).
- Un dépôt **GitHub** avec les secrets listés à la section 5.

---

## 2. Docker (image de production)

### 2.1 Dockerfile

- **Base** : `node:20-alpine`, étapes **deps** → **builder** → **runner**.
- **Build** : `output: "standalone"` (Next.js) pour ne copier que le strict nécessaire dans l’image finale.
- **Arguments de build** : `NEXT_PUBLIC_SUPABASE_*` et `NEXT_PUBLIC_SITE_URL` doivent être fournis au **build** (variables « publiques » intégrées au bundle client).

### 2.2 Build manuel

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..." \
  --build-arg NEXT_PUBLIC_SITE_URL="https://academy.agape.com" \
  -t agape:local .
```

### 2.3 Docker Compose (environnement proche de la prod)

1. Copier **`.env.docker.example`** vers **`.env.docker`** et renseigner les variables Supabase (et éventuellement `AGAPE_SUBDOMAIN_ROUTING=true` pour tester les hôtes locaux via `/etc/hosts`).
2. Lancer :

```bash
docker compose up --build
```

L’application écoute sur **http://localhost:3000**.

Optionnel — agrégation des logs dans un volume :

```bash
docker compose --profile logs up -d
```

---

## 3. Kubernetes (`infrastructure/k8s`)

Fichiers principaux :

| Fichier | Rôle |
|--------|------|
| `namespace.yaml` | Namespace `agape`. |
| `configmap.yaml` | Variables non secrètes (`NODE_ENV`, `NEXT_PUBLIC_SITE_URL`, `AGAPE_SUBDOMAIN_ROUTING`, hôtes Bible/Academy). |
| `secret.yaml` | **Modèle** : remplacer les valeurs `NEXT_PUBLIC_SUPABASE_*` avant `kubectl apply`, ou générer le Secret avec `kubectl create secret ...`. |
| `deployment.yaml` | 2 réplicas minimum, limites CPU/RAM, image **`AGAPE_IMAGE_PLACEHOLDER`** remplacée par le CI. |
| `service.yaml` | `LoadBalancer` port 80 → pods 3000. |
| `ingress-academy.yaml` | Hôte **`academy.agape.com`**, TLS `agape-tls`. |
| `ingress-bible.yaml` | Hôte **`bible.agape.com`**, TLS `agape-tls`. |
| `hpa.yaml` | Autoscaling horizontal (2 → 12 pods, CPU ~65 %, mémoire ~80 %). |
| `poddisruptionbudget.yaml` | Au moins 1 pod disponible lors des drain / mises à jour. |
| `certificate.yaml` | **Optionnel** (cert-manager) : certificat SAN pour les deux sous-domaines → secret `agape-tls`. |

### 3.1 Ordre d’application manuel

```bash
kubectl apply -f infrastructure/k8s/namespace.yaml
kubectl apply -f infrastructure/k8s/configmap.yaml
# Éditer ou créer le Secret de façon sûre, puis :
kubectl apply -f infrastructure/k8s/secret.yaml
kubectl apply -f infrastructure/k8s/poddisruptionbudget.yaml
# Remplacer AGAPE_IMAGE_PLACEHOLDER dans deployment, ou :
sed "s|AGAPE_IMAGE_PLACEHOLDER|ghcr.io/MON_ORG/MON_REPO:SHA|g" infrastructure/k8s/deployment.yaml | kubectl apply -f -
kubectl apply -f infrastructure/k8s/service.yaml
kubectl apply -f infrastructure/k8s/hpa.yaml
kubectl apply -f infrastructure/k8s/ingress-academy.yaml
kubectl apply -f infrastructure/k8s/ingress-bible.yaml
# Si cert-manager est installé :
kubectl apply -f infrastructure/k8s/certificate.yaml
```

Adapte les **hosts** et le **ClusterIssuer** dans les Ingress / Certificate à ton DNS réel (ex. `agape.com`).

### 3.2 Séparation du trafic Bible / Academy

1. **Sous-domaines** : avec `AGAPE_SUBDOMAIN_ROUTING=true` (ConfigMap), le **middleware** réécrit en interne :
   - `bible.agape.com` → chemins sous **`/bible-strong`**
   - `academy.agape.com` → chemins sous **`/academy`**
2. **En-têtes HTTP (Next.js)** — `next.config.ts` :
   - **`/bible-strong`** : `Cache-Control` public avec `s-maxage` élevé et `stale-while-revalidate` (priorité cache CDN / navigateur).
   - **`/academy`** : `private, no-cache, no-store, must-revalidate` (chargement dynamique du catalogue Supabase).
3. **Ingress** : timeouts un peu plus longs côté Bible ; le détail du cache HTTP reste porté par Next (section 2 ci-dessus).

Les chemins **`https://APP_DOMAIN/bible-strong`** et **`https://APP_DOMAIN/academy`** restent valides sur un seul domaine si tu ne configures pas les sous-domaines.

---

## 4. CI/CD — `.github/workflows/deploy.yml`

Déclenchement : push sur **`main`** ou **`master`**, ou exécution manuelle (**workflow_dispatch**).

### Job 1 — `test`

- `npm ci` → `npm run lint` → `npm run build` (garantit que le code passe avant toute image).

### Job 2 — `docker-push`

- Connexion à **GitHub Container Registry** (`ghcr.io`) avec `GITHUB_TOKEN`.
- Build multi-stage et push de l’image :  
  `ghcr.io/<propriétaire>/<dépôt>:<SHA_DU_COMMIT>`  
  (nom du dépôt en **minuscules**, exigence GHCR).

### Job 3 — `deploy-k8s` (optionnel)

- Exécuté **uniquement** si le secret **`KUBE_CONFIG`** est défini (contenu du fichier kubeconfig, en une seule variable — souvent encodé base64 selon la doc interne ; ici on suppose le YAML brut dans le secret, comme dans le workflow).
- Rendu du `deployment.yaml` (remplacement de **`AGAPE_IMAGE_PLACEHOLDER`** par l’image poussée au job précédent).
- `kubectl apply` sur les manifests listés dans le workflow, puis **`kubectl rollout status`**.

### Secrets GitHub recommandés

| Secret | Usage |
|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Build Docker / runtime. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Build Docker / runtime. |
| `NEXT_PUBLIC_SITE_URL` | Build Docker (URL canonique du site). |
| `KUBE_CONFIG` | Déploiement automatique Kubernetes (optionnel). |

**Packages** : pour `ghcr.io`, le workflow utilise `permissions: packages: write`. Les images du dépôt peuvent être **privées** : ajuster la visibilité dans les paramètres du package GitHub.

### Docker Hub ou Azure Container Registry

Le workflow actuel pousse **uniquement** vers **GHCR**. Pour Docker Hub ou ACR :

1. Dupliquer les étapes `docker/login-action` / `azure/docker-login` et `docker/build-push-action` avec le bon registre et les bons secrets ; **ou**
2. Après le push GHCR, utiliser `docker pull` + `docker tag` + `docker push` vers l’autre registre dans un job dédié.

---

## 5. DNS et TLS

1. Créer des enregistrements **A / CNAME** pour `academy.agape.com` et `bible.agape.com` pointant vers l’**IP ou le nom** du LoadBalancer de l’Ingress (ou du service, selon ton fournisseur).
2. Installer **cert-manager** et un **ClusterIssuer** Let’s Encrypt, puis appliquer **`certificate.yaml`** pour remplir le secret **`agape-tls`** utilisé par les deux Ingress.
3. Vérifier que la classe d’Ingress (`ingressClassName: nginx`) correspond à ton contrôleur (sinon remplacer par `traefik`, `azure/application-gateway`, etc.).

---

## 6. Vérifications post-déploiement

- `kubectl get pods -n agape`
- `kubectl get svc,ingress -n agape`
- Santé applicative : **`GET /api/health`** (liveness), **`GET /api/ready`** (readiness, vérifie la présence des variables Supabase côté serveur).
- Depuis un navigateur : `https://academy.agape.com` et `https://bible.agape.com` (avec routage middleware activé sur le cluster).

---

## 7. Sécurité — bonnes pratiques

- Ne **jamais** committer de vraies clés dans `secret.yaml` : utiliser **Sealed Secrets**, **External Secrets**, ou `kubectl create secret generic ... --from-literal=...`.
- Limiter l’accès au registre et au cluster (RBAC, comptes de service dédiés au CI).
- Réviser régulièrement les **limites** CPU/RAM du Deployment et les seuils du **HPA** selon la charge réelle.
