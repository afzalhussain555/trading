const { User } = require("../model/user");
const { errorObject, handleResponse } = require('../utils/helpers');
const bcrypt = require('bcrypt');

// Function to update user profile
const updateProfile = async function ({ id, name, phone, password, email, image } = {}) {
    try {
        // Find the user with the given ID
        const user = await User.findOne({ where: { id: id } });
        
        // If user is not found, return error object
        if (!user) {
            return errorObject(404,"User profile not found",null)
        }

        // Update user profile with new information
        User.update({
            email,
            name,
            phone,
            password: bcrypt.hashSync(password, 10),// Hash new password
            image: image ? image.path : user.image // If new image is provided, use it, otherwise use existing image
        },
            {
                where: { id:id }

            })
        return { message: "User Profile Updated" };

    }
    catch (error) {
        console.log(error);
        return errorObject(500,"Unable to Update User Profile", error)
    }
}

module.exports = { updateProfile };