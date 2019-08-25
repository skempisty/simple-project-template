const express = require ('express');
const router = express.Router();
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const Horse = require('../models/horse');

// add stealth plugin and use defaults (all evasion techniques)
const pluginStealth = require("puppeteer-extra-plugin-stealth")
puppeteer.use(pluginStealth());

router.get('/pull', async (req, res) => {

    const url = 'https://www.equibase.com/stats/ViewAllTime.cfm?tf=all-time&tb=horse&vb=W';

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);

    // May need to bypass slider captcha
    // https://medium.com/@filipvitas/how-to-bypass-slider-captcha-with-js-and-puppeteer-cd5e28105e3c

    await page.waitForSelector('table#data', { timeout: 10000});

    const html = await page.content();

    const $ = cheerio.load(html);
    const horses = [];

    $('table#data tbody tr').each(function(i, elem) {
        horses.push({
            name: $(this).find('td.horse a:first-child').text(),
            winPct: $(this).find('td.winpct').text()
        });
    });

    console.log("HORSES", horses);

    // put horse data model into mongo
    // Horse.create(horses)
    //     .then(data => res.json(data))
    //     .catch();

    browser.close();

    res.send("OK");
});

module.exports = router;
