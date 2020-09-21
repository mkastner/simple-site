const log = require('mk-log');
const path = require('path');
const nodeMailer = require('nodemailer');
const env = process.env.NODE_ENV || 'development'; 
const siteName = process.env.SIMPLESITE_NAME; 
const config = require(`../../../config/env/${env}-config`);
const customConfig = require(`../../../views/${siteName}/config.json`);
const transportOptions = config.mail.transportOptions;

const renderHbs = require('../handlebars');
const transport = nodeMailer.createTransport(transportOptions);

function sendMail(transport, mailOptions) {
  return new Promise((resolve, reject) => {
    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        log.error(error);
        reject(error); 
      }
      return resolve(info);
    });
  })
}

module.exports = {

  async sendContact(contact) {
    try {
      const templatePath = 
        path.resolve(path.join(`views/${siteName}/mailer`, 'contact.txt.hbs'));
      log.info('contact', contact); 
      const mailText = await renderHbs(templatePath, {contact});

      // setup email data with unicode symbols
      const mailOptions = {
        from: customConfig.mail.from,
        to: customConfig.mail.to,
        cc: `${contact.email}`,
        replyTo: `${contact.email}`, 
        subject: customConfig.subject,
        text: mailText
      };
   
      await sendMail(transport, mailOptions);
    
    } catch (error) {
      log.error(error);
    }
  }
};
