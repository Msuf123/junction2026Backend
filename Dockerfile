FROM node:22-alpine

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies inside Docker
RUN npm ci

# Copy application source code
COPY . .

EXPOSE 3000

CMD ["node", "app.js"]