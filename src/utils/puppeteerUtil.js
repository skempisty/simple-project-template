exports.ensureExists = async (page, selector) => {
    const element = await page.$(selector);
    if (!element) {
        await page.waitForSelector(selector, { timeout: 60000 });
    }
};
