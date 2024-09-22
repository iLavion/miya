const axios = require('axios');
const fs = require('fs');
const path = require('path');

const ANILIST_URL = 'https://graphql.anilist.co';
const KITSU_URL = 'https://kitsu.io/api/edge/';
const CACHE_DURATION = 30 * 60 * 1000;
const CACHE_DIR = path.resolve(__dirname, '../cache');

// Cache file paths
const CACHE_FILE_PATHS = {
    top: path.resolve(CACHE_DIR, '../cache/top.json'),
    latest: path.resolve(CACHE_DIR, '../cache/latest.json'),
    releases: path.resolve(CACHE_DIR, '../cache/releases.json'),
    added: path.resolve(CACHE_DIR, '../cache/added.json'),
    completed: path.resolve(CACHE_DIR, '../cache/completed.json'),
    popular: path.resolve(CACHE_DIR, '../cache/popular.json')
};

// Create cache directory if it doesn't exist
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Load and parse GraphQL query
const TOP_ANIME_QUERY = `{
    Page(perPage: 9) {
        media(
            sort: [TRENDING_DESC]
            status_in: [RELEASING,FINISHED]
            type: ANIME
            genre_not_in: ["Kids", "Children", "Hentai"]
            isAdult: false
            format_in: [TV, TV_SHORT, MOVIE, SPECIAL, OVA, ONA]
            countryOfOrigin: "JP"
        ) {
            id
            title {
                romaji
                english
            }
            coverImage {
                extraLarge
            }
            startDate {
                year
                month
                day
            }
            averageScore
            genres
        }
    }
}`
const LATEST_ANIME_QUERY = `{
    Page(perPage: 100) {
        media(
            sort: [TRENDING_DESC]
            status_in: [RELEASING,FINISHED]
            type: ANIME
            genre_not_in: ["Kids", "Children", "Hentai"]
            isAdult: false
            format_in: [TV, TV_SHORT, MOVIE, SPECIAL, OVA, ONA]
            countryOfOrigin: "JP"
        ) {
            id
            title {
                romaji
                english
            }
            coverImage {
                extraLarge
            }
            startDate {
                year
                month
                day
            }
            averageScore
            genres
        }
    }
}`
const RELEASES_ANIME_QUERY = `{
    Page(perPage: 5) {
        media(
            sort: [START_DATE_DESC]
            status_in: [RELEASING,FINISHED]
            type: ANIME
            genre_not_in: ["Kids", "Children", "Hentai"]
            isAdult: false
            format_in: [TV, TV_SHORT, MOVIE, SPECIAL, OVA, ONA]
            countryOfOrigin: "JP"
        ) {
            id
            title {
                romaji
                english
            }
            coverImage {
                large
            }
            startDate {
                year
                month
                day
            }
            genres
        }
    }
}`

const ADDED_ANIME_QUERY = `{
    Page(perPage: 5) {
        media(
            sort: [UPDATED_AT_DESC]
            status_in: [RELEASING]
            type: ANIME
            genre_not_in: ["Kids", "Children", "Hentai"]
            isAdult: false
            format_in: [TV, TV_SHORT, MOVIE, SPECIAL, OVA, ONA]
            countryOfOrigin: "JP"
        ) {
            id
            title {
                romaji
                english
            }
            coverImage {
                large
            }
            startDate {
                year
                month
                day
            }
            genres
        }
    }
}`

const COMPLETED_ANIME_QUERY = `{
    Page(perPage: 5) {
        media(
            sort: [END_DATE_DESC]
            status_in: [FINISHED]
            type: ANIME
            genre_not_in: ["Kids", "Children", "Hentai"]
            isAdult: false
            format_in: [TV, TV_SHORT, MOVIE, SPECIAL, OVA, ONA]
            countryOfOrigin: "JP"
        ) {
            id
            title {
                romaji
                english
            }
            coverImage {
                large
            }
            startDate {
                year
                month
                day
            }
            genres
        }
    }
}`
const POPULAR_ANIME_QUERY = `query ($date: String) {
    Page(perPage: 9) {
        media(
            sort: [FAVOURITES_DESC]
            status_in: [RELEASING, FINISHED]
            type: ANIME
            genre_not_in: ["Kids", "Children", "Hentai"]
            isAdult: false
            format_in: [TV, TV_SHORT, MOVIE, SPECIAL, OVA, ONA]
            countryOfOrigin: "JP"
            startDate_greater: $date
        ) {
            id
            title {
                romaji
                english
            }
            coverImage {
                extraLarge
            }
            startDate {
                year
                month
                day
            }
            averageScore
            genres
        }
    }
}
`

// Fetch data from AniList
const fetchAniListAnime = async (query, variables = {}) => {
    try {
        console.log('Fetching AniList data...');
        console.log("Variables:", variables);
        console.log("Query:", query);
        const response = await axios.post(
            ANILIST_URL,
            { query: query, variables: variables },
            { headers: { 'Content-Type': 'application/json' }}
        );
        return response.data.data.Page.media;
    } catch (error) {
        console.error('Error fetching AniList data:', error.response.data);
        return [];
    }
};

// Fetch additional data from Kitsu
const fetchKitsuData = async (title) => {
    try {
        console.log('Fetching Kitsu data...');
        const response = await axios.get(
            `${KITSU_URL}anime?filter[text]=${encodeURIComponent(title)}`,
            {
                headers: {
                    'Content-Type': 'application/vnd.api+json',
                    'Accept': 'application/vnd.api+json',
                },
            }
        );
        return response.data.data[0];
    } catch (error) {
        console.error('Error fetching Kitsu data:', error);
        return null;
    }
};

// Combine AniList data with Kitsu data
const combineAnimeData = async (animeList) => {
    return Promise.all(
        animeList.map(async (anime) => {
            const kitsuAnime = await fetchKitsuData(anime.title.romaji || anime.title.english);

            return {
                ...anime,
                additionalData: {
                    coverImage: kitsuAnime?.attributes?.coverImage?.original || anime.coverImage.extraLarge || anime.coverImage.large || anime.coverImage.medium || null,
                    posterImage: kitsuAnime?.attributes?.posterImage?.original || anime.coverImage.extraLarge || anime.coverImage.large || anime.coverImage.medium || null,
                    synopsis: kitsuAnime?.attributes?.synopsis || anime.description,
                    titles: kitsuAnime?.attributes?.titles,
                    updatedAt: kitsuAnime?.attributes?.updatedAt || null,
                    createdAt: kitsuAnime?.attributes?.createdAt || null,
                    slug: kitsuAnime?.attributes?.slug || null,
                    ageRating: kitsuAnime?.attributes?.ageRating || null,
                    subtype: kitsuAnime?.attributes?.subtype || null,
                    episodeCount: kitsuAnime?.attributes?.episodeCount || null,
                    episodeLength: kitsuAnime?.attributes?.episodeLength || null,
                    totalLength: kitsuAnime?.attributes?.totalLength || null,
                    youtubeVideoId: kitsuAnime?.attributes?.youtubeVideoId || null,
                    nsfw: kitsuAnime?.attributes?.nsfw || null,
                },
            };
        })
    );
};

// Check if cached data is still valid
const isCacheValid = (cache) => {
    if (!cache) return false;

    const currentTime = Date.now();
    const timeSinceCache = currentTime - cache.timestamp;
    const timeRemaining = CACHE_DURATION - timeSinceCache;

    // If cache is still valid
    if (timeRemaining > 0 && cache.data.length > 0) {
        const minutes = Math.floor(timeRemaining / 60000);
        const seconds = Math.floor((timeRemaining % 60000) / 1000);
        console.log(`Cache is valid. Next API call in ${minutes} minutes and ${seconds} seconds.`);
        return true;
    }

    return false;
};

// Read cache from file
const readCache = (endpoint) => {
    try {
        const data = fs.readFileSync(CACHE_FILE_PATHS[endpoint], 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return null;
    }
};

// Write cache to file
const writeCache = (endpoint, data) => {
    try {
        fs.writeFileSync(CACHE_FILE_PATHS[endpoint], JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing cache to file:', error);
    }
};

// Controller function for /anime/top
const getTopAnime = async (req, res) => {
    const cache = readCache('top');
    if (isCacheValid(cache)) { return res.json(cache.data) }
    const aniListData = await fetchAniListAnime(TOP_ANIME_QUERY);
    const combinedData = await combineAnimeData(aniListData);
    writeCache('top', { data: combinedData, timestamp: Date.now() });
    res.json(combinedData);
};

// Controller function for /anime/latest
const getLatestAnime = async (req, res) => {
    const cache = readCache('latest');
    if (isCacheValid(cache)) { return res.json(cache.data)}
    const aniListData = await fetchAniListAnime(LATEST_ANIME_QUERY);
    const combinedData = await combineAnimeData(aniListData);
    const sortedData = combinedData.sort((a, b) => { return new Date(b.updatedAt) - new Date(a.updatedAt)});
    writeCache('latest', { data: sortedData, timestamp: Date.now() });
    res.json(sortedData);
};


// Controller function for /anime/releases
const getReleasesAnime = async (req, res) => {
    const cache = readCache('releases');
    if (isCacheValid(cache)) { return res.json(cache.data) }
    const aniListData = await fetchAniListAnime(RELEASES_ANIME_QUERY);
    const combinedData = await combineAnimeData(aniListData);
    writeCache('releases', { data: combinedData, timestamp: Date.now() });
    res.json(combinedData);
};

// Controller function for /anime/added
const getAddedAnime = async (req, res) => {
    const cache = readCache('added');
    if (isCacheValid(cache)) { return res.json(cache.data) }
    const aniListData = await fetchAniListAnime(ADDED_ANIME_QUERY);
    const combinedData = await combineAnimeData(aniListData);
    writeCache('added', { data: combinedData, timestamp: Date.now() });
    res.json(combinedData);
};

// Controller function for /anime/completed
const getCompletedAnime = async (req, res) => {
    const cache = readCache('completed');
    if (isCacheValid(cache)) { return res.json(cache.data) }
    const aniListData = await fetchAniListAnime(COMPLETED_ANIME_QUERY);
    const combinedData = await combineAnimeData(aniListData);
    writeCache('completed', { data: combinedData, timestamp: Date.now() });
    res.json(combinedData);
};

// Controller function for /anime/popular
const getPopularAnime = async (req, res) => {
    const { dateFilter = 'day' } = req.query;
    let cache = readCache('popular');

    if (cache && cache[dateFilter]) {
        const cachedData = cache[dateFilter];
        const timeElapsed = Date.now() - cachedData.timestamp;
        const timeRemaining = CACHE_DURATION - timeElapsed;

        if (timeRemaining > 0) {
            const secondsRemaining = Math.floor((timeRemaining / 1000) % 60);
            const minutesRemaining = Math.floor(timeRemaining / (1000 * 60));
            console.log('Returning cached data. Time remaining:', minutesRemaining, 'minutes', secondsRemaining, 'seconds,');
            return res.json({
                combinedData: cachedData.combinedData,
                cacheTimeRemaining: {
                    seconds: secondsRemaining,
                    minutes: minutesRemaining
                }
            });
        } else {
            console.log('Cache is expired, fetching new data.');
        }
    } else {
        console.log('No cache found for this date filter, fetching new data.');
    }

    const date = new Date();
    date.setDate(date.getDate() - 30); // Adjusting the date to get past data
    let fuzzyDateInt;

    switch (dateFilter) {
        case 'day':
            date.setDate(date.getDate() - 1); // Decrease by 1 day
            fuzzyDateInt = parseInt(date.toISOString().split('T')[0].replace(/-/g, ''));
            break;
        case 'month':
            date.setDate(1); // Set to the first day of the month
            fuzzyDateInt = parseInt(date.toISOString().split('T')[0].replace(/-/g, ''));
            break;
        case 'year':
            date.setMonth(0, 1); // Set to the first day of the year
            fuzzyDateInt = parseInt(date.toISOString().split('T')[0].replace(/-/g, ''));
            break;
        default:
            fuzzyDateInt = parseInt(date.toISOString().split('T')[0].replace(/-/g, ''));
    }

    console.log('Fuzzy Date Int:', fuzzyDateInt);

    const Q = `
        query ($date: FuzzyDateInt) {
            Page(perPage: 9) {
                media(
                    sort: [FAVOURITES_DESC]
                    status_in: [RELEASING, FINISHED]
                    type: ANIME
                    genre_not_in: ["Kids", "Children", "Hentai"]
                    isAdult: false
                    format_in: [TV, TV_SHORT, MOVIE, SPECIAL, OVA, ONA]
                    countryOfOrigin: "JP"
                    startDate_greater: $date
                ) {
                    id
                    title {
                        romaji
                        english
                    }
                    coverImage {
                        extraLarge
                    }
                    startDate {
                        year
                        month
                        day
                    }
                    averageScore
                    genres
                }
            }
        }`;

    const aniListData = await fetchAniListAnime(Q, { date: fuzzyDateInt });
    const combinedData = await combineAnimeData(aniListData);

    console.log('Fetched new data:', combinedData);

    // Initialize the cache if it doesn't exist
    if (!cache) {
        cache = {};
    }

    // Update the cache with the new data based on dateFilter
    if (dateFilter === 'day') {
        cache.day = { combinedData, timestamp: Date.now() };
    } else if (dateFilter === 'month') {
        cache.month = { combinedData, timestamp: Date.now() };
    } else if (dateFilter === 'year') {
        cache.year = { combinedData, timestamp: Date.now() };
    }

    // Write the updated cache back
    writeCache('popular', cache);

    res.json({
        combinedData,
    });
};


module.exports = { getTopAnime, getLatestAnime, getReleasesAnime, getAddedAnime, getCompletedAnime, getPopularAnime };