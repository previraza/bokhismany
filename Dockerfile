FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@12.16.1 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Étape dédiée aux migrations : elle conserve les scripts, le schéma et le CSV.
FROM build AS migrate
CMD ["node", ".output/server/index.mjs"]

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
