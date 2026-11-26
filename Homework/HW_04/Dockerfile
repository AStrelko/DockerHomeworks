# syntax=docker/dockerfile:1.7
FROM node:22.12.0-alpine3.20 AS build
WORKDIR /app

# Маніфести окремо зберігають кеш залежностей після зміни коду.
COPY package.json package-lock.json ./
# BuildKit cache mount повторно використовує npm-кеш між збірками.
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .
RUN npm run build

FROM nginx:1.27.3-alpine3.20 AS production
LABEL org.opencontainers.image.title="Escape Online" \
      org.opencontainers.image.description="Interactive quest platform" \
      org.opencontainers.image.version="2.0"
ENV APP_ENV=production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
