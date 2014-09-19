var application_root = __dirname.replace(/\\/g, '/'),
    morgan = require('morgan'),
    Sequelize = require('sequelize'),
    sequelize = new Sequelize('database', 'username', 'password', {
        dialect: 'sqlite',
        storage: 'data/juiceshop.sqlite'
    }),
    restful = require('sequelize-restful'),
    passwordHash = require('password-hash'),
    express = require('express'),
	async = require('async'),
	app = express();

setupDatabase();
setupApplication();
exportServer();

function setupDatabase() {
    /* Domain Model */
    var User = sequelize.define('User', {
        name: Sequelize.STRING,
        password: Sequelize.STRING,
        email: Sequelize.STRING,
        admin: Sequelize.BOOLEAN
    });

    var Product = sequelize.define('Product', {
        name: Sequelize.STRING,
        description: Sequelize.STRING,
        price: Sequelize.DECIMAL,
        stock: Sequelize.INTEGER
    });

    var Basket = sequelize.define('Basket', {
    });

    var BasketItem = sequelize.define('BasketItems', {
        quantity: Sequelize.INTEGER
    })

    Basket.belongsTo(User)
    Basket.hasMany(Product, {through: BasketItem});
    Product.hasMany(Basket, {through: BasketItem});

    /* Data */
    sequelize.drop();
    sequelize.sync().success(function () {
        User.create({
            email: 'admin@juice-sh.op',
            name: 'Administrator',
            admin: true,
            password: passwordHash.generate('top5ecr3t')
        }).success(function (user) {
            console.log(user.values)
        });
        User.create({
            email: 'joe@juice-sh.op',
            name: 'Joe Average',
            admin: false,
            password: passwordHash.generate('averagejoe')
        }).success(function (user) {
            console.log(user.values)
        });
        Product.create({
            name: 'Guinea Pig',
            description: 'Cute but stupid rodent.',
            price: 20.99,
            stock: 10
        }).success(function (product) {
            console.log(product.values)
        });
        Product.create({
            name: 'Bunny',
            description: 'Likes carrots and knows where the Easter Egg is hidden.',
            price: 24.99,
            stock: 15
        }).success(function (product) {
            console.log(product.values)
        });
        Product.create({
            name: 'Horse',
            description: 'Animal to ride on.',
            price: 1200.99,
            stock: 3
        }).success(function (product) {
            console.log(product.values)
        });
        Basket.create({
            UserId: 1
        }).success(function (basket) {
            console.log(basket.values)
        });
        BasketItem.create({
            BasketId: 1,
            ProductId: 1,
            quantity: 2
        }).success(function (item) {
            console.log(item.values)
        });
        BasketItem.create({
            BasketId: 1,
            ProductId: 2,
            quantity: 3
        }).success(function (item) {
            console.log(item.values)
        });
        BasketItem.create({
            BasketId: 1,
            ProductId: 3,
            quantity: 1
        }).success(function (item) {
            console.log(item.values)
        });
    });
}

function setupApplication() {
    app.use(express.static(application_root + '/app'));
    app.use(morgan('combined'));
    app.use(restful(sequelize, { }));
    app.use(function (req, res, next) {
        if (req.url.indexOf('/api') !== 0) {
            res.sendFile(__dirname + '/app/index.html');
        } else {
            next();
        }
    });
}

function exportServer() {
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
}