# 기여 가이드

QR Coffee Order System에 기여해주셔서 감사합니다!

## 기여 방법

1. 이 저장소를 Fork합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 개발 환경 설정

자세한 내용은 [README.md](README.md)와 [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)를 참고하세요.

## 코딩 스타일

### 백엔드 (Java)
- Java 코딩 컨벤션 준수
- 와일드카드 import 사용 금지
- 명시적 import 사용
- JavaDoc 주석 작성 (공개 메서드)

### 프론트엔드 (TypeScript/React)
- TypeScript 사용
- Prettier 설정 준수
- Import 순서 준수
- 컴포넌트명은 PascalCase

자세한 내용은 [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)를 참고하세요.

## 커밋 메시지 규칙

커밋 메시지는 다음 형식을 따릅니다:

```
<type>: <subject>

<body>

<footer>
```

### Type
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅, 세미콜론 누락 등
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드 추가/수정
- `chore`: 빌드 업무 수정, 패키지 매니저 설정 등

### 예제
```
feat: 주문 취소 기능 추가

- 주문 취소 API 엔드포인트 구현
- 주문 취소 시 결제 취소 로직 추가
- 주문 취소 페이지 UI 구현

Closes #123
```

## Pull Request 가이드

### PR 제목 형식
```
<type>: <간단한 설명>
```

### PR 본문 형식
```markdown
## 변경사항
- 변경 내용 1
- 변경 내용 2

## 테스트
- 테스트 방법 설명

## 관련 이슈
Closes #123
```

### PR 체크리스트
- [ ] 코드가 코딩 컨벤션을 따릅니다
- [ ] 테스트 코드를 작성했습니다
- [ ] 기존 테스트가 통과합니다
- [ ] 문서를 업데이트했습니다 (필요한 경우)
- [ ] 커밋 메시지가 규칙을 따릅니다

## 이슈 리포트

버그를 발견하셨다면 다음 정보를 포함해주세요:

- **버그 설명**: 무엇이 문제인지
- **재현 방법**: 버그를 재현하는 단계
- **예상 동작**: 어떻게 동작해야 하는지
- **실제 동작**: 실제로 어떻게 동작하는지
- **환경 정보**: OS, 브라우저, 버전 등

## 기능 제안

새로운 기능을 제안하고 싶으시다면:

- **기능 설명**: 무엇을 추가하고 싶은지
- **사용 사례**: 왜 이 기능이 필요한지
- **구현 아이디어**: 어떻게 구현할 수 있을지 (선택사항)

## 질문

질문이 있으시면 이슈를 생성해주세요. 라벨에 `question`을 추가해주시면 감사하겠습니다.

## 라이선스

기여하시는 코드는 프로젝트의 라이선스를 따릅니다.

---

감사합니다! 🎉
