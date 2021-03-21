"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.close = exports.start = void 0;
/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */
var startTime = Date.now();
var path = require('path');
var fs = require("fs");
var morgan = require('morgan');
var colors = require('colors/safe');
var finale = require('finale-rest');
var express = require('express');
var compression = require('compression');
var helmet = require('helmet');
var featurePolicy = require('feature-policy');
var errorhandler = require('errorhandler');
var cookieParser = require('cookie-parser');
var serveIndex = require('serve-index');
var bodyParser = require('body-parser');
var cors = require('cors');
var securityTxt = require('express-security.txt');
var robots = require('express-robots-txt');
var yaml = require('js-yaml');
var swaggerUi = require('swagger-ui-express');
var RateLimit = require('express-rate-limit');
var client = require('prom-client');
var swaggerDocument = yaml.load(fs.readFileSync('./swagger.yml', 'utf8'));
var _a = require('./routes/fileUpload'), ensureFileIsPassed = _a.ensureFileIsPassed, handleZipFileUpload = _a.handleZipFileUpload, checkUploadSize = _a.checkUploadSize, checkFileType = _a.checkFileType, handleXmlUpload = _a.handleXmlUpload;
var profileImageFileUpload = require('./routes/profileImageFileUpload');
var profileImageUrlUpload = require('./routes/profileImageUrlUpload');
var redirect = require('./routes/redirect');
var vulnCodeSnippet = require('./routes/vulnCodeSnippet');
var angular = require('./routes/angular');
var easterEgg = require('./routes/easterEgg');
var premiumReward = require('./routes/premiumReward');
var privacyPolicyProof = require('./routes/privacyPolicyProof');
var appVersion = require('./routes/appVersion');
var repeatNotification = require('./routes/repeatNotification');
var continueCode = require('./routes/continueCode');
var restoreProgress = require('./routes/restoreProgress');
var fileServer = require('./routes/fileServer');
var quarantineServer = require('./routes/quarantineServer');
var keyServer = require('./routes/keyServer');
var logFileServer = require('./routes/logfileServer');
var metrics = require('./routes/metrics');
var authenticatedUsers = require('./routes/authenticatedUsers');
var currentUser = require('./routes/currentUser');
var login = require('./routes/login');
var changePassword = require('./routes/changePassword');
var resetPassword = require('./routes/resetPassword');
var securityQuestion = require('./routes/securityQuestion');
var search = require('./routes/search');
var coupon = require('./routes/coupon');
var basket = require('./routes/basket');
var order = require('./routes/order');
var verify = require('./routes/verify');
var recycles = require('./routes/recycles');
var b2bOrder = require('./routes/b2bOrder');
var showProductReviews = require('./routes/showProductReviews');
var createProductReviews = require('./routes/createProductReviews');
var updateProductReviews = require('./routes/updateProductReviews');
var likeProductReviews = require('./routes/likeProductReviews');
var logger = require('./lib/logger');
var utils = require('./lib/utils');
var security = require('./lib/insecurity');
var models = require('./models');
var datacreator = require('./data/datacreator');
var app = express();
var server = require('http').Server(app);
var appConfiguration = require('./routes/appConfiguration');
var captcha = require('./routes/captcha');
var trackOrder = require('./routes/trackOrder');
var countryMapping = require('./routes/countryMapping');
var basketItems = require('./routes/basketItems');
var saveLoginIp = require('./routes/saveLoginIp');
var userProfile = require('./routes/userProfile');
var updateUserProfile = require('./routes/updateUserProfile');
var videoHandler = require('./routes/videoHandler');
var twoFactorAuth = require('./routes/2fa');
var languageList = require('./routes/languages');
var config = require('config');
var dataErasure = require('./routes/dataErasure');
var imageCaptcha = require('./routes/imageCaptcha');
var dataExport = require('./routes/dataExport');
var address = require('./routes/address');
var erasureRequest = require('./routes/erasureRequest');
var payment = require('./routes/payment');
var wallet = require('./routes/wallet');
var orderHistory = require('./routes/orderHistory');
var delivery = require('./routes/delivery');
var deluxe = require('./routes/deluxe');
var memory = require('./routes/memory');
var chatbot = require('./routes/chatbot');
var locales = require('./data/static/locales.json');
var i18n = require('i18n');
var appName = config.get('application.customMetricsPrefix');
var startupGauge = new client.Gauge({
    name: appName + "_startup_duration_seconds",
    help: "Duration " + appName + " required to perform a certain task during startup",
    labelNames: ['task']
});
// Wraps the function and measures its (async) execution time
var collectDurationPromise = function (name, func) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(void 0, void 0, void 0, function () {
            var end, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        end = startupGauge.startTimer({ task: name });
                        return [4 /*yield*/, func.apply(void 0, args)];
                    case 1:
                        res = _a.sent();
                        end();
                        return [2 /*return*/, res];
                }
            });
        });
    };
};
collectDurationPromise('validatePreconditions', require('./lib/startup/validatePreconditions'))();
collectDurationPromise('cleanupFtpFolder', require('./lib/startup/cleanupFtpFolder'))();
collectDurationPromise('validateConfig', require('./lib/startup/validateConfig'))();
// Reloads the i18n files in case of server restarts or starts.
function restoreOverwrittenFilesWithOriginals() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, collectDurationPromise('restoreOverwrittenFilesWithOriginals', require('./lib/startup/restoreOverwrittenFilesWithOriginals'))()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// Function called first to ensure that all the i18n files are reloaded successfully before other linked operations.
restoreOverwrittenFilesWithOriginals().then(function () {
    /* Locals */
    app.locals.captchaId = 0;
    app.locals.captchaReqId = 1;
    app.locals.captchaBypassReqTimes = [];
    app.locals.abused_ssti_bug = false;
    app.locals.abused_ssrf_bug = false;
    /* Compression for all requests */
    app.use(compression());
    /* Bludgeon solution for possible CORS problems: Allow everything! */
    app.options('*', cors());
    app.use(cors());
    /* Security middleware */
    app.use(helmet.noSniff());
    app.use(helmet.frameguard());
    // app.use(helmet.xssFilter()); // = no protection from persisted XSS via RESTful API
    app.disable('x-powered-by');
    app.use(featurePolicy({
        features: {
            payment: ["'self'"]
        }
    }));
    /* Remove duplicate slashes from URL which allowed bypassing subsequent filters */
    app.use(function (req, res, next) {
        req.url = req.url.replace(/[/]+/g, '/');
        next();
    });
    /* Increase request counter metric for every request */
    app.use(metrics.observeRequestMetricsMiddleware());
    /* Security Policy */
    var securityTxtExpiration = new Date();
    securityTxtExpiration.setFullYear(securityTxtExpiration.getFullYear() + 1);
    app.get(['/.well-known/security.txt', '/security.txt'], verify.accessControlChallenges());
    app.use(['/.well-known/security.txt', '/security.txt'], securityTxt({
        contact: config.get('application.securityTxt.contact'),
        encryption: config.get('application.securityTxt.encryption'),
        acknowledgements: config.get('application.securityTxt.acknowledgements'),
        //'Preferred-Languages': [...new Set(locales.map(locale => locale.key.substr(0, 2)))].join(', '),
        expires: securityTxtExpiration.toUTCString()
    }));
    /* robots.txt */
    app.use(robots({ UserAgent: '*', Disallow: '/ftp' }));
    /* Checks for challenges solved by retrieving a file implicitly or explicitly */
    app.use('/assets/public/images/padding', verify.accessControlChallenges());
    app.use('/assets/public/images/products', verify.accessControlChallenges());
    app.use('/assets/public/images/uploads', verify.accessControlChallenges());
    app.use('/assets/i18n', verify.accessControlChallenges());
    app.use('/dataerasure', dataErasure);
    /* Checks for challenges solved by abusing SSTi and SSRF bugs */
    app.use('/solve/challenges/server-side', verify.serverSideChallenges());
    /* Create middleware to change paths from the serve-index plugin from absolute to relative */
    var serveIndexMiddleware = function (req, res, next) {
        var origEnd = res.end;
        res.end = function () {
            if (arguments.length) {
                var reqPath_1 = req.originalUrl.replace(/\?.*$/, '');
                var currentFolder_1 = reqPath_1.split('/').pop();
                arguments[0] = arguments[0].replace(/a href="([^"]+?)"/gi, function (matchString, matchedUrl) {
                    var relativePath = path.relative(reqPath_1, matchedUrl);
                    if (relativePath === '') {
                        relativePath = currentFolder_1;
                    }
                    else if (!relativePath.startsWith('.') && currentFolder_1 !== '') {
                        relativePath = currentFolder_1 + '/' + relativePath;
                    }
                    else {
                        relativePath = relativePath.replace('..', '.');
                    }
                    return 'a href="' + relativePath + '"';
                });
            }
            origEnd.apply(this, arguments);
        };
        next();
    };
    // vuln-code-snippet start directoryListingChallenge accessLogDisclosureChallenge
    /* /ftp directory browsing and file download */
    app.use('/ftp', serveIndexMiddleware, serveIndex('ftp', { icons: true })); // vuln-code-snippet vuln-line directoryListingChallenge
    app.use('/ftp(?!/quarantine)/:file', fileServer());
    app.use('/ftp/quarantine/:file', quarantineServer());
    /* /encryptionkeys directory browsing */
    app.use('/encryptionkeys', serveIndexMiddleware, serveIndex('encryptionkeys', { icons: true, view: 'details' }));
    app.use('/encryptionkeys/:file', keyServer());
    /* /logs directory browsing */
    app.use('/support/logs', serveIndexMiddleware, serveIndex('logs', { icons: true, view: 'details' })); // vuln-code-snippet vuln-line accessLogDisclosureChallenge
    app.use('/support/logs', verify.accessControlChallenges()); // vuln-code-snippet hide-line
    app.use('/support/logs/:file', logFileServer()); // vuln-code-snippet vuln-line accessLogDisclosureChallenge
    /* Swagger documentation for B2B v2 endpoints */
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.use(express.static(path.resolve('frontend/dist/frontend')));
    app.use(cookieParser('kekse'));
    // vuln-code-snippet end directoryListingChallenge accessLogDisclosureChallenge
    /* Configure and enable backend-side i18n */
    i18n.configure({
        locales: locales.map(function (locale) { return locale.key; }),
        directory: path.resolve('i18n'),
        cookie: 'language',
        defaultLocale: 'en',
        autoReload: true
    });
    app.use(i18n.init);
    app.use(bodyParser.urlencoded({ extended: true }));
    /* File Upload */
    app.post('/file-upload', uploadToMemory.single('file'), ensureFileIsPassed, metrics.observeFileUploadMetricsMiddleware(), handleZipFileUpload, checkUploadSize, checkFileType, handleXmlUpload);
    app.post('/profile/image/file', uploadToMemory.single('file'), ensureFileIsPassed, metrics.observeFileUploadMetricsMiddleware(), profileImageFileUpload());
    app.post('/profile/image/url', uploadToMemory.single('file'), profileImageUrlUpload());
    app.post('/rest/memories', uploadToDisk.single('image'), ensureFileIsPassed, security.appendUserId(), metrics.observeFileUploadMetricsMiddleware(), memory.addMemory());
    app.use(bodyParser.text({ type: '*/*' }));
    app.use(function jsonParser(req, res, next) {
        req.rawBody = req.body;
        if (req.headers['content-type'] !== undefined && req.headers['content-type'].indexOf('application/json') > -1) {
            if (req.body && req.body !== Object(req.body)) { // Expensive workaround for 500 errors during Frisby test run (see #640)
                req.body = JSON.parse(req.body);
            }
        }
        next();
    });
    /* HTTP request logging */
    var accessLogStream = require('file-stream-rotator').getStream({
        filename: path.resolve('logs/access.log'),
        frequency: 'daily',
        verbose: false,
        max_logs: '2d'
    });
    app.use(morgan('combined', { stream: accessLogStream }));
    // vuln-code-snippet start resetPasswordMortyChallenge
    /* Rate limiting */
    app.enable('trust proxy');
    app.use('/rest/user/reset-password', new RateLimit({
        windowMs: 5 * 60 * 1000,
        max: 100,
        keyGenerator: function (_a) {
            var headers = _a.headers, ip = _a.ip;
            return headers['X-Forwarded-For'] || ip;
        },
        delayMs: 0
    }));
    // vuln-code-snippet end resetPasswordMortyChallenge
    // vuln-code-snippet start changeProductChallenge
    /** Authorization **/
    /* Checks on JWT in Authorization header */
    app.use(verify.jwtChallenges());
    /* Baskets: Unauthorized users are not allowed to access baskets */
    app.use('/rest/basket', security.isAuthorized(), security.appendUserId());
    /* BasketItems: API only accessible for authenticated users */
    app.use('/api/BasketItems', security.isAuthorized());
    app.use('/api/BasketItems/:id', security.isAuthorized());
    /* Feedbacks: GET allowed for feedback carousel, POST allowed in order to provide feedback without being logged in */
    app.use('/api/Feedbacks/:id', security.isAuthorized());
    /* Users: Only POST is allowed in order to register a new user */
    app.get('/api/Users', security.isAuthorized());
    app.route('/api/Users/:id')
        .get(security.isAuthorized())
        .put(security.denyAll())["delete"](security.denyAll());
    /* Products: Only GET is allowed in order to view products */
    app.post('/api/Products', security.isAuthorized());
    // app.put('/api/Products/:id', security.isAuthorized()) // vuln-code-snippet vuln-line changeProductChallenge
    app["delete"]('/api/Products/:id', security.denyAll());
    /* Challenges: GET list of challenges allowed. Everything else forbidden entirely */
    app.post('/api/Challenges', security.denyAll());
    app.use('/api/Challenges/:id', security.denyAll());
    /* Complaints: POST and GET allowed when logged in only */
    app.get('/api/Complaints', security.isAuthorized());
    app.post('/api/Complaints', security.isAuthorized());
    app.use('/api/Complaints/:id', security.denyAll());
    /* Recycles: POST and GET allowed when logged in only */
    app.get('/api/Recycles', recycles.blockRecycleItems());
    app.post('/api/Recycles', security.isAuthorized());
    /* Challenge evaluation before finale takes over */
    app.get('/api/Recycles/:id', recycles.getRecycleItem());
    app.put('/api/Recycles/:id', security.denyAll());
    app["delete"]('/api/Recycles/:id', security.denyAll());
    /* SecurityQuestions: Only GET list of questions allowed. */
    app.post('/api/SecurityQuestions', security.denyAll());
    app.use('/api/SecurityQuestions/:id', security.denyAll());
    /* SecurityAnswers: Only POST of answer allowed. */
    app.get('/api/SecurityAnswers', security.denyAll());
    app.use('/api/SecurityAnswers/:id', security.denyAll());
    /* REST API */
    app.use('/rest/user/authentication-details', security.isAuthorized());
    app.use('/rest/basket/:id', security.isAuthorized());
    app.use('/rest/basket/:id/order', security.isAuthorized());
    /* Challenge evaluation before finale takes over */ // vuln-code-snippet hide-start
    app.post('/api/Feedbacks', verify.forgedFeedbackChallenge());
    /* Captcha verification before finale takes over */
    app.post('/api/Feedbacks', captcha.verifyCaptcha());
    /* Captcha Bypass challenge verification */
    app.post('/api/Feedbacks', verify.captchaBypassChallenge());
    /* User registration challenge verifications before finale takes over */
    app.post('/api/Users', verify.registerAdminChallenge());
    app.post('/api/Users', verify.passwordRepeatChallenge()); // vuln-code-snippet hide-end
    /* Unauthorized users are not allowed to access B2B API */
    app.use('/b2b/v2', security.isAuthorized());
    /* Check if the quantity is available in stock and limit per user not exceeded, then add item to basket */
    app.put('/api/BasketItems/:id', security.appendUserId(), basketItems.quantityCheckBeforeBasketItemUpdate());
    app.post('/api/BasketItems', security.appendUserId(), basketItems.quantityCheckBeforeBasketItemAddition(), basketItems.addBasketItem());
    /* Accounting users are allowed to check and update quantities */
    app["delete"]('/api/Quantitys/:id', security.denyAll());
    app.post('/api/Quantitys', security.denyAll());
    app.use('/api/Quantitys/:id', security.isAccounting());
    /* Feedbacks: Do not allow changes of existing feedback */
    app.put('/api/Feedbacks/:id', security.denyAll());
    /* PrivacyRequests: Only allowed for authenticated users */
    app.use('/api/PrivacyRequests', security.isAuthorized());
    app.use('/api/PrivacyRequests/:id', security.isAuthorized());
    /* PaymentMethodRequests: Only allowed for authenticated users */
    app.post('/api/Cards', security.appendUserId());
    app.get('/api/Cards', security.appendUserId(), payment.getPaymentMethods());
    app.put('/api/Cards/:id', security.denyAll());
    app["delete"]('/api/Cards/:id', security.appendUserId(), payment.delPaymentMethodById());
    app.get('/api/Cards/:id', security.appendUserId(), payment.getPaymentMethodById());
    /* PrivacyRequests: Only POST allowed for authenticated users */
    app.post('/api/PrivacyRequests', security.isAuthorized());
    app.get('/api/PrivacyRequests', security.denyAll());
    app.use('/api/PrivacyRequests/:id', security.denyAll());
    app.post('/api/Addresss', security.appendUserId());
    app.get('/api/Addresss', security.appendUserId(), address.getAddress());
    app.put('/api/Addresss/:id', security.appendUserId());
    app["delete"]('/api/Addresss/:id', security.appendUserId(), address.delAddressById());
    app.get('/api/Addresss/:id', security.appendUserId(), address.getAddressById());
    app.get('/api/Deliverys', delivery.getDeliveryMethods());
    app.get('/api/Deliverys/:id', delivery.getDeliveryMethod());
    // vuln-code-snippet end changeProductChallenge
    /* Verify the 2FA Token */
    app.post('/rest/2fa/verify', new RateLimit({ windowMs: 5 * 60 * 1000, max: 100 }), twoFactorAuth.verify());
    /* Check 2FA Status for the current User */
    app.get('/rest/2fa/status', security.isAuthorized(), twoFactorAuth.status());
    /* Enable 2FA for the current User */
    app.post('/rest/2fa/setup', new RateLimit({ windowMs: 5 * 60 * 1000, max: 100 }), security.isAuthorized(), twoFactorAuth.setup());
    /* Disable 2FA Status for the current User */
    app.post('/rest/2fa/disable', new RateLimit({ windowMs: 5 * 60 * 1000, max: 100 }), security.isAuthorized(), twoFactorAuth.disable());
    /* Verifying DB related challenges can be postponed until the next request for challenges is coming via finale */
    app.use(verify.databaseRelatedChallenges());
    // vuln-code-snippet start registerAdminChallenge
    /* Generated API endpoints */
    finale.initialize({ app: app, sequelize: models.sequelize });
    var autoModels = [
        { name: 'User', exclude: ['password', 'totpSecret'] },
        { name: 'Product', exclude: [] },
        { name: 'Feedback', exclude: [] },
        { name: 'BasketItem', exclude: [] },
        { name: 'Challenge', exclude: [] },
        { name: 'Complaint', exclude: [] },
        { name: 'Recycle', exclude: [] },
        { name: 'SecurityQuestion', exclude: [] },
        { name: 'SecurityAnswer', exclude: [] },
        { name: 'Address', exclude: [] },
        { name: 'PrivacyRequest', exclude: [] },
        { name: 'Card', exclude: [] },
        { name: 'Quantity', exclude: [] }
    ];
    for (var _i = 0, autoModels_1 = autoModels; _i < autoModels_1.length; _i++) {
        var _a = autoModels_1[_i], name_1 = _a.name, exclude = _a.exclude;
        var resource = finale.resource({
            model: models[name_1],
            endpoints: ["/api/" + name_1 + "s", "/api/" + name_1 + "s/:id"],
            excludeAttributes: exclude
        });
        // create a wallet when a new user is registered using API
        if (name_1 === 'User') {
            resource.create.send.before(function (req, res, context) {
                models.Wallet.create({ UserId: context.instance.id })["catch"](function (err) {
                    console.log(err);
                });
                return context["continue"];
            });
        }
        // vuln-code-snippet end registerAdminChallenge
        // translate challenge descriptions and hints on-the-fly
        if (name_1 === 'Challenge') {
            resource.list.fetch.after(function (req, res, context) {
                for (var i = 0; i < context.instance.length; i++) {
                    var description = context.instance[i].description;
                    if (utils.contains(description, '<em>(This challenge is <strong>')) {
                        var warning = description.substring(description.indexOf(' <em>(This challenge is <strong>'));
                        description = description.substring(0, description.indexOf(' <em>(This challenge is <strong>'));
                        context.instance[i].description = req.__(description) + req.__(warning);
                    }
                    else {
                        context.instance[i].description = req.__(description);
                    }
                    if (context.instance[i].hint) {
                        context.instance[i].hint = req.__(context.instance[i].hint);
                    }
                }
                return context["continue"];
            });
            resource.read.send.before(function (req, res, context) {
                context.instance.description = req.__(context.instance.description);
                if (context.instance.hint) {
                    context.instance.hint = req.__(context.instance.hint);
                }
                return context["continue"];
            });
        }
        // translate security questions on-the-fly
        if (name_1 === 'SecurityQuestion') {
            resource.list.fetch.after(function (req, res, context) {
                for (var i = 0; i < context.instance.length; i++) {
                    context.instance[i].question = req.__(context.instance[i].question);
                }
                return context["continue"];
            });
            resource.read.send.before(function (req, res, context) {
                context.instance.question = req.__(context.instance.question);
                return context["continue"];
            });
        }
        // translate product names and descriptions on-the-fly
        if (name_1 === 'Product') {
            resource.list.fetch.after(function (req, res, context) {
                for (var i = 0; i < context.instance.length; i++) {
                    context.instance[i].name = req.__(context.instance[i].name);
                    context.instance[i].description = req.__(context.instance[i].description);
                }
                return context["continue"];
            });
            resource.read.send.before(function (req, res, context) {
                context.instance.name = req.__(context.instance.name);
                context.instance.description = req.__(context.instance.description);
                return context["continue"];
            });
        }
        // fix the api difference between finale (fka epilogue) and previously used sequlize-restful
        resource.all.send.before(function (req, res, context) {
            context.instance = {
                status: 'success',
                data: context.instance
            };
            return context["continue"];
        });
    }
    /* Custom Restful API */
    app.post('/rest/user/login', login());
    app.get('/rest/user/change-password', changePassword());
    app.post('/rest/user/reset-password', resetPassword());
    app.get('/rest/user/security-question', securityQuestion());
    app.get('/rest/user/whoami', security.updateAuthenticatedUsers(), currentUser());
    app.get('/rest/user/authentication-details', authenticatedUsers());
    app.get('/rest/products/search', search());
    app.get('/rest/basket/:id', basket());
    app.post('/rest/basket/:id/checkout', order());
    app.put('/rest/basket/:id/coupon/:coupon', coupon());
    app.get('/rest/admin/application-version', appVersion());
    app.get('/rest/admin/application-configuration', appConfiguration());
    app.get('/rest/repeat-notification', repeatNotification());
    app.get('/rest/continue-code', continueCode());
    app.put('/rest/continue-code/apply/:continueCode', restoreProgress());
    app.get('/rest/admin/application-version', appVersion());
    app.get('/rest/captcha', captcha());
    app.get('/rest/image-captcha', imageCaptcha());
    app.get('/rest/track-order/:id', trackOrder());
    app.get('/rest/country-mapping', countryMapping());
    app.get('/rest/saveLoginIp', saveLoginIp());
    app.post('/rest/user/data-export', security.appendUserId(), imageCaptcha.verifyCaptcha());
    app.post('/rest/user/data-export', security.appendUserId(), dataExport());
    app.get('/rest/languages', languageList());
    app.post('/rest/user/erasure-request', erasureRequest());
    app.get('/rest/order-history', orderHistory.orderHistory());
    app.get('/rest/order-history/orders', security.isAccounting(), orderHistory.allOrders());
    app.put('/rest/order-history/:id/delivery-status', security.isAccounting(), orderHistory.toggleDeliveryStatus());
    app.get('/rest/wallet/balance', security.appendUserId(), wallet.getWalletBalance());
    app.put('/rest/wallet/balance', security.appendUserId(), wallet.addWalletBalance());
    app.get('/rest/deluxe-membership', deluxe.deluxeMembershipStatus());
    app.post('/rest/deluxe-membership', security.appendUserId(), deluxe.upgradeToDeluxe());
    app.get('/rest/memories', memory.getMemories());
    app.get('/rest/chatbot/status', chatbot.status());
    app.post('/rest/chatbot/respond', chatbot.process());
    /* NoSQL API endpoints */
    app.get('/rest/products/:id/reviews', showProductReviews());
    app.put('/rest/products/:id/reviews', createProductReviews());
    app.patch('/rest/products/reviews', security.isAuthorized(), updateProductReviews());
    app.post('/rest/products/reviews', security.isAuthorized(), likeProductReviews());
    /* B2B Order API */
    app.post('/b2b/v2/orders', b2bOrder());
    /* File Serving */
    app.get('/the/devs/are/so/funny/they/hid/an/easter/egg/within/the/easter/egg', easterEgg());
    app.get('/this/page/is/hidden/behind/an/incredibly/high/paywall/that/could/only/be/unlocked/by/sending/1btc/to/us', premiumReward());
    app.get('/we/may/also/instruct/you/to/refuse/all/reasonably/necessary/responsibility', privacyPolicyProof());
    /* Route for redirects */
    app.get('/redirect', redirect());
    /* Routes for promotion video page */
    app.get('/promotion', videoHandler.promotionVideo());
    app.get('/video', videoHandler.getVideo());
    /* Routes for profile page */
    app.get('/profile', security.updateAuthenticatedUsers(), userProfile());
    app.post('/profile', updateUserProfile());
    /* Route for vulnerable code snippets */
    app.get('/snippets', vulnCodeSnippet.challengesWithCodeSnippet());
    app.get('/snippets/:challenge', vulnCodeSnippet.serveCodeSnippet());
    app.use(angular());
    /* Error Handling */
    app.use(verify.errorHandlingChallenge());
    app.use(errorhandler());
})["catch"](function (err) {
    console.error(err);
});
var multer = require('multer');
var uploadToMemory = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200000 } });
var mimeTypeMap = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
};
var uploadToDisk = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            var isValid = mimeTypeMap[file.mimetype];
            var error = new Error('Invalid mime type');
            if (isValid) {
                error = null;
            }
            cb(error, path.resolve('frontend/dist/frontend/assets/public/images/uploads/'));
        },
        filename: function (req, file, cb) {
            var name = security.sanitizeFilename(file.originalname)
                .toLowerCase()
                .split(' ')
                .join('-');
            var ext = mimeTypeMap[file.mimetype];
            cb(null, name + '-' + Date.now() + '.' + ext);
        }
    })
});
// vuln-code-snippet start exposedMetricsChallenge
/* Serve metrics */
var Metrics = metrics.observeMetrics();
var metricsUpdateLoop = Metrics.updateLoop;
app.get('/metrics', metrics.serveMetrics()); // vuln-code-snippet vuln-line exposedMetricsChallenge
// vuln-code-snippet end exposedMetricsChallenge
errorhandler.title = config.get('application.name') + " (Express " + utils.version('express') + ")";
var registerWebsocketEvents = require('./lib/startup/registerWebsocketEvents');
var customizeApplication = require('./lib/startup/customizeApplication');
var customizeEasterEgg = require('./lib/startup/customizeEasterEgg');
function start(readyCallback) {
    return __awaiter(this, void 0, void 0, function () {
        var datacreatorEnd, port;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    datacreatorEnd = startupGauge.startTimer({ task: 'datacreator' });
                    return [4 /*yield*/, models.sequelize.sync({ force: true })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, datacreator()];
                case 2:
                    _a.sent();
                    datacreatorEnd();
                    port = process.env.PORT || config.get('server.port');
                    process.env.BASE_PATH = process.env.BASE_PATH || config.get('server.basePath');
                    server.listen(port, function () {
                        logger.info(colors.cyan("Server listening on port " + colors.bold(port)));
                        startupGauge.set({ task: 'ready' }, (Date.now() - startTime) / 1000);
                        if (process.env.BASE_PATH !== '') {
                            logger.info(colors.cyan("Server using proxy base path " + colors.bold(process.env.BASE_PATH) + " for redirects"));
                        }
                        registerWebsocketEvents(server);
                        if (readyCallback) {
                            readyCallback();
                        }
                    });
                    collectDurationPromise('customizeApplication', customizeApplication)();
                    collectDurationPromise('customizeEasterEgg', customizeEasterEgg)();
                    return [2 /*return*/];
            }
        });
    });
}
exports.start = start;
function close(exitCode) {
    if (server) {
        clearInterval(metricsUpdateLoop);
        server.close();
    }
    if (exitCode !== undefined) {
        process.exit(exitCode);
    }
}
exports.close = close;
