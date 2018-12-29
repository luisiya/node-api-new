const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

//CREATE SCHEMA
const UserSchema = new Schema({

    password: {
        type: String
    },

    googleID: {
        type: String
    },
    firstName: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    lastName: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String
    },

});
UserSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

UserSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};
mongoose.model("users", UserSchema);