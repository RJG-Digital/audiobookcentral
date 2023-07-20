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
import AWS from 'aws-sdk';
import path from 'path';
import { Storage } from '@google-cloud/storage';

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
                console.log('right here')
                await bookList[0].click(),
                await page.waitForTimeout(2000),
                await page.mouse.move(1000, 400);
                await page.waitForSelector('.wp-caption');

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

const uploadBookToS3 = asynchandler(async (req, res) => {
    const dirPath = req.body.dirPath;
    const bookName = req.body.bookName;
    const s3 = new AWS.S3({
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECERET_ACCESS_KEY,
        region: process.env.S3_BUCKET_REGION,
    });
    // Read files in dirPath 
    fs.readdir(dirPath, (err, files) => {
        if (err) {
          console.error('Error reading folder:', err);
          return;
        }
    
        files.forEach((file) => {
          const filePath = path.join(dirPath, file);
          console.log(filePath);
          const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `AudioBooks/Stephen King/${bookName}/${file}`,
            Body: fs.createReadStream(filePath),
          };
        
          s3.upload(params, function(err, data) {
            if (err) {
              console.error('Error uploading file:', err);
            } else {
              console.log('File uploaded successfully. File URL:', data.Location);
            }
          });
        });
      });


});

const uploadBookToGoogleCloud = asynchandler(async (req, res) => {
    const dirPath = req.body.dirPath;
    const bookName = req.body.bookName;
    const authorName = req.body.authorName;
    const keyFilename = 'storageKey.json'
    const projectId = 'sincere-hybrid-393021'
    const storage = new Storage({
        projectId,
        keyFilename
    });
    const bucket = storage.bucket('audiobook-bucket');
       // Read files in dirPath 
       fs.readdir(dirPath, (err, files) => {
        if (err) {
          console.error('Error reading folder:', err);
          return;
        }
    
        files.forEach((file) => {
            const filePath = path.join(dirPath, file);
            console.log(filePath);
            const destinationPath = `${authorName}/${bookName}/${file}`;
            const blob = bucket.file(destinationPath);
            const blobStream = blob.createWriteStream();

            // Read the content of the file
            const readStream = fs.createReadStream(filePath);

            // Pipe the read stream to the write stream
            readStream.pipe(blobStream);

            blobStream.on('finish', async () => {
                console.log(`${file} uploaded successfully.`);
                const signedUrl = await getSignedUrl(bucket, destinationPath);
                console.log(`URL for ${destinationPath}: ${signedUrl}`);
            });

            blobStream.on('error', (e) => {
                console.log(`Error uploading ${file}:`, e);
            });
        });
      });
})

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
});

const downloadBook = asynchandler(async (req, res) => {
    const s3 = new AWS.S3({
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECERET_ACCESS_KEY,
        region: process.env.S3_BUCKET_REGION,
    });
    const authorName = req.params.authorName;
    const bookNane = req.params.bookName;
    const objectsToDownload = [];
    // audiobookcentral/audioBooks/Stephen King/The Shining/
    console.log(`audiobookcentral/${authorName}/${bookNane}/`)
    // Get list of objects from S3
    s3.listObjectsV2({ Bucket: 'audiobookcentral', Prefix: `audioBooks/${authorName}/${bookNane}/` }, (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send(err);
      }
  
      data.Contents.forEach((obj) => {
        const params = {
          Bucket: 'audiobookcentral',
          Key: obj.Key
        };
  
        objectsToDownload.push(params);
      });
  
      // Call the download function after adding all the files to the array
      download(objectsToDownload);
    });
  
    function download(objectsToDownload) {
        // Check if there are any objects to download
        if (objectsToDownload.length === 0) {
          return res.status(404).send('No files found to download.');
        }
      
        // Set the content-disposition header for the response
        res.attachment(objectsToDownload[0].Key);
      
        // Download each file and pipe it to the response stream
        objectsToDownload.forEach((obj) => {
          const s3Stream = s3.getObject(obj).createReadStream();
          s3Stream.on('error', (err) => {
            console.error(err);
            return res.status(500).send(err);
          });
          s3Stream.pipe(res);
        });
      }
});

async function getSignedUrl(bucket, objectName) {
    const options = {
        version: 'v4',
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 minutes (adjust as needed)
    };

    const [url] = await bucket.file(objectName).getSignedUrl(options);
    return url;
}
      
export { findAudioBook, uploadBook, saveUploadedBook, downloadBook, uploadBookToS3, uploadBookToGoogleCloud };