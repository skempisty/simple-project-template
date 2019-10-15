const cheerio = require('cheerio');

const Horse = require('../models/Horse');
const puppeteerUtil = require('./puppeteerUtil');


exports.scrapeHorsesFromPage = async (page) => {

    await puppeteerUtil.ensureExists(page, 'table#data');

    const html = await page.content();

    const $ = cheerio.load(html);
    let moreHorses = [];

    $('table#data tbody tr').each(function() {
        // get horse referenceNumber from link
        const href = $(this).find('td.horse a:first-child').attr('href');
        const urlParams = new URLSearchParams(href);
        const refNum = urlParams.get('refno');

        moreHorses.push({
            horseName: $(this).find('td.horse a:first-child').text(),
            referenceNumber: refNum,
            rank: $(this).find('td.rank').text(),
            starts: $(this).find('td.starts').text(),
            win: $(this).find('td.win').text(),
            place: $(this).find('td.seconds').text(),
            show: $(this).find('td.thirds').text(),
            earnings: $(this).find('td.earnings').text(),
            perStart: $(this).find('td.eps').text(),
            winPercentage: $(this).find('td.winpct').text(),
            topThree: $(this).find('td.top3').text(),
            topThreePercentage: $(this).find('td.top3pct').text(),
            speedFigure: $(this).find('td.speed').text()
        });
    });

    return moreHorses;
};

exports.upsertAll = (horsesArray, pageNum) => {

    const promiseArray = [];

    for (let i=0; i<horsesArray.length; i++) {
        const query = { 'referenceNumber': horsesArray[i].referenceNumber };
        const promise = new Promise((resolve, reject) => {
            Horse.findOneAndUpdate(query, horsesArray[i], { upsert: true }, (err) => {
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
        console.log(`page ${String(pageNum)} upsert complete..`);
    }).catch((err) => {
        console.error(err);
    });
};

exports.getMaxPageNum = async (page) => {

    await puppeteerUtil.ensureExists(page, 'div#Pagination ul a');

    const html = await page.content();
    const $ = cheerio.load(html);

    const numAnchors = $('div#Pagination ul a').get().length;

    return $(`div#Pagination ul a:nth-child(${numAnchors})`).text();
};

exports.getAllHorseIdentifiers = async () => {
    try {
        return await Horse.find({}, 'referenceNumber horseName');
    } catch(err) {
        console.error(err);
    }
};
