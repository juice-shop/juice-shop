/*jslint node: true */
'use strict';

var application_root = __dirname.replace(/\\/g, '/'),
    morgan = require('morgan'),
    Sequelize = require('sequelize'),
    sequelize = new Sequelize('database', 'username', 'password', {
        dialect: 'sqlite',
        storage: 'data/juiceshop.sqlite'
    }),
    restful = require('sequelize-restful'),
    express = require('express'),
    errorhandler = require('errorhandler'),
    cookieParser = require('cookie-parser'),
    serveIndex = require('serve-index'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    utils = require('./lib/utils'),
    insecurity = require('./lib/insecurity'),
    app = express();

/* Domain Model */
var User = sequelize.define('User', {
        email: Sequelize.STRING,
        password: Sequelize.STRING
    },
    { hooks: {
        beforeCreate: function (user, fn) {
            user.password = insecurity.hash(user.password);
            fn(null, user);
        },
        beforeUpdate: function (user, fn) { // Pitfall: Will hash the hashed password again if password was not updated
            user.password = insecurity.hash(user.password);
            fn(null, user);
        }
    }}
);

var Product = sequelize.define('Product', {
    name: Sequelize.STRING,
    description: Sequelize.STRING,
    price: Sequelize.DECIMAL,
    image: Sequelize.STRING
});

var Basket = sequelize.define('Basket', {
});

var BasketItem = sequelize.define('BasketItems', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    quantity: Sequelize.INTEGER
});

Basket.belongsTo(User);
Basket.hasMany(Product, {through: BasketItem});
Product.hasMany(Basket, {through: BasketItem});

var Feedback = sequelize.define('Feedback', {
    comment: Sequelize.STRING,
    rating: Sequelize.INTEGER
});

Feedback.belongsTo(User);

var Challenge = sequelize.define('Challenges', {
    description: Sequelize.STRING,
    solved: Sequelize.BOOLEAN,
    solvable: Sequelize.BOOLEAN // TODO Remove when all challenges are solvable
});

/* Challenges */
var redirectChallenge, easterEggLevelOneChallenge, easterEggLevelTwoChallenge, directoryListingChallenge,
    loginAdminChallenge, loginJimChallenge, loginBenderChallenge, changeProductChallenge, csrfChallenge,
    errorHandlingChallenge,

    localXssChallenge, persistedXssChallenge, basketChallenge, negativeOrderChallenge,
    adminSectionChallenge, scoreBoardChallenge, feedbackChallenge;

/* Entities relevant for challenges */

var bender, osaft;

/* Data */
sequelize.drop();
sequelize.sync().success(function () {
    Challenge.create({
        description: 'Find the carefully hidden \'Score Board\' page.',
        solved: false,
        solvable: false
    }).success(function(challenge) {
        scoreBoardChallenge = challenge;
    });
    Challenge.create({
        description: 'Provoke an error that is not very gracefully handled.',
        solved: false,
        solvable: true
    }).success(function(challenge) {
        errorHandlingChallenge = challenge;
    });
    Challenge.create({
        description: 'Log in with the administrator\'s user account.',
        solved: false,
        solvable: true
    }).success(function(challenge) {
        loginAdminChallenge = challenge;
    });
    Challenge.create({
        description: 'Log in with Jim\'s user account.',
        solved: false,
        solvable: true
    }).success(function(challenge) {
        loginJimChallenge = challenge;
    });
    Challenge.create({
        description: 'Log in with Bender\'s user account.',
        solved: false,
        solvable: true
    }).success(function(challenge) {
        loginBenderChallenge = challenge;
    });
    Challenge.create({
        description: 'Perform a reflected XSS attack with &lt;script&gt;alert(\'XSS1\')&lt;/script&gt;.',
        solved: false,
        solvable: false
    }).success(function(challenge) {
        localXssChallenge = challenge;
    });
    Challenge.create({
        description: 'Perform a persisted XSS attack with &lt;script&gt;alert(\'XSS2\')&lt;/script&gt;.',
        solved: false,
        solvable: false
    }).success(function(challenge) {
        persistedXssChallenge = challenge;
    });
    Challenge.create({
        description: 'Get rid of all 5-star customer feedback.',
        solved: false,
        solvable: true
    }).success(function(challenge) {
        feedbackChallenge = challenge;
    });
    Challenge.create({
        description: 'Wherever you go, there you are.',
        solved: false,
        solvable: true
    }).success(function(challenge) {
        redirectChallenge = challenge;
    });
    Challenge.create({
        description: 'Access someone else\'s basket.',
        solved: false,
        solvable: false
    }).success(function(challenge) {
        basketChallenge = challenge;
    });
    Challenge.create({
        description: 'Place an order that makes you rich.',
        solved: false,
        solvable: false
    }).success(function(challenge) {
        negativeOrderChallenge = challenge;
    });
    Challenge.create({
        description: 'Access a confidential document.',
        solved: false,
        solvable: true
    }).success(function(challenge) {
        directoryListingChallenge = challenge;
    });
    Challenge.create({
        description: 'Access the administration section of the store.',
        solved: false,
        solvable: false
    }).success(function(challenge) {
        adminSectionChallenge = challenge;
    });
    Challenge.create({
        description: 'Trick Bender into changing his password into <i>slurmCl4ssic</i>.' ,
        solved: false,
        solvable: true
    }).success(function(challenge) {
        csrfChallenge = challenge;
    });
    Challenge.create({
        description: 'Change the link in the description of the <a href="/#/search?q=O-Saft">O-Saft product</a> to <i>http://kimminich.de</i>.',
        solved: false,
        solvable: true
    }).success(function(challenge) {
        changeProductChallenge = challenge;
    });
    Challenge.create({
        description: 'Find the hidden <a href="http://en.wikipedia.org/wiki/Easter_egg_(media)" target="_blank">easter egg</a>.',
        solved: false,
        solvable: true
    }).success(function(challenge) {
        easterEggLevelOneChallenge = challenge;
    });
    Challenge.create({
        description: 'Apply some advanced cryptanalysis to find <i>the real</i> easter egg.',
        solved: false,
        solvable: true
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
    Feedback.create({
        UserId: 1,
        comment: 'I love this shop! Best juice in town! Highly recommended!',
        rating: 5
    });
    Feedback.create({
        UserId: 3,
        comment: 'No real drinks available here!',
        rating: 1
    });
});

/* Favicon */
app.use(favicon(__dirname + '/app/public/favicon.ico'));

/* Database checks for solved challenges */
app.use(function (req, res, next) {
    if (osaft) {
        osaft.reload().success(function () {
            if (!utils.contains(osaft.description, '<a href="https://www.owasp.org/index.php/O-Saft" target="_blank">')) {
                if (utils.contains(osaft.description, '<a href="http://kimminich.de" target="_blank">')) {
                    solve(changeProductChallenge);
                }
            }
        });
    }
    if (bender) {
        bender.reload().success(function() {
            if (bender.password === insecurity.hash('slurmCl4ssic')) {
                solve(csrfChallenge);
            }
        });
    }
    Feedback.findAndCountAll({where: {rating: 5}}).success(function(data) {
        if (data.count === 0) {
            solve(feedbackChallenge)
        }
    });
    next();
});

/* public/ftp directory browsing and file download */
app.use('/public/ftp', serveIndex('app/public/ftp', {'icons': true}));
app.use('/public/ftp/:file', function(req, res, next) {
    var file = req.params.file;
    console.log(file);
    if (file && (utils.endsWith(file, '.md') || (utils.endsWith(file, '.txt')))) {
        file = insecurity.cutOffPoisonNullByte(file);
        if (file.toLowerCase() === 'eastere.gg') {
            solve(easterEggLevelOneChallenge);
        } else if (file.toLowerCase() === 'acquisitions.md') {
            solve(directoryListingChallenge);
        }
        res.sendFile(__dirname + '/app/public/ftp/' + file);
    } else {
        res.status(403);
        next('Only .md and .txt files are allowed!');
    }
});

app.use(express.static(application_root + '/app'));
app.use(morgan('combined'));
app.use(cookieParser('kekse'));
app.use(bodyParser.json());

/* Authorization */

/* Baskets: Unauthorized users are not allowed to access baskets */
app.use('/rest/basket', insecurity.isAuthorized());

/* BasketItems: API only accessible for authenticated users */
app.use('/api/BasketItems', insecurity.isAuthorized());
app.use('/api/BasketItems/:id', insecurity.isAuthorized());

/* Feedbacks: Only POST is allowed in order to provide feedback without being logged in */
app.get('/api/Feedbacks', insecurity.isAuthorized());
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

/* Restful APIs */
app.use(restful(sequelize, { endpoint: '/api', allowed: ['Users', 'Products', 'Feedbacks', 'BasketItems', 'Challenges'] }));

app.post('/rest/user/login', function(req, res, next){
    sequelize.query('SELECT * FROM Users WHERE email = \'' + (req.body.email || '') + '\' AND password = \'' + insecurity.hash(req.body.password || '') + '\'', User, {plain: true})
        .success(function(data) {
            var user = utils.queryResultToJson(data);
            if (user.data && user.data.id) {
                if (user.data.id === 1) {
                    solve(loginAdminChallenge);
                } else if (user.data.id === 2) {
                    solve(loginJimChallenge);
                } else if  (user.data.id === 3) {
                    solve(loginBenderChallenge);
                }
                Basket.findOrCreate({UserId: user.data.id}).success(function(basket) {
                    res.json({ token: insecurity.authorize(user), bid: basket.id });
                }).error(function (error) {
                    next(error);
                });
            } else {
                res.status(401).send('Invalid email or password');
            }
        }).error(function (error) {
            next(error);
        });
});

app.get('/rest/product/search', function(req, res, next){
    var criteria = req.query.q === 'undefined' ? '' : req.query.q || '';
    sequelize.query('SELECT * FROM Products WHERE name LIKE \'%' + criteria + '%\' OR description LIKE \'%' + criteria + '%\'')
        .success(function(data) {
            res.json(utils.queryResultToJson(data));
        }).error(function (error) {
            next(error);
        });
});

app.get('/rest/basket/:id', function(req, res, next){
    var id = req.params.id;
    Basket.find({where: {id: id}, include: [ Product ]})
        .success(function(data) {
            res.json(utils.queryResultToJson(data));
        }).error(function (error) {
            next(error);
        });
});

/* Redirects */
app.get('/redirect', function(req, res) {
    var to = req.query.to;
    var githubUrl = 'https://github.com/bkimminich/juice-shop';
    if (to.indexOf(githubUrl) > -1) {
        if (to !== githubUrl) { // TODO Instead match against something like <anotherUrl>[?&]=githubUrl
            solve(redirectChallenge);
        }
        res.redirect(to);
    } else {
        res.redirect(githubUrl);
    }
});

/* Easter Egg */
app.use('/the/devs/are/so/funny/they/hid/an/easter/egg/within/the/easter/egg', function (req, res) {
    solve(easterEggLevelTwoChallenge);
    res.sendFile(__dirname + '/app/private/threejs-demo.html');
});

/* Angular.js client */
app.use(function (req, res, next) {
    if (!utils.startsWith(req.url, '/api') && !utils.startsWith(req.url, '/rest')) {
        res.sendFile(__dirname + '/app/index.html');
    } else {
        next();
    }
});

/* Generic error handling */
app.use(function (req, res, next) {
    solve(errorHandlingChallenge);
    next();
});
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

function solve(challenge) {
    challenge.solved = true;
    challenge.save().success(function() {
        console.log('Solved challenge "' + challenge.description + '"');
    });
}