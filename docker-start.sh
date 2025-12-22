#!/bin/bash

# Docker로 MySQL 시작 스크립트

echo "🐳 Docker MySQL 시작 중..."

# .env 파일 확인
if [ ! -f ".env" ]; then
    echo "⚠️  .env 파일이 없습니다."
    if [ -f ".env.example" ]; then
        echo "📋 .env.example 파일을 복사하여 .env 파일을 생성하세요:"
        echo "   cp .env.example .env"
        echo ""
        read -p ".env.example을 .env로 복사하시겠습니까? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cp .env.example .env
            echo "✅ .env 파일이 생성되었습니다."
        else
            echo "❌ .env 파일이 필요합니다."
            exit 1
        fi
    else
        echo "❌ .env.example 파일도 없습니다."
        exit 1
    fi
fi

# Docker가 실행 중인지 확인
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker가 실행 중이 아닙니다. Docker를 시작해주세요."
    exit 1
fi

# 환경 변수 로드
source .env

# docker-compose로 MySQL 시작
docker-compose -f docker-compose.dev.yml up -d

# MySQL이 준비될 때까지 대기
echo "⏳ MySQL 컨테이너가 준비될 때까지 대기 중..."
sleep 5

# Health check
CONTAINER_NAME=${MYSQL_CONTAINER_NAME:-qrcoffee-mysql-dev}
ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-ckdwo4467@}
MYSQL_PORT=${MYSQL_PORT:-3307}
DB_NAME=${MYSQL_DATABASE:-qr_coffee_order}

max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker exec $CONTAINER_NAME mysqladmin ping -h localhost -u root -p$ROOT_PASSWORD --silent 2>/dev/null; then
        echo "✅ MySQL이 준비되었습니다!"
        echo ""
        echo "📊 MySQL 정보:"
        echo "  - 호스트: localhost"
        echo "  - 포트: $MYSQL_PORT (Docker 컨테이너 내부는 3306)"
        echo "  - 데이터베이스: $DB_NAME"
        echo "  - 사용자: root"
        echo "  - 비밀번호: $ROOT_PASSWORD"
        echo ""
        echo "🔍 컨테이너 상태 확인:"
        docker ps --filter "name=$CONTAINER_NAME"
        exit 0
    fi
    attempt=$((attempt + 1))
    echo "  시도 $attempt/$max_attempts..."
    sleep 2
done

echo "❌ MySQL 시작에 실패했습니다. 로그를 확인해주세요:"
echo "   docker logs $CONTAINER_NAME"
exit 1
