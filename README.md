# MangaFire API

Welcome to the MangaFire API, a powerful and easy-to-use service for accessing a vast collection of manga. This API scrapes data from MangaFire, providing developers with a simple way to integrate manga content into their applications.

## Getting Started

To get started with the MangaFire API, follow these simple steps to set up the project on your local machine.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (or [Yarn](https://yarnpkg.com/))

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/mangafire-api.git
    cd mangafire-api
    ```

2.  **Install the dependencies:**

    ```bash
    npm install
    ```

3.  **Start the server:**

    ```bash
    npm start
    ```

The API will be running at `http://localhost:3000`.

## API Endpoints

All endpoints are available under the `/api` path.

### Home

-   **GET `/api/home`**

    Retrieves the homepage data, including trending manga, new releases, and recently updated series.

### Search

-   **GET `/api/search/:keyword?page=:page`**

    Searches for manga based on a keyword. The `page` parameter is optional and defaults to `1`.

### Manga Details

-   **GET `/api/manga/:id`**

    Fetches detailed information about a specific manga, including its description, genres, and author.

### Chapters

-   **GET `/api/manga/:id/chapters/:lng?`**

    Retrieves the chapters for a specific manga and language. If the `lng` parameter is omitted, it will return a list of available languages for the manga.

-   **GET `/api/chapter/:chapterId`**

    Gets the images for a specific chapter.

### Volumes

-   **GET `/api/volumes/:id/:lang?`**

    Retrieves the volumes for a specific manga. The `lang` parameter is optional and defaults to `en`.

### Categories and Genres

-   **GET `/api/category/:category?page=:page`**

    Fetches manga from a specific category (e.g., `manga`, `manhwa`).

-   **GET `/api/genre/:genre?page=:page`**

    Retrieves manga from a specific genre (e.g., `action`, `romance`).

### Latest Updates

-   **GET `/api/:pageType?page=:page`**

    Fetches the latest manga based on the `pageType`. Valid options are `updated`, `newest`, and `added`.

## Error Handling

The API returns standard HTTP status codes to indicate the success or failure of a request. In case of an error, the response body will contain a JSON object with a descriptive error message.

```json
{
    "error": {
        "message": "Invalid page type",
        "status": 400
    }
}
```

## Contributing

Contributions are welcome! If you have any suggestions or want to improve the API, feel free to open an issue or submit a pull request.
