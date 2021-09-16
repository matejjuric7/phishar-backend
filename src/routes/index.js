import express from 'express';

import linkScraper from '../scraper.js';

const router = express.Router();

router.get('/', (_, res) => res.json({ ok: 'ok' }));

router.post('/', async (req, res) => {
  try {
    const data = await linkScraper(req.body.url);
    if (!data) {
      throw new Error('Something went wrong');
    }
    res.json(data);
  } catch (error) {
    console.log('ERROR', error);
    res.json({ error: error.message });
  }
});

export default router;
