/* jslint node: true */
'use strict'

module.exports = function (sequelize, DataTypes) {
  var SecurityQuestion = sequelize.define('SecurityQuestion', {
    question: DataTypes.STRING
  }
    )
  return SecurityQuestion
}
