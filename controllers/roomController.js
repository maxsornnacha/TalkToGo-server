const TalkingRooms = require('../models/talkingroom')
const cloudinary = require('cloudinary')
const { v4: uuidv4 } = require('uuid');
const Members = require('../models/registration');
const { json } = require('body-parser');

cloudinary.config({ 
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
    api_key:process.env.CLOUDINARY_API_KEY, 
    api_secret:process.env.COULDINARY_API_SECRET 
  });

exports.createTalkingRoom = async (req,res)=>{
try{

    const slug = uuidv4()
    const {roomName,roomDescription,userID} = req.body
    let public_id = ''
    let roomIcon = req.body.roomIcon

    //บันทึกภาพลง cloud
    if(roomIcon){
        await cloudinary.uploader.upload(roomIcon,
            { public_id: Date.now()},
            function(error, result){console.log(result); })
            //บันทึกURL รูปภาพลง mongoDB
            .then((result)=>{
                roomIcon=result.url
                public_id=result.public_id
            })
            .catch((err)=>{
                res.status(404).json({error:"การบันทึกภาพล้มเหลว โปรดลองใหม่อีกครั้ง"})
                console.log(err)
            })
    }

     //Uploading on Posts
     await TalkingRooms.create({
        slug,
        admins:[userID],
        roomName,
        roomDescription,
        roomIcon,
    })
    .then(()=>{
        res.json('สร้างห้องพูดคุยสำเร็จ')
    })
    .catch((error)=>{
        console.log('การสร้างห้องพูดคุยผิดพลาดเนื่องจาก :', error)
        res.status(400).json({error:'การสร้างห้องพูดคุยผิดพลาด เนื่องจากไม่ตรงตามเงื่อนไข'})

         // Delete the image
        if(req.body.roomIcon){
         cloudinary.uploader.destroy(public_id)
         .then((result)=>console.log('ลบภาพสำเร็จ:', result))
         .catch((error)=> console.error('ลบภาพไม่สำเร็จ:', error))
        }
    })
    
}
catch(error){
    console.log('การสร้างห้องพูดคุยผิดพลาดเนื่องจาก :', error)
    res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
}
   
}


exports.getTalkingRooms = async (req,res)=>{
try{

    const {userID} = req.body
    TalkingRooms.find({
        $or: [
            { admins: userID },
            { participants: userID }
        ]
    })
    .then((data)=>{
        if(data){
            res.json(data)
        }
        else{
            //คุณยังไม่ได้เข้าร่วมห้องพูดคุยไหนเลย
            res.status(404).json({error:'ไม่พบข้อมูลที่ค้นหา'})
        }
    })
    .catch((error)=>{
        console.log('การดึงข้อมูลห้องพูดคุยทั้งหมดที่เข้าร่วมผิดพลาดเนื่องจาก :', error)
        res.status(404).json({error:'ไม่พบข้อมูลที่ค้นหา'})
    })

}
catch(error){
    console.log('การดึงข้อมูลห้องพูดคุยทั้งหมดที่เข้าร่วมผิดพลาดเนื่องจาก :', error)
    res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
}

}

exports.getSingleTalkingRoom = async (req,res)=>{
try{

    const {slug} = req.body

    TalkingRooms.findOne({slug})
    .then((data)=>{
        if(data){
            res.json(data)
        }
        else{
            //คุณยังไม่ได้เข้าร่วมห้องพูดคุยนี้
            res.status(404).json({error:'ไม่พบข้อมูลที่ค้นหา'})
        }
    })
    .catch((error)=>{
        console.log('การดึงข้อมูลห้องพูดคุยห้องเดียวผิดพลาดเนื่องจาก :', error)
        res.status(404).json({error:'ไม่พบข้อมูลที่ค้นหา'})
    })

}
catch(error){
    console.log('การดึงข้อมูลห้องพูดคุยห้องเดียวผิดพลาดเนื่องจาก :', error)
    res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
}

}


exports.getAllMembers = async (req,res)=>{
    try{
        const {members} = req.body

        const memberPromises = members.map((memberID)=>{
            return Members.findById(memberID)
        })

        const memberAccounts = await Promise.all(memberPromises)
        
        res.json(memberAccounts)
    }
    catch(error){
        console.log('การดึงข้อมูล Member ห้องพูดคุยผิดพลาดเนื่องจาก :', error)
        res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
    }




}


exports.requestToTheRoom = async (req,res)=>{
    const {accountID,roomID} = req.body
    const isAlreadyRequested = await TalkingRooms.findOne({requests:accountID})

    try{

    if(!isAlreadyRequested){
    TalkingRooms.findByIdAndUpdate(roomID,{
        $push: {
            requests: [ accountID ]
        }
    },{
        new:true
    })
    .then((data)=>{
        res.json(data)
    })
    .catch((error)=>{
        console.log('การส่งคำขอเข้าห้องพูดคุยผิดพลาดเนื่องจาก :', error)
        res.status(404).json({error:'ไม่พบข้อมูลที่ค้นหา'})
    })
    }else{
        res.status(400).json({error:'คุณได้ส่งคำขอเข้าร่วมห้องไปแล้วก่อนหน้านี้'})
    }
    }
    catch(error){
        console.log('การส่งคำขอเข้าห้องพูดคุยผิดพลาดเนื่องจาก :', error)
        res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
    }

}


exports.getRoomRequest = async (req,res)=>{   
try{
    const {accountID} = req.params

    const isAlreadyRequested = await TalkingRooms.findOne({requests:accountID})

    if(isAlreadyRequested){
        //ส่งคำขอเข้าร่วมห้องไปแล้ว
        res.json(true)
    }
    else{
        //ยังไม่ได้ส่งคำขอเข้าร่วมห้อง
        res.json(false)
    }

}
catch{
        console.log('การดึงข้อมูลการส่งคำขอเข้าห้องพูดคุยผิดพลาดเนื่องจาก :', error)
        res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
}

}


exports.deleteRoomRequest = async (req,res)=>{
try{
        const {accountID,roomID} = req.body
        const isAlreadyRequested = await TalkingRooms.findOne({requests:accountID})

        if(isAlreadyRequested){
        TalkingRooms.findByIdAndUpdate(roomID,{
            $pull: {
                requests: accountID
            }
        },{
            new:true
        })
        .then((data)=>{
            res.json(data)
        })
        .catch((error)=>{
            console.log('การลบการส่งคำขอเข้าห้องพูดคุยผิดพลาดเนื่องจาก :', error)
            res.status(404).json({error:'ไม่พบข้อมูลที่ค้นหา'})
        })
        }else{
            console.log('การลบการส่งคำขอเข้าห้องพูดคุยผิดพลาดเนื่องจาก : คุณยังไม่ได้ส่งคำขอเข้าร่วมห้อง')
            res.status(400).json({error:'คุณยังไม่ได้ส่งคำขอเข้าร่วมห้อง'})
        }
        }
 catch(error){
        console.log('การลบการส่งคำขอเข้าห้องพูดคุยผิดพลาดเนื่องจาก :', error)
        res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
}
    
}

exports.allRoomRequested = async (req,res)=>{
   try{
    const { adminID } = req.params;

    //หาห้องที่เป็น admin
    const data = await TalkingRooms.find({ admins: adminID });

    //กรอกว่าห้องนั้นมี request เข้ามารึป่าว
    const dataRequested = data.filter(room => room.requests.length !== 0);

    //ถ้ามี request เข้ามา
    if (dataRequested.length > 0) {
        const dataRequestedandRequesterInfo = await Promise.all(dataRequested.map(async (dataRequestedRoom) => {
            //ทำการหา account ที่ส่ง request มาในแต่ละห้อง
            const requestsWithInfo = await Promise.all(dataRequestedRoom.requests.map(async (requesterID) => {
                try {
                    //ถ้าหาเจอ ทำการรวม Requester Info + Room Requested Info เข้าด้วยกันในรูปแบบ object
                    const requesterInfo = await Members.findById(requesterID).exec();
                    return { roomRequested: dataRequestedRoom, requesterInfo: requesterInfo };
                } catch (error) {
                    //ถ้าไม่เจอ จะส่งค่า null ออกไปแทน
                    console.log('การดึงข้อมูลผู้ส่งคำขอผิดพลาดเนื่องจาก:', error);
                    return null;
                }
            }));

            //กรองเอาเฉพาะค่าที่ไม่ใช่ค่า null
            return requestsWithInfo.filter(info => info !== null);
        }));
        
        //Option: ใช้ flat เนื่องจากมีการซ้อนกันหลายชั้น เพื่อนทำให้มั้นใจว่าจะไม่มี nested Array เกิดขึ้น
        res.json(dataRequestedandRequesterInfo.flat());
    }
    //ถ้าไม่มี request เข้ามา
    else{
        console.log(1)
        console.log('การส่งคำขอเข้าห้องพูดคุยผิดพลาดเนื่องจาก :', error)
        res.status(404).json({error:'ไม่พบข้อมูลที่ค้นหา'})
    }    
   }
   catch(error){
    console.log(2)
    console.log('การดึงข้อมูลห้องที่มีคำขอผิดพลาดเนื่องจาก :', error)
    res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
   }
}


exports.acceptRoomRequested = async (req,res)=>{
try{
    const {roomRequestedID,requesterID} = req.body
    await TalkingRooms.findByIdAndUpdate(roomRequestedID,{
        $push:{participants:requesterID}
    },{
        new:true
    })
    .then(async()=>{
            await TalkingRooms.findByIdAndUpdate(roomRequestedID,{
                $pull:{requests:requesterID}
            },{
                new:true
            })
            .then((data)=>{
                res.json(data)
            })
            .catch((error)=>{
                console.log('การยอมรับคำขอเข้าห้องพูดคุยผิดพลาดเนื่องจาก :', error)
                res.status(404).json({error:'ไม่พบข้อมูลที่ค้นหา'})
            }) 
    })
    .catch((error)=>{
        console.log('1')
        console.log('การยอมรับคำขอเข้าห้องพูดคุยผิดพลาดเนื่องจาก :', error)
        res.status(404).json({error:'ไม่พบข้อมูลที่ค้นหา'})
    })
}
catch(error){
    console.log('การยอมรับคำขอเข้าห้องพูดคุยผิดพลาดเนื่องจาก :', error)
    res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
}
}


exports.rejectRoomRequested = async (req,res)=>{
try{
    const {roomRequestedID,requesterID} = req.body
    await TalkingRooms.findByIdAndUpdate(roomRequestedID,{
        $pull:{requests:requesterID}
    },{
        new:true
    })
    .then((data)=>{
        res.json(data)
    })
    .catch((error)=>{
        console.log('การปฏิเสธคำขอเเข้าห้องพูดคุยผิดพลาดเนื่องจาก :', error)
        res.status(404).json({error:'ไม่พบข้อมูลที่ค้นหา'})
    }) 
}
catch(error){
    console.log('การปฏิเสธคำขอเข้าห้องพูดคุยผิดพลาดเนื่องจาก :', error)
    res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
}
}