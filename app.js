const express = require('express')
const db = require('./models')
const bodyParser = require('body-parser');
const userRoutes = require('./routers/user-router.js');
const cookieParser = require('cookie-parser');

const app = express()
app.use(cookieParser());

app.use(bodyParser.json());
app.use('/api/users', userRoutes);

db.sequelize.sync().then((req) => {
    app.listen(5000, () => {
        console.log('server run');
    })
})
