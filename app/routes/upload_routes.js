const express = require('express')
const Upload = require('../models/upload')
const router = express.Router()

router.post('/uploads', (req, res, next) => {
  // req.body => { upload: url: 'www.google.com}
  Upload.create(req.body.upload)
    .then(upload => {
      res.status(201).json({ upload })
    })
    .catch(next)
})

module.exports = router
