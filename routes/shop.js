/*jslint node: true */
'use strict';

var fs = require('fs'),
    PDFDocument = require('pdfkit'),
    utils = require('../lib/utils'),
    insecurity = require('../lib/insecurity'),
    models = require('../models/index'),
    cache = require('../data/datacache'),
    challenges = cache.challenges;

exports.searchProducts = function () {
    return function (req, res, next) {
        var criteria = req.query.q === 'undefined' ? '' : req.query.q || '';
        if (utils.notSolved(challenges.localXssChallenge) && utils.contains(criteria, '<script>alert("XSS1")</script>')) {
            utils.solve(challenges.localXssChallenge);
        }
        models.sequelize.query('SELECT * FROM Products WHERE (name LIKE \'%' + criteria + '%\') OR (description LIKE \'%' + criteria + '%\')')
            .success(function (products) {
                if (utils.notSolved(challenges.unionSqlInjectionChallenge)) {
                    var dataString = JSON.stringify(products);
                    var solved = true;
                    models.User.findAll().success(function (data) {
                        var users = utils.queryResultToJson(data);
                        if (users.data && users.data.length) {
                            for (var i = 0; i < users.data.length; i++) {
                                solved = solved && utils.contains(dataString, users.data[i].email) && utils.contains(dataString, users.data[i].password);
                                if (!solved) {
                                    break;
                                }
                            }
                            if (solved) {
                                utils.solve(challenges.unionSqlInjectionChallenge);
                            }
                        }
                    });
                }
                res.json(utils.queryResultToJson(products));
            }).error(function (error) {
                next(error);
            });
    };
};

exports.retrieveBasket = function () {
    return function (req, res, next) {
        var id = req.params.id;
        models.Basket.find({where: {id: id}, include: [ models.Product ]})
            .success(function (basket) {
                /* jshint eqeqeq:false */
                if (utils.notSolved(challenges.basketChallenge)) {
                    var user = insecurity.authenticatedUsers.from(req);
                    if (user && user.bid != id) {
                        utils.solve(challenges.basketChallenge);
                    }
                }
                res.json(utils.queryResultToJson(basket));
            }).error(function (error) {
                next(error);
            });
    };
};

exports.applyCoupon = function () {
    return function (req, res, next) {
        var id = req.params.id;
        var coupon = req.params.coupon ? decodeURIComponent(req.params.coupon) : undefined;
        var discount = insecurity.discountFromCoupon(coupon);
        coupon = discount ? coupon : null;
        models.Basket.find(id).success(function (basket) {
            if (basket) {
                basket.updateAttributes({coupon: coupon}).success(function() {
                    if (discount) {
                        res.json({discount: discount});
                    } else {
                        res.status(404).send('Invalid coupon.');
                    }
                }).error(function (error) {
                    next(error);
                });
            } else {
                next(new Error('Basket with id=' + id + ' does not exist.'));
            }
        }).error(function (error) {
            next(error);
        });
    };
};

exports.placeOrder = function () {
    return function (req, res, next) {
        var id = req.params.id;
        models.Basket.find({where: {id: id}, include: [ models.Product ]})
            .success(function (basket) {
                if (basket) {
                    var customer = insecurity.authenticatedUsers.from(req);
                    var orderNo = insecurity.hash(new Date() + '_' + id);
                    var pdfFile = 'order_' + orderNo + '.pdf';
                    var doc = new PDFDocument();
                    var fileWriter = doc.pipe(fs.createWriteStream(__dirname + '/../app/public/ftp/' + pdfFile));

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
                        res.send('/public/ftp/' + pdfFile);
                    });
                } else {
                    next(new Error('Basket with id=' + id + ' does not exist.'));
                }
            }).error(function (error) {
                next(error);
            });
    };
};