const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
	res.render('admin/add-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
		formsCSS: true,
		productCSS: true,
		activeAddProduct: true,
	});
};

exports.postAddProduct = (req, res, next) => {
	const title = req.body.title;
	const imageUrl = req.body.imageUrl;
	const price = req.body.price;
	const description = req.body.description;
	const product = new Product({
		title: title,
		price: price,
		description: description,
		imageUrl: imageUrl,
		userId: req.user
	});
	product
		.save()
		.then((result) => res.redirect('/admin/products'))
		.catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
	Product.find()
		.then((products) => {
			res.render('admin/products', {
				prods: products,
				pageTitle: 'Admin Products',
				path: '/admin/products',
			});
		})
		.catch((err) => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
	const editMode = req.query.edit;
	let prodId = req.params.productId;
	if (!editMode) {
		res.redirect('/');
	}
	Product.findById(prodId)
		.then((product) => {
			if (!product) {
				return res.redirect('/');
			}
			res.render('admin/edit-product', {
				pageTitle: 'Edit Product',
				path: '/admin/edit-product',
				editing: editMode,
				product: product,
			});
		})
		.catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
	let id = req.body.productId;
	let title = req.body.title;
	let imageUrl = req.body.imageUrl;
	let price = req.body.price;
	let description = req.body.description;
	Product.findById(id)
		.then((product) => {
			(product.title = title),
				(product.price = price),
				(product.description = description),
				(product.imageUrl = imageUrl);
			return product.save();
		})
		.then((result) => {
			console.log('UPDATED PRODUCT');
			res.redirect('/admin/products');
		})
		.catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId;
	Product.deleteOne({_id: prodId})
		.then((result) => res.redirect('/admin/products'))
		.catch((err) => console.log(err));
};
