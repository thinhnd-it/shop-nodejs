const Cart = require('../models/cart');
const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => console.log(err))
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'All Products',
        path: '/'
      });
    })
    .catch(err => console.log(err))
};

exports.getCart = (req, res, next) => {
  
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, (product) => {
    Cart.addProduct(product.id, product.price)
  })
  res.redirect('/cart')
}

exports.postDeleteCartItem = (req, res, next) => {
  const prodId = req.body.productId
  Product.findById(prodId, product => {
    Cart.deleteProduct(prodId, product.price)
    res.redirect('/cart')
  })
}

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};

exports.getProduct = (req, res, next) => {
  let prodId = req.params.productId
  Product.findAll({
    where: {
      id: prodId
    }
  }).then(prod => {
      res.render('shop/product-detail', {
        product: prod[0],
        path: 'products',
        pageTitle: prod[0].title
      })
    })
    .catch(err => console.log(err))
  // Product.findByPk(prodId)
  //   .then((prod) => {
  //     res.render('shop/product-detail', {
  //       product: prod,
  //       path: 'products',
  //       pageTitle: prod.title
  //     })
  //   })
  //   .catch(err => console.log(err))
} 
