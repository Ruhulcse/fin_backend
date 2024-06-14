const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_EMAIL_PASS,
    },
});

module.exports.sendMail = async (mailOptions) => {
    return new Promise(async (resolve, reject) => {
         await transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                return reject(err);
            } else {
                return resolve(info);
            }
        });
    });
};