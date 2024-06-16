/**
 * Define default route function that takes app.
 */

/*
 * router - Function to take @app and route it resepectively.
 * @app: app is an express app instance.
 *
 * return: Void.
 */

import { Router } from 'express';
import controllers from '../controllers/AppController';

const router = Router();

router.get('/status', controllers.getStatus);
router.get('/stats', controllers.getStats);

module.exports = router;

// module.exports = function router(app) {
//  app.get('/status', (req, res) => {
//    getStatus(req, res);
//  });
//  app.get('/stats', async (req, res) => {
//    await getStats(req, res);
//  });
// };
