# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: health.spec.ts >> health check api returns ok
- Location: tests/e2e/health.spec.ts:3:5

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('health check api returns ok', async ({ request, baseURL }) => {
  4  |   const response = await request.get(`${baseURL}/api/health`);
> 5  |   expect(response.ok()).toBeTruthy();
     |                         ^ Error: expect(received).toBeTruthy()
  6  |   
  7  |   const body = await response.json();
  8  |   expect(body.status).toBe('ok');
  9  | });
  10 | 
```