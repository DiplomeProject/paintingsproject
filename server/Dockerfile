FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose backend port
EXPOSE 8080

# Start backend
CMD ["node", "server.js"]
