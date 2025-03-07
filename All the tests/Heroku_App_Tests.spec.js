// These tests will use Firefox as a default web launcher; either use console commands or un-comment the browser settings in playwright.config.js

import { test, expect, request } from '@playwright/test';
import { assert } from 'console';
import { enableCompileCache } from 'module';
import path from 'path';

test.describe.parallel("Herokuapp Complete Test-through (with beforeEach)", () => {

    test.beforeEach(async ({ page }) => {
        await page.goto("https://the-internet.herokuapp.com");

    });

    test("Add/Remove Elements", async ({ page }) => {

        // Test adds some elements and deletes some elements after

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

        // This test isn't working properly because the automated mode can't get the real-time location, which stops the test from continuing.
        // So, I'll use fake location settings instead.

        // await page.locator("text=Geolocation").click();
        await context.grantPermissions(['geolocation']);
        await context.setGeolocation({ latitude: 54.468635, longitude: -2.182221 }); // setting a fake location might help if the test doesnt or is unable to find real-time locations
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

        // This test will move the slider by a random value

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



    test("Hovers", async ({ page }) => {

        // This test will hover over some elements, asserts their names, clicks to see their profiles (broken links),
        // navigates back and loops the action until all profiles have been asserted

        //  await page.locator("text=Hovers").click();
        await page.getByRole("link", { name: "Hovers" }).click();
        await expect(page.locator("#content")).toBeVisible();
        if (await page.locator("#content").isVisible()) {
            console.log("Content page is visible");
        }
        else {
            console.log("Content page not visible, fix code!")
        }

        await expect(page.locator("h3:text('Hovers')")).toBeVisible();
        if (await page.locator("h3:text('Hovers')").isVisible()) {
            console.log("Hovers text is visible");
        }
        else {
            console.log("Hovers text is not visible, fix code!")
        }

        let maxImages = 3;
        const text = await page.locator("h5");
        const links = await page.locator("//a[contains(@href, 'users')]");
        const image = await page.locator("//img[@src='/img/avatar-blank.jpg' and @alt='User Avatar']");
        let imageCount = 0;
        let textCount = 0;
        let clickedLinks = 0;

        while (imageCount < maxImages && textCount < maxImages) {

            const currentImage = image.nth(imageCount);
            const currentText = text.nth(textCount);
            const linkClicker = links.nth(clickedLinks);

            await expect(currentImage).toBeVisible();
            await currentImage.hover();

            const imageName = await currentText.textContent();

            // console.log(`Checking profile ${imageName}`);
            console.log(`Checking profile name...`);
            await expect(currentText).toHaveText(`name: user${imageCount + 1}`);
            console.log(`Profile ${imageName} checks out!`);

            await linkClicker.click();
            await expect(page.locator("//h1[text()='Not Found']")).toBeVisible();
            if (page.locator("//h1[text()='Not Found']").isVisible()) {
                console.log("Page error 404 is visible, going back....");
            }
            await page.goBack();
            await page.waitForLoadState("load");

            imageCount++;
            textCount++;
            clickedLinks++;
        }
        console.log("Maximum attempts reached, exiting test...");
    });



    test("Infinite Scroll (Looping With scrollIntoView)", async ({ page }) => {
        test.setTimeout(25000);

        // Test will try to assert that the footer of the page is visible while constantly scrolling down using scrollIntoView

        const timeout = 10000;
        const startTime = Date.now();

        await page.getByRole("link", { name: "Infinite Scroll" }).click();
        await page.waitForLoadState("load");
        await expect(page.locator("//h3[text()='Infinite Scroll']")).toBeVisible();
        if (page.locator("//h3[text()='Infinite Scroll']").isVisible) {
            console.log("Infinite Scroll text visible, continuing test...");
        }

        await page.locator("//h3[text()='Infinite Scroll']").hover();

        let footerVisible = false;

        while (!footerVisible) {
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime > timeout) {
                console.log("Maximum timeout reached, exiting loop!");
                break;
            }

            console.log("Footer is not yet visible, retrying....");
            await page.locator("#page-footer").scrollIntoViewIfNeeded();
            await page.waitForTimeout(1000);
        }
        console.log("Footer still not visible, exiting test...");
    });



    test("Infinite Scroll (Looping With Mouse Wheel)", async ({ page }) => {
        test.setTimeout(25000);

        // Test will try to assert that the footer of the page is visible while constantly scrolling down using mouse.wheel()

        const timeout = 10000;
        const startTime = Date.now();

        await page.getByRole("link", { name: "Infinite Scroll" }).click();
        await page.waitForLoadState("load");
        await expect(page.locator("//h3[text()='Infinite Scroll']")).toBeVisible();
        if (page.locator("//h3[text()='Infinite Scroll']").isVisible) {
            console.log("Infinite Scroll text visible, continuing test...");
        }

        await page.locator("//h3[text()='Infinite Scroll']").hover();

        let footerVisible = false;

        while (!footerVisible) {
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime > timeout) {
                console.log("Maximum timeout reached, exiting loop!");
                break;
            }

            console.log("Footer is not yet visible, retrying....");
            await page.mouse.wheel(0, 5000);
            await page.waitForTimeout(1000);
        }
        console.log("Footer still not visible, exiting test...");
    });



    test("Inputs", async ({ page }) => {
        test.setTimeout(15000);

        // This test will navigate to Inputs page, inserts a base value and then uses keyboard arrows to change said value to 25 and back to 0

        const numberField = await page.locator("//div[@class='example']//input[@type='number']");
        await page.getByRole("link", { name: "Inputs" }).click();
        await expect(page.locator("#content")).toBeVisible();
        if (await page.locator("#content")) {
            console.log("Page content is visible, continuing test...");
        } else {
            console.log("Page content NOT visible, fix code!");
        }

        await numberField.fill("0");
        const fieldValue = await numberField.inputValue();
        if (fieldValue === "0") {
            console.log("Base value 0 inserted.")
        }

        const interval = 50;
        const maxValue = 25;

        let currentValue = 0;
        let increasing = true;

        const startTimeIncrease = Date.now();

        console.log("Increasing value...");
        for (let currentValue = 0; currentValue < maxValue; currentValue++) {
            await page.keyboard.down('ArrowUp');
            await page.waitForTimeout(interval);

            const inputValue = await numberField.inputValue();
            if (parseInt(inputValue) === 25) {
                const endTimeIncrease = Date.now();
                const timeTakenToReach25 = endTimeIncrease - startTimeIncrease;
                console.log(`Time taken to reach 25: ${timeTakenToReach25}ms`);
                console.log("Reached 25...");
                break;
            }
        }

        const startTimeDecrease = Date.now();

        console.log("Decreasing value...");
        for (let currentValue = maxValue; currentValue > 0; currentValue--) {
            await page.keyboard.down('ArrowDown');
            await page.waitForTimeout(interval);

            const inputValue = await numberField.inputValue();
            if (parseInt(inputValue) === 0) {
                const endTimeDecrease = Date.now();
                const timeTakenToReach0 = endTimeDecrease - startTimeDecrease;
                console.log(`Time taken to decrease to 0: ${timeTakenToReach0}ms`);
                const totalTime = (Date.now() - startTimeIncrease);
                console.log(`Total time: ${totalTime}ms`);
                console.log("Reached 0, stopping test...");
                break;
            }
        }
    });



    test("JQuery UI Menus", async ({ page }) => {
        test.setTimeout(15000);

        // The test runs through some menu items, downloads a .pdf file and navigates back to the main menu, asserting visibility and functionality along the way

        await page.getByRole("link", { name: "JQuery UI Menus" }).click();
        await expect(page.locator("#content")).toBeVisible();
        const menu = page.locator("#menu");
        const content = page.locator("#content")
        await expect(menu).toBeVisible();
        if (await menu.isVisible() && await content.isVisible()) {
            console.log("The Menu and Content items are visible, continuing test...")
        }
        else {
            console.log("Missing items, check code!");
        }

        const disabledButton = page.locator("//a[text()='Disabled']");
        const isDisabled = await disabledButton.evaluate(el => el.closest('li').getAttribute('aria-disabled') === 'true')
        if (isDisabled) {
            console.log("Button is disabled, continuing...")
        }
        else {
            console.log("Error with Disabled button, check code");
        }

        try {
            await disabledButton.click({ timeout: 500 });
            console.log("Disabled menu item was clicked! Check code!!!")
        }
        catch (error) {
            console.log("Click on Disabled button failed as expected");
        }

        const enabledButton = page.locator("xpath=//a[text()='Enabled']");
        await expect(enabledButton).toBeVisible();
        await enabledButton.hover();
        await page.waitForTimeout(500);


        const downloadsOption = page.locator("xpath=//a[text()='Downloads']");
        await expect(downloadsOption).toBeVisible();
        await downloadsOption.hover();
        await page.waitForTimeout(500);


        const downloadPDF = page.locator("xpath=//a[text()='PDF']");
        const downloadPromise = page.waitForEvent('download');
        await downloadPDF.click();
        const download = await downloadPromise;
        console.log(`Download started: ${await download.suggestedFilename()} at ${await download.url()}`);
        await page.waitForTimeout(1500);


        await enabledButton.hover();
        await page.waitForTimeout(500);
        const backButton = page.locator("xpath=//a[text()='Back to JQuery UI']");
        await backButton.hover();
        await backButton.click();
        await page.waitForLoadState("load");


        const jQueryUI = page.locator("xpath=//a[text()='JQuery UI']");
        const jQueryMenu = page.locator("xpath=//a[text()='Menu']");
        await expect(jQueryUI).toBeVisible();
        await expect(jQueryMenu).toBeVisible();
        if (jQueryMenu && jQueryUI) {
            console.log("Both menu items are visible, continuing...");
        }
        else {
            console.log("Some menu items are not visible, check code!");
        }

        await page.waitForLoadState("load");
        await jQueryMenu.click();
        await expect(page.locator("//div[@class='example']")).toBeVisible();
        if (await page.locator("//div[@class='example']").isVisible()) {
            console.log("All elements of the test are visible, exiting test...");
        }
        else {
            console.log("Some elements are missing, check test code");
        }
    });



    test("JavaScript Alert, Confirm/Cancel and Prompt", async ({ page }) => {
        test.setTimeout(15000);

        // This test runs through all the js element buttons (Alert, Confirm, Prompt) and asserts them to be working as intended

        await page.getByRole("link", { name: "JavaScript Alerts" }).click();
        expect(page.locator("//div[@class='example']")).toBeVisible();

        const jsAlert = page.locator("//button[text()='Click for JS Alert']");
        const jsConfirm = page.locator("//button[text()='Click for JS Confirm']");
        const jsPrompt = page.locator("//button[text()='Click for JS Prompt']");
        const confirmedAlert = page.locator("#result");

        const elements = [
            jsAlert,
            jsConfirm,
            jsPrompt,
        ];

        let allVisible = true;

        for (const element of elements) {
            const isVisible = await element.isVisible();
            if (!isVisible) {
                allVisible = false;
                break;
            }
        }

        if (allVisible) {
            console.log("All the elements are visible, continuing test...");
        }
        else {
            console.log("Some elements are missing, check code!");
        }


        page.on('dialog', async (dialog) => {
            if (dialog.type() === 'alert') {
                console.log("Accepting (OK) dialog...");
                await dialog.accept();
            }
        });

        await jsAlert.click();
        const resultAlertText = await confirmedAlert.textContent();
        console.log("Alert result text is:", resultAlertText);
        if (resultAlertText === "You successfully clicked an alert") {
            expect(resultAlertText).toBe("You successfully clicked an alert");
            console.log("Acceptance criteria checks out!");
        }
        else {
            console.log("Text is not matching the expected value, check code!");
        }
        console.log("jsAlert is working, moving on...");


        for (let i = 0; i < 2; i++) {
            const dialogHandler = async (dialog) => {
                if (dialog.type() === 'confirm') {
                    if (i === 0) {
                        console.log("Accepting confirm dialog (OK)...");
                        await dialog.accept();
                    } else {
                        console.log("Confirming cancel dialog...");
                        await dialog.dismiss();
                    }
                    page.removeListener('dialog', dialogHandler); // Removing the event listener so it would loop nicely
                }
            };

            page.on('dialog', dialogHandler);

            console.log(`Clicking JS Confirm button (${i === 0 ? 'Accept' : 'Dismiss'})`);

            await jsConfirm.click();
            const resultConfirmText = await confirmedAlert.textContent();
            console.log(resultConfirmText);

            if (i === 0) {
                expect(resultConfirmText).toBe("You clicked: Ok");
                console.log("Acceptance criteria checks out!");
            }
            else {
                expect(resultConfirmText).toBe("You clicked: Cancel");
                console.log("Cancel criteria checks out!");
            }
        }
        console.log("jsConfirm is working, moving on...");


        await page.once('dialog', async dialog => {
            await dialog.accept("This is a little test");
        });

        const confirmedPrompt = page.locator("#result");
        const promptTextResult = await confirmedPrompt.textContent();

        await jsPrompt.click();
        await expect(confirmedPrompt).toHaveText("You entered: This is a little test");
        //  await expect(confirmedPrompt).toContainText("This is a little test");
        if (promptTextResult) {
            console.log(`Prompt text is: ${promptTextResult}`);
        }
        else {
            console.log("Text is not matching the input, check code!");
        }
        console.log("jsPrompt is working!");
        console.log("All js elements are working, exiting test...");
    });



    test("JavaScript onload event error", async ({ page }) => {

        // This test gets a JavaScript load error and asserts the text and also the response status
        page.on("console", (msg) => {
            if (msg.type() === "error") {
                console.log("JavaScript error in console:", msg.text());
            }
        });

        const responsePromise = page.waitForResponse(response =>
            response.status() === 200 && response.request().method() === "GET"
        );
        await page.getByRole("link", { name: "JavaScript onload event error" }).click();
        const response = await responsePromise;

        const errorMessage = await page.locator("text=This page has a JavaScript error").isVisible();
        expect(errorMessage).toBe(true);

        console.log('Response status:', response.status());
        const validResponse = response.status() === 200;
        if (validResponse) {
            console.log(`Response status (${response.status()}) checks out, exiting test...`);
        }
        else {
            console.log("Response status not as expected, check code!");
        }
    });



    test("Keyboard presses", async ({ page }) => {
        test.setTimeout(15000);

        await page.getByRole("link", { name: "Key Presses" }).click();
        const target = page.locator("#target");
        await expect(target).toBeVisible();
        if (target.isVisible()) {
            console.log("Target box is visible, continuing test...");
        }
        else {
            console.log("Target box NOT visible, check code!");
        }

        const textResult = page.locator("#result");
        const keys = ['a', 'A', '1', 'F1', 'Alt', 'Tab', 'Shift'];
        const maxPresses = 7;
        let presses = 0;

        for (presses = 0; presses < maxPresses; presses++) {
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            await page.keyboard.press(randomKey);
            const resultValue = await textResult.innerText();
            console.log(`Pressed ${randomKey}, current input value: ${resultValue}`);

            const normalizedResult = resultValue.toLowerCase();
            const normalizedKey = `You entered: ${randomKey}`.toLowerCase();

            expect(normalizedResult).toContain(normalizedKey);
        }

        await target.click();
        const textToType = "Filling this with random words";
        const textResults = page.locator("#result");
        let failedAssertion = false;

        for (let i = 0; i < textToType.length; i++) {
            const currentChar = textToType[i];
            await page.keyboard.press(currentChar);

            const resultValue = await textResults.innerText();
            console.log(`Pressed ${currentChar}, current result: ${resultValue}`);

            const normalizedResults = resultValue.replace("You entered: ", "").toLowerCase();
            let expectedChar = currentChar.toLowerCase();

            if (currentChar === " ") {
                expectedChar = "space";
            }
            try {
                expect(normalizedResults).toContain(expectedChar);
            }
            catch (error) {
                console.log(`Failed at character ${currentChar}:`, error);
                failedAssertion = true;
            }
        }

        if (!failedAssertion) {
            console.log("Expectations met, continuing test...");
        }
        else {
            console.log("Something went wrong, check code!");
        }

        // Pressing "Enter" while INSIDE the #target box causes the page to refresh for some reason, making asserting the #result impossible by my knowledge
        // Pressing "Enter" while outside the #target box just causes the #result to display the standard "You entered: Enter" message

        await page.locator('#target').press('Enter');

        const resultTextEnd = await textResult.textContent();
        if (resultTextEnd === "") {
            console.log("#result is empty after page reload, exiting test...");
        }
        else {
            console.log("#result still displays some text, something is wrong!");
        }
    });



    test("Large & Deep DOM", async ({ page }) => {

        // This test just checks a page with a lot of sibling, row and column elements if they are all visible and then also sums them up

        await page.getByRole("link", { name: "Large & Deep DOM" }).click();
        await expect(page.locator("#content")).toBeVisible();
        await expect(page.locator("//h4[text()='No Siblings']")).toBeVisible();
        await page.locator("#sibling-46\\.1").scrollIntoViewIfNeeded();
        await expect(page.locator("#sibling-46\\.1")).toBeVisible();

        if ((await page.locator("#sibling-46\\.1").count()) > 0 && await page.locator("//h4[text()='No Siblings']").isVisible()) {
            console.log("Both elements are visible, continuing test...");
        }
        else {
            console.log("One or more elements are missing, check code!");
        }

        await page.locator("#large-table").scrollIntoViewIfNeeded();
        await expect(page.locator("#large-table")).toBeVisible();
        await page.locator("#header-40").scrollIntoViewIfNeeded();
        await expect(page.locator("#header-40")).toBeVisible();
        await page.locator("//tr[contains(@class, 'row-49')]//td[@class='column-1']").scrollIntoViewIfNeeded();
        await expect(page.locator("//tr[contains(@class, 'row-49')]//td[@class='column-1']")).toBeVisible();

        if (await page.locator("#large-table").isVisible() && await page.locator("//tr[contains(@class, 'row-49')]//td[@class='column-1']").isVisible()) {
            console.log("All deep table elements are visible, continuing test...");
        }

        else {
            console.log("Some elements are not visible, check code!");
        }

        const siblingCount = await page.locator("[id^='sibling-']").count();
        console.log(`The amount of sibling elements on the page is: ${siblingCount}`)

        const columnCount = await page.locator("[class^='column-']").count();
        console.log(`The amount of column elements on the page is: ${columnCount}`);

        const headerCount = await page.locator("[id^='header-']").count();
        console.log(`The amount of header elements on the page is: ${headerCount}`);

        const totalElements = siblingCount + columnCount + headerCount;
        console.log(`Total elements on the page is: ${totalElements}`)

        if (totalElements === 2750) {
            console.log("All elements accounted for, exiting test...");
        }
        else {
            console.log("Total elements is not equal to 2750, check code!");
        }
    });



    test("Multiple Windows", async ({ page }) => {

        await page.getByRole("link", { name: "Multiple Windows" }).click();
        await expect(page.locator("//h3[text()='Opening a new window']")).toBeVisible();
        const clickHere = page.getByRole("link", { name: 'Click Here' })
        //    await expect(page.locator("//a[href='/windows/new']")).toBeVisible();    // Another way of asserting the "Click here" link
        await expect(clickHere).toBeVisible();

        if (await page.locator("//h3[text()='Opening a new window']").isVisible && clickHere.isVisible()) {
            console.log("Both elements are visible, continuing test...");
        }
        else {
            console.log("Some elements are missing, check code!");
        }


        const [newTab] = await Promise.all([
            page.waitForEvent('popup'),
            clickHere.click()
        ]);

        await newTab.bringToFront();
        await expect(newTab.locator("//div//h3[text()='New Window']")).toBeVisible();

        const openTabs = page.context().pages();

        await openTabs[0].bringToFront();      // Switches to first tab and then back to second tab
        await openTabs[1].bringToFront();
        console.log(`There are ${openTabs.length} open tabs`);

        if (await page.locator("//div//h3[text()='New Window']").isVisible) {
            console.log("New window is visible; closing second tab and exiting test...");
        }
        else {
            console.log("New window NOT visible, check code!");
        }

        await page.close();
    });



    test.skip("Notification Messages", async ({ page }) => {
    
        await page.getByRole("link", { name: "Notification Messages" }).click();
        

    });






































































    /*
    
    
        test.skip("BASE", async ({ page }) => {
    
            await page.getByRole("link", { name: "Forgot Password" }).click();
    
        });
        
    
        */























});   // ENDING OF ALL LINEAR TESTS


























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