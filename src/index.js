const httpServer=require("http")
const express=require("express")
const { WebSocketServer } = require("ws");
const { webRtc } = require("./Routes/webRtc/webRtc");
const envs=require("dotenv")
const cors = require("cors");
envs.config()
const app=express()
app.use(cors({
  origin: process.env.FRONT_END_URL,
  credentials: true
}));
app.get("/",(req,res)=>{
  res.send("Server up and running");
})
const server=httpServer.createServer(app)
const wss=new WebSocketServer({server})
wss.on("connection",(ws)=>{
    console.log("Client connected");
    ws.isAlive = true;
    ws.on("pong", () => {
        ws.isAlive = true;
        console.log("Received pong from client 🟢");
    });
    ws.on("message",(message)=>{
         const data = JSON.parse(message);
webRtc(ws,data)

    })
  
})
wss.on("close",()=>{
    console.log("WebScoket server closed")
})
wss.on("error",(err)=>{
    console.log("Websocket server error",err)
})
setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
            console.log("Terminating dead client connection 🔴");
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
        console.log("Sent ping to client 🔵");
    });
}, 30000);
server.listen(3000,()=>{
    console.log("Server up and running");
    console.log("Feontend URl",process.env.FRONT_END_URL)
})

