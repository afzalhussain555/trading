# Trading Web Socket



Node.js Backend Server with MySQL and Sequelize
This is a Node.js server that uses MySQL database with Sequelize ORM. The server provides a REST API for user authentication and profile management, as well as a WebSocket client that connects to a data source and forwards data to the frontend.

Features
User registration and login using JWT
User profile management (update profile)

Express.js for REST API and WebSocket server


## Setup and Working
Clone the repository:

Install dependencies:
```bash
npm install
```
### Create database named "trading"

Start the server:
```bash
npm start
```
The server will start at http://localhost:4000.

## API Documentation
User Authentication
Register a new user

* POST /auth/register

Create a new user with the given name, email, phone, password, and image. Returns the ID of the created user.

Login as a user

* POST /auth/login


Log in as a user with the given email and password. Returns a JWT token with 1-day validity and the user ID.

Profile Management

Update the user's profile

* PUT /profile

*Update the user's profile information, including name, email, phone, and image.

Authorization (required): JWT token obtained from logging in



## WebSocket Client
The WebSocket client connects to a data source and forwards data to the frontend. The data source is a random data generator that mimics the behaviour of the stock market.

Connect to the WebSocket server and listen for the "dashboard" event.

Only authenticated user can listen to the socket.

