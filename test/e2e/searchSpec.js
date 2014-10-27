'use strict';

describe('search', function () {

    beforeEach(function () {
        browser.get('/#/search'); // not really necessary as search field is part of navbar on every dialog
    });

    it('should show all products performing search without criteria', function () {
        element(by.id('searchButton')).click();

        expect(browser.getLocationAbsUrl()).toMatch(/\/search\?q=$/);
    });

    it('should show matching products for name when performing search with criteria', function () {
        element(by.model('searchQuery')).sendKeys('Apple');

        element(by.id('searchButton')).click();

        expect(browser.getLocationAbsUrl()).toMatch(/\/search\?q=Apple/);
        var productNames = element.all(by.repeater('product in products').column('name'));
        expect(productNames.first().getText()).toMatch(/Apple/);
    });

    it('should show matching products for description when performing search with criteria', function () {
        element(by.model('searchQuery')).sendKeys('hand-picked');

        element(by.id('searchButton')).click();

        expect(browser.getLocationAbsUrl()).toMatch(/\/search\?q=hand-picked/);
        var productDescriptions = element.all(by.repeater('product in products').column('description'));
        expect(productDescriptions.first().getText()).toMatch(/hand-picked/);
    });

});
