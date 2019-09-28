/**
 * @file api/races.js
 */

// require npm packages
const puppeteer = require('puppeteer-extra');
const pluginStealth = require("puppeteer-extra-plugin-stealth");
const cheerio = require('cheerio');
// require files
const Race = require('../models/Race');
const racesUtil = require('../utils/racesUtil');

// add stealth plugin and use defaults (all evasion techniques)
puppeteer.use(pluginStealth());


exports.scrapeAllRaces = async () => {};

exports.scrapeRacesFromHorse = async (referenceNumber) => {
    const url = `https://www.equibase.com/profiles/Results.cfm?type=Horse&refno=${referenceNumber}&registry=T&rbt=TB`;

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);

    await page.waitFor(5000)
    await page.waitForSelector('a#Hresults', { timeout: 30000});
    await page.click('a#Hresults');
    await page.waitFor(2000)

    await page.waitForSelector('table.results', { timeout: 10000});

    let html = await page.content();

    let $ = cheerio.load(html);
    const races = [];

    $('table.results tbody tr').each(function() {
        races.push({
            referenceNumber: referenceNumber,
            trackName: $(this).find('td.track a').text(),
            date: $(this).find('td.date').text(),
            raceNumber: $(this).find('td.race').text(),
            raceType: $(this).find('td.type a').text(),
            finishPlace: $(this).find('td.finish').text(),
            speedFigure: $(this).find('td.speedFigure').text()
        });
    });

    // TODO: replace above with below
    // const races = await racesUtil.scrapeRacesFromHorse();

    browser.close();

    // upsert race data
    // await Race.create(races);

    return races;
};
