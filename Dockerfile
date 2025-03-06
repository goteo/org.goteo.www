# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application and build it
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy built application and production dependencies
COPY --from=builder /app/build /app/build
COPY --from=builder /app/node_modules /app/node_modules
COPY package.json /app/

# Expose the port the app will run on
EXPOSE 3000

# Set environment variable
ENV NODE_ENV=production

# Command to run the application
CMD ["node", "build"]
