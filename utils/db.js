/**
 * Create A Db Client.
 * That uses MongoDB
 */

import { MongoClient, ObjectId } from 'mongodb';
import { promisify } from 'util';
// import { strict as assert } from 'assert';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${host}:${port}`;
    // this.db = undefined;
    this.connected = false;
    this.client = MongoClient.connect(uri, (err, client) => {
      if (err || !client) {
        this.connected = false;
        console.log('Error while connecting', err || 'Unavailabe Server');
        // return;
      } else {
        this.connected = true;
        // console.log('Connected');
        this.db = client ? client.db(database) : undefined;
      }
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
  * findUserById - returns False if user does not exist, other wise return the found User.
  * @email : email of user to find.
  *
  * Return - False || User object.
  */

  async findUserById(id) {
    if (!this.isAlive()) { return undefined; }
    const user = await this.db.collection('users').findOne({ _id: new ObjectId(id) });
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

  /**
  * findFilesById - Function to find file given thd id of the file.
  * @id : id of the file to find.
  *
  * return: false || file object.
  */
  async findFilesById(id) {
    if (!this.isAlive()) { return undefined; }
    const file = await this.db.collection('files').findOne({ _id: new ObjectId(id) });
    if (!file) {
      return false;
    }
    return file;
  }

  /**
  * saveFile - Function to save a file docuemnt.
  * @fileObject: The file Object to save.
  *
  * return : The id of the saved object.
  */
  async saveFile(fileObject) {
    if (!this.isAlive()) { return undefined; }
    const saveResult = await (promisify(
      this.db.collection('files').insertOne,
    ).bind(this.db.collection('files'))
    )(fileObject);
    // console.log('result ops[0].i', saveResult.ops[0]._id);
    return saveResult.ops[0]._id;
  }

  /**
  * paginateFilesByParentId - Functions to paginate the result of a
  * serarch by parentId, and return it as an array.
  * @parentId : parentId to match our reuslt against.
  * @pageNumber : The pageNumber that is zero index.
  *
  * result : undefined || array.
  */

  async paginateFilesByParentId(userId, parentId, pageNumber, limit) {
    if (!this.isAlive()) { return undefined; }
    const findQuery = this.db.collection('files').find({ userId, parentId }, { limit, skip: pageNumber * limit });
    const arrayOfUsers = await (promisify(findQuery.toArray).bind(findQuery))();
    return arrayOfUsers;
  }

  /**
   * updateFileById - function to update a given document in the
   * mongodb.
   * @id : id of the file to update.
   * @field : field to upload.
   * @value : value to update field to.
   *
   * return : --------
   */
  async updateFileById(id, field, value) {
    await this.db.collection('files').updateOne(
      { _id: new ObjectId(id) },
      { $set: { [field]: value } },
    );
    const result = await this.findFilesById(id);
    return result;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
