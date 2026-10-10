FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
# `prepare` runs scripts/install-git-hooks.mjs, which skips without git.
COPY scripts ./scripts
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.31.6-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
# Writes deployment-config.json (and the optional /api proxy) from env vars at container start.
COPY --chmod=755 docker/40-deployment-config.sh /docker-entrypoint.d/40-deployment-config.sh
COPY --from=build /app/dist/demo-angular/browser /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK CMD wget -qO- http://127.0.0.1/healthz || exit 1
