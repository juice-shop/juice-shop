/* Generated API endpoints */
  finale.initialize({ app, sequelize: models.sequelize })

  const autoModels = [
    { name: 'Product', exclude: [] },
    { name: 'Feedback', exclude: [] },
    { name: 'BasketItem', exclude: [] },
    { name: 'Challenge', exclude: [] },
    { name: 'Complaint', exclude: [] },
    { name: 'Recycle', exclude: [] },
    { name: 'SecurityQuestion', exclude: [] },
    { name: 'SecurityAnswer', exclude: [] },
    { name: 'Address', exclude: [] },
    { name: 'PrivacyRequest', exclude: [] },
    { name: 'Card', exclude: [] },
    { name: 'Quantity', exclude: [] }
  ]

  for (const { name, exclude } of autoModels) {
    const resource = finale.resource({
      model: models[name],
      endpoints: [`/api/${name}s`, `/api/${name}s/:id`],
      excludeAttributes: exclude
    })