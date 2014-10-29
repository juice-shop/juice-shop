'use strict';

describe('/#/register', function () {

    var email, password, passwordRepeat, registerButton;

    beforeEach(function () {
        browser.get('/#/register');
        email = element(by.model('user.email'));
        password = element(by.model('user.password'));
        passwordRepeat = element(by.model('user.passwordRepeat'));
        registerButton = element(by.id('registerButton'));
    });


    xit('should perform client side validation of email address', function () {
    });


    describe('challenge "xss2"', function () {

        xit('should be possible to bypass validation by directly using Rest API', function () {
        });

        //protractor.expect.challengeSolved({challenge: 'xss2'});

    });

});
