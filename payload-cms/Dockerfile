# Production Dockerfile for Payload CMS (Next.js 15 + SQLite)
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Persistent volume directory for SQLite and Uploads
RUN mkdir -p /app/data

EXPOSE 3000
CMD ["npm", "run", "start"]
