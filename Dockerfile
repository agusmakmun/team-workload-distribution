# Dockerfile for Team Priority Tracker Frontend
FROM node:22-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Create data directory with proper permissions
RUN mkdir -p data && chown -R nextjs:nodejs data
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose ports
EXPOSE 5173 8980

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:5173 || exit 1

# Start both frontend and backend
CMD ["npm", "start"]
