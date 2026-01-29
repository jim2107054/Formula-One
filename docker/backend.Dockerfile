# Placeholder for Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./
COPY backend/tsconfig.json ./

# Install dependencies
RUN npm install

# Copy backend source
COPY backend/src ./src

# Expose port
EXPOSE 4000

# Start development server
CMD ["npm", "run", "dev"]
