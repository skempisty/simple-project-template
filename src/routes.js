// require npm packages
const express = require ('express');
const router = express.Router();
// require files
const api = require('./apiDirector');

router.get('/crawlhorses', async (req, res) => {
    const scrapedHorses = await api.horses.scrapeHorses();

    res.send(scrapedHorses);
});

module.exports = router;
