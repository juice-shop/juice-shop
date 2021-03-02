/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const path = require('path')
const fs = require('fs')
const PDFDocument = require('pdfkit')
const utils = require('../lib/utils')
const security = require('../lib/insecurity')
const models = require('../models/index')
const products = require('../data/datacache').products
const challenges = require('../data/datacache').challenges
const config = require('config')
const db = require('../data/mongodb')

module.exports = function placeOrder () {
  return (req, res, next) => {
    const id = req.params.id
    models.Basket.findOne({ where: { id }, include: [{ model: models.Product, paranoid: false }] })
      .then(async basket => {
        if (basket) {
          const customer = security.authenticatedUsers.from(req)
          const email = customer ? customer.data ? customer.data.email : '' : ''
          const orderId = security.hash(email).slice(0, 4) + '-' + utils.randomHexString(16)
          const pdfFile = `order_${orderId}.pdf`
          const doc = new PDFDocument()
          const date = new Date().toJSON().slice(0, 10)
          const fileWriter = doc.pipe(fs.createWriteStream(path.join(__dirname, '../ftp/', pdfFile)))

          fileWriter.on('finish', () => {
            basket.update({ coupon: null })
            models.BasketItem.destroy({ where: { BasketId: id } })
            res.json({ orderConfirmation: orderId })
          })

          doc.font('Times-Roman', 40).text(config.get('application.name'), { align: 'center' })
          doc.moveTo(70, 115).lineTo(540, 115).stroke()
          doc.moveTo(70, 120).lineTo(540, 120).stroke()
          doc.fontSize(20).moveDown()
          doc.font('Times-Roman', 20).text(req.__('Order Confirmation'), { align: 'center' })
          doc.fontSize(20).moveDown()
          doc.font('Times-Roman', 15).text(`${req.__('Customer')}: ${email}`, { align: 'left' })
          doc.font('Times-Roman', 15).text(`${req.__('Order')} #: ${orderId}`, { align: 'left' })
          doc.moveDown()
          doc.font('Times-Roman', 15).text(`${req.__('Date')}: ${date}`, { align: 'left' })
          doc.moveDown()
          doc.moveDown()
          let totalPrice = 0
          const basketProducts = []
          let totalPoints = 0
          basket.Products.forEach(({ BasketItem, price, deluxePrice, name, id }) => {
            utils.solveIf(challenges.christmasSpecialChallenge, () => { return BasketItem.ProductId === products.christmasSpecial.id })

            models.Quantity.findOne({ where: { ProductId: BasketItem.ProductId } }).then((product) => {
              const newQuantity = product.dataValues.quantity - BasketItem.quantity
              models.Quantity.update({ quantity: newQuantity }, { where: { ProductId: BasketItem.ProductId } }).catch(error => {
                next(error)
              })
            }).catch(error => {
              next(error)
            })
            let itemPrice
            if (security.isDeluxe(req)) {
              itemPrice = deluxePrice
            } else {
              itemPrice = price
            }
            const itemTotal = itemPrice * BasketItem.quantity
            const itemBonus = Math.round(itemPrice / 10) * BasketItem.quantity
            const product = {
              quantity: BasketItem.quantity,
              id: id,
              name: req.__(name),
              price: itemPrice,
              total: itemTotal,
              bonus: itemBonus
            }
            basketProducts.push(product)
            doc.text(`${BasketItem.quantity}x ${req.__(name)} ${req.__('ea.')} ${itemPrice} = ${itemTotal}¤`)
            doc.moveDown()
            totalPrice += itemTotal
            totalPoints += itemBonus
          })
          doc.moveDown()
          const discount = calculateApplicableDiscount(basket, req)
          let discountAmount = 0
          if (discount > 0) {
            discountAmount = (totalPrice * (discount / 100)).toFixed(2)
            doc.text(discount + '% discount from coupon: -' + discountAmount + '¤')
            doc.moveDown()
            totalPrice -= discountAmount
          }
          let deliveryMethod = {
            deluxePrice: 0,
            price: 0,
            eta: 5
          }
          if (req.body.orderDetails && req.body.orderDetails.deliveryMethodId) {
            deliveryMethod = await models.Delivery.findOne({ where: { id: req.body.orderDetails.deliveryMethodId } })
          }
          const deliveryAmount = security.isDeluxe(req) ? deliveryMethod.deluxePrice : deliveryMethod.price
          totalPrice += deliveryAmount
          doc.text(`${req.__('Delivery Price')}: ${deliveryAmount.toFixed(2)}¤`)
          doc.moveDown()
          doc.font('Helvetica-Bold', 20).text(`${req.__('Total Price')}: ${totalPrice.toFixed(2)}¤`)
          doc.moveDown()
          doc.font('Helvetica-Bold', 15).text(`${req.__('Bonus Points Earned')}: ${totalPoints}`)
          doc.font('Times-Roman', 15).text(`(${req.__('The bonus points from this order will be added 1:1 to your wallet ¤-fund for future purchases!')}`)
          doc.moveDown()
          doc.moveDown()
          doc.font('Times-Roman', 15).text(req.__('Thank you for your order!'))

          utils.solveIf(challenges.negativeOrderChallenge, () => { return totalPrice < 0 })

          if (req.body.UserId) {
            if (req.body.orderDetails.paymentId === 'wallet') {
              const wallet = await models.Wallet.findOne({ where: { UserId: req.body.UserId } })
              if (wallet.balance >= totalPrice) {
                models.Wallet.decrement({ balance: totalPrice }, { where: { UserId: req.body.UserId } }).catch(error => {
                  next(error)
                })
              } else {
                next(new Error('Insufficient wallet balance.'))
              }
            }
            models.Wallet.increment({ balance: totalPoints }, { where: { UserId: req.body.UserId } }).catch(error => {
              next(error)
            })
          }

          db.orders.insert({
            promotionalAmount: discountAmount,
            paymentId: req.body.orderDetails ? req.body.orderDetails.paymentId : null,
            addressId: req.body.orderDetails ? req.body.orderDetails.addressId : null,
            orderId: orderId,
            delivered: false,
            email: (email ? email.replace(/[aeiou]/gi, '*') : undefined),
            totalPrice: totalPrice,
            products: basketProducts,
            bonus: totalPoints,
            deliveryPrice: deliveryAmount,
            eta: deliveryMethod.eta.toString()
          }).then(() => {
            doc.end()
          })
        } else {
          next(new Error(`Basket with id=${id} does not exist.`))
        }
      }).catch(error => {
        next(error)
      })
  }
}

function calculateApplicableDiscount (basket, req) {
  if (security.discountFromCoupon(basket.coupon)) {
    const discount = security.discountFromCoupon(basket.coupon)
    utils.solveIf(challenges.forgedCouponChallenge, () => { return discount >= 80 })
    return discount
  } else if (req.body.couponData) {
    const couponData = Buffer.from(req.body.couponData, 'base64').toString().split('-')
    const couponCode = couponData[0]
    const couponDate = couponData[1]
    const campaign = campaigns[couponCode]
    if (campaign && couponDate == campaign.validOn) { // eslint-disable-line eqeqeq
      utils.solveIf(challenges.manipulateClockChallenge, () => { return campaign.validOn < new Date() })
      return campaign.discount
    }
  }
  return 0
}

const campaigns = {
  WMNSDY2019: { validOn: new Date('Mar 08, 2019 00:00:00 GMT+0100').getTime(), discount: 75 },
  WMNSDY2020: { validOn: new Date('Mar 08, 2020 00:00:00 GMT+0100').getTime(), discount: 60 },
  WMNSDY2021: { validOn: new Date('Mar 08, 2021 00:00:00 GMT+0100').getTime(), discount: 60 },
  WMNSDY2022: { validOn: new Date('Mar 08, 2022 00:00:00 GMT+0100').getTime(), discount: 60 },
  WMNSDY2023: { validOn: new Date('Mar 08, 2023 00:00:00 GMT+0100').getTime(), discount: 60 },
  ORANGE2020: { validOn: new Date('May 04, 2020 00:00:00 GMT+0100').getTime(), discount: 50 },
  ORANGE2021: { validOn: new Date('May 04, 2021 00:00:00 GMT+0100').getTime(), discount: 40 },
  ORANGE2022: { validOn: new Date('May 04, 2022 00:00:00 GMT+0100').getTime(), discount: 40 },
  ORANGE2023: { validOn: new Date('May 04, 2023 00:00:00 GMT+0100').getTime(), discount: 40 }
}
