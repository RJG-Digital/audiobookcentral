import express from 'express';
import { findAudioBook, uploadBook, saveUploadedBook } from '../controllers/audioBookController.js';
import { searchBooks } from '../controllers/bookController.js';
const router = express.Router();
router.post('/search', searchBooks);
router.post('/upload', uploadBook);
router.post('/saveUpload', saveUploadedBook);
router.get('/:bookName', findAudioBook);

export default router;