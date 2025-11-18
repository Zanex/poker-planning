# GitHub Actions Setup Guide

## 1. Crea Repository

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/poker-planning.git
git push -u origin main
```

## 2. Cloudflare API Token

1. Vai su [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Crea nuovo token → "Edit Cloudflare Workers" template
3. Permessi necessari:
   - Account > Cloudflare Pages > Edit
   - Account > Workers Scripts > Edit
   - Account > D1 > Edit

## 3. GitHub Secrets

Vai su **Settings → Secrets and variables → Actions** e aggiungi:

### Required Secrets

```
CLOUDFLARE_API_TOKEN
Your Cloudflare API token from step 2

VITE_API_URL
https://poker-planning.YOUR_SUBDOMAIN.workers.dev

VITE_WS_URL
wss://poker-planning.YOUR_SUBDOMAIN.workers.dev
```

## 4. Cloudflare Pages Project

Crea il progetto Pages:

```bash
cd frontend
npx wrangler pages project create poker-planning-frontend
```

## 5. Workflow Files

I workflow sono già configurati:

- **deploy.yml** - Deploy automatico su push a `main`
- **ci.yml** - Lint e build check su PR
- **preview.yml** - Preview deployment per PR
- **dependabot.yml** - Auto-update dependencies

## 6. Branch Protection (Opzionale)

Settings → Branches → Add rule per `main`:
- ✅ Require status checks (CI must pass)
- ✅ Require pull request reviews
- ✅ Require branches to be up to date

## 7. First Deploy

```bash
# Crea branch develop per testing
git checkout -b develop
git push -u origin develop

# Merge to main per deploy production
git checkout main
git merge develop
git push
```

## Workflow Triggers

### Deploy (main branch)
- Push to `main` → Auto-deploy Worker + Frontend

### CI (PR)
- Apri PR → Type check + Build test
- Blocca merge se fallisce

### Preview (PR)
- Apri/aggiorna PR → Deploy preview environment
- Commenta PR con preview URL

## Monitoring

Controlla deploy:
- **Actions tab** su GitHub
- **Workers & Pages** su Cloudflare Dashboard

## Rollback

Se serve rollback:

```bash
# Frontend (Cloudflare Pages)
wrangler pages deployment list --project-name=poker-planning-frontend
wrangler pages deployment rollback <DEPLOYMENT_ID>

# Worker
wrangler rollback
```

## Troubleshooting

**Deploy fallisce: "API token invalid"**
→ Rigenera token con permessi corretti

**Build frontend fallisce: "env vars missing"**
→ Verifica VITE_* secrets in GitHub

**Worker deploy fallisce: "D1 database not found"**
→ Crea database: `wrangler d1 create poker_history`
→ Aggiorna `database_id` in `wrangler.toml`

## Local Development

Gli Actions non influenzano il dev locale:

```bash
# Terminal 1: Worker
cd worker && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```