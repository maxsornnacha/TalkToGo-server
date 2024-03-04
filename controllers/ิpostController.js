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
        res.status(401).json('อัพโหลดโพสต์ล้มเหลว')
        console.log(error)

         // Delete the image
        if(req.body.image){
         cloudinary.uploader.destroy(public_id)
         .then((result)=>console.log('ลบภาพสำเร็จ:', result))
         .catch((error)=> console.error('ลบภาพไม่สำเร็จ:', error))
        }
    })


}

//แสดงโพสต์ทั้งหมด
exports.displayPost = async (req,res)=>{
    Posts.find().exec()
    .then((data)=>{
        res.json(data)
    })
    .catch((error)=>{
        console.log(error)
        res.status(400).json({error:'ไม่พบโพสใดๆเลย'})
    })
}

//Like
exports.likeSystemIncrease = async (req,res)=>{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    const {like,accountID,postID} = req.body
    console.log('like :',like)
    console.log('accountID :',accountID)
    console.log('postID :',postID)

    Posts.findOneAndUpdate(
        { postID: postID },
        { $push: { likes: { accountID:accountID, like:like } } },
        { new: true }
    ).exec()
    .then(()=>{
         //ไลค์สำเร็จ
    })
    .catch(res.json({error:'ไลค์ล้มเหลว'}))
}

//Unlike
exports.likeSystemDecrease = async (req,res)=>{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    const {like,accountID,postID} = req.body
    console.log('like :',like)
    console.log('accountID :',accountID)
    console.log('postID :',postID)

    //ลบ like บน Posts
    Posts.findOneAndUpdate(
        { postID: postID },
        { $pull: { likes: { accountID:accountID, like:like } } },
        { new: true }
    ).exec()
    .then(()=>{
        //ไม่ไลค์สำเร็จ
    })
    .catch(res.json({error:'ไม่ไลค์ล้มเหลว'}))
}

//เรียกดูโพสต์แบบเดี่ยวๆ โดยอิงจาก postID
exports.singlePost = async (req,res)=>{
    Posts.findOne({postID:req.params.id}).exec()
    .then((data)=>{
        res.json(data)})
    .catch((error)=>res.status(400).json({error:'ไม่เจอโพสต์ที่กำลังค้นหา'}))
}

//เรียกดูโพสต์ทั้งหมดใน โปรไฟล์ โดยอิงจาก accountID
exports.displePostForProfile = async (req,res)=>{
    Posts.find({accountID:req.params.id}).exec()
    .then((data)=>{
        res.json(data)})
    .catch((error)=>res.status(400).json(`ไม่เจอโพสต์ที่กำลังค้นหา`))
}

//อัพโหลดคอมเม้นต์
exports.createComment = async (req,res)=>{
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
    .then(async ()=>{ 
            res.json('อัพโหลดคอมเม้นค์ต์สำเร็จ')
    })
    .catch((error)=>{
        console.log(error)
        res.status(401).json('การอัพโหลดผิดพลาด')

         // Delete the image
         cloudinary.uploader.destroy(public_id)
         .then((result)=>console.log('ลบภาพสำเร็จ:', result))
         .catch((error)=> console.error('ลบภาพไม่สำเร็จ:', error))
    })

}

//อัพโหลดตอบกลับ
exports.createReply = async (req,res)=>{
    const { currentDate,currentTime,accountImage,firstname,lastname,accountID,commentID,replyInput} = req.body
    let public_id = ''
    let image = req.body.replyImage
    const replyID = uuidv4()

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
    .then(async ()=>{    
            res.json('อัพโหลดตอบกลับบนสำเร็จ')          
    })
    .catch((error)=>{
        console.log(error)
        res.status(401).json('อัพโหลดตอบกลับบนสำเร็จล้มเหลว')

         // Delete the image
         cloudinary.uploader.destroy(public_id)
         .then((result)=>console.log('ลบภาพสำเร็จ:', result))
         .catch((error)=> console.error('ลบภาพไม่สำเร็จ:', error))
    })

}
