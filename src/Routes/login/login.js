const { generateAccessToken } = require("../../Functions/JWT/token");

const login=require("express").Router()
login.post("/",(req,res,next)=>{
    //Verify logic of the credentials
    const user=req.body.username
    const accessToken = generateAccessToken(user);
     res.cookie("token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
        success: true,
        message: "Login successful"
    });

})
module.exports={login}