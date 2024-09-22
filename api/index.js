const express = require('express');
const cors = require('cors');
const animeRoutes = require('./routes/anime');
const app = express();
const port = 3952;
const corsOptions = {
    origin: 'http://localhost:3951',
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use('/anime', animeRoutes);
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
