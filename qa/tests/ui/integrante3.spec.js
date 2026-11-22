const { test, expect } = require('@playwright/test')
const { randomUUID } = require('node:crypto')

// Testes de interface do integrante 3 com Playwright.
// Alvo: OWASP Juice Shop 20.4.0-SNAPSHOT em http://localhost:3000.
// Os seletores foram conferidos nos fontes do Juice Shop (commit c9f99228d):
// tela de login, barra de navegação e carrinho.

async function prepareBrowser (context, baseURL) {
  if (!baseURL) {
    throw new Error('Defina use.baseURL na configuração Playwright do pacote QA.')
  }

  const origin = new URL(baseURL).origin
  await context.addCookies([
    { name: 'cookieconsent_status', value: 'dismiss', url: origin },
    { name: 'welcomebanner_status', value: 'dismiss', url: origin },
    { name: 'language', value: 'en', url: origin }
  ])
}

async function createUser (request) {
  // Dados fictícios e exclusivos desta preparação. Não usa contas administrativas.
  const nonce = randomUUID()
  const email = `qa-ui-${nonce}@example.test`
  const password = `Qa!${randomUUID().replace(/-/g, '').slice(0, 18)}9a`
  const securityAnswer = `Resposta ficticia ${nonce}`

  const questionsResponse = await request.get('/api/SecurityQuestions/')
  await expect(questionsResponse, 'Preparação: não foi possível obter as perguntas de segurança.').toBeOK()
  const questionsPayload = await questionsResponse.json()

  if (!Array.isArray(questionsPayload.data)) {
    throw new Error('Preparação: /api/SecurityQuestions/ não retornou data como lista.')
  }
  const question = questionsPayload.data.find(item =>
    Number.isInteger(item.id) && typeof item.question === 'string'
  )
  if (!question) {
    throw new Error('Preparação: nenhuma pergunta de segurança válida foi retornada.')
  }

  // Espelha as duas operações realizadas pelo cadastro da interface oficial.
  const userResponse = await request.post('/api/Users/', {
    data: {
      email,
      password,
      passwordRepeat: password,
      securityQuestion: question,
      securityAnswer
    }
  })
  await expect(userResponse, 'Preparação: falha ao cadastrar a conta fictícia.').toBeOK()
  const userPayload = await userResponse.json()
  const id = userPayload.data && userPayload.data.id
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('Preparação: o cadastro não retornou um identificador de usuário válido.')
  }

  const answerResponse = await request.post('/api/SecurityAnswers/', {
    data: { UserId: id, answer: securityAnswer, SecurityQuestionId: question.id }
  })
  await expect(answerResponse, 'Preparação: falha ao cadastrar a resposta de segurança.').toBeOK()

  // O servidor oficial proíbe DELETE /api/Users/:id. Não há limpeza fictícia aqui.
  // A conta permanece como dado de laboratório até a restauração do ambiente.
  return { id, email, password }
}

async function submitLogin (page, user) {
  await page.goto('/#/login')
  await expect(page.locator('#login-form')).toBeVisible()
  await page.locator('#email').fill(user.email)
  await page.locator('#password').fill(user.password)

  const [response] = await Promise.all([
    page.waitForResponse(response =>
      new URL(response.url()).pathname === '/rest/user/login' &&
      response.request().method() === 'POST'
    ),
    page.locator('#loginButton').click()
  ])

  return response
}

async function expectSignedIn (page, email, { closeMenu = true } = {}) {
  await expect(page).toHaveURL(/#\/search(?:\?.*)?$/)
  await page.locator('#navbarAccount').click()
  const profile = page.getByRole('menuitem', {
    name: 'Go to user profile', exact: true
  })
  await expect(profile).toBeVisible()
  await expect(profile).toContainText(email)
  await expect(page.locator('#navbarLogoutButton')).toBeVisible()

  if (closeMenu) {
    await page.keyboard.press('Escape')
    await expect(page.locator('#navbarLogoutButton')).toBeHidden()
  }
}

async function loginThroughUi (page, user, options = {}) {
  const response = await submitLogin(page, user)
  expect(response.status(), 'O login válido deve receber HTTP 200.').toBe(200)
  await expectSignedIn(page, user.email, options)
  // Se necessário, o chamador pode ler response.json() para preparar uma
  // consulta autenticada de estoque; não anexar tokens a relatórios públicos.
  return response
}

async function expectRejectedLogin (page, response) {
  expect(response.status(), 'A senha incorreta deve receber HTTP 401.').toBe(401)
  await expect(page).toHaveURL(/#\/login(?:\?.*)?$/)
  const alert = page.locator('app-login p.error[role="alert"]')
  await expect(alert).toBeVisible()
  await expect(alert).toContainText('Invalid email or password')
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull()
}


// Os cenários abaixo usam o navegador. As chamadas de API preparam os dados.
test.use({ locale: 'en-US', viewport: { width: 1280, height: 960 }, serviceWorkers: 'block' })
test.setTimeout(60000)

test.beforeEach(async ({ context, baseURL }) => {
  await prepareBrowser(context, baseURL)
})

async function evidence (page, testInfo, name) {
  await testInfo.attach(name, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png'
  })
}

async function chooseProduct (page, { withStock = false } = {}) {
  const response = await page.request.get('/rest/products/search', { params: { q: '' } })
  await expect(response, 'Preparação: falha ao consultar o catálogo real.').toBeOK()
  const payload = await response.json()
  if (!Array.isArray(payload.data)) {
    throw new Error('Preparação: o catálogo não retornou uma lista em data.')
  }

  let products = payload.data.filter(product =>
    typeof product.name === 'string' && product.name.trim() &&
    Number.isFinite(Number(product.price)) && Number(product.price) > 0
  ).sort((a, b) => a.id - b.id)

  if (withStock) {
    // A grafia Quantitys é a utilizada pela API do Juice Shop.
    const quantitiesResponse = await page.request.get('/api/Quantitys/')
    await expect(quantitiesResponse, 'Preparação: falha ao consultar o estoque.').toBeOK()
    const quantitiesPayload = await quantitiesResponse.json()
    if (!Array.isArray(quantitiesPayload.data)) {
      throw new Error('Preparação: o estoque não retornou uma lista em data.')
    }
    products = products.filter(product => quantitiesPayload.data.some(item =>
      Number(item.ProductId) === Number(product.id) && Number(item.quantity) >= 2 &&
      (!item.limitPerUser || Number(item.limitPerUser) >= 2)
    ))
  }

  if (products.length === 0) {
    throw new Error(withStock
      ? 'Preparação: não há produto com preço positivo e estoque/limite para duas unidades.'
      : 'Preparação: não há produto com nome e preço válidos no catálogo.')
  }
  return products[0]
}

function productCard (page, name) {
  return page.locator('app-search-result mat-card').filter({
    has: page.getByText(name, { exact: true })
  })
}

async function searchThroughUi (page, name) {
  const input = page.locator('#searchQuery input')
  if (!(await input.isVisible())) {
    await page.locator('#searchQuery button[aria-label="Open search"]').click()
  }
  await input.fill(name)
  await input.press('Enter')
  await expect(page.locator('#searchValue')).toHaveText(name)
  await expect(productCard(page, name)).toHaveCount(1)
  await expect(productCard(page, name)).toBeVisible()
}

async function readBasketTotal (page) {
  const text = await page.locator('#price').innerText()
  const match = text.match(/:\s*(-?\d+(?:[.,]\d+)?)/)
  if (!match) throw new Error(`Não foi possível ler o total do carrinho: ${text}`)
  return Number(match[1].replace(',', '.'))
}

test('UI-01 | login válido mostra a conta autenticada', async ({ page, request }, testInfo) => {
  let user
  await test.step('Preparar uma conta fictícia exclusiva', async () => {
    user = await createUser(request)
  })
  await test.step('Entrar pela interface e conferir a conta no menu', async () => {
    await loginThroughUi(page, user, { closeMenu: false })
    await evidence(page, testInfo, 'UI-01-conta-autenticada')
  })
})

test('UI-02 | senha incorreta é rejeitada', async ({ page, request }, testInfo) => {
  const user = await createUser(request)
  await test.step('Informar um e-mail existente com senha incorreta', async () => {
    const response = await submitLogin(page, {
      email: user.email,
      password: `${user.password}-errada`
    })
    await expectRejectedLogin(page, response)
    await evidence(page, testInfo, 'UI-02-senha-rejeitada')
  })
})

test('UI-03 | busca pela interface encontra um produto do catálogo', async ({ page }, testInfo) => {
  const product = await chooseProduct(page)
  await page.goto('/#/search')
  await test.step('Pesquisar um produto real e conferir sua presença', async () => {
    await searchThroughUi(page, product.name)
    await testInfo.attach('produto-pesquisado', {
      body: JSON.stringify({ id: product.id, name: product.name }, null, 2),
      contentType: 'application/json'
    })
    await evidence(page, testInfo, 'UI-03-produto-encontrado')
  })
})

test('UI-04 | carrinho permite adicionar, alterar quantidade e remover', async ({ page, request }, testInfo) => {
  const user = await createUser(request)
  await loginThroughUi(page, user)
  const product = await chooseProduct(page, { withStock: true })
  const unitPrice = Number(product.price)
  const cartButton = page.getByRole('button', { name: 'Show the shopping cart', exact: true })

  await test.step('Adicionar uma unidade pela interface e abrir o carrinho', async () => {
    await searchThroughUi(page, product.name)
    await productCard(page, product.name).locator('button.btn-basket').click()
    await expect(cartButton.locator('.warn-notification')).toHaveText('1')
    await cartButton.click()
    await expect(page).toHaveURL(/#\/basket(?:\?.*)?$/)
  })

  const rows = page.locator('app-purchase-basket mat-row')
  const row = rows.filter({
    has: page.locator('.mat-column-product').filter({ hasText: product.name })
  })
  const quantity = row.locator('.mat-column-quantity > span.cell-initial-font')
  const quantityButtons = row.locator('.mat-column-quantity button')

  await test.step('Conferir produto, quantidade inicial e total', async () => {
    await expect(rows).toHaveCount(1)
    await expect(row).toBeVisible()
    await expect(quantity).toHaveText('1')
    await expect.poll(() => readBasketTotal(page)).toBeCloseTo(unitPrice, 2)
    await expect(page.locator('#checkoutButton')).toBeEnabled()
    await evidence(page, testInfo, 'UI-04a-item-adicionado')
  })

  await test.step('Aumentar para duas unidades e conferir o total', async () => {
    // No HTML oficial, o primeiro botão diminui e o segundo aumenta.
    await quantityButtons.nth(1).click()
    await expect(quantity).toHaveText('2')
    await expect.poll(() => readBasketTotal(page)).toBeCloseTo(unitPrice * 2, 2)
    await evidence(page, testInfo, 'UI-04b-duas-unidades')
  })

  await test.step('Diminuir para uma unidade e conferir o total', async () => {
    await quantityButtons.nth(0).click()
    await expect(quantity).toHaveText('1')
    await expect.poll(() => readBasketTotal(page)).toBeCloseTo(unitPrice, 2)
    await evidence(page, testInfo, 'UI-04c-uma-unidade')
  })

  await test.step('Remover o item e conferir que o carrinho ficou vazio', async () => {
    await row.locator('.mat-column-remove button').click()
    await expect(rows).toHaveCount(0)
    await expect.poll(() => readBasketTotal(page)).toBeCloseTo(0, 2)
    await expect(page.locator('#checkoutButton')).toBeDisabled()
    await evidence(page, testInfo, 'UI-04d-carrinho-vazio')
  })
})

test('UI-05 | mock de catálogo vazio mostra ausência de resultados', async ({ page }, testInfo) => {
  const mockedPayload = { status: 'success', data: [] }
  let interceptedRequests = 0

  // Registre a interceptação ANTES de carregar o catálogo.
  await page.route(/\/rest\/products\/search(?:\?|$)/, async route => {
    interceptedRequests += 1
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockedPayload)
    })
  })

  await test.step('Abrir uma busca com a resposta de catálogo simulada', async () => {
    await page.goto('/#/search?q=qa-mock-sem-resultados')
    await expect(page.locator('app-search-result .emptyState')).toBeVisible()
    await expect(page.getByAltText(/No results found/)).toBeVisible()
    await expect(page.locator('app-search-result button.btn-basket')).toHaveCount(0)
    expect(interceptedRequests, 'A rota de produtos precisa ter sido interceptada.').toBeGreaterThan(0)
    await testInfo.attach('resposta-simulada', {
      body: JSON.stringify({
        endpoint: '/rest/products/search',
        interceptedRequests,
        response: mockedPayload
      }, null, 2),
      contentType: 'application/json'
    })
    await evidence(page, testInfo, 'UI-05-busca-sem-resultados-mock')
  })
})
