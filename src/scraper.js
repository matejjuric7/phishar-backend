import puppeteer from 'puppeteer';

const includeProtocol = (url) => {
  if (!url.includes('http://') && !url.includes('https://')) {
    return `https://${url}`; // needs to be secure
  }
  return url;
};

const linkScraper = async (destinationUrl) => {
  let browser; // so it's accessible inside catch
  try {
    const URL = includeProtocol(destinationUrl);

    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: 'networkidle2' });
    await page.addScriptTag({ path: './node_modules/lodash/lodash.min.js' });

    const data = await page.evaluate(
      async ({ URL }) => {
        const getAllLinks = () => {
          const allATags = document.querySelectorAll('a');
          const allScriptTags = document.querySelectorAll('script');
          const links = [...allATags, ...allScriptTags];

          const result = [];
          for (const link of links) {
            if (link.href) result.push(link.href);
            else if (link.src) result.push(link.src);
          }
          return result;
        };

        const getMeta = (metaName) => {
          const metas = document.querySelectorAll('meta');

          for (const meta of metas) {
            if (meta.getAttribute('name') === metaName) {
              return meta.getAttribute('content');
            }
          }

          return '';
        };

        const getCounts = (urls, domain) => {
          let httpCount = 0;
          let httpsCount = 0;
          let sameDomainCount = 0;
          let differentDomainCount = 0;

          for (const url of urls) {
            if (url.startsWith('https://')) httpsCount++;
            else if (url.startsWith('http://')) httpCount++;

            if (url.includes(domain)) sameDomainCount++;
            else differentDomainCount++;
          }

          return {
            httpCount,
            httpsCount,
            sameDomainCount,
            differentDomainCount,
          };
        };

        const processUrls = (links) => {
          const _ = window._;
          const uniqueLinks = _.uniq(links);
          return _.sortBy(
            _.filter(
              uniqueLinks,
              (link) => !/^[tel|mailto]/.test(link) && link !== ''
            )
          );
        };

        const getDomain = () => {
          const hostname = URL.split('/')[2]; // --> https://```www.google.com```/
          return hostname.split('.').slice(-2).join('.'); // --> www.```google.com```
        };

        const links = getAllLinks();

        const urls = processUrls(links);

        const domain = getDomain();

        const { httpCount, httpsCount, sameDomainCount, differentDomainCount } =
          getCounts(urls, domain);

        return {
          links: urls,
          title: document.title,
          description: getMeta('description'),
          totalUrlCount: urls.length,
          httpCount,
          httpsCount,
          sameDomainCount,
          differentDomainCount,
        };
      },
      { URL }
    );

    await browser.close();

    return data;
  } catch (err) {
    console.log('ERROR', err);
    await browser.close();
  }
};

export default linkScraper;
