'use strict';

describe('/#/contact', function () {

    var comment, rating, UserId, submitButton, expectedComment;

    protractor.beforeEach.login({email: 'admin@juice-sh.op', password: 'admin123'});

    beforeEach(function () {
        browser.get('/#/contact');
        comment = element(by.model('feedback.comment'));
        rating = element(by.model('feedback.rating'));
        UserId = element(by.model('feedback.UserId'));
        submitButton = element(by.id('submitButton'));
    });

    it('should sanitize script from comments to remove potentially malicious html', function () {
        comment.sendKeys('Sani<script>alert("ScriptXSS")</script>tizedScript');
        rating.click();

        submitButton.click();

        expectPersistedCommentToMatch(/SanitizedScript/);
    });

    it('should sanitize image from comments to remove potentially malicious html', function () {
        comment.sendKeys('Sani<img src="alert("ImageXSS")"/>tizedImage');
        rating.click();

        submitButton.click();

        expectPersistedCommentToMatch(/SanitizedImage/);
    });

    it('should sanitize iframe from comments to remove potentially malicious html', function () {
        comment.sendKeys('Sani<iframe src="alert("IFrameXSS")"></iframe>tizedIFrame');
        rating.click();

        submitButton.click();

        expectPersistedCommentToMatch(/SanitizedIFrame/);
    });

    describe('challenge "xss3"', function () {

        it('should be possible to trick the sanitization with a masked XSS attack', function () {
            comment.sendKeys('<<script>Foo</script>script>alert("XSS3")<</script>/script>');
            rating.click();

            submitButton.click();

            browser.ignoreSynchronization = true;
            browser.get('/#/administration');

            browser.wait(function () {
                return browser.switchTo().alert().then(
                    function (alert) {
                        expect(alert.getText()).toEqual('XSS3');
                        return alert.accept().then(function() {
                            element.all(by.repeater('feedback in feedbacks')).last().element(by.css('.glyphicon-trash')).click();
                            browser.ignoreSynchronization = false;
                            return true;
                        });
                    },
                    function () { return false; /* still waiting for alert ... */ }
                );
            });

        });

        protractor.expect.challengeSolved({challenge: 'xss3'});

    });

    describe('challenge "forgedFeedback"', function () {

        xit('should be possible to provide feedback as another user', function () {
        });

        //protractor.expect.challengeSolved({challenge: 'forgedFeedback'});

    });

});

function expectPersistedCommentToMatch(expectation) {
    browser.get('/#/administration');
    var feedbackComments = element.all(by.repeater('feedback in feedbacks').column('comment'));
    expect(feedbackComments.last().getText()).toMatch(expectation);
}