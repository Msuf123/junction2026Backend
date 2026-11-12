const nodemailer = require("nodemailer");
const { generateOtpNumber } = require("./GenrateOtp");
function configs({
  userEamil,
  userGoogleAppPassword,
  recipentMail,
  emailSubject,
  authType,
  body,
  websiteRedirectUrl,
  tokenKey,
  encyptionKey,
  otp,
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: userEamil,
      pass: userGoogleAppPassword,
    },
  });
  let bodyTwo = "";
  if (!authType.hasOwnProperty("method")) {
    throw new Error(
      "Auth type in the send mail ned to have a property named as method value can be Code or Link",
    );
  }
  if (authType["method"] === "Link") {
    if (
      !authType.hasOwnProperty("userName") ||
      !authType.hasOwnProperty("password")
    ) {
      throw new Error(
        "You have selected Auth type to link you need to have a properties named as userName and password in the authTypeObject to send encrypted token",
      );
    }
    if (!tokenKey) {
      throw new Error(
        "YOu have selected genrate link but it reques to you to pass in key to encrypt token",
      );
    }
    if (!encyptionKey) {
      throw new Error(
        "YOu need to provide in a 32 char long stirng to encrypt you token that you want to send here is command to do that openssl rand -base64 32 eg. zmf2AwxeOQ4JiauGD0wN9jahdmD8No/6tbMp+yeG8K4=",
      );
    }
  }
  if (authType["method"] === "Code") {
    bodyTwo = `
  <div
      style="
        background: linear-gradient(135deg, #0f0f10, #1a1a1c);
        color: #fff;
        font-family: 'Poppins', Arial, sans-serif;
        text-align: center;
        padding: 40px 20px;
        border-radius: 12px;
        box-shadow: 0 0 25px rgba(255, 0, 150, 0.2);
      "
    >
      <h2
        style="
          color: #ff007f;
          font-size: 28px;
          letter-spacing: 1px;
          margin-bottom: 12px;
          text-transform: uppercase;
        "
      >
        ⚡ Verify Your Account
      </h2>

      <p style="font-size: 16px; color: #cfcfcf; margin-bottom: 28px">
        Welcome to <b>CardVerse</b> — the first Gen-Z gaming app of cards
        🎮🃏<br />
        Use the OTP below to verify your email.
      </p>

      <div
        style="
          display: inline-block;
          background: linear-gradient(90deg, #007bff, #00c3ff);
          color: #fff;
          font-size: 26px;
          letter-spacing: 6px;
          font-weight: 700;
          padding: 12px 24px;
          border-radius: 8px;
          box-shadow: 0 0 15px rgba(0, 140, 255, 0.5);
          margin-bottom: 25px;
        "
      >
        ${otp}
      </div>

      <p style="font-size: 14px; color: #aaa; margin-top: 30px">
        ⚡ This OTP is valid for the next 5 minutes.<br />
        If you didn’t request this, you can safely ignore it.
      </p>
    </div>
  `;
  }
  if (authType["method"] === "Link") {
    const token = generateToken(
      authType["userName"],
      authType["password"],
      tokenKey,
      encyptionKey,
    );
    const urlSeachParams = new URLSearchParams({ token: token });
    bodyTwo =
      "Click to verify the link " +
      websiteRedirectUrl +
      "?" +
      urlSeachParams.toString();
  }
  const mailOptions = {
    from: "xrobo17@gmail.com",
    to: recipentMail,
    subject: emailSubject ? emailSubject : "Verfiy your email address",
    html: body ? body : bodyTwo,
  };
  return {
    send: () => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.error("Error sending email:", error);
        }
        console.log("Email sent:", info.response);
      });
    },
  };
}
module.exports = { configs };
