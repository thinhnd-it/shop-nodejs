const fs = require('fs');
const path = require('path');

const p = path.join(
	path.dirname(process.mainModule.filename),
	'data',
	'products.json'
);

const getProductFromFile = (callback) => {
	fs.readFile(p, (err, data) => {
		if (err) {
			callback([]);
		}
		callback(JSON.parse(data));
	});
};

module.exports = class Product {
	constructor(title, imageUrl, price, description) {
		this.title = title
		this.imageUrl = imageUrl
		this.price = price
		this.description = description
	}

	save() {
        getProductFromFile((products) => {
            products.push(this);
			fs.writeFile(p, JSON.stringify(products), (err) => {
				console.log(err);
			});
        })
	}

	static fetchAll(callback) {
		getProductFromFile(callback);
	}
};
