# Multi-stage build for React frontend
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

FROM nginx:alpine

RUN apk add --no-cache curl

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -fsS http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
