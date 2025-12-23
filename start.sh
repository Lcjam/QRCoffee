#!/bin/bash

# QR Coffee 프로젝트 시작 스크립트

echo "🚀 QR Coffee 프로젝트 시작 중..."

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 프로젝트 루트 디렉토리 확인
if [ ! -d "backend" ] || [ ! -d "frontend/qrcoffee-frontend" ]; then
    echo "❌ 프로젝트 루트 디렉토리에서 실행해주세요."
    exit 1
fi

# .env 파일 확인
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env 파일이 없습니다."
    echo "SETUP_GUIDE.md를 참고하여 .env 파일을 생성해주세요."
    exit 1
fi

if [ ! -f "frontend/qrcoffee-frontend/.env" ]; then
    echo "⚠️  frontend/qrcoffee-frontend/.env 파일이 없습니다."
    echo "SETUP_GUIDE.md를 참고하여 .env 파일을 생성해주세요."
    exit 1
fi

# 포트 사용 확인
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  포트 8080이 이미 사용 중입니다."
    read -p "계속하시겠습니까? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  포트 3000이 이미 사용 중입니다."
    read -p "계속하시겠습니까? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# PID 파일 디렉토리 생성
mkdir -p .pids

# 프론트엔드 의존성 확인 및 설치
echo -e "${BLUE}📦 프론트엔드 의존성 확인 중...${NC}"
cd frontend/qrcoffee-frontend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules가 없습니다. npm install을 실행합니다...${NC}"
    npm install
fi
cd ../..

# 백엔드 시작
echo -e "${BLUE}📦 백엔드 시작 중...${NC}"
cd backend
# Gradle Wrapper jar 파일 확인
if [ ! -f "gradle/wrapper/gradle-wrapper.jar" ]; then
    echo -e "${YELLOW}⚠️  Gradle Wrapper jar 파일이 없습니다.${NC}"
    echo -e "${YELLOW}   Gradle을 설치하거나 Wrapper를 수동으로 설정해주세요.${NC}"
    echo -e "${YELLOW}   또는 'gradle wrapper' 명령어를 실행해주세요.${NC}"
    exit 1
fi
./gradlew bootRun > ../.pids/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../.pids/backend.pid
cd ..

# 백엔드 시작 대기 (최대 30초)
echo -e "${YELLOW}⏳ 백엔드 시작 대기 중...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 백엔드가 시작되었습니다! (http://localhost:8080)${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}⚠️  백엔드 시작이 지연되고 있습니다. 계속 진행합니다...${NC}"
    fi
    sleep 1
done

# 프론트엔드 시작
echo -e "${BLUE}🎨 프론트엔드 시작 중...${NC}"
cd frontend/qrcoffee-frontend
npm start > ../../.pids/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../../.pids/frontend.pid
cd ../..

# 완료 메시지
echo ""
echo -e "${GREEN}✨ QR Coffee 프로젝트가 시작되었습니다!${NC}"
echo ""
echo "📱 프론트엔드: http://localhost:3000"
echo "🔧 백엔드 API: http://localhost:8080"
echo ""
echo "로그 확인:"
echo "  - 백엔드: tail -f .pids/backend.log"
echo "  - 프론트엔드: tail -f .pids/frontend.log"
echo ""
echo "종료하려면: ./stop.sh"
echo ""

