'use strict';

describe('/redirect', function () {

    describe('challenge "redirect"', function () {

        it('should redirect to https://github.com/bkimminich/juice-shop when supplying any other target URL', function () {
            browser.driver.get(browser.baseUrl + '/redirect?to=http://kimminich.de').then(function() {
                expect(browser.driver.getCurrentUrl()).toBe('https://github.com/bkimminich/juice-shop');
            });
        });

    });

    describe('challenge "redirect"', function () {

        it('should redirect to target URL if https://github.com/bkimminich/juice-shop is contained in it as parameter', function () {
            browser.driver.get(browser.baseUrl + '/redirect?to=http://kimminich.de?trickIndexOf=https://github.com/bkimminich/juice-shop').then(function() {
                expect(browser.driver.getCurrentUrl()).toMatch(/http:\/\/kimminich\.de/);
            });
        });

        protractor.expect.challengeSolved({challenge: 'redirect'});

    });

});
