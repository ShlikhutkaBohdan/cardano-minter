const express = require('express')
const config = require('./config')
const bodyParser = require('body-parser');
const { CardanoGateway } = require("./cardano-gateway")

const app = express()
const cardano = new CardanoGateway()

app.use(bodyParser.json());

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

app.get('/health-check', (req, res) => {
    res.send({
        "message": "Success"
    });
})

app.get('/status', async (req, res) => {
    try {
        res.send(await cardano.getBlockchainStatus());
    } catch (e) {
        res.status(500).json({
            error : e
        })
    }
})

app.get('/balance', async (req, res) => {
    try {
        res.send(await cardano.getBalance());
    } catch (e) {
        res.status(500).json({
            error : e
        })
    }
})

/**
 * Demo Mint request:
 * {
 *  "tokenName": "NodeJs Token Name",
 * 	"receivers": [
 * 		"addr1q9j2r7lvq3kl2599fdywa7rsckhrmwufg4ch6kdx0vpehl98qu3dwpxawtf6lhxrt4jafq6taqsax7yql3fsjrteku8s7cf8qg",
 * 		"addr1q8v8rjf5njzeax6yc27mhewz7pt2qdxwnzdmpgu9fcvhds9s7wplf0yxq98ysrzu0zfsgc06w2a7av7p5g59t99azecqluv2w3",
 * 		"addr1q8e7fphztve88edgz7wmg6c02h0z75kfe4yc759ct6nd5akjfgvw393gvd86tsvdzzgjam3s6j7lyhtqzhe06ej9chgq5u3t4p"
 * 	],
 * 	"metadata": {
 * 	  "id": "1",
 *       "name": "Token name",
 *       "description": "Description",
 *       "image": "ipfs://Qm..."
 * 	}
 * }
 */
app.post('/nft/mint', async (req, res) => {
    try {
        res.send(await cardano.mintNft(req.body));
    } catch (e) {
        console.log(e)
        res.status(500).json({
            error : JSON.stringify(e)
        })
    }
})

app.listen(80, () => {
    console.log('HTTP server running on port 80');
});

app.listen(443, () => {
    console.log('HTTP server running on port 443');
});
