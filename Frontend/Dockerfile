# ---------- Stage 1: build the static Vite app ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Vite reads any VITE_* env vars at build time and bakes them into the JS bundle.
# Render lets you set build-time env vars in the dashboard — see the guide.
RUN npm run build
# ---------------------------------------------------------------------

# ---------- Stage 2: serve the built files with Nginx ----------
FROM nginx:alpine AS runner

# Remove the default nginx static content
RUN rm -rf /usr/share/nginx/html/*

# Copy our built Vite app (the "dist" folder) into nginx's web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Our custom nginx config (handles React Router refresh issue)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
