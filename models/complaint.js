/* jslint node: true */
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

module.exports = (sequelize, { STRING }) => {
  const Complaint = sequelize.define('Complaint', {
    message: {
      type: STRING,
      set (comment) {
        if (utils.notSolved(challenges.dlpPastebinDataLeakChallenge) && utils.contains(comment, `l#.3%f45$ds_4f*21`)) {
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
