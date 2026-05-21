
/*
const uid = 'DDy2oZjpTUSVBLIVAPE7XnwBxJ52'; // Replace with the UID of the user you want to authenticate
const uidAuthTest = 'w1BExPKXsLPn9VBXxLp9XSaFg6a2';
const customToken = await admin.auth().createCustomToken(uidAuthTest);
// Exchange the custom token for an ID token
const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.COOKIETRACK_FIREBASE_API_KEY}`, {
  token: customToken,
  returnSecureToken: true
});
console.log('Bearer Token:', response.data.idToken);
*/


/* SENDING EMAILS USING A TEMPLATE, FOR NOTICATION
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const msg = {
  to: 'bchau1010@gmail.com', // Change to your recipient
  from: 'thinminttechies@gmail.com', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  templateId: 'd-6c004f0cbb694488add70968a428b647',
  dynamicTemplateData: {
    name: 'John',
    orderNumber: '123456',
    // Add more dynamic data as needed
  },
}
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })
*/