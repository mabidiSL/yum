const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: "bouda996@gmail.com",
    pass: "tjvx ahnc ygsd czly",
  },
});

module.exports = transport;