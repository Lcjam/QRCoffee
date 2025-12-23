#!/bin/bash

# Docker MySQL 중지 스크립트

set -e

# .env 파일 로드 (있는 경우)
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

# Docker Compose 파일 선택
COMPOSE_FILE=${DOCKER_COMPOSE_FILE:-docker-compose.dev.yml}

echo "🛑 Docker MySQL 컨테이너 중지 중..."
docker-compose -f "$COMPOSE_FILE" down

echo "✅ MySQL 컨테이너가 중지되었습니다."
echo "💡 컨테이너 시작: ./docker-start.sh"
