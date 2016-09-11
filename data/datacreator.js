/*jslint node: true */
'use strict';

var models = require('../models/index'),
    datacache = require('./datacache'),
    challenges = datacache.challenges,
    users = datacache.users,
    products = datacache.products;

module.exports = function() {

    createChallenges();
    createUsers();
    createProducts();
    createBaskets();
    createFeedback();

    function createChallenges() {
        models.Challenge.create({
            name: 'scoreBoard',
            description: 'Find the carefully hidden \'Score Board\' page.',
            difficulty: 1,
            solved: false
        }).success(function (challenge) {
            challenges.scoreBoardChallenge = challenge;
        });
        models.Challenge.create({
            name: 'errorHandling',
            description: 'Provoke an error that is not very gracefully handled.',
            difficulty: 1,
            solved: false
        }).success(function (challenge) {
            challenges.errorHandlingChallenge = challenge;
        });
        models.Challenge.create({
            name: 'loginAdmin',
            description: 'Log in with the administrator\'s user account.',
            difficulty: 1,
            solved: false
        }).success(function (challenge) {
            challenges.loginAdminChallenge = challenge;
        });
        models.Challenge.create({
            name: 'loginJim',
            description: 'Log in with Jim\'s user account.',
            difficulty: 2,
            solved: false
        }).success(function (challenge) {
            challenges.loginJimChallenge = challenge;
        });
        models.Challenge.create({
            name: 'loginBender',
            description: 'Log in with Bender\'s user account.',
            difficulty: 2,
            solved: false
        }).success(function (challenge) {
            challenges.loginBenderChallenge = challenge;
        });
        models.Challenge.create({
            name: 'xss1',
            description: 'XSS Tier 1: Perform a <i>reflected</i> XSS attack with &lt;script&gt;alert("XSS1")&lt;/script&gt;.',
            difficulty: 1,
            solved: false
        }).success(function (challenge) {
            challenges.localXssChallenge = challenge;
        });
        models.Challenge.create({
            name: 'xss2',
            description: 'XSS Tier 2: Perform a <i>persisted</i> XSS attack with &lt;script&gt;alert("XSS2")&lt;/script&gt; bypassing a <i>client-side</i> security mechanism.',
            difficulty: 2,
            solved: false
        }).success(function (challenge) {
            challenges.persistedXssChallengeUser = challenge;
        });
        models.Challenge.create({
            name: 'xss3',
            description: 'XSS Tier 3: Perform a <i>persisted</i> XSS attack with &lt;script&gt;alert("XSS3")&lt;/script&gt; bypassing a <i>server-side</i> security mechanism.',
            difficulty: 3,
            solved: false
        }).success(function (challenge) {
            challenges.persistedXssChallengeFeedback = challenge;
        });
        models.Challenge.create({
            name: 'xss4',
            description: 'XSS Tier 4: Perform a <i>persisted</i> XSS attack with &lt;script&gt;alert("XSS4")&lt;/script&gt; without using the frontend application at all.',
            difficulty: 2,
            solved: false
        }).success(function (challenge) {
            challenges.restfulXssChallenge = challenge;
        });
        models.Challenge.create({
            name: 'unionSqlI',
            description: 'Retrieve a list of all user credentials via SQL Injection',
            difficulty: 2,
            solved: false
        }).success(function (challenge) {
            challenges.unionSqlInjectionChallenge = challenge;
        });
        models.Challenge.create({
            name: 'adminCredentials',
            description: 'Log in with the administrator\'s user credentials without previously changing them or applying SQL Injection.',
            difficulty: 1,
            solved: false
        }).success(function (challenge) {
            challenges.weakPasswordChallenge = challenge;
        });
        models.Challenge.create({
            name: 'fiveStarFeedback',
            description: 'Get rid of all 5-star customer feedback.',
            difficulty: 1,
            solved: false
        }).success(function (challenge) {
            challenges.feedbackChallenge = challenge;
        });
        models.Challenge.create({
            name: 'forgedFeedback',
            description: 'Post some feedback in another users name.',
            difficulty: 2,
            solved: false
        }).success(function (challenge) {
            challenges.forgedFeedbackChallenge = challenge;
        });
        models.Challenge.create({
            name: 'redirect',
            description: 'Wherever you go, there you are.',
            difficulty: 3,
            solved: false
        }).success(function (challenge) {
            challenges.redirectChallenge = challenge;
        });
        models.Challenge.create({
            name: 'accessBasket',
            description: 'Access someone else\'s basket.',
            difficulty: 1,
            solved: false
        }).success(function (challenge) {
            challenges.basketChallenge = challenge;
        });
        models.Challenge.create({
            name: 'negativeOrder',
            description: 'Place an order that makes you rich.',
            difficulty: 2,
            solved: false
        }).success(function (challenge) {
            challenges.negativeOrderChallenge = challenge;
        });
        models.Challenge.create({
            name: 'confidentialDocument',
            description: 'Access a confidential document.',
            difficulty: 1,
            solved: false
        }).success(function (challenge) {
            challenges.directoryListingChallenge = challenge;
        });
        models.Challenge.create({
            name: 'forgottenDevBackup',
            description: 'Access a developer\'s forgotten backup file.',
            difficulty: 2,
            solved: false
        }).success(function (challenge) {
            challenges.forgottenDevBackupChallenge = challenge;
        });
        models.Challenge.create({
            name: 'forgottenBackup',
            description: 'Access a salesman\'s forgotten backup file.',
            difficulty: 2,
            solved: false
        }).success(function (challenge) {
            challenges.forgottenBackupChallenge = challenge;
        });
        models.Challenge.create({
            name: 'adminSection',
            description: 'Access the administration section of the store.',
            difficulty: 1,
            solved: false
        }).success(function (challenge) {
            challenges.adminSectionChallenge = challenge;
        });
        models.Challenge.create({
            name: 'csrf',
            description: 'Change Bender\'s password into <i>slurmCl4ssic</i>.',
            difficulty: 2,
            solved: false
        }).success(function (challenge) {
            challenges.csrfChallenge = challenge;
        });
        models.Challenge.create({
            name: 'changeProduct',
            description: 'Change the link in the description of the <a href="/#/search?q=O-Saft">O-Saft product</a> to <i>http://kimminich.de</i>.',
            difficulty: 2,
            solved: false
        }).success(function (challenge) {
            challenges.changeProductChallenge = challenge;
        });
        models.Challenge.create({
            name: 'vulnerableComponent',
            description: '<a href="/#/contact">Inform the shop</a> about a vulnerable library it is using. (Mention the exact library name and version in your complaint.)',
            difficulty: 2,
            solved: false
        }).success(function (challenge) {
            challenges.knownVulnerableComponentChallenge = challenge;
        });
        models.Challenge.create({
            name: 'weirdCrypto',
            description: '<a href="/#/contact">Inform the shop</a> about an algorithm or library it should definitely not use the way it does.',
            difficulty: 2,
            solved: false
        }).success(function (challenge) {
            challenges.weirdCryptoChallenge = challenge;
        });
        models.Challenge.create({
            name: 'easterEgg1',
            description: 'Find the hidden <a href="http://en.wikipedia.org/wiki/Easter_egg_(media)" target="_blank">easter egg</a>.',
            difficulty: 2,
            solved: false
        }).success(function (challenge) {
            challenges.easterEggLevelOneChallenge = challenge;
        });
        models.Challenge.create({
            name: 'easterEgg2',
            description: 'Apply some advanced cryptanalysis to find <i>the real</i> easter egg.',
            difficulty: 3,
            solved: false
        }).success(function (challenge) {
            challenges.easterEggLevelTwoChallenge = challenge;
        });
        models.Challenge.create({
            name: 'forgedCoupon',
            description: 'Forge a coupon code that gives you a discount of at least 80%.',
            difficulty: 3,
            solved: false
        }).success(function (challenge) {
            challenges.forgedCouponChallenge = challenge;
        });
        models.Challenge.create({
            name: 'geocitiesTheme',
            description: 'Travel back in time to the golden era of web design.',
            difficulty: 2,
            solved: false
        }).success(function (challenge) {
            challenges.geocitiesThemeChallenge = challenge;
        });
        models.Challenge.create({
            name: 'christmasSpecial',
            description: 'Order the Christmas special offer of 2014.',
            difficulty: 1,
            solved: false
        }).success(function (challenge) {
            challenges.christmasSpecialChallenge = challenge;
        });
        models.Challenge.create({
            name: 'uploadSize',
            description: 'File a complaint with an attachment >1MB.',
            difficulty: 2,
            solved: false
        }).success(function (challenge) {
            challenges.uploadSize = challenge;
        });
        models.Challenge.create({
            name: 'uploadType',
            description: 'File a complaint with a non-PDF attachment.',
            difficulty: 2,
            solved: false
        }).success(function (challenge) {
            challenges.uploadType = challenge;
        });
        models.Challenge.create({
            name: 'uploadAnonymous',
            description: 'File an anoymous complaint with a file named <i>clickme.html</i> attached.',
            difficulty: 2,
            solved: false
        }).success(function (challenge) {
            challenges.uploadAnonymous = challenge;
        });
    }
    function createUsers() {
        models.User.create({
            email: 'admin@juice-sh.op',
            password: 'admin123'
        });
        models.User.create({
            email: 'jim@juice-sh.op',
            password: 'ncc-1701'
        });
        models.User.create({
            email: 'bender@juice-sh.op',
            password: 'booze'
        }).success(function (user) {
            users.bender = user;
        });
    }

    function createProducts() {
        models.Product.create({
            name: 'Apple Juice (1000ml)',
            description: 'The all-time classic.',
            price: 1.99,
            image: 'apple_juice.jpg'
        });
        models.Product.create({
            name: 'Orange Juice (1000ml)',
            description: 'Made from oranges hand-picked by Uncle Dittmeyer.',
            price: 2.99,
            image: 'orange_juice.jpg'
        });
        models.Product.create({
            name: 'Eggfruit Juice (500ml)',
            description: 'Now with even more exotic flavour.',
            price: 8.99,
            image: 'eggfruit_juice.jpg'
        });
        models.Product.create({
            name: 'Raspberry Juice (1000ml)',
            description: 'Made from blended Raspberry Pi, water and sugar.',
            price: 4.99,
            image: 'raspberry_juice.jpg'
        });
        models.Product.create({
            name: 'Lemon Juice (500ml)',
            description: 'Sour but full of vitamins.',
            price: 2.99,
            image: 'lemon_juice.jpg'
        });
        models.Product.create({
            name: 'Banana Juice (1000ml)',
            description: 'Monkeys love it the most.',
            price: 1.99,
            image: 'banana_juice.jpg'
        });
        models.Product.create({
            name: 'OWASP Juice Shop T-Shirt',
            description: 'Real fans wear it 24/7!',
            price: 22.49,
            image: 'fan_shirt.jpg'
        });
        models.Product.create({
            name: 'OWASP SSL Advanced Forensic Tool (O-Saft)',
            description: 'O-Saft is an easy to use tool to show information about SSL certificate and tests the SSL connection according given list of ciphers and various SSL configurations. <a href="https://www.owasp.org/index.php/O-Saft" target="_blank">More...</a>',
            price: 0.01,
            image: 'owasp_osaft.jpg'
        }).success(function (product) {
            products.osaft = product;
        });
        models.Product.create({
            name: 'Christmas Super-Surprise-Box (2014 Edition)',
            description: 'Contains a random selection of 10 bottles (each 500ml) of our tastiest juices and an extra fan shirt (3XL) for an unbeatable price! Only available on Christmas 2014!',
            price: 29.99,
            image: 'undefined.jpg'
        }).success(function (product) {
            products.christmasSpecial = product;
            models.sequelize.query('UPDATE Products SET deletedAt = \'2014-12-27 00:00:00.000 +00:00\'  WHERE id = ' + product.id);
        });
        models.Product.create({
            name: 'OWASP Juice Shop Stickers',
            description: 'You want to put <a href="https://www.stickermule.com/de/user/1070702817/Sticker" target="_blank">one of these beauties</a> on your laptop. You definitely want that. Trust me.',
            price: 2.99,
            image: 'sticker.png'
        });
        models.Product.create({
            name: 'OWASP Juice Shop Mug',
            description: 'Black mug with logo on each side! Your colleagues will envy you!',
            price: 21.99,
            image: 'fan_mug.jpg'
        });
        models.Product.create({
            name: 'OWASP Juice Shop Hoodie',
            description: 'Mr. Robot-style apparel. But in black. And with logo.',
            price: 49.99,
            image: 'fan_hoodie.jpg'
        });
        models.Product.create({
            name: 'Woodruff Syrup "Forest Master X-Treme"',
            description: 'Harvested and manufactured in the Black Forest, Germany. Can cause hyperactive behavior in children. Can cause permanent green tongue when consumed undiluted.',
            price: 6.99,
            image: 'woodruff_syrup.jpg'
        });
        models.Product.create({
            name: 'Green Smoothie',
            description: 'Looks poisonous but is actually very good for your health! Made from green cabbage, spinach, kiwi and grass.',
            price: 1.99,
            image: 'green_smoothie.jpg'
        });
        models.Product.create({
            name: 'Quince Juice (1000ml)',
            description: 'Juice of the <em>Cydonia oblonga</em> fruit. Not exactly sweet but rich in Vitamin C.',
            price: 4.99,
            image: 'quince.jpg'
        });
        models.Product.create({
            name: 'OWASP Node.js Goat',
            description: 'OWASP NodeGoat project provides an environment to learn how OWASP Top 10 security risks apply to web applications developed using Node.js and how to effectively address them. <a href="https://www.owasp.org/index.php/Projects/OWASP_Node_js_Goat_Project" target="_blank">More...</a>',
            price: 0.01,
            image: 'owasplogo.png'
        });
        models.Product.create({
            name: 'Apple Pomace',
            description: 'Finest pressings of apples. Allergy disclaimer: Might contain traces of worms.',
            price: 0.89,
            image: 'apple_pressings.jpg'
        });
        models.Product.create({
            name: 'Fruit Press',
            description: 'Fruits go in. Juice comes out. Pomace you can send back to us for recycling purposes.',
            price: 89.99,
            image: 'fruit_press.jpg'
        });
    }

    function createBaskets() {
        models.Basket.create({
            UserId: 1
        });
        models.Basket.create({
            UserId: 2
        });
        models.Basket.create({
            UserId: 3
        });
        models.BasketItem.create({
            BasketId: 1,
            ProductId: 1,
            quantity: 2
        });
        models.BasketItem.create({
            BasketId: 1,
            ProductId: 2,
            quantity: 3
        });
        models.BasketItem.create({
            BasketId: 1,
            ProductId: 3,
            quantity: 1
        });
        models.BasketItem.create({
            BasketId: 2,
            ProductId: 4,
            quantity: 2
        });
        models.BasketItem.create({
            BasketId: 3,
            ProductId: 5,
            quantity: 1
        });
    }

    function createFeedback() {
        models.Feedback.create({
            UserId: 1,
            comment: 'I love this shop! Best juice in town! Highly recommended!',
            rating: 5
        });
        models.Feedback.create({
            UserId: 2,
            comment: 'Great shop! The O-Saft is highly recommended!',
            rating: 4
        });
        models.Feedback.create({
            comment: 'Why isn\'t there a T-Shirt for skinny people available?!<blockquote>Juice Shop: We now have shirts in all sizes</blockquote>',
            rating: 2
        });
        models.Feedback.create({
            comment: 'This is <b>the</b> store for juices of all kinds!',
            rating: 4
        });
        models.Feedback.create({
            comment: 'Never gonna buy my juice anywhere else from now on! Thanks for the great service!',
            rating: 4
        });
        models.Feedback.create({
            comment: 'Keep up the good work!',
            rating: 3
        });
        models.Feedback.create({
            UserId: 3,
            comment: 'No real drinks available here!',
            rating: 1
        });
    }
};
