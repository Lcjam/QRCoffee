# QR Coffee Order System

QR코드 기반 카페 주문 시스템

## 📖 프로젝트 개요

각 좌석에 QR코드를 설치하여 고객이 직접 주문할 수 있는 무인 주문 시스템입니다.

### 주요 기능
- 🔍 QR코드 스캔을 통한 주문 접수
- 💳 토스페이먼츠 연동 결제
- 📱 실시간 주문 상태 알림 (WebSocket)
- 👨‍💼 관리자 주문 관리 및 서브계정 지원
- 📊 매출 및 주문 분석 대시보드

## 🛠 기술 스택

### Backend
- **Java 17** + **Spring Boot 3.2.0**
- **Spring Security** - 인증/인가
- **Spring Data JPA** - 데이터베이스 ORM
- **MySQL** - 메인 데이터베이스
- **WebSocket** - 실시간 알림
- **JWT** - 토큰 기반 인증

### Frontend
- **React 18** + **TypeScript**
- **Material-UI** - UI 컴포넌트 라이브러리
- **Axios** - HTTP 클라이언트
- **React Router** - 라우팅

### 결제 시스템
- **토스페이먼츠 API** - 온라인 결제

## 📁 프로젝트 구조

```
QRCoffee/
├── backend/                 # Spring Boot 백엔드
│   ├── src/main/java/com/qrcoffee/backend/
│   │   ├── config/         # 설정 클래스들
│   │   ├── controller/     # REST API 컨트롤러
│   │   ├── service/        # 비즈니스 로직
│   │   ├── repository/     # 데이터 액세스 계층
│   │   ├── entity/         # JPA 엔티티
│   │   ├── dto/           # 데이터 전송 객체
│   │   ├── common/        # 공통 클래스들
│   │   └── exception/     # 예외 처리
│   └── src/main/resources/
│       ├── application.yml # 애플리케이션 설정
│       └── database_schema.sql
├── frontend/               # React 프론트엔드
│   └── qrcoffee-frontend/
│       ├── src/
│       │   ├── components/ # React 컴포넌트
│       │   ├── services/   # API 서비스
│       │   └── types/      # TypeScript 타입 정의
│       └── public/
├── docs/                   # 문서들
│   ├── 설계.txt
│   ├── 개발기능명세서.txt
│   ├── database_schema.sql
│   └── 개발단계계획서.txt
└── README.md
```

## 🚀 시작하기

### 사전 요구사항
- Java 17+
- Node.js 18+
- MySQL 8.0+
- Gradle 8.0+

### 백엔드 실행
```bash
cd backend
./gradlew bootRun
```

### 프론트엔드 실행
```bash
cd frontend/qrcoffee-frontend
npm install
npm start
```

### 접속 URL
- **백엔드 API**: http://localhost:8080
- **프론트엔드**: http://localhost:3000
- **헬스체크**: http://localhost:8080/api/health

## 📋 개발 진행 상황

### ✅ 1단계: 프로젝트 초기 설정 및 기반 구조 (완료)
- [x] Spring Boot 3 프로젝트 설정
- [x] React + TypeScript 프로젝트 설정
- [x] 데이터베이스 스키마 설계
- [x] API 응답 표준화 (ApiResponse)
- [x] 전역 예외 처리 (GlobalExceptionHandler)
- [x] Spring Security 기본 설정
- [x] CORS 설정
- [x] 헬스체크 API 구현
- [x] 개발 환경 구축

### 🔄 2단계: 사용자 관리 시스템 (예정)
- [ ] 사용자 엔티티 및 Repository
- [ ] JWT 토큰 기반 인증 시스템
- [ ] 회원가입/로그인 API
- [ ] 서브계정 관리 기능
- [ ] 권한 관리 (ADMIN, SUB_ADMIN)

### 📅 향후 계획
3. 매장 관리 시스템
4. 메뉴 관리 시스템  
5. QR코드 및 좌석 관리
6. 주문 시스템
7. 토스페이먼츠 결제 연동
8. WebSocket 실시간 알림
9. 관리자 대시보드
10. 성능 최적화 및 배포

## 🗄 데이터베이스 스키마

주요 테이블:
- `stores` - 매장 정보
- `users` - 사용자 (관리자/서브계정)
- `seats` - 좌석 및 QR코드 정보
- `categories` - 메뉴 카테고리
- `menus` - 메뉴 정보
- `orders` - 주문 정보
- `order_items` - 주문 상세 항목
- `payments` - 결제 정보

## 📝 주요 특징

- **수직적 개발 방식**: 각 단계별로 백엔드-프론트엔드를 모두 완성
- **표준화된 API 응답**: 일관된 응답 형식으로 프론트엔드 개발 효율성 향상
- **포괄적인 예외 처리**: GlobalExceptionHandler로 모든 예외 통합 관리
- **확장 가능한 구조**: 마이크로서비스 전환 가능한 모듈화된 설계

## ⚖️ 라이선스

이 프로젝트는 개인 학습 목적으로 개발되었습니다.

---

**개발자**: Lcjam  
**시작일**: 2025-06-16  
**현재 단계**: 1단계 완료 