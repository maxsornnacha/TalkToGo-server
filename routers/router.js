const express = require('express')
const router = express.Router()
const {normal} = require('../controllers/normalController')
const {createAccount} = require('../controllers/accountController')

//nornal data
router.get('/',normal)


//account
router.post('/create-account',createAccount)


module.exports = router