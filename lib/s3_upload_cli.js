
require('dotenv').config()
console.log('env', process.env)
const AWS = require('aws-sdk')

const s3 = new AWS.S3()

// console.log(s3)

const uploadParams = {
  Bucket: 'achromanull-img-upload',
  Key: 'filename.txt',
  Body: 'Hello, world!'
}

s3.upload(uploadParams, function (err, data) {
  console.log(err, data)
})
