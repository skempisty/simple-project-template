/**
 * @file api/horses.js
 */

// require npm packages
const puppeteer = require('puppeteer-extra');
const pluginStealth = require("puppeteer-extra-plugin-stealth");

// require files
const horsesUtil = require('../utils/horsesUtil');
const captchaUtil = require('../utils/captchaUtil');
const puppeteerUtil = require('../utils/puppeteerUtil');

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

    // Get max pages
    const maxPages = await horsesUtil.getMaxPageNum(page);
    console.log(`${maxPages} pages to crawl`);

    let pageIndex = 1;
    while (pageIndex <= Number(maxPages)) {
        // grab horses from page
        const moreHorses = await horsesUtil.scrapeHorsesFromPage(page);

        if (pageIndex > 1) {
            // each page contains the last horse from the last page - remove that horse
            moreHorses.shift();
        }

        // upsert horses from page
        horsesUtil.upsertAll(moreHorses, pageIndex);

        if (pageIndex < maxPages) {
            await puppeteerUtil.ensureExists(page, 'div#Pagination ul a:last-child');

            // click next page btn
            await page.click('div#Pagination ul a:last-child');
            // wait for next page number to be red
            await page.waitForXPath(`//div[@id='Pagination']/ul//span[@style="color:red" and text()=${pageIndex}]`, { timeout: 10000 });
        }

        pageIndex++;
    }

    browser.close();
};
