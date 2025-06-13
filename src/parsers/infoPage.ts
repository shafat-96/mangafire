import { SRC_BASE_URL, ACCEPT_HEADER, USER_AGENT_HEADER, ACCEPT_ENCODING_HEADER, ACCEPT_LANGUAGE_HEADER } from '../utils/index';
import createHttpError, { type HttpError } from 'http-errors';
import axios, { AxiosError } from 'axios';
import { load, type CheerioAPI } from 'cheerio';
import { type ScrapedManga, type MangaDetails, type RelatedManga } from '../types/parsers/index';

async function scrapeMangaInfo(id: string): Promise<ScrapedManga | HttpError> {
    const res: ScrapedManga = {
        mangaInfo: {
            title: null,
            altTitles: null,
            poster: null,
            status: null,
            type: null,
            description: null,
            author: null,
            published: null,
            genres: [],
            rating: null,
            chapters: [],
        },
        relatedManga: [],
        similarManga: [],
    };

    try {
        const scrapeUrl = `${SRC_BASE_URL}/manga/${id}`;
        const content = await axios.get(scrapeUrl, {
            headers: {
                'User-Agent': USER_AGENT_HEADER,
                'Accept-Encoding': ACCEPT_ENCODING_HEADER,
                Accept: ACCEPT_HEADER,
                Referer: SRC_BASE_URL,
                'Accept-Language': ACCEPT_LANGUAGE_HEADER,
            },
        });

        const $ = load(content.data);

        const mangaInfo: MangaDetails = {
            title: $('h1[itemprop="name"]').text().trim(),
            altTitles: $('h1[itemprop="name"]').siblings('h6').text().trim(),
            poster: $('.poster img')?.attr('src')?.trim() || null,
            status: $('.info > p').first().text().trim(),
            type: $('.min-info a').first().text().trim(),
            description: $('.description').text().replace('Read more +', '').trim(),
            author: $('.meta div:contains("Author:") a').text().trim(),
            published: $('.meta div:contains("Published:")').text().replace('Published:', '').trim(),
            genres: $('.meta div:contains("Genres:") a').map((i, el) => $(el).text().trim()).get(),
            rating: $('.rating-box .live-score').text().trim(),
        };

        // Scraping Similar Manga (Trending)
        $('section.side-manga.default-style div.original.card-sm.body a.unit').each((i, el) => {
            const manga: RelatedManga = {
                id: $(el).attr('href')?.split('/').pop() || null,
                name: $(el).find('.info h6').text().trim() || null,
                poster: $(el).find('.poster img').attr('src')?.trim() || null,
            };
            res.similarManga.push(manga);
        });

        // NOTE: The provided HTML does not contain a "Related Manga" section.
        // The "Trending" section is being used for "Similar Manga".

        res.mangaInfo = mangaInfo;

        return res;
    } catch (err: any) {
        if (err instanceof AxiosError) {
            throw createHttpError(err?.response?.status || 500, err?.response?.statusText || 'Something went wrong');
        }
        throw createHttpError.InternalServerError(err?.message);
    }
}

export default scrapeMangaInfo;
