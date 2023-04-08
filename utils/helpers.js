const { v4: uuidv4 } = require('uuid');
const passport = require("passport");

module.exports = {
    
    // Handles sending the response back to the client based on the response object
    handleResponse: function (responseContext, response) {
        if (response.error) {
            responseContext.status(response.error.statusCode || 500).send(response.error.data);
        }
        else {
            responseContext.send(response);
        }
    },

    // Creates an error object with the provided code, message, and details
    errorObject: function (code, message, details) {
        return {
            error: {
                statusCode: code,
                data: {
                    message: message,
                    details: details
                }
            }
        }
    },

    // Authenticates a WebSocket connection using Passport and a JWT strategy
    authenticateWebSocket: function (socket, next) {

        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if (err) {
                console.error(err);
                socket.send(JSON.stringify({ status: 401, msg: "Unauthorized" }));
                socket.disconnect();
                return;
            }
            if (!user) {
                console.log("Unauthorized");
                socket.send(JSON.stringify({ status: 401, msg: "Unauthorized" }));
                socket.disconnect();
                return;
            }
            socket.request.user = user;
            next();
        })(socket.request, null, next);

    }
}