const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create schema for Horse
const HorseSchema = new Schema({
    name: {
        type: String,
        required: [true, 'The name field is required']
    },
    winPct: {
        type: String,
        required: [true, 'The winPct is required']
    }
});

//create model for title
const Horse = mongoose.model('Horse', HorseSchema, 'playground');

module.exports = Horse;
