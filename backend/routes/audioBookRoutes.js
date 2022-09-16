import express from 'express';
import { scrapeAudioBooks, findAudioBook } from '../controllers/audioBookController.js';
const router = express.Router();
router.get('/', scrapeAudioBooks);
router.get('/:bookName', findAudioBook)


export default router;