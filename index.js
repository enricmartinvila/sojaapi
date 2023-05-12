const express = require('express');
const app = express();
const router = require('./routes/route');
app.use(express.json());
const cors = require('cors');
//import .env
require('dotenv').config();
app.use(cors());
app.use('/api/v1', router);

app.listen(process.env.PORT , function () {
    console.log(`Example app listening on port ` + process.env.PORT);
});
