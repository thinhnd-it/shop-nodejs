const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'pug');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');
const User = require('./models/user');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
	User.findById('6294e9604389d48655d2d8f2')
		.then((user) => {
			req.user = user
			next();
		})
		.catch((err) => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
	.connect(
		'mongodb+srv://thinh-mongo:fsmPkMNqp60QYcWc@cluster0.ndo7um8.mongodb.net/shop?retryWrites=true&w=majority'
	)
	.then(() => {
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'Thinh',
          email: 'thinhnd194@gmail.com',
          cart: {
            items: []
          }
        })
        user.save()
      }
    })
    app.listen(3000)
  })
	.catch((err) => console.log(err));
