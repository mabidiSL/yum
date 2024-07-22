const AWS = require('aws-sdk');

const b2 = new AWS.S3({
  endpoint: 'https://s3.us-east-005.backblazeb2.com', // Update based on your bucket's region
  accessKeyId: '005b05d848797000000000004',
  secretAccessKey: 'K005Zql/R8fYxp8YOLW2eGRnbotoA9E',
  signatureVersion: 'v4',
});

module.exports = b2;
