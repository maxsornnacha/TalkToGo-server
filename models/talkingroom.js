const mongoose = require('mongoose')

// Define the schema for chatting rooms
const chatroomSchema = new mongoose.Schema({
    roomName: {
        type: String,
        required: true
    },
    messages: [{
        senderID: { type: String, required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// Define the schema for talking rooms
const talkingroomSchema = new mongoose.Schema({
    roomName: {
        type: String,
        required: true
    },
    participants: [{
        type: String,
        required: true,
    }]
}, { timestamps: true });

//Schema mainTalkingroomSchema form 
const mainTalkingroomSchema = new mongoose.Schema({
    slug:{
        type:String,
        require:true,
    },
    admins:[{
        type:String,
        require:true,
    }],
    roomName:{ 
        type:String,
        require:true
    },
    roomDescription:{
        type:String,
        require:true
    },
    roomIcon:{
        type:String,
        require:true
    },
    participants:[{
        type:String,
        require:true,
    }],
    requests:[{
        type:String,
        require:true,
    }],
    chatrooms: [chatroomSchema], // Array of chatting rooms
    talkingrooms: [talkingroomSchema] // Array of talking rooms
    
},{timestamps:true})

module.exports = mongoose.model("Talkingrooms",mainTalkingroomSchema)