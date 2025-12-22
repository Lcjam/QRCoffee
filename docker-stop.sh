#!/bin/bash

# Docker로 MySQL 중지 스크립트

echo "🛑 Docker MySQL 중지 중..."

docker-compose -f docker-compose.dev.yml down

echo "✅ MySQL 컨테이너가 중지되었습니다."
echo ""
echo "💡 데이터를 완전히 삭제하려면 다음 명령어를 실행하세요:"
echo "   docker-compose -f docker-compose.dev.yml down -v"
