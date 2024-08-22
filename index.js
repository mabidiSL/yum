const express = require('express');
const app = express();
app.use(express.json());
const crud = require('./routes/crud');
const recipecrud = require('./routes/crud_recipe');
const termsprivacy = require('./routes/terms_privacy');
const app_info = require('./routes/app_info');
const social = require('./routes/social');



const PORT = process.env.PORT || 4200;

app.use('/', crud);
app.use('/', recipecrud);
app.use('/', termsprivacy);
app.use('/', app_info);
app.use('/', social);


app.listen(PORT, () =>
    console.log('Server running on port: ' + PORT
    ));