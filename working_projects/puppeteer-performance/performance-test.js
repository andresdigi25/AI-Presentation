const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path');
const fs = require('fs');
const { performance } = require('perf_hooks');
const PerformanceHistory = require('./performance-history');

// Create results directory if it doesn't exist
const resultsDir = path.join(__dirname, 'performance-results');
if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
}

// Retry configuration
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function for retry logic
async function retry(fn, operationName, maxAttempts = RETRY_ATTEMPTS) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            console.log(`Attempt ${attempt}/${maxAttempts} failed for ${operationName}: ${error.message}`);
            if (attempt < maxAttempts) {
                await wait(RETRY_DELAY);
            }
        }
    }
    throw new Error(`All ${maxAttempts} attempts failed for ${operationName}. Last error: ${lastError.message}`);
}

// Worker thread code
if (!isMainThread) {
    const runTest = async () => {
        const startTime = performance.now();
        const puppeteer = require('puppeteer');
        let browser = null;
        let page = null;
        const logs = [];
        const screenshots = [];
        
        // Get mode from workerData or default to 'headless'
        const mode = workerData && workerData.mode ? workerData.mode : 'headless';
        const isHeadless = mode === 'headless';
        
        const log = (message) => {
            const timestamp = new Date().toISOString();
            logs.push(`${timestamp}: ${message}`);
            console.log(message);
        };

        const takeScreenshot = async (name) => {
            if (!page) {
                log(`Cannot take screenshot ${name}: page not initialized`);
                return;
            }
            try {
                const screenshot = await page.screenshot({ encoding: 'base64' });
                screenshots.push({ name, data: screenshot });
                log(`Screenshot taken: ${name}`);
            } catch (error) {
                log(`Failed to take screenshot ${name}: ${error.message}`);
            }
        };
        
        try {
            log('Launching browser...');
            browser = await puppeteer.launch({
                headless: isHeadless,
                defaultViewport: null
            });
            
            page = await browser.newPage();
            const timeout = 5000;
            page.setDefaultTimeout(timeout);

            // Enable console logging from the page
            page.on('console', msg => log(`Page log: ${msg.text()}`));
            page.on('pageerror', error => log(`Page error: ${error.message}`));

            // Record timing for each step
            const timings = {};

            // Navigate to the site
            log('Navigating to coffee-cart.app...');
            const navStart = performance.now();
            await retry(
                () => page.goto('https://coffee-cart.app/', { waitUntil: 'networkidle0' }),
                'navigation'
            );
            await takeScreenshot('navigation');
            timings.navigation = performance.now() - navStart;
            log(`Navigation completed in ${timings.navigation}ms`);

            // Add items to cart
            log('Adding items to cart...');
            const cartStart = performance.now();
            
            // Helper function to click with retry
            const clickWithRetry = async (selector, name) => {
                await retry(
                    async () => {
                        await page.waitForSelector(selector, { visible: true });
                        await page.click(selector);
                        log(`Clicked ${name}`);
                    },
                    `click ${name}`
                );
            };

            // Click each item with retry
            await clickWithRetry("[data-test='Espresso']", 'Espresso');
            await clickWithRetry("[data-test='Espresso_Macchiato']", 'Espresso Macchiato');
            await clickWithRetry("[data-test='Cappuccino']", 'Cappuccino');
            await clickWithRetry("[data-test='Espresso_Con\\ Panna']", 'Espresso Con Panna');
            
            await takeScreenshot('cart');
            timings.addToCart = performance.now() - cartStart;
            log(`Added items to cart in ${timings.addToCart}ms`);

            // Checkout
            log('Proceeding to checkout...');
            const checkoutStart = performance.now();
            
            await clickWithRetry("[data-test='checkout']", 'Checkout button');
            
            // Fill form with retry
            await retry(
                async () => {
                    await page.waitForSelector('#name', { visible: true });
                    await page.type('#name', 'andy');
                    await page.type('#email', 'andy@integrichain.com');
                    log('Filled checkout form');
                },
                'fill checkout form'
            );

            await takeScreenshot('checkout-form');
            await clickWithRetry('#submit-payment', 'Submit payment');
            timings.checkout = performance.now() - checkoutStart;
            log(`Checkout completed in ${timings.checkout}ms`);

            // Wait for success
            log('Waiting for order confirmation...');
            const successStart = performance.now();
            try {
                await retry(
                    () => page.waitForFunction(
                        () => document.body.innerText.includes('Thanks for your purchase. Please check your email for payment.'),
                        { timeout: 20000 }
                    ),
                    'wait for success message'
                );
                await takeScreenshot('success');
                timings.success = performance.now() - successStart;
                log('Order confirmed successfully');
            } catch (error) {
                timings.success = -1;
                log(`Failed to confirm order: ${error.message}`);
                await takeScreenshot('failure');
                
                // Capture the current state for debugging
                const screenshot = await page.screenshot({ encoding: 'base64' });
                const html = await page.content();
                log('Captured failure state');
                
                parentPort.postMessage({
                    success: false,
                    error: error.message,
                    timings,
                    totalTime: performance.now() - startTime,
                    logs,
                    screenshots,
                    failureState: {
                        screenshot,
                        html
                    }
                });
                return;
            }

            // Calculate total time
            const totalTime = performance.now() - startTime;

            // Send results back to main thread
            parentPort.postMessage({
                success: true,
                timings,
                totalTime,
                logs,
                screenshots
            });

        } catch (error) {
            log(`Test failed with error: ${error.message}`);
            parentPort.postMessage({
                success: false,
                error: error.message,
                totalTime: performance.now() - startTime,
                logs,
                screenshots
            });
        } finally {
            // Always close the browser
            if (browser) {
                try {
                    await browser.close();
                    log('Browser closed successfully');
                } catch (error) {
                    log(`Error closing browser: ${error.message}`);
                }
            }
            // Signal that we're done
            process.exit(0);
        }
    };

    runTest();
}

// Main thread code
if (isMainThread) {
    const runPerformanceTest = async (numUsers, mode) => {
        console.log(`Starting performance test with ${numUsers} concurrent users in ${mode} mode...`);
        
        const workers = [];
        const results = [];
        const startTime = performance.now();

        // Create workers
        for (let i = 0; i < numUsers; i++) {
            const worker = new Worker(__filename, { workerData: { mode } });
            workers.push(worker);

            worker.on('message', (result) => {
                results.push(result);
                console.log(`\nUser ${i + 1} completed: ${result.success ? 'Success' : 'Failed'}`);
                if (!result.success) {
                    console.log('Failure details:');
                    console.log('Error:', result.error);
                    console.log('Logs:', result.logs.join('\n'));
                    if (result.failureState) {
                        const failureDir = path.join(resultsDir, `failure-${Date.now()}-user-${i + 1}`);
                        fs.mkdirSync(failureDir, { recursive: true });
                        fs.writeFileSync(path.join(failureDir, 'screenshot.png'), result.failureState.screenshot, 'base64');
                        fs.writeFileSync(path.join(failureDir, 'page.html'), result.failureState.html);
                        console.log(`Failure evidence saved to: ${failureDir}`);
                    }
                }
            });

            worker.on('error', (error) => {
                console.error(`Worker ${i + 1} error:`, error);
                results.push({ success: false, error: error.message });
            });

            worker.on('exit', (code) => {
                if (code !== 0) {
                    console.error(`Worker ${i + 1} exited with code ${code}`);
                }
            });
        }

        // Wait for all workers to complete
        await Promise.all(workers.map(worker => 
            new Promise(resolve => worker.on('exit', resolve))
        ));

        // Ensure all workers are terminated
        workers.forEach(worker => {
            try {
                worker.terminate();
            } catch (error) {
                console.error('Error terminating worker:', error);
            }
        });

        const totalTime = performance.now() - startTime;

        // Generate report
        const report = {
            timestamp: new Date().toISOString(),
            numUsers,
            totalTime,
            successRate: (results.filter(r => r.success).length / numUsers) * 100,
            results: results.map((r, i) => ({
                user: i + 1,
                ...r
            }))
        };

        // Calculate statistics
        const successfulTests = results.filter(r => r.success);
        if (successfulTests.length > 0) {
            report.statistics = {
                averageTotalTime: successfulTests.reduce((sum, r) => sum + r.totalTime, 0) / successfulTests.length,
                averageNavigationTime: successfulTests.reduce((sum, r) => sum + r.timings.navigation, 0) / successfulTests.length,
                averageCartTime: successfulTests.reduce((sum, r) => sum + r.timings.addToCart, 0) / successfulTests.length,
                averageCheckoutTime: successfulTests.reduce((sum, r) => sum + r.timings.checkout, 0) / successfulTests.length,
                averageSuccessTime: successfulTests.reduce((sum, r) => sum + r.timings.success, 0) / successfulTests.length
            };
        }

        // Create a directory for this test run
        const testRunDir = path.join(resultsDir, `test-run-${Date.now()}`);
        fs.mkdirSync(testRunDir, { recursive: true });

        // Save screenshots for each user
        report.results.forEach(result => {
            if (result.screenshots && result.screenshots.length > 0) {
                const userDir = path.join(testRunDir, `user-${result.user}`);
                fs.mkdirSync(userDir, { recursive: true });
                result.screenshots.forEach(screenshot => {
                    fs.writeFileSync(
                        path.join(userDir, `${screenshot.name}.png`),
                        screenshot.data,
                        'base64'
                    );
                });
            }
        });

        // Save report
        const reportPath = path.join(testRunDir, `performance-report.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        // --- CSV Export ---
        const csvHeaders = [
            'user', 'success', 'error', 'totalTime',
            'navigation', 'addToCart', 'checkout', 'successTime'
        ];
        const csvRows = [csvHeaders.join(',')];
        report.results.forEach(r => {
            csvRows.push([
                r.user,
                r.success,
                r.error ? `"${r.error.replace(/"/g, '""')}"` : '',
                r.totalTime,
                r.timings ? r.timings.navigation : '',
                r.timings ? r.timings.addToCart : '',
                r.timings ? r.timings.checkout : '',
                r.timings ? r.timings.success : ''
            ].join(','));
        });
        const csvPath = path.join(testRunDir, `performance-report.csv`);
        fs.writeFileSync(csvPath, csvRows.join('\n'));

        // --- HTML Export ---
        const htmlRows = report.results.map(r => `
            <tr>
                <td>${r.user}</td>
                <td>${r.success ? '✅' : '❌'}</td>
                <td>${r.error ? `<pre>${r.error}</pre>` : ''}</td>
                <td>${r.totalTime ? r.totalTime.toFixed(2) : ''}</td>
                <td>${r.timings && r.timings.navigation ? r.timings.navigation.toFixed(2) : ''}</td>
                <td>${r.timings && r.timings.addToCart ? r.timings.addToCart.toFixed(2) : ''}</td>
                <td>${r.timings && r.timings.checkout ? r.timings.checkout.toFixed(2) : ''}</td>
                <td>${r.timings && r.timings.success ? r.timings.success.toFixed(2) : ''}</td>
                <td>
                    ${r.screenshots ? r.screenshots.map(s => `
                        <div class="screenshot">
                            <a href="user-${r.user}/${s.name}.png" target="_blank">
                                <img src="user-${r.user}/${s.name}.png" alt="${s.name}" width="200">
                            </a>
                            <div class="screenshot-name">${s.name}</div>
                        </div>
                    `).join('') : ''}
                </td>
            </tr>
        `).join('\n');
        const html = `<!DOCTYPE html>
<html><head><meta charset='utf-8'><title>Performance Report</title>
<style>
    body { font-family: sans-serif; margin: 20px; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    th { background: #eee; }
    .screenshot { display: inline-block; margin: 5px; text-align: center; }
    .screenshot img { border: 1px solid #ddd; border-radius: 4px; }
    .screenshot-name { font-size: 12px; color: #666; margin-top: 5px; }
    .success { color: green; }
    .failure { color: red; }
</style>
</head><body>
<h1>Performance Test Report</h1>
<p><b>Timestamp:</b> ${report.timestamp}</p>
<p><b>Users:</b> ${report.numUsers}</p>
<p><b>Success Rate:</b> ${report.successRate.toFixed(2)}%</p>
<p><b>Total Test Time:</b> ${(report.totalTime/1000).toFixed(2)}s</p>
${report.statistics ? `<h2>Average Times</h2>
<ul>
<li>Navigation: ${(report.statistics.averageNavigationTime/1000).toFixed(2)}s</li>
<li>Add to Cart: ${(report.statistics.averageCartTime/1000).toFixed(2)}s</li>
<li>Checkout: ${(report.statistics.averageCheckoutTime/1000).toFixed(2)}s</li>
<li>Success: ${(report.statistics.averageSuccessTime/1000).toFixed(2)}s</li>
<li>Total: ${(report.statistics.averageTotalTime/1000).toFixed(2)}s</li>
</ul>` : ''}
<h2>Detailed Results</h2>
<table>
    <thead>
        <tr>
            <th>User</th>
            <th>Success</th>
            <th>Error</th>
            <th>Total Time (ms)</th>
            <th>Navigation (ms)</th>
            <th>Add to Cart (ms)</th>
            <th>Checkout (ms)</th>
            <th>Success (ms)</th>
            <th>Screenshots</th>
        </tr>
    </thead>
    <tbody>
        ${htmlRows}
    </tbody>
</table>
</body></html>`;
        const htmlPath = path.join(testRunDir, `performance-report.html`);
        fs.writeFileSync(htmlPath, html);

        // Add this run to the performance history
        const history = new PerformanceHistory();
        history.addRun(report);

        console.log('\nPerformance Test Results:');
        console.log('------------------------');
        console.log(`Total Users: ${numUsers}`);
        console.log(`Success Rate: ${report.successRate.toFixed(2)}%`);
        console.log(`Total Test Time: ${(totalTime / 1000).toFixed(2)}s`);
        if (report.statistics) {
            console.log('\nAverage Times:');
            console.log(`Navigation: ${(report.statistics.averageNavigationTime / 1000).toFixed(2)}s`);
            console.log(`Add to Cart: ${(report.statistics.averageCartTime / 1000).toFixed(2)}s`);
            console.log(`Checkout: ${(report.statistics.averageCheckoutTime / 1000).toFixed(2)}s`);
            console.log(`Success: ${(report.statistics.averageSuccessTime / 1000).toFixed(2)}s`);
            console.log(`Total: ${(report.statistics.averageTotalTime / 1000).toFixed(2)}s`);
        }
        console.log(`\nTest run directory: ${testRunDir}`);
        console.log(`CSV report saved to: ${csvPath}`);
        console.log(`HTML report saved to: ${htmlPath}`);
        console.log(`Performance summary updated: ${path.join(resultsDir, 'performance-summary.html')}`);

        return report;
    };

    // Handle process termination
    process.on('SIGINT', async () => {
        console.log('\nGracefully shutting down...');
        process.exit(0);
    });

    // Get number of users and mode from command line arguments or use defaults
    const numUsers = parseInt(process.argv[2]) || 5;
    const mode = (process.argv[3] || 'headless').toLowerCase();
    runPerformanceTest(numUsers, mode).catch(console.error);
} 