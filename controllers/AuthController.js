/**
 * Auth Controllers to contain functions for authenticating.
 */

// imports.

import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

/**
 * getConnect - router function to take req and res.
 * @req : Express request object.
 * @res : Express response object.
 *
 * return : Nil. But res sends some object.
 */

async function getConnect(req, res) {
  const authorizationHeaderString = req.get('Authorization').slice(6);
  // const decodedString = atob(authorizationHeaderString);
  const decodedString = (Buffer.from(authorizationHeaderString, 'base64')).toString('utf8');
  const [email, password] = decodedString.split(':');
  const user = await dbClient.findUser(email);
  if (user === false) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (user.encryptedPassword !== sha1(password)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const randomToken = uuidv4();
  await redisClient.set(`auth_${randomToken}`, user._id, 24 * 3600);
  res.status(200).json({ token: randomToken });
}

/**
  * getDisconnect - router function to take req and res and deletes session token.
  * @req : express req object.
  * @res : express response object.
  *
  * return - Nothing. But response object returns some object.
  */

async function getDisconnect(req, res) {
  const userToken = req.get('X-Token');
  const userId = await redisClient.get(`auth_${userToken}`);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  await redisClient.del(`auth_${userToken}`);
  res.status(204).json();
}

module.exports = { getConnect, getDisconnect };
