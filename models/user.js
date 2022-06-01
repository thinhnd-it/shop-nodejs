const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const Product = require('./product');

const userSchema = Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	cart: {
		items: [
			{
				productId: {
					type: Schema.Types.ObjectId,
					ref: 'Product',
					required: true,
				},
				quantity: {
					type: Number,
					required: true,
				},
			},
		],
	},
});

userSchema.methods.addToCart = function (product) {
	const cartProductIndex = this.cart.items.findIndex((cp) => {
		return cp.productId.toString() === product._id.toString();
	});

	let newQty = 1;
	const updateCartItems = this.cart ? [...this.cart.items] : [];

	if (cartProductIndex >= 0) {
		newQty = this.cart.items[cartProductIndex].quantity + 1;
		updateCartItems[cartProductIndex].quantity = newQty;
	} else {
		updateCartItems.push({
			productId: product._id,
			quantity: newQty,
		});
	}

	const updateCart = {
		items: updateCartItems,
	};

	this.cart = updateCart;
	return this.save();
};

userSchema.methods.getCart = function () {
	const productIds = this.cart.items.map((i) => {
		return i.productId;
	});

	return Product.find({ _id: { $in: productIds } })
		.then((products) => {
			return products.map((p) => {
				return {
					...p.toJSON(),
					quantity: this.cart.items.find((i) => {
						return i.productId.toString() === p._id.toString();
					}).quantity,
				};
			});
		})
		.catch((err) => console.log(err));
};

userSchema.methods.deleteCartItem = function (prodId) {
	const deleteCartItemIndex = this.cart.items.findIndex((i) => {
		return i.productId.toString() === prodId.toString();
	});

	let updateCartItems = [...this.cart.items];

	if (deleteCartItemIndex >= 0) {
		updateCartItems.splice(deleteCartItemIndex, 1);
	}

	const updateCart = {
		items: updateCartItems,
	};

	this.cart = updateCart
  return this.save()
};

userSchema.methods.clearCart = function() {
	this.cart = {item: []}
	return this.save()
}

module.exports = mongoose.model('User', userSchema);

// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// class User {
// 	constructor(name, email, cart, id) {
// 		this.name = name;
// 		this.email = email;
// 		this.cart = cart;
// 		this._id = id;
// 	}

// 	save() {
// 		const db = getDb();
// 		return db.collection('users').insertOne(this);
// 	}

// 	addToCart(product) {
// 		const cartProductIndex = this.cart.items.findIndex((cp) => {
// 			return cp.productId.toString() === product._id.toString();
// 		});

// 		console.log(cartProductIndex);

// 		let newQty = 1;
// 		const updateCartItems = this.cart ? [...this.cart.items] : [];

// 		if (cartProductIndex >= 0) {
// 			newQty = this.cart.items[cartProductIndex].quantity + 1;
// 			updateCartItems[cartProductIndex].quantity = newQty;
// 		} else {
// 			updateCartItems.push({
// 				productId: new mongodb.ObjectId(product._id),
// 				quantity: newQty,
// 			});
// 		}

// 		const updateCart = {
// 			items: updateCartItems,
// 		};

// 		const db = getDb();
// 		return db
// 			.collection('users')
// 			.updateOne(
// 				{ _id: new mongodb.ObjectId(this._id) },
// 				{ $set: { cart: updateCart } }
// 			);
// 	}

// 	getCart() {
// 		const db = getDb();
// 		const productIds = this.cart.items.map((i) => {
// 			return i.productId;
// 		});

// 		return db
// 			.collection('products')
// 			.find({ _id: { $in: productIds } })
// 			.toArray()
// 			.then((products) => {
// 				return products.map((p) => {
// 					return {
// 						...p,
// 						quantity: this.cart.items.find((i) => {
// 							return i.productId.toString() === p._id.toString();
// 						}).quantity,
// 					};
// 				});
// 			})
// 			.catch((err) => console.log(err));
// 	}

// 	deleteCartItem(prodId) {
// 		const db = getDb();
// 		const deleteCartItemIndex = this.cart.items.findIndex((i) => {
// 			return i.productId.toString() === prodId.toString();
// 		});

// 		let updateCartItems = [...this.cart.items];

// 		if (deleteCartItemIndex >= 0) {
// 			updateCartItems.splice(deleteCartItemIndex, 1);
// 		}

// 		const updateCart = {
// 			items: updateCartItems,
// 		};

// 		return db
// 			.collection('users')
// 			.updateOne(
// 				{ _id: new mongodb.ObjectId(this._id) },
// 				{ $set: { cart: updateCart } }
// 			);
// 	}

// 	addOrder() {
// 		const db = getDb();
// 		return this.getCart()
// 			.then((products) => {
// 				const order = {
// 					items: products,
// 					user: {
// 						_id: new mongodb.ObjectId(this._id),
// 						name: this.name,
// 					},
// 				};
// 				return db.collection('orders').insertOne(order);
// 			})
// 			.then((result) => {
// 				return db
// 					.collection('users')
// 					.updateOne(
// 						{ _id: new mongodb.ObjectId(this._id) },
// 						{ $set: { cart: { items: [] } } }
// 					);
// 			})
// 			.catch((err) => console.log(err));
// 	}

// 	getOrders() {
// 		const db = getDb();
// 		return db
// 			.collection('orders')
// 			.find({ 'user._id': new mongodb.ObjectId(this._id) })
// 			.toArray();
// 	}

// 	static findById(userId) {
// 		const db = getDb();
// 		return db
// 			.collection('users')
// 			.find({ _id: new mongodb.ObjectId(userId) })
// 			.next()
// 			.then((user) => {
// 				console.log(user);
// 				return user;
// 			})
// 			.catch((err) => console.log(err));
// 	}
// }

// module.exports = User;
