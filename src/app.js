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

app.get('/balance', async (req, res) => {
    res.send(await cardano.getBalance());
})

app.get('/health-check', async (req, res) => {
    res.send({
        "balance": "0"
    });
})

/**
 * Demo Mint request:
 * {
 * 	"receivers": [
 * 		"addr1q9j2r7lvq3kl2599fdywa7rsckhrmwufg4ch6kdx0vpehl98qu3dwpxawtf6lhxrt4jafq6taqsax7yql3fsjrteku8s7cf8qg",
 * 		"addr1q8v8rjf5njzeax6yc27mhewz7pt2qdxwnzdmpgu9fcvhds9s7wplf0yxq98ysrzu0zfsgc06w2a7av7p5g59t99azecqluv2w3",
 * 		"addr1q8e7fphztve88edgz7wmg6c02h0z75kfe4yc759ct6nd5akjfgvw393gvd86tsvdzzgjam3s6j7lyhtqzhe06ej9chgq5u3t4p"
 * 	],
 * 	"metadata": {
 * 	  "721": {
 * 	    "0758dd15fc46ad532877ac70ca8dfcbc42dc7af98d76644390813efb": {
 * 	      "Nft1": {
 * 	      	"id": "1",
 * 	        "name": "Token name",
 * 	        "description": "Description",
 * 	        "image": "ipfs://Qm..."
 * 	      }
 * 	    }
 * 	  }
 * 	}
 * }
 */
app.post('/nft/mint', async (req, res) => {
    res.send(await cardano.mintNft(req.body));
})

app.listen(80, () => {
    console.log('HTTP server running on port 80');
});

app.listen(443, () => {
    console.log('HTTP server running on port 443');
});
