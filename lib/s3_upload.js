
require('dotenv').config()

const AWS = require('aws-sdk')
const s3 = new AWS.S3()

module.exports = function (file) {
  const uploadParams = {
    Bucket: 'achromanull-img-upload',
    // Key: +new Date() + '_' + file.originalname,
    Key: Date.now() + '_' + file.originalname,
    Body: file.buffer,
    ACL: 'public-read',
    ContentType: file.mimetype
  }

  return s3.upload(uploadParams).promise()
}
