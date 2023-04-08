const express = require("express");
const router = express.Router();
const { handleResponse } = require('../utils/helpers');
const { register, login } = require('../controllers/authController');
const { upload } = require("../utils/multer");

// Route for user registration
router.post('/register', upload.single('image'), async (req, res) => {
    const { email, name, phone, password } = req.body;
    console.log(req.body);
    const imageFile = req.file;
    result = await register({email, name, phone, password, imageFile});
    handleResponse(res, result);
})

// Route for user login
router.post('/login', async (req, res) => {
    let { email, password } = req.body;
    result = await login({email, password});
    handleResponse(res, result);
})

module.exports = router;