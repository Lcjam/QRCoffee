# 개발 가이드

QR Coffee Order System 개발 가이드입니다.

## 목차

1. [프로젝트 구조](#프로젝트-구조)
2. [코딩 컨벤션](#코딩-컨벤션)
3. [아키텍처](#아키텍처)
4. [개발 환경 설정](#개발-환경-설정)
5. [테스트](#테스트)
6. [디버깅](#디버깅)

## 프로젝트 구조

### 백엔드 구조

```
backend/
├── src/main/java/com/qrcoffee/backend/
│   ├── config/              # 설정 클래스
│   │   ├── SecurityConfig.java
│   │   ├── WebSocketConfig.java
│   │   └── ...
│   ├── controller/          # REST API 컨트롤러
│   │   ├── AuthController.java
│   │   ├── OrderController.java
│   │   └── ...
│   ├── service/             # 비즈니스 로직
│   │   ├── OrderService.java
│   │   ├── PaymentService.java
│   │   └── ...
│   ├── repository/          # 데이터 액세스 계층
│   │   ├── OrderRepository.java
│   │   └── ...
│   ├── entity/              # JPA 엔티티
│   │   ├── Order.java
│   │   ├── User.java
│   │   └── ...
│   ├── dto/                 # 데이터 전송 객체
│   │   ├── OrderRequest.java
│   │   ├── OrderResponse.java
│   │   └── ...
│   ├── common/              # 공통 클래스
│   │   ├── ApiResponse.java
│   │   ├── Constants.java
│   │   └── BaseController.java
│   ├── exception/           # 예외 처리
│   │   ├── BusinessException.java
│   │   └── GlobalExceptionHandler.java
│   └── util/                # 유틸리티
│       ├── JwtUtil.java
│       ├── ValidationUtils.java
│       └── ...
└── src/main/resources/
    └── application.yml       # 애플리케이션 설정
```

### 프론트엔드 구조

```
frontend/qrcoffee-frontend/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── PrivateRoute.tsx
│   │   └── ...
│   ├── pages/               # 페이지 컴포넌트
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── ...
│   ├── services/            # API 서비스
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   └── ...
│   ├── types/               # TypeScript 타입 정의
│   │   ├── auth.ts
│   │   ├── order.ts
│   │   └── ...
│   ├── contexts/            # React Context
│   │   ├── AuthContext.tsx
│   │   └── NotificationContext.tsx
│   ├── utils/               # 유틸리티 함수
│   │   ├── validation.ts
│   │   └── constants.ts
│   └── theme/               # MUI 테마 설정
│       └── index.ts
└── public/
```

## 코딩 컨벤션

### 백엔드 (Java)

#### 네이밍 컨벤션
- **클래스**: PascalCase (`OrderService`, `UserController`)
- **메서드**: camelCase (`createOrder`, `getUserById`)
- **상수**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`, `DEFAULT_STORE_ID`)
- **패키지**: 소문자 (`com.qrcoffee.backend.service`)

#### Import 규칙
- 와일드카드 import 사용 금지
- 명시적 import 사용
- Import 순서:
  1. Java 표준 라이브러리
  2. 외부 라이브러리 (Spring, Lombok 등)
  3. 프로젝트 내부 클래스

#### 코드 스타일
- 들여쓰기: 4 spaces
- 파일 끝: 빈 줄 하나
- JavaDoc 주석: 공개 메서드에 작성

#### 예제
```java
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class OrderService {
    
    private final OrderRepository orderRepository;
    
    /**
     * 주문 생성
     */
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        log.info("주문 생성 시작: storeId={}", request.getStoreId());
        
        // 비즈니스 로직
        Order order = createOrderEntity(request);
        
        return OrderResponse.from(order);
    }
}
```

### 프론트엔드 (TypeScript/React)

#### 네이밍 컨벤션
- **컴포넌트**: PascalCase (`OrderManagePage`, `SubAccountForm`)
- **함수/변수**: camelCase (`handleSubmit`, `formData`)
- **상수**: UPPER_SNAKE_CASE (`API_BASE_URL`, `ERROR_MESSAGES`)
- **타입/인터페이스**: PascalCase (`OrderRequest`, `UserResponse`)

#### Import 순서
1. React
2. 외부 라이브러리 (react-router-dom, @mui/material 등)
3. Material-UI 컴포넌트
4. Material-Icons
5. 프로젝트 내부 모듈 (상대 경로)

#### 코드 스타일
- 들여쓰기: 2 spaces
- 파일 끝: 빈 줄 하나
- Prettier 설정 사용

#### 예제
```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { validateSignupForm } from '../utils/validation';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState<SignupRequest>({
    email: '',
    password: '',
    name: '',
    phone: '',
    storeId: 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ...
  };

  return (
    <Container>
      {/* ... */}
    </Container>
  );
};

export default SignupPage;
```

## 아키텍처

### 백엔드 아키텍처

#### 레이어 구조
```
Controller Layer (REST API)
    ↓
Service Layer (비즈니스 로직)
    ↓
Repository Layer (데이터 액세스)
    ↓
Database (MySQL)
```

#### 주요 패턴
- **DTO 패턴**: Entity와 DTO 분리
- **Builder 패턴**: DTO 변환에 사용 (`OrderResponse.from()`)
- **Repository 패턴**: 데이터 액세스 추상화
- **Service 패턴**: 비즈니스 로직 캡슐화

#### 예외 처리
- `GlobalExceptionHandler`: 전역 예외 처리
- `BusinessException`: 비즈니스 예외
- 표준화된 에러 응답 형식

### 프론트엔드 아키텍처

#### 컴포넌트 구조
```
Pages (페이지 컴포넌트)
    ↓
Components (재사용 컴포넌트)
    ↓
Services (API 호출)
    ↓
Context (전역 상태 관리)
```

#### 상태 관리
- **React Context API**: 전역 상태 (인증, 알림)
- **로컬 상태**: `useState` 훅 사용
- **서버 상태**: API 호출 후 상태 업데이트

#### 라우팅
- **React Router**: 클라이언트 사이드 라우팅
- **PrivateRoute**: 인증이 필요한 라우트 보호

## 개발 환경 설정

### 필수 도구
- Java 21+
- Node.js 18+
- MySQL 8.0+ 또는 Docker
- IDE: IntelliJ IDEA 또는 VS Code

### 환경 변수

#### 백엔드 (`.env`)
```env
DB_URL=jdbc:mysql://localhost:3307/qr_coffee_order
DB_USERNAME=root
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
JWT_EXPIRATION=1800000
```

#### 프론트엔드 (`frontend/qrcoffee-frontend/.env`)
```env
REACT_APP_API_URL=http://localhost:8080
```

### 개발 서버 실행

```bash
# 백엔드
cd backend
./gradlew bootRun

# 프론트엔드
cd frontend/qrcoffee-frontend
npm install
npm start
```

## 테스트

### 백엔드 테스트

```bash
cd backend
./gradlew test
```

#### 테스트 구조
- **Unit Test**: Service, Repository 단위 테스트
- **Integration Test**: Controller 통합 테스트
- **TestSecurityConfig**: 테스트용 Security 설정

### 프론트엔드 테스트

```bash
cd frontend/qrcoffee-frontend
npm test
```

#### 테스트 구조
- **Component Test**: 컴포넌트 렌더링 테스트
- **Service Test**: API 서비스 테스트
- **E2E Test**: (예정)

## 디버깅

### 백엔드 디버깅
- 로깅: SLF4J 사용 (`@Slf4j`)
- 로그 레벨: `application.yml`에서 설정
- 디버그 모드: IDE에서 원격 디버깅 설정

### 프론트엔드 디버깅
- React DevTools: 컴포넌트 상태 확인
- 브라우저 DevTools: 네트워크 요청 확인
- 콘솔 로그: `console.log` 사용

## 공통 유틸리티

### 백엔드
- `Constants`: 공통 상수 정의
- `ValidationUtils`: 검증 유틸리티
- `JwtUtil`: JWT 토큰 처리
- `QRCodeUtil`: QR코드 생성

### 프론트엔드
- `utils/validation.ts`: 폼 검증 유틸리티
- `utils/constants.ts`: 공통 상수 정의
- `services/api.ts`: Axios 인스턴스 및 인터셉터

## 코드 리뷰 체크리스트

- [ ] 코딩 컨벤션 준수
- [ ] 테스트 코드 작성
- [ ] 예외 처리 구현
- [ ] 로깅 추가
- [ ] JavaDoc/주석 작성
- [ ] 보안 검토
- [ ] 성능 고려

## 참고 자료

- [Spring Boot 공식 문서](https://spring.io/projects/spring-boot)
- [React 공식 문서](https://react.dev)
- [Material-UI 문서](https://mui.com)
- [토스페이먼츠 개발자센터](https://developers.tosspayments.com)
