import asynchandler from 'express-async-handler';
import dotenv from 'dotenv';
import colors from 'colors';
import puppeteer from 'puppeteer';
import {
    GOLDEN_AUDIO_BOOKS_URL,
    CATEGORY_ITEM
} from '../config/constants.js';
import AudioBook from '../models/audioBook.js';

const scrapeAudioBooks = asynchandler(async (req, res) => {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 1366 });
    try {
        // go to golden books URL.
        await page.goto(GOLDEN_AUDIO_BOOKS_URL);
        // get the list of genras
        await page.waitForSelector('li.cat-item > a', { visible: true });
        let genras = await page.$$('li.cat-item > a');
        if (!genras.length) {
            res.status(404);
        }
        // select the first Genra
        await Promise.all([
            page.waitForSelector('li.cat-item > a', { timeout: 5000 }),// The promise resolves after navigation has finished
            page.waitForTimeout(1000),
            genras[0].click()
        ]);
        // Get the list of books
        await page.waitForSelector('.image-hover-wrapper > a', { visible: true });
        let bookList = await page.$$('.image-hover-wrapper > a');
        // Select the first book
        await Promise.all([
            page.waitForSelector('.image-hover-wrapper > a', { timeout: 5000 }),// The promise resolves after navigation has finished
            page.waitForTimeout(1000),
            bookList[0].click()
        ]);

        // Get audio track handles:

        await Promise.all([
            page.waitForSelector(".mejs-time-rail", { timeout: 5000 }),// The promise resolves after navigation has finished
            page.waitForTimeout(2000),
        ]);
        let tracklist = await page.$$("audio");
        await Promise.all([
            page.waitForSelector("audio", { timeout: 5000 }),// The promise resolves after navigation has finished
            page.waitForTimeout(1000),
        ]);


        const paths = [];
        if (tracklist.length > 0) {
            for (let i = 0; i < tracklist.length; i++) {
                const path = await (await tracklist[i].getProperty('src')).jsonValue();
                paths.push(path);
            }
        }
        // Get text that has authors name:
        let authorText = await page.$eval('.entry-content > p > strong', (element) => {
            return element.innerHTML
        });
        const authorName = authorText.split(' – ')[0].trim();
        const bookName = authorText.split(' – ')[1].trim();
        const book = {
            title: bookName,
            author: authorName,
            trackPaths: paths
        }
        res.json(book)

    } catch (error) {

    }
})

const searchAudioBooks = asynchandler(async (req, res) => {
    const bookName = req.params.bookName;
    (async () => {
        // launch puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });
        try {
            await page.goto(`${GOLDEN_AUDIO_BOOKS_URL}/?s=${bookName}`); // go to golden books URL.
            await page.waitForSelector(".image-hover-wrapper", { visible: true });
            let bookList = await page.$$(".image-hover-wrapper");
            await bookList[0].click();
            await page.waitForNavigation();
            await page.waitForSelector('figcaption');
            await page.screenshot({ path: 'buddy-screenshot.png' });
            // Get text that has authors name:
            let authorText = await page.$eval('figcaption', (element) => {
                return element.innerHTML
            });
            const authorName = await authorText.split(' – ')[0].trim();
            // Get audio track handles:
            let tracklist = await page.$$("audio");

            //Make directory for book if it doesn't yet exist
            if (!fs.existsSync(`${__dirname}/audioBooks/${authorName}/${bookName}`)) {
                fs.mkdir(`${__dirname}/audioBooks/${authorName}/${bookName}`, { recursive: true }, (err) => {
                    if (err) throw err;
                });
            }

            for (let i = 0; i < tracklist.length; i++) {
                const url = await (await tracklist[i].getProperty('src')).jsonValue();
                https.get(url, (res) => {
                    // store the file
                    const path = `${__dirname}/audioBooks/${authorName}/${bookName}/${bookName}-${(i + 1) < 10 ? '0' + (i + 1) : (i + 1)}.mp3`;
                    const filePath = fs.createWriteStream(path);
                    res.pipe(filePath);
                    filePath.on('finish', () => {
                        filePath.close();
                        console.log('Download Completed');
                    })
                })
            }

            await browser.close(); // close browser
        } catch (error) {
            console.log(error)
        }
    })()
        .then(
            (success) => {
                return res.json('Done');
            },
            (error) => { }
        ),
        (error) => { }
})

export { scrapeAudioBooks };
