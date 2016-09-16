/* jslint node: true */
'use strict'

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
      }
    })
  return Complaint
}
