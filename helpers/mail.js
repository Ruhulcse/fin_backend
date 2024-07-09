const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.APP_EMAIL,
//     pass: process.env.APP_EMAIL_PASS,
//   },
// });

const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "contact@gafarsa.com",
      pass: "contactGLS@2024",
    },
  });


module.exports.sendMail = async (options) => {
  return new Promise(async (resolve, reject) => {
    const mailOptions = {
    //   from: options.from ?? "info@basistraining.com", 
      from: options.from ?? "contact@gafarsa.com", 
      to: options.to,
      subject: options.subject,
      html: options.html,
    };
    await transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        return reject(err);
      } else {
        return resolve(info);
      }
    });
    console.log(`Mail send to ${options.to}`);
  });
};
