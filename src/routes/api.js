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

    await page.waitForSelector('table#data', { timeout: 10000});

    const html = await page.content();

    const $ = cheerio.load(html);
    const horses = [];

    $('table#data tbody tr').each(function(i, elem) {
        horses.push({
            // name: $(this).children('td.horse a:first-child').text(),
            // winPct: $(this).children('td.winpct a:first-child').text()
            name: i,
            winPct: elem
        });
    });

    console.log("HORSES", horses);


    // const result = await page.evaluate(() => {
    //     //...
    // });

    // put horse data model into mongo
    // Horse.create(horses)
    //     .then(data => res.json(data))
    //     .catch();

    browser.close();

    res.send("OK");
});


// router.get('/todos', (req, res, next) => {
//
//     res.send("Hello World");
//
//     //this will return all the data, exposing only the id and action field to the client
//     Todo.find({}, 'action')
//         .then(data => res.json(data))
//         .catch(next)
// });

// router.post('/todos', (req, res, next) => {
//     if(req.body.action){
//         Todo.create(req.body)
//             .then(data => res.json(data))
//             .catch(next)
//     }else {
//         res.json({
//             error: "The input field is empty"
//         })
//     }
// });
//
// router.delete('/todos/:id', (req, res, next) => {
//     Todo.findOneAndDelete({"_id": req.params.id})
//         .then(data => res.json(data))
//         .catch(next)
// })

module.exports = router;
