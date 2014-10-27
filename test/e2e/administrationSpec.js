'use strict';

describe('/#/administration', function () {

    describe('challenge "adminSection"', function () {

        it('should be possible to access administration section', function () {
            browser.get('/#/administration');
            expect(browser.getLocationAbsUrl()).toMatch(/\/administration/);
        });

        protractor.expect.challengeSolved({challenge: 'adminSection'});

    });

});
