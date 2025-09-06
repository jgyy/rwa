# Backend Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc* ./

# Install dependencies
RUN npm ci --only=production && \
    cp -R node_modules prod_node_modules && \
    npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=deps --chown=nodejs:nodejs /app/prod_node_modules ./node_modules
COPY --chown=nodejs:nodejs package*.json ./

# Copy Prisma files
COPY --chown=nodejs:nodejs prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

USER nodejs

EXPOSE 3001

CMD ["node", "dist/index.js"]