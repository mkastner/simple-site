const { body } = require('express-validator');

module.exports = [
  body('givenName').notEmpty().withMessage('Vorname muss angegeben werden'), 
  body('familyName').notEmpty().withMessage('Nachname muss angegeben werden'), 
  body('phone').notEmpty().withMessage('Telefon muss angegeben werden'), 
  body('email').isEmail().withMessage('Keine gültige E-Mail-Adresse'), 
  body('message').notEmpty().withMessage('Nachricht muss angegeben werden'), 
  body('privacy').notEmpty().withMessage('Datenschutz muss bestätigt werden') 
]; 
