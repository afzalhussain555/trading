const { User } = require("../model/user");
const { errorObject } = require('../utils/helpers');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid')

// Function to register user 
const register = async function ({ name, phone, password, email, imageFile } = {}) {
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return errorObject(400, "user Already Exist", null)
        }

        // Create a new user object
        const user = await User.create({
            id: uuidv4(),
            email,
            name,
            phone,
            image: imageFile.path,
            password: bcrypt.hashSync(password, 10)
        });

        // Create a JWT token for the user
        const token = jwt.sign({ email: user.email, name: user.name, phone: user.phone }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Return the user and token as response
        return {token};

    }
    catch (error) {
        console.log(error);
        return errorObject(500, "Unable to Create User Profile", error)
    }
}

// Function to login user 
const login = async function ({  password, email } = {}) {
    try {

        // Check if user exists
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return errorObject(500, "User not found", error)
        }

        // Check if password is correct
        const passwordMatches = bcrypt.compareSync(password, user.password);
        if (!passwordMatches) {
            return errorObject(500, "Incorrect password", error);
        }

        // Create a JWT token for the user
        const token = jwt.sign({ id: user.id, email: user.email, name: user.name, phone: user.phone }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Return the user and token as response
        return { token };
    } catch (error) {
        console.error('Internal server error: ', error);
        return errorObject(500, "Internal server error", error);
    }
}


module.exports = { register, login };