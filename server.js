/**
 * Define the Server.js Application.
 */

import express from 'express';
import router from './routes/index';

const port = process.env.PORT ? process.env.PORT : 5000;

const app = express();
app.use(express.json());

app.use(router);

app.listen(port, (err) => {
  if (err) console.log(err);
  console.log(`Server running on port ${port}`);
});

export default app;
