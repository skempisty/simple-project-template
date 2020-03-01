/**
 * @file api/horses.js
 */

// require npm packages
const puppeteer = require('puppeteer-extra');
const moment = require('moment');

// require files
const horsesUtil = require('../utils/horsesUtil');
const captchaUtil = require('../utils/captchaUtil');
const puppeteerUtil = require('../utils/puppeteerUtil');


exports.scrapeAllHorses = async (scrapeYear) => {
    console.log(`BEGIN GATHERING HORSES FOR ${scrapeYear}`);
    // report scrape start timestamp
    console.log(moment().format('MMM Do h:mm a'));

    const equibaseUrl = 'https://www.equibase.com/stats/View.cfm?tf=year&tb=horse';

    // Start puppeteer and create master browser object
    const browser = await puppeteer.launch();
    // TODO: uncomment below and comment above to watch puppeteer
    // const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // engage anti bot detection countermeasures
    await puppeteerUtil.preparePageForBotTests(page);

    await page.goto(equibaseUrl);

    /// solve captcha if found otherwise continue
    await captchaUtil.waitForSelectorOrCaptcha(page, 'table#data');

    await horsesUtil.selectScrapeYear(page, scrapeYear);

    // Get max pages
    const maxPages = await horsesUtil.getMaxPageNum(page);
    console.log(`${maxPages} pages to crawl`);

    let pageIndex = 1;
    let horsesAllScraped = false;

    while (!horsesAllScraped) {
        // grab horses from page
        const moreHorses = await horsesUtil.scrapeHorsesFromPage(page);

        if (pageIndex > 1) {
            // each page contains the last horse from the last page - remove that horse
            moreHorses.shift();
        }

        // upsert horses from page
        horsesUtil.upsertAll(moreHorses, pageIndex, scrapeYear);

        await puppeteerUtil.ensureExists(page, 'div#Pagination ul a:last-child');

        try {
            // click next page btn
            await page.click('div#Pagination ul a:last-child');
            // wait for next page number to be red
            await page.waitForXPath(`//div[@id='Pagination']/ul//span[@style="color:red" and text()=${pageIndex}]`, { timeout: 10000 });

            pageIndex++;
        } catch (error) {
            console.log('DONE GATHERING HORSES');
            // report end of scrape timestamp
            console.log(moment().format('MMM Do h:mm a'));
            horsesAllScraped = true;
        }
    }

    browser.close();
};
