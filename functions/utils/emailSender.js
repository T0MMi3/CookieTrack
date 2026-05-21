const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const hasValidSendGridKey =
  typeof process.env.SENDGRID_API_KEY === 'string' &&
  process.env.SENDGRID_API_KEY.startsWith('SG.');

if (hasValidSendGridKey) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SendGrid disabled: missing or invalid SENDGRID_API_KEY');
}

const sendEmail = async ({ to, subject, templateId, dynamicTemplateData, attachments, text }) => {
  if (!hasValidSendGridKey) {
    console.warn('Skipping email send: SendGrid is disabled');
    return { skipped: true };
  }

  const msg = {
    to,
    from: 'thinminttechies@gmail.com',
    subject,
    text,
    attachments,
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw error;
  }
};

module.exports = {
  sendEmail,
};