# Use official Node.js image as base
FROM node:18-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first for efficient caching
COPY package.json package-lock.json ./

# Install dependencies (clean, reproducible)
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN npm run build

# Production image
FROM node:18-alpine

# Set working directory
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy standalone server and assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose the port Next.js runs on
EXPOSE 3000

# Start the standalone server
CMD ["node", "server.js"]
