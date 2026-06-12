import { expect, test } from '@playwright/test';

test('데모 계정으로 로그인하면 대시보드로 이동한다', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('이메일').fill('admin@example.com');
  await page.getByLabel('비밀번호').fill('password');
  await page.getByRole('button', { name: '로그인' }).click();

  // 로그인 성공 시 대시보드(paths.dashboard === '/')로 이동한다.
  await expect(page).toHaveURL('http://localhost:4173/');
});
