import express from 'express';
import { scrapeAudioBooks, findAudioBook } from '../controllers/audioBookController.js';
import { searchBooks } from '../controllers/bookController.js';
const router = express.Router();
router.post('/search', searchBooks);
router.get('/', scrapeAudioBooks);
router.get('/:bookName', findAudioBook)


export default router;