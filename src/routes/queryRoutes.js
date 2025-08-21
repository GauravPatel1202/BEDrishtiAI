
import { Router } from 'express';
import * as queryCtrl from '../controllers/queryController.js';

const router = Router();
router.post('/query', queryCtrl.createQuery);
router.get('/queries', queryCtrl.getQueries);

export default router;