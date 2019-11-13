const express = require('express');
const morgan = require('morgan');
const path = require('path');
const index = require('./routes/index');

const app = express();

app.use(morgan('dev'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.get('/', index);


const startupTimestamp = new Date();

// Health check and readiness check endpoints
const wait = ms => new Promise(res => setTimeout(res, ms));
app.get('/healthy', async (req, res, next) => {
    wait(process.env.HEALTHY_SLEEP).then(() => res.sendStatus(200))
});

app.get('/healthz', async (req, res, next) => {
    const current = new Date();

    if (current - startupTimestamp < 10000) {
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
});

app.get('/readyz', async (req, res, next) => {
    const current = new Date();

    if (current - startupTimestamp < 10000) {
        res.sendStatus(500);
    } else {
        res.sendStatus(200);
    }
});

app.get('/ready', async (req, res, next) => {
    wait(process.env.READY_SLEEP).then(() => res.sendStatus(200))
});

app.get('/fail', async (req, res, next) => {
    wait(process.env.FAIL_SLEEP).then(() => res.sendStatus(500))
});



app.use((req, res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`hello-kube running on port ${port}.`));