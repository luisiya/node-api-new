const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//CREATE SCHEMA
const TaskSchema = new Schema({
    user: {
        type:Schema.Types.ObjectId,
        ref:'users',
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    color: {
        type: String
            },
    deadline: {
        type: Date
    },
    completed: {
        type: Boolean,
        default: false
    },
    reminderShowed:{
        type: Boolean,
        default: false
    },
    reminder: {
        type: Date
    }
}, {
    timestamps: {
        createdAt: 'createdDate',
        updatedAt: 'modifiedDate'
    }
});

mongoose.model("tasks", TaskSchema);