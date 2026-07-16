# ---------- Stage 1: build the TypeScript source into JS ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install ALL deps (including devDependencies like typescript) to build
COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build
# ---------------------------------------------------------------------

# ---------- Stage 2: slim runtime image ----------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Only install production deps here — keeps the final image small
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled JS from the builder stage
COPY --from=builder /app/dist ./dist
COPY public ./public

EXPOSE 8001

CMD ["node", "dist/index.js"]
