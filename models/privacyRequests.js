/* jslint node: true */
module.exports = (sequelize, { INTEGER, BOOLEAN, DATE }) => {
  const PrivacyRequests = sequelize.define('PrivacyRequests', {
    UserId: { type: INTEGER },
    deletionRequested: { type: BOOLEAN, defaultValue: false }
  })

  PrivacyRequests.associate = ({ User }) => {
    PrivacyRequests.belongsTo(User, { constraints: true, foreignKeyConstraint: true })
  }

  return PrivacyRequests
}
