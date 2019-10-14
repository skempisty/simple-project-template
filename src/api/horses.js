/**
 * @file api/horses.js
 */

// require npm packages
const puppeteer = require('puppeteer-extra');
const pluginStealth = require("puppeteer-extra-plugin-stealth");

// require files
const horsesUtil = require('../utils/horsesUtil');
const captchaUtil = require('../utils/captchaUtil');

// add stealth plugin and use defaults (all evasion techniques)
puppeteer.use(pluginStealth());


exports.scrapeAllHorses = async () => {
    console.log('LET\'S CRAWL SOME HORSES!');

    const equibaseUrl = 'https://www.equibase.com/stats/View.cfm?tf=year&tb=horse';

    // Start puppeteer and create master browser object
    const browser = await puppeteer.launch();
    // TODO: uncomment below and comment above to watch puppeteer
    // const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(equibaseUrl);

    /// solve captcha if found otherwise continue
    await captchaUtil.waitForSelectorOrCaptcha(page, 'table#data');

    // grab horses from 1st page
    const someHorses = await horsesUtil.scrapeHorsesFromPage(page);
    // upsert 1st page horses
    horsesUtil.upsertAll(someHorses, 1);

    // Get max pages
    const maxPages = await horsesUtil.getMaxPageNum(page);
    console.log(`${maxPages} pages to crawl`);

    let pageIndex = 2;
    while (pageIndex <= Number(maxPages)) {
        // click next page btn
        await page.click('div#Pagination ul a:last-child');
        // wait for next page number to be red
        await page.waitForXPath(`//div[@id='Pagination']/ul//span[@style="color:red" and text()=${pageIndex}]`, { timeout: 10000 });

        // grab horses from page
        const moreHorses = await horsesUtil.scrapeHorsesFromPage(page);
        // each page contains the last horse from the last page - remove that horse
        moreHorses.shift();

        // upsert horses from page
        horsesUtil.upsertAll(moreHorses, pageIndex);

        pageIndex++;
    }

    browser.close();
};
