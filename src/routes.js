// require npm packages
const express = require ('express');
// require files
const api = require('./apiDispatcher');


const router = express.Router();

/**
 * Route to scrape all horse data available in the "North American Thoroughbred Racing Starters - Horse" table at https://www.equibase.com/stats/View.cfm?tf=year&tb=horse
 */
router.get('/horses/scrape', async (req, res) => {
    const scrapeYear = req.query.year;

    await api.horses.scrapeAllHorses(scrapeYear);

    res.send('done scraping horses!');
});

/**
 * Route to scrape all races from horses in horses collection by looping through all their referenceNumbers
 */
router.get('/races/scrape', async (req, res) => {
    const fromYear = req.query.horsesFromYear;
    const toYear = req.query.horsesToYear;

    const scrapedRaces = await api.races.scrapeAllRaces(fromYear, toYear);

    res.send(scrapedRaces);
});

/**
 * Route to scrape a specific horse's race data by referenceNumber
 */
router.get('/races/scrape/:referenceNumber', async (req, res) => {
    const referenceNumber = req.params.referenceNumber;

    const scrapedRaces = await api.races.scrapeRacesFromHorse(referenceNumber);

    res.send(scrapedRaces);
});

/**
 * Route to delete all duplicate races in the DB. Duplicate race consists of an equal finishing place, date, track,
 * and race number
 */
router.get('/races/deleteduplicates', async (req, res) => {
    await api.races.deleteDuplicates();
});

module.exports = router;
