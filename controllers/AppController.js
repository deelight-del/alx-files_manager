// This module contains the controllers functions.

import dbClient from '../utils/db';
import redisClient from '../utils/redis';

/**
  * getStatus: Function to take req and res object of express,
  * and return the status of redis and mongo to the res obj.
  *
  * @req - request object of expressJS.
  * @res - response object of expressJS.
  *
  * return: None. But res will return object desire.
  */

function getStatus(req, res) {
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

async function getStats(req, res) {
  const payLoad = { users: dbClient.nbUsers(), files: dbClient.nbFiles() };
  res.json(payLoad);
}

module.exports = { getStatus, getStats };
