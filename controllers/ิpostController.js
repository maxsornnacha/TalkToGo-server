const Posts = require('../models/post')
const cloudinary = require('cloudinary')
const { v4: uuidv4 } = require('uuid');

cloudinary.config({ 
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
    api_key:process.env.CLOUDINARY_API_KEY, 
    api_secret:process.env.COULDINARY_API_SECRET 
  });




//สร้างโพสต์
exports.createPost = async (req,res)=>{
try{

    const postID = uuidv4()
    const {content,firstname,lastname,accountImage,currentDate,currentTime,id} = req.body
    let public_id = ''
    let image = req.body.image

    //บันทึกภาพลง cloud
    if(image){
        await cloudinary.uploader.upload(image,
            { public_id: Date.now()},
            function(error, result){console.log(result); })
            //บันทึกURL รูปภาพลง mongoDB
            .then((result)=>{
                image=result.url
                public_id=result.public_id
            })
            .catch((err)=>{
                res.status(404).json({error:"การบันทึกภาพล้มเหลว โปรดลองใหม่อีกครั้ง"})
                console.log(err)
            })
    }

    //Uploading on Posts
    await Posts.create({accountID:id,postID,content,firstname,lastname,accountImage,currentDate,currentTime,image,
        comments:[],likes:[]
    })
    .then(async ()=>{
        res.json('อัพโหลดโพสต์สำเร็จ')
    })
    .catch((error)=>{
        console.log('การอัพโหลดโพสต์ผิดพลาดเนื่องจาก :', error)
        res.status(400).json('การอัพโหลดโพสต์ผิดพลาดเนื่องจาก ไม่ตรงตามเงื่อนไข')

         // Delete the image
        if(req.body.image){
         cloudinary.uploader.destroy(public_id)
         .then((result)=>console.log('ลบภาพสำเร็จ:', result))
         .catch((error)=> console.error('ลบภาพไม่สำเร็จ:', error))
        }
    })

}
catch(error){
    console.log('การอัพโหลดโพสต์ผิดพลาดเนื่องจาก :', error)
    res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
}
}

//แสดงโพสต์ทั้งหมด
exports.displayPost = async (req,res)=>{
try{

    Posts.find().exec()
    .then((data)=>{
        res.json(data)
    })
    .catch((error)=>{
        console.log('การดึงโพสต์ทั้งหมดผิดพลาดเนื่องจาก :', error)
        res.status(404).json({error:'ไม่พบข้อมูลที่ค้นหา'})
    })

}
catch(error){
    console.log('การดึงโพสต์ทั้งหมดผิดพลาดเนื่องจาก :', error)
    res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
}
}

//Like
exports.likeSystemIncrease = async (req,res)=>{
try{

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    const {like,accountID,postID} = req.body

    Posts.findOneAndUpdate(
        { postID: postID },
        { $push: { likes: { accountID:accountID, like:like } } },
        { new: true }
    ).exec()
    .then((data)=>{
        res.json(data)
    })
    .catch((error)=>{
        console.log('การเพิ่มไลค์ผิดพลาดเนื่องจาก :', error)
        res.json({error:'ไลค์ล้มเหลว'})
    })

}
catch(error){
    console.log('การเพิ่มไลค์ผิดพลาดเนื่องจาก :', error)
    res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
}
}

//Unlike
exports.likeSystemDecrease = async (req,res)=>{
try{

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    const {like,accountID,postID} = req.body


    //ลบ like บน Posts
    Posts.findOneAndUpdate(
        { postID: postID },
        { $pull: { likes: { accountID:accountID, like:like } } },
        { new: true }
    ).exec()
    .then((data)=>{
        res.json(data)
    })
    .catch((error)=>{
        console.log('การยกเลิกไลค์ผิดพลาดเนื่องจาก :', error)
        res.json({error:'ไม่ไลค์ล้มเหลว'})
    })

}
catch(error){
    console.log('การยกเลิกไลค์ผิดพลาดเนื่องจาก :', error)
    res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
}
}

//เรียกดูโพสต์แบบเดี่ยวๆ โดยอิงจาก postID
exports.singlePost = async (req,res)=>{
try{

    Posts.findOne({postID:req.params.id}).exec()
    .then((data)=>{
        res.json(data)})
    .catch((error)=>{
        console.log('การดึงโพสต์แบบเดี่ยวผิดพลาดเนื่องจาก :', error)
        res.status(404).json({error:'ไม่พบข้อมูลที่ค้นหา'})
    })

}
catch(error){
    console.log('การดึงโพสต์แบบเดี่ยวผิดพลาดเนื่องจาก :', error)
    res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
}
}

//เรียกดูโพสต์ทั้งหมดใน โปรไฟล์ โดยอิงจาก accountID
exports.displePostForProfile = async (req,res)=>{
try{

    Posts.find({accountID:req.params.id}).exec()
    .then((data)=>{
        res.json(data)})
    .catch((error)=>{
        console.log('การดึงโพสต์ทั้งหมดในโปรไฟล์ผิดพลาดเนื่องจาก :', error)
        res.status(404).json({error:'ไม่พบข้อมูลที่ค้นหา'})
    })

}
catch(error){
    console.log('การดึงโพสต์ทั้งหมดในโปรไฟล์ผิดพลาดเนื่องจาก :', error)
    res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
}
}

//อัพโหลดคอมเม้นต์
exports.createComment = async (req,res)=>{
try{
    const { currentDate,currentTime,accountImage,firstname,lastname,accountID,postID,commentInput} = req.body
    let public_id = ''
    let image = req.body.commentImage
    const commentID = uuidv4()

     //บันทึกภาพลงcloud
     if(image){
        await cloudinary.uploader.upload(image,
            { public_id: Date.now()},
            function(error, result){console.log(result); })
            //บันทึกURL รูปภาพลง mongoDB
            .then((result)=>{
                image=result.url
                public_id=result.public_id
            })
            .catch((err)=>{
                res.status(404).json({error:"การบันทึกภาพล้มเหลว โปรดลองใหม่อีกครั้ง"})
                console.log(err)
            })
    }

    Posts.findOneAndUpdate(
        { postID: postID },
        { $push: { comments: {commentID,accountID,accountImage,firstname,lastname,commentInput,commentImage:image,currentTime,currentDate,replies:[]} } },
        { new: true }
    ).exec()
    .then((data)=>{ 
        res.json(data)
    })
    .catch((error)=>{
        console.log('การอัพโหลดคอมเม้นต์ผิดพลาดเนื่องจาก :', error)
        res.status(400).json({error:'การอัพโหลดคอมเม้นต์ผิดพลาด เนื่องจากไม่ตรงตามเงื่อนไขที่กำหนด'})

         // Delete the image
         cloudinary.uploader.destroy(public_id)
         .then((result)=>console.log('ลบภาพสำเร็จ:', result))
         .catch((error)=> console.error('ลบภาพไม่สำเร็จ:', error))
    })

}
catch(error){
    console.log('การอัพโหลดคอมเม้นต์ผิดพลาดเนื่องจาก :', error)
    res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
}
}

//อัพโหลดตอบกลับ
exports.createReply = async (req,res)=>{
try{

    const { currentDate,currentTime,accountImage,firstname,lastname,accountID,commentID,replyInput} = req.body
    let public_id = ''
    let image = req.body.replyImage
    const replyID = uuidv4()

    console.log(commentID)

     //บันทึกภาพลงcloud
     if(image){
        await cloudinary.uploader.upload(image,
            { public_id: Date.now()},
            function(error, result){console.log(result); })
            //บันทึกURL รูปภาพลง mongoDB
            .then((result)=>{
                image=result.url
                public_id=result.public_id
            })
            .catch((err)=>{
                res.status(404).json({error:"การบันทึกภาพล้มเหลว โปรดลองใหม่อีกครั้ง"})
                console.log(err)
            })
    }

   Posts.findOneAndUpdate(
        {"comments.commentID":commentID},
        { $push: { "comments.$.replies": {replyID,currentDate,currentTime,accountImage,firstname,lastname,accountID,replyInput,replyImage:image} } },
        { new: true }
    ).exec()
    .then(async (data)=>{    
        res.json('อัพโหลดตอบกลับสำเร็จ')          
    })
    .catch((error)=>{
        console.log('การอัพโหลดตอบกลับผิดพลาดเนื่องจาก :', error)
        res.status(400).json('การอัพโหลดตอบกลับผิดพลาด เนื่องจากไม่ตรงตามเงื่อนไขที่กำหนด')

         // Delete the image
         cloudinary.uploader.destroy(public_id)
         .then((result)=>console.log('ลบภาพสำเร็จ:', result))
         .catch((error)=> console.error('ลบภาพไม่สำเร็จ:', error))
    })

}
catch(error){
    console.log('การอัพโหลดตอบกลับผิดพลาดเนื่องจาก :', error)
    res.status(500).json({error:'เกิดข้อผิดพลาดกับ เซิร์ฟเวอร์'})
}
}
