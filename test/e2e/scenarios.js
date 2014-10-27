'use strict';

describe('scenarios', function () {

    browser.get('/');

    it('should automatically redirect to /search when location hash/fragment is empty', function () {
        expect(browser.getLocationAbsUrl()).toMatch("/search");
    });

});
