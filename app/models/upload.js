const mongoose = require('mongoose')

const uploadSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: false
    },
    caption: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Upload', uploadSchema)
