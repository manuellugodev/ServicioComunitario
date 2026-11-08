# Debian y no Alpine: las imágenes Alpine de Node 26 ya no ofrecen pg_dump 16.
FROM node:26-trixie-slim AS dependencias
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

# Aplica las migraciones y crea el primer administrador; termina al acabar.
FROM dependencias AS migrador
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed"]

FROM dependencias AS construccion
ENV NEXT_TELEMETRY_DISABLED=1
ENV SALIDA_STANDALONE=1
COPY . .
# Git no guarda carpetas vacías y public puede estarlo.
RUN mkdir -p public && npm run build

FROM node:26-trixie-slim AS app
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
# La versión de pg_dump debe ser la del servidor: un respaldo hecho con una
# versión más nueva no se puede restaurar con las herramientas de PostgreSQL 16.
ENV PG_DUMP_PATH=/usr/lib/postgresql/16/bin/pg_dump
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates postgresql-common \
  && /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh -y \
  && apt-get install -y --no-install-recommends postgresql-client-16 \
  && rm -rf /var/lib/apt/lists/*
COPY --from=construccion --chown=node:node /app/.next/standalone ./
COPY --from=construccion --chown=node:node /app/.next/static ./.next/static
COPY --from=construccion --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
