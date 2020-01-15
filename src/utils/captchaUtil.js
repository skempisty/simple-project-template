const spawn = require("child_process").spawn;
const fs = require('fs');

exports.waitForSelectorOrCaptcha = async (page, WAITFORSELECTOR) => {
    let captchaIsSolved = false;

    while (!captchaIsSolved) {
        try {
            await page.waitForFunction((sel) => {
                return document.querySelectorAll(sel).length;
            }, { timeout: 20000 }, WAITFORSELECTOR + ', div.geetest_radar');

            const foundCaptcha = await page.$('div.geetest_radar');

            if (foundCaptcha) {
                // stopped by captcha
                console.log('Captcha detected! Solving...');
                await solveCaptcha(page);
                console.log('Captcha solved! Continuing...');

                // check for reset button
                await page.waitFor(2000);
                const resetBtn = await page.$('span.geetest_reset_tip_content');

                if (resetBtn) {
                    console.log('captcha network failure - reloading captcha..');
                    await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
                } else {
                    captchaIsSolved = true;
                }
            } else {
                captchaIsSolved = true;
            }
        } catch(err) {
            // didn't find either captcha or target - uh oh
            // console.error('Could not find either target element - reloading!');
            await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
        }
    }
};

solveCaptcha = async (page) => {
    // click element to initialize captcha
    await page.waitForSelector('div.geetest_radar', { timeout: 120000});
    await page.click('div.geetest_radar');

    await page.waitForSelector('.geetest_canvas_bg.geetest_absolute', { timeout: 120000});
    // Needs a 1 sec wait for canvas imgs to load fully
    await page.waitFor(1000);

    const keyData = await page.$eval('.geetest_canvas_slice.geetest_absolute', keyEl => keyEl.toDataURL("image/png"));
    const lockData = await page.$eval('.geetest_canvas_bg.geetest_absolute', keyEl => keyEl.toDataURL("image/png"));

    const keyBuffer = decodeBase64Image(keyData);
    const lockBuffer = decodeBase64Image(lockData);

    fs.writeFile("captcha_key.png", keyBuffer.data, () => {
        console.log('captcha_key.png written');
    });
    fs.writeFile("captcha_lock.png", lockBuffer.data, () => {
        console.log('captcha_lock.png written');
    });

    const childProcess = spawn('./scripts/solve_geetest_captcha.sh');

    childProcess.stdout.pipe(process.stdout);

    let captchaSolution = null;
    childProcess.stdout.on('data',function(chunk) {
        captchaSolution = chunk.toString();
    });

    // wait for captcha solution to come back from solver.py
    while (!captchaSolution) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const sliderHandleEl = await page.$('.geetest_slider_button');
    let handle = await sliderHandleEl.boundingBox();

    // move mouse to center of slider handle
    await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
    // start mouse drag
    await page.mouse.down();
    // move captchaSolution distance
    // await page.mouse.move(handle.x + handle.width / 2 + Number(captchaSolution), handle.y + handle.height / 2, { steps: 100 });
    // wiggle right a bit to simulate overshoot
    await page.mouse.move(handle.x + handle.width / 2 + Number(captchaSolution) + 15, handle.y + handle.height / 2, { steps: 50 });
    // overshoot left a bit
    handle = await sliderHandleEl.boundingBox();
    await page.mouse.move(handle.x + handle.width / 2 - 35, handle.y + handle.height / 2, { steps: 60 });
    // get back to solution distance but slightly off to not be exact
    handle = await sliderHandleEl.boundingBox();
    await page.mouse.move(handle.x + handle.width / 2 + 21, handle.y + handle.height / 2, { steps: 80 });
    // wait some time before releasing to seem less automated
    await page.waitFor(1217);
    // release mouse drag
    await page.mouse.up();
};

decodeBase64Image = (dataString) => {
    const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer.from(matches[2], 'base64');

    return response;
};
