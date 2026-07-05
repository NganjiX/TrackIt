# Placeholder — built in Phase 4 (Frontend Foundation)
FROM node:20-alpine AS builder
WORKDIR /app
RUN echo "Frontend Dockerfile — Phase 4" > /tmp/placeholder

FROM nginx:alpine AS production
COPY --from=builder /tmp/placeholder /usr/share/nginx/html/index.html
EXPOSE 80
