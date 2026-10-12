import { Router } from 'express';
import { sendOrderConfirmationNotification } from '../controllers/notificationController';

const router: Router = Router();

// POST /api/notifications/order-confirmation
router.post('/order-confirmation', sendOrderConfirmationNotification);

export default router;
