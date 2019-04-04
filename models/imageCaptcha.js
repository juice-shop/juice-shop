module.exports = (sequelize, { INTEGER, STRING }) => {
  const ImageCaptcha = sequelize.define('ImageCaptcha', {
    captchaId: INTEGER,
    captcha: STRING,
    answer: STRING
  })
  return ImageCaptcha
}
