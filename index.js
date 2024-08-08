const express = require('express');
const app = express();
app.use(express.json());
const crud = require('./routes/crud');
const recipecrud = require('./routes/crud_recipe');
const termsprivacy = require('./routes/terms_privacy');



const PORT = process.env.PORT || 3000;

app.use('/', crud);
app.use('/', recipecrud);
app.use('/', termsprivacy);


app.listen(PORT, () =>
    console.log('Server running on port: ' + PORT
    ));