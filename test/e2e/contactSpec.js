'use strict';

describe('/#/contact', function () {

    var comment, rating, UserId, submitButton;

    beforeEach(function () {
        browser.get('/#/contact');
        comment = element(by.model('feedback.comment'));
        rating = element(by.model('feedback.rating'));
        UserId = element(by.model('feedback.UserId'));
        submitButton = element(by.id('submitButton'));
    });


    xit('should sanitize comments to remove potentially malicious html', function () {
    });


    describe('challenge "xss3"', function () {

        xit('should be possible to trick the sanitization with a masked XSS attack', function () {
        });

        //protractor.expect.challengeSolved({challenge: 'xss3'});

    });

    describe('challenge "forgedFeedback"', function () {

        xit('should be possible to provide feedback as another user', function () {
        });

        //protractor.expect.challengeSolved({challenge: 'forgedFeedback'});

    });

});
