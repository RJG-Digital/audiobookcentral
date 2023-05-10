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
import multer from 'multer';
import AWS from 'aws-sdk';


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
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            const page = await browser.newPage();
            await page.setViewport({ width: 1366, height: 1268 });
            try {
                await page.goto(`${GOLDEN_AUDIO_BOOKS_URL}/?s=${req.params.bookName}`); // go to golden books URL.
                await page.waitForSelector(".wp-post-image", { visible: true });
                let bookList = await page.$$(".wp-post-image");
                if (!bookList[0]) {
                    await browser.close();
                    return [];
                }
                await Promise.all([
                bookList[0].click(),
                page.waitForNavigation(),
                page.waitForTimeout(2000),
                page.mouse.move(1000, 40),
                page.waitForTimeout(2000),
                ])
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

const uploadBook = asynchandler(async (req, res) => {
    const { author, title } = req.body;
    const file = req.files[`track`];
    const path = `C:/audioBooks/onlineBooks/${author}/${title}/${file.name}`;
    await file.mv(path);
    res.json({ msg: 'Success', path });
});

const saveUploadedBook = asynchandler(async (req, res) => {
    const { book } = req.body;
    // save and return audiobook
    console.log(book);
    const authorTitle = book.author + ' ' + book.title;
    const audioBooks = await AudioBook.find({ authorTitle });
    if (!audioBooks || audioBooks.length === 0) {
        // create audioBook
        // get trackPaths
        const tracks = fs.readdirSync(`C:/audioBooks/onlineBooks/${book.author}/${book.title}/`);
        const webTracks = tracks.map((t, index) => { return ({ path: `https://books.rjgdigitalcreations.com/onlineBooks/${book.author}/${book.title}/${t}`, trackNumber: index + 1 }) });
        console.log(webTracks)
        const ab = {
            authorTitle,
            title: book.title,
            author: book.author,
            image: book.image,
            description: book.description,
            genres: [],
            tracks: webTracks
        };
        const createdAudioBook = await AudioBook.create(ab);
        res.json(createdAudioBook);
    } else {
        res.json({ msg: 'Book already exists!' });
    }
})

export { findAudioBook, uploadBook, saveUploadedBook };