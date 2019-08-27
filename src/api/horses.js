/**
 * @file api/horses.js
 */

// require npm packages
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const pluginStealth = require("puppeteer-extra-plugin-stealth");
// require files
const Horse = require('../models/Horse');

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

    // get first page data
    await page.waitForSelector('table#data', { timeout: 10000});

    let html = await page.content();

    let $ = cheerio.load(html);
    let horses = [];

    $('table#data tbody tr').each(function() {
        horses.push({
            horseName: $(this).find('td.horse a:first-child').text(),
            winPercentage: $(this).find('td.winpct').text()
        });
    });

    console.log(horses[0]);

    // get second page data

    let index = 2;
    while (index < 3) {
        console.log("clicking second page");
        await page.click('div#Pagination ul a:last-child');

        // wait for next page number to be red
        await page.waitForXPath(`//div[@id='Pagination']/ul//span[@style="color:red" and text()=${index}]`, { timeout: 10000 });

        console.log("waiting on table");
        await page.waitForSelector('table#data', { timeout: 10000});

        html = await page.content();

        $ = cheerio.load(html);

        let moreHorses = [];

        console.log("scrape page 2");
        $('table#data tbody tr').each(function() {
            moreHorses.push({
                horseName: $(this).find('td.horse a:first-child').text(),
                winPercentage: $(this).find('td.winpct').text()
            });
        });

        console.log(moreHorses);
        moreHorses.shift();
        horses = horses.concat(moreHorses);

        index++;
    }

    // console.log("HORSES", horses);

    // put horse data model into mongo
    // await Horse.create(horses);

    browser.close();

    return horses;
};
