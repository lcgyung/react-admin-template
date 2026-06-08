# React Admin Template

React, TypeScript, Vite 기반의 관리자(Admin) 템플릿입니다.

MUI, React Query, Zustand, React Hook Form을 활용하여 CMS, ERP, Back Office, 운영 대시보드를 빠르게 구축할 수 있도록 설계되었습니다.

---

## 🚀 Tech Stack

* React
* TypeScript
* Vite
* MUI
* React Router
* React Query
* Axios
* Zustand
* React Hook Form
* Zod
* Dayjs
* ESLint
* Prettier
* Husky
* Lint-Staged

---

## ✨ Features

* TypeScript 기반 개발 환경
* Material UI 기반 관리자 UI
* React Query 서버 상태 관리
* Zustand 전역 상태 관리
* Axios API Layer
* React Hook Form + Zod Validation
* ESLint + Prettier 적용
* Husky + Lint-Staged Git Hooks
* 확장 가능한 프로젝트 구조

---

## 🤔 Why This Template?

* 빠른 관리자 시스템 구축
* 실무 중심 아키텍처
* 타입 안정성 보장
* 최소한의 보일러플레이트
* 유지보수 용이성

---

## 📂 Project Structure

```text
src
├── api
├── components
├── hooks
├── layouts
├── pages
├── providers
├── routes
├── schemas
├── stores
├── types
└── utils
```

---

## 📦 Installation

```bash
git clone <repository-url>

cd react-admin-template

npm install
npm run dev
```

---

## ⚙️ Environment

```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 📡 API Example

```typescript
export const getUsers = () => {
  return axiosInstance.get('/users');
};
```

---

## 📝 Validation Example

```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

---

## 🗺 Roadmap

* [ ] Authentication
* [ ] RBAC
* [ ] Dark Mode
* [ ] Storybook
* [ ] Docker
* [ ] GitHub Actions

---

## 📄 License

MIT License
