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
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    serveIndex = require('serve-index'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    crypto = require('crypto'),
    app = express();

/* Domain Model */
var User = sequelize.define('User', {
    email: Sequelize.STRING,
    password: Sequelize.STRING,
    admin: Sequelize.BOOLEAN
});

var Product = sequelize.define('Product', {
    name: Sequelize.STRING,
    description: Sequelize.STRING,
    price: Sequelize.DECIMAL,
    image: Sequelize.STRING
});

var Basket = sequelize.define('Basket', {
});

var BasketItem = sequelize.define('BasketItems', {
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

/* Data */
sequelize.drop();
sequelize.sync().success(function () {
    User.create({
        email: 'admin@juice-sh.op',
        admin: true,
        password: hash('admin123')
    });
    User.create({
        email: 'jim@juice-sh.op',
        admin: false,
        password: hash('ncc-1701')
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
        name: 'Juice Shop T-Shirt (3XL)',
        description: 'Real fans wear it 24/7!',
        price: 24.99,
        image: 'fan_shirt.jpg'
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
        UserId: 2,
        comment: 'I love this shop! Best juice in town!',
        rating: 5
    });
});

app.use(favicon(__dirname + '/app/public/favicon.ico'));
app.use(express.static(application_root + '/app'));
app.use(morgan('combined'));
app.use(cookieParser('supersecret'));
app.use(session({secret: 'topsecret',
        saveUninitialized: true,
        resave: true})
);
app.use(bodyParser.json());
/* Restful APIs */
app.use(restful(sequelize, { endpoint: '/api' }));
app.post('/rest/user/login', function(req, res, next){
    sequelize.query('SELECT * FROM Users WHERE email = \'' + req.body.email + '\' AND password = \'' + hash(req.body.password) + '\'', User, {plain: true})
        .success(function(data) {
            var user = queryResultToJson(data);
            req.session.userid = user.id;
            res.send(user);
        }).error(function (error) {
            next(error);
        });
});
app.get('/rest/product/search', function(req, res, next){
    var criteria = req.query.q === 'undefined' ? '' : req.query.q || '';
    sequelize.query('SELECT * FROM Products WHERE name LIKE \'%' + criteria + '%\' OR description LIKE \'%' + criteria + '%\'')
        .success(function(data) {
            res.send(queryResultToJson(data));
        }).error(function (error) {
            next(error);
        });
});
/* Static Resources */
app.use('/public/ftp', serveIndex('app/public/ftp', {'icons': true}));
app.use(function (req, res, next) {
    if (req.url.indexOf('/api') !== 0 && req.url.indexOf('/rest') !== 0) {
        res.sendFile(__dirname + '/app/index.html');
    } else {
        next();
    }
});
/* Generic error handling */
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

exports.close = function () {
    this.server.close();
};

function queryResultToJson(data, status) {
    var wrappedData = {};
    if (data) {
        if (!data.length && data.dataValues) {
            wrappedData = data.dataValues;
        } else if (data.length > 0) {
            wrappedData = [];
            for (var i=0; i<data.length; i++) {
                if (data[i].dataValues) {
                    wrappedData.push(data[i].dataValues);
                } else {
                    wrappedData.push(data[i]);
                }
            }
        } else {
            wrappedData = data;
        }
    }
    return {
        status: status || 'success',
        data: wrappedData
    };
}

function hash(data) {
    return crypto.createHash("md5").update(data).digest("hex");
}
exports.hash = hash;