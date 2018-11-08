module.exports = (sequelize, { INTEGER, STRING }) => {
  const Captcha = sequelize.define('Captcha', {
    captchaId: INTEGER,
    captcha: STRING,
    answer: STRING
  })
  return Captcha
}
