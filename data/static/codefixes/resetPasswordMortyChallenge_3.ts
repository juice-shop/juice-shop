/* Rate limiting */
  app.enable('trust proxy')
  app.use('/rest/user/reset-password', rateLimit({
    windowMs: 3 * 60 * 1000,
    max: 10,
    keyGenerator ({ headers, ip }) { return headers['X-Forwarded-For'] ?? ip }
  }))