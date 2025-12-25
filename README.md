# ☕ QR Coffee Order System

QR코드 기반 무인 카페 주문 시스템

## 📖 프로젝트 개요

각 좌석에 부착된 QR코드를 스캔하여 고객이 직접 주문할 수 있는 무인 주문 시스템입니다. 관리자는 실시간으로 주문을 관리하고, 고객은 간편하게 메뉴를 주문할 수 있습니다.

### 주요 기능

- 🔍 **QR코드 기반 주문**: 좌석별 QR코드 스캔으로 즉시 주문 접수
- 📱 **실시간 주문 관리**: 관리자용 주문 상태 관리 및 고객용 주문 추적
- 🛒 **장바구니 기능**: 메뉴 선택, 수량 조정, 주문 확인
- 👨‍💼 **관리자 시스템**: 매장 관리, 메뉴 관리, 좌석 관리, 서브계정 지원
- 📊 **주문 통계**: 주문 현황 및 통계 조회

## 🛠 기술 스택

### Backend
- **Java 21** + **Spring Boot 3.2.0**
- **Spring Security** - JWT 기반 인증/인가
- **Spring Data JPA** - 데이터베이스 ORM
- **MySQL 8.0** - 메인 데이터베이스
- **WebSocket** - 실시간 알림
- **JWT** - 토큰 기반 인증

### Frontend
- **React 18** + **TypeScript**
- **Material-UI (MUI)** - UI 컴포넌트 라이브러리
- **Axios** - HTTP 클라이언트
- **React Router** - 라우팅

### 결제 시스템
- **토스페이먼츠 API** - 온라인 결제

## 🚀 빠른 시작

### 사전 요구사항

- **Java 21** 이상
- **Node.js 18** 이상
- **Docker** 및 **Docker Compose** (MySQL용, 권장)
  또는 **MySQL 8.0** 이상 (로컬 설치)

### 1. 데이터베이스 설정

#### 방법 1: Docker 사용 (권장) 🐳

```bash
# .env 파일 생성 (프로젝트 루트)
cp .env.example .env
# .env 파일을 열어 실제 비밀번호로 수정

# Docker로 MySQL 시작
chmod +x docker-start.sh
./docker-start.sh

# 또는 직접 실행
docker-compose -f docker-compose.dev.yml up -d
```

Docker를 사용하면 MySQL이 자동으로 시작되고 스키마가 초기화됩니다.

#### 방법 2: 로컬 MySQL 사용

```bash
mysql -u root -p < database_schema.sql
```

### 2. 환경 변수 설정

**프로젝트 루트에 `.env` 파일 생성** (Docker 사용 시 필수):

```bash
# .env.example을 복사하여 .env 생성
cp .env.example .env

# 필요시 .env 파일 수정
nano .env
```

`.env` 파일은 프로젝트 루트에 위치해야 하며, Docker Compose와 Spring Boot가 자동으로 인식합니다.

**프론트엔드** (`frontend/qrcoffee-frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:8080
```

### 3. 프로젝트 실행

#### 방법 1: 스크립트 사용 (권장)

```bash
# MySQL 시작 (Docker 사용 시)
./docker-start.sh

# 프로젝트 시작
chmod +x start.sh
./start.sh

# 프로젝트 종료
chmod +x stop.sh
./stop.sh

# MySQL 중지 (Docker 사용 시)
./docker-stop.sh
```

#### 방법 2: 수동 실행

**백엔드:**
```bash
cd backend
./gradlew bootRun
```

**프론트엔드:**
```bash
cd frontend/qrcoffee-frontend
npm install
npm start
```

### 접속 URL

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8080
- **헬스체크**: http://localhost:8080/api/health

> 💡 상세한 설정 가이드는 `SETUP_GUIDE.md`를 참고하세요.

## 📁 프로젝트 구조

```
QRCoffee/
├── backend/                      # Spring Boot 백엔드
│   ├── src/main/java/com/qrcoffee/backend/
│   │   ├── config/              # 설정 클래스 (Security, CORS, JWT 등)
│   │   ├── controller/          # REST API 컨트롤러
│   │   ├── service/             # 비즈니스 로직
│   │   ├── repository/          # 데이터 액세스 계층
│   │   ├── entity/              # JPA 엔티티
│   │   ├── dto/                 # 데이터 전송 객체
│   │   ├── common/              # 공통 클래스 (ApiResponse 등)
│   │   └── exception/           # 예외 처리
│   └── src/main/resources/
│       └── application.yml      # 애플리케이션 설정
├── frontend/qrcoffee-frontend/  # React 프론트엔드
│   ├── src/
│   │   ├── components/          # React 컴포넌트
│   │   ├── pages/               # 페이지 컴포넌트
│   │   ├── services/            # API 서비스
│   │   ├── types/               # TypeScript 타입 정의
│   │   └── contexts/            # React Context (Auth 등)
│   └── public/
├── database_schema.sql          # 데이터베이스 스키마
├── docker-compose.yml           # Docker Compose 설정 (프로덕션)
├── docker-compose.dev.yml       # Docker Compose 설정 (개발용)
├── docker-start.sh              # Docker MySQL 시작 스크립트
├── docker-stop.sh               # Docker MySQL 중지 스크립트
├── start.sh                     # 프로젝트 시작 스크립트
├── stop.sh                      # 프로젝트 종료 스크립트
├── .env.example                 # 환경 변수 예제 파일
├── SETUP_GUIDE.md              # 상세 설정 가이드
└── README.md                    # 이 파일
```

## 📋 개발 진행 상황

### ✅ 완료된 기능

#### 1단계: 프로젝트 초기 설정 및 기반 구조
- [x] Spring Boot 3 프로젝트 설정
- [x] React + TypeScript 프로젝트 설정
- [x] 데이터베이스 스키마 설계
- [x] API 응답 표준화 (ApiResponse)
- [x] 전역 예외 처리 (GlobalExceptionHandler)
- [x] Spring Security 기본 설정
- [x] CORS 설정
- [x] 헬스체크 API 구현

#### 2단계: 사용자 관리 시스템
- [x] 사용자 엔티티 및 Repository
- [x] JWT 토큰 기반 인증 시스템
- [x] 회원가입/로그인 API
- [x] 서브계정 관리 기능
- [x] 권한 관리 (MASTER, SUB)

#### 3단계: 매장 관리 시스템
- [x] 매장 정보 CRUD
- [x] 매장 정보 조회/수정 API
- [x] 매장 관리 페이지

#### 4단계: 메뉴 관리 시스템
- [x] 카테고리 관리 (CRUD)
- [x] 메뉴 관리 (CRUD)
- [x] 메뉴 상태 관리 (품절/판매중)
- [x] 메뉴 관리 페이지

#### 5단계: 좌석 및 QR코드 관리
- [x] 좌석 CRUD 기능
- [x] QR코드 자동 생성/재생성
- [x] 좌석 상태 관리 (활성화/비활성화, 점유/해제)
- [x] 좌석 통계 조회
- [x] 고객용 QR코드 조회 API
- [x] 좌석 관리 페이지

#### 6단계: 주문 시스템
- [x] 주문 생성 API
- [x] 주문 조회 API (고객용/관리자용)
- [x] 주문 상태 변경 API
- [x] 주문 취소 기능
- [x] 고객용 주문 페이지 (QR코드 스캔 → 메뉴 선택 → 주문)
- [x] 장바구니 기능
- [x] 주문 상태 확인 페이지
- [x] 관리자용 주문 관리 페이지

#### 7단계: 결제 시스템
- [x] 토스페이먼츠 API 연동
- [x] 결제 준비 API (장바구니 → 결제 준비)
- [x] 결제 승인 API (토스페이먼츠 결제 승인)
- [x] 결제 조회 API (paymentKey, orderId로 조회)
- [x] 결제 페이지 구현 (토스페이먼츠 위젯 연동)
- [x] 결제 완료 페이지
- [x] 결제 실패 페이지
- [x] 결제 서비스 테스트 코드 (TDD)
- [x] 결제 페이지 테스트 코드 (TDD)

### 🚧 진행 중 / 예정

#### 8단계: 실시간 알림 시스템
- [ ] WebSocket 설정 및 핸들러 구현
- [ ] 알림 메시지 브로드캐스트
- [ ] 프론트엔드 WebSocket 클라이언트

#### 9단계: 관리자 대시보드
- [ ] 매출 통계 API
- [ ] 주문 현황 차트
- [ ] 인기 메뉴 순위
- [ ] 실시간 현황 위젯

#### 10단계: 최적화 및 배포
- [ ] 성능 최적화
- [ ] 보안 강화
- [ ] 테스트 및 디버깅
- [ ] 배포 준비

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
- `notifications` - 알림 정보 (예정)

전체 스키마는 `database_schema.sql` 파일을 참고하세요.

## 📝 주요 특징

- **수직적 개발 방식**: 각 단계별로 백엔드-프론트엔드를 모두 완성
- **표준화된 API 응답**: 일관된 응답 형식으로 프론트엔드 개발 효율성 향상
- **포괄적인 예외 처리**: GlobalExceptionHandler로 모든 예외 통합 관리
- **JWT 기반 인증**: Stateless 인증으로 확장성 확보
- **모바일 최적화**: 고객용 주문 페이지는 모바일 환경에 최적화

## 🔧 주요 API 엔드포인트

### 인증
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보

### 매장
- `GET /api/stores/my` - 내 매장 정보 조회
- `PUT /api/stores/my` - 내 매장 정보 수정

### 메뉴
- `GET /api/menus/active` - 활성 메뉴 목록
- `GET /api/public/stores/{storeId}/menus` - 고객용 메뉴 목록

### 좌석
- `GET /api/seats` - 좌석 목록
- `GET /api/public/seats/qr/{qrCode}` - QR코드로 좌석 조회

### 주문
- `POST /api/orders` - 주문 생성
- `GET /api/orders/{id}` - 주문 조회
- `GET /api/orders/store` - 관리자용 주문 목록
- `PUT /api/orders/{id}/status` - 주문 상태 변경

### 결제
- `POST /api/payments/prepare` - 결제 준비 (장바구니 → 결제 준비)
- `POST /api/payments/confirm` - 결제 승인 (토스페이먼츠 결제 승인)
- `GET /api/payments/{paymentKey}` - 결제 조회 (paymentKey로)
- `GET /api/payments/order/{orderId}` - 결제 조회 (orderId로)

## 📚 문서

- [API 문서](docs/API.md) - REST API 엔드포인트 상세 설명
- [개발 가이드](docs/DEVELOPMENT.md) - 코딩 컨벤션 및 아키텍처 가이드
- [기여 가이드](CONTRIBUTING.md) - 프로젝트 기여 방법
- [CHANGELOG.md](CHANGELOG.md) - 변경 이력
- `database_schema.sql` - 데이터베이스 스키마
- `개발기능명세서.txt` - 기능 명세서
- `개발단계계획서.txt` - 개발 단계 계획

## ⚖️ 라이선스

이 프로젝트는 개인 학습 목적으로 개발되었습니다.

---

**개발자**: Lcjam  
**시작일**: 2024년  
**현재 단계**: 프로젝트 점검 완료 (1-4단계)
