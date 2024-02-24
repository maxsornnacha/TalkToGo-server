const express = require('express')
const router = express.Router()
const {createPost, displayPost,likeSystemIncrease, likeSystemDecrease, singlePost, createComment, likeSystemIncreaseComment, likeSystemDecreaseComment, createReply, displePostForProfile} = require('../controllers/ิpostController')
const {createAccount,loginAccount, accountData, logoutAccount, singleAccountData, getAllAccounts} = require('../controllers/authController')
const { makingRequest, requestCheck } = require('../controllers/friendController')


//post
router.post('/create-post',createPost) 
router.get('/display-post',displayPost)
router.put('/like-increasing',likeSystemIncrease)
router.delete('/like-decreasing',likeSystemDecrease)

router.get('/single-post/:id',singlePost)
router.get('/display-post-profile/:id',displePostForProfile)
router.post('/create-comment',createComment)
router.post('/create-reply',createReply)

//account
router.post('/create-account',createAccount)
router.post('/login-account',loginAccount)
router.get('/account-data',accountData)
router.post('/logout-account',logoutAccount)
router.get('/signle-account-data/:id',singleAccountData)
router.get('/get-all-accounts',getAllAccounts)

//friends
router.post('/making-request',makingRequest)
router.post('/checking-request',requestCheck)

module.exports = router