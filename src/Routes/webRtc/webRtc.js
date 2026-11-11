const webRtcRoute=require("express").Router()
webRtcRoute.get("/getIces",()=>{
    //send ice cndaiges
})

function webRtc(ws,message){
    
 if(message.type==="sendOffer"){
 //a send offer to b
 }
 if(message.type==="sendAnswer"){
//b sned ser to a
 }
 if(message.type==="exchangeIces"){
    //when  a and b get ice excchange the ices
 }
}
module.exports={webRtc}