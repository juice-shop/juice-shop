/* jslint node: true */
module.exports = (sequelize, { STRING }) => {
  const SecurityQuestion = sequelize.define('SecurityQuestion', {
    question: STRING
  }
  )
  return SecurityQuestion
}
