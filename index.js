const express = require('express');
const app = express();
app.use(express.json());
const crud = require('./routes/crud');



const PORT = process.env.PORT || 3000;

app.use('/', crud);


app.listen(PORT, () =>
    console.log('Server running on port: ' + PORT
    ));