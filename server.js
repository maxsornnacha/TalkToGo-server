const  express = require('express');
const app = express();
//import middlewares
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const bodyParser = require('body-parser');
//import dataBase
const mongoose = require('mongoose');
//import Router 
const router = require('./routers/router');
//import session
const session = require('express-session');


//เชื่อมต่อ mongoose
mongoose.connect(process.env.DATABASE)
.then(()=>{
    console.log('connected to the database port :'+process.env.PORT)
})
.catch((error)=>{
    console.log('error to connect to the database, the reason is as followed :',error)
});

//middleware
app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '5mb' })); // Use body-parser for JSON with increased limit
app.use(express.json());
const corsOptions = {
    origin: [process.env.CLIENT_URL],
    credentials: true,
};
app.use(cors(corsOptions));
// session using
app.use(
  session({
    secret: 'JBJBFJHDBHJDBHJFBKSBSJLKDBSJKFBSJ',
    resave: false ,
    saveUninitialized: true,
  })
);
app.use(router);

const port = process.env.PORT || 5500

app.listen(port ,()=>{
    console.log(`port main server running on ${port}`)
});
