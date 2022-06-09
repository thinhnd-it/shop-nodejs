const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth_controller')
const { check, body} = require('express-validator')
const User = require('../models/user')

router.get('/login', authController.getLogin)

router.post(
  '/login',
  [
    check('email').isEmail().normalizeEmail(),
    check('password').isLength({min: 5}).isAlphanumeric().trim()
  ],
  authController.postLogin)

router.get('/sign-up', authController.getSignUp)

router.post(
  '/sign-up', 
  [
    check('email').isEmail().custom((value, {req}) => {
      return User.findOne({email: value}).then((user) => {
        if (user) {
          return Promise.reject('Email has been taken!')
        }
      })
    }).normalizeEmail(),
    body('password', 'At least 5 characters').isLength({min: 5}).isAlphanumeric().trim(),
    body('confirmPassword').custom((value, {req}) => {
      if (value !== req.body.password) {
        throw new Error('Password have to match')
      }
      return true
    }).trim()
  ],
  authController.postSignUp)

router.post('/logout', authController.postLogout)

router.get('/reset-password', authController.getReset)

router.post('/reset-password', authController.postReset)

router.get('/reset/:token', authController.getNewPassword)

router.post('/new-password', authController.postNewPassword)

module.exports = router