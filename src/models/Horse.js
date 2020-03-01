const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create schema for Horse
const HorseSchema = new Schema({
    horseName: {
        type: String,
        required: true
    },
    referenceNumber: {
        type: String,
        required: true,
        unique: true
    },
    rank: {
        type: String,
        required: true
    },
    starts: {
        type: String,
        required: true
    },
    win: {
        type: String,
        required: true
    },
    place: {
        type: String,
        required: true
    },
    show: {
        type: String,
        required: true
    },
    earnings: {
        type: String,
        required: true
    },
    perStart: {
        type: String,
        required: true
    },
    winPercentage: {
        type: String,
        required: true
    },
    topThree: {
        type: String,
        required: true
    },
    topThreePercentage: {
        type: String,
        required: true
    },
    speedFigure: {
        type: String,
        required: true
    },
    racedInYears: {
        type: Array,
        default: []
    },
    createdAt: {
        type: Number,
        required: true,
        default: Date.now
    },
    lastUpdated: {
        type: Number,
        required: true,
        default: Date.now
    },
    lastTimeRaceScraped: {
        type: Number,
        required: true,
        default: 0
    }
});

//create model for title
const Horse = mongoose.model('Horse', HorseSchema, 'horses');

module.exports = Horse;
