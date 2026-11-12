const jwt = require("jsonwebtoken");
function generateAccessToken(user) {
     const SECRET_KEY_TOKEN=process.env.SECRET_KEY_TOKEN
    return jwt.sign(
        { user },
        SECRET_KEY_TOKEN,
        {
            subject: "Auth",
            expiresIn: "15m",
            issuer: "node-api",
            audience: "frontend"
        }
    );
}
module.exports={generateAccessToken}