const puppeteer = require('puppeteer'); // v23.0.0 or later

(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    const timeout = 5000;
    page.setDefaultTimeout(timeout);

    {
        const targetPage = page;
        await targetPage.setViewport({
            width: 1512,
            height: 437
        })
    }
    {
        const targetPage = page;
        await targetPage.goto('https://coffee-cart.app/');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Espresso)'),
            targetPage.locator("[data-test='Espresso']"),
            targetPage.locator('::-p-xpath(//*[@data-test=\\"Espresso\\"])'),
            targetPage.locator(":scope >>> [data-test='Espresso']")
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 188.40188598632812,
                y: 81.6452407836914,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Espresso Macchiato)'),
            targetPage.locator("[data-test='Espresso_Macchiato']"),
            targetPage.locator('::-p-xpath(//*[@data-test=\\"Espresso_Macchiato\\"])'),
            targetPage.locator(":scope >>> [data-test='Espresso_Macchiato']"),
            targetPage.locator('::-p-text(espressomilk)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 118.40185546875,
                y: 134.6452407836914,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Cappuccino)'),
            targetPage.locator("[data-test='Cappuccino']"),
            targetPage.locator('::-p-xpath(//*[@data-test=\\"Cappuccino\\"])'),
            targetPage.locator(":scope >>> [data-test='Cappuccino']")
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 48.40185546875,
                y: 149.6452407836914,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Yes, of course!)'),
            targetPage.locator('button.yes'),
            targetPage.locator('::-p-xpath(//*[@id=\\"app\\"]/div[2]/div[2]/button[1])'),
            targetPage.locator(':scope >>> button.yes'),
            targetPage.locator('::-p-text(Yes, of course!)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 90,
                y: 20.0859375,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Espresso Con Panna)'),
            targetPage.locator("[data-test='Espresso_Con\\ Panna']"),
            targetPage.locator('::-p-xpath(//*[@data-test=\\"Espresso_Con Panna\\"])'),
            targetPage.locator(":scope >>> [data-test='Espresso_Con\\ Panna']"),
            targetPage.locator('::-p-text(espressowhipped)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 82.40185546875,
                y: 70.36398315429688,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Proceed to checkout)'),
            targetPage.locator("[data-test='checkout']"),
            targetPage.locator('::-p-xpath(//*[@data-test=\\"checkout\\"])'),
            targetPage.locator(":scope >>> [data-test='checkout']"),
            targetPage.locator('::-p-text(Total: $59.00)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 23.1875,
                y: 5.796875,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Name)'),
            targetPage.locator('#name'),
            targetPage.locator('::-p-xpath(//*[@id=\\"name\\"])'),
            targetPage.locator(':scope >>> #name')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 113.015625,
                y: 18.90625,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Name)'),
            targetPage.locator('#name'),
            targetPage.locator('::-p-xpath(//*[@id=\\"name\\"])'),
            targetPage.locator(':scope >>> #name')
        ])
            .setTimeout(timeout)
            .fill('andy');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down('Tab');
    }
    {
        const targetPage = page;
        await targetPage.keyboard.up('Tab');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Email)'),
            targetPage.locator('#email'),
            targetPage.locator('::-p-xpath(//*[@id=\\"email\\"])'),
            targetPage.locator(':scope >>> #email')
        ])
            .setTimeout(timeout)
            .fill('andy@integrichain.com');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Promotion message)'),
            targetPage.locator('#promotion-label'),
            targetPage.locator('::-p-xpath(//*[@id=\\"promotion-label\\"])'),
            targetPage.locator(':scope >>> #promotion-label'),
            targetPage.locator('::-p-text(I would like)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 177,
                y: 6.515625,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Submit)'),
            targetPage.locator('#submit-payment'),
            targetPage.locator('::-p-xpath(//*[@id=\\"submit-payment\\"])'),
            targetPage.locator(':scope >>> #submit-payment'),
            targetPage.locator('::-p-text(Submit)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 14.3515625,
                y: 18.8203125,
              },
            });
    }

    await browser.close();

})().catch(err => {
    console.error(err);
    process.exit(1);
});
