module.exports = (sequelize, { INTEGER, STRING }) => {
  const ImageCaptcha = sequelize.define('ImageCaptcha', {
    image: STRING,
    answer: STRING,
    UserId: { type: INTEGER }
  })

  ImageCaptcha.associate = ({ User }) => {
    ImageCaptcha.belongsTo(User)
  }

  return ImageCaptcha
}
