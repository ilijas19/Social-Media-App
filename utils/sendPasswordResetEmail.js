const sendMail = require("./sendEmail");

const sendPasswordResetEmail = async ({ verifyToken, origin, email, name }) => {
  const link = `${origin}/reset-password?verifyToken=${verifyToken}&email=${email}`;
  const html = `
  <h4>Hello ${name}</h4>
  <p>click on the following link to reset password <a href='${link}'>Reset</a></p>
  `;
  await sendMail({
    to: email,
    subject: "Password Reset",
    html,
  });
};

module.exports = sendPasswordResetEmail;
