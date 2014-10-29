'use strict';

describe('/#/administration', function () {

    describe('challenge "adminSection"', function () {

        it('should be possible to access administration section even when not authenticated', function () {
            browser.get('/#/administration');
            expect(browser.getLocationAbsUrl()).toMatch(/\/administration/);
        });

        protractor.expect.challengeSolved({challenge: 'adminSection'});

    });

    describe('challenge "fiveStarFeedback"', function () {

        xit('should be possible to delete feedback for any logged-in user', function () {
        });

        //protractor.expect.challengeSolved({challenge: 'fiveStarFeedback'});

    });

});
