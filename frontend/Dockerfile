# STAGE 1: Build React assets
FROM node:26.3.1-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# STAGE 2: Run Nginx and hold files internally
FROM nginx:alpine
# Remove default config
RUN rm /etc/nginx/conf.d/default.conf
# Copy built assets straight to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html
# Expose standard ports
EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]