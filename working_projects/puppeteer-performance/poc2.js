import url from 'url';
import { createRunner } from '@puppeteer/replay';

export async function run(extension) {
    const runner = await createRunner(extension);

    await runner.runBeforeAllSteps();

    await runner.runStep({
        type: 'setViewport',
        width: 1512,
        height: 437,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        isLandscape: false
    });
    await runner.runStep({
        type: 'navigate',
        url: 'https://coffee-cart.app/',
        assertedEvents: [
            {
                type: 'navigation',
                url: 'https://coffee-cart.app/',
                title: 'Coffee cart'
            }
        ]
    });
    await runner.runStep({
        type: 'click',
        target: 'main',
        selectors: [
            [
                'aria/Espresso'
            ],
            [
                "[data-test='Espresso']"
            ],
            [
                'xpath///*[@data-test="Espresso"]'
            ],
            [
                "pierce/[data-test='Espresso']"
            ]
        ],
        offsetY: 81.6452407836914,
        offsetX: 188.40188598632812,
    });
    await runner.runStep({
        type: 'click',
        target: 'main',
        selectors: [
            [
                'aria/Espresso Macchiato'
            ],
            [
                "[data-test='Espresso_Macchiato']"
            ],
            [
                'xpath///*[@data-test="Espresso_Macchiato"]'
            ],
            [
                "pierce/[data-test='Espresso_Macchiato']"
            ],
            [
                'text/espressomilk'
            ]
        ],
        offsetY: 134.6452407836914,
        offsetX: 118.40185546875,
    });
    await runner.runStep({
        type: 'click',
        target: 'main',
        selectors: [
            [
                'aria/Cappuccino'
            ],
            [
                "[data-test='Cappuccino']"
            ],
            [
                'xpath///*[@data-test="Cappuccino"]'
            ],
            [
                "pierce/[data-test='Cappuccino']"
            ]
        ],
        offsetY: 149.6452407836914,
        offsetX: 48.40185546875,
    });
    await runner.runStep({
        type: 'click',
        target: 'main',
        selectors: [
            [
                'aria/Yes, of course!'
            ],
            [
                'button.yes'
            ],
            [
                'xpath///*[@id="app"]/div[2]/div[2]/button[1]'
            ],
            [
                'pierce/button.yes'
            ],
            [
                'text/Yes, of course!'
            ]
        ],
        offsetY: 20.0859375,
        offsetX: 90,
    });
    await runner.runStep({
        type: 'click',
        target: 'main',
        selectors: [
            [
                'aria/Espresso Con Panna'
            ],
            [
                "[data-test='Espresso_Con\\ Panna']"
            ],
            [
                'xpath///*[@data-test="Espresso_Con Panna"]'
            ],
            [
                "pierce/[data-test='Espresso_Con\\ Panna']"
            ],
            [
                'text/espressowhipped'
            ]
        ],
        offsetY: 70.36398315429688,
        offsetX: 82.40185546875,
    });
    await runner.runStep({
        type: 'click',
        target: 'main',
        selectors: [
            [
                'aria/Proceed to checkout'
            ],
            [
                "[data-test='checkout']"
            ],
            [
                'xpath///*[@data-test="checkout"]'
            ],
            [
                "pierce/[data-test='checkout']"
            ],
            [
                'text/Total: $59.00'
            ]
        ],
        offsetY: 5.796875,
        offsetX: 23.1875,
    });
    await runner.runStep({
        type: 'click',
        target: 'main',
        selectors: [
            [
                'aria/Name'
            ],
            [
                '#name'
            ],
            [
                'xpath///*[@id="name"]'
            ],
            [
                'pierce/#name'
            ]
        ],
        offsetY: 18.90625,
        offsetX: 113.015625,
    });
    await runner.runStep({
        type: 'change',
        value: 'andy',
        selectors: [
            [
                'aria/Name'
            ],
            [
                '#name'
            ],
            [
                'xpath///*[@id="name"]'
            ],
            [
                'pierce/#name'
            ]
        ],
        target: 'main'
    });
    await runner.runStep({
        type: 'keyDown',
        target: 'main',
        key: 'Tab'
    });
    await runner.runStep({
        type: 'keyUp',
        key: 'Tab',
        target: 'main'
    });
    await runner.runStep({
        type: 'change',
        value: 'andy@integrichain.com',
        selectors: [
            [
                'aria/Email'
            ],
            [
                '#email'
            ],
            [
                'xpath///*[@id="email"]'
            ],
            [
                'pierce/#email'
            ]
        ],
        target: 'main'
    });
    await runner.runStep({
        type: 'click',
        target: 'main',
        selectors: [
            [
                'aria/Promotion message'
            ],
            [
                '#promotion-label'
            ],
            [
                'xpath///*[@id="promotion-label"]'
            ],
            [
                'pierce/#promotion-label'
            ],
            [
                'text/I would like'
            ]
        ],
        offsetY: 6.515625,
        offsetX: 177,
    });
    await runner.runStep({
        type: 'click',
        target: 'main',
        selectors: [
            [
                'aria/Submit'
            ],
            [
                '#submit-payment'
            ],
            [
                'xpath///*[@id="submit-payment"]'
            ],
            [
                'pierce/#submit-payment'
            ],
            [
                'text/Submit'
            ]
        ],
        offsetY: 18.8203125,
        offsetX: 14.3515625,
    });

    await runner.runAfterAllSteps();
}

if (process && import.meta.url === url.pathToFileURL(process.argv[1]).href) {
    run()
}
