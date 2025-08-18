# Install dependencies only when needed
FROM node:18-alpine AS deps
WORKDIR /web
COPY package.json package-lock.json* ./
RUN npm install

# Rebuild the source code only when needed
FROM node:18-alpine AS builder
WORKDIR /web
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM node:18-alpine AS runner
WORKDIR /web

ENV NODE_ENV production

# Copy built assets
COPY --from=builder /web/public ./public
COPY --from=builder /web/.next ./.next
COPY --from=builder /web/node_modules ./node_modules
COPY --from=builder /web/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
