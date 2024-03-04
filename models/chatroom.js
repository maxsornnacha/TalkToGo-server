const mongoose = require('mongoose')


//Schema Registration form of member
const chatroomSchema = new mongoose.Schema({
    participants:[{
        type:String,
        require:true,
    }],
    messages:[{
        senderID: { type:String, required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        isRead:{type: Boolean, default:false}
    }]

    
},{timestamps:true})

module.exports = mongoose.model("Chatrooms",chatroomSchema)