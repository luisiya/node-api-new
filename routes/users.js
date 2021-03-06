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

router.get("/", (req, res) => {
    Users.find({})
        .then(users => {
            res.send(JSON.stringify(users));
        })
});
router.get('/me', (req, res) => {
    const token = parseBearerToken(req);

    if (token) {

        //VERIFY TOKEN
        const verifyToken = nJwt.verify(token, keys.tokenSecret);
        const userID = verifyToken.body.sub;
        Users.find({_id: userID})
            .then(user => {
                const dataUser = {};
                dataUser.name = user[0].name;
                dataUser.email = user[0].email;
                dataUser._id = user[0]._id;
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

//CHANGE INFO ABOUT USER
router.put("/:id", (req, res) => {
    const token = parseBearerToken(req);
    if (token) {
        const verifyToken = nJwt.verify(token, keys.tokenSecret);
        const userID = verifyToken.body.sub;
        const updateParams = req.body;

        const updateUser = () => {
            Users.findOneAndUpdate(
                {_id: req.params.id},
                updateParams,
                {new: true}
            )

                .then(user => {
                    console.log("CHECK EMAIL");
                    console.log(req.body.email);

                    const dataUser = {};
                    dataUser.name = user.name;
                    dataUser.email = user.email;
                    dataUser.id = user._id;
                    dataUser.date = user.date;
                    res.status(200).send({info: 'Successful updated', dataUser});

                })
        };
        if (req.body.email) {
            Users.find(
                {email: req.body.email})
                .then(users => {
                        if (users[0]._id == req.params.id) {
                            updateUser();
                        }
                        else {
                            res.status(400).send({info: `${req.body.email} - already exist, try again`});
                        }

                    }
                );
        }
        else {
            updateUser();
        }
    }
    else {
        return res.status(403).send({
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