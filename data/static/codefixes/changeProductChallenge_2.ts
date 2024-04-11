/** Authorization **/
  /* Baskets: Unauthorized users are not allowed to access baskets */
  app.use('/rest/basket', security.isAuthorized(), security.appendUserId())
  /* BasketItems: API only accessible for authenticated users */
  app.use('/api/BasketItems', security.isAuthorized())
  app.use('/api/BasketItems/:id', security.isAuthorized())
  /* Feedbacks: GET allowed for feedback carousel, POST allowed in order to provide feedback without being logged in */
  app.use('/api/Feedbacks/:id', security.isAuthorized())
  /* Users: Only POST is allowed in order to register a new user */
  app.get('/api/Users', security.isAuthorized())
  app.route('/api/Users/:id')
    .get(security.isAuthorized())
    .put(security.denyAll())
    .delete(security.denyAll())
  /* Challenges: GET list of challenges allowed. Everything else forbidden entirely */
  app.post('/api/Challenges', security.denyAll())
  app.use('/api/Challenges/:id', security.denyAll())
  /* Complaints: POST and GET allowed when logged in only */
  app.get('/api/Complaints', security.isAuthorized())
  app.post('/api/Complaints', security.isAuthorized())
  app.use('/api/Complaints/:id', security.denyAll())
  /* Recycles: POST and GET allowed when logged in only */
  app.get('/api/Recycles', recycles.blockRecycleItems())
  app.post('/api/Recycles', security.isAuthorized())
  /* Challenge evaluation before finale takes over */
  app.get('/api/Recycles/:id', recycles.getRecycleItem())
  app.put('/api/Recycles/:id', security.denyAll())
  app.delete('/api/Recycles/:id', security.denyAll())
  /* SecurityQuestions: Only GET list of questions allowed. */
  app.post('/api/SecurityQuestions', security.denyAll())
  app.use('/api/SecurityQuestions/:id', security.denyAll())
  /* SecurityAnswers: Only POST of answer allowed. */
  app.get('/api/SecurityAnswers', security.denyAll())
  app.use('/api/SecurityAnswers/:id', security.denyAll())
  /* REST API */
  app.use('/rest/user/authentication-details', security.isAuthorized())
  app.use('/rest/basket/:id', security.isAuthorized())
  app.use('/rest/basket/:id/order', security.isAuthorized())
  /* Unauthorized users are not allowed to access B2B API */
  app.use('/b2b/v2', security.isAuthorized())
  /* Check if the quantity is available in stock and limit per user not exceeded, then add item to basket */
  app.put('/api/BasketItems/:id', security.appendUserId(), basketItems.quantityCheckBeforeBasketItemUpdate())
  app.post('/api/BasketItems', security.appendUserId(), basketItems.quantityCheckBeforeBasketItemAddition(), basketItems.addBasketItem())
  /* Accounting users are allowed to check and update quantities */
  app.delete('/api/Quantitys/:id', security.denyAll())
  app.post('/api/Quantitys', security.denyAll())
  app.use('/api/Quantitys/:id', security.isAccounting(), ipfilter(['123.456.789'], { mode: 'allow' }))
  /* Feedbacks: Do not allow changes of existing feedback */
  app.put('/api/Feedbacks/:id', security.denyAll())
  /* PrivacyRequests: Only allowed for authenticated users */
  app.use('/api/PrivacyRequests', security.isAuthorized())
  app.use('/api/PrivacyRequests/:id', security.isAuthorized())
  /* PaymentMethodRequests: Only allowed for authenticated users */
  app.post('/api/Cards', security.appendUserId())
  app.get('/api/Cards', security.appendUserId(), payment.getPaymentMethods())
  app.put('/api/Cards/:id', security.denyAll())
  app.delete('/api/Cards/:id', security.appendUserId(), payment.delPaymentMethodById())
  app.get('/api/Cards/:id', security.appendUserId(), payment.getPaymentMethodById())
  /* PrivacyRequests: Only POST allowed for authenticated users */
  app.post('/api/PrivacyRequests', security.isAuthorized())
  app.get('/api/PrivacyRequests', security.denyAll())
  app.use('/api/PrivacyRequests/:id', security.denyAll())

  app.post('/api/Addresss', security.appendUserId())
  app.get('/api/Addresss', security.appendUserId(), address.getAddress())
  app.put('/api/Addresss/:id', security.appendUserId())
  app.delete('/api/Addresss/:id', security.appendUserId(), address.delAddressById())
  app.get('/api/Addresss/:id', security.appendUserId(), address.getAddressById())
  app.get('/api/Deliverys', delivery.getDeliveryMethods())
  app.get('/api/Deliverys/:id', delivery.getDeliveryMethod())