// File: backend/src/routes/herbRoutes.js

import express from 'express';
import { recordHerbCollection, getHerbHistory } from '../controllers/herbController.js';

const router = express.Router();

router.post('/collect', recordHerbCollection);
router.get('/:id', getHerbHistory);

export default router;