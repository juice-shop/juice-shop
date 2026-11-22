const { test, expect } = require('@playwright/test');

test('API - a consulta de produtos retorna uma lista', async ({ request }) => {
  const response = await request.get('/rest/products/search', {
    params: {
      q: '',
    },
  });

  expect(response.status()).toBe(200);

  const body = await response.json();

  expect(body.status).toBe('success');
  expect(Array.isArray(body.data)).toBe(true);
});