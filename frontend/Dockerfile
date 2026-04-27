# Build-only image for React frontend static assets
FROM node:18-alpine AS build

WORKDIR /app

ENV VITE_API_URL=/api
ENV VITE_GOOGLE_CLIENT_ID=940316326175-8jma9br9b2j1cjgqu992v3a693euvr6c.apps.googleusercontent.com
ENV VITE_GOOGLE_REDIRECT_URI=https://luyenviet.online/oauth/authenticate
ENV VITE_GOOGLE_AUTH_URI=https://accounts.google.com/o/oauth2/v2/auth
ENV VITE_SITE_URL=https://luyenviet.online

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime artifact image: only includes built static files.
# This image is intended to be used by a one-shot container that copies
# `/app/dist` into a shared volume for a dedicated nginx service.
FROM alpine:3.20

WORKDIR /app
COPY --from=build /app/dist /app/dist
CMD ["sh", "-c", "echo 'Frontend static image ready at /app/dist' && ls -la /app/dist"]
