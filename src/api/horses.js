/**
 * @file api/horses.js
 */

// require npm packages
const puppeteer = require('puppeteer-extra');
const pluginStealth = require("puppeteer-extra-plugin-stealth");

// require files
const Horse = require('../models/Horse');
const horsesUtil = require('../utils/horsesUtil');
const captchaUtil = require('../utils/captchaUtil');

// add stealth plugin and use defaults (all evasion techniques)
puppeteer.use(pluginStealth());


exports.scrapeAllHorses = async () => {
    const equibaseUrl = 'https://www.equibase.com/stats/View.cfm?tf=year&tb=horse';

    // Start puppeteer and create master browser object
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(equibaseUrl);

    await captchaUtil.waitForSelectorOrCaptcha(page, 'table#data');

    return;

    let horses = [];
    const moreHorses = await horsesUtil.scrapeHorsesFromPage(page);
    horses = horses.concat(moreHorses);

    // Get max pages
    const maxPages = await horsesUtil.getMaxPageNum(page);

    let pageIndex = 2;
    while (pageIndex <= Number(maxPages)) {
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
    // TODO: UPSERT instead of straight up create
    // TODO: UPSERT after each page find instead of once at the end
    await Horse.create(horses);

    return horses;
};
