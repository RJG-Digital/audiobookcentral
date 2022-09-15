import express from 'express';
import { scrapeAudioBooks } from '../controllers/audioBookController.js';
const router = express.Router();
router.get('/', scrapeAudioBooks);


export default router;