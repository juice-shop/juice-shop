/* jslint node: true */
module.exports = (sequelize, { STRING, INTEGER, BOOLEAN }) => {
  const Challenge = sequelize.define('Challenge', {
    key: STRING,
    name: STRING,
    category: STRING,
    description: STRING,
    difficulty: INTEGER,
    hint: STRING,
    hintUrl: STRING,
    solved: BOOLEAN,
    disabledEnv: STRING
  })
  return Challenge
}
