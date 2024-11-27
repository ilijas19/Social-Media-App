const sgMail = require("@sendgrid/mail");

const sendMail = async ({ to, subject, html }) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to,
    from: "ilijagocic19@gmail.com",
    subject,
    html,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("mail sent");
    })
    .catch((err) => console.error(err));
};
module.exports = sendMail;
