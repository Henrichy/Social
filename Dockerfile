# Use Node.js 20 LTS version (required for MongoDB 7.x)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files for backend
COPY package*.json ./

# Install backend dependencies (production only)
RUN npm ci --only=production

# Copy client directory and package files
COPY client/ ./client/

# Install client dependencies and build
WORKDIR /app/client
RUN npm ci && npm run build

# Return to app directory and copy backend source
WORKDIR /app
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start the application
CMD ["npm", "start"]