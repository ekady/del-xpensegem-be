FROM node:20.19-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
USER node
WORKDIR /xpensegem
COPY --chown=node:node package.json .
COPY --chown=node:node pnpm-lock.yaml .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY --chown=node:node . .

FROM base AS build
USER node
ENV NODE_ENV=production
RUN pnpm build

FROM node:20.19.1-alpine AS production
USER node
WORKDIR /xpensegem
COPY --chown=node:node --from=build /xpensegem/node_modules ./node_modules
COPY --chown=node:node --from=build /xpensegem/dist ./dist
EXPOSE 3333
CMD [ "node", "dist/src/main.js" ]