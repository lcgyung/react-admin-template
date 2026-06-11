import { execSync } from 'node:child_process';

/**
 * FSD 슬라이스 골격 제너레이터.
 *
 * `pnpm gen:slice` 로 feature/entity 슬라이스를 정본 골격대로 생성한다
 * (`.claude/rules/slice-blueprint.md` 와 1:1). 생성물은 ESLint 구조 규칙(queryKey 상수 객체·named export·axios 격리)을
 * 통과하도록 작성돼 있다. plop 은 Write 툴이 아니라 PostToolUse 포맷 훅이 걸리지 않으므로,
 * 생성 직후 prettier/eslint --fix 를 직접 적용한다.
 *
 * @param {import('plop').NodePlopAPI} plop
 */
export default function (plop) {
  plop.setGenerator('slice', {
    description: 'FSD feature/entity 슬라이스 골격 생성',
    prompts: [
      {
        type: 'list',
        name: 'layer',
        message: '레이어를 선택하세요',
        choices: ['features', 'entities'],
      },
      {
        type: 'input',
        name: 'name',
        message: '슬라이스 이름 (예: posts, user-profile)',
        validate: (value) =>
          /^[a-z][a-z0-9-]*$/.test(value)
            ? true
            : '소문자로 시작하고 영소문자/숫자/하이픈만 사용하세요.',
      },
    ],
    actions(data) {
      const slug = plop.getHelper('dashCase')(data.name);
      const dir = `src/${data.layer}/${slug}`;
      const group = data.layer === 'features' ? 'feature' : 'entity';
      const tpl = (file) => `tools/templates/slice/${group}/${file}`;

      const actions =
        group === 'feature'
          ? [
              { type: 'add', path: `${dir}/index.ts`, templateFile: tpl('index.ts.hbs') },
              {
                type: 'add',
                path: `${dir}/api/{{camelCase name}}Api.ts`,
                templateFile: tpl('api.ts.hbs'),
              },
              {
                type: 'add',
                path: `${dir}/model/{{camelCase name}}Schema.ts`,
                templateFile: tpl('schema.ts.hbs'),
              },
              {
                type: 'add',
                path: `${dir}/model/use{{pascalCase name}}.ts`,
                templateFile: tpl('hook.ts.hbs'),
              },
            ]
          : [
              { type: 'add', path: `${dir}/index.ts`, templateFile: tpl('index.ts.hbs') },
              { type: 'add', path: `${dir}/model/types.ts`, templateFile: tpl('types.ts.hbs') },
            ];

      // 생성물 정렬/포맷 정리. eslint --fix(import·export 정렬) 후 prettier(정렬로 깨진 간격 보정) 순서.
      actions.push(() => {
        try {
          execSync(`pnpm exec eslint --fix "${dir}"`, { stdio: 'inherit' });
          execSync(`pnpm exec prettier --write "${dir}"`, { stdio: 'inherit' });
        } catch {
          return `생성됨(포맷 보정 일부 실패 — 'pnpm lint' 로 확인): ${dir}`;
        }
        return `생성·정렬 완료: ${dir}`;
      });

      return actions;
    },
  });
}
