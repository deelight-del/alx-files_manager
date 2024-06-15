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
      if (err) {
        this.connected = false;
        // console.log(err);
      }
      this.connected = true;
      // console.log('Connected');
      this.db = client.db(database);
    });
  }

  isAlive() {
    return this.connected;
  }

  async nbUsers() {
    const findQuery = this.db.collection('users').find();
    const arrayOfUsers = await (promisify(findQuery.toArray).bind(findQuery))();
    return arrayOfUsers.length;
  }

  async nbFiles() {
    const findQuery = this.db.collection('files').find();
    const arrayOfUsers = await (promisify(findQuery.toArray).bind(findQuery))();
    return arrayOfUsers.length;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
