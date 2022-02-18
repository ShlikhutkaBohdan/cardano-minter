const express = require('express')
const config = require('./config')

const app = express()

app.use("*", function(req, res, next){
    if (req.originalUrl === "/health-check") {
        next()
    }
    let token = req.headers['authorization'] || req.headers['x-api-key']
    if(token){
        if(token !== config.apiKey){
            res.status(403).json({
                error : "Token invalid"
            })
        }
        else {
            next()
        }
    } else {
        res.status(403).json({
            error : "Token missing"
        })
    }
})

app.get('/balance', async (req, res) => {
    res.send({
        "balance": "0",
        "message": req.query.blockchain
    });
})

app.get('/health-check', async (req, res) => {
    res.send({
        "balance": "0"
    });
})

app.get('/nft', async (req, res) => {
    res.send({
        "message": "Hello world!"
    });
})

app.listen(80, () => {
    console.log('HTTP server running on port 80');
});

app.listen(443, () => {
    console.log('HTTP server running on port 443');
});
