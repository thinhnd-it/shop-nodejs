const bcrypt = require('bcryptjs');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const crypto = require('crypto')

const transport = nodemailer.createTransport({
	host: 'smtp.mailtrap.io',
	port: 2525,
	auth: {
		user: '0497b07d464ce4',
		pass: 'bcc26eca7915d9',
	},
});

exports.getLogin = (req, res, next) => {
	let err = req.flash('error');
	let message = null;
	if (err.length > 0) {
		message = err[0];
	}
	res.render('auth/login', {
		pageTitle: 'Login',
		path: '/login',
		errorMessage: message,
	});
};

exports.postLogin = (req, res, next) => {
	let email = req.body.email;
	let password = req.body.password;

	User.findOne({ email: email })
		.then((user) => {
			if (!user) {
				req.flash('error', 'Invalid email or password!');
				return res.redirect('/login');
			}
			return bcrypt.compare(password, user.password).then((matched) => {
				if (matched) {
					req.session.isLoggedIn = true;
					req.session.user = user;
					return req.session.save((err) => {
						console.log(err);
						return res.redirect('/');
					});
				}
				req.flash('error', 'Invalid email or password!');
				return res.redirect('/login');
			});
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.getSignUp = (req, res, next) => {
	console.log(req.session);
	res.render('auth/sign-up', {
		pageTitle: 'Sign Up',
		path: '/sign-up',
	});
};

exports.postSignUp = (req, res, next) => {
	let email = req.body.email;
	let password = req.body.password;
	User.findOne({ email: email })
		.then((user) => {
			if (user) {
				req.flash('error', 'User have existed')
				return res.redirect('/login');
			}
			return bcrypt
				.hash(password, 12)
				.then((hashedPassword) => {
					const newUser = new User({
						email: email,
						password: hashedPassword,
						cart: {
							items: [],
						},
					});
					return newUser.save();
				})
				.then(() => {
					const mailOptions = {
						from: '"Example Team" <from@example.com>',
						to: email,
						subject: 'Nice Nodemailer test',
						text: 'Hey there, it’s our first message sent with Nodemailer ;) ',
						html: '<b>Hey there! </b><br> This is our first message sent with Nodemailer',
					};
					res.redirect('/login');
					return transport.sendMail(mailOptions);
				});
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.postLogout = (req, res, next) => {
	req.session.destroy((err) => {
		console.log(err);
		res.redirect('/');
	});
};

exports.getReset = (req, res, next) => {
	let err = req.flash('error');
	let message = null;
	if (err.length > 0) {
		message = err[0];
	}
	res.render('auth/reset', {
		pageTitle: 'Reset Password',
		path: '/reset-password',
		errorMessage: message,
	});
};

exports.postReset = (req, res, next) => {
	crypto.randomBytes(32, (err, buffer) => {
		if (err) {
			console.log(err)
			return res.redirect('/reset-password')
		}
		const token = buffer.toString('hex')
		User.findOne({ email: req.body.email }).then(user => {
			if (!user) {
				req.flash('error', 'No account with this email be found')
				return res.redirect('/reset-password')
			}
			user.resetToken = token
			user.resetTokenExpiration = Date.now() + 3600000
			user.save()
		}).then(result => {
			res.redirect('/')
			const mailOptions = {
				from: 'shop-node@gmail.com',
				to: req.body.email,
				subject: 'Reset Passsword',
				html: `
					<p>Click <a href="http://localhost:3000/reset/${token}">link</a> to reset password!</p>
				`,
			};
			return transport.sendMail(mailOptions);
		})
			.catch(err => console.log(err))
	})
}

exports.getNewPassword = (req, res, next) => {
	let token = req.params.token;
	console.log(token)
	User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } }).then(user => {
		let err = req.flash('error');
		let message = null;
		if (err.length > 0) {
			message = err[0];
		}
		res.render('auth/new-password', {
			pageTitle: 'New Password',
			path: '/new-password',
			errorMessage: message,
			userId: user._id.toString(),
			passwordToken: token
		});

	}).catch(err => console.log(err))
}

exports.postNewPassword = (req, res, next) => {
	let userId = req.body.userId
	let passwordToken = req.body.passwordToken
	let password = req.body.newPassword
	User.findOne({ _id: userId, resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() } })
		.then(user => {
			if (!user) {
				req.flash('error', 'Error')
				return res.redirect('/')
			}
			return bcrypt.hash(password, 12).then(hashedPassword => {
				user.password = hashedPassword
				user.save()
			}).then(result => {
				return res.redirect('/login')
			})
		})
		.catch(err => console.log(err))
}