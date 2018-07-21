const models = require('../models/index')
const insecurity = require('../lib/insecurity')
const fs = require('fs')

module.exports = function updateUserProfileImage () {
  return (req, res, next) => {
		const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)
		if (loggedInUser) {
			const file = req.file
			const buffer = file.buffer
      		const filename = file.originalname.toLowerCase()
      		fs.open('frontend/dist/frontend/assets/public/images/uploads/' + loggedInUser.data.id + '.jpg', 'w', function (err, fd) {
		        if (err) {
		        	console.log('error opening file: ' + err)
		        }
		        fs.write(fd, buffer, 0, buffer.length, null, function (err) {
			        if (err) console.log('error opening file: ' + err)
			        fs.close(fd, function () {
			        })
		        })
		    })
			models.User.findById(loggedInUser.data.id).then(user => {
				user.updateAttributes({ profileImage: loggedInUser.data.id + '.jpg'}).then(user => {
					console.log('profile Image updated succesfully.')
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

