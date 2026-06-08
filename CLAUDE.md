# CLAUDE.md

이 문서는 Claude Code(claude.ai/code)가 이 리포지토리에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

**React Admin Template** — React + TypeScript + Vite 기반의 관리자(Admin) 템플릿입니다.
CMS, ERP, Back Office, 운영 대시보드 등을 빠르게 구축하는 것을 목표로 합니다.

## ⚠️ 현재 상태 (중요)

현재 리포지토리에는 **소스 코드가 아직 없습니다.** 추적되는 파일은 `README.md`와
`LICENSE`뿐이며, `package.json`·빌드 설정·`src/` 디렉터리는 아직 존재하지 않습니다.
이 프로젝트는 **초기 스캐폴딩 단계**입니다.

따라서 아래 내용은 실제 코드 분석이 아니라 `README.md`가 정의한 **의도된 설계(기술 스택,
디렉터리 구조, 컨벤션)** 를 기준으로 작성된 가이드입니다. 향후 코드를 추가할 때 이 방향을
유지하세요. 실제 구현이 시작되면 이 문서를 코드 기준으로 업데이트해야 합니다.

## 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| 코어 | React, TypeScript, Vite |
| UI | MUI (Material UI) |
| 라우팅 | React Router |
| 서버 상태 | React Query |
| HTTP 클라이언트 | Axios |
| 전역 상태 | Zustand |
| 폼 / 검증 | React Hook Form, Zod |
| 날짜 | Dayjs |
| 코드 품질 | ESLint, Prettier |
| Git 훅 | Husky, Lint-Staged |

## 개발 명령어

> `package.json`이 아직 없으므로 아래는 `README.md`에 명시된 명령어입니다.
> 프로젝트 초기화 후 실제 스크립트에 맞게 갱신하세요.

```bash
npm install   # 의존성 설치
npm run dev   # 개발 서버 실행 (Vite)
```

`package.json` 생성 시 추가될 것으로 예상되는 명령어 (구현되면 이 섹션을 채울 것):

```bash
# npm run build   # 프로덕션 빌드
# npm run lint    # ESLint 검사
# npm run format  # Prettier 포매팅
```

## 프로젝트 구조

`README.md`가 정의한 의도된 `src/` 레이아웃입니다:

```text
src
├── api          # Axios 인스턴스 및 API 호출 함수 (서버 통신 레이어)
├── components   # 재사용 가능한 UI 컴포넌트
├── hooks        # 커스텀 React 훅 (React Query 훅 포함)
├── layouts      # 페이지 레이아웃 (사이드바, 헤더 등)
├── pages        # 라우트 단위 페이지 컴포넌트
├── providers    # 전역 Provider (Query Client, Theme 등)
├── routes       # React Router 라우트 정의
├── schemas      # Zod 검증 스키마
├── stores       # Zustand 전역 상태 스토어
├── types        # 공용 TypeScript 타입 정의
└── utils        # 유틸리티 함수
```

## 아키텍처 / 상태 관리 규칙

코드 작성 시 다음 역할 분담을 따르세요:

- **서버 상태** → React Query로 관리 (페칭/캐싱/동기화). 컴포넌트에서 직접 `axios`를
  호출하지 말고 `src/hooks`의 React Query 훅을 거치도록 합니다.
- **전역 클라이언트 상태** → Zustand 스토어(`src/stores`)로 관리.
- **API 호출** → `src/api`의 Axios 인스턴스 레이어에 함수로 정의. 예시:

  ```typescript
  export const getUsers = () => {
    return axiosInstance.get('/users');
  };
  ```

- **폼 / 검증** → React Hook Form + Zod 조합. 스키마는 `src/schemas`에 정의. 예시:

  ```typescript
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });
  ```

## 코드 컨벤션

- **타입 안정성 우선** — TypeScript 타입을 명확히 지정하고 `any` 사용을 지양합니다.
- **최소 보일러플레이트** — 불필요한 추상화를 피하고 간결하게 작성합니다.
- **ESLint + Prettier** — 모든 코드는 린트/포매팅 규칙을 통과해야 합니다.
- **Husky + Lint-Staged** — 커밋 시 변경된 파일에 자동으로 린트/포매팅이 적용됩니다.
  커밋 전에 규칙 위반이 없는지 확인하세요.

## 환경 변수

`.env` 파일에 정의합니다 (Vite 규칙상 `VITE_` 접두사 필요):

```env
VITE_API_BASE_URL=http://localhost:3000
```

## 로드맵 (참고)

`README.md`에 명시된 향후 작업 항목입니다. 관련 기능을 작업할 때 참고하세요:

- [ ] Authentication (인증)
- [ ] RBAC (역할 기반 접근 제어)
- [ ] Dark Mode (다크 모드)
- [ ] Storybook
- [ ] Docker
- [ ] GitHub Actions
