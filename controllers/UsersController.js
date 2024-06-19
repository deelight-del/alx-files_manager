/**
 * Module that contains definition for the
 * User Controllers.
 */

import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

/**
  * postNew - functon to add new user to the d.b.
  * @req: The request object.
  * @res: The response object from express.
  */

async function postNew(req, res) {
  const { email } = req.body;
  const { password } = req.body;
  if (email === undefined) {
    res.status(400).json({ error: 'Missing email' });
    return;
  }
  if (password === undefined) {
    res.status(400).json({ error: 'Missing password' });
    return;
  }
  const user = await dbClient.findUser(email);
  // console.log('This is the user', user);
  if (user === undefined) {
    res.json();
    return;
  }
  if (user !== false) {
    res.status(400).json({ error: 'Already exist' });
    return;
  }
  const shaPassword = sha1(password);
  const _id = await dbClient.saveUser(email, shaPassword);
  res.status(201).json({ id: _id, email });
}

/**
  * getMe - Function to get the corresponding id and email of the user.
  * @req : Express request object.
  * @res : Express response object.
  *
  * return - Nothing. But res returns some object.
  */
async function getMe(req, res) {
  const userToken = req.get('X-Token');
  const userId = await redisClient.get(`auth_${userToken}`);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const user = await dbClient.findUserById(userId);
  res.status(200).json({ id: userId, email: user.email });
}

module.exports = { postNew, getMe };
