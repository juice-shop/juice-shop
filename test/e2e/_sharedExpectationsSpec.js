protractor.expect = {
    challengeSolved: function (context) {
        describe("challenge", function () {
            var challenge;

            beforeEach(function () {
                challenge = context.challenge;
                browser.get('/#/score-board');
            });

            it("should be solved on score board", function () {
                expect(element(by.id(challenge + '.solved')).getAttribute('class')).not.toMatch('ng-hide');
                expect(element(by.id(challenge + '.notSolved')).getAttribute('class')).toMatch('ng-hide');
            });

        });
    }
}