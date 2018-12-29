const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const passport = require("passport");
require("jsonwebtoken");
const nJwt = require("njwt");
const keys = require("../config/keys");
const User = mongoose.model("users");
const bcrypt = require('bcrypt');


router.get("/", function (req, res, next) {
    res.render("index", {title: "Express"});
});

//GET GOOGLE AUTHENTICATION
router.get(
    "/google",
    passport.authenticate("google", {scope: ["profile", "email"]})
);

router.get(
    "/google/callback",
    passport.authenticate("google", {failureRedirect: "/", session: false}),
    function (req, res) {
        const claims = {
            sub: req.user._id,
            iss: 'task-board',
            permissions: 'upload-photos'
        };
        const jwt = nJwt.create(claims, keys.tokenSecret);
        const token = jwt.compact();
        res.redirect("http://localhost:3000?token=" + token);
    }
);


//AUTH LOCAL LOGIN
router.post(
    "/local/login",
    passport.authenticate('local', {
        failureFlash: true,
    }),
    function (req, res) {
        const user = req.user;
        const claims = {
            sub: req.user._id,
            iss: 'task-board',
            permissions: 'upload-photos'
        };
        const jwt = nJwt.create(claims, keys.tokenSecret);
        const token = jwt.compact();
        console.log("Successful login, token created");
        res.send(token);
    });


//LOCAL SIGN UP - REGISTRY
router.post('/register', (req, res) => {
const status = 400;
    if (req.body.password != req.body.password2) {
        res.status(status).send({info: 'Two passwords are not match'});
    }
    if (req.body.password.length < 4) {
        res.status(status).send({info: 'Passsword length should be more than 4 symbols'});
    }
     else {
        User.findOne({email: req.body.email})
            .then(user => {
                if (user) {
                    console.log(user)
                    res.status(status).send({info: 'User already exists! Please login'});
                }
                else {
                    const newUser = new User({
                        name: req.body.name,
                        email: req.body.email,
                        password: req.body.password
                    });
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            newUser.save()
                                .then(user => {
                                    res.status(200).send({info: 'Successful registration', user});
                                })
                                .catch(err => {
                                    console.log(err);
                                    return err;
                                })
                        });
                    });
                }
            });
    }
});


//LOGOUT
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect("/");
});

module.exports = router;