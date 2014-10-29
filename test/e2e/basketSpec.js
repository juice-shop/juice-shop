'use strict';

describe('/#/basket', function () {

    protractor.beforeEach.login({email: 'admin@juice-sh.op', password: 'admin123'});

    describe('challenge "accessBasket"', function () {

        it('should access basket with id from cookie instead of the one associated to logged-in user', function () {
            browser.executeScript('window.sessionStorage.bid = 2;');

            browser.get('/#/basket');

            // TODO Verify functionally that it's not the basket of the admin
        });

        protractor.expect.challengeSolved({challenge: 'accessBasket'});

    });

    describe('challenge "negativeOrder"', function () {

        xit('should be possible to put an item with negative price into the basket', function () {
        });

        xit('should be possible to put an item with negative quantity into the basket', function () {
        });

        xit('should be possible to place an order with a negative total amount', function () {
        });

        //protractor.expect.challengeSolved({challenge: 'negativeOrder'});

    });

});