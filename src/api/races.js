/**
 * @file api/races.js
 */

// require npm packages
const puppeteer = require('puppeteer-extra');
const pluginStealth = require("puppeteer-extra-plugin-stealth");

// require files
const racesUtil = require('../utils/racesUtil');
const captchaUtil = require('../utils/captchaUtil');

// add stealth plugin and use defaults (all evasion techniques)
puppeteer.use(pluginStealth());


exports.scrapeAllRaces = async () => {};

exports.scrapeRacesFromHorse = async (referenceNumber) => {
    console.log(`LET\'S CRAWL RACES FOR HORSE ${referenceNumber}!`);

    const equibaseUrl = `https://www.equibase.com/profiles/Results.cfm?type=Horse&refno=${referenceNumber}&registry=T&rbt=TB`;

    // Start puppeteer and create master browser object
    const browser = await puppeteer.launch();
    // TODO: uncomment below and comment above to watch puppeteer
    // const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(equibaseUrl);

    /// solve captcha if found otherwise continue
    await captchaUtil.waitForSelectorOrCaptcha(page, 'a#Hresults');

    const races = await racesUtil.scrapeRacesFromPage(page);
    // assign proper horse reference number to each race object
    races.forEach(race => race.referenceNumber = referenceNumber);

    browser.close();

    racesUtil.upsertAll(races);

    return races;
};
