const tape = require('tape');
const contactMailer = require('../../../lib/mailer/contact');
const log = require('mk-log');

async function main() {

  tape('contact mailer', async (t) => {

    try {

      const contact = {
        givenName: 'Michael',
        familyName: 'Kastner'
      }; 

      const result = await contactMailer.sendContact(contact);

      log.info(result);

    } catch (err) {

      log.error(err);

    } finally {
      t.end();
    }

  });

}

main();
