pipeline {
  agent any

  environment {
    IMAGE_NAME = 'qual-ai-app'
    CONTAINER_NAME = 'qual-ai-app'
    CERT_DIR = '/etc/letsencrypt/live/db.api.qual.su'
    NEXT_PUBLIC_API = "${env.NEXT_PUBLIC_API ?: '/api'}"
  }

  stages {
    stage('Validate env') {
      steps {
        sh '''
          set -eu
          if [ -z "${HF_TOKEN:-}" ]; then
            echo "HF_TOKEN is not set in Jenkins environment" >&2
            exit 1
          fi
          if [ ! -f "${CERT_DIR}/privkey.pem" ] || [ ! -f "${CERT_DIR}/fullchain.pem" ]; then
            echo "LetsEncrypt certs not found in ${CERT_DIR}" >&2
            exit 1
          fi
        '''
      }
    }

    stage('Build image') {
      steps {
        sh '''
          set -eu
          docker build \
            --build-arg NEXT_PUBLIC_API="${NEXT_PUBLIC_API}" \
            -t "${IMAGE_NAME}:${BUILD_NUMBER}" \
            -t "${IMAGE_NAME}:latest" \
            .
        '''
      }
    }

    stage('Deploy container') {
      steps {
        sh '''
          set -eu
          APP_DATA_DIR="${DATA_DIR:-$HOME/qual-ai/data}"
          mkdir -p "${APP_DATA_DIR}/models"

          docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true

          docker run -d \
            --name "${CONTAINER_NAME}" \
            --restart unless-stopped \
            -p 80:80 \
            -p 443:443 \
            -e HF_TOKEN="${HF_TOKEN}" \
            -e NEXT_PUBLIC_API="${NEXT_PUBLIC_API}" \
            -e DATA_DIR=/data \
            -e MODELS_DIR=/data/models \
            -e HISTORY_FILE=/data/chat_history.json \
            -v "${APP_DATA_DIR}:/data" \
            -v "${CERT_DIR}/privkey.pem:/etc/letsencrypt/live/db.api.qual.su/privkey.pem:ro" \
            -v "${CERT_DIR}/fullchain.pem:/etc/letsencrypt/live/db.api.qual.su/fullchain.pem:ro" \
            "${IMAGE_NAME}:latest"
        '''
      }
    }
  }

  post {
    success {
      sh 'docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
    }
    cleanup {
      sh 'docker image prune -f >/dev/null 2>&1 || true'
    }
  }
}
