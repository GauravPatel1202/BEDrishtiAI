
import { Router } from 'express';
import * as queryCtrl from '../controllers/queryController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.post('/query',  queryCtrl.createQuery);
router.get('/queries', queryCtrl.getQueries);

export default router;
