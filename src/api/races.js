/**
 * @file api/races.js
 */

// require npm packages
const puppeteer = require('puppeteer-extra');
const moment = require('moment');

// require files
const racesUtil = require('../utils/racesUtil');
const horsesUtil = require('../utils/horsesUtil');
const captchaUtil = require('../utils/captchaUtil');
const puppeteerUtil = require('../utils/puppeteerUtil');


exports.scrapeAllRaces = async (fromYear, toYear) => {
    console.log(`BEGIN GATHERING RACES, ${fromYear} - ${toYear}`);
    // display scrape start datetime
    console.log(moment().format('MMM Do h:mm a'));

    // Start puppeteer and create master browser object
    const browser = await puppeteer.launch();
    // uncomment below and comment above to watch puppeteer
    // const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // engage anti bot detection countermeasures
    await puppeteerUtil.preparePageForBotTests(page);

    // get all horses names, referenceNumbers
    const horseIdentifiers = await horsesUtil.getHorseIdentifiers(fromYear, toYear);
    console.log(`Found ${horseIdentifiers.length} horses.. gulp`);

    for (let i=0; i<horseIdentifiers.length; i++) {
        const equibaseUrl = `https://www.equibase.com/profiles/Results.cfm?type=Horse&refno=${horseIdentifiers[i].referenceNumber}&registry=T&rbt=TB`;

        let pageNavigated = false;

        /**
        * page navigation fails on occasion due to bloated equibase website pages.
        * this retries page navigation until success to avoid stopping crawler
        */
        while (!pageNavigated) {
            try {
                await page.goto(equibaseUrl);

                pageNavigated = true;
            } catch (error) {
                console.error('page navigation failed - retrying..');
            }
        }

        /// solve captcha if found otherwise continue
        await captchaUtil.waitForSelectorOrCaptcha(page, 'a#Hresults');

        console.log(`${i+1}: Scraping races for ${horseIdentifiers[i].horseName}..`)
        const races = await racesUtil.scrapeRacesFromPage(page);
        // assign proper horse reference number to each race object
        races.forEach(race => race.referenceNumber = horseIdentifiers[i].referenceNumber);

        racesUtil.upsertAll(races);
    }

    return 'done with races';
};

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
