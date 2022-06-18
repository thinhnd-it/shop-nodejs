const Product = require('../models/product');
const { validationResult } = require('express-validator');
const aws = require('aws-sdk');
const fs = require('fs');
require('dotenv').config();

aws.config.setPromisesDependency();

aws.config.update({
	accessKeyId: process.env.S3_ACCESS_KEY,
	secretAccessKey: process.env.S3_ACCESS_SECRET_ACCESS,
	region: 'us-east-1',
});
const s3 = new aws.S3();

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
	const price = req.body.price;
	const description = req.body.description;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render('admin/add-product', {
			pageTitle: 'Add Product',
			path: '/admin/add-product',
			errorMessage: errors.array().map((i) => i.msg + i.param),
			oldData: {
				title: title,
				imageUrl: imageUrl,
				price: price,
				description: description,
			},
		});
	}

	const params = {
		ACL: 'public-read',
		Bucket: 'thinh-test-public',
		Body: fs.createReadStream(req.file.path),
		Key: `productImage/${req.file.originalname}`,
	};

	s3.upload(params, (err, data) => {
		if (err) {
			console.log(
				'Error occured while trying to upload to S3 bucket',
				err
			);
		}

		if (data) {
			fs.unlinkSync(req.file.path); // Empty temp folder
			const locationUrl = data.Location;
			const product = new Product({
				title: title,
				price: price,
				description: description,
				imageUrl: locationUrl,
				userId: req.user,
			});
			product
				.save()
				.then((result) => res.redirect('/admin/products'))
				.catch((err) => {
					console.log('Error occured while trying to save to DB');
				});
		}
	});
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
	let price = req.body.price;
	let description = req.body.description;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Edit Product',
			path: '/admin/edit-product',
			errorMessage: errors.array().map((i) => i.msg + i.param),
			oldData: {
				title: title,
				price: price,
				description: description,
			},
		});
	}

	if (!req.file) {
		Product.findById(id)
			.then((product) => {
				if (product.userId.toString() !== req.user._id.toString()) {
					return res.redirect('/');
				}
				product.title = title;
				product.price = price;
				product.description = description;
				return product.save();
			})
			.then((result) => {
				console.log('UPDATED PRODUCT');
				res.redirect('/admin/products');
			})
			.catch((err) => console.log(err));
	} else {
		const params = {
			ACL: 'public-read',
			Bucket: 'thinh-test-public',
			Body: fs.createReadStream(req.file.path),
			Key: `productImage/${req.file.originalname}`,
		};
		s3.upload(params, (err, data) => {
			if (err) {
				console.log(
					'Error occured while trying to upload to S3 bucket',
					err
				);
			}

			if (data) {
				fs.unlinkSync(req.file.path); // Empty temp folder
				const locationUrl = data.Location;
				Product.findById(id)
					.then((product) => {
						if (
							product.userId.toString() !==
							req.user._id.toString()
						) {
							return res.redirect('/');
						}
						product.title = title;
						product.price = price;
						product.description = description;
						product.imageUrl = locationUrl
						return product.save();
					})
					.then((result) => {
						console.log('UPDATED PRODUCT');
						res.redirect('/admin/products');
					})
					.catch((err) => console.log(err));
			}
		});
	}
};

exports.deleteProduct = (req, res, next) => {
	const prodId = req.params.id;
	console.log(prodId)
	Product.deleteOne({ _id: prodId, userId: req.user._id })
		.then(() => {
			return res.status(200).json({
				message: 'Successfully'
			})
		})
		.catch(err => {
			return res.status(500).json({
				message: err
			})
		});
};
