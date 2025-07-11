import { AxiosError } from 'axios';
import { load, type CheerioAPI } from 'cheerio';
import { type Element } from 'domhandler';
import createHttpError, { HttpError } from 'http-errors';
import { client } from '../utils/axios';
import {
    MangaChapter,
    ScrapedSearchResults,
    SearchResult
} from '../types/parsers';

export const scrapeSearchResults = async (keyword: string, page: number = 1): Promise<ScrapedSearchResults | HttpError> => {
    const res: ScrapedSearchResults = {
        currentPage: page,
        totalPages: 0,
        results: [],
    };

    try {
        const content = await client.get(`/filter?keyword=${keyword}&page=${page}`);

        const $ = load(content.data);

        let totalPages = 0;
        const pageLinks = $('ul.pagination > li.page-item > a');
        if (pageLinks.length > 0) {
                        pageLinks.each((i: number, el: Element) => {
                const pageNum = parseInt($(el).text());
                if (!isNaN(pageNum) && pageNum > totalPages) {
                    totalPages = pageNum;
                }
            });
        }

        if (totalPages === 0) {
            const totalMangasText = $('section.mt-5 > .head > span').text();
            const totalMangas = parseInt(totalMangasText.replace('mangas', '').trim());
            const resultsOnPage = $('div.original.card-lg > div.unit').length;
            if (!isNaN(totalMangas) && resultsOnPage > 0) {
                totalPages = Math.ceil(totalMangas / resultsOnPage);
            } else if (!isNaN(totalMangas) && totalMangas === 0) {
                totalPages = 0;
            } else {
                totalPages = 1;
            }
        }
        res.totalPages = totalPages;

                $('div.original.card-lg > div.unit').each((i: number, el: Element) => {
            const searchResult: SearchResult = {
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
                searchResult.chapters?.push(chapter);
            });

            res.results.push(searchResult);
        });

        return res;
    } catch (err: any) {
        if (err instanceof AxiosError) {
            throw createHttpError(err?.response?.status || 500, err?.response?.statusText || 'Something went wrong');
        }
        throw createHttpError.InternalServerError(err?.message);
    }
};
