'use strict';

describe('/public/ftp', function () {

    describe('challenge "confidentialDocument"', function () {

        it('should be able to access file /public/ftp/acquisitions.md', function () {
            browser.driver.get(browser.baseUrl + '/public/ftp/acquisitions.md');
        });

        protractor.expect.challengeSolved({challenge: 'confidentialDocument'});

    });

    describe('challenge "errorHandling"', function () {

        it('should leak information through error message accessing /public/ftp/easter.egg due to wrong file suffix', function () {
            browser.driver.get(browser.baseUrl + '/public/ftp/easter.egg');

            browser.driver.isElementPresent(by.id('stacktrace')).then(function(present){
                expect(present).toBe(true);
            })

            protractor.expect.challengeSolved({challenge: 'errorHandling'});

        });

    });

    describe('challenge "easterEgg1"', function () {

        it('should be able to access file /public/ftp/easter.egg with poison null byte attack', function () {
            browser.driver.get(browser.baseUrl + '/public/ftp/eastere.gg%2500.md');
        });

        protractor.expect.challengeSolved({challenge: 'easterEgg1'});

    });

    describe('challenge "easterEgg2"', function () {

        it('should be able to access "secrect" url for easter egg', function () {
            browser.driver.get(browser.baseUrl + '/the/devs/are/so/funny/they/hid/an/easter/egg/within/the/easter/egg');
        });

        protractor.expect.challengeSolved({challenge: 'easterEgg2'});

    });

});
