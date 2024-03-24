const express = require('express')
const router = express.Router()
const {createPost, displayPost,likeSystemIncrease, likeSystemDecrease, singlePost, createComment, likeSystemIncreaseComment, likeSystemDecreaseComment, createReply, displePostForProfile} = require('../controllers/ิpostController')
const {createAccount,loginAccount, accountData, logoutAccount, singleAccountData, getAllAccounts} = require('../controllers/authController')
const { makingRequest, requestCheck, removeRequest, acceptRequest, fetchFriendRequest, fetchFriendlist } = require('../controllers/friendController')
const { createChatroom, sendMessage, getMessage, readMessage, getAllMessages,  getAllMessageAndAccounts } = require('../controllers/chatController')
const { createTalkingRoom, getTalkingRooms, getSingleTalkingRoom, getAllMembers, requestToTheRoom, getRoomRequest, deleteRoomRequest, allRoomRequested, acceptRoomRequested, rejectRoomRequested} = require('../controllers/roomController')


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
router.delete('/remove-request',removeRequest)
router.put('/accept-request',acceptRequest)
router.get('/all-friendRequest/:accountID',fetchFriendRequest)
router.get('/all-friends-get/:accountID',fetchFriendlist)


//Chatrooms
router.post('/create-chatmessege-room',createChatroom)
router.put('/send-message',sendMessage)
router.post('/get-message',getMessage)
router.post('/read-message',readMessage)
router.get('/all-messages/:senderID',getAllMessages)
router.post('/all-messages-accounts',getAllMessageAndAccounts)

//Talkingrooms
router.post('/create-talkingroom',createTalkingRoom)
router.post('/all-talkingrooms',getTalkingRooms)
router.post('/get-single-talkingroom',getSingleTalkingRoom)
router.post('/get-all-members',getAllMembers)
router.put('/room-request',requestToTheRoom)
router.get('/get-room-request/:accountID',getRoomRequest)
router.delete('/delete-room-request',deleteRoomRequest)
router.get('/all-room-requested/:adminID',allRoomRequested)
router.put('/accept-room-requested',acceptRoomRequested)
router.delete('/reject-room-requested',rejectRoomRequested)
module.exports = router