const express = require('express')
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage })
const Upload = require('../models/upload')
const router = express.Router()
const s3Upload = require('../../lib/s3_upload')
const passport = require('passport')
const requireToken = passport.authenticate('bearer', { session: false })
// const Example = require('../models/example')
const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const ObjectId = require('mongodb').ObjectId

// router.post('/testupload', (req, res, next) => {
//   console.log(req.user)
// })

router.post('/uploads', requireToken, upload.single('upload'), (req, res, next) => {
  // console.log(req.user)
  // req.upload.owner = req.user._id
  // follow this pattern vv and add user to file? or include in body from the request
  // will need to require token

  s3Upload(req.file, req.body)
    .then(awsFile => {
      // this is the post to Mongo
      return Upload.create({ url: awsFile.Location, owner: req.user._id, title: req.body.title, caption: req.body.caption })
      // removed , title: req.file.originalname from above
    })
  // req.body => { upload: url: 'www.google.com}
    .then(uploadDoc => {
      res.status(201).json({ upload: uploadDoc })
    })
    .catch(next)
})
router.get('/uploads', (req, res, next) => {
  Upload.find()
    .then((uploads) => {
      return uploads.map((upload) => upload.toObject())
    })
    .then((uploads) => res.status(200).json(uploads))
    .catch(next)
})

router.delete('/delete/:id', requireToken, (req, res, next) => {
  console.log(req.path)
  console.log(req.params)
  const imageId = req.params.id
  Upload.findById(imageId)
    .then(handle404)
    .then(upload => {
      // throw an error if current user doesn't own `example`
      requireOwnership(req, upload)
      // delete the example ONLY IF the above didn't throw
      upload.deleteOne({ _id: ObjectId(imageId) })
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

router.patch('/update/:id', requireToken, (req, res, next) => {
  const imageId = req.params.id
  // console.log(req.user)
  // upload.single('upload'),
  // req.upload.owner = req.user._id
  // follow this pattern vv and add user to file? or include in body from the request
  // will need to require token

  // s3Upload(req.file, req.body)
  //   .then(awsFile => {
  //     console.log(awsFile)
  //     console.log(req.file)
  //     // this is the post to Mongo
  Upload.findById(imageId)
    .then(handle404)
    .then(upload => {
      // throw an error if current user doesn't own `example`
      requireOwnership(req, upload)

      return Upload.create({ title: req.body.title, caption: req.body.caption })
      // removed , title: req.file.originalname from above
    })
  // req.body => { upload: url: 'www.google.com}
    .then(uploadDoc => {
      res.status(201).json({ upload: uploadDoc })
    })
    .catch(next)
})
// router.delete('/delete', requireToken, upload.single('upload'), (req, res, next) => {
//   console.log(req.user)
//   // console.log('req.file', req)
//   // req.upload.owner = req.user._id
//   // follow this pattern vv and add user to file? or include in body from the request
//   // will need to require token

//   s3Upload(req.file)
//     .then(awsFile => {
//       console.log('req.body', req.body)
//       // this is the post to Mongo
//       return Upload.create({ url: awsFile.Location, owner: req.user._id })
//     })
//   // req.body => { upload: url: 'www.google.com}
//     .then(uploadDoc => {
//       res.status(201).json({ upload: uploadDoc })
//     })
//     .catch(next)
// })

module.exports = router
