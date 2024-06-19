// This module contains the controllers functions.

import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AppController {
  /**
  * getStatus: Function to take req and res object of express,
  * and return the status of redis and mongo to the res obj.
  *
  * @req - request object of expressJS.
  * @res - response object of expressJS.
  *
  * return: None. But res will return object desire.
  */

  static getStatus(req, res) {
    const payLoad = { redis: redisClient.isAlive(), db: dbClient.isAlive() };
    res.json(payLoad);
  }

  /**
  * getStats: Function to take req and res object of express,
  * and respond with number of users and files.
  *
  * @req - request object of expressJS.
  * @res - response object of expressJS.
  *
  * return: None. But res will return object desire.
  */

  static async getStats(req, res) {
    const payLoad = { users: await dbClient.nbUsers(), files: await dbClient.nbFiles() };
    res.json(payLoad);
  }
}

// module.exports = { getStatus, getStats };
export default AppController;
