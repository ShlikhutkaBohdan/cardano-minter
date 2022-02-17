const express = require('express')

const app = express()

app.get('/balance', async (req, res) => {
    res.send({
        "balance": "0"
    });
})

app.get('/nft', async (req, res) => {
    res.send({
        "message": "Hello world!"
    });
})

app.listen(8080, () => {
    console.log('HTTP server running on port 80');
});
