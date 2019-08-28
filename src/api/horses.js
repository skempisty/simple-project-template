/**
 * @file api/horsesUtil.js
 */

// require npm packages
const puppeteer = require('puppeteer-extra');
const pluginStealth = require("puppeteer-extra-plugin-stealth");
// require files
const Horse = require('../models/Horse');
const horsesUtil = require('../utils/horsesUtil');

// add stealth plugin and use defaults (all evasion techniques)
puppeteer.use(pluginStealth());

/**
 * value = object(username, email, password, user_agent (ua), type, rermote_ip (rip), fname, lname)
 */
exports.scrapeHorses = async () => {
    const url = 'https://www.equibase.com/stats/View.cfm?tf=year&tb=horse';

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);

    let horses = [];
    const moreHorses = await horsesUtil.scrapeHorsesFromPage(page);
    horses = horses.concat(moreHorses);

    let pageIndex = 2;
    while (pageIndex < 3) {
        // click next page btn
        await page.click('div#Pagination ul a:last-child');
        // wait for next page number to be red
        await page.waitForXPath(`//div[@id='Pagination']/ul//span[@style="color:red" and text()=${pageIndex}]`, { timeout: 10000 });

        const moreHorses = await horsesUtil.scrapeHorsesFromPage(page);
        // each page contains the last horse from the last page - remove that horse
        moreHorses.shift();
        horses = horses.concat(moreHorses);

        pageIndex++;
    }
    browser.close();

    // put horse data model into mongo
    await Horse.create(horses);

    return horses;
};
