'use strict';

describe('routing', function () {

    it('should automatically route to /search when location hash/fragment is empty', function () {
        browser.get('/');
        expect(browser.getLocationAbsUrl()).toMatch(/\/search/);
    });

    it('should automatically route to /search when location hash/fragment is not defined', function () {
        browser.get('/#/undefined');
        expect(browser.getLocationAbsUrl()).toMatch(/\/search/);
    });

});
