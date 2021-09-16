import express from 'express';

import urlScraper from '../scraper.js';

const router = express.Router();

router.post('/', async (req, res) => {
  console.log('STARTED');
  const data = await urlScraper(req.body.url);
  res.json(data);
  console.log('FINISHED');
});

export default router;
