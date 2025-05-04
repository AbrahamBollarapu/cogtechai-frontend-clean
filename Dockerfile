# 1. Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2. Runtime stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app ./

# 3. Expose Next.js port
EXPOSE 3000

# 4. Start Next.js in production mode
CMD ["npm", "run", "start"]
