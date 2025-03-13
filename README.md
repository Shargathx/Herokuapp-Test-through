(WIP - more tests will be added over time as I solve them)  
This is a collection of tests based on https://the-internet.herokuapp.com/  
All tests are written in JavaScript using PlayWright By default, the tests are only using firefox as a browser - if you want to use other browsers, un-comment the browser lines in playwright.config.js  

Some commands to run the tests:  

npx playwright test runs in headless mode by default  
npx playwright test --headed runs in headed mode to see what is happening and how it's happening  
npx playwright test -repeat-each X runs the test(s) a select number of times  
npx playwright test --debug runs it in debug mode (letting you choose between fast debug mode and slow mode, letting the user click through all the steps one by one)  
