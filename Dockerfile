FROM node:20-alpine as base
WORKDIR /app

FROM base as builder

WORKDIR /app
COPY package.json pnpm*.yaml ./
RUN npm install -g pnpm \
  && pnpm install --frozen-lockfile

# set these only for build
ENV NEXTAUTH_URL="http://localhost:3000"
ENV NEXTAUTH_SECRET="--secret--"
ENV GOOGLE_CLIENT_ID="--google-client-id--"
ENV GOOGLE_CLIENT_SECRET="--google-client-secret--"
ENV DATABASE_URL=postgres://localhost:5432/database
ENV MAOS_CORE_URL=http://localhost:5000/

# Build next.js app
ADD . /app
RUN pnpm run build
RUN npx tsup src/drizzle/migrate.ts

# Build the production image
FROM base

RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/dist/migrate.cjs ./migrate.cjs
ADD ./src/drizzle ./drizzle
ADD ./bin/launch.sh ./launch.sh
ADD ./bin/migrate.sh ./migrate.sh

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["./launch.sh"]
