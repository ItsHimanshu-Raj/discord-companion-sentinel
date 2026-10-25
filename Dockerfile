FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Expose HTTP health check port
EXPOSE 10000

ENV PORT=10000
ENV NODE_ENV=production

# Start Sentinel Bot & Health Server
CMD ["node", "index.js"]
