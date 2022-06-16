const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const cors = require('cors');
const multer = require('multer');

const app = express();
const MONGO_URI =
	'mongodb+srv://thinh-mongo:fsmPkMNqp60QYcWc@cluster0.ndo7um8.mongodb.net/shop?retryWrites=true&w=majority';

const store = new MongoDBStore({
	uri: MONGO_URI,
	collection: 'sessions',
});

app.set('view engine', 'pug');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');
const User = require('./models/user');
const csrfProtection = csrf();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
	multer({
		dest: 'temp/',
		fileFilter: function (req, file, callback) {
			var ext = path.extname(file.originalname);
			if (
				ext !== '.png' &&
				ext !== '.jpg' &&
				ext !== '.gif' &&
				ext !== '.jpeg'
			) {
				return callback(new Error('Only images are allowed'));
			}
			callback(null, true);
		},
		limits: { fieldSize: 8 * 1024 * 1024 },
	}).single('image')
);
app.use(express.static(path.join(__dirname, 'public')));
app.use(
	session({
		secret: 'My key',
		resave: false,
		saveUninitialized: false,
		store: store,
		cookie: { maxAge: 1000 * 60 * 30 },
	})
);
app.use(csrfProtection);
app.use(flash());
app.use(cors());

app.use((req, res, next) => {
	if (!req.session.user) {
		return next();
	}
	User.findById(req.session.user._id)
		.then((user) => {
			req.user = user;
			next();
		})
		.catch((err) => console.log(err));
});

app.use((req, res, next) => {
	res.locals.isAuthenticated = req.session.isLoggedIn;
	res.locals.csrfToken = req.csrfToken();
	next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
	.connect(MONGO_URI)
	.then(() => {
		app.listen(3001);
	})
	.catch((err) => console.log(err));
