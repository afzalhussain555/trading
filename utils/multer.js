const multer = require("multer");
const {v4: uuidv4} = require("uuid");
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname))
  },

})

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Only allow images
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  },
});

module.exports = {upload};