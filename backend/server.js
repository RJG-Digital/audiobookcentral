import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import colors from 'colors';
import bodyParser from 'body-parser';
import audioBookRoutes from './routes/audioBookRoutes.js';
import http from 'http';
import { Server } from 'socket.io';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import AudioBook from './models/audioBook.js';
import fs from 'fs';
import https from 'https';
import fileupload from 'express-fileupload';
import AWS from 'aws-sdk';

dotenv.config();
connectDB();
const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileupload({
    createParentPath: true,
    limits: {
        fileSize: 1000000000
    }
}))
app.get('/', (req, res) => {
    res.send('hello');
})
app.use('/api/books', audioBookRoutes);
app.use(notFound);
app.use(errorHandler);
const options = {
    key: fs.readFileSync('./backend/certificates/key.pem'),
    cert: fs.readFileSync('./backend/certificates/cert.pem')
};
const server = https.createServer(options, app, function (req, res) {
    res.writeHead(200);
})
const io = new Server(server, { cors: { origin: '*' } });

// io.on('connection', (socket) => {
//     console.log('connected')
//     socket.on('download', (book) => {
//         let count = 0;
//         const dir = `C:/audioBooks/onlineBooks/${book.author}/${book.title}`;
//         const webDir = `https://books.rjgdigitalcreations.com/onlineBooks/${book.author}/${book.title}`
//         if (!fs.existsSync(dir)) {
//             fs.mkdirSync(dir, { recursive: true });
//         }
//         for (let i = 0; i < book.tracks.length; i++) {
//             https.get(book.tracks[i].path, (resp) => {
//                 // store the file
//                 const path = `${dir}/${book.title}-${(i + 1) < 10 ? '0' + (i + 1) : (i + 1)}.mp3`;
//                 const webPath = `${webDir}/${book.title}-${(i + 1) < 10 ? '0' + (i + 1) : (i + 1)}.mp3`;
//                 const filePath = fs.createWriteStream(path);
//                 resp.pipe(filePath);
//                 filePath.on('finish', async () => {
//                     filePath.close();
//                     count++;
//                     socket.emit('downloading', ({ progress: (count / book.tracks.length), track: count, total: book.tracks.length }));
//                     console.log('Download Completed');
//                     book.tracks[i].path = webPath;
//                     console.log(count, ' ', book.tracks.length)
//                     if (count === (book.tracks.length)) {
//                         const audioBooks = await AudioBook.find({ authorTitle: book.authorTitle });
//                         if (!audioBooks || audioBooks.length === 0) {
//                             await AudioBook.create(book);
//                         }
//                         socket.emit('downloaded', book);
//                     }
//                 })
//             });
//         }
//     });
// })

io.on('connection', (socket) => {
    console.log('connected')
    socket.on('download', (book) => {
        // store the file
        const s3 = new AWS.S3({
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECERET_ACCESS_KEY,
            region: process.env.S3_BUCKET_REGION,
        });
        const bucketName = process.env.S3_BUCKET_NAME;
        const folderPath = `audioBooks/${book.author}/${book.title}`;
        let count = 0;
        for (let i = 0; i < book.tracks.length; i++) {
            https.get(book.tracks[i].path, (resp) => {

                const path = `${folderPath}/${book.title}-${(i + 1) < 10 ? '0' + (i + 1) : (i + 1)}.mp3`;
                const params = {
                    Bucket: bucketName,
                    Key: path,
                    contentType: 'audio/mpeg'
                }
                params.Body = resp;
                s3.upload(params, async (err, data) => {
                    if (err) {
                        console.log(`Error uploading file: ${err}`);
                    } else {
                        console.log(`File uploaded successfully: ${data.Location}`);
                        count++;
                        socket.emit('downloading', ({ progress: (count / book.tracks.length), track: count, total: book.tracks.length }));
                        console.log('Download Completed');
                        book.tracks[i].path = data.Location;
                        console.log(count, ' ', book.tracks.length)
                        if (count === (book.tracks.length)) {
                            const audioBooks = await AudioBook.find({ authorTitle: book.authorTitle });
                            if (!audioBooks || audioBooks.length === 0) {
                                await AudioBook.create(book);
                            }
                            socket.emit('downloaded', book);
                        }
                    }
                });
            });
        }
       
    });
})
server.listen(PORT, () => {
    console.log(`Server is now running on port ${PORT}`.green.inverse);
});