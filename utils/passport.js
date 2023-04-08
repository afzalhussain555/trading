const passport = require('passport');
const passportJWT = require('passport-jwt')
const { User } = require('../model/user');
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

module.exports = passport;