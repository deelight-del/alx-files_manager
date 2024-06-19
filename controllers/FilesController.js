/**
 * Module to contain controller functions
 * for the files route.
 */

// Make imports.
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

/**
 * postUpload - Function to upload a file and return its metainfo.
 * @req : The express request object.
 * @res : The rexpress response object.
 *
 * return:  Nothing. But response object returns accordingly.
 */

async function postUpload(req, res) {
  const token = req.get('X-Token');
  const userId = await redisClient.get(`auth_${token}`);
  const user = await dbClient.findUserById(userId);

  // if (userId === undefined || user === undefined) {
  // res.status(500).json({});
  //  return;
  // }
  if (user === false) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const { name, type } = req.body;
  const parentId = req.body.parentId || 0;
  const isPublic = req.body.isPublic || false;
  const { data } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Missing name' });
    return;
  }
  if (!type) {
    res.status(400).json({ error: 'Missing type' });
    return;
  }
  if (!data && type !== 'folder') {
    res.status(400).json({ error: 'Missing data' });
    return;
  }
  if (parentId !== 0) {
    const folder = await dbClient.findFilesById(parentId);
    if (!folder) {
      res.status(400).json({ error: 'Parent not found' });
      return;
    }
    if (folder.type !== 'folder') {
      res.status(400).json({ error: 'Parent is not a folder' });
      return;
    }
  }
  if (type === 'folder') {
    const fileObject = {
      userId,
      name,
      type,
      isPublic,
      parentId,
    };
    const id = await dbClient.saveFile(fileObject);
    fileObject.id = id;
    delete fileObject._id;
    res.status(201).json(fileObject);
    return;
  }
  const rootPath = process.env.FOLDER_PATH || '/tmp/files_manager';
  fs.mkdirSync(rootPath, { recursive: true });

  function typeTest() {
    if (type === 'file' || type === 'image') {
      return true;
    }
    return false;
  }

  const newFilePath = `${rootPath}/${uuidv4()}`;
  fs.writeFileSync(newFilePath, Buffer.from(data, 'base64'));
  const fileObject = {
    userId,
    name,
    type,
    isPublic,
    parentId,
    localPath: typeTest() ? newFilePath : undefined,
  };
  const id = await dbClient.saveFile(fileObject);
  fileObject.id = id;
  delete fileObject._id;
  delete fileObject.localPath;
  res.status(201).json(fileObject);
}

/**
  * getShow - Function for endpoint /files/:id. To retrieve document based on
  * id.
  * @req : The express request object.
  * @res : The express response object.
  *
  * return : Nothing. But response object returns back something.
  */

async function getShow(req, res) {
  const token = req.get('X-Token');
  const userId = await redisClient.get(`auth_${token}`);
  const user = await dbClient.findUserById(userId);

  if (user === false) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const fileId = req.params.id;
  const file = await dbClient.findFilesById(fileId);
  if (file === false || file.userId !== userId) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  file.id = file._id;
  delete file._id;
  delete file.localPath;
  res.json(file);
}

/**
  * getIndex - Function to retrieve all users file docs.
  * for a given parentId, and with pagination.
  * @req : The express request object.
  * @res : The express response object.
  *
  * return :  THe response object sends back some information.
  */
async function getIndex(req, res) {
  const token = req.get('X-Token');
  const userId = await redisClient.get(`auth_${token}`);
  const user = await dbClient.findUserById(userId);
  if (user === false) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  let parentId = req.query.parentId || 0;
  const page = req.query.page || 0;

  // Modify charabeter
  if (parentId === '0') { parentId = 0; } else { parentId = String(parentId); }
  const files = await dbClient.paginateFilesByParentId(userId, parentId, page, 20);
  for (const obj of files) {
    obj.id = obj._id;
    delete obj.localPath;
    delete obj._id;
  }
  res.json(files);
}

/**
  * putPublish - Function to make a file public or not.
  * @req : The express request object.
  * @res : The express response object.
  *
  * return : Nothing. But the response object sends something to the user.
  */

async function putPublish(req, res) {
  const token = req.get('X-Token');
  const userId = await redisClient.get(`auth_${token}`);
  const user = await dbClient.findUserById(userId);

  if (user === false) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const fileId = req.params.id;
  let file = await dbClient.findFilesById(fileId);
  if (file === false || file.userId !== userId) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  file = await dbClient.updateFileById(fileId, 'isPublic', true);
  file.id = file._id;
  delete file._id;
  delete file.localPath;
  res.json(file);
}

/**
  * putUnpublish - Function to make a file not public.
  * @req : The express request object.
  * @res : The express response object.
  *
  * return : Nothing. But the response object sends something to the user.
  */

async function putUnpublish(req, res) {
  const token = req.get('X-Token');
  const userId = await redisClient.get(`auth_${token}`);
  const user = await dbClient.findUserById(userId);

  if (user === false) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const fileId = req.params.id;
  let file = await dbClient.findFilesById(fileId);
  if (file === false || file.userId !== userId) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  file = await dbClient.updateFileById(fileId, 'isPublic', false);
  file.id = file._id;
  delete file._id;
  delete file.localPath;
  res.json(file);
}

/**
  * getFile - Function to return content of a file if available.
  * @req : The express request object.
  * @res : The express response object.
  *
  * return : Nothing. But res responds back to user.
  */

async function getFile(req, res) {
  const token = req.get('X-Token');
  const userId = await redisClient.get(`auth_${token}`);
  // const user = await dbClient.findUserById(userId);
  const fileId = req.params.id;
  const file = dbClient.findFilesById(fileId);
  if (file === false) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  if (file.isPublic === false
  && file.userId !== userId) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  if (file.type === 'folder') {
    res.status(400).json({ error: 'A folder doesn\'t have content' });
    return;
  }
  if (!fs.existsSync(file.localPath)) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const derivedMime = mime.lookup(file.name);
  res.set('Content-Type', derivedMime);
  const content = fs.readFileSync(file.localPath);
  console.log(content);
  res.json(content);
}

module.exports = {
  postUpload,
  getShow,
  getIndex,
  putPublish,
  putUnpublish,
  getFile,
};
