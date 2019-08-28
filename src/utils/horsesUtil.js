const cheerio = require('cheerio');

exports.scrapeHorsesFromPage = async (page) => {
    await page.waitForSelector('table#data', { timeout: 10000});

    let html = await page.content();

    let $ = cheerio.load(html);
    let moreHorses = [];

    $('table#data tbody tr').each(function() {
        // get horse referenceNumber from link
        const href = $(this).find('td.horse a:first-child').attr('href');
        const urlParams = new URLSearchParams(href);
        const refNum = urlParams.get('refno');

        moreHorses.push({
            horseName: $(this).find('td.horse a:first-child').text(),
            referenceNumber: refNum,
            rank: $(this).find('td.rank').text(),
            starts: $(this).find('td.starts').text(),
            win: $(this).find('td.win').text(),
            place: $(this).find('td.seconds').text(),
            show: $(this).find('td.thirds').text(),
            earnings: $(this).find('td.earnings').text(),
            perStart: $(this).find('td.eps').text(),
            winPercentage: $(this).find('td.winpct').text(),
            topThree: $(this).find('td.top3').text(),
            topThreePercentage: $(this).find('td.top3pct').text(),
            speedFigure: $(this).find('td.speed').text()
        });
    });

    return moreHorses;
};
