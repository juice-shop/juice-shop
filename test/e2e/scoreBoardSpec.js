'use strict';

describe('/#/score-board', function () {

    describe('challenge "scoreBoard"', function () {

        it('should be possible to access score board', function () {
            browser.get('/#/score-board');
            expect(browser.getLocationAbsUrl()).toMatch(/\/score-board/);
        });

        protractor.expect.challengeSolved({challenge: 'scoreBoard'});

    });

});
