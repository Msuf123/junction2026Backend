const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {

    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.SECRET_KEY_TOKEN,
            {
                issuer: "node-api",
                audience: "frontend"
            }
        );

        req.user = decoded;
         console.log(decoded,'hi')
        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired token"
        });

    }
}

module.exports = verifyToken;