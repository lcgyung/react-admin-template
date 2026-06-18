# 0010. 디자인 시스템 — 토큰 단일 소스 + 우회 차단(ESLint)

- 상태: Accepted
- 날짜: 2026-06-18

## 맥락

이 템플릿은 관리자(admin) 도구의 출발점이다. 색·간격·타이포 같은 디자인 값이 한 곳에서 일관되게
관리되어야 파생 프로젝트가 테마(다크모드 포함)를 안전하게 확장할 수 있다.

문제는 일관성을 강제할 장치가 약했다는 점이다. 도입 전 디자인 강제는 ESLint `no-restricted-syntax`의
`#hex` 차단 **단 하나**였고, rgb/hsl 리터럴·인라인 `fontWeight`·인라인 `style` 같은 토큰 우회 경로는
무방비였다. 또 타이포 토큰이 h1/h2/h3만 정의돼 있어 h4/h5/h6은 컴포넌트가 `sx={{ fontWeight: 700 }}`로
보정하는 비대칭이 있었다(토큰에 있어야 할 것이 인라인으로 샌 상태).

## 결정

### 1. 브랜드 팔레트는 tokens.ts 한 곳에 정의

`features/theme/model/tokens.ts` 가 브랜드 색(primary/secondary/상태색)·표면색의 **유일한 정의처**이며,
하드코딩 `#hex` 가 허용되는 유일한 파일이다(ESLint override). 컴포넌트에서는 색을 하드코딩하지 말고
`theme.palette.*` **시맨틱 토큰**(`primary.main`, `error`, `text.secondary`, `action.selected` 등)을 `sx`로
참조한다. 라이트/다크는 `palette(mode)` 가 mode 별 표면색을 제공한다.

### 2. 토큰 단일 소스 = `features/theme/model/tokens.ts`

색·간격(`spacingUnit = 8`)·모서리(`shape.borderRadius = 8`)·타이포(`typography`, Pretendard 스택)를 이 파일
한 곳에 모은다. `createTheme` 호출은 `createAppTheme` 팩토리 **한 곳뿐**이며, 앱(`ui/ThemeProvider`)과
Storybook(`.storybook/preview`)이 이 팩토리를 공유해 동일 토큰을 본다.

### 3. 토큰 우회 차단 — ESLint가 하드 강제 (정적 가드레일)

`eslint.config.js`의 `no-restricted-syntax`가 다음을 **error로 차단**한다(`gate.sh` Stop 게이트·CI `lint`가
자동 집행). 단일 소스 `tokens.ts`·스토리는 예외.

| 차단 대상                      | 이유                          | 대안                                       |
| ------------------------------ | ----------------------------- | ------------------------------------------ |
| `#hex` 리터럴(tokens.ts 외)    | 색 하드코딩                   | `theme.palette.*` 시맨틱 토큰              |
| `rgb()/hsl()` 리터럴           | `#hex` 우회로 색 박기         | `theme.palette.*` 시맨틱 토큰              |
| 인라인 `fontWeight`/`fontSize` | Typography variant 우회       | `<Typography variant>` / tokens.ts variant |
| 인라인 `style` prop            | sx 우회(테마·다크모드 미적용) | `sx`                                       |

새 타이포 스케일이 필요하면 컴포넌트에 인라인으로 박지 말고 **tokens.ts에 variant를 추가**한다
(이 ADR과 함께 h4/h5/h6을 토큰화한 것이 선례).

### 4. ESLint가 못 막는 회색지대 — 리뷰가 받는다 (소프트 가드레일)

다음은 정적 selector로 막으면 false positive가 커서 **의도적으로 차단하지 않는다**. 대신
`.claude/rules/code-style.md`(작성 가이드)와 `.claude/skills/code-review/SKILL.md`(리뷰 체크)가 받는다.

- **named CSS 색**(`'red'`)과 `'inherit'/'transparent'/'currentColor'` — 후자는 정당한 용처가 많다
  (예: AppBar 톤 상속). 색 이름 하드코딩만 리뷰가 잡는다.
- **magic px 숫자 리터럴** — spacing index·zIndex·flex 등과 AST로 구분 불가. 의미 있는 상수/`spacing()`
  사용 여부를 리뷰가 본다.

### 5. 레이아웃 수치는 테마가 아니라 슬라이스 모듈 상수

`DRAWER_WIDTH` 같은 레이아웃 폭은 디자인 토큰(간격/타이포/색/모서리)이 아니므로 테마에 올리지 않는다.
해당 슬라이스(`widgets/main-layout`)의 모듈 상수로 둔다 — 테마 스키마에 MUI 표준 밖 커스텀 키를 더하면
톤앤매너에서 벗어나고, 테마(features)가 특정 widget의 수치를 아는 FSD 역결합이 생긴다.

## 대안

- **MUI 기본 팔레트만 사용(커스텀 색 없음)**: 다크모드·대비·상태색을 MUI가 전부 책임져 유지비가 낮지만
  독자 브랜드 아이덴티티를 잃는다. 이 템플릿은 브랜드 색을 `tokens.ts` 한 곳에 캡슐화하는 쪽을 택했다
  (필요 시 결정 1을 갱신해 MUI 기본으로 되돌릴 수 있다).
- **인라인 스타일을 린트가 아니라 리뷰로만 관리**: 강제력이 약해 신규 코드에서 회귀가 새기 쉽다.
  정적 강제(error 승격)는 도입 시 위반을 한 번 정리하면 이후 회귀를 사실상 0 비용으로 막는다.

## 결과

- 디자인 일관성을 ESLint가 강제하고, 색·타이포의 단일 소스가 `tokens.ts`로 고정된다.
- 타이포 토큰 비대칭(h4/h5/h6)이 해소돼 `fontWeight`가 tokens.ts 한 곳으로 수렴했다.
- 트레이드오프: 브랜드 팔레트를 쓰므로 다크모드 대비·상태색은 `tokens.ts`에서 함께 관리해야 한다.
- 후속(옵션): Storybook 토큰 카탈로그 스토리, light/dark 데코레이터로 다크 회귀 검증 채널 추가.
