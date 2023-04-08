const express = require("express");
const router = express.Router();
const { handleResponse } = require('../utils/helpers')
const { updateProfile } = require('../controllers/profileController');
const { upload } = require("../utils/multer");
const passport = require("../utils/passport");

// Update profile route, Only authenticated User.
router.put('/', passport.authenticate('jwt', { session: false }), upload.single('image'), async (req, res) => {
    const { name, phone, password, email } = req.body;
    const id = req.user.id;
    const image = req.file;
    result = await updateProfile({ id, name, phone, password, email, image });
    handleResponse(res, result);
});



module.exports = router;