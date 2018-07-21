const models = require('../models/index')
const insecurity = require('../lib/insecurity')

module.exports = function updateUserProfile () {
  return (req, res, next) => {
		const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)
		if (loggedInUser) {
			models.User.findById(loggedInUser.data.id).then(user => {
				user.updateAttributes({ username: req.body.username,email: req.body.email}).then(user => {
					console.log('profile updated succesfully.')
					console.log(user.dataValues)
				}).catch(error => {
					next(error)
				})
			}).catch(error => {
				next(error)
			})
		} else {
			next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
		}
  		res.location('/profile');
		res.redirect('/profile');
	}
}

