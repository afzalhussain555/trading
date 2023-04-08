const express = require('express');
require('dotenv').config();
const passport = require('passport');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const path = require('path');
const { User, sequelize } = require('./model/user');
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { io } = require("socket.io-client");

const app = express();
const http = require('http').Server(app);

const server_io = require('socket.io')(http);


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const PORT = process.env.PORT || 4000;

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
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  },
});



const passportJWT = require('passport-jwt');
const { Strategy: JWTStrategy, ExtractJwt } = passportJWT;


const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JWTStrategy(jwtOptions, (payload, done) => {
    User.findByPk(payload.id)
      .then((user) => {
        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      })
      .catch((error) => {
        console.log(error)
        done(error, false);
      });
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    console.log(err);
    done(err);
  }
});

app.use(passport.initialize());

app.post('/register', upload.single('image'), async (req, res) => {
  try {
    const { email, name, phone, password } = req.body;
    const imageFile = req.file;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
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
    return res.json({ token });
  } catch (error) {
    console.error('Error creating user: ', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if password is correct
    const passwordMatches = bcrypt.compareSync(password, user.password);
    if (!passwordMatches) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Create a JWT token for the user
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, phone: user.phone }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Return the user and token as response
    return res.json({ token });
  } catch (error) {
    console.error('Error logging in user: ', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

//update profile route
app.put('/updateProfile', passport.authenticate('jwt', { session: false }), upload.single('image'), async (req, res) => {
  try {
    const { name, phone, password, email } = req.body;

    const user = await User.findOne({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }

    User.update({
      email,
      name,
      phone,
      password: bcrypt.hashSync(password, 10),
      image: req.file ? req.file.path : user.image
    },
      {
        where: { id: req.user.id }

      })
    return res.status(200).json({ message: "User Profile Updated" });;

  }
  catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Unable to Update User Profile" });
  }
})

const sourceSocket = io(process.env.EVENT_SOURCE);

const authenticateWebSocket = (socket, next) => {

  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      console.error(err);
      socket.send(JSON.stringify({ status: 401, msg: "Unauthorized" }));
      socket.disconnect();
      return;
    }
    if (!user) {
      console.log("not authed");
      socket.send(JSON.stringify({ status: 401, msg: "Unauthorized" }));
      socket.disconnect();
      return;
    }
    socket.request.user = user;
    next();
  })(socket.request, null, next);

};





//Whenever someone connects this gets executed
server_io.on('connection', function (socket) {
  console.log("New Con");
  authenticateWebSocket(socket, () => {

    sourceSocket.on('dashboard', (msg) => {
      console.log("dahsboard");
      socket.send(JSON.stringify({
        status: 200,
        msg: "New Data",
        data: msg
      }));

    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
  })
});


// Connect to the database and start the server
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
