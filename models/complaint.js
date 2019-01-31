/* jslint node: true */
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

module.exports = (sequelize, { STRING }) => {
  const Complaint = sequelize.define('Complaint', {
    message: {
      type: STRING,
      set (comment) {
        comment = comment.toLowerCase()
        if (utils.notSolved(challenges.dlpPastebinDataLeakChallenge) && utils.contains(comment, 'hueteroneel') && utils.contains(comment, 'eurogium edule')) {
          utils.solve(challenges.dlpPastebinDataLeakChallenge)
        }
      }
    },
    file: STRING
  })

  Complaint.associate = ({ User }) => {
    Complaint.belongsTo(User, { constraints: true, foreignKeyConstraint: true })
  }

  return Complaint
}
