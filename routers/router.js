const express = require('express')
const router = express.Router()
const {normal} = require('../controllers/normalController')
const {createAccount,loginAccount, accountData} = require('../controllers/authController')


//nornal data
router.get('/',normal)


//account
router.post('/create-account',createAccount)
router.post('/login-account',loginAccount)
router.get('/account-data',accountData)

module.exports = router