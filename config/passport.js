const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const keys = require("./keys");
const User = mongoose.model('users');

module.exports = function (passport) {
    passport.use(
        new GoogleStrategy({
            clientID: keys.googleClientID,
            clientSecret: keys.googleClientSecret,
            callbackURL: "/auth/google/callback",
            proxy: true
        }, (accessToken, refreshToken, profile, done) => {
            const image = profile.photos[0].value.substring(0, profile.photos[0].value.indexOf('?'));
                const newUser = {
                googleID: profile.id,
                email: profile.emails[0].value,
                token: accessToken,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                image: image
            };

            //CHECK FOR EXISTING USER
            User.findOne({
                googleID: profile.id
            }).then(user => {
                if (user) {
                    //RETURN USER
                    done(null, user);
                }
                else {
                    //CREATE USER
                    new User(newUser)
                        .save()
                        .then(user => done(null, user));
                }
            })
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((user, done) => {
        done(null, user);
    });
};


