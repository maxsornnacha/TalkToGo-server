const Chatrooms = require('../models/chatroom')


exports.createChatroom = async (req,res)=>{
    const {senderID,getterID} = req.body
    await Chatrooms.create({
        participants:[senderID,getterID],
        messages:[]
    })
    .then(()=>{
        res.json('สร้างห้องแชทสำเร็จ')
    })
    .catch(()=>{
        res.status(500).json('สร้างห้องแชทล้มเหลว เนื่องจากปัญหาทาง Server')
    })
}

exports.readMessage = async (req,res)=>{
    const {senderID,getterID} = req.body
    await Chatrooms.findOneAndUpdate(
    {
        participants:{$all:[senderID,getterID]},
        'messages.isRead':false
    },
    {
        $set: { 'messages.$[unreadMessage].isRead': true } 
    },
    {
        arrayFilters: [{ 'unreadMessage.isRead': false , 'unreadMessage.senderID': { $ne: senderID } }],
        new:true
    }
    ).exec()
    .then((data)=>{
        console.log(data)
        if(data){
        res.json({messages:data.messages,senderID:senderID})
        }
        else{
        res.json(null)
        }
    })
    .catch((error)=>{
        console.log(error)
        res.status(500).json('เกิดข้อผิดพลาดทาง server')
    })
}

exports.sendMessage = async (req,res)=>{
    const {senderID,getterID,message} = req.body

    await Chatrooms.findOneAndUpdate({participants:{$all:[senderID,getterID]}},{
        $push: {
            messages: { senderID:senderID, content:message }
             }
    },{
        new: true, // Return the modified document
        upsert: true // If the conversation doesn't exist, create it 
    })
    .exec()
    .then((data)=>{
        res.json(data.messages)
    })
    .catch((error)=>{
        res.status(500).json(error)
    })

}


exports.getMessage = async (req,res)=>{
    const {senderID,getterID} = req.body

    await Chatrooms.findOne({participants:{$all:[senderID,getterID]}}).exec()
    .then((data)=>{
        res.json(data)
    })
    .catch((error)=>{
        res.status(500).json(error)
    })
}