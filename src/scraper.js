import puppeteer from 'puppeteer';
import _ from 'lodash';

const urlScraper = async (DESTINATION_URL) => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(DESTINATION_URL, {
      waitUntil: 'networkidle2',
    });

    const data = await page.evaluate(
      ({ DESTINATION_URL }) => {
        const getMeta = (metaName) => {
          const metas = document.querySelectorAll('meta');

          for (let i = 0; i < metas.length; i++) {
            if (metas[i].getAttribute('name') === metaName) {
              return metas[i].getAttribute('content');
            }
          }

          return '';
        };

        const allATags = document.querySelectorAll('a');
        const links = [];

        for (const link of allATags) {
          links.push(link.href);
        }
        const title = document.title;
        const description = getMeta('description');
        const twitterDescription = getMeta('twitter:description');

        const uniqueLinks = _.uniq(links);
        const urls = _.filter(
          uniqueLinks,
          (link) => !/^[tel|mailto]/.test(link)
        );

        let httpCounter = 0;
        let httpsCounter = 0;
        let sameDomain = 0;
        let differentDomain = 0;

        for (const url of urls) {
          if (url.startsWith('https://')) httpsCounter++;
          else if (url.startsWith('http://')) httpCounter++;

          if (url.includes(DESTINATION_URL)) sameDomain++;
          else differentDomain++;
        }

        return {
          links: urls,
          title,
          description,
          twitterDescription,
          httpCounter,
          httpsCounter,
          totalUrlCount: urls.length,
          sameDomain,
          differentDomain,
        };
      },
      { DESTINATION_URL }
    );

    await browser.close();
    return data;
    // setTimeout(async () => {
    //   await browser.close();
    // }, 6000);
  } catch (err) {
    console.log('ERROR', err);
  }
};

export default urlScraper;
