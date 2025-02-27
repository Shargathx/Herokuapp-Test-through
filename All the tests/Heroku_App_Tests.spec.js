// These tests will use Firefox as a default web launcher; either use console commands or un-comment the browser settings in playwright.config.js

import { test, expect, request } from '@playwright/test';
import { assert } from 'console';
import path from 'path';

test.describe.parallel("Herokuapp Complete Test-through (with beforeEach)", () => {

    test.beforeEach(async ({ page }) => {
        await page.goto("https://the-internet.herokuapp.com");

    });

    test("Add/Remove Elements", async ({ page }) => {

        // Test adds some elements and deletes some

        await page.getByRole('link', { name: 'Add/Remove Elements' }).click();
        await page.getByRole('button', { name: 'Add Element' }).click();
        await page.getByRole('button', { name: 'Add Element' }).click();
        await page.getByRole('button', { name: 'Delete' }).nth(0).click();
        await page.getByRole('button', { name: 'Add Element' }).click();
        await page.getByRole('button', { name: 'Delete' }).nth(1).click();
        await page.getByRole('button', { name: 'Add Element' }).click();
        await page.getByRole('button', { name: 'Add Element' }).click();
        await page.getByRole('button', { name: 'Delete' }).nth(2).click();

    });



    test("Broken Images - Response Code", async ({ page }) => {
        test.setTimeout(15000);

        // Test scans three images and checks their response code, excluding the GitHub picture

        await page.getByRole("link", { name: "Broken Images" }).click();
        await page.waitForTimeout(1000);

        const images = await page.locator("img").all();
        const imageCount = images.length;

        for (let i = 0; i < imageCount; i++) {
            const img = images[i];
            let src = await img.getAttribute('src');

            if (src && src.includes('forkme_right_green_007200')) {
                console.log("Excluding GitHub image");
                continue;
            }
            console.log(`Image src: ${src}`);

            if (src && !src.startsWith('http')) {
                src = `https://the-internet.herokuapp.com/${src.replace(/^\//, '')}`;
            }
            const response = await page.request.get(src);

            if (response.status() === 200) {
                console.log(`Image ${src} is working!`);
            }
            else if (response.status === 404) {
                console.log(`Image ${src} is broken! (404)`);
            }
            else {
                console.log(`Image ${src} returned unexpected status: ${response.status()}`);
            }
            expect([200, 404]).toContain(response.status());
        }

    });



    test("Broken Images - Attribute Check", async ({ page }) => {

        // Test verifies alt attributes for images

        await page.getByRole("link", { name: "Broken Images" }).click();
        const images = await page.locator('img');

        for (let i = 0; i < await images.count(); i++) {
            //     await images.nth(i).waitFor();
            const altText = await images.nth(i).getAttribute('alt');
            expect(altText).not.toBe("");
        }
    });



    test("Checkboxes", async ({ page }) => {

        // Test asserts, checks and unchecks some checkboxes

        // await page.locator("text=Checkboxes").click();
        await page.getByRole("link", { name: "Checkboxes" }).click();
        await expect(page.locator("#checkboxes")).toBeVisible();
        const count = await page.locator('input[type="checkbox"]').count();
        await expect(count).toEqual(2);
        // await expect(page.locator('input[type="checkbox"]').first()).not.toBeChecked();
        // await expect(page.locator('input[type="checkbox"]').last()).toBeChecked();
        await expect(page.locator('input[type="checkbox"]').nth(0)).not.toBeChecked();
        await expect(page.locator('input[type="checkbox"]').nth(1)).toBeChecked();
        await page.locator('input[type="checkbox"]').nth(0).check();
        await page.locator('input[type="checkbox"]').nth(1).uncheck();
        await expect(page.locator('input[type="checkbox"]').first()).toBeChecked();
        await expect(page.locator('input[type="checkbox"]').last()).not.toBeChecked();

    });



    test("Context Menu", async ({ page }) => {

        // Test navigates to Context Menu, right-clicks it and accepts the warning dialog

        // await page.locator("text=Context Menu").click();
        await page.getByRole("link", { name: "Context Menu" }).click();

        page.on("dialog", async (dialog) => {
            console.log(dialog.message());
            if (dialog.type() === "alert") {
                await dialog.accept();
            }
        })

        await page.locator("#hot-spot").click({ button: 'right' });

    });



    test("Disappearing Elements", async ({ page }) => {

        // The test navigates to the 'Disappearing Elements' page, asserts that all expected links are present,
        // then refreshes the page multiple times, checking if any elements disappear after each reload

        // await page.locator("text=Disappearing Elements").click();
        await page.getByRole("link", { name: "Disappearing Elements" }).click();

        // This test has a longer timeout
        // Running this test with multiple workers on a low timeout will most likely make it fail
        test.setTimeout(20000);


        const visibleLinks = [
            { href: "/", text: "Home" },
            { href: "/about/", text: "About" },
            { href: "/contact-us/", text: "Contact Us" },
            { href: "/portfolio/", text: "Portfolio" },
            { href: "/gallery/", text: "Gallery" }
        ];

        const maxRetries = 5;
        let reloadCount = 0;

        async function assertLinks() {
            for (const link of visibleLinks) {
                const element = await page.locator(`a[href="${link.href}"]`);
                if (!(await element.isVisible())) {
                    console.log(`❌ Missing: ${link.text} (${link.href}) after ${reloadCount} reloads`);
                    return false;
                }
            }
            console.log(`✅ All links present after ${reloadCount} reloads`);
            return true;
        }

        for (let i = 0; i < maxRetries; i++) {
            reloadCount++;
            console.log(`🔄 Reloading page (Attempt ${reloadCount})...`);
            await page.reload();

            if (!(await assertLinks())) {
                break; // Exit loop when a link disappears
            }
        }
    });



    test("Drag and Drop", async ({ page }) => {

        // Test navigates to Drag and Drop link, selects box A and drops it into box B and asserts that they changed values (column A became column B)
        // Because the boxes dont have any height etc values, I cannot use boundingBox() to assert their old and new values and compare them against eachother

        // await page.locator("text=Drag and Drop").click();
        await page.getByRole("link", { name: "Drag and Drop" }).click();

        await page.locator("#column-a").dragTo(page.locator("#column-b"));
        const columnAContent = await page.locator("#column-a").textContent();
        const columnBContent = await page.locator("#column-b").textContent();

        expect(columnAContent).not.toEqual(columnBContent);

    });



    test("Dropdown List", async ({ page }) => {
        // This test naviagates to Dropdown List, asserts the default field to have some text, then selects and asserts two different options

        // await page.locator("text=Dropdown List").click();
        await page.getByRole("link", { name: "Dropdown" }).click();
        await expect(page.locator("#dropdown option[selected]")).toHaveText("Please select an option");
        await page.locator("#dropdown").selectOption("1");
        await expect(page.locator("//option[text()='Option 1']")).toHaveText("Option 1");
        await page.locator("#dropdown").selectOption("2");
        await expect(page.locator("//option[text()='Option 2']")).toHaveText("Option 2");


    });



    test("Entry Ad Simple", async ({ page }) => {
        // This test naviagates to Entry Ad page, an Ad will open up, the script will close it.

        //  await page.locator("text=Entry Ad").click();
        await page.getByRole("link", { name: "Entry Ad" }).click();
        await page.locator("//div[@class='modal-footer']").isVisible();
        //  await page.locator(".modal-footer p:text('Close')").click();
        await page.getByText('Close', { exact: true }).click();

    });



    test("Entry Ad Looping", async ({ page }) => {
        test.setTimeout(15000);

        // This is a weird test - it behaves differently based on the commented lines.
        // Uncommenting the marked lines speeds up the test and allows loops to run.
        // ^ In debug mode (manual), the ad appears once; in automatic mode, it appears every time.
        // Commented lines ensure proper page loading, enabling the ad to show consistently (in automatic mode).

        await page.getByRole("link", { name: "Entry Ad" }).click();

        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            console.log(`Attempt ${attempts + 1}: Checking for Ad...`);

            await page.waitForLoadState("load");
            await page.waitForTimeout(2000); // This needs to be here, without this the ad wont appear fast enough, ending the script!!!

            const closeButton = await page.locator("//div[@class='modal-footer']//p[text()='Close']").first();
            const buttonVisible = await closeButton.isVisible();

            if (buttonVisible) {
                console.log("Ad found, closing it...");
                await closeButton.click();
                //  await page.waitForTimeout(1000);
                console.log("Ad closed.");

                console.log("Waiting for page reload...");
                await page.reload();
                await page.waitForLoadState("load");
                //  await page.waitForTimeout(3000);
            } else {
                console.log("No Ad found, exiting loop.");
                break;
            }

            attempts++;
            //  await page.waitForTimeout(1500); // Small delay before next loop iteration
        }

        //  console.log("Reached the end of maximum attempts (" + (maxAttempts) + "), closing the test...");
        console.log(`Valid attempts where ads were found and closed: (${attempts}), closing the test...`);

    });




    test("Exit Intent Simple (With If Statements)", async ({ page }) => {
        // This test naviagates to Exit Intent page, a popup will appear once I try to leave the site.

        //  await page.locator("text=Exit Intent").click();
        await page.getByRole("link", { name: "Exit Intent" }).click();

        const viewport = page.viewportSize();
        console.log(viewport);
        const { width, height } = await page.viewportSize();


        await page.waitForTimeout(1500);
        await page.mouse.move(width / 2, -50);
        //   await page.waitForTimeout(1500); // In case the Exit Intent doesnt appear fast enough (currently working fine without this line)

        const closeButton = page.locator("//div[@class='modal-footer']//p[text()='Close']");

        if (await closeButton.isVisible()) {
            console.log("The Close button is visible");
            await closeButton.click();
            console.log("Closed the Exit Intent");
        }

        else {
            console.log("The Close button is not visible");
        }

        if (await closeButton.isVisible()) {
            console.log("The Close button is visible");
            await closeButton.click();
            console.log("Closed the Exit Intent");
        }
        else {
            console.log("The Close button is not visible");
        }

        await expect(closeButton).not.toBeVisible();
        console.log("The Close button is no longer visible, exiting test...");
    });



    test("Exit Intent Simple", async ({ page }) => {
        // This test naviagates to Exit Intent page, a popup will appear once I try to leave the site.

        //  await page.locator("text=Exit Intent").click();
        await page.getByRole("link", { name: "Exit Intent" }).click();

        const closeButton = page.locator("//div[@class='modal-footer']//p[text()='Close']");
        const viewport = page.viewportSize();
        console.log(viewport);
        const { width, height } = await page.viewportSize();


        await page.waitForTimeout(1500);
        await page.mouse.move(width / 2, -50);
        //  await page.waitForTimeout(1500); // In case the Exit Intent doesnt appear fast enough (currently working fine without this line)
        await expect(closeButton).toBeVisible();
        //  await expect(page.locator("//div[@class='modal-footer']//p[text()='Close']")).toBeVisible(); // Using const to keep it more clean
        console.log("The Close button is visible");
        await closeButton.click();
        //  await page.locator("//div[@class='modal-footer']//p[text()='Close']").click();
        console.log("Closed the Exit Intent");
        await expect(closeButton).not.toBeVisible();
        //  await expect(page.locator("//div[@class='modal-footer']//p[text()='Close']")).not.toBeVisible(); // Using const to keep it more clean
        console.log("The Close button is no longer visible, exiting test...");
    });



    test("Exit Intent Looping", async ({ page }) => {
        test.setTimeout(20000); // Increase to 20000 if it still times out, but it shouldnt

        // This test naviagates to Exit Intent page, a popup will appear once I try to leave the site.

        // await page.locator("text=Exit Intent").click();
        await page.getByRole("link", { name: "Exit Intent" }).click();

        const viewport = page.viewportSize();
        console.log(viewport);
        const { width, height } = await page.viewportSize();

        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            console.log(`Attempt ${attempts + 1}: Checking for Exit Intent...`);

            await page.waitForLoadState("load"); // This needs to be here, without this the window will not appear fast enough and the test will close (False-Positive)
            await page.waitForTimeout(1000); // This needs to be here, without this the window will not appear fast enough and the test will close (False-Positive)
            await page.mouse.move(width / 2, -50);

            const closeButton = page.locator("//div[@class='modal-footer']//p[text()='Close']")
            const visibleButton = await closeButton.isVisible();
            //await page.waitForTimeout(1000); // This is just to slow down the test, not really needed

            if (visibleButton) {
                console.log("Exit Intent window found, closing....");
                await closeButton.click();
                console.log("Exit Intent window closed.")
                //await page.waitForTimeout(1500); // This is just to slow down the test, not really needed


                console.log("Reloading page to check for looping Exit Intent...");
                await page.reload();
                //await page.waitForTimeout(1500); // This is just to slow down the test, not really needed
            }
            else {
                console.log("Exit Intent not found, closing loop....");
                break;
            }
            attempts++;
        }
        console.log(`Valid attempts where Exit Intent was found and closed: (${attempts}), closing the test...`);
    });



    test("File Download", async ({ page }) => {
        // This test naviagates to File Download page and then downloads and also deletes a file
        // The test site is constantly changing its names and files --> to prevent a failed test, the test will download the first .txt file it finds

        await page.getByRole("link", { name: /^File Download$/ }).click();

        const downloadPromise = page.waitForEvent('download');

        await page.locator("//a[contains(@href, '.txt')]").nth(0).click();
        // In case you want to save the file somewhere specific, add this line:
        // await download.saveAs('/path/to/save/at/' + download.suggestedFilename());

        const download = await downloadPromise;
        const filePath = await download.path();
        const fileName = download.suggestedFilename();
        console.log("Temporary file name: ", fileName);
        console.log("Temporary file path: ", filePath);

        await download.delete();
        console.log(`Downloaded file (${fileName}) deleted successfully!`);
    });



    test("File Upload (With fileChooser)", async ({ page }) => {
        // This test naviagates to File Upload page and then uploads a file (empty_txt_file_for_uploading.txt) using the fileChooser method

        //  await page.locator("text=File Upload").click();
        await page.getByRole("link", { name: "File Upload" }).click();

        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.locator("#file-upload").click();

        const fileChooser = await fileChooserPromise;
        const fileName = "empty_txt_file_for_uploading.txt";
        await fileChooser.setFiles('empty_txt_file_for_uploading.txt');
        await page.locator("#file-submit").click();

        console.log(`Uploaded file (${fileName}) successfully!`);
    });


    test("File Upload (With inputFiles)", async ({ page }) => {
        // This test naviagates to File Upload page and then uploads a file (empty_txt_file_for_uploading.txt) using the inputFiles method
        const fileName = "empty_txt_file_for_uploading.txt";
        //  await page.locator("text=File Upload").click();
        await page.getByRole("link", { name: "File Upload" }).click();
        await page.setInputFiles("#file-upload", "empty_txt_file_for_uploading.txt")
        await page.locator("#file-submit").click();
        console.log(`Uploaded file (${fileName}) successfully!`);

    });



    test("Floating Menu (With Single Menu Assert)", async ({ page }) => {
        // This test makes sure the floating menu stays visible when scrolling down, asserting the menu ID

        //  await page.locator("text=Floating Menu").click();
        await page.getByRole("link", { name: "Floating Menu" }).click();
        await page.waitForTimeout(1500); // Holds the page for a moment so it wouldnt immediately jump to the next part
        await page.locator("#page-footer").scrollIntoViewIfNeeded();
        await expect(page.locator("#menu")).toBeVisible();
        console.log("The menu is visible, closing test...")

    });



    test("Floating Menu (With Array Menu Assert)", async ({ page }) => {
        //  This test makes sure the floating menu stays visible when scrolling down, asserting all the elements of the floating menu

        //  await page.locator("text=Floating Menu").click();
        await page.getByRole("link", { name: "Floating Menu" }).click();

        const elements = [
            page.locator("//a[@href='#home']"),
            page.locator("//a[@href='#news']"),
            page.locator("//a[@href='#contact']"),
            page.locator("//a[@href='#about']"),
        ];

        await page.waitForTimeout(1500); // Holds the page for a moment so it wouldnt immediately jump to the next part (not really needed, just for better viewing experience)
        await page.locator("#page-footer").scrollIntoViewIfNeeded();
        for (const item of elements) {
            await expect(item).toBeVisible();
        };
    });



    test("Floating Menu (With Manual Scrolling + Array Asserts)", async ({ page }) => {
        test.setTimeout(15000);
        // This test makes sure the floating menu stays visible when scrolling down, asserting all the elements of the floating menu

        //  await page.locator("text=Floating Menu").click();
        await page.getByRole("link", { name: "Floating Menu" }).click();

        const elements = [
            page.locator("//a[@href='#home']"),
            page.locator("//a[@href='#news']"),
            page.locator("//a[@href='#contact']"),
            page.locator("//a[@href='#about']"),
        ];

        await page.waitForTimeout(1500); // Holds the page for a moment so it wouldnt immediately jump to the next part (not really needed, just for better viewing experience)
        await page.mouse.wheel(0, 1000);
        await page.waitForTimeout(500);
        await page.mouse.wheel(0, 1000);

        let allVisible = true;

        console.log("Running first scan after scrolling...")
        for (const item of elements) {
            const isVisible = await item.isVisible();
            if (isVisible) {
                console.log("Menu item is visible: ", await item.textContent());
            }
            else {
                allVisible = false;
                console.log("Menu item is not visible: ", await item.textContent());
            }
        }
        await page.waitForTimeout(500);
        await page.mouse.wheel(0, 3000);
        await page.waitForTimeout(500);
        await page.mouse.wheel(0, 3000);
        console.log("Running second scan after scrolling...")
        for (const item of elements) {
            const isVisible = await item.isVisible();
            if (isVisible) {
                console.log("Menu item is visible: ", await item.textContent());
            }
            else {
                allVisible = false;
                console.log("Menu item is not visible: ", await item.textContent());
            }
        }

        if (allVisible) {
            console.log("All menu items are visible, ending test!");
        }
        else {
            console.log("Some menu items are missing, check test!");
        }
    });



    test("Forgot Password", async ({ page }) => {
        // Test for navigating to the "Forgot Password" page, submitting an email address, and verifying the response
        // In a more robust test scenario, we would open the email inbox (e.g., Gmail), check for the reset link, and verify the link
        // Since this test takes you to a 502 page, it will then also assert the 502 page (in reality, it would assert that a password reset link was sent)

        //  await page.locator("text=Forgot Password").click();
        await page.getByRole("link", { name: "Forgot Password" }).click();
        await page.waitForTimeout(500); // Holds the page for a moment so it wouldnt immediately jump to the next part
        await page.locator("#email").fill("TestingUser@gmail.com");
        await page.locator("#form_submit").click();
        //   await page.waitForTimeout(1000);
        await expect(page.locator('//h1[text()="Internal Server Error"]')).toBeVisible();
        console.log("Password reset request submitted, wait for OTP to confirm");
    });



    test("Form Authentication", async ({ page }) => {

        const username = "tomsmith";
        const password = "SuperSecretPassword!";

        //  await page.locator("text=Form Authentication").click();
        await page.getByRole("link", { name: "Form Authentication" }).click();
        await page.locator("#username").fill(username);
        await page.locator("#password").fill(password);
        //  await page.locator("#username").fill("tomsmith"); // doing it manually, but if there are multiple names needed, using a constant is cleaner
        //  await page.locator("#password").fill("SuperSecretPassword!"); // doing it manually, but if there are multiple names needed, using a constant is cleaner
        await page.locator("//button[@class='radius' and @type='submit']").click();

        await expect(page.locator("#flash")).toBeVisible();
        await expect(page.locator("#flash")).toContainText("You logged into a secure area!");
        await page.locator("//a[@class='button secondary radius' and @href='/logout']").click();
        await expect(page.locator("#flash")).toBeVisible();
        await expect(page.locator("#flash")).toContainText("You logged out of the secure area!");
        //  await expect(page.locator("//h2[text()='Login Page']")).toHaveText("Login Page");
        await expect(page.locator("//h2[text()='Login Page']")).toBeVisible();
    });



    test("Geolocation", async ({ page, context }) => {
        test.setTimeout(20000);

        // "This test isn't working properly because the automated mode can't get the real-time location, which stops the test from continuing.
        // So, I'll use fake location settings instead.

        // await page.locator("text=Geolocation").click();
        await context.grantPermissions(['geolocation']);
        await context.setGeolocation({ latitude: 54.468635, longitude: -2.182221 }); // setting a fake location might help if the test doesnt / is unable to find real-time locations
        await page.getByRole("link", { name: "Geolocation" }).click();
        await page.locator("#content").isVisible();
        await page.locator("//button[text()='Where am I?']").click();
        // await page.locator("button:has-text('Where am I?')").click();

        await page.locator("#map-link").isVisible();
        await expect(page.locator("#lat-value")).toBeVisible();
        await expect(page.locator("#lat-value")).toHaveText("54.468635");
        const latValue = await page.locator("#lat-value").textContent();
        console.log("Fake Latitude is: ", latValue);

        await expect(page.locator("#long-value")).toBeVisible();
        await expect(page.locator("#long-value")).toHaveText("-2.182221");
        const longValue = await page.locator("#long-value").textContent();
        console.log("Fake longitude value is: ", longValue);

        await page.locator("//a[contains(@href, 'google.com')]").click();
        await page.locator("//button//span[@class='UywwFc-vQzf8d' and @jsname='V67aGc']").nth(0).click();
        // await page.locator("(//button//span[@class='UywwFc-vQzf8d' and @jsname='V67aGc'])[1]").click();
        await page.waitForLoadState("load"); // Waits for the page(s) to fully load OR use waitForTimeout below
        // await page.waitForTimeout(2000); // Gives the page(s) a moment to fully load OR use waitForLoadState above

        await expect(page).toHaveURL(/google\.com\/maps\/place/);
        console.log("Page URL is correct, exiting text...", `(${page.url()})`);
    });



    test("Horizontal Slider", async ({ page }) => {
        test.setTimeout(15000);

        //  await page.locator("text=Horizontal Slider").click();
        await page.getByRole("link", { name: "Horizontal Slider" }).click();

        const assertVisibility = page.locator("//h3[text()='Horizontal Slider']");
        await assertVisibility.waitFor({ state: 'visible' });
        const isVisible = await assertVisibility.isVisible();

        if (isVisible) {
            const textContent = await assertVisibility.textContent();
            console.log(`${textContent} is visible`);
        }
        else {
            console.log("Horizontal Slider text is not visible, fix code");
        }

        const slider = page.locator("input[type='range']");
        await slider.waitFor({ state: 'visible' });
        const sliderValue = (Math.round(Math.random() * 10) / 2).toFixed(1);
        console.log(`Set the slider value to: ${sliderValue}`);
        await slider.fill(sliderValue);

        const valueRange = await page.locator("#range");
        const currentValue = await valueRange.textContent();
        console.log(`Current slider value is ${currentValue}`);

        if (currentValue.trim() === sliderValue) {
            console.log("Slider values are the same, test finished...")
        }
        else {
            console.log("Slider values are not the same, fix code!")
        }
    });



    test.skip("Hovers", async ({ page }) => {

        //  await page.locator("text=Hovers").click();
        await page.getByRole("link", { name: "Hovers" }).click();


    });























});


























test.describe.parallel("Herokuapp Complete Test-through (without beforeEach)", () => {
    test('Basic Auth', async ({ browser }) => {

        // Test goes through basic authentication with username and password popup

        const context = await browser.newContext({
            httpCredentials: {
                username: 'admin',
                password: 'admin'
            }
        });

        const page = await context.newPage();
        await page.goto("https://the-internet.herokuapp.com");
        await page.locator("text=Basic Auth").click();
        await expect(page.locator('body')).toContainText('Congratulations! You must have the proper credentials.');

    });

})