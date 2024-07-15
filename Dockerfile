FROM node:20-slim as base
WORKDIR /app
COPY package*.json ./

FROM base as builder
RUN apt-get update && \
  apt-get install -y libssl-dev dumb-init && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN npm ci

# set these only for build
ENV NEXTAUTH_URL="http://localhost:3000"
ENV NEXTAUTH_SECRET="--secret--"
ENV GOOGLE_CLIENT_ID="--google-client-id--"
ENV GOOGLE_CLIENT_SECRET="--google-client-secret--"

# Build next.js app
ADD . /app
RUN npm run build

# Build the production image
FROM node:20-slim

RUN apt-get update && \
  apt-get install -y libssl-dev dumb-init poppler-data poppler-utils && \
  rm -rf /var/lib/apt/lists/*

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
ADD ./bin/launch.sh ./launch.sh

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["dumb-init", "./launch.sh"]
