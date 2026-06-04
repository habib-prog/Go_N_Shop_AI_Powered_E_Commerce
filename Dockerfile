FROM node:20-alpine

WORKDIR /app

# Install dependencies first so Docker layer caching works well.
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
RUN npm ci --omit=dev

# Copy the application source after dependencies are installed.
COPY . .

EXPOSE 8000

CMD ["node", "server.js"]
