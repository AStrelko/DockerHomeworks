# Базовий образ із Node.js для запуску React-застосунку через Vite.
FROM node:22-alpine
WORKDIR /app
RUN chown node:node /app
USER node

# Окреме копіювання залежностей дає змогу повторно використовувати кеш npm ci.
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci
COPY --chown=node:node . .

# Значення ARG доступне під час збірки; ENV залишається у створеному образі.
ARG APP_VERSION=1.0
LABEL org.opencontainers.image.title="THE SECRET SOCIETY" \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.description="Навчальний React-сайт закритого клубу" \
      org.opencontainers.image.authors="Андрій Стрелько"
ENV APP_MODE=training APP_VERSION="${APP_VERSION}"
EXPOSE 5173
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:5173').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["npm", "run", "dev"]
