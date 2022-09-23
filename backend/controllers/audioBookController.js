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
    await page.setViewport({ width: 1366, height: 999 });
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
            genras[0].click(),
            page.waitForNavigation()
        ]);
        // Get the list of books
        await Promise.all([
            page.waitForSelector('#main > a.next', { visible: true }),
            page.waitForTimeout(1000),
        ])
        let nextButton = await page.$$('#main > a.next');
        // Pages
        while (nextButton) {
            nextButton = await page.$$('#main > a.next');
            await page.waitForSelector('.image-hover-wrapper > a', { visible: true });
            const bookList = await page.$$('.image-hover-wrapper > a');

            // Books per page
            for (let j = 0; j < bookList.length; j++) {
                const bookList = await page.$$('.image-hover-wrapper > a');
                // Select each book
                await Promise.all([
                    page.waitForSelector('.image-hover-wrapper > a', { timeout: 5000 }),// The promise resolves after navigation has finished
                    page.waitForTimeout(2000),
                    bookList[j].click(),
                    page.waitForNavigation()
                ]);

                // Get audio track handles:
                await Promise.all([
                    page.waitForSelector("audio", { timeout: 5000 }),// The promise resolves after navigation has finished
                    page.waitForTimeout(2000),
                ]);

                let tracklist = await page.$$("audio");
                // Get track paths
                let paths = [];
                if (tracklist.length > 0) {
                    for (let k = 0; k < tracklist.length; k++) {
                        const path = await (await tracklist[k].getProperty('src')).jsonValue();
                        paths.push({
                            path,
                            trackNumber: k + 1
                        });
                    }
                }
                await Promise.all([
                    page.waitForSelector('.entry-content > p > strong', { timeout: 5000 }),// The promise resolves after navigation has finished
                    page.waitForTimeout(2000),
                ]);
                // Get text that has authors name:
                let image = await page.$eval('.wp-caption > img', (element) => {
                    return element.getAttribute('src');
                });
                let authorText = await page.$eval('.entry-content > p > strong', (element) => {
                    return element.textContent;
                });

                const authorName = authorText.split(' – ')[0].trim();
                const bookName = authorText.split(' – ')[1].trim();
                const book = {
                    title: bookName,
                    author: authorName,
                    image,
                    tracks: paths
                }
                const existingBook = await AudioBook.find({ title: book.title });
                if (!existingBook || existingBook.length === 0) {
                    console.log('Adding: ', book.title);
                    await AudioBook.create(book);
                } else {
                    console.log(book.title + ' already exists!');
                }

                // Go Back to book list
                await page.goBack();
                await Promise.all([
                    page.waitForSelector('.image-hover-wrapper > a', { timeout: 5000 }),// The promise resolves after navigation has finished
                    page.waitForTimeout(2000),
                ]);

            }
            nextButton = await page.$$('#main > a.next');
            await Promise.all([
                page.waitForSelector('#main > a.next', { visible: true }),
                page.waitForTimeout(2000),
                nextButton[0].click(),
            ])
        }
        res.json(book)

    } catch (error) {

    }
});

const findAudioBook = asynchandler(async (req, res) => {
    (async () => {
        // launch puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 1268 });
        try {
            await page.goto(`${GOLDEN_AUDIO_BOOKS_URL}/?s=${req.params.bookName}`); // go to golden books URL.
            await page.waitForSelector(".image-hover-wrapper", { visible: true });
            let bookList = await page.$$(".image-hover-wrapper");
            if(!bookList[0]) {
                await browser.close();
                return [];
            }
            await bookList[0].click();
            await page.waitForNavigation();
            await page.mouse.move(1000, 40);
            await page.waitForTimeout(2000);
            // Get audio track handles:
            let tracklist = await page.$$("audio");
            // Get text that has authors name:
            let image = await page.$eval('.wp-caption > img', (element) => {
                return element.getAttribute('src');
            });
            let authorText = await page.$eval('figcaption.wp-caption-text', (element) => {
                return element.textContent;
            });
            const authorName = authorText.split(' – ')[0]?.trim();
            let bookName = authorText.split(' – ')[1]?.trim();
            if(bookName && bookName.includes('Audiobook')){
                bookName = bookName.replace('Audiobook', '').trim();
            }
            let book = {
                title: bookName? bookName: '',
                author: authorName,
                image,
                tracks: [],
            }
            for (let i = 0; i < tracklist.length; i++) {
                const url = await (await tracklist[i].getProperty('src')).jsonValue();
                if (url && url !== ''){
                    const formattedUrl = url.split('?')[0];
                    book.tracks.push({
                        trackNumber: i + 1,
                        path: formattedUrl
                    })
                }
                
            }
            await browser.close(); // close browser
            return book;
        } catch (error) {
            console.log(error);
            await browser.close(); // close browser
        }
    })()
        .then(
            (success) => {
                return res.json(success);
            },
            (error) => {res.json([]) }
        ),
        (error) => {res.json([]) }
});

const downloadAudioBook = asynchandler(async (req, res) => {
    const bookName = req.params.bookName;
    const {GOLDEN_AUDIO_BOOKS_URL} = config;
    (async () => {
        // launch puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
          });
          const page = await browser.newPage();
          await page.setViewport({ width: 1366, height: 768});
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
            if(!fs.existsSync(`${__dirname}/audioBooks/${authorName}/${bookName}`)) {
                fs.mkdir(`${__dirname}/audioBooks/${authorName}/${bookName}`, { recursive: true }, (err) => {
                    if (err) throw err;
                });
            }

            for(let i = 0; i < tracklist.length; i++) {
                const url = await (await tracklist[i].getProperty('src')).jsonValue();
                https.get(url,(res) => {
                    // store the file
                    const path = `${__dirname}/audioBooks/${authorName}/${bookName}/${bookName}-${(i + 1) < 10 ? '0' + (i + 1) : (i + 1)}.mp3`;
                    const filePath = fs.createWriteStream(path);
                    res.pipe(filePath);
                    filePath.on('finish',() => {
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
        (error) => {}
    ), 
    (error) => {}
 });
export { scrapeAudioBooks, findAudioBook };