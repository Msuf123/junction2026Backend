
    
const puppeteer = require('puppeteer');

async function launchBrowser(numberOfScrapers = 1) {
    const browser = await puppeteer.launch({
        headless: true
    });

    const scrapers = [];

    for (let i = 0; i < numberOfScrapers; i++) {
        const context = await browser.createBrowserContext();
        const page = await context.newPage();

        scrapers.push({
            id: i + 1,
            context,
            page
        });
    }

    return {
        browser,
        scrapers,

        async close() {
            await browser.close();
        }
    };
}
