const { config } = require("dotenv");
const verifyToken = require("../../MiddleWare/Auth/Auth");
const { configs } = require("../../Functions/SendMail/Send");

const profile=require("express").Router()
profile.get('/',verifyToken,(req,res,next)=>{
    console.log("req si",req.user)
    configs({
      userEamil: process.env.USER_EMAIL_FOR_TWO_FA,
      userGoogleAppPassword: process.env.EMAIL_SENT_APP_PASSWORD,
      authType: { method: "Notify" }, // make a plain email variant
      recipentMail: process.env.USER_EMAIL, // notify YOU, not the tester
      message: `Google Play reviewer logged in at ${new Date().toISOString()}`,
    }).send();
    res.send({text:"okay"})
})
module.exports={profile}