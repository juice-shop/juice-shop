/*jslint node: true */
'use strict';

var insecurity = require('../lib/insecurity'),
    utils = require('../lib/utils'),
    challenges = require('../lib/datacache').challenges;

module.exports = function (sequelize, DataTypes) {
    var Feedback = sequelize.define('Feedback', {
            comment: DataTypes.STRING,
            rating: DataTypes.INTEGER
        },
        {
            classMethods: {
                associate: function (models) {
                    Feedback.belongsTo(models.User);
                }},

            hooks: {
                beforeCreate: function (feedback, fn) {
                    htmlSanitizationHook(feedback);
                    fn(null, feedback);
                },
                beforeUpdate: function (feedback, fn) {
                    htmlSanitizationHook(feedback);
                    fn(null, feedback);
                }
            }});
    return Feedback;
};

function htmlSanitizationHook(feedback) {
    feedback.comment = insecurity.sanitizeHtml(feedback.comment);
    if (utils.notSolved(challenges.persistedXssChallengeFeedback) && utils.contains(feedback.comment, '<script>alert("XSS3")</script>')) {
        utils.solve(challenges.persistedXssChallengeFeedback);
    }
}