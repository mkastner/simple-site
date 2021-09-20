const log = require('mk-log');
const path = require('path');
const nodeMailer = require('nodemailer');
const env = process.env.NODE_ENV || 'development';
const siteName = process.env.SIMPLESITE_NAME;
const loadedCustomConfig = require(`../../../custom/${siteName}/src/index-config.json`);
const mergeCustomConfigEnv = require('../lib/utils/merge-custom-config-env.js');

const customConfig = mergeCustomConfigEnv(loadedCustomConfig);

const transportOptions = require(`../../../config/env/${env}-mail`);

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
  });
}

module.exports = {
  async sendContact(contact) {
    try {
      const templatePath = path.resolve(
        path.join(`custom/${siteName}/views/mailer`, 'contact.txt.hbs')
      );
      log.info('contact', contact);
      const mailText = await renderHbs(templatePath, { contact });

      // setup email data with unicode symbols
      const mailOptions = {
        from: customConfig.mail.from,
        to: customConfig.mail.to,
        cc: `${contact.email}`,
        replyTo: `${contact.email}`,
        subject: customConfig.mail.subject,
        text: mailText,
      };

      log.info('transport', transport);
      log.info('mailOptions', mailOptions);

      await sendMail(transport, mailOptions);
    } catch (error) {
      log.error(error);
    }
  },
};
