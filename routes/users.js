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
const config = require('../config/passport.js');
// const cors = require('cors');



router.get("/", (req, res) => {
    Users.find({})
        .then(users => {
            res.send(JSON.stringify(users));
        })
});
router.get('/me',  (req, res) => {
  console.log(req)
    const token = parseBearerToken(req);
    console.log(token)

    if (token) {

        //VERIFY TOKEN
        const verifyToken = nJwt.verify(token, keys.tokenSecret);
        const userID = verifyToken.body.sub;
        Users.find({_id: userID})
            .then(user => {
                const dataUser = {};
                dataUser.name = user[0].name;
                dataUser.email = user[0].email;
                dataUser.id = user[0]._id;
                res.status(200).send({info: 'Successful get info', dataUser});

            })
    } else {
        // IF THERE IS NO TOKEN
        return res.status(404).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

router.get("/:id", (req, res) => {
    Users.findOne({
        _id: req.params.id
    })
        .then(user => {
            res.status(200).send({info: 'Successful get info', user});
        })
});


//DELETE
router.delete("/", (req, res) => {
    res.status(403).send({info: 'Invalid message / NO permission to delete user'});
    });

module.exports = router;