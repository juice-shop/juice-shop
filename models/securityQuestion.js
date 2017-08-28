/* jslint node: true */
'use strict'

module.exports = function (sequelize, DataTypes) {
  const SecurityQuestion = sequelize.define('SecurityQuestion', {
    question: DataTypes.STRING
  }
    )
  return SecurityQuestion
}
