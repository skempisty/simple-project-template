const cheerio = require('cheerio');

const Race = require('../models/Race');
const puppeteerUtil = require('./puppeteerUtil');

exports.scrapeRacesFromPage = async (page) => {

    await puppeteerUtil.ensureExists(page, 'a#Hresults');

    await page.click('a#Hresults');

    await puppeteerUtil.ensureExists(page, 'table.results');

    let html = await page.content();

    let $ = cheerio.load(html);
    const races = [];

    $('table.results tbody tr').each(function() {
        races.push({
            trackName: $(this).find('td.track a').text(),
            date: $(this).find('td.date').text(),
            raceNumber: $(this).find('td.race').text().trim(),
            raceType: $(this).find('td.type a').text(),
            finishPlace: $(this).find('td.finish').text(),
            speedFigure: $(this).find('td.speedFigure').text()
        });
    });

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
            Race.findOneAndUpdate(query, racesArray[i], { upsert: true }, (err) => {
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
        console.log(`races upsert complete..`);
    }).catch((err) => {
        console.error(err);
    });
};
