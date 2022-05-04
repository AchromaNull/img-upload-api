const express = require('express')
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage })
const Upload = require('../models/upload')
const router = express.Router()
const s3Upload = require('../../lib/s3_upload')
const passport = require('passport')
const requireToken = passport.authenticate('bearer', { session: false })

// router.post('/testupload', (req, res, next) => {
//   console.log(req.user)
// })

router.post('/uploads', requireToken, upload.single('upload'), (req, res, next) => {
  console.log(req.user)
  // console.log('req.file', req)
  // req.upload.owner = req.user._id
  // follow this pattern vv and add user to file? or include in body from the request
  // will need to require token

  s3Upload(req.file)
    .then(awsFile => {
      // console.log(req)
      // this is the post to Mongo
      return Upload.create({ url: awsFile.Location, owner: req.user._id })
    })
  // req.body => { upload: url: 'www.google.com}
    .then(uploadDoc => {
      res.status(201).json({ upload: uploadDoc })
    })
    .catch(next)
})

module.exports = router
