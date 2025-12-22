#!/bin/bash

# Docker MySQL 시작 스크립트

set -e

# .env 파일 확인
if [ ! -f .env ]; then
    echo "❌ .env 파일이 없습니다."
    echo "📝 .env.example을 참고하여 .env 파일을 생성하세요."
    exit 1
fi

# .env 파일 로드
set -a
source .env
set +a

# Docker 데몬 확인
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 데몬이 실행 중이 아닙니다."
    echo "💡 Docker Desktop을 시작하거나 Docker 서비스를 시작하세요."
    exit 1
fi

# Docker Compose 파일 선택 (환경 변수로 제어 가능)
COMPOSE_FILE=${DOCKER_COMPOSE_FILE:-docker-compose.dev.yml}

echo "🐳 Docker MySQL 컨테이너 시작 중..."
docker-compose -f "$COMPOSE_FILE" up -d

# 헬스 체크 대기
echo "⏳ MySQL 컨테이너 준비 대기 중..."
MAX_WAIT=60
WAIT_COUNT=0

while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    if docker-compose -f "$COMPOSE_FILE" exec -T mysql mysqladmin ping -h localhost -u root -p"${MYSQL_ROOT_PASSWORD}" --silent 2>/dev/null; then
        echo "✅ MySQL 컨테이너가 정상적으로 시작되었습니다!"
        
        # 연결 정보 출력
        echo ""
        echo "📊 연결 정보:"
        echo "   호스트: localhost:${MYSQL_PORT:-3307}"
        echo "   데이터베이스: ${MYSQL_DATABASE:-qr_coffee_order}"
        echo "   사용자: root 또는 ${MYSQL_USER:-qrcoffee}"
        echo ""
        echo "💡 컨테이너 중지: ./docker-stop.sh"
        exit 0
    fi
    sleep 2
    WAIT_COUNT=$((WAIT_COUNT + 2))
    echo -n "."
done

echo ""
echo "⚠️  MySQL 컨테이너가 시작되는 데 시간이 오래 걸립니다."
echo "💡 다음 명령어로 상태를 확인하세요: docker-compose -f $COMPOSE_FILE ps"
exit 1
