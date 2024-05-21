const mongoose = require('mongoose')


//Schema post form
const postSchema = new mongoose.Schema({
    accountID:{
        type:String,
        required:true,
    },
    postID:{
        type:String,
        required:true,
        unique:true
    },
    firstname:{
        type:String,
        required:true,
    },
    lastname:{
        type:String,
        required:true,
    },
    accountImage:{
        type:String,
        required:true
    },
    content:{
        type:String, 
        default:''
    },
    image:{
        type:String,
        default:null
    },
    video:{
        type:String,
        default:null
    },
    currentDate:{
        type:String,
        required:true,
    },
    currentTime:{
        type:String,
        required:true
    },
    comments:{
        type:Array,
        required:true
    },
    likes:{
        type:Array,
        required:true,
    }

    
},{timestamps:true})

module.exports = mongoose.model("Posts",postSchema)