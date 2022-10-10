import asynchandler from 'express-async-handler';
import dotenv from 'dotenv';
import colors from 'colors';
import puppeteer from 'puppeteer';
import {
    GOLDEN_AUDIO_BOOKS_URL,
    CATEGORY_ITEM
} from '../config/constants.js';
import AudioBook from '../models/audioBook.js';
import fs from 'fs';
import https from 'https';

const findAudioBook = asynchandler(async (req, res) => {
    console.log(req.params.bookName);
    const regex = new RegExp(req.params.bookName, 'i');
    const audioBooks = await AudioBook.find({ authorTitle: { $regex: regex } });
    if (audioBooks && audioBooks.length > 0) {
        res.json(audioBooks);
    } else {
        (async () => {
            // launch puppeteer
            const browser = await puppeteer.launch({
                headless: false,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            const page = await browser.newPage();
            await page.setViewport({ width: 1366, height: 1268 });
            try {
                await page.goto(`${GOLDEN_AUDIO_BOOKS_URL}/?s=${req.params.bookName}`); // go to golden books URL.
                await page.waitForSelector(".image-hover-wrapper", { visible: true });
                let bookList = await page.$$(".image-hover-wrapper");
                if (!bookList[0]) {
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
                if (bookName && bookName.includes('Audiobook')) {
                    bookName = bookName.replace('Audiobook', '').trim();
                }
                bookName = bookName ? bookName : ''
                let book = {
                    title: bookName,
                    author: authorName,
                    authorTitle: authorName + ' ' + bookName,
                    image,
                    tracks: [],
                }

                let trackPages = await page.$$(".post-page-numbers");
                if (trackPages && trackPages.length) {
                    console.log('right here')
                    for (let i = 0; i < trackPages.length; i++) {
                        if (i !== 0) {
                            page.waitForSelector(".post-page-numbers");
                            trackPages = await page.$$(".post-page-numbers");
                            await Promise.all([
                                trackPages[i].click(),
                                page.waitForNavigation(),
                                page.waitForTimeout(2000)
                            ]);
                        }
                        tracklist = await page.$$("audio");
                        for (let i = 0; i < tracklist.length; i++) {
                            const url = await (await tracklist[i].getProperty('src')).jsonValue();
                            if (url && url !== '') {
                                const formattedUrl = url.split('?')[0];
                                book.tracks.push({
                                    trackNumber: i + 1,
                                    path: formattedUrl
                                })
                            }
                        }
                        trackPages = await page.$$(".post-page-numbers");
                        console.log(i);
                    }
                    book.tracks = book.tracks.map((track, index) => { return { trackNumber: index + 1, path: track.path } })
                } else {
                    for (let i = 0; i < tracklist.length; i++) {
                        const url = await (await tracklist[i].getProperty('src')).jsonValue();
                        if (url && url !== '') {
                            const formattedUrl = url.split('?')[0];
                            book.tracks.push({
                                trackNumber: i + 1,
                                path: formattedUrl
                            })
                        }
                    }
                }
                await browser.close(); // close browser
                return [book];
            } catch (error) {
                console.log(error);
                await browser.close(); // close browser
            }
        })()
            .then(
                (success) => {
                    return res.json(success);

                },
                (error) => { res.json([]) }
            ),
            (error) => { res.json([]) }
    }

});

const downloadBook = asynchandler(async (req, res) => {
    const { book } = req.body;
    let count = 0;
    const dir = `C:/audioBooks/onlineBooks/${book.author}/${book.title}`;
    // const dir = `E:/online_books/audioBooks/${book.author}/${book.title}`;
    const webDir = `https://books.rjgdigitalcreations.com/onlineBooks/${book.author}/${book.title}`
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    for (let i = 0; i < book.tracks.length; i++) {
        https.get(book.tracks[i].path, (resp) => {
            // store the file
            const path = `${dir}/${book.title}-${(i + 1) < 10 ? '0' + (i + 1) : (i + 1)}.mp3`;
            const webPath = `${webDir}/${book.title}-${(i + 1) < 10 ? '0' + (i + 1) : (i + 1)}.mp3`;
            const filePath = fs.createWriteStream(path);
            resp.pipe(filePath);
            filePath.on('finish', async () => {
                filePath.close();
                count++;
                console.log('Download Completed');
                book.tracks[i].path = webPath;
                console.log(count, ' ', book.tracks.length)
                if (count === (book.tracks.length)) {
                    const audioBooks = await AudioBook.find({ authorTitle: book.authorTitle });
                    if (!audioBooks || audioBooks.length === 0) {
                        await AudioBook.create(book);
                    }
                    res.json(book);
                }
            })
        });
    }
})
export { findAudioBook, downloadBook };