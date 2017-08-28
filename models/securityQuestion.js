/* jslint node: true */
module.exports = (sequelize, DataTypes) => {
  const SecurityQuestion = sequelize.define('SecurityQuestion', {
    question: DataTypes.STRING
  }
    )
  return SecurityQuestion
}
