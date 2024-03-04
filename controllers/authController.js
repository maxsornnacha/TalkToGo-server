const Members = require('../models/registration')
const bcrypt = require('bcrypt')
const cloudinary = require('cloudinary')
const jsonWT = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid');
const {expressjwt: jwt} = require('express-jwt')
const session = require('express-session')

cloudinary.config({ 
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
    api_key:process.env.CLOUDINARY_API_KEY, 
    api_secret:process.env.COULDINARY_API_SECRET 
  });

exports.createAccount = async (req,res)=>{
    const {firstname,lastname,username,password,email} = req.body
    const passwordHashed = await bcrypt.hash(password,10)
    let image = req.body.accountImage
    let public_id = ''

    //บันทึกภาพลงcloud
    if(image){
        await cloudinary.uploader.upload(req.body.accountImage,
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
    }else{
        image = 'https://res.cloudinary.com/dakcwd8ki/image/upload/v1707512097/wwfulsac153rtabq45as.png'
    }

    try{
        CreatingAccount = await Members.create({
            id:uuidv4(),
            username:username,
            password:passwordHashed,
            firstname:firstname,
            lastname:lastname,
            email:email,
            accountImage:image,
            posts:[],
            friends:[]
        })
        .then((data)=>{
            res.json(data)
        })
        .catch((error)=>{
            console.log(error)
            res.status(400).json({'error':error.keyValue})

            // Delete the image
        cloudinary.uploader.destroy(public_id)
        .then((result)=>console.log('Image deleted successfully:', result))
        .catch((error)=> console.error('Error deleting image:', error))


        })
    }
    catch{
 
    }
}

exports.loginAccount = async (req,res)=>{

    try{
    const {emailInput,passwordInput} = req.body
    console.log(emailInput, passwordInput)
    const accountData = await Members.findOne({email:emailInput}).exec()
    
        if(accountData){
            const isConfirmed = await bcrypt.compare(passwordInput, accountData.password);
                if(isConfirmed){
                    const tokenKeyCreated = await jsonWT.sign({emailInput},process.env.JWT_SECRET_KEY,{
                        expiresIn:'3h'
                    })

                    //เก็บ token กับ email ลง session
                    const timeExp = 3*60*60*1000// 3 hours
                    req.session.token_key = tokenKeyCreated
                    req.session.accountData = accountData
                    req.session.login = true
                    req.session.cookie.maxAge = timeExp
                   // console.log('loginSession',req.session)
                    res.json({status:'เข้าสู่ระบบสำเร็จ'})

                }
                else{
                    res.status(400).json({error:'การเข้าสู่ระบบล้มเหลว เนื่องจากรหัสผ่านไม่ถูกต้อง'})
                }
            }else{
                res.status(400).json({ error: 'การเข้าสู่ระบบล้มเหลว เนื่องจากไม่พบบัญชีของท่าน' });
            }
        }
        catch(error){
            console.log('Login ล้มเหลว เกิดข้อผิดพลาด', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    


}

//singleAccount forSession
exports.accountData = async (req,res)=>{
   //console.log('session-check',req.session)
    if (req.session && req.session.login) {
        const token_key = req.session.token_key;
        const accountData = req.session.accountData
        res.json({accountData,token_key});
    }else{
            // If the session or login status is not present
            res.status(401).json({ error: 'Unauthorized' });
    }
}


//singleAccount forProfile
exports.singleAccountData= async (req,res)=>{
    Members.findOne({id:req.params.id}).exec()
    .then((data)=>{
        res.json(data)
    })
    .catch((error)=>{
        res.status(401).json({error:'เกิดข้อผิดพลาดในการดึงข้อมูล'})
        console.log('เกิดข้อผิดพลาด :',error)
    })
}

exports.logoutAccount = async (req,res)=>{
   // console.log(req.session)
    if (req.session && req.session.login) {
        req.session.destroy((error) => {
          if (error) {
            console.error('Error destroying session:', error);
            res.status(500).send('ออกจากระบบล้มเหลว เกิดข้อผิดพลาดจากการเชื่อมต่อเซิร์ฟเวอร์');
          } else {
            console.log('ลบ session สำเร็จ');
            res.json('ออกจากระบบสำเร็จ');
          }
        });
      } else {
        res.status(404).json({ error: 'ออกจากระบบไม่สำเร็จ เนื่องจากไม่พบข้อมูล' });
      }
}


exports.getAllAccounts = async (req,res)=>{

    Members.find().exec()
    .then((data)=>{
        res.json(data)
    })
    .catch((error)=>{
        console.log(error)
        res.status(404).json({error:`เกิดข้อผิดพลาด : ${error}`})
    })
}


