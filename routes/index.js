/**
 * Define default route function that takes app.
 */

/*
 * router - Function to take @app and route it resepectively.
 * @app: app is an express app instance.
 *
 * return: Void.
 */

import { getStatus, getStats } from '../controllers/AppController';

module.exports = function router(app) {
  app.get('/status', (req, res) => {
    getStatus(req, res);
  });
  app.get('/stats', async (req, res) => {
    await getStats(req, res);
  });
};
