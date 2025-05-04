// src/utils/emailService.js

const mailgun = require('mailgun-js');
const DOMAIN = process.env.MAILGUN_DOMAIN;  // Replace with your Mailgun domain if not using environment variables
const API_KEY = process.env.MAILGUN_API_KEY; // Replace with your Mailgun API key

const mg = mailgun({ apiKey: API_KEY, domain: DOMAIN });

/**
 * Function to send an invitation email.
 * @param {string} email - The recipient's email address
 * @param {string} inviteLink - The link for the invitation
 */
export const sendInviteEmail = async (email, inviteLink) => {
  const data = {
    from: 'noreply@yourdomain.com',  // Sender's email address
    to: email,                       // Recipient's email address
    subject: 'Invitation to Join CogTechAI',
    text: `Please click the following link to sign up: ${inviteLink}`,
    html: `<p>Please click the following link to sign up:</p><a href="${inviteLink}">${inviteLink}</a>`,
  };

  try {
    const response = await mg.messages().send(data); // Sending the email
    console.log('Invitation email sent successfully:', response);
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw new Error('Failed to send email');
  }
};
