const puppeteer = require('puppeteer'); // v23.0.0 or later
const fs = require('fs');
const path = require('path');

// Create evidence directory if it doesn't exist
const evidenceDir = path.join(__dirname, 'evidence');
if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir);
}

(async () => {
    console.log('Starting the test...');
    const browser = await puppeteer.launch({
        headless: false, // Make browser visible
        defaultViewport: null // Use full window size
    });
    console.log('Browser launched');
    
    const page = await browser.newPage();
    const timeout = 5000;
    page.setDefaultTimeout(timeout);

    // Enable console logging from the page
    page.on('console', msg => console.log('Page log:', msg.text()));

    {
        const targetPage = page;
        await targetPage.setViewport({
            width: 1512,
            height: 437
        })
    }
    console.log('Navigating to coffee-cart.app...');
    {
        const targetPage = page;
        await targetPage.goto('https://coffee-cart.app/');
        await targetPage.screenshot({ path: path.join(evidenceDir, '1-initial-page.png') });
    }

    // Function to capture evidence
    const captureEvidence = async (stepName) => {
        await page.screenshot({ path: path.join(evidenceDir, `${stepName}.png`) });
        try {
            const cartTotal = await page.$eval('::-p-text(Total: $)', el => el.textContent);
            console.log(`Cart total at ${stepName}:`, cartTotal);
            return cartTotal;
        } catch (error) {
            console.log(`Could not capture total at ${stepName}:`, error.message);
            return null;
        }
    };

    console.log('Adding items to cart...');
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
        await captureEvidence('2-after-first-item');
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

    // Before checkout
    const totalBeforeCheckout = await captureEvidence('3-before-checkout');
    console.log('Total before checkout:', totalBeforeCheckout);

    // Proceed to checkout
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

    // Fill out form
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
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Email)'),
            targetPage.locator('#email'),
            targetPage.locator('::-p-xpath(//*[@id=\\"email\\"])'),
            targetPage.locator(':scope >>> #email')
        ])
            .setTimeout(timeout)
            .fill('andy@integrichain.com');
    }

    // Capture checkout form
    await captureEvidence('4-checkout-form');

    // Submit order
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

    // Wait for success message and capture final state
    let orderSuccess = false;
    try {
        await page.waitForSelector('text=Thank you for your order!', { timeout: 10000 });
        orderSuccess = true;
        await captureEvidence('5-order-success');
    } catch (error) {
        console.log('Order success message not found:', error.message);
        await captureEvidence('5-order-failure');
        const html = await page.content();
        fs.writeFileSync(path.join(evidenceDir, '5-order-failure.html'), html);
    }

    // Save test results to a file
    const testResults = {
        timestamp: new Date().toISOString(),
        totalBeforeCheckout,
        orderDetails: {
            name: 'andy',
            email: 'andy@integrichain.com'
        },
        orderSuccess,
        screenshots: fs.readdirSync(evidenceDir)
    };

    fs.writeFileSync(
        path.join(evidenceDir, 'test-results.json'),
        JSON.stringify(testResults, null, 2)
    );

    console.log('Test completed successfully!');
    console.log('Evidence saved in:', evidenceDir);
    
    // Wait for 5 seconds before closing
    await new Promise(resolve => setTimeout(resolve, 5000));
    await browser.close();
    console.log('Browser closed');

})().catch(err => {
    console.error('Error occurred:', err);
    process.exit(1);
});
