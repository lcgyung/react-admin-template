// Conventional Commits 강제 — .husky/commit-msg 훅이 사용.
// 타입 목록은 CONTRIBUTING.md "커밋 / PR 컨벤션"과 정합.
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'chore',
        'docs',
        'refactor',
        'test',
        'style',
        'perf',
        'build',
        'ci',
        'revert',
      ],
    ],
  },
};
