import express from 'express';

import linkScraper from '../scraper.js';

const router = express.Router();

router.get('/', (_, res) => res.json({ ok: 'ok' }));

router.post('/', async (req, res) => {
  const urlRegex =
    /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
  try {
    const { url } = req.body;
    if (!urlRegex.test(url)) {
      throw new Error('Not a valid url');
    }
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
