const express = require('express');
const router = express.Router();
const log = require('mk-log');
const path = require('path');
const fs = require('fs-extra');
const siteName = process.env.SIMPLESITE_NAME; 
const contactMailer = require('../mailer/contact');
const { validationResult } = require('express-validator');
const contactFormValidation = require('../utils/contact-form-validation');
const menu = JSON.parse(
  fs.readFileSync(path.resolve(`custom/${siteName}/src/index-menu.json`), 'utf8'));

router.route('/')
  .get((req, res) => {
    res.render('forms/contact', {menu});
  })
  .post(contactFormValidation, async (req, res) => {
    try {
      log.info('req.body', req.body);
      const { errors } = validationResult(req);
      log.info('validation errors', errors);
      if (errors.length) {
        return res.render('forms/contact', { form: req.body, menu, reqPath: req.path, errors });
      }

      const result = await contactMailer.sendContact(req.body); 
      res.render('forms/success', { form: req.data, menu, reqPath: req.path, result} );
    } catch (err) {
      res.status(500).send(err); 
    }
  });

module.exports = router;
