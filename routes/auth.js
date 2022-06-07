const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth_controller')

router.get('/login', authController.getLogin)

router.post('/login', authController.postLogin)

router.get('/sign-up', authController.getSignUp)

router.post('/sign-up', authController.postSignUp)

router.post('/logout', authController.postLogout)

module.exports = router