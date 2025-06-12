import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import createHttpError, { HttpError } from 'http-errors';
import scrapeHomePage from './parsers/homePage';
import scrapeMangaInfo from './parsers/infoPage';
import { scrapeSearchResults } from './parsers/searchPage';
import scrapedMangaCategory from './parsers/categoryPage';
import { MangaCategories, MANGA_GENRES, MangaGenre } from './types/manga';
import scrapedMangaGenre from './parsers/genrePage';
import { getChapters, getChapterImages, scrapeChaptersFromInfoPage } from './parsers/readPage';
import scrapeLatestPage from './parsers/latestPage';
import { Chapter, MangaChapter } from './types/parsers';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('MangaFire API is running!');
});

app.get('/api/home', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await scrapeHomePage();
        res.json(data);
    } catch (error) {
        next(error);
    }
});

app.get('/api/search/:keyword', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const keyword = req.params.keyword;
        const page = req.query.page ? Number(req.query.page) : 1;

        const data = await scrapeSearchResults(keyword, page);

        res.status(200).json(data);
    } catch (err: any) {
        next(err);
    }
});

app.get('/api/category/:category', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category = req.params.category as MangaCategories;
        const page = req.query.page ? Number(req.query.page) : 1;

        const validCategories: MangaCategories[] = ['manga', 'one-shot', 'doujinshi', 'novel', 'manhwa', 'manhua'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ error: 'Invalid category' });
        }

        const data = await scrapedMangaCategory(category, page);

        res.status(200).json(data);
    } catch (err: any) {
        next(err);
    }
});

app.get('/api/genre/:genre', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const genre = req.params.genre as MangaGenre;
        const page = req.query.page ? Number(req.query.page) : 1;

        if (!MANGA_GENRES.includes(genre)) {
            return res.status(400).json({ error: 'Invalid genre' });
        }

        const data = await scrapedMangaGenre(genre, page);

        res.status(200).json(data);
    } catch (err: any) {
        next(err);
    }
});

app.get('/api/manga/:id/chapters/:lng', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, lng } = req.params;

        const chaptersResult = await getChapters(id, lng);
        const scrapedChaptersResult = await scrapeChaptersFromInfoPage(id);

        if (!Array.isArray(chaptersResult)) {
            return next(chaptersResult);
        }
        if (!Array.isArray(scrapedChaptersResult)) {
            return next(scrapedChaptersResult);
        }

        const chapters: Chapter[] = chaptersResult;
        const scrapedChapters: MangaChapter[] = scrapedChaptersResult;

        const data = chapters.map((chapter: Chapter, index: number) => {
            const scrapedChapter = scrapedChapters[index];
            return {
                ...chapter,
                title: scrapedChapter?.title || chapter.title,
                releaseDate: scrapedChapter?.releaseDate || chapter.releaseDate,
            };
        });

        res.status(200).json(data);
    } catch (err: any) {
        next(err);
    }
});

app.get('/api/chapter/:chapterId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const chapterId = req.params.chapterId;

        const data = await getChapterImages(chapterId);

        res.status(200).json(data);
    } catch (err: any) {
        next(err);
    }
});

app.get('/api/manga/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const data = await scrapeMangaInfo(id);
        res.status(200).json(data);
    } catch (err: any) {
        next(err);
    }
});

// Error handling middleware
app.get('/api/:pageType', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { pageType } = req.params;
        const page = req.query.page as string || '1';

        if (pageType !== 'updated' && pageType !== 'newest' && pageType !== 'added') {
            throw createHttpError(400, 'Invalid page type');
        }

        const data = await scrapeLatestPage(pageType, Number(page));

        res.status(200).json(data);
    } catch (err: any) {
        next(err);
    }
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500).json({
        error: {
            message: err.message,
            status: err.status || 500,
        },
    });
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
