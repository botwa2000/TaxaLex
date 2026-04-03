FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN npm install -g npm@latest

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Accept build arguments (public client-side vars only)
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_DEBUG_LOGS=false
ARG BUILD_ID=unknown
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST

ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_DEBUG_LOGS=$NEXT_PUBLIC_DEBUG_LOGS
ENV NEXT_BUILD_ID=$BUILD_ID
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_POSTHOG_KEY=$NEXT_PUBLIC_POSTHOG_KEY
ENV NEXT_PUBLIC_POSTHOG_HOST=$NEXT_PUBLIC_POSTHOG_HOST

RUN echo "Building with NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}"

# Dummy values so requireEnv() passes at build time.
# Real secrets are injected by entrypoint.sh from Docker Swarm secrets at runtime.
# Using ARG so placeholders don't persist in final image layers.
ARG ANTHROPIC_API_KEY=build-placeholder
ARG NEXTAUTH_SECRET=build-placeholder
ARG NEXTAUTH_URL=https://taxalex.de
ARG DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/taxalex
ARG GOOGLE_AI_API_KEY=build-placeholder
ARG PERPLEXITY_API_KEY=build-placeholder
ENV ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV DATABASE_URL=$DATABASE_URL
ENV GOOGLE_AI_API_KEY=$GOOGLE_AI_API_KEY
ENV PERPLEXITY_API_KEY=$PERPLEXITY_API_KEY

# Generate Prisma client (required before build)
RUN npx prisma generate

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy entrypoint script that loads secrets
COPY --chown=nextjs:nodejs entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]
