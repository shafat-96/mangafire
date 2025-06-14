import createHttpError, { type HttpError } from 'http-errors';
import { client } from '../utils/axios';
import { AxiosError } from 'axios';
import { load } from 'cheerio';
import { type Element } from 'domhandler';
import { type ScrapedManga, type MangaDetails, type MangaChapter, type RelatedManga, Chapter } from '../types/parsers/index';

export async function getChapters(
    mangaId: string,
    language: string = "en"
): Promise<Chapter[] | HttpError> {
    try {
        const response = await client.get(
            `/ajax/read/${mangaId.split(".")[1]}/chapter/${language.toLowerCase()}`,
            {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                }
            }
        );

        const responseJson: { result: { html: string } } = response.data;
        const $ = load(responseJson.result.html);
        const chapters: Chapter[] = [];

                $("li").each((_: number, li: Element) => {
            const a = $(li).find("a");
            const title = a.find('span:first-child').text().trim();
            const releaseDate = a.find('span:last-child').text().trim();

            chapters.push({
                number: $(a).attr("data-number") ?? "",
                title: title,
                chapterId: $(a).attr("data-id") ?? "",
                language: language,
                releaseDate: releaseDate || null
            });
        });
        return chapters;
    } catch (err: any) {
        if (err instanceof AxiosError) {
            throw createHttpError(err?.response?.status || 500, err?.response?.statusText || 'Something went wrong');
        }
        throw createHttpError.InternalServerError(err?.message);
    }
}

export async function getChapterImages(chapterId: string): Promise<string[] | HttpError> {
    try {
        const response = await client.get(
            `/ajax/read/chapter/${chapterId}`,
            {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                }
            }
        );

        const responseJson: { result: { images: string[][] } } =
            response.data;
        return responseJson.result.images.map((image) => image[0]);
    } catch (err: any) {
        if (err instanceof AxiosError) {
            throw createHttpError(err?.response?.status || 500, err?.response?.statusText || 'Something went wrong');
        }
        throw createHttpError.InternalServerError(err?.message);
    }
}

export async function scrapeChaptersFromInfoPage(mangaSlug: string): Promise<MangaChapter[] | HttpError> {
    try {
        const content = await client.get(`/manga/${mangaSlug}`);

        const $ = load(content.data);
        const chapters: MangaChapter[] = [];

                $('ul.scroll-sm li.item').each((i: number, el: Element) => {
            const chapter: MangaChapter = {
                url: $(el).find('a').attr('href') || null,
                title: $(el).find('a').attr('title') || null,
                chapter: $(el).find('a > span:first-child').text().trim() || null,
                releaseDate: $(el).find('a > span:last-child').text().trim() || null,
            };
            chapters.push(chapter);
        });

        return chapters;
    } catch (err: any) {
        if (err instanceof AxiosError) {
            throw createHttpError(err?.response?.status || 500, err?.response?.statusText || 'Something went wrong');
        }
        throw createHttpError.InternalServerError(err?.message);
    }
}
