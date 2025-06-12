import { SRC_BASE_URL, SRC_HOME_URL, ACCEPT_HEADER, USER_AGENT_HEADER, ACCEPT_ENCODING_HEADER } from '../utils/index';
import createHttpError, { type HttpError } from 'http-errors';

//  import puppeteer from 'puppeteer-extra';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// import superagent, { SuperAgent } from 'superagent';
import axios, { AxiosError } from 'axios';
import { load, type CheerioAPI, type SelectorType } from 'cheerio';
import { type ScrapedMangaCategory, type MangaCategoryResult, type MangaChapter } from '../types/parsers/index';
import { type MangaCategories } from '../types/manga';

async function scrapedMangaCategory(category: MangaCategories, page: number = 1): Promise<ScrapedMangaCategory | HttpError> {
    const res: ScrapedMangaCategory = {
        mangaCategory: [],
        totalEntities: '',
        category,
        currentPage: page,
        hasNextPage: false,
        totalPages: 1
    };
    try {
        // puppeteer.use(StealthPlugin());
        // const browser = await puppeteer.launch({
        //     headless: true,
        //     args: [' --no-sandbox', '--disable-setuid-sandbox', '--dns-prefetch-disable'],
        //     ignoreDefaultArgs: ['--disable-extensions']
        // });
        // const page = await browser.newPage();
        // await page.setJavaScriptEnabled(true);
        // await page.setUserAgent(
        //     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        // );
        // await page.setDefaultNavigationTimeout(20000);
        // await page.goto(SRC_HOME_URL, { waitUntil: 'networkidle2' });
        // const content = await page.content();

        // await browser.close();
        const scrapeUrl: URL = new URL(`${SRC_BASE_URL}/type/${category}`);
        const content = await axios.get(`${scrapeUrl}?page=${page} `, {
            headers: {
                'User-Agent': USER_AGENT_HEADER,
                'Accept-Encoding': ACCEPT_ENCODING_HEADER,
                Accept: ACCEPT_HEADER
            }
        });

        const $: CheerioAPI = load(content.data);

        const totalMangaText = $('section.mt-5 > .head > span').text().trim();
        res.totalEntities = totalMangaText;
        const totalMangaMatch = totalMangaText.match(/(\d{1,3}(,\d{3})*)/);
        const totalManga = totalMangaMatch ? parseInt(totalMangaMatch[0].replace(/,/g, '')) : 0;

        const mangaOnPage = $('div.original.card-lg > div.unit').length;

        let totalPages = 1;
        if (totalManga > 0 && mangaOnPage > 0) {
            totalPages = Math.ceil(totalManga / mangaOnPage);
        } else if ($('div.original.card-lg > div.unit').length > 0) {
            totalPages = 1;
        }

        res.totalPages = totalPages;
        res.hasNextPage = page < totalPages;

        $('div.original.card-lg > div.unit').each((i, el) => {
            const manga: MangaCategoryResult = {
                id: $(el).find('a.poster').attr('href')?.replace('/manga/', '') || null,
                title: $(el).find('div.info > a').text().trim() || null,
                poster: $(el).find('a.poster > div > img').attr('src')?.trim() || null,
                type: $(el).find('div.info > div > span.type').text().trim() || null,
                chapters: [],
            };

            $(el).find('ul.content[data-name="chap"] > li').each((i, chapEl) => {
                const chapter: MangaChapter = {
                    url: $(chapEl).find('a').attr('href') || null,
                    title: $(chapEl).find('a').attr('title') || null,
                    chapter: $(chapEl).find('a > span:first-child').text().trim() || null,
                    releaseDate: $(chapEl).find('a > span:last-child').text().trim() || null,
                };
                manga.chapters?.push(chapter);
            });

            res.mangaCategory.push(manga);
        });

        return res;
    } catch (err: any) {
        if (err instanceof AxiosError) {
            throw createHttpError(err?.response?.status || 500, err?.response?.statusText || 'Something went wrong');
        }
        throw createHttpError.InternalServerError(err?.message);
    }
    // or handle the error in a different way
}

export default scrapedMangaCategory;
