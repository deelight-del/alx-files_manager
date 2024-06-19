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
import userControllers from '../controllers/UsersController';
import authControllers from '../controllers/AuthController';
import fileControllers from '../controllers/FilesController';

const router = Router();

// utilities route.
router.get('/status', controllers.getStatus);
router.get('/stats', controllers.getStats);

// sign-up route.
router.post('/users', userControllers.postNew);

// users route.
router.get('/users/me', userControllers.getMe);

// Sign-in route.
router.get('/connect', authControllers.getConnect);

// Log-out route.
router.get('/disconnect', authControllers.getDisconnect);

// files route.
router.post('/files', fileControllers.postUpload);
router.get('/files/:id', fileControllers.getShow);
router.get('/files', fileControllers.getIndex);
router.put('/files/:id/publish', fileControllers.putPublish);
router.put('/files/:id/unpublish', fileControllers.putUnpublish);

module.exports = router;

// module.exports = function router(app) {
//  app.get('/status', (req, res) => {
//    getStatus(req, res);
//  });
//  app.get('/stats', async (req, res) => {
//    await getStats(req, res);
//  });
// };
