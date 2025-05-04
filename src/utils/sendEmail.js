const nodemailer = require('nodemailer');

// Function to send email using Nodemailer
const sendEmail = async (to, subject, text) => {
  // Create transporter using your email service provider (Gmail in this case)
  const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services such as 'smtp.mailtrap.io', 'SendGrid', etc.
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password or app-specific password (for Gmail)
    },
  });

  // Define mail options
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to, // Receiver address
    subject, // Subject of the email
    html: text, // The body of the email (HTML format)
  };

  try {
    // Send the email using the transporter
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    // Log and rethrow error if there is any issue in sending the email
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

// Export the function to use in other parts of the application
module.exports = sendEmail;
