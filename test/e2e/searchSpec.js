'use strict';

describe('search', function () {

    beforeEach(function () {
        browser.get('/#/search'); // not really necessary as search field is part of navbar on every dialog
    });

    it('should show matching products for name when performing search with criteria', function () {
        element(by.model('searchQuery')).sendKeys('Apple');

        element(by.id('searchButton')).click();

        var productNames = element.all(by.repeater('product in products').column('name'));
        expect(productNames.count()).toBe(1);
        expect(productNames.first().getText()).toMatch('Apple');
    });

    it('should show matching products for description when performing search with criteria', function () {
        element(by.model('searchQuery')).sendKeys('hand-picked');

        element(by.id('searchButton')).click();

        var productDescriptions = element.all(by.repeater('product in products').column('description'));
        expect(productDescriptions.count()).toBe(1);
        expect(productDescriptions.first().getText()).toMatch('hand-picked');
    });

});
