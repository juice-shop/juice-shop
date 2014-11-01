'use strict';

describe('/#/change-password', function () {

    var currentPassword, newPassword, newPasswordRepeat, changeButton;

    protractor.beforeEach.login({email: 'bender@juice-sh.op', password: 'booze'});

    beforeEach(function () {
        browser.get('/#/change-password');
        currentPassword = element(by.model('currentPassword'));
        newPassword = element(by.model('newPassword'));
        newPasswordRepeat = element(by.model('newPasswordRepeat'));
        changeButton = element(by.id('changeButton'));
    });

    describe('challenge "csrf"', function () {

        it('should be able to change password without providing matching current password', function () {
            currentPassword.sendKeys('???');
            newPassword.sendKeys('slurmCl4ssic');
            newPasswordRepeat.sendKeys('slurmCl4ssic');
            changeButton.click();

            expect(element(by.css('.alert-info')).getAttribute('class')).not.toMatch('ng-hide');
        });

        protractor.expect.challengeSolved({challenge: 'csrf'});

    });

});