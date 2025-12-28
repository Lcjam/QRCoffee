#!/bin/bash

# 성능 측정 스크립트
# 사용법: ./scripts/performance-test.sh

echo "=========================================="
echo "API 성능 측정 시작"
echo "=========================================="

API_BASE_URL="http://localhost:8080"

# 헬스체크 API 응답 시간 측정
echo ""
echo "1. 헬스체크 API 응답 시간 측정"
for i in {1..10}; do
    start_time=$(date +%s%N)
    curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/api/health" > /dev/null
    end_time=$(date +%s%N)
    duration=$((($end_time - $start_time) / 1000000))
    echo "  요청 $i: ${duration}ms"
done

echo ""
echo "=========================================="
echo "성능 측정 완료"
echo "=========================================="

