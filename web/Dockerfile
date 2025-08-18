# Install dependencies only when needed
FROM node:18-alpine AS deps
WORKDIR /app/web
COPY web/package.json web/package-lock.json* ./
RUN npm install

# Rebuild the source code only when needed
FROM node:18-alpine AS builder
WORKDIR /app/web
COPY --from=deps /app/web/node_modules ./node_modules
COPY web/ .
RUN npm run build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app/web

ENV NODE_ENV production
ENV PORT 3000

# Copy built assets
COPY --from=builder /app/web/public ./public
COPY --from=builder /app/web/.next ./.next
COPY --from=builder /app/web/node_modules ./node_modules
COPY --from=builder /app/web/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
