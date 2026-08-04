node {
  checkout scm
  
  def IMAGE_NAME = 'qual-ai-backend'
  def CONTAINER_NAME = 'qual-ai-backend'
  def CERT_DIR = '/etc/letsencrypt/live/db.api.qual.su'

  stage('Validate env') {
    sh """
      set -eu
      if [ -z "\${HF_TOKEN:-}" ]; then
        echo "HF_TOKEN is not set in Jenkins environment (Optional)"
      fi
      if [ ! -f "${CERT_DIR}/privkey.pem" ] || [ ! -f "${CERT_DIR}/fullchain.pem" ]; then
        echo "LetsEncrypt certs not found in ${CERT_DIR}" >&2
      fi
    """
  }

  stage('Build image') {
    sh """
      set -eu
      docker build \
        -t "${IMAGE_NAME}:${env.BUILD_NUMBER}" \
        -t "${IMAGE_NAME}:latest" \
        .
    """
  }

  stage('Deploy container') {
    sh """
      set -eu
      APP_DATA_DIR="\${DATA_DIR:-\$HOME/qual-ai/data}"
      mkdir -p "\${APP_DATA_DIR}/models"

      docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
      
      VOLUMES="-v \${APP_DATA_DIR}:/data"
      if [ -f "${CERT_DIR}/privkey.pem" ] && [ -f "${CERT_DIR}/fullchain.pem" ]; then
        VOLUMES="\$VOLUMES -v ${CERT_DIR}/privkey.pem:/etc/letsencrypt/live/db.api.qual.su/privkey.pem:ro -v ${CERT_DIR}/fullchain.pem:/etc/letsencrypt/live/db.api.qual.su/fullchain.pem:ro"
      fi

      docker run -d \
        --name "${CONTAINER_NAME}" \
        --restart unless-stopped \
        -p 8006:8006 \
        -p 443:8006 \
        -e HF_TOKEN="\${HF_TOKEN:-}" \
        -e DATA_DIR=/data \
        -e MODELS_DIR=/data/models \
        -e HISTORY_FILE=/data/chat_history.json \
        -e VOICY_DB="\${VOICY_DB:-}" \
        -e SSL_KEY="/etc/letsencrypt/live/db.api.qual.su/privkey.pem" \
        -e SSL_CERT="/etc/letsencrypt/live/db.api.qual.su/fullchain.pem" \
        \$VOLUMES \
        "${IMAGE_NAME}:latest"
    """
  }

  stage('Post Run') {
    try {
      sh "docker ps --filter 'name=${CONTAINER_NAME}' --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'"
    } finally {
      sh "docker image prune -f >/dev/null 2>&1 || true"
    }
  }
}
