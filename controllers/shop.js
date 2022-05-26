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
  req.user
    .getCart()
    .then(cart => {
      cart.getProducts()
        .then(products => {
          res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products
          })
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchCart;
  let newQty = 1
  req.user
    .getCart()
    .then(cart => {
      fetchCart = cart
      return cart.getProducts({where: {id: prodId}})
    })
    .then(products => {
      let product
      if (products.length > 0) {
        product = products[0]
      } 
      if (product) {
         let oldQty = product.cartItem.quantity
         newQty = oldQty + 1
         return product
      }
      return Product.findByPk(prodId)
    })
    .then(product => {
      return fetchCart.addProduct(product, {
        through: { quantity: newQty }
      })
    })
    .then(() => {
      res.redirect('/cart')
    })
    .catch(err => console.log(err))
}

exports.postDeleteCartItem = (req, res, next) => {
  const prodId = req.body.productId
  req.user
    .getCart()
    .then(cart => {
      return cart.getProducts({where: {id: prodId}})
    })
    .then(products => {
      let product = products[0]
      return product.cartItem.destroy()
    })
    .then(() => {
      res.redirect('/cart')
    })
    .catch(err => console.log(err))
}

exports.postOrder = (req, res, next) => {
  let fetchCart
  req.user
    .getCart()
    .then(cart => {
      fetchCart = cart
      return cart.getProducts()
    })
    .then(products => {
      return req.user
        .createOrder()
        .then(order => {
          return order.addProducts(
            products.map(product => {
              product.orderItem = {quantity: product.cartItem.quantity}
              return product
            })
          )
        })
        .catch(err => console.log(err))
    })
    .then(result => {
      return fetchCart.setProducts(null)
    })
    .then(result => {
      res.redirect('/orders')
    })
    .catch(err => console.log(err))
}

exports.getOrders = (req, res, next) => {
  req.user.getOrders({include: ['products']})
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => console.log(err))
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
