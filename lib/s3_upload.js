
require('dotenv').config()

const AWS = require('aws-sdk')
const s3 = new AWS.S3()

module.exports = function (file) {
  const uploadParams = {
    Bucket: 'achromanull-img-upload',
    Key: file.originalname,
    Body: file.buffer
  }

  return s3.upload(uploadParams).promise()
}
