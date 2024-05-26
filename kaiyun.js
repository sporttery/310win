var jQueryScript, hookJsScript, page, mybrowser;
const fs = require("fs");
const Puppeteer = require("puppeteer-core");
/**
 * 初使化page
 * @param {Puppeteer.Page} page 
 */
async function initFun(page) {
    console.log("找到目标页了" + page.url());
    page.initFun = true;
    // await page.emulate(devices['iPhone 12'])
    await page.setViewport(viewport = { "width": 390, "height": 844, "isMobile": true })
    await page.setUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1 Edg/119.0.0.0"
    );
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, "plugins", {
            get: () => [
                {
                    0: {
                        type: "application/x-google-chrome-pdf",
                        suffixes: "pdf",
                        description: "Portable Document Format",
                        enabledPlugin: Plugin,
                    },
                    description: "Portable Document Format",
                    filename: "internal-pdf-viewer",
                    length: 1,
                    name: "Chrome PDF Plugin",
                },
                {
                    0: {
                        type: "application/pdf",
                        suffixes: "pdf",
                        description: "",
                        enabledPlugin: Plugin,
                    },
                    description: "",
                    filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
                    length: 1,
                    name: "Chrome PDF Viewer",
                },
                {
                    0: {
                        type: "application/x-nacl",
                        suffixes: "",
                        description: "Native Client Executable",
                        enabledPlugin: Plugin,
                    },
                    1: {
                        type: "application/x-pnacl",
                        suffixes: "",
                        description: "Portable Native Client Executable",
                        enabledPlugin: Plugin,
                    },
                    description: "",
                    filename: "internal-nacl-plugin",
                    length: 2,
                    name: "Native Client",
                },
            ],
        });

        window.chrome = {
            runtime: {},
            loadTimes: function () { },
            csi: function () { },
            app: {},
        };
        Object.defineProperty(navigator, "webdriver", {
            get: () => false,
        });
        Object.defineProperty(navigator, "platform", {
            get: () => "Win32",
        });
    });

    await page.setRequestInterception(true);
    page.on("response", async (response) => {
        var url = response.url();
        if (url.indexOf(".js") != -1) {
            if (response.request().resourceType() === 'script') {
                const content = await response.text();
                console.log("找到脚本文件，进行替换");
                // 修改 JavaScript 内容
                const modifiedContent = content.replace(/debugger/g, '/*debugger*/');

                // 返回修改后的内容
                response.respond({
                    status: response.status(),
                    contentType: response.headers()['content-type'],
                    body: Buffer.from(modifiedContent),
                });
            }
        }
    })

    page.on("console", (msg) => {
        console.log(new Date(), "PAGE LOG:", msg.text());
    });


    var hasJquery = await page.evaluate(() => { return typeof jQueryScript != "undefined" });
    var resourcePath = __dirname;
    if (!fs.existsSync(resourcePath + "/jquery.min.js")) {
        resourcePath = process.cwd();
    }
    if (!hasJquery) {
        if (!jQueryScript) {
            jQueryScript = fs.readFileSync(resourcePath + "/jquery.min.js").toString();
        }
        console.log("add jQuery");
        await page.addScriptTag({
            content: jQueryScript,
        });
    }

}

const chromePath = "C:\\Users\\huanbo-zw\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe";
//const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
(async () => {
    await Puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [/*"--no-sandbox", "--disable-setuid-sandbox",*/"--disable-web-security", '--start-maximized'],
        ignoreHTTPSErrors: true,
        ignoreDefaultArgs: ["--enable-automation", "--enable-blink-features"],
        executablePath: chromePath,
        devtools: false
    }).then(async (browser) => {
        let pages = await browser.pages();
        mybrowser = browser;
        page = pages[0];


        browser.on("targetchanged", async (target) => {
            page = await target.page();
            if (page && page.url) {
                var url = page.url();
                console.info("targetchanged", url);
                if (!page.initFun) {
                    await initFun(page);
                }
            }
        })
        browser.on("targetcreated", async (target) => {
            page = await target.page();
            if (page && page.url) {
                var url = page.url();
                console.info("targetcreated", url);
                if (!page.initFun) {
                    await initFun(page);
                }
            }
        })
        browser.on('disconnected', () => {
            mybrowser = false;
            console.warn("程序退出了");
            process.exit();
        });
        await page.goto("https://k999888.com");

    });
})();

process.on('SIGTERM', async () => {
    if (mybrowser) {
        await mybrowser.close();
    }
})
