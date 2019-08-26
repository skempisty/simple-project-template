const express = require ('express');
const router = express.Router();
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const fetch = require('node-fetch');

const Horse = require('../models/Horse');

// add stealth plugin and use defaults (all evasion techniques)
const pluginStealth = require("puppeteer-extra-plugin-stealth")
puppeteer.use(pluginStealth());

router.get('/crawlhorses', async (req, res) => {

    // const url = 'https://www.equibase.com/Data.cfm/Stats/Horse/Year/Page?year=2019&page=3&sort=EARNINGS&dir=A&list=N&category=A&attribute_total=1024&set=full&race_breed_type=TB&_=1566757745074';
    const url = 'https://www.equibase.com/stats/View.cfm?tf=year&tb=horse';

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);

    // get first page data
    await page.waitForSelector('table#data', { timeout: 10000});

    let html = await page.content();

    let $ = cheerio.load(html);
    const horses = [];

    $('table#data tbody tr').each(function(i, elem) {
        horses.push({
            name: $(this).find('td.horse a:first-child').text(),
            winPct: $(this).find('td.winpct').text()
        });
    });

    console.log(horses[0]);

    // get second page data

    let index = 2;
    while (index < 3) {
        console.log("clicking second page");
        await page.click('div#Pagination ul a:last-child');

        // wait for next page number to be red

        await page.waitFor(5000);
        // await page.waitForXPath(`//div[@id='Pagination']/ul//span[@style="color:red" and text()=${index}]`, { timeout: 10000 });

        console.log("waiting on table");
        await page.waitForSelector('table#data', { timeout: 10000});

        html = await page.content();

        $ = cheerio.load(html);

        console.log("scrape page 2");
        $('table#data tbody tr').each(function(i, elem) {
            horses.push({
                name: $(this).find('td.horse a:first-child').text(),
                winPct: $(this).find('td.winpct').text()
            });
        });
        console.log(horses[horses.length - 1]);


        index++;
    }

    // console.log("HORSES", horses);

    // put horse data model into mongo
    // Horse.create(horses)
    //     .then(data => res.json(data))
    //     .catch();

    browser.close();

    res.send(horses);
});

module.exports = router;

// https://www.equibase.com/Data.cfm/Stats/Horse/Year/Page?year=2019&page=3&sort=EARNINGS&dir=A&list=N&category=A&attribute_total=1024&set=full&race_breed_type=TB&_=1566757745074
