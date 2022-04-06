const Product = require('../models/product')

exports.getAddProduct = (req, res, next) => {
	res.render('admin/add-product', {
		pageTitle: 'Add Product',
        path: '/admin/add-product'
	})
}

exports.postAddProduct = (req, res, next) => {
    title = req.body.title
    imageURL = req.body.imageURL
    price = req.body.price
    desc = req.body.description

	const product = new Product(title, imageURL, price, desc);
	product.save()
	res.redirect('/')
}

exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin product',
            path: '/admin/products'
        })
    })
}