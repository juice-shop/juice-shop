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

});