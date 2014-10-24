/*jslint node: true */
'use strict';

var fs = require('fs'),
    PDFDocument = require('pdfkit'),
    utils = require('./lib/utils'),
    insecurity = require('./lib/insecurity'),
    models = require('./models'),
    cache = require("./lib/datacache"),
    challenges = cache.challenges;

exports.verifyForgedFeedbackChallenge = function() {
    return function(req, res, next) {
        if (utils.notSolved(challenges.forgedFeedbackChallenge)) {
            var user = insecurity.authenticatedUsers.from(req);
            var userId = user ? user.data.id : undefined;
            if (req.body.UserId && req.body.UserId != userId) {
                utils.solve(challenges.forgedFeedbackChallenge);
            }
        }
        next();
    };
}

exports.verifyAccessControlChallenges = function() {
    return function (req, res, next) {
        if (utils.notSolved(challenges.scoreBoardChallenge) && utils.endsWith(req.url, '/scoreboard.png')) {
            utils.solve(challenges.scoreBoardChallenge);
        } else if (utils.notSolved(challenges.adminSectionChallenge) && utils.endsWith(req.url, '/administration.png')) {
            utils.solve(challenges.adminSectionChallenge);
        }
        next();
    };
}

exports.retrieveLoggedInUsersId = function() {
    return function (req, res) {
        var user = insecurity.authenticatedUsers.from(req);
        res.json({id: (user ? user.data.id : undefined), email: (user ? user.data.email : undefined)});
    };
}

exports.retrieveAppVersion = function() {
    return function (req, res) {
        res.json({version: utils.version()});
    };
}

exports.serveAngularClient = function() {
    return function (req, res, next) {
        if (!utils.startsWith(req.url, '/api') && !utils.startsWith(req.url, '/rest')) {
            res.sendFile(__dirname + '/app/index.html');
        } else {
            next(new Error('Unexpected path: ' + req.url));
        }
    };
}

exports.verifyErrorHandlingChallenge = function() {
    return function (err, req, res, next) {
        if (utils.notSolved(challenges.errorHandlingChallenge) && err && res.statusCode > 401) {
            utils.solve(challenges.errorHandlingChallenge);
        }
        next(err);
    };
}

exports.serveEasterEgg = function() {
    return function (req, res) {
        if (utils.notSolved(challenges.easterEggLevelTwoChallenge)) {
            utils.solve(challenges.easterEggLevelTwoChallenge);
        }
        res.sendFile(__dirname + '/app/private/threejs-demo.html');
    };
}

exports.performRedirect = function() {
    return function(req, res) {
        var to = req.query.to;
        var githubUrl = 'https://github.com/bkimminich/juice-shop';
        if (to.indexOf(githubUrl) > -1) {
            if (utils.notSolved(challenges.redirectChallenge) && to !== githubUrl) { // TODO Instead match against something like <anotherUrl>[?&]=githubUrl
                utils.solve(challenges.redirectChallenge);
            }
            res.redirect(to);
        } else {
            res.redirect(githubUrl);
        }
    };
}

exports.retrieveBasket = function() {
    return function(req, res, next){
        var id = req.params.id;
        models.Basket.find({where: {id: id}, include: [ models.Product ]})
            .success(function(basket) {
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
}

exports.retrieveUserList = function() {
    return function(req, res, next){
        models.User.findAll().success(function(users) {
            var usersWithLoginStatus = utils.queryResultToJson(users);
            usersWithLoginStatus.data.forEach(function(user) {
                user.token = insecurity.authenticatedUsers.tokenOf(user);
            });
            res.json(usersWithLoginStatus);
        }).error(function (error) {
            next(error);
        });
    };
}

exports.createOrderPdf = function() {
    return function(req, res, next){
        var id = req.params.id;
        models.Basket.find({where: {id: id}, include: [ models.Product ]})
            .success(function(basket) {
                if (basket) {
                    var customer = insecurity.authenticatedUsers.from(req);
                    var orderNo = insecurity.hash(new Date()+'_'+id);
                    var pdfFile = 'order_' + orderNo + '.pdf';
                    var doc = new PDFDocument();
                    var fileWriter = doc.pipe(fs.createWriteStream(__dirname + '/app/public/ftp/' + pdfFile));

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
                    basket.products.forEach(function(product) {
                        var itemTotal = product.price*product.basketItem.quantity;
                        doc.text(product.basketItem.quantity + 'x ' + product.name + ' ea. ' + product.price + ' = ' + itemTotal);
                        doc.moveDown();
                        totalPrice += itemTotal;
                    });
                    doc.moveDown();
                    doc.text('Total Price: ' + totalPrice);
                    doc.moveDown();
                    doc.moveDown();
                    doc.text('Thank you for your order!');
                    doc.end();

                    if (utils.notSolved(challenges.negativeOrderChallenge) && totalPrice < 0) {
                        utils.solve(challenges.negativeOrderChallenge);
                    }

                    fileWriter.on('finish', function() {
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
}

exports.searchProducts = function() {
    return function(req, res, next){
        var criteria = req.query.q === 'undefined' ? '' : req.query.q || '';
        if (utils.notSolved(challenges.localXssChallenge) && utils.contains(criteria, '<script>alert("XSS1")</script>')) {
            utils.solve(challenges.localXssChallenge);
        }
        models.sequelize.query('SELECT * FROM Products WHERE (name LIKE \'%' + criteria + '%\') OR (description LIKE \'%' + criteria + '%\')')
            .success(function(products) {
                if (utils.notSolved(challenges.unionSqlInjectionChallenge)) {
                    var dataString = JSON.stringify(products);
                    var solved = true;
                    models.User.findAll().success(function(data) {
                        var users = utils.queryResultToJson(data);
                        if (users.data && users.data.length) {
                            for (var i=0; i<users.data.length; i++) {
                                utils.solved = utils.solved && utils.contains(dataString, users.data[i].email) && utils.contains(dataString, users.data[i].password);
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
}

exports.changePassword = function() {
    return function(req, res, next){
        var password = req.query.new;
        var repeatPassword = req.query.repeat;
        if (!password || password === 'undefined') {
            res.status(401).send('Password cannot be empty.');
        } else if (password !== repeatPassword) {
            res.status(401).send('New and repeated password do not match.');
        } else {
            var loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token);
            if (loggedInUser) {
                models.User.find(loggedInUser.data.id).success(function(user) {
                    user.updateAttributes({password: password}).success(function(user) {
                        res.send(user);
                    }).error(function(error) {
                        next(error);
                    });
                }).error(function(error) {
                    next(error);
                });
            } else {
                next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress));
            }
        }
    };
}

exports.loginUser = function() {
    return function(req, res, next){
        if (utils.notSolved(challenges.weakPasswordChallenge) && req.body.email === 'admin@juice-sh.op' && req.body.password === 'admin123') {
            utils.solve(challenges.weakPasswordChallenge);
        }
        models.sequelize.query('SELECT * FROM Users WHERE email = \'' + (req.body.email || '') + '\' AND password = \'' + insecurity.hash(req.body.password || '') + '\'', models.User, {plain: true})
            .success(function(authenticatedUser) {
                var user = utils.queryResultToJson(authenticatedUser);
                if (user.data && user.data.id) {
                    if (utils.notSolved(challenges.loginAdminChallenge) && user.data.id === 1) {
                        utils.solve(challenges.loginAdminChallenge);
                    } else if (utils.notSolved(challenges.loginJimChallenge) && user.data.id === 2) {
                        utils.solve(challenges.loginJimChallenge);
                    } else if  (utils.notSolved(challenges.loginBenderChallenge) && user.data.id === 3) {
                        utils.solve(challenges.loginBenderChallenge);
                    }
                    models.Basket.findOrCreate({UserId: user.data.id}).success(function(basket) {
                        var token = insecurity.authorize(user);
                        user.bid = basket.id; // keep track of original basket for challenge solution check
                        insecurity.authenticatedUsers.put(token, user);
                        res.json({ token: token, bid: basket.id });
                    }).error(function (error) {
                        next(error);
                    });
                } else {
                    res.status(401).send('Invalid email or password.');
                }
            }).error(function (error) {
                next(error);
            });
    };
}

exports.serveFiles = function() {
    return function(req, res, next) {
        var file = req.params.file;
        if (file && (utils.endsWith(file, '.md') || (utils.endsWith(file, '.pdf')))) {
            file = insecurity.cutOffPoisonNullByte(file);
            if (utils.notSolved(challenges.easterEggLevelOneChallenge) && file.toLowerCase() === 'eastere.gg') {
                utils.solve(challenges.easterEggLevelOneChallenge);
            } else if (utils.notSolved(challenges.directoryListingChallenge) && file.toLowerCase() === 'acquisitions.md') {
                utils.solve(challenges.directoryListingChallenge);
            }
            res.sendFile(__dirname + '/app/public/ftp/' + file);
        } else {
            res.status(403);
            next(new Error('Only .md and .pdf files are allowed!'));
        }
    };
}

exports.verifyDatabaseRelatedChallenges = function() {
    return function (req, res, next) {
        if (utils.notSolved(challenges.changeProductChallenge) && cache.products.osaft) {
            cache.products.osaft.reload().success(function () {
                if (!utils.contains(cache.products.osaft.description, '<a href="https://www.owasp.org/index.php/O-Saft" target="_blank">')) {
                    if (utils.contains(cache.products.osaft.description, '<a href="http://kimminich.de" target="_blank">')) {
                        utils.solve(challenges.changeProductChallenge);
                    }
                }
            });
        }
        if (utils.notSolved(challenges.csrfChallenge) && cache.users.bender) {
            cache.users.bender.reload().success(function() {
                if (cache.users.bender.password === insecurity.hash('slurmCl4ssic')) {
                    utils.solve(challenges.csrfChallenge);
                }
            });
        }
        if (utils.notSolved(challenges.feedbackChallenge)) {
            models.Feedback.findAndCountAll({where: {rating: 5}}).success(function (feedbacks) {
                if (feedbacks.count === 0) {
                    utils.solve(challenges.feedbackChallenge);
                }
            });
        }
        if (utils.notSolved(challenges.knownVulnerableComponentChallenge)) {
            models.Feedback.findAndCountAll({where: models.Sequelize.or(
                    models.Sequelize.and(['comment LIKE \'%sanitize-html%\''], ['comment LIKE \'%1.4.2%\'']),
                    models.Sequelize.and(['comment LIKE \'%htmlparser2%\''], ['comment LIKE \'%3.3.0%\'']) ) }
            ).success(function (data) {
                    if (data.count > 0) {
                        utils.solve(challenges.knownVulnerableComponentChallenge);
                    }
                });
        }
        next();
    };
}
