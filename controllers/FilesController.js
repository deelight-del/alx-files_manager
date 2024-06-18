/**
 * Module to contain controller functions
 * for the files route.
 */

// Make imports.
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
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

  if (userId === undefined || user === undefined) {
    res.status(500).json({});
    return;
  }
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
  // console.log('id', id);
  fileObject.id = id;
  delete fileObject._id;
  delete fileObject.localPath;
  res.status(201).json(fileObject);
}

module.exports = { postUpload };
