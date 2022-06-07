// const Cart = require('../models/cart');
const Product = require('../models/product');
const Order = require('../models/order')

exports.getProducts = (req, res, next) => {
	Product.find()
		.then((products) => {
			res.render('shop/product-list', {
				prods: products,
				pageTitle: 'All Products',
				path: '/products',
			});
		})
		.catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
	Product.find()
		.then((products) => {
			res.render('shop/index', {
				prods: products,
				pageTitle: 'All Products',
				path: '/',
			});
		})
		.catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
	req.user
		.getCart()
		.then((products) => {
			console.log(products);
			res.render('shop/cart', {
				path: '/cart',
				pageTitle: 'Your Cart',
				products: products,
			});
		})
		.catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
	const prodId = req.body.productId;
	Product.findById(prodId)
		.then((product) => {
			return req.user.addToCart(product);
		})
		.then((result) => {
			res.redirect('/cart');
		})
		.catch((err) => console.log(err));
};

exports.postDeleteCartItem = (req, res, next) => {
	const prodId = req.body.productId;
	req.user
		.deleteCartItem(prodId)
		.then((result) => {
			res.redirect('/cart');
		})
		.catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
	req.user
		.populate('cart.items.productId')
		.then((user) => {
			const products = user.cart.items.map((i) => {
				return { quantity: i.toJSON().quantity, product: i.toJSON().productId };
			});
			const order = new Order({
				user: {
					name: req.user.name,
					userId: req.user,
				},
				products: products,
			});
			return order.save()
		})
		.then((result) => {
			req.user.clearCart()
			res.redirect('/orders');
		})
		.catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
	Order.find({'user.userId': req.user._id})
		.then((orders) => {
			console.log(orders)
			res.render('shop/orders', {
				path: '/orders',
				pageTitle: 'Your Orders',
				orders: orders,
			});
		})
		.catch((err) => console.log(err));
};

// exports.getCheckout = (req, res, next) => {
//   res.render('shop/checkout', {
//     path: '/checkout',
//     pageTitle: 'Checkout'
//   });
// };

exports.getProduct = (req, res, next) => {
	let prodId = req.params.productId;
	Product.findById(prodId)
		.then((prod) => {
			res.render('shop/product-detail', {
				product: prod,
				path: 'products',
				pageTitle: prod.title,
			});
		})
		.catch((err) => console.log(err));
};
