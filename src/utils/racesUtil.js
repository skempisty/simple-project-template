const cheerio = require('cheerio');

const Race = require('../models/Race');
const Horse = require('../models/Horse');
const puppeteerUtil = require('./puppeteerUtil');

exports.scrapeRacesFromPage = async (page) => {
    let scrapeSuccess = false;
    const races = [];

    while (!scrapeSuccess) {
        try {
            await puppeteerUtil.ensureExists(page, 'a#Hresults');

            await page.evaluate(() => document.querySelector('a#Hresults').click());

            await puppeteerUtil.ensureExists(page, 'table.results');

            let html = await page.content();

            let $ = cheerio.load(html);

            $('table.results tbody tr').each(function() {
                races.push({
                    trackName: $(this).find('td.track a').text(),
                    date: $(this).find('td.date').text(),
                    raceNumber: $(this).find('td.race').text().trim(),
                    raceType: $(this).find('td.type a').text(),
                    finishPlace: $(this).find('td.finish').text(),
                    speedFigure: $(this).find('td.speedFigure').text(),
                    lastUpdatedAt: Date.now()
                });
            });

            scrapeSuccess = true;

        } catch (error) {
            console.log('races scrape failed - retrying..');

            await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
        }
    }

    return races;
};

exports.upsertAll = (racesArray) => {

    const promiseArray = [];

    for (let i=0; i<racesArray.length; i++) {
        const query = {
            'referenceNumber': racesArray[i].referenceNumber,
            'trackName': racesArray[i].trackName,
            'date': racesArray[i].date,
            'raceNumber': racesArray[i].raceNumber,
        };

        const promise = new Promise((resolve, reject) => {
            Race.updateOne(query, racesArray[i], { upsert: true, setDefaultsOnInsert: true }, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
        promiseArray.push(promise);
    }

    Promise.all(promiseArray).then(() => {
        // update lastUpdated value for horse
        Horse.updateOne({ referenceNumber: racesArray[0].referenceNumber }, { lastTimeRaceScraped: Date.now() }, () => {});
    }).catch((err) => {
        console.error(err);
    });
};
