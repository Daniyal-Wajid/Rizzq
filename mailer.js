const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'daniyal.forms@gmail.com',
        pass: 'ggfy mnms lkuc fxlz'
    }
});

const sendMail = async (to, subject, text) => {
    const mailOptions = {
        from: 'daniyal.forms@gmail.com',
        to: to,
        subject: subject,
        text: text
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendMail;
