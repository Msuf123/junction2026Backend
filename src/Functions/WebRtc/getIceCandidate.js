
const twilio = require("twilio");




async function getICeCredentials() {
   
    const accountSid = process.env.TWILIO_ICE_SID;
const apiKey = process.env.SSID;
const apiSecret = process.env.SECRET;
    console.log("get tokesn",apiKey,accountSid,apiSecret)
     const client = twilio(apiKey, apiSecret, {
    accountSid: accountSid,
});
     const token = await client.tokens.create({
        ttl: 3600,
    });

    return {
        iceServers: token.iceServers.map((server) => ({
            urls: server.urls,
            username: token.username,
            credential: token.password,
        })),
    };
}



module.exports = { getICeCredentials };
