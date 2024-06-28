// const Mailchimp = require("mailchimp-api-v3");
// const mailchimp = new Mailchimp(process.env.MAILCHIMP_API_KEY);
const mailchimp = require("@mailchimp/mailchimp_transactional")(
  process.env.MAILCHIMP_API_KEY
);
// async function callPing() {
//   const response = await mailchimp.users.ping();
//   console.log(response);
// }
// callPing();

module.exports.sendEmail = async (
  email,
  firstName,
  lastName,
  subject,
  message
) => {
  try {
    const response = await mailchimp.post(
      `/lists/${process.env.MAILCHIMP_LIST_ID}/members`,
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
          SUBJECT: subject,
          MESSAGE: message,
        },
      }
    );
    console.log(`Email sent to ${email}: `, response);
  } catch (error) {
    console.error(`Error sending email to ${email}: `, error);
  }
};

module.exports.createAudience = async () => {
  try {
    const response = await mailchimp.post("/lists", {
      name: "BasisTraining Audience",
      contact: {
        company: "BasisTraining",
        address1: "123 Main St",
        city: "Anytown",
        state: "CA",
        zip: "90210",
        country: "US",
      },
      permission_reminder:
        "You are receiving this email because you signed up for updates.",
      campaign_defaults: {
        from_name: "BasisTraining",
        from_email: "info@basistraining.com",
        subject: "Welcome to BasisTraining",
        language: "EN",
      },
      email_type_option: true,
    });
    console.log("Audience created: ", response);
    return response.id;
  } catch (error) {
    console.error("Error creating audience: ", error);
    throw error;
  }
};

module.exports.sendRegistrationEmail = async (
  email,
  firstName,
  lastName,
  registrationUrl
) => {
  const message = {
    from_email: "info@basistraining.com",
    subject: "Welcome to Our Service",
    html: `
        <h1>Welcome to Our Service</h1>
        <p>Hi ${firstName},</p>
        <p>Thank you for registering. Please click the link below to complete your registration:</p>
        <p><a href="${registrationUrl}">Complete Registration</a></p>
        <p>Best regards,<br>Your Company Name</p>
      `,
    to: [
      {
        email: email,
        name: `${firstName} ${lastName}`,
        type: "to",
      },
    ],
  };

  try {
    const response = await mailchimp.messages.send({ message });
    console.log("Registration email sent successfully!", response);
  } catch (error) {
    console.error("Error sending registration email:", error);
  }
};
