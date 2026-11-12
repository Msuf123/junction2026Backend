const httpServer=require("http")
const express=require("express")
const { WebSocketServer } = require("ws");
const { webRtc, webRtcRoute } = require("./Routes/webRtc/webRtc");
const envs=require("dotenv")
const cors = require("cors");
const cookieParser = require('cookie-parser');
const three = require("./Routes/threed/three");
const { login } = require("./Routes/login/login");
const { profile } = require("./Routes/login/profile");
const { webRtcCon } = require("./Functions/WebRtc/connectWithFrontend");
envs.config()
const app=express()
app.use(cors({
  origin: process.env.FRONT_END_URL,
  credentials: true
}));
app.use(express.json())
app.use(cookieParser());
app.get("/",(req,res)=>{
  res.send("Server up and running");
})
app.use("/three",three)
app.use("/login",login)
app.use("/profile",profile)
app.use("/webRtc",webRtcRoute)
const server=httpServer.createServer(app)
const wss=new WebSocketServer({server})
wss.on("connection",(ws)=>{
    console.log("Client connected");
    ws.isAlive = true;
    ws.on("pong", () => {
        ws.isAlive = true;
        console.log("Received pong from client 🟢");
    });
   let messageQueue = Promise.resolve();

    ws.on("message", (rawMessage) => {
        messageQueue = messageQueue
            .then(async () => {
                const data = JSON.parse(rawMessage.toString());
                console.log("logging")
                await webRtcCon(ws, data);
            })
            .catch((error) => {
                console.error("WebRTC signaling error:", error);

                ws.send(JSON.stringify({
                    type: "error",
                    message: error.message,
                }));
            });
    });

  
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
    console.log("3D Model Paths",process.env.THREE_D_MODEL_PATH)
    console.log("Secret token for jwt is",process.env.SECRET_KEY_TOKEN)
})

