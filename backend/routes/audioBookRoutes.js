import express from 'express';
import { findAudioBook, downloadBook } from '../controllers/audioBookController.js';
import { searchBooks, uploadBook } from '../controllers/bookController.js';
const router = express.Router();
router.post('/search', searchBooks);
router.post('/upload', uploadBook);
router.post('/download', downloadBook);
router.get('/:bookName', findAudioBook);

export default router;