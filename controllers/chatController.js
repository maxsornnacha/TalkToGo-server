const Chatrooms = require('../models/chatroom')
const Members = require('../models/registration')


exports.createChatroom = async (req,res)=>{
    try{
    const {senderID,getterID} = req.body
    await Chatrooms.create({
        participants:[senderID,getterID],
        messages:[]
    })
    .then(()=>{
        res.json('สร้างห้องแชทสำเร็จ')
    })
    .catch((error)=>{
        console.log('การสร้างห้องแชทผิดพลาดเนื่องจาก :', error)
        res.status(400).json({error:'สร้างห้องแชทผิดพลาด เนื่องจากไม่ตรงตามเงื่อนไขที่กำหนด'})
    })
    }
    catch(error){
        console.log('การสร้างห้องแชทผิดพลาดเนื่องจาก :', error)
        res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
    }
}

exports.readMessage = async (req,res)=>{
    try{
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
        new:true,
        timestamps:false
    }
    ).exec()
    .then((data)=>{
        if(data){
        res.json({messages:data.messages,senderID:senderID})
        }
        else{
        res.json(null)
        }
    })
    .catch((error)=>{
        console.log('การอ่านข้อความผิดพลาดเนื่องจาก :', error)
        res.status(404).json({error:'ไม่พบข้อมูลที่ค้นหา'})
    })
    }
    catch(error){
        console.log('การอ่านข้อความผิดพลาดเนื่องจาก :', error)
        res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
    }
}

exports.sendMessage = async (req,res)=>{
    try{
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
        console.log('การส่งข้อความผิดพลาดเนื่องจาก :', error)
        res.status(404).json({error:'ไม่พบข้อมูลที่ค้นหา'})
    })
    }
    catch(error){
        console.log('การส่งข้อความผิดพลาดเนื่องจาก :', error)
        res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
    }

}


exports.getMessage = async (req,res)=>{
    try{

    const {senderID,getterID} = req.body

    await Chatrooms.findOne({participants:{$all:[senderID,getterID]}}).exec()
    .then((data)=>{
        res.json(data)
    })
    .catch((error)=>{
        console.log('การดึงข้อความผิดพลาดเนื่องจาก :', error)
        res.status(404).json({error:'ไม่พบข้อมูลที่ค้นหา'})
    })

    }
    catch(error){
        console.log('การดึงข้อความผิดพลาดเนื่องจาก :', error)
        res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
    }
}


exports.getAllMessages = async (req,res)=>{
    try{

    const {senderID} = req.params

    await Chatrooms.find({participants:{$all:[senderID]}}).exec()
    .then(async (data)=>{
        const messageAll = await data.filter((chatData)=>{
            return (chatData.messages.length !== 0)
        })
        res.json(messageAll)
    })
    .catch((error)=>{
          console.log('การดึงข้อความทั้งหมดผิดพลาดเนื่องจาก :', error)
          res.status(404).json({error:'ไม่พบข้อมูลที่ค้นหา'})
    })

    }
    catch(error){
        console.log('การดึงข้อความทั้งหมดผิดพลาดเนื่องจาก :', error)
        res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
    }
}


exports.getAllMessageAndAccounts = async (req,res)=>{
    const { allMessages,userID} = req.body

try{
    const allMessagesAndAccounts = await Promise.all( allMessages.map(async (chatData)=>{
        const getterFiltered = await Promise.all(
         chatData.participants.filter(participantID=>participantID !== userID)
        )
        const getterInfo = await Promise.all(
        getterFiltered.map( async (participantID)=>{
                const getterInfo = await Members.findById(participantID).exec()
                return getterInfo
        })
       )
        
       //ดึงแค่ account Data พอ ยังไม่ดึง chat Messages มาด้วยเพราะขี้เกียจแก้โค๊ดที่ client ใหม่
        return getterInfo[0]
        //{getterInfo:getterInfo[0],messageData:chatData.messages}
    })
    )

    res.json(allMessagesAndAccounts)
    //res.json(allMessagesAndAccounts.filter(data=>data.messageData.length!==0))

}
catch(error){
    console.log('การดึงบัญชีผู้ใช้งานแชททั้งหมดผิดพลาดเนื่องจาก :', error)
    res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
}
 
}