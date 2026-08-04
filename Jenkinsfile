node {
  checkout scm
  
  def IMAGE_NAME = 'qual-ai-backend'
  def CONTAINER_NAME = 'qual-ai-backend'

  stage('Validate env') {
    sh """
      set -eu
      if [ -z "\${HF_TOKEN:-}" ]; then
        echo "HF_TOKEN is not set in Jenkins environment (Optional)"
      fi
      if [ -n "\${SSL_KEY:-}" ] && [ -n "\${SSL_CERT:-}" ]; then
        if [ ! -f "\${SSL_KEY}" ] || [ ! -f "\${SSL_CERT}" ]; then
          echo "Certs not found at \${SSL_KEY} or \${SSL_CERT}" >&2
        fi
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
      SSL_ENV=""
      if [ -n "\${SSL_KEY:-}" ] && [ -n "\${SSL_CERT:-}" ] && [ -f "\${SSL_KEY}" ] && [ -f "\${SSL_CERT}" ]; then
        VOLUMES="\$VOLUMES -v \${SSL_KEY}:\${SSL_KEY}:ro -v \${SSL_CERT}:\${SSL_CERT}:ro"
        SSL_ENV="-e SSL_KEY=\${SSL_KEY} -e SSL_CERT=\${SSL_CERT}"
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
        \$SSL_ENV \
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
