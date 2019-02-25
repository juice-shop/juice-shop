/* jslint node: true */

module.exports = (sequelize, { STRING }) => {
  const Complaint = sequelize.define('Complaint', {
    message: STRING,
    file: STRING
  })

  Complaint.associate = ({ User }) => {
    Complaint.belongsTo(User, { constraints: true, foreignKeyConstraint: true })
  }

  return Complaint
}
