const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/add-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true
  });
}

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  req.user.createProduct({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description
  })
    .then(result => res.redirect('/admin/products'))
    .catch(err => console.log(err))
};

exports.getProducts = (req, res, next) => {
  req.user.getProducts()
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => console.log(err))
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit
  if (!editMode) {
    res.redirect('/')
  }

  req.user.getProducts({where: {id: req.params.productId}})
    .then((products) => {
      if (!products) {
        return res.redirect('/')
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: products[0] 
      })
    })
    .catch(err => console.log(err))
};

exports.postEditProduct = (req, res, next) => {
  let id = req.body.productId
  let title = req.body.title
  let imageUrl = req.body.imageUrl
  let price = req.body.price
  let description = req.body.description

  req.user.getProducts({where: {id: id}})
    .then(prods => {
      if (!prods) return
      const prod = prods[0]
      prod.title = title,
      prod.imageUrl = imageUrl,
      prod.price = price,
      prod.description = description
      return prod.save()
    })
    .then(result => {
      console.log('UPDATED PRODUCT')
      res.redirect('/admin/products')
    })
    .catch(err => console.log(err))
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId
  // Product.destroy({
  //   where: {
  //     id: prodId
  //   }
  // })
  // .then(result => res.redirect('/admin/products'))
  // .catch(err => console.log(err))
  req.user.getProducts({where: {id: prodId}})
    .then(prods => {
      return prods[0].destroy()
    })
    .then(result => res.redirect('/admin/products'))
    .catch(err => console.log(err))
}
