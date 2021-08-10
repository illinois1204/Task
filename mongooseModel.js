const mongoose = require('mongoose');

const userScheme = new mongoose.Schema(
    {
        first_name: {
            type: String,
            required: true
        },
        surname: {
            type: String,
            required: true
        },
        phone:{
            type: String,
            required: true,
            unique: true,
            match: [/^\d{11}\b/, 'Invalid phone-number.']
        },
        password: {
            type: String,
            required: true
        }
    },
    {versionKey: false}
);

module.exports = mongoose.model("users", userScheme);