  /* /encryptionkeys directory browsing */
  app.use('/encryptionkeys', serveIndexMiddleware, serveIndex('encryptionkeys', { icons: true, view: 'details' }))
  app.use('/encryptionkeys/:file', keyServer())

  /* /logs directory browsing */
  app.use('/support/logs', serveIndexMiddleware, serveIndex('logs', { icons: true, view: 'details' }))
  app.use('/support/logs/:file', logFileServer())

  /* Swagger documentation for B2B v2 endpoints */
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  app.use(express.static(path.resolve('frontend/dist/frontend')))
  app.use(cookieParser('kekse'))