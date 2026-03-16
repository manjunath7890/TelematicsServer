const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.text());
app.use(bodyParser.json());

const PORT = 4000; 

require('./db doc/atlas_conn');

const router = require('./router/router');
app.use(router);

app.listen(PORT, async () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
