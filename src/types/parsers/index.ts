import { MangaCategories, MangaGenre } from '../manga';

interface MangaInfo {
    id: string | null;
    name: string | null;
    poster: string | null;
}

interface ReleasingManga extends MangaInfo {
    status: string | null;
    description: string | null;
    currentChapter: string | null;
    genres: string[] | null;
}

interface MostViewedManga extends MangaInfo {
    rank: string | null;
}

interface RecentlyUpdatedManga extends MangaInfo {
    type: string | null;
    latestChapters: {
        chapterName: string;
        releaseTime: string;
    }[] | null;
}

export interface MangaChapter {
    title: string | null;
    chapter: string | null;
    url: string | null;
    releaseDate: string | null;
}

export interface MangaDetails {
    title: string | null;
    altTitles: string | null;
    poster: string | null;
    status: string | null;
    type: string | null;
    description: string | null;
    author: string | null;
    published: string | null;
    genres: string[] | null;
    rating: string | null;
    chapters?: MangaChapter[] | null;
}

export interface RelatedManga {
    id: string | null;
    name: string | null;
    poster: string | null;
}

export interface SearchResult {
    id: string | null;
    title: string | null;
    poster: string | null;
    type: string | null;
    chapters?: MangaChapter[];
}

export interface ScrapedSearchResults {
    currentPage: number;
    totalPages: number;
    results: SearchResult[];
}

export interface MangaCategoryResult {
    id: string | null;
    title: string | null;
    poster: string | null;
    type: string | null;
    chapters?: MangaChapter[];
}

export interface ScrapedMangaCategory {
    mangaCategory: MangaCategoryResult[];
    totalEntities: string;
    category: MangaCategories;
    currentPage: number;
    hasNextPage: boolean;
    totalPages: number;
}

export interface ScrapedMangaGenre {
    mangaCategory: MangaCategoryResult[];
    currentChapters: MangaChapter[];
    totalEntities: string;
    genreName: MangaGenre;
    currentPage: number;
    hasNextPage: boolean;
    totalPages: number;
}

export interface ScrapedLatestPage {
    results: MangaCategoryResult[];
    currentPage: number;
    hasNextPage: boolean;
    totalPages: number;
}

export interface Chapter {
    number: string;
    title: string;
    chapterId: string;
    language: string;
    releaseDate: string | null;
}

export interface ScrapedManga {
    mangaInfo: MangaDetails;
    relatedManga: RelatedManga[];
    similarManga: RelatedManga[];
}

export interface ScrapedHomePage {
    releasingManga: ReleasingManga[];
    mostViewedManga: {
        day: MostViewedManga[];
        week: MostViewedManga[];
        month: MostViewedManga[];
    };
    recentlyUpdatedManga: RecentlyUpdatedManga[];
    newReleaseManga: MangaInfo[];
}
