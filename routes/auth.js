const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const passport = require("passport");
require("jsonwebtoken");
const nJwt = require("njwt");
const keys = require("../config/keys");
const User = mongoose.model("users");
const bcrypt = require('bcrypt');

const passwordBcrypt = (pass) => {
    const claims = {
        sub: pass,
        iss: 'task-board',
        permissions: 'upload-photos'
    };
    const jwt = nJwt.create(claims, keys.tokenSecret);
    const token = jwt.compact();
    return token;
};
const createNewUser = (user) => {
    const token = passwordBcrypt(user._id);
    const dataUser = {};
    dataUser.name = user.name;
    dataUser.email = user.email;
    dataUser._id = user.id;
    dataUser.token = token;
    return dataUser;
};
router.get("/", function (req, res, next) {
    res.send('hello!');
    //res.render("index", {title: "Express"});
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
        const token = passwordBcrypt(req.user._id);
        res.status(200).redirect("https://tasktrecker-go-it.herokuapp.com?token=" + token);
    }
);

//AUTH LOCAL LOGIN
router.post(
    "/local/login",
    passport.authenticate('local', {
        failureFlash: true,
        failWithError: true,
    }),

    function (req, res) {
        console.log("Successful login, token created");
        const dataUser = createNewUser(req.user);
        return res.json({info: 'Successful logged in', dataUser});
    },
    function (err, req, res, next) {
        // Handle error
        return res.status(401).send({success: false, message: err});
    }
);


//LOCAL SIGN UP - REGISTRY
router.post('/register', (req, res) => {
    const status = 400;
    if (req.body.name.length < 1 || !req.body.name === "") {
        res.status(status).send({info: 'The name field is required! Please, write your name.'});
    }
    if (req.body.password.length < 4) {
        res.status(status).send({info: 'Password length should be more than 4 symbols'});
    }
    else {
        User.findOne({email: req.body.email})
            .then(user => {
                if (user) {
                    const dataUser = {};
                    dataUser.name = req.body.name;
                    dataUser.email = req.body.email;

                    res.status(400).send({info: 'User already exist, please logged in', dataUser});
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
                                .then(() => {
                                    const dataUser = createNewUser(newUser);
                                    res.status(200).send({info: 'Successful registration', dataUser});

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