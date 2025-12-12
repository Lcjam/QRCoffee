#!/bin/bash

# QR Coffee 프로젝트 종료 스크립트

echo "🛑 QR Coffee 프로젝트 종료 중..."

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# PID 파일 디렉토리 확인
if [ ! -d ".pids" ]; then
    echo -e "${YELLOW}⚠️  실행 중인 프로세스를 찾을 수 없습니다.${NC}"
    exit 0
fi

# 백엔드 종료
if [ -f ".pids/backend.pid" ]; then
    BACKEND_PID=$(cat .pids/backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}📦 백엔드 종료 중... (PID: $BACKEND_PID)${NC}"
        kill $BACKEND_PID 2>/dev/null
        sleep 2
        
        # 강제 종료 (여전히 실행 중인 경우)
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            echo -e "${RED}강제 종료 중...${NC}"
            kill -9 $BACKEND_PID 2>/dev/null
        fi
        
        echo -e "${GREEN}✅ 백엔드가 종료되었습니다.${NC}"
    else
        echo -e "${YELLOW}⚠️  백엔드 프로세스를 찾을 수 없습니다.${NC}"
    fi
    rm -f .pids/backend.pid
fi

# 프론트엔드 종료
if [ -f ".pids/frontend.pid" ]; then
    FRONTEND_PID=$(cat .pids/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}🎨 프론트엔드 종료 중... (PID: $FRONTEND_PID)${NC}"
        kill $FRONTEND_PID 2>/dev/null
        sleep 2
        
        # 강제 종료 (여전히 실행 중인 경우)
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            echo -e "${RED}강제 종료 중...${NC}"
            kill -9 $FRONTEND_PID 2>/dev/null
        fi
        
        echo -e "${GREEN}✅ 프론트엔드가 종료되었습니다.${NC}"
    else
        echo -e "${YELLOW}⚠️  프론트엔드 프로세스를 찾을 수 없습니다.${NC}"
    fi
    rm -f .pids/frontend.pid
fi

# 포트로 프로세스 확인 및 종료 (추가 안전장치)
echo -e "${YELLOW}🔍 남은 프로세스 확인 중...${NC}"

# 포트 8080 사용 프로세스 종료
PORT_8080_PID=$(lsof -ti :8080)
if [ ! -z "$PORT_8080_PID" ]; then
    echo -e "${YELLOW}포트 8080을 사용하는 프로세스 종료 중... (PID: $PORT_8080_PID)${NC}"
    kill $PORT_8080_PID 2>/dev/null
    sleep 1
    if ps -p $PORT_8080_PID > /dev/null 2>&1; then
        kill -9 $PORT_8080_PID 2>/dev/null
    fi
fi

# 포트 3000 사용 프로세스 종료
PORT_3000_PID=$(lsof -ti :3000)
if [ ! -z "$PORT_3000_PID" ]; then
    echo -e "${YELLOW}포트 3000을 사용하는 프로세스 종료 중... (PID: $PORT_3000_PID)${NC}"
    kill $PORT_3000_PID 2>/dev/null
    sleep 1
    if ps -p $PORT_3000_PID > /dev/null 2>&1; then
        kill -9 $PORT_3000_PID 2>/dev/null
    fi
fi

# 로그 파일 정리 (선택사항)
read -p "로그 파일을 삭제하시겠습니까? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f .pids/*.log
    echo -e "${GREEN}✅ 로그 파일이 삭제되었습니다.${NC}"
fi

echo ""
echo -e "${GREEN}✨ 모든 프로세스가 종료되었습니다.${NC}"

