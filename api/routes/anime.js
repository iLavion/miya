const express = require('express');
const { getTopAnime, getLatestAnime, getReleasesAnime, getAddedAnime, getCompletedAnime, getPopularAnime } = require('../controllers/anime');

const router = express.Router();

// Route for fetching top anime
router.get('/top', getTopAnime);
router.get('/latest', getLatestAnime);
router.get('/releases', getReleasesAnime);
router.get('/added', getAddedAnime);
router.get('/completed', getCompletedAnime);
router.get('/popular', getPopularAnime);

module.exports = router;