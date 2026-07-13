import { test, expect } from '@playwright/test';

test('health check api returns ok', async ({ request, baseURL }) => {
  const response = await request.get(`${baseURL}/api/health`);
  expect(response.ok()).toBeTruthy();
  
  const body = await response.json();
  expect(body.status).toBe('ok');
});
