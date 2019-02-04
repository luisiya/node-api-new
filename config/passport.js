const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const keys = require("./keys");
const User = mongoose.model('users');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

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
        }),
    );


//---------------------------local login----------------------------------------



    //AUTH LOCAL LOGIN
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            failureFlash: true,
            session: false
        }, (email, password, done) => {
            console.log("Started auth");
            User.findOne({'email': email}, function (err, user) {

                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done('User does not exist, please registry!');
                }
                if (!user.password) {
                    return done('User already exist, please login with Google!');
                }
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        const success = "User login successful1";
                        return done(null, user, success);
                    } else {

                        return done( "Password is not correct! Please, try again!");
                    }
                });
            });
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((user, done) => {
        done(null, user);
    });
};


