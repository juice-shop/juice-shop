var application_root = __dirname.replace(/\\/g, '/'),
    morgan = require('morgan'),
    Sequelize = require('sequelize'),
    sequelize = new Sequelize('database', 'username', 'password', {
        dialect: 'sqlite',
        storage: 'data/bolt.sqlite'
    }),
    restful = require('sequelize-restful'),
    express = require('express'),
	async = require('async'),
	app = express();

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

BasketItems = sequelize.define('BasketItems', {
    quantity: Sequelize.INTEGER
})

Basket.belongsTo(User)
Basket.hasMany(Product, {through: BasketItems});
Product.hasMany(Basket, {through: BasketItems});

/* Data */
sequelize.drop();
sequelize.sync().success(function () {
    User.create({
        email: 'admin@ng-bodge.it',
        name: 'Administrator',
        admin: true,
        password: "top5ecr3t"
    }).success(function (user) {
        console.log(user.values)
    });
    User.create({
        email: 'joe@ng-bodge.it',
        name: 'Joe Average',
        admin: false,
        password: "averagejoe"
    }).success(function (user) {
        console.log(user.values)
    });
    Product.create({
        name: 'Guinea Pig',
        description: 'Cute but stupid rodent.',
        price: 20.99,
        stock: 10
    });
    Product.create({
        name: 'Bunny',
        description: 'Likes carrots and knows where the Easter Egg is hidden.',
        price: 24.99,
        stock: 15
    });
});

/* app configuration */
app.use(express.static(application_root + '/static/app'));
app.use(morgan('combined'));

app.use(function (req, res, next) {
    if (req.url.indexOf('/api') !== 0 && req.url.indexOf('/rest') !== 0) {
        res.sendFile(__dirname + '/static/app/index.html');
    } else {
        next();
    }
});

app.use(restful(sequelize, { }));

/*app.get('/rest/user/:id/current-location', function(req, res){
	User.find(req.params.id).success(function(user) {
		geocoder.geocode(user.password, function ( err, data ) {
			res.send(data);
		});
	}).error(function(error) {
			res.send(error);
	});
});

app.get('/rest/user/:id/home-location', function(req, res){
    User.find(req.params.id).success(function(user) {
        geocoder.geocode(user.homeLocation, function ( err, data ) {
            res.send(data);
        });
    }).error(function(error) {
        res.send(error);
    });
});


app.get('/rest/transport-order/:id/route', function(req, res){

	Product.find(req.params.id).success(function(transportOrder) {

		async.parallel([
			function(callback){
			 	//get location name
				 geocoder.geocode(transportOrder.name, function ( err, data ) {
					 callback(null, data);
				 });

			},
			function(callback){
				//get location to
				geocoder.geocode(transportOrder.to, function ( err, data ) {
					callback(null, data);
				});

			}
		],
		function(err, results){

			res.send({
				name: results[0],
				to: results[1]
			});

		});


	}).error(function(error) {
			res.send(error);
		});

});*/

/* provide server */
exports.start = function( config, readyCallback ) {
    if(!this.server) {
        this.server = app.listen( config.port, function() {
            console.log('Listening on port %d', config.port);
            // callback to call when the server is ready
            if(readyCallback) {
                readyCallback();
            }
        });
    }
};

exports.close = function() {
    this.server.close();
};