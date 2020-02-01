const cheerio = require('cheerio');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

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
                    trackName: $(this).find('td.track a').text().trim(),
                    date: $(this).find('td.date').text().trim(),
                    raceNumber: $(this).find('td.race').text().trim(),
                    raceType: $(this).find('td.type a').text().trim() || $(this).find('td.type').text().trim(),
                    finishPlace: $(this).find('td.finish').text().trim(),
                    speedFigure: $(this).find('td.speedFigure').text().trim(),
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

exports.upsertAll = async (racesArray) => {

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

    await Promise.all(promiseArray);

    // update lastUpdated value for horse
    await Horse.updateOne({ referenceNumber: racesArray[0].referenceNumber }, { lastTimeRaceScraped: Date.now() }, () => {});
    await deleteDuplicates();
};

deleteDuplicates = async () => {
    // gather races that have matching properties
    const matchingSets = await Race.aggregate([
        {
            '$group': {
                '_id': {
                    // properties to match on
                    'date': '$date',
                    'raceNumber': '$raceNumber',
                    'trackName': '$trackName',
                    'finishPlace': '$finishPlace'
                },
                'uniqueIds': { '$addToSet': '$_id' },
                'count': { '$sum': 1 }
            }
        },
        {
            '$match': {
                'count': { '$gt': 1 }
            }
        }
    ]);

    if (matchingSets.length) {
        const matchingRecordCount = getMatchingRacesNum(matchingSets);
        console.log(`Race Duplicates Found - Removing ${matchingRecordCount} records`);

        matchingSets.forEach((doc) => {

            // convert id strings into mongo ObjectIds
            const objectIds = doc.uniqueIds.map(id => new ObjectId(id));

            // delete all races that
            Race.deleteMany({
                _id: { $in: objectIds }
            }, (err) => {
                if (err) { console.error("Error deleting matches:", err); }
            });
        });
    }
};

getMatchingRacesNum = (matchingSets) => {
    let count = 0;

    for (let i=0; i<matchingSets.length; i++) {
        count = count + matchingSets[i].uniqueIds.length;
    }

    return count;
};
