protractor.expect = {
    challengeSolved: function (context) {
        describe("(shared)", function () {
            var challenge;

            beforeEach(function () {
                challenge = context.challenge;
                browser.get('/#/score-board');
            });

            it("challenge '" + challenge + "' should be solved on score board", function () {
                expect(element(by.id(challenge + '.solved')).getAttribute('class')).not.toMatch('ng-hide');
                expect(element(by.id(challenge + '.notSolved')).getAttribute('class')).toMatch('ng-hide');
            });

        });
    }
}