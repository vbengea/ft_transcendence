# Multi-stage build for minimal production image
FROM node:22.12.0-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Create public directory and copy static assets
RUN mkdir -p public && \
    cp -r ./src/ui/images public/ && \
    cp -r ./src/ui/pages public/ && \
    cp -r ./src/ui/languages public/ && \
    cp ./src/ui/pages/index.html public/ && \
    cp ./src/ui/images/favicon.ico public/ && \
    cp ./src/ui/styles/main.css public/

# Build CSS and JS
RUN npm run css && npm run js

# Generate Prisma client
RUN npx prisma generate --schema=./src/server/prisma/schema.prisma

# Production stage
FROM node:22.12.0-alpine

# Install only runtime dependencies
RUN apk add --no-cache \
    openssl \
    sqlite

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm ci --omit=dev --ignore-scripts

# Copy built assets from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy application source
COPY --chown=nodejs:nodejs src ./src

# Create directory for database with proper permissions
RUN mkdir -p /app/db && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port (will be set via environment variable)
EXPOSE ${PORT:-3002}

# Run migrations and start application
CMD sh -c "npx prisma migrate deploy --schema=./src/server/prisma/schema.prisma && node src/server/index.cjs"
