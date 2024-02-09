const  express = require('express')
const app = express()
//import middlewares
const morgan = require('morgan')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const bodyParser = require('body-parser');
//import dataBase
const mongoose = require('mongoose')
//import Router 
const router = require('./routers/router')


//เชื่อมต่อ mongoose
mongoose.connect(process.env.DATABASE)
.then(()=>{
    console.log('connected to the database port :'+process.env.PORT)
})
.catch((error)=>{
    console.log('error to connect to the database, the reason is as followed :',error)
})

//middleware
//เพิ้มพื้นที่อัพโหลด
app.use(bodyParser.json({ limit: '5mb' })); 
app.use(express.json())
app.use(cors())
app.use(morgan("dev"))
app.use(cookieParser())

app.use(router)

app.listen(process.env.PORT,()=>{
    console.log(`port main server running on ${process.env.PORT}`)
})
