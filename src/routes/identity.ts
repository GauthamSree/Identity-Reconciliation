import { Router } from 'express';
import controller from '../controllers/identity.js'

const router = Router();

router.get('/', controller.getWelcomeMessage);
router.post('/identity', controller.findIdentity);

export default router;