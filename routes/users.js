const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
require("../models/user.js");
const parseBearerToken = require("parse-bearer-token");
require("jsonwebtoken");
const nJwt = require("njwt");
const keys = require("../config/keys");
const Users = mongoose.model("users");
const passport = require('passport');

//LOAD USER MODEL
const User = mongoose.model("users");

router.get("/", (req, res) => {
    User.find({})
        .then(users => {
            res.send(JSON.stringify(users));
        })
});
router.get('/me', (req, res) => {
    const config = require('../config/passport.js');
    const token = parseBearerToken(req);
    if (token) {
        //VERIFY TOKEN
        const verifyToken = nJwt.verify(token, keys.tokenSecret);
        const userID = verifyToken.body.sub;
        Users.find({_id: userID})
            .then(user => {
                res.send(JSON.stringify(user));
            })
    } else {
        // IF THERE IS NO TOKEN
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

router.get("/:id", (req, res) => {
    User.findOne({
        _id: req.params.id
    })
        .then(user => {
            res.send(JSON.stringify(user));
        })
});

//LOCAL REGISTRATION
//



//DELETE
router.delete("/", (req, res) => {
    res.send("Invalid message or user does not have permission to delete user");
});

module.exports = router;