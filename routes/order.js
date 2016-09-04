/*jslint node: true */
'use strict';

var fs = require('fs'),
    PDFDocument = require('pdfkit'),
    utils = require('../lib/utils'),
    insecurity = require('../lib/insecurity'),
    models = require('../models/index'),
    products = require('../data/datacache').products,
    challenges = require('../data/datacache').challenges;

exports = module.exports = function placeOrder() {
    return function (req, res, next) {
        var id = req.params.id;
        models.Basket.find({where: {id: id}, include: [ models.Product ]})
            .success(function (basket) {
                if (basket) {
                    var customer = insecurity.authenticatedUsers.from(req);
                    var orderNo = insecurity.hash(new Date() + '_' + id);
                    var pdfFile = 'order_' + orderNo + '.pdf';
                    var doc = new PDFDocument();
                    var fileWriter = doc.pipe(fs.createWriteStream(__dirname + '/../ftp/' + pdfFile));

                    doc.text('Juice-Shop - Order Confirmation');
                    doc.moveDown();
                    doc.moveDown();
                    doc.moveDown();
                    doc.text('Customer: ' + (customer ? customer.data ? customer.data.email : undefined : undefined));
                    doc.moveDown();
                    doc.text('Order #: ' + orderNo);
                    doc.moveDown();
                    doc.moveDown();
                    var totalPrice = 0;
                    basket.products.forEach(function (product) {
                        if (utils.notSolved(challenges.christmasSpecialChallenge && product.id === products.christmasSpecial.id)) {
                            utils.solve(challenges.christmasSpecialChallenge);
                        }
                        var itemTotal = product.price * product.basketItem.quantity;
                        doc.text(product.basketItem.quantity + 'x ' + product.name + ' ea. ' + product.price + ' = ' + itemTotal);
                        doc.moveDown();
                        totalPrice += itemTotal;
                    });
                    doc.moveDown();
                    var discount = insecurity.discountFromCoupon(basket.coupon);
                    if (discount) {
                        if (utils.notSolved(challenges.forgedCouponChallenge) && discount >= 80) {
                            utils.solve(challenges.forgedCouponChallenge);
                        }
                        var discountAmount = (totalPrice * (discount/100)).toFixed(2);
                        doc.text(discount + '% discount from coupon: -' + discountAmount);
                        doc.moveDown();
                        totalPrice -= discountAmount;
                    }
                    doc.text('Total Price: ' + totalPrice);
                    doc.moveDown();
                    doc.moveDown();
                    doc.text('Thank you for your order!');
                    doc.end();

                    if (utils.notSolved(challenges.negativeOrderChallenge) && totalPrice < 0) {
                        utils.solve(challenges.negativeOrderChallenge);
                    }

                    fileWriter.on('finish', function () {
                        basket.updateAttributes({coupon: null});
                        models.BasketItem.destroy({BasketId: id});
                        res.send('/ftp/' + pdfFile);
                    });
                } else {
                    next(new Error('Basket with id=' + id + ' does not exist.'));
                }
            }).error(function (error) {
                next(error);
            });
    };
};