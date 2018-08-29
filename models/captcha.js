module.exports = (sequelize, { INTEGER, STRING }) => {
  const Challenge = sequelize.define('Captcha', {
    captchaId: INTEGER,
    captcha: STRING,
    answer: STRING
  })
  return Challenge
}
