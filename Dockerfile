# syntax=docker/dockerfile:1.7

FROM node:20-bookworm-slim AS frontend-builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG NEXT_PUBLIC_API=/api
ENV NEXT_PUBLIC_API=${NEXT_PUBLIC_API}
RUN npm run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \
        nginx \
        ca-certificates \
        dumb-init \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/next.config.ts ./next.config.ts
COPY --from=frontend-builder /app/server ./server
COPY --from=frontend-builder /app/docker ./docker

RUN pip3 install --no-cache-dir -r /app/server/requirements.txt

RUN chmod +x /app/docker/start.sh \
    && rm -f /etc/nginx/sites-enabled/default /etc/nginx/nginx.conf \
    && cp /app/docker/nginx.conf /etc/nginx/nginx.conf

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API=/api
ENV DATA_DIR=/data
ENV MODELS_DIR=/data/models
ENV HISTORY_FILE=/data/chat_history.json
ENV HF_HOME=/data/hf-home
ENV HUGGINGFACE_HUB_CACHE=/data/models
ENV TRANSFORMERS_CACHE=/data/models
ENV PYTHONUNBUFFERED=1

EXPOSE 80 443
VOLUME ["/data"]

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/app/docker/start.sh"]
