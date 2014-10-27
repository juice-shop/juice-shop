'use strict';

describe('scenarios', function () {

    it('should automatically redirect to /search when location hash/fragment is empty', function () {
        browser.get('/');
        expect(browser.getLocationAbsUrl()).toMatch("/search");
    });

    it('should automatically redirect to /search when location hash/fragment is not defined', function () {
        browser.get('/#/undefined');
        expect(browser.getLocationAbsUrl()).toMatch("/search");
    });

});
