```typescript
// ... (rest of the code)

module.exports = function placeOrder () {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    BasketModel.findOne({ where: { id }, include: [{ model: ProductModel, paranoid: false, as: 'Products' }] })
      .then(async (basket: BasketModel | null) => {
        if (basket != null) {
          const customer = security.authenticatedUsers.from(req)
          const email = customer ? customer.data ? customer.data.email : '' : ''
          const orderId = security.hash(email).slice(0, 4) + '-' + utils.randomHexString(16)
          const sanitizedOrderId = path.normalize(orderId).replace(/^(\.\.[\/\\])+/, '') // sanitize orderId
          const pdfFile = `order_${sanitizedOrderId}.pdf`
          const doc = new PDFDocument()
          const date = new Date().toJSON().slice(0, 10)
          const fileWriter = doc.pipe(fs.createWriteStream(path.join('ftp/', pdfFile)))

          // ... (rest of the code)
        } else {
          next(new Error(`Basket with id=${id} does not exist.`))
        }
      }).catch((error: unknown) => {
        next(error)
      })
  }
}

// ... (rest of the code)
```