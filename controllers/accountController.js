const Members = require('../models/registration')
const bcrypt = require('bcrypt')
const cloudinary = require('cloudinary')

cloudinary.config({ 
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
    api_key:process.env.CLOUDINARY_API_KEY, 
    api_secret:process.env.COULDINARY_API_SECRET 
  });

exports.createAccount = async (req,res)=>{
    const {firstname,lastname,username,password,email} = req.body
    const passwordHashed = await bcrypt.hash(password,10)
    let image = req.body.accountImage

    //บันทึกภาพลงcloud
    if(image){
        await cloudinary.uploader.upload(req.body.accountImage,
            { public_id: Date.now()},
            function(error, result){console.log(result); })
            //บันทึกURL รูปภาพลง mongoDB
            .then((result)=>image=result.url)
            .catch((err)=>{
                res.status(404).json({error:"การบันทึกภาพล้มเหลว โปรดลองใหม่อีกครั้ง"})
                console.log(err)
            })
    }else{
        image = 'https://res.cloudinary.com/dakcwd8ki/image/upload/v1707512097/wwfulsac153rtabq45as.png'
    }

    try{
        CreatingAccount = await Members.create({
            username:username,
            password:passwordHashed,
            firstname:firstname,
            lastname:lastname,
            email:email,
            accountImage:image
        })
        .then((data)=>{
            res.json(data)
        })
        .catch((error)=>{
            console.log(error)
            res.status(400).json({'error':error.keyValue})

            // Delete the image
        cloudinary.uploader.destroy(image)
        .then((result)=>console.log('Image deleted successfully:', result))
        .catch((error)=> console.error('Error deleting image:', error))


        })
    }
    catch{
 
    }
}