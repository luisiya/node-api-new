const express = require('express');
const mongoose = require('mongoose');

//DECODED TOKEN
const parseBearerToken = require("parse-bearer-token");
require("jsonwebtoken");
const nJwt = require("njwt");
const keys = require("../config/keys");

const router = express.Router();
require("../models/tasks.js");

//LOAD USER MODEL
const Tasks = mongoose.model("tasks");

//GET ALL TASKS OF USER
router.get("/", (req, res) => {
    const token = parseBearerToken(req);
    if (token) {
        const verifyToken = nJwt.verify(token, keys.tokenSecret);
        const userID = verifyToken.body.sub;
        Tasks.find({
            user: userID
        })
            .then(tasks => {
                try {

                    res.send(tasks)
                }
                catch (error) {
                    res.status(404).send({info: 'No tasks'});
                }

            })
    }
    else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

//ADD TASK TO USER
router.post("/add", (req, res) => {
    const token = parseBearerToken(req);
    if (token) {
        const verifyToken = nJwt.verify(token, keys.tokenSecret);
        const userID = verifyToken.body.sub;
        const newTask = new Tasks({
            title: req.body.title,
            description: req.body.description,
            color: req.body.color,
            deadline: req.body.deadline,
            reminder: req.body.reminder,
            completed: req.body.completed,
            user: userID

        });
        new Tasks(newTask)
            .save()
            .then(tasks => {
                res.send(JSON.stringify(tasks))
            })
    }
    else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

//CHANGE ONE TASK FROM USER
router.put("/:id", (req, res) => {
    const token = parseBearerToken(req);
    if (token) {
        const verifyToken = nJwt.verify(token, keys.tokenSecret);
        const userID = verifyToken.body.sub;
        const updateParams = req.body;
        Tasks.findOneAndUpdate(
            {_id: req.params.id},
            updateParams,
            {new: true}
        )

            .then(tasks => {
                res.send(JSON.stringify(tasks));
            })
    }
    else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

//DELETE ONE TASK FROM USER
router.delete("/:id", (req, res) => {
    const token = parseBearerToken(req);
    if (token) {
        const verifyToken = nJwt.verify(token, keys.tokenSecret);
        const userID = verifyToken.body.sub;
        Tasks.findOneAndDelete({
                user: userID,
                _id: req.params.id
            }
        )

            .then(tasks => {
                res.send(JSON.stringify(tasks));
            })
    }
    else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

//DELETE ALL TASKS BY USERS
router.delete("/", (req, res) => {
    const token = parseBearerToken(req);
    if (token) {
        const verifyToken = nJwt.verify(token, keys.tokenSecret);
        const userID = verifyToken.body.sub;
        Tasks.find({
            user: userID,
        }).deleteMany()
            .then(tasks => {
                const task = JSON.stringify(tasks);
                res.status(200).send({info: 'This task already deleted', task})
            })
    }
    else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

module.exports = router;