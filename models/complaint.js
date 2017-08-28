/* jslint node: true */
module.exports = (sequelize, DataTypes) => {
  const Complaint = sequelize.define('Complaint', {
    message: DataTypes.STRING,
    file: DataTypes.STRING
  },
    {
      classMethods: {
        associate: function (models) {
          Complaint.belongsTo(models.User, { constraints: true, foreignKeyConstraint: true })
        }
      }
    })
  return Complaint
}
