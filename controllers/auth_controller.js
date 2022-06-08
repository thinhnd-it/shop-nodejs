const bcrypt = require('bcryptjs');
const User = require('../models/user');
const nodemailer = require('nodemailer');

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
		isAuthenticated: req.isLoggedIn,
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
		isAuthenticated: req.isLoggedIn,
	});
};

exports.postSignUp = (req, res, next) => {
	let email = req.body.email;
	let password = req.body.password;
	User.findOne({ email: email })
		.then((user) => {
			if (user) {
				return res.redirect('/sign-up');
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
