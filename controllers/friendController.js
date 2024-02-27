const Members = require('../models/registration')
const FriendShips = require('../models/friendship')

exports.makingRequest = async (req,res)=>{
   const {senderID , getterID} = req.body

try{
    const sender = await Members.findById(senderID)
    const getter = await Members.findById(getterID)

   if(!sender || !getter){
    console.log('ไม่พบบัญชีที่ดำเนินการ')
   }else{
    console.log('พบบัญชีทั้งสอง ดำเนินการต่อได้')
    //ต่อไปเช็คว่าได้ส่ง request ไปแล้วหรือยัง
    const existingFriendship = await FriendShips.findOne({
        $or:[
            {requester:senderID , recipient:getterID},
            {requester:getterID , recipient:senderID}
        ]
    })

    if(existingFriendship){
        res.json({
            requester:existingFriendship.requester,
            recipient:existingFriendship.recipient,
            status:existingFriendship.status
        })
    }else{
        const newFriendship = new FriendShips({
            requester:senderID,
            recipient:getterID,
            status:'pending'
        })

        await newFriendship.save().then(()=>{
            console.log('คำขอเป็นเพื่อนได้ถูกส่งเรียบร้อบ')
            res.json({ requester:senderID,recipient:getterID,status:'pending'})
        }).catch(()=>{
            console.log('การส่งคำขอไม่สำเร็จ เนื่องจาก sever เกิดปัญหา')
            res.status(500).json('การส่งคำขอไม่สำเร็จ เนื่องจาก sever เกิดปัญหา')
        })
    }

   }

}catch{
    console.log('ไม่พบบัญชีที่ดำเนินการ')
}
  
}


exports.requestCheck = async (req,res)=>{
    const {senderID , getterID} = req.body
try{
     //ต่อไปเช็คว่าได้ส่ง request ไปแล้วหรือยัง
     const existingFriendship = await FriendShips.findOne({
        $or:[
            {requester:senderID , recipient:getterID},
            {requester:getterID , recipient:senderID}
        ]
    })

    if(!existingFriendship){
        console.log('ไม่พบการส่งรีเควส')
        res.json({
            requester:null,
            recipient:null,
            status:null
        })
    }else{
        console.log('มีรีเควสอยู่แล้ว')
        res.json({
            requester:existingFriendship.requester,
            recipient:existingFriendship.recipient,
            status:existingFriendship.status
        })
    }

}catch{
    console.log('ไม่พบการส่งรีเควส')
    res.json({
        requester:null,
        recipient:null,
        status:null
    })
}
}


exports.removeRequest = async (req,res)=>{
    const {senderID , getterID} = req.body

     await FriendShips.findOneAndDelete({
        $or:[
            {requester:senderID , recipient:getterID},
            {requester:getterID , recipient:senderID}
        ]
    })
    .then((data)=>{
        res.json({
            requester:null,
            recipient:null,
            status:null
        })
    })
    .catch((error)=>{
        console.log(error)
        res.status(500).json('เกิดข้อผิดพลาด ทาง Server')
    })

}


exports.acceptRequest = async (req,res)=>{
    const {senderID , getterID} = req.body
    console.log('senderID',senderID)
    console.log('getterID',getterID)

    await FriendShips.findOneAndUpdate({
        $or:[
            {requester:senderID , recipient:getterID},
            {requester:getterID , recipient:senderID}
        ]
    },{$set:{
       status:'accepted'
    }})
    .then((data)=>{
        res.json({ requester:getterID,recipient:senderID,status:'accepted'})
    })
    .catch((error)=>{
        console.log(error)
        res.status(500).json('เกิดข้อผิดพลาด ทาง Server')
    })
}