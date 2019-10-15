const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create schema for Race
const RaceSchema = new Schema({
    referenceNumber: {
        type: String,
        required: [true, 'The referenceNumber field is required']
    },
    trackName: {
        type: String,
        required: [true, 'The trackName is required']
    },
    date: {
        type: String,
        required: [true, 'The date is required']
    },
    raceNumber: {
        type: String,
        required: [true, 'The raceNumber is required']
    },
    raceType: {
        type: String
    },
    finishPlace: {
        type: String
    },
    speedFigure: {
        type: String
    }
});

//create model for title
const Race = mongoose.model('Race', RaceSchema, 'races');

module.exports = Race;
