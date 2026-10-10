# Nightly worker image (Render cron). Build from the repo root:
#   docker build -f apps/worker/Dockerfile -t fluentloop-worker .
FROM node:22-slim
RUN corepack enable
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile --prod --filter "@fluentloop/worker..." \
    && chown -R node:node /repo
ENV NODE_ENV=production
USER node
CMD ["pnpm", "--filter", "@fluentloop/worker", "nightly"]
