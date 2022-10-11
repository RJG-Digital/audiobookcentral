import express from 'express';
import { findAudioBook, uploadBook } from '../controllers/audioBookController.js';
import { searchBooks } from '../controllers/bookController.js';
const router = express.Router();
router.post('/search', searchBooks);
router.post('/upload', uploadBook);
router.get('/:bookName', findAudioBook);

export default router;