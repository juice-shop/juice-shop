/* jslint node: true */
module.exports = (sequelize, {STRING, INTEGER, BOOLEAN}) => {
  const Challenge = sequelize.define('Challenge', {
    name: STRING,
    category: STRING,
    description: STRING,
    difficulty: INTEGER,
    hint: STRING,
    hintUrl: STRING,
    solved: BOOLEAN
  })
  return Challenge
}
