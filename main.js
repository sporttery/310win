var jQueryScript, hookJsScript, page,mybrowser;
const fs = require("fs");
const Puppeteer = require("puppeteer");
async function initFun(page) {
    console.log("找到目标页了" + page.url());
    page.initFun = true;

    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36"
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

    await page.on("console", (msg) => {
        console.log(new Date(), "PAGE LOG:", msg.text());
    });

    var hasJquery = await page.evaluate(() => { return typeof jQueryScript != "undefined" });
    var resourcePath = __dirname;
    if(!fs.existsSync(resourcePath+"/jquery.min.js")){
        resourcePath  =  process.cwd();
    }
    if (!hasJquery) {
        if (!jQueryScript) {
            jQueryScript = fs.readFileSync(resourcePath+"/jquery.min.js").toString();
        }
        console.log("add jQuery");
        await page.addScriptTag({
            content: jQueryScript,
        });
    }
    var hasHookJs = await page.evaluate(() => { return typeof hookJsScript != "undefined" });
    if (!hasHookJs) {
        if (!hookJsScript) {
            hookJsScript = fs.readFileSync(resourcePath+"/310win_hook.js").toString();
        }
        console.log("add hookJs");
        await page.addScriptTag({
            content: hookJsScript,
        });
    }

    await page.evaluate(() => {
        // setTr();
        $("#h_s").val("3").trigger("change");
        $("#a_s").val("3").trigger("change");
    });
}
(async () => {
    await Puppeteer.launch({
        headless: false,
        defaultViewport: {
            width: 1400,
            height: 900,
        },
          args: [/*"--no-sandbox", "--disable-setuid-sandbox",*/"--disable-web-security",'--start-maximized'],
        ignoreHTTPSErrors: true,
        ignoreDefaultArgs: ["--enable-automation", "--enable-blink-features"]
        // devtools: true
    }).then(async (browser) => {
        let pages = await browser.pages();
        mybrowser = browser;
        page = pages[0];

        browser.on("targetchanged", async (target) => {
            page = await target.page();
            if (page && page.url) {
                var url = page.url();
                if (/analysis\/\d+.htm/.test(url)) {
                    if (!page.initFun) {
                        await initFun(page);
                    }
                }
            }
        })
        browser.on("targetcreated", async (target) => {
            page = await target.page();
            if (page && page.url) {
                var url = page.url();
                if (/analysis\/\d+.htm/.test(url)) {
                    if (!page.initFun) {
                        await initFun(page);
                    }
                }
            }
        })
        browser.on('disconnected',()=>{
            mybrowser = false;
            console.warn("程序退出了");
            process.exit();
        });
        await page.goto("http://www.310win.com/");

    });
})();

process.on('SIGTERM', async () => {
    if(mybrowser){
        await mybrowser.close();
    }
})
