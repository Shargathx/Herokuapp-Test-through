const { PlaywrightTestConfig } = require("@playwright/test");
const { TIMEOUT } = require("dns");

const config = {
    retries: 0,
    timeout: 8000,
    //reporter: "./reporter.js",

    use: {
        baseURL: "https://the-internet.herokuapp.com",
        headless: true,
        viewport: { width: 1280, height: 720 },
        video: "off",
        screenshot: "only-on-failure",
        trace: "only-on-failure",
    },

    projects: [
        {
            name: "firefox",
            use: { browserName: "firefox" }
        },
/*
        {
            name: "webkit",
            use: { browserName: "webkit" }
        },

        {
            name: "webkit",
            use: { browserName: "webkit" }
        },
*/               
    ]
}

module.exports = config;