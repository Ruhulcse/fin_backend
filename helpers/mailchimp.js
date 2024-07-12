const mailchimp = require('@mailchimp/mailchimp_transactional')('md-Lt-pNL0MtCAY1yNs839SPQ');

module.exports.sendEmail = async () => {
  const message = {
    from_email: '2020belayethossain@gmail.com',
    subject: 'Welcome to our service',
    text: 'Welcome! Thank you for registering with us. Click the link to activate your account.',
    to: [
      {
        email: '2020belayethossain@gmail.com',
        type: 'to'
      }
    ]
  };

  try {
    const response = await mailchimp.messages.send({ message });
    console.log('Email sent successfully:', response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

















// // Mailchimp env variables
// const MAILCHIMP_API_USERNAME = process.env.MAILCHIMP_API_USERNAME;
// const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
// const MAILCHIMP_TARGET_LIST = process.env.MAILCHIMP_TARGET_LIST;
// // Mailchimp endpoint using v3.0
// const dc = MAILCHIMP_API_KEY.split("-")[1];
// const apiUrl = `https://${dc}.api.mailchimp.com/3.0`;
// // Authorization
// const auth = {
//   username: MAILCHIMP_API_USERNAME,
//   password: MAILCHIMP_API_KEY,
// };

// async function subscribe(email, status = "pending") {
//   const req = await fetch(`${apiUrl}/lists/${MAILCHIMP_TARGET_LIST}/members`, {
//     method: "post",
//     body: JSON.stringify({
//       email_address: email,
//       status: status,
//     }),
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Basic ${Buffer.from(
//         `${auth.username}:${auth.password}`
//       ).toString("base64")}`,
//     },
//   });
//   const resp = await req.json();
//   return resp;
// }
