const express = require('express');
require('dotenv').config();
const { sequelize } = require('./model/user');
const { io } = require("socket.io-client");
const {authenticateWebSocket} = require("./utils/helpers");
const authRouter = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const passport = require("./utils/passport");
const app = express();
const http = require('http').Server(app);

// New instance of Socket.io server
const server_io = require('socket.io')(http);

// Set up middleware for parsing JSON and URL encoded request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Initialize Passport.js
app.use(passport.initialize());

// Routes Setup
app.use("/auth", authRouter);
app.use("/profile", profileRoutes);

// Connect to external event source using Socket.io client
const sourceSocket = io(process.env.EVENT_SOURCE);

//Whenever someone connects this gets executed
server_io.on('connection', function (socket) {
  console.log("New Connection");

  // Authenticate WebSocket connection
  authenticateWebSocket(socket, () => {

    // Listen for "disconnect" event from client and emit it
    sourceSocket.on('dashboard', (msg) => {
      socket.emit("dashboard", JSON.stringify(
        msg
      ));

    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
  })
});


// Connect to the database and start the server
const PORT = process.env.PORT || 4000;

sequelize
  .sync()
  .then(() => {
    http.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database: ', error);
  });
