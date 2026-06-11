// 로그인 요청/응답 DTO 는 orval 생성 타입을 소비한다(수동 fetch 타이핑 금지).
// 도메인 User 는 entities/user 를 단일 출처로 유지한다(ADR 0004 참고).
export type { LoginRequest, LoginResponse } from '@/shared/api';
