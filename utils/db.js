/**
 * Create A Db Client.
 * That uses MongoDB
 */

import { MongoClient } from 'mongodb';
import { promisify } from 'util';
// import { strict as assert } from 'assert';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST ? process.DB_HOST : 'localhost';
    const port = process.env.DB_PORT ? process.DB_PORT : 27017;
    const database = process.env.DB_DATABASE ? process.DB_DATABASE : 'files_manager';
    const uri = `mongodb://${host}:${port}`;
    // this.db = undefined;
    this.connected = false;
    this.client = MongoClient.connect(uri, (err, client) => {
      if (err || !client) {
        this.connected = false;
        console.log('Error while connecting', err || 'Unavailabe Server');
        return;
      }
      this.connected = true;
      // console.log('Connected');
      this.db = client.db(database);
    });
  }

  /**
  * isAlive - Function to check if conn. is alive or not.
  *
  * return: Bool.
  */
  isAlive() {
    return this.connected;
  }

  /**
  * nbUsers - returns the number of users in the users documents.
  *
  * return: undefined || number of users.
  */

  async nbUsers() {
    if (!this.isAlive()) { return undefined; }
    const findQuery = this.db.collection('users').find();
    const arrayOfUsers = await (promisify(findQuery.toArray).bind(findQuery))();
    return arrayOfUsers.length;
  }

  /**
  * nbFiles - Function to return number of files.
  *
  * return - undefined if disconn. || number of files.
  */

  async nbFiles() {
    if (!this.isAlive()) { return undefined; }
    const findQuery = this.db.collection('files').find();
    const arrayOfUsers = await (promisify(findQuery.toArray).bind(findQuery))();
    return arrayOfUsers.length;
  }

  /**
  * findUser - returns False if user does not exist, other wise return the found User.
  * @email : email of user to find.
  *
  * Return - False || User object.
  */

  async findUser(email) {
    if (!this.isAlive()) { return undefined; }
    // const findQuery = this.db.collection('users').find();
    const user = await this.db.collection('users').findOne({ email });
    if (!user) {
      return false;
    }
    return user;
  }

  /**
  * saveUser - Function to save a user and return id and email of saved
  * user in an object.
  * @email : email of the user to save (string.)
  * @encryptedPassword : sha1 password of user (string)
  *
  * Return - object containing id and email of added user.
  */
  async saveUser(email, encryptedPassword) {
    if (!this.isAlive()) { return undefined; }
    const saveResult = await (promisify(
      this.db.collection('users').insertOne,
    ).bind(this.db.collection('users'))
    )({ email, encryptedPassword });
    return saveResult.ops[0]._id;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
