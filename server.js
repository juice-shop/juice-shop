/*jslint node: true */
'use strict';

var application_root = __dirname.replace(/\\/g, '/'),
    fs = require('fs'),
    glob = require('glob'),
    morgan = require('morgan'),
    restful = require('sequelize-restful'),
    express = require('express'),
    errorhandler = require('errorhandler'),
    cookieParser = require('cookie-parser'),
    serveIndex = require('serve-index'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    PDFDocument = require('pdfkit'),
    utils = require('./lib/utils'),
    insecurity = require('./lib/insecurity'),
    db = require('./lib/domain'),
    app = express();

errorhandler.title = 'Juice Shop (Express ' + utils.version('express') + ')';

/* Delete old order PDFs */
glob(__dirname + '/app/public/ftp/*.pdf', function (err, files) {
    files.forEach(function(filename) {
        fs.unlink(filename);
    });
});

/* Domain Model */
var User = db.sequelize.define('User', {
        email: db.Sequelize.STRING,
        password: db.Sequelize.STRING
    },
    { hooks: {
        beforeCreate: function (user, fn) {
            hashPasswordHook(user);
            xssChallengeUserHook(user);
            fn(null, user);
        },
        beforeUpdate: function (user, fn) { // Pitfall: Will hash the hashed password again if password was not updated!
            hashPasswordHook(user);
            fn(null, user);
        }
    }}
);

function hashPasswordHook(user) {
    user.password = insecurity.hash(user.password);
}

function xssChallengeUserHook(user) {
    if (notSolved(persistedXssChallengeUser) && utils.contains(user.email, '<script>alert("XSS2")</script>')) {
        solve(persistedXssChallengeUser);
    }
}

var Product = db.sequelize.define('Product', {
    name: db.Sequelize.STRING,
    description: db.Sequelize.STRING,
    price: db.Sequelize.DECIMAL,
    image: db.Sequelize.STRING
    },
    { hooks: {
        beforeCreate: function (product, fn) {
            xssChallengeProductHook(product);
            fn(null, product);
        },
        beforeUpdate: function (product, fn) {
            xssChallengeProductHook(product);
            fn(null, product);
        }
    }});

function xssChallengeProductHook(product) {
    if (notSolved(restfulXssChallenge) && utils.contains(product.description, '<script>alert("XSS4")</script>')) {
        solve(restfulXssChallenge);
    }
}

var Basket = db.sequelize.define('Basket', {
});

var BasketItem = db.sequelize.define('BasketItems', {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    quantity: db.Sequelize.INTEGER
});

Basket.belongsTo(User);
Basket.hasMany(Product, {through: BasketItem});
Product.hasMany(Basket, {through: BasketItem});

var Feedback = db.sequelize.define('Feedback', {
    comment: db.Sequelize.STRING,
    rating: db.Sequelize.INTEGER
    },
    { hooks: {
        beforeCreate: function (feedback, fn) {
            htmlSanitizationHook(feedback);
            fn(null, feedback);
        },
        beforeUpdate: function (feedback, fn) {
            htmlSanitizationHook(feedback);
            fn(null, feedback);
        }
    }});

Feedback.belongsTo(User);

function htmlSanitizationHook(feedback) {
    feedback.comment = insecurity.sanitizeHtml(feedback.comment);
    if (notSolved(persistedXssChallengeFeedback) && utils.contains(feedback.comment, '<script>alert("XSS3")</script>')) {
        solve(persistedXssChallengeFeedback);
    }
}

var Challenge = db.sequelize.define('Challenges', {
    description: db.Sequelize.STRING,
    solved: db.Sequelize.BOOLEAN
});

/* Challenges */
var redirectChallenge, easterEggLevelOneChallenge, easterEggLevelTwoChallenge, directoryListingChallenge,
    loginAdminChallenge, loginJimChallenge, loginBenderChallenge, changeProductChallenge, csrfChallenge,
    errorHandlingChallenge, knownVulnerableComponentChallenge, negativeOrderChallenge, persistedXssChallengeFeedback,
    persistedXssChallengeUser, localXssChallenge, restfulXssChallenge,basketChallenge, weakPasswordChallenge,
    adminSectionChallenge, scoreBoardChallenge, feedbackChallenge, unionSqlInjectionChallenge, forgedFeedbackChallenge;

/* Entities relevant for challenges */

var bender, osaft;

/* Data */
db.sequelize.drop();
db.sequelize.sync().success(function () {
    Challenge.create({
        description: 'Find the carefully hidden \'Score Board\' page.',
        solved: false
    }).success(function(challenge) {
        scoreBoardChallenge = challenge;
    });
    Challenge.create({
        description: 'Provoke an error that is not very gracefully handled.',
        solved: false
    }).success(function(challenge) {
        errorHandlingChallenge = challenge;
    });
    Challenge.create({
        description: 'Log in with the administrator\'s user account.',
        solved: false
    }).success(function(challenge) {
        loginAdminChallenge = challenge;
    });
    Challenge.create({
        description: 'Log in with Jim\'s user account.',
        solved: false
    }).success(function(challenge) {
        loginJimChallenge = challenge;
    });
    Challenge.create({
        description: 'Log in with Bender\'s user account.',
        solved: false
    }).success(function(challenge) {
        loginBenderChallenge = challenge;
    });
    Challenge.create({
        description: 'XSS Tier 1: Perform a <i>reflected</i> XSS attack with &lt;script&gt;alert("XSS1")&lt;/script&gt;.',
        solved: false
    }).success(function(challenge) {
        localXssChallenge = challenge;
    });
    Challenge.create({
        description: 'XSS Tier 2: Perform a <i>persisted</i> XSS attack with &lt;script&gt;alert("XSS2")&lt;/script&gt; bypassing a <i>client-side</i> security mechanism.',
        solved: false
    }).success(function(challenge) {
        persistedXssChallengeUser = challenge;
    });
    Challenge.create({
        description: 'XSS Tier 3: Perform a <i>persisted</i> XSS attack with &lt;script&gt;alert("XSS3")&lt;/script&gt; bypassing a <i>server-side</i> security mechanism.',
        solved: false
    }).success(function(challenge) {
        persistedXssChallengeFeedback = challenge;
    });
    Challenge.create({
        description: 'XSS Tier 4: Perform a <i>persisted</i> XSS attack with &lt;script&gt;alert("XSS4")&lt;/script&gt; without using the frontend application at all.',
        solved: false
    }).success(function(challenge) {
        restfulXssChallenge = challenge;
    });
    Challenge.create({
        description: 'Retrieve a list of all user credentials via SQL Injection',
        solved: false
    }).success(function(challenge) {
        unionSqlInjectionChallenge = challenge;
    });
    Challenge.create({
        description: 'Log in with the administrator\'s user credentials without previously changing them or applying SQL Injection.',
        solved: false
    }).success(function(challenge) {
        weakPasswordChallenge = challenge;
    });
    Challenge.create({
        description: 'Get rid of all 5-star customer feedback.',
        solved: false
    }).success(function(challenge) {
        feedbackChallenge = challenge;
    });
    Challenge.create({
        description: 'Post some feedback in another users name.',
        solved: false
    }).success(function(challenge) {
        forgedFeedbackChallenge = challenge;
    });
    Challenge.create({
        description: 'Wherever you go, there you are.',
        solved: false
    }).success(function(challenge) {
        redirectChallenge = challenge;
    });
    Challenge.create({
        description: 'Access someone else\'s basket.',
        solved: false
    }).success(function(challenge) {
        basketChallenge = challenge;
    });
    Challenge.create({
        description: 'Place an order that makes you rich.',
        solved: false
    }).success(function(challenge) {
        negativeOrderChallenge = challenge;
    });
    Challenge.create({
        description: 'Access a confidential document.',
        solved: false
    }).success(function(challenge) {
        directoryListingChallenge = challenge;
    });
    Challenge.create({
        description: 'Access the administration section of the store.',
        solved: false
    }).success(function(challenge) {
        adminSectionChallenge = challenge;
    });
    Challenge.create({
        description: 'Change Bender\'s password into <i>slurmCl4ssic</i>.' ,
        solved: false
    }).success(function(challenge) {
        csrfChallenge = challenge;
    });
    Challenge.create({
        description: 'Change the link in the description of the <a href="/#/search?q=O-Saft">O-Saft product</a> to <i>http://kimminich.de</i>.',
        solved: false
    }).success(function(challenge) {
        changeProductChallenge = challenge;
    });
    Challenge.create({
        description: '<a href="/#/contact">Inform the shop</a> about a vulnerable library it is using. (Mention the exact library name and version in your complaint.)',
        solved: false
    }).success(function(challenge) {
        knownVulnerableComponentChallenge = challenge;
    });
    Challenge.create({
        description: 'Find the hidden <a href="http://en.wikipedia.org/wiki/Easter_egg_(media)" target="_blank">easter egg</a>.',
        solved: false
    }).success(function(challenge) {
        easterEggLevelOneChallenge = challenge;
    });
    Challenge.create({
        description: 'Apply some advanced cryptanalysis to find <i>the real</i> easter egg.',
        solved: false
    }).success(function(challenge) {
        easterEggLevelTwoChallenge = challenge;
    });
    User.create({
        email: 'admin@juice-sh.op',
        password: 'admin123'
    });
    User.create({
        email: 'jim@juice-sh.op',
        password: 'ncc-1701'
    });
    User.create({
        email: 'bender@juice-sh.op',
        password: 'booze'
    }).success(function(user) {
        bender = user;
    });
    Product.create({
        name: 'Apple Juice (1000ml)',
        description: 'The all-time classic.',
        price: 1.99,
        image: 'apple_juice.jpg'
    });
    Product.create({
        name: 'Orange Juice (1000ml)',
        description: 'Made from oranges hand-picked by Uncle Dittmeyer.',
        price: 2.99,
        image: 'orange_juice.jpg'
    });
    Product.create({
        name: 'Eggfruit Juice (500ml)',
        description: 'Now with even more exotic flavour.',
        price: 8.99,
        image: 'eggfruit_juice.jpg'
    });
    Product.create({
        name: 'Raspberry Juice (1000ml)',
        description: 'Made from blended Raspberry Pi, water and sugar.',
        price: 4.99,
        image: 'raspberry_juice.jpg'
    });
    Product.create({
        name: 'Lemon Juice (500ml)',
        description: 'Sour but full of vitamins.',
        price: 2.99,
        image: 'lemon_juice.jpg'
    });
    Product.create({
        name: 'Banana Juice (1000ml)',
        description: 'Monkeys love it the most.',
        price: 1.99,
        image: 'banana_juice.jpg'
    });
    Product.create({
        name: 'Lemon Juice (500ml)',
        description: 'Sour but full of vitamins.',
        price: 2.99,
        image: 'lemon_juice.jpg'
    });
    Product.create({
        name: 'Juice Shop T-Shirt (3XL)',
        description: 'Real fans wear it 24/7!',
        price: 24.99,
        image: 'fan_shirt.jpg'
    });
    Product.create({
        name: 'OWASP SSL Advanced Forensic Tool (O-Saft)',
        description: 'O-Saft is an easy to use tool to show information about SSL certificate and tests the SSL connection according given list of ciphers and various SSL configurations. <a href="https://www.owasp.org/index.php/O-Saft" target="_blank">More...</a>',
        price: 0.01,
        image: 'owasp_osaft.jpg'
    }).success(function(product) {
        osaft = product;
    });
    Basket.create({
        UserId: 1
    });
    Basket.create({
        UserId: 2
    });
    Basket.create({
        UserId: 3
    });
    BasketItem.create({
        BasketId: 1,
        ProductId: 1,
        quantity: 2
    });
    BasketItem.create({
        BasketId: 1,
        ProductId: 2,
        quantity: 3
    });
    BasketItem.create({
        BasketId: 1,
        ProductId: 3,
        quantity: 1
    });
    BasketItem.create({
        BasketId: 2,
        ProductId: 4,
        quantity: 2
    });
    BasketItem.create({
        BasketId: 3,
        ProductId: 5,
        quantity: 1
    });
    Feedback.create({
        UserId: 1,
        comment: 'I love this shop! Best juice in town! Highly recommended!',
        rating: 5
    });
    Feedback.create({
        UserId: 2,
        comment: 'Great shop! The O-Saft is highly recommended!',
        rating: 4
    });
    Feedback.create({
        comment: 'Why isn\'t there a T-Shirt for skinny people available?!',
        rating: 2
    });
    Feedback.create({
        comment: 'This is <b>the</b> store for juices of all kinds!',
        rating: 4
    });
    Feedback.create({
        comment: 'Never gonna buy my juice anywhere else from now on! Thanks for the great service!',
        rating: 4
    });
    Feedback.create({
        comment: 'Keep up the good work!',
        rating: 3
    });
    Feedback.create({
        UserId: 3,
        comment: 'No real drinks available here!',
        rating: 1
    });
});

/* Favicon */
app.use(favicon(__dirname + '/app/public/favicon.ico'));

/* Checks for solved challenges */
app.use(verifyDatabaseRelatedChallenges());
app.use('/public/images/tracking', verifyAccessControlChallenges());

/* public/ftp directory browsing and file download */
app.use('/public/ftp', serveIndex('app/public/ftp', {'icons': true}));
app.use('/public/ftp/:file', serveFiles());

app.use(express.static(application_root + '/app'));
app.use(morgan('dev'));
app.use(cookieParser('kekse'));
app.use(bodyParser.json());

/* Authorization */
/* Baskets: Unauthorized users are not allowed to access baskets */
app.use('/rest/basket', insecurity.isAuthorized());
/* BasketItems: API only accessible for authenticated users */
app.use('/api/BasketItems', insecurity.isAuthorized());
app.use('/api/BasketItems/:id', insecurity.isAuthorized());
/* Feedbacks: GET allowed for feedback carousel, POST allowed in order to provide feedback without being logged in */
app.use('/api/Feedbacks/:id', insecurity.isAuthorized());
/* Users: Only POST is allowed in order to register a new uer */
app.get('/api/Users', insecurity.isAuthorized());
app.get('/api/Users/:id', insecurity.isAuthorized());
app.put('/api/Users/:id', insecurity.isAuthorized());
app.delete('/api/Users/:id', insecurity.denyAll()); // Deleting users is forbidden entirely to keep login challenges solvable
/* Products: Only GET is allowed in order to view products */
app.post('/api/Products', insecurity.isAuthorized());
//app.put('/api/Products/:id', insecurity.isAuthorized()); // = missing function-level access control vulnerability
app.delete('/api/Products/:id', insecurity.denyAll()); // Deleting products is forbidden entirely to keep the O-Saft url-change challenge solvable
/* Challenges: GET list of challenges allowed. Everything else forbidden independent of authorization (hence the random secret) */
app.post('/api/Challenges', insecurity.denyAll());
app.use('/api/Challenges/:id', insecurity.denyAll());
/* REST API */
app.use('/rest/user/authentication-details', insecurity.isAuthorized());
app.use('/rest/basket/:id', insecurity.isAuthorized());
app.use('/rest/basket/:id/order', insecurity.isAuthorized());

/* Challenge evaluation before db.sequelize-restful takes over */
app.post('/api/Feedbacks', verifyForgedFeedbackChallenge());

/* db.Sequelize Restful APIs */
app.use(restful(db.sequelize, { endpoint: '/api', allowed: ['Users', 'Products', 'Feedbacks', 'BasketItems', 'Challenges'] }));
/* Custom Restful API */
app.post('/rest/user/login', loginUser());
app.get('/rest/user/change-password', changePassword());
app.get('/rest/user/authentication-details', retrieveUserList());
app.get('/rest/user/whoami', retrieveLoggedInUsersId());
app.get('/rest/product/search', searchProducts());
app.get('/rest/basket/:id', retrieveBasket());
app.post('/rest/basket/:id/order', createOrderPdf());
app.get('/rest/admin/application-version', retrieveAppVersion());
app.get('/redirect', performRedirect());
/* File Serving */
app.get('/the/devs/are/so/funny/they/hid/an/easter/egg/within/the/easter/egg', serveEasterEgg());
app.use(serveAngularClient());
/* Error Handling */
app.use(verifyErrorHandlingChallenge());
app.use(errorhandler());

exports.start = function (config, readyCallback) {
    if (!this.server) {
        this.server = app.listen(config.port, function () {
            console.log('Listening on port %d', config.port);
            // callback to call when the server is ready
            if (readyCallback) {
                readyCallback();
            }
        });
    }
};

exports.close = function (exitCode) {
    this.server.close();
    if (exitCode && exitCode !== 0) {
        process.exit(exitCode);
    }
};

function verifyForgedFeedbackChallenge() {
    return function(req, res, next) {
        if (notSolved(forgedFeedbackChallenge)) {
            var user = insecurity.authenticatedUsers.from(req);
            var userId = user ? user.data.id : undefined;
            if (req.body.UserId && req.body.UserId != userId) {
                solve(forgedFeedbackChallenge);
            }
        }
        next();
    };
}

function verifyAccessControlChallenges() {
    return function (req, res, next) {
        if (notSolved(scoreBoardChallenge) && utils.endsWith(req.url, '/scoreboard.png')) {
            solve(scoreBoardChallenge);
        } else if (notSolved(adminSectionChallenge) && utils.endsWith(req.url, '/administration.png')) {
            solve(adminSectionChallenge);
        }
        next();
    };
}

function retrieveLoggedInUsersId() {
    return function (req, res) {
        var user = insecurity.authenticatedUsers.from(req);
        res.json({id: (user ? user.data.id : undefined), email: (user ? user.data.email : undefined)});
    };
}

function retrieveAppVersion() {
    return function (req, res) {
        res.json({version: utils.version()});
    };
}

function serveAngularClient() {
    return function (req, res, next) {
        if (!utils.startsWith(req.url, '/api') && !utils.startsWith(req.url, '/rest')) {
            res.sendFile(__dirname + '/app/index.html');
        } else {
            next(new Error('Unexpected path: ' + req.url));
        }
    };
}

function verifyErrorHandlingChallenge() {
    return function (err, req, res, next) {
        if (notSolved(errorHandlingChallenge) && err && res.statusCode > 401) {
            solve(errorHandlingChallenge);
        }
        next(err);
    };
}

function serveEasterEgg() {
    return function (req, res) {
        if (notSolved(easterEggLevelTwoChallenge)) {
            solve(easterEggLevelTwoChallenge);
        }
        res.sendFile(__dirname + '/app/private/threejs-demo.html');
    };
}

function performRedirect() {
    return function(req, res) {
        var to = req.query.to;
        var githubUrl = 'https://github.com/bkimminich/juice-shop';
        if (to.indexOf(githubUrl) > -1) {
            if (notSolved(redirectChallenge) && to !== githubUrl) { // TODO Instead match against something like <anotherUrl>[?&]=githubUrl
                solve(redirectChallenge);
            }
            res.redirect(to);
        } else {
            res.redirect(githubUrl);
        }
    };
}

function retrieveBasket() {
    return function(req, res, next){
        var id = req.params.id;
        Basket.find({where: {id: id}, include: [ Product ]})
            .success(function(basket) {
                if (notSolved(basketChallenge)) {
                    var user = insecurity.authenticatedUsers.from(req);
                    if (user && user.bid != id) {
                        solve(basketChallenge);
                    }
                }
                res.json(utils.queryResultToJson(basket));
            }).error(function (error) {
                next(error);
            });
    };
}

function retrieveUserList() {
    return function(req, res, next){
        User.findAll().success(function(users) {
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

function createOrderPdf() {
    return function(req, res, next){
        var id = req.params.id;
        Basket.find({where: {id: id}, include: [ Product ]})
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

                    if (notSolved(negativeOrderChallenge) && totalPrice < 0) {
                        solve (negativeOrderChallenge);
                    }

                    fileWriter.on('finish', function() {
                        BasketItem.destroy({BasketId: id});
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

function searchProducts() {
    return function(req, res, next){
        var criteria = req.query.q === 'undefined' ? '' : req.query.q || '';
        if (notSolved(localXssChallenge) && utils.contains(criteria, '<script>alert("XSS1")</script>')) {
            solve(localXssChallenge);
        }
        db.sequelize.query('SELECT * FROM Products WHERE (name LIKE \'%' + criteria + '%\') OR (description LIKE \'%' + criteria + '%\')')
            .success(function(products) {
                if (notSolved(unionSqlInjectionChallenge)) {
                    var dataString = JSON.stringify(products);
                    var solved = true;
                    User.findAll().success(function(data) {
                        var users = utils.queryResultToJson(data);
                        if (users.data && users.data.length) {
                            for (var i=0; i<users.data.length; i++) {
                                solved = solved && utils.contains(dataString, users.data[i].email) && utils.contains(dataString, users.data[i].password);
                                if (!solved) {
                                    break;
                                }
                            }
                            if (solved) {
                                solve(unionSqlInjectionChallenge);
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

function changePassword() {
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
                User.find(loggedInUser.data.id).success(function(user) {
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

function loginUser() {
    return function(req, res, next){
        if (notSolved(weakPasswordChallenge) && req.body.email === 'admin@juice-sh.op' && req.body.password === 'admin123') {
            solve(weakPasswordChallenge);
        }
        db.sequelize.query('SELECT * FROM Users WHERE email = \'' + (req.body.email || '') + '\' AND password = \'' + insecurity.hash(req.body.password || '') + '\'', User, {plain: true})
            .success(function(authenticatedUser) {
                var user = utils.queryResultToJson(authenticatedUser);
                if (user.data && user.data.id) {
                    if (notSolved(loginAdminChallenge) && user.data.id === 1) {
                        solve(loginAdminChallenge);
                    } else if (notSolved(loginJimChallenge) && user.data.id === 2) {
                        solve(loginJimChallenge);
                    } else if  (notSolved(loginBenderChallenge) && user.data.id === 3) {
                        solve(loginBenderChallenge);
                    }
                    Basket.findOrCreate({UserId: user.data.id}).success(function(basket) {
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

function serveFiles() {
    return function(req, res, next) {
        var file = req.params.file;
        if (file && (utils.endsWith(file, '.md') || (utils.endsWith(file, '.pdf')))) {
            file = insecurity.cutOffPoisonNullByte(file);
            if (notSolved(easterEggLevelOneChallenge) && file.toLowerCase() === 'eastere.gg') {
                solve(easterEggLevelOneChallenge);
            } else if (notSolved(directoryListingChallenge) && file.toLowerCase() === 'acquisitions.md') {
                solve(directoryListingChallenge);
            }
            res.sendFile(__dirname + '/app/public/ftp/' + file);
        } else {
            res.status(403);
            next(new Error('Only .md and .pdf files are allowed!'));
        }
    };
}

function verifyDatabaseRelatedChallenges() {
    return function (req, res, next) {
        if (notSolved(changeProductChallenge) && osaft) {
            osaft.reload().success(function () {
                if (!utils.contains(osaft.description, '<a href="https://www.owasp.org/index.php/O-Saft" target="_blank">')) {
                    if (utils.contains(osaft.description, '<a href="http://kimminich.de" target="_blank">')) {
                        solve(changeProductChallenge);
                    }
                }
            });
        }
        if (notSolved(csrfChallenge) && bender) {
            bender.reload().success(function() {
                if (bender.password === insecurity.hash('slurmCl4ssic')) {
                    solve(csrfChallenge);
                }
            });
        }
        if (notSolved(feedbackChallenge)) {
            Feedback.findAndCountAll({where: {rating: 5}}).success(function (feedbacks) {
                if (feedbacks.count === 0) {
                    solve(feedbackChallenge);
                }
            });
        }
        if (notSolved(knownVulnerableComponentChallenge)) {
            Feedback.findAndCountAll({where: db.Sequelize.or(
                db.Sequelize.and(['comment LIKE \'%sanitize-html%\''], ['comment LIKE \'%1.4.2%\'']),
                db.Sequelize.and(['comment LIKE \'%htmlparser2%\''], ['comment LIKE \'%3.3.0%\'']) ) }
            ).success(function (data) {
                if (data.count > 0) {
                    solve(knownVulnerableComponentChallenge);
                }
            });
        }
        next();
    };
}

function solve(challenge) {
    challenge.solved = true;
    challenge.save().success(function() {
        console.log('Solved challenge "' + challenge.description + '"');
    });
}

function notSolved(challenge) {
    return challenge && !challenge.solved;
}