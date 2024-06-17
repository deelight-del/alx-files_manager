/**
 * Module that contains definition for the
 * User Controllers.
 */

import sha1 from 'sha1';
import dbClient from '../utils/db';

/**
  * postNew - functon to add new user to the d.b.
  * @req: The request object.
  * @res: The response object from express.
  */

async function postNew(req, res) {
  const { email } = req.body;
  const { password } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Missing email' });
    return;
  }
  if (!password) {
    res.status(400).json({ error: 'Missing password' });
    return;
  }
  const user = await dbClient.findUser(email);
  // console.log('This is the user', user);
  if (user) {
    res.status(400).json({ error: 'Already exist' });
    return;
  }
  const shaPassword = sha1(password);
  const _id = await dbClient.saveUser(email, shaPassword);
  res.status(201).json({ id: _id, email });
}

module.exports = { postNew };
