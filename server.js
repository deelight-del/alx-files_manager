/**
 * Define the Server.js Application.
 */

import express from 'express';
import router from './routes/index';

const port = process.env.PORT ? process.env.PORT : 5000;

const app = express();

router(app);

app.listen(port, () => {
  console.log('Server started on port', port);
});
