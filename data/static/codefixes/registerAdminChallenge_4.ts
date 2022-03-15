  /* Generated API endpoints */
  import {Request, Response} from "express";

  finale.initialize({ app, sequelize: models.sequelize })

  const autoModels = [
    { name: 'User', exclude: ['password', 'totpSecret', 'role'] },
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

    // create a wallet when a new user is registered using API
    if (name === 'User') {
      resource.create.send.before((req: Request, res: Response, context) => {
        models.Wallet.create({ UserId: context.instance.id }).catch((err) => {
          console.log(err)
        })
        return context.continue
      })
    }