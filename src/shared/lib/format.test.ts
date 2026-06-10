import { describe, expect, it } from 'vitest';

import { formatDate, formatDateTime } from './format';

describe('format', () => {
  it('formatDate 는 기본 YYYY-MM-DD 포맷을 반환한다', () => {
    expect(formatDate('2026-06-09T10:30:00')).toBe('2026-06-09');
  });

  it('formatDate 는 커스텀 템플릿을 지원한다', () => {
    expect(formatDate('2026-06-09', 'YYYY/MM/DD')).toBe('2026/06/09');
  });

  it('formatDateTime 은 날짜와 시각을 포함한다', () => {
    expect(formatDateTime('2026-06-09T10:30:00')).toBe('2026-06-09 10:30');
  });
});
