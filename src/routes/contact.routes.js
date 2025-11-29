import { Router } from 'express';
import { contactController } from '../controllers/contact.controller.js';

const router = Router();

router.post('/', contactController.create);
router.get('/', contactController.list);

export default router;
