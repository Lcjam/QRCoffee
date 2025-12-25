# API 문서

QR Coffee Order System의 REST API 엔드포인트 문서입니다.

> ⚠️ **중요**: 이 문서는 참고용입니다. **실제 API 문서는 Swagger UI를 사용하세요.**
> 
> - **Swagger UI**: http://localhost:8080/swagger-ui.html (서버 실행 시 접근 가능)
> - Swagger UI는 인터랙티브하며 항상 최신 API 명세를 보장합니다.
> - 이 문서는 프로젝트 개요 및 주요 개념 설명을 위한 보조 자료입니다.

## 기본 정보

- **Base URL**: `http://localhost:8080/api`
- **인증 방식**: JWT Bearer Token
- **응답 형식**: JSON
- **API 문서**: Swagger UI 사용 권장 (http://localhost:8080/swagger-ui.html)

## 공통 응답 형식

모든 API는 다음 형식의 응답을 반환합니다:

```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": { ... },
  "timestamp": "2024-12-23T12:00:00"
}
```

에러 응답:

```json
{
  "success": false,
  "message": "에러 메시지",
  "error": "상세 에러 정보",
  "timestamp": "2024-12-23T12:00:00"
}
```

## 인증 (Authentication)

### 회원가입
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동",
  "phone": "010-1234-5678",
  "storeId": 1
}
```

### 로그인
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "expiresIn": 1800000
  }
}
```

### 현재 사용자 정보 조회
```http
GET /api/auth/me
Authorization: Bearer {accessToken}
```

### 로그아웃
```http
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

## 매장 (Store)

### 내 매장 정보 조회
```http
GET /api/stores/my
Authorization: Bearer {accessToken}
```

### 매장 정보 수정
```http
PUT /api/stores/my
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "카페 이름",
  "address": "주소",
  "phone": "010-1234-5678",
  "businessHours": "{\"월\":\"09:00-22:00\"}",
  "isActive": true
}
```

### 활성 매장 목록 조회 (공개)
```http
GET /api/stores/active
```

## 메뉴 (Menu)

### 활성 메뉴 목록 조회
```http
GET /api/menus/active
Authorization: Bearer {accessToken}
```

### 고객용 메뉴 목록 조회 (공개)
```http
GET /api/public/stores/{storeId}/menus
```

### 메뉴 생성
```http
POST /api/menus
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "categoryId": 1,
  "name": "아메리카노",
  "description": "에스프레소에 물을 타서 만든 커피",
  "price": 4000,
  "imageUrl": "https://example.com/image.jpg",
  "isAvailable": true,
  "displayOrder": 1
}
```

### 메뉴 수정
```http
PUT /api/menus/{menuId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "아메리카노",
  "price": 4500,
  ...
}
```

### 메뉴 삭제
```http
DELETE /api/menus/{menuId}
Authorization: Bearer {accessToken}
```

## 카테고리 (Category)

### 활성 카테고리 목록 조회
```http
GET /api/categories/active
Authorization: Bearer {accessToken}
```

### 카테고리 생성
```http
POST /api/categories
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "음료",
  "description": "음료 카테고리",
  "displayOrder": 1,
  "isActive": true
}
```

## 좌석 (Seat)

### 좌석 목록 조회
```http
GET /api/seats
Authorization: Bearer {accessToken}
```

### 활성 좌석 목록 조회
```http
GET /api/seats/active
Authorization: Bearer {accessToken}
```

### 좌석 생성
```http
POST /api/seats
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "seatNumber": "A1",
  "description": "창가 좌석",
  "maxCapacity": 4,
  "isActive": true
}
```

### 좌석 수정
```http
PUT /api/seats/{seatId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "seatNumber": "A1",
  "maxCapacity": 6,
  ...
}
```

### 좌석 삭제
```http
DELETE /api/seats/{seatId}
Authorization: Bearer {accessToken}
```

### QR코드 재생성
```http
PATCH /api/seats/{seatId}/regenerate-qr
Authorization: Bearer {accessToken}
```

### QR코드로 좌석 조회 (공개)
```http
GET /api/public/seats/qr/{qrCode}
```

## 주문 (Order)

### 주문 생성
```http
POST /api/orders
Content-Type: application/json

{
  "storeId": 1,
  "seatId": 1,
  "items": [
    {
      "menuId": 1,
      "quantity": 2,
      "price": 4000
    }
  ],
  "customerRequest": "얼음 많이 주세요"
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNumber": "20241223-001-abc12345",
    "accessToken": "order_token_12345",
    "totalAmount": 8000,
    "status": "PENDING",
    ...
  }
}
```

### 주문 조회 (고객용)
```http
GET /api/orders/{orderId}?token={accessToken}
```

### 주문 번호로 조회 (고객용)
```http
GET /api/orders/number/{orderNumber}?token={accessToken}
```

### 관리자용 주문 목록 조회
```http
GET /api/orders/store
Authorization: Bearer {accessToken}
```

### 주문 상태 변경
```http
PUT /api/orders/{orderId}/status
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "status": "PREPARING"
}
```

**상태 값**: `PENDING`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED`

### 주문 취소 (고객용)
```http
DELETE /api/orders/{orderId}?token={accessToken}
```

## 결제 (Payment)

### 결제 준비 (장바구니 → 결제 준비)
```http
POST /api/payments/prepare
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "amount": 8000,
  "items": [
    {
      "menuId": 1,
      "quantity": 2,
      "price": 4000
    }
  ],
  "storeId": 1,
  "seatId": 1
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "paymentKey": "payment_key_12345",
    "orderId": "order_12345",
    "amount": 8000,
    ...
  }
}
```

### 결제 승인
```http
POST /api/payments/confirm
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "paymentKey": "payment_key_12345",
  "orderId": "order_12345",
  "amount": 8000
}
```

### 결제 조회 (paymentKey로)
```http
GET /api/payments/{paymentKey}
Authorization: Bearer {accessToken}
```

### 결제 조회 (orderId로)
```http
GET /api/payments/order/{orderId}
Authorization: Bearer {accessToken}
```

### 결제 취소
```http
POST /api/payments/{paymentKey}/cancel
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "cancelReason": "고객 요청"
}
```

## 대시보드 (Dashboard)

### 대시보드 통계 조회
```http
GET /api/dashboard/stats
Authorization: Bearer {accessToken}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "todayOrders": 10,
    "todaySales": 80000,
    "totalOrders": 100,
    "totalSales": 800000,
    "popularMenus": [
      {
        "menuId": 1,
        "menuName": "아메리카노",
        "orderCount": 50
      }
    ],
    "dailySales": [
      {
        "date": "2024-12-23",
        "amount": 80000,
        "orderCount": 10
      }
    ]
  }
}
```

## 알림 (Notification)

### 알림 목록 조회
```http
GET /api/notifications?userType=ADMIN
Authorization: Bearer {accessToken}
```

### 미읽음 알림 개수 조회
```http
GET /api/notifications/unread/count?userType=ADMIN
Authorization: Bearer {accessToken}
```

### 알림 읽음 처리
```http
PUT /api/notifications/{notificationId}/read
Authorization: Bearer {accessToken}
```

## 사용자 (User)

### 서브계정 목록 조회
```http
GET /api/users/sub-accounts
Authorization: Bearer {accessToken}
```

### 서브계정 생성
```http
POST /api/users/sub-accounts
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "email": "sub@example.com",
  "password": "password123",
  "name": "서브계정",
  "phone": "010-1234-5678"
}
```

### 사용자 상태 변경
```http
PATCH /api/users/{userId}/toggle-status
Authorization: Bearer {accessToken}
```

## 헬스체크

### 헬스체크
```http
GET /api/health
```

**응답**:
```json
{
  "status": "UP",
  "timestamp": "2024-12-23T12:00:00"
}
```

## 에러 코드

| HTTP 상태 코드 | 설명 |
|---------------|------|
| 200 | 성공 |
| 400 | 잘못된 요청 |
| 401 | 인증 실패 |
| 403 | 권한 없음 |
| 404 | 리소스를 찾을 수 없음 |
| 500 | 서버 내부 오류 |

## 인증 헤더

인증이 필요한 API는 다음 헤더를 포함해야 합니다:

```http
Authorization: Bearer {accessToken}
```

`{accessToken}`은 로그인 API에서 받은 `accessToken` 값을 사용합니다.
