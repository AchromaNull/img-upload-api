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
// route for signed in user to upload an image to AWS and create a database record
router.post('/uploads', requireToken, upload.single('upload'), (req, res, next) => {
  s3Upload(req.file, req.body)
    .then(awsFile => {
      // this is the post to Mongo
      return Upload.create({ url: awsFile.Location, owner: req.user._id, title: req.body.title, caption: req.body.caption })
    })
  // req.body => { upload: url: 'www.google.com}
    .then(uploadDoc => {
      res.status(201).json({ upload: uploadDoc })
    })
    .catch(next)
})
// get route to index signed-in user's images
router.get('/uploads', requireToken, (req, res, next) => {
  Upload.find({ owner: req.user.id })
    .then((uploads) => {
      return uploads.map((upload) => upload.toObject())
    })
    .then((uploads) => res.status(200).json(uploads))
    .catch(next)
})

// get route to ALL user's images as a signed-in user
// not functioning fully yet, need to revisit
// still returning all images when first signing in
router.get('/all-images', (req, res, next) => {
  Upload.find()
    .then((uploads) => {
      return uploads.map((upload) => upload.toObject())
    })
    .then((uploads) => res.status(200).json(uploads))
    .catch(next)
})

// delete route to delete an image from a signed in user
router.delete('/delete/:id', requireToken, (req, res, next) => {
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

router.patch('/uploads/:id', upload.none(), requireToken, (req, res, next) => {
  // get id of event from params
  const id = req.params.id
  // get event data from request
  const eventData = req.body.updateData
  // fetching event by its id
  Upload.findById(id)
  // handle 404 error if no event found
    .then(handle404)
    .then((event) => requireOwnership(req, event))
  // update event
    .then((event) => {
      // updating event object
      // // with eventData
      Object.assign(event, eventData)
      // save event to mongodb
      return event.save()
    })
  // if successful return 204
    .then(() => res.sendStatus(204))
  // on error go to next middleware
    .catch(next)
})
// patch route to update data for an image for a signed in user
// router.patch('/update/:id', requireToken, (req, res, next) => {
//   const imageId = req.params.id
//     .then(handle404)
//     .then(upload => {
//       // throw an error if current user doesn't own `example`
//       requireOwnership(req, upload)
//       return Upload.create({ url: awsFile.Location, owner: req.user._id, title: req.body.title, caption: req.body.caption })
//       return Upload.create({ title: req.body.title, caption: req.body.caption })
//       // removed , title: req.file.originalname from above
//     })
//   // req.body => { upload: url: 'www.google.com}
//     .then(uploadDoc => {
//       res.status(201).json({ upload: uploadDoc })
//     })
//     .catch(next)
// })

module.exports = router
