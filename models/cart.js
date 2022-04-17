const { json } = require('express/lib/response');
const fs = require('fs')
const path = require('path')

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'cart.json'
);

module.exports = class Cart {
  static addProduct(id, productPrice) {
    // fetching the previous cart
    fs.readFile(p, (err, data) => {
      let cart = { products: [], totalPrice: 0}
      if (!err) {
        cart = JSON.parse(data)
      }
      // analyze the cart => find the exists product
      const existingProductIndex = cart.products.findIndex(product => product.id === id)
      const existingProduct = cart.products[existingProductIndex]
      let updateProduct;
      // add new product / increase quantity
      if (existingProduct) {
        updateProduct = {...existingProduct}
        updateProduct.qty += 1
        cart.products = [...cart.products]
        cart.products[existingProductIndex] = updateProduct
      } else {
        updateProduct = { id: id, qty: 1}
        cart.products = [...cart.products, updateProduct]
      }
      cart.totalPrice += +productPrice
      fs.writeFile(p, JSON.stringify(cart), err => {
        console.log(err)
      })
    })
  }

  static deleteProduct(id, price) {
    fs.readFile(p, (err, data) => {
      if (err) {
        return
      }
      const updateCart = {...JSON.parse(data)}
      const product = updateCart.products.find(p => p.id === id)
      if (!product) {
        return
      }
      const productQty = product.qty
      updateCart.products = updateCart.products.filter(prod => prod.id !== id)
      updateCart.totalPrice = updateCart.totalPrice - productQty * price
      fs.writeFile(p, JSON.stringify(updateCart), err => {
        console.log(err)
      })
    })
  }

  static getCart(callback) {
    fs.readFile(p, (err, data) => {
      const cart = JSON.parse(data)
      if (err) {
        callback(null)
      } else {
        callback(cart)
      }
    })
  }
}