const Members = require('../models/registration')
const FriendShips = require('../models/friendship')
const mongoose = require('mongoose')

exports.makingRequest = async (req,res)=>{
try{
    const {senderID , getterID} = req.body

    const sender = await Members.findById(senderID)
    const getter = await Members.findById(getterID)

   if(!sender || !getter){
    //ไม่พบบัญชีที่ดำเนินการ
   }else{
    //พบบัญชีทั้งสอง ดำเนินการต่อได้
    //ต่อไปเช็คว่าได้ส่ง request ไปแล้วหรือยัง
    const existingFriendship = await FriendShips.findOne({
        $or:[
            {requester:senderID , recipient:getterID},
            {requester:getterID , recipient:senderID}
        ]
    })
    // เช็คว่าเป็นเพื่อนกันแล้วรึป่าว
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

        await newFriendship.save()
        .then(()=>{
            res.json({ requester:senderID,recipient:getterID,status:'pending'})
        })
        .catch((error)=>{
            console.log('การส่งคำขอเป็นเพื่อนผิดพลาดเนื่องจาก :', error)
            res.status(400).json({error:'การส่งคำขอไม่สำเร็จ เนื่องจากไม่ตรงตามเงื่อนไข'})
        })
    }

   }

}catch{
    console.log('การส่งคำขอเป็นเพื่อนผิดพลาดเนื่องจาก :', error)
    res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
}
  
}


exports.requestCheck = async (req,res)=>{
try{
    const {senderID , getterID} = req.body

     //ต่อไปเช็คว่าได้ส่ง request ไปแล้วหรือยัง
     const existingFriendship = await FriendShips.findOne({
        $or:[
            {requester:senderID , recipient:getterID},
            {requester:getterID , recipient:senderID}
        ]
    })

    if(!existingFriendship){
        //ไม่พบการส่งรีเควส
        res.json({
            requester:null,
            recipient:null,
            status:null
        })
    }else{
        //มีรีเควสอยู่แล้ว
        res.json({
            requester:existingFriendship.requester,
            recipient:existingFriendship.recipient,
            status:existingFriendship.status
        })
    }

}catch{
    //ไม่พบการส่งรีเควส
    res.json({
        requester:null,
        recipient:null,
        status:null
    })
}
}


exports.removeRequest = async (req,res)=>{
    try{

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
        console.log('การลบคำขอร้องผิดพลาดเนื่องจาก :', error)
        res.status(404).json({error:'ไม่พบข้อมูลที่ค้นหา'})
    })

    }
    catch(error){
        console.log('การลบคำขอร้องผิดพลาดเนื่องจาก :', error)
        res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
    }

}


exports.acceptRequest = async (req,res)=>{
    try{

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
        console.log('การยอมรับขอผิดพลาดเนื่องจาก :', error)
        res.status(404).json({error:'ไม่พบข้อมูลที่ค้นหา'})
    })

    }
    catch(error){
        console.log('การยอมรับขอผิดพลาดเนื่องจาก :', error)
        res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
    }
}


exports.fetchFriendRequest = async (req,res)=>{
    try{

    const {accountID} = req.params

        const data = await FriendShips.find({
            recipient:accountID , status:"pending"
        }).exec()
        
        const requesterArray = data.map(friendship=>{
         return friendship.requester
        })

        Members.find({_id:{$in:requesterArray}}).exec()
        .then((data)=>{
            res.json({data:data,getterID:accountID});
        })
        .catch((error)=>{
            console.log('การดึงข้อมูลคำขอทั้งหมดผิดพลาดเนื่องจาก :', error)
            res.status(404).json({error:'ไม่พบข้อมูลที่ค้นหา'})
        })

    }
    catch(error){
        console.log('การดึงข้อมูลคำขอทั้งหมดผิดพลาดเนื่องจาก :', error)
        res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
    }


}

exports.fetchFriendlist = async (req,res)=>{

    try{
    
    const {accountID} = req.params

    const data = await FriendShips.find({
        $or:[
            {requester:accountID , status:"accepted"},
            {recipient:accountID , status:"accepted"}
        ]
    }).exec()
   
    const FriendShipsArray = data.map((friendshipData)=>{   
        const id = new mongoose.Types.ObjectId(`${accountID}`);
        if(!friendshipData.requester.equals(id)){
            return friendshipData.requester
        }else if(!friendshipData.recipient.equals(id)){
            return friendshipData.recipient
        }
    })

    Members.find({_id:{$in:FriendShipsArray}}).exec()
    .then((data)=>{
        res.json(data);
    })
    .catch((error)=>{
        console.log('การดึงข้อมูลบัญชีของคนที่เป็นเพื่อนกันผิดพลาดเนื่องจาก :', error)
        res.status(404).json({error:'ไม่พบข้อมูลที่ค้นหา'})
    })

    }
    catch(error){
        console.log('การดึงข้อมูลบัญชีของคนที่เป็นเพื่อนกันผิดพลาดเนื่องจาก :', error)
        res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
    }
   
}