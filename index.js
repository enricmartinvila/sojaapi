const express = require('express');
const app = express();
const router = require('./routes/route')
app.use(express.json());
const cors = require('cors');
app.use(cors());
app.use('/api/v1', router);

app.listen(3000, function () {
    console.log(`Example app listening on port 3000!`);
});
