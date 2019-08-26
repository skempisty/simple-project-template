const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create schema for Race
const RaceSchema = new Schema({
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
const Race = mongoose.model('Race', RaceSchema, 'races');

module.exports = Race;
