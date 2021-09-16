import express from 'express';
import cors from 'cors';

import router from './src/routes/index.js';

const app = express();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', router);

app.use((_, res) => res.sendStatus(404));

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

app.listen(3001, () => console.log('Listening on port 3001'));

export default app;
