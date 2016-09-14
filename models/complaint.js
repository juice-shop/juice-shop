/* jslint node: true */
'use strict'

var utils = require('../lib/utils')
var challenges = require('../data/datacache').challenges

module.exports = function (sequelize, DataTypes) {
  var Complaint = sequelize.define('Complaint', {
    message: DataTypes.STRING,
    file: DataTypes.STRING
  },
    {
      classMethods: {
        associate: function (models) {
          Complaint.belongsTo(models.User)
        }
      },

      hooks: {
        beforeCreate: function (complaint, fn) {
          uploadAnonymousChallengeHook(complaint)
          fn(null, complaint)
        }

      }})
  return Complaint
}

function uploadAnonymousChallengeHook (complaint) {
  if (utils.notSolved(challenges.uploadAnonymous) && !complaint.UserId && complaint.file === 'clickme.html') {
    utils.solve(challenges.uploadAnonymous)
  }
}
