import createHttpError, { type HttpError } from 'http-errors';
import { client } from '../utils/axios';
import { AxiosError } from 'axios';
import { load, type CheerioAPI } from 'cheerio';
import { type Element } from 'domhandler';
import { type ScrapedLatestPage, type MangaCategoryResult, type MangaChapter } from '../types/parsers/index';

export type LatestPageType = 'updated' | 'newest' | 'added';

async function scrapeLatestPage(pageType: LatestPageType, page: number = 1): Promise<ScrapedLatestPage | HttpError> {
    const res: ScrapedLatestPage = {
        results: [],
        currentPage: page,
        hasNextPage: false,
        totalPages: 1,
    };

    try {
        const content = await client.get(`/${pageType}?page=${page}`);

                        const $: CheerioAPI = load(content.data);

        const totalMangaText = $('section.mt-5 > .head > span').text().trim();
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

                        $('div.original.card-lg > div.unit').each((i: number, el: Element) => {
            const manga: MangaCategoryResult = {
                id: $(el).find('a.poster').attr('href')?.replace('/manga/', '') || null,
                title: $(el).find('div.info > a').text().trim() || null,
                poster: $(el).find('a.poster > div > img').attr('src')?.trim() || null,
                type: $(el).find('div.info > div > span.type').text().trim() || null,
                chapters: [],
            };

                                    $(el).find('ul.content[data-name="chap"] > li').each((i: number, chapEl: Element) => {
                const chapter: MangaChapter = {
                    url: $(chapEl).find('a').attr('href') || null,
                    title: $(chapEl).find('a').attr('title') || null,
                    chapter: $(chapEl).find('a > span:first-child').text().trim() || null,
                    releaseDate: $(chapEl).find('a > span:last-child').text().trim() || null,
                };
                manga.chapters?.push(chapter);
            });

            res.results.push(manga);
        });

        return res;
    } catch (err: any) {
        if (err instanceof AxiosError) {
            throw createHttpError(err?.response?.status || 500, err?.response?.statusText || 'Something went wrong');
        }
        throw createHttpError.InternalServerError(err?.message);
    }
}

export default scrapeLatestPage;
