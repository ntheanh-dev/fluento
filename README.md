# Fluento / Luyenviet

Authoritative local setup guide for this repo.

The repo folder is named `fluento`, but the backend artifact, UI copy, Docker resources, and config mostly use `luyenviet`. This README treats them as the same app.

## What This Repo Contains

- `frontend/`: React 19 + Vite app
- `backend/`: Spring Boot 3.2 API
- `docker-compose.yml`: local Docker stack
- `backend/src/main/resources/application-hub.yml`: backend runtime config used by the Docker image
- `frontend/Dockerfile` + `frontend/nginx.conf`: frontend build and `/api` reverse proxy

## Recommended Local Setup

The Docker stack is the clearest working path in the current repo.

### Prerequisites

- Docker Desktop or a compatible Docker Engine + Compose setup

### Start The App

From the repo root:

```bash
docker-compose up --build
```

Run in the background if preferred:

```bash
docker-compose up --build -d
```

### Local URLs

- App: [http://localhost:1234](http://localhost:1234)
- Backend health through the frontend proxy: [http://localhost:1234/api/actuator/health](http://localhost:1234/api/actuator/health)

Notes:

- The frontend container exposes port `1234` on the host.
- The frontend proxies `/api/` to the backend container using `frontend/nginx.conf`.
- The backend container itself is not published directly to the host in `docker-compose.yml`.

## Environment And Secrets

`docker-compose.yml` includes defaults for several values, so the stack can start without a root `.env` file. If you need to override values, create a `.env` file in the repo root and define the variables used by `docker-compose.yml` and `backend/src/main/resources/application-hub.yml`.

Common variables referenced by the repo:

- `FRONTEND_DOMAIN`
- `CORS_ALLOWED_ORIGINS`
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SIGNER_KEY`
- `API_KEY_ENCRYPTION_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `OPENAI_API_KEY`
- `CHAT_MODEL`

Important repo note:

- `DOCKER_README.md` refers to `environment.example`, but that file is not present in this repo.

## Seeded Demo Credentials

The backend seeds one admin account on startup in `backend/src/main/java/com/nta/common/component/DataInitializer.java` if it does not already exist:

- Username: `admin123456`
- Password: `admin123`

What is **not** seeded by repo evidence:

- A normal demo user account
- Demo API keys
- Preloaded OAuth credentials for a local user flow

For a regular user account, use the register flow in the app UI.

## What Works After First Boot

- Landing page and app shell
- Registration and login endpoints
- Admin login with the seeded credentials above
- MySQL-backed persistence
- Frontend-to-backend API calls through `/api`

## Features That Need Additional Configuration

Some features depend on secrets or third-party services being configured:

- Google sign-in: requires Google OAuth client settings
- Avatar upload: requires Cloudinary config
- AI-backed practice generation and feedback: depends on the AI config in backend runtime plus user API keys managed in Profile
- Error reporting: Sentry is enabled in the `hub` profile when configured

## Database And Persistence

The local stack starts MySQL 8 and mounts:

- `./mysql_data` to persist MySQL data
- `./backend/src/main/resources/db` into MySQL init scripts

The backend also contains Flyway migration files under:

- `backend/src/main/resources/db/migration`

## Common Commands

Start:

```bash
docker-compose up --build
```

Stop:

```bash
docker-compose down
```

View logs:

```bash
docker-compose logs -f
```

Rebuild one service:

```bash
docker-compose build backend
docker-compose build frontend
```

## Troubleshooting

### App is up but login or AI features fail

Check missing secrets first:

- Google OAuth variables
- Cloudinary variables
- JWT/encryption variables
- AI-related variables

### Need a clean local database

Stop the stack and remove the local MySQL data directory used by Compose:

```bash
docker-compose down
```

Then remove `mysql_data/` manually if you want a full reset.

### Port mismatch with older docs

Use this README and `docker-compose.yml` as the source of truth for local setup. Some older docs still mention `3000` or direct host access to `8080`, but the current compose file exposes the app on `1234`.

