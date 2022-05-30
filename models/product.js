const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;
class Product {
	constructor(title, price, description, imageUrl, id, userId) {
		this.title = title;
		this.price = price;
		this.description = description;
		this.imageUrl = imageUrl;
		this._id = id ? new mongodb.ObjectId(id) : null;
		this.userId = userId;
	}

	save() {
		const db = getDb();
		let dbO;
		if (this._id) {
			dbO = db
				.collection('products')
				.updateOne({ _id: this._id }, { $set: this });
		} else {
			dbO = db.collection('products').insertOne(this);
		}
		return dbO
			.then((result) => {
				console.log(result);
			})
			.catch((err) => console.log(err));
	}

	static fetchAll() {
		const db = getDb();
		return db
			.collection('products')
			.find()
			.toArray()
			.then((products) => {
				return products;
			})
			.catch((err) => console.log(err));
	}

	static findById(prodId) {
		const db = getDb();
		return db
			.collection('products')
			.find({ _id: new mongodb.ObjectId(prodId) })
			.next()
			.then((product) => {
				console.log(product);
				return product;
			})
			.catch((err) => console.log(err));
	}

	static delete(prodId) {
		const db = getDb();
		return db
			.collection('products')
			.deleteOne({ _id: new mongodb.ObjectId(prodId) })
			.then(result => {
				console.log('deleted')
			})
			.catch((err) => console.log(err));
	}
}

module.exports = Product;
