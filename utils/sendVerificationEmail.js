const sendMail = require("./sendEmail");

const sendVerificationEmail = async ({ verifyToken, origin, email, name }) => {
  const link = `${origin}/verify-email?verifyToken=${verifyToken}&email=${email}`;
  const html = `
  <h4>Hello ${name}</h4>
  <p>click on the following link to verify email <a href='${link}'>Verify</a></p>
  `;
  await sendMail({
    to: email,
    subject: "Email Verification",
    html,
  });
};

module.exports = sendVerificationEmail;
