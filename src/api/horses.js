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

    while (pageIndex <= maxPages) {
        // grab horses from page
        const moreHorses = await horsesUtil.scrapeHorsesFromPage(page);

        if (pageIndex > 1) {
            // each page contains the last horse from the last page - remove that horse
            moreHorses.shift();
        }

        // upsert horses from page
        horsesUtil.upsertAll(moreHorses, pageIndex, scrapeYear);

        if (pageIndex < maxPages) {
            await puppeteerUtil.ensureExists(page, 'div#Pagination ul a:last-child');

            let pageNavigated = false;

            while (!pageNavigated) {
                try {
                    /**
                     * 'app' seems to be an exposed page controller on the global scope for the equibase horses table.
                     * We can use the pageNav method to navigate pages instead of having Chromium click the 'next page'
                     * button. Using this method allows us to skip broken horses table pages since clicking the 'next
                     * page' button does not work when the horses table encounters a broken page.
                     */
                    await page.evaluate((pageIndex) => {
                        app.events.pageNav(pageIndex + 1);
                    }, pageIndex);
                } catch (error) {
                    /**
                     * do nothing. app.events.pageNav() throws an error in browser that causes page.evalute to throw
                     * an error. This must be handled or the app crashes.
                     */
                }

                try {
                    // wait for next page number to be red
                    await page.waitForXPath(`//div[@id='Pagination']/ul//span[@style="color:red" and text()=${pageIndex + 1}]`, { timeout: 10000 });

                    pageNavigated = true;
                } catch (error) {
                    /**
                     * equibase horses table is bugged in rare spots. Some pages of the horses table simply do not load
                     * and the page hangs. Catching an error from the try block skips the broken table page.
                     */
                    console.log("skipping page");
                }

                pageIndex++;
            }
        } else {
            pageIndex++;
        }
    }

    console.log('DONE GATHERING HORSES');
    // report end of scrape timestamp
    console.log(moment().format('MMM Do h:mm a'));

    browser.close();
};
