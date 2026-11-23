const { test, expect } = require('@playwright/test')
const { randomUUID } = require('node:crypto')

// Casos manuais do integrante 2 automatizados pelo integrante 3.
// UI-06 -> CT-03 | UI-07 -> CT-05 | UI-08 -> CT-10 | UI-09 -> CT-07 (BUG-02)
// A interface roda em ingles, como em integrante3.spec.js. As mensagens
// verificadas sao as originais do Juice Shop, equivalentes as do caso manual.

test.use({ locale: 'en-US', viewport: { width: 1280, height: 960 }, serviceWorkers: 'block' })
test.setTimeout(60000)

test.beforeEach(async ({ context, baseURL }) => {
  const origin = new URL(baseURL).origin
  await context.addCookies([
    { name: 'cookieconsent_status', value: 'dismiss', url: origin },
    { name: 'welcomebanner_status', value: 'dismiss', url: origin },
    { name: 'language', value: 'en', url: origin }
  ])
})

async function evidence (page, testInfo, name) {
  await testInfo.attach(name, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png'
  })
}

// Cria uma conta ficticia nova pela API, para cada teste comecar do zero.
async function createUser (request) {
  const nonce = randomUUID()
  const email = `qa-ui-${nonce}@example.test`
  const password = `Qa!${randomUUID().replace(/-/g, '').slice(0, 18)}9a`
  const questions = await (await request.get('/api/SecurityQuestions/')).json()
  const question = questions.data[0]
  const userResponse = await request.post('/api/Users/', {
    data: { email, password, passwordRepeat: password, securityQuestion: question, securityAnswer: nonce }
  })
  await expect(userResponse, 'Preparacao: falha ao cadastrar a conta ficticia.').toBeOK()
  const id = (await userResponse.json()).data.id
  await request.post('/api/SecurityAnswers/', {
    data: { UserId: id, answer: nonce, SecurityQuestionId: question.id }
  })
  return { email, password }
}

async function submitLogin (page, email, password) {
  await page.goto('/#/login')
  await page.locator('#email').fill(email)
  await page.locator('#password').fill(password)
  const [response] = await Promise.all([
    page.waitForResponse(r => new URL(r.url()).pathname === '/rest/user/login'),
    page.locator('#loginButton').click()
  ])
  return response
}

async function searchFor (page, term) {
  const input = page.locator('#searchQuery input')
  if (!(await input.isVisible())) {
    await page.locator('#searchQuery button[aria-label="Open search"]').click()
  }
  await input.fill(term)
  await input.press('Enter')
  await expect(page.locator('#searchValue')).toHaveText(term)
}

test('UI-06 | e-mail nao cadastrado e rejeitado com a mesma mensagem (CT-03)', async ({ page, request }, testInfo) => {
  const alert = page.locator('app-login p.error[role="alert"]')

  // Referencia: a mensagem para uma conta que existe, com senha errada.
  const user = await createUser(request)
  const wrongPassword = await submitLogin(page, user.email, 'Errada@999')
  expect(wrongPassword.status()).toBe(401)
  await expect(alert).toBeVisible()
  const messageExistingEmail = (await alert.innerText()).trim()

  await test.step('Entrar com um e-mail que nao existe', async () => {
    const email = `naoexiste-${randomUUID()}@example.test`
    const response = await submitLogin(page, email, 'Teste@123')
    expect(response.status(), 'O login com e-mail inexistente deve receber HTTP 401.').toBe(401)
    await expect(page).toHaveURL(/#\/login/)
    await expect(alert).toHaveText('Invalid email or password.')
    // Mesma mensagem nos dois casos: a tela nao revela se o e-mail existe.
    expect((await alert.innerText()).trim()).toBe(messageExistingEmail)
    expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull()
    await evidence(page, testInfo, 'UI-06-email-inexistente')
  })
})

test('UI-07 | busca por termo inexistente nao mostra produtos (CT-05)', async ({ page }, testInfo) => {
  // Diferente do UI-05, aqui a resposta vem do servidor real, sem mock.
  await page.goto('/#/search')
  await test.step('Pesquisar xyzabc123', async () => {
    await searchFor(page, 'xyzabc123')
    await expect(page.locator('app-search-result .emptyState')).toBeVisible()
    await expect(page.getByText('No results found')).toBeVisible()
    await expect(page.locator('app-search-result button.btn-basket')).toHaveCount(0)
    await evidence(page, testInfo, 'UI-07-busca-sem-resultado-real')
  })
})

test('UI-08 | cadastro com senhas diferentes e bloqueado (CT-10)', async ({ page }, testInfo) => {
  await page.goto('/#/register')
  await test.step('Preencher senha Teste@123 e repeticao Teste@321', async () => {
    await page.locator('#emailControl').fill(`qa-ui-${randomUUID()}@example.test`)
    await page.locator('#passwordControl').fill('Teste@123')
    await page.locator('#repeatPasswordControl').fill('Teste@321')
    await page.locator('#repeatPasswordControl').blur()
    await expect(page.getByText('Passwords do not match')).toBeVisible()
    await expect(page.locator('#registerButton')).toBeDisabled()
    await evidence(page, testInfo, 'UI-08-senhas-diferentes')
  })
})

test('UI-09 | carrinho: + duas vezes e - uma vez deixa 2 unidades e total correto (CT-07, BUG-02)', async ({ page, request }, testInfo) => {
  const user = await createUser(request)
  const login = await submitLogin(page, user.email, user.password)
  expect(login.status()).toBe(200)
  await expect(page).toHaveURL(/#\/search/)

  // Mesmo produto do caso manual: Apple Juice (Suco de maca 1000ml).
  const productName = 'Apple Juice (1000ml)'
  const products = await (await page.request.get('/rest/products/search', { params: { q: '' } })).json()
  const product = products.data.find(p => p.name === productName)
  expect(product, `O catalogo precisa ter o produto ${productName}.`).toBeTruthy()
  const unitPrice = Number(product.price)

  const cartButton = page.getByRole('button', { name: 'Show the shopping cart', exact: true })
  const badge = cartButton.locator('.warn-notification')

  await searchFor(page, productName)
  await page.locator('app-search-result mat-card')
    .filter({ has: page.getByText(productName, { exact: true }) })
    .locator('button.btn-basket').click()
  await expect(badge).toHaveText('1')
  await cartButton.click()
  await expect(page).toHaveURL(/#\/basket/)

  const row = page.locator('app-purchase-basket mat-row')
    .filter({ has: page.locator('.mat-column-product').filter({ hasText: productName }) })
  const quantity = row.locator('.mat-column-quantity > span.cell-initial-font')
  const buttons = row.locator('.mat-column-quantity button')
  const totalText = page.locator('#price')

  await test.step('Clicar em + duas vezes e em - uma vez', async () => {
    await buttons.nth(1).click()
    await expect(quantity).toHaveText('2')
    await buttons.nth(1).click()
    await expect(quantity).toHaveText('3')
    await buttons.nth(0).click()
    await expect(quantity).toHaveText('2')
  })

  await test.step('Conferir total e contador da cesta (BUG-02)', async () => {
    const expected = (unitPrice * 2).toFixed(2)
    await expect(totalText).toContainText(expected)
    await expect(badge).toHaveText('2')
    await evidence(page, testInfo, 'UI-09-duas-unidades-total')
  })

  // Limpa o carrinho para nao deixar estado para a proxima execucao.
  await row.locator('.mat-column-remove button').click()
  await expect(page.locator('app-purchase-basket mat-row')).toHaveCount(0)
})
