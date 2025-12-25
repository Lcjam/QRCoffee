# Changelog

모든 주요 변경사항은 이 파일에 기록됩니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

### Added
- 프로젝트 점검 1-4단계 작업 완료
- 백엔드 공통 상수 클래스 (`Constants.java`)
- 프론트엔드 공통 검증 유틸리티 (`utils/validation.ts`)
- 프론트엔드 공통 상수 정의 (`utils/constants.ts`)
- Prettier 설정 파일
- API 문서 (`docs/API.md`)
- 개발 가이드 (`docs/DEVELOPMENT.md`)
- 기여 가이드 (`CONTRIBUTING.md`)

### Changed
- 백엔드 와일드카드 import 제거 (25개 파일)
- 프론트엔드 import 순서 통일
- 파일 끝 빈 줄 통일
- 각 Service의 상수를 `Constants`로 중앙화
- 폼 검증 로직을 공통 유틸리티로 통합

### Removed
- 프론트엔드 불필요한 파일 (`logo.svg`, `App.css`, `App.test.tsx`)
- 주석 처리된 코드 제거
- Claude 자동 코드 리뷰 워크플로우 제거

## [1.0.0] - 2024-12-23

### Added
- 프로젝트 초기 설정 및 기반 구조
- 사용자 관리 시스템 (회원가입, 로그인, 서브계정)
- 매장 관리 시스템
- 메뉴 관리 시스템
- 좌석 및 QR코드 관리
- 주문 시스템
- 결제 시스템 (토스페이먼츠 연동)
- 실시간 알림 시스템 (WebSocket)
- 관리자 대시보드
- Docker MySQL 통합
- 환경 변수 관리

### Security
- JWT 기반 인증/인가
- 주문 소유권 검증 시스템
- WebSocket 보안 강화
- XSS 방지 (DOMPurify)
- 입력 검증 강화

### Performance
- N+1 쿼리 문제 해결
- 네이티브 쿼리 최적화
- 페이지네이션 구현

---

## 버전 형식

- **Major**: 호환되지 않는 API 변경
- **Minor**: 하위 호환성을 유지하는 기능 추가
- **Patch**: 하위 호환성을 유지하는 버그 수정

## 변경 유형

- **Added**: 새로운 기능 추가
- **Changed**: 기존 기능 변경
- **Deprecated**: 곧 제거될 기능
- **Removed**: 제거된 기능
- **Fixed**: 버그 수정
- **Security**: 보안 관련 변경
