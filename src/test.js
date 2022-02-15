const CardanocliJs = require("cardanocli-js");
const { v4: uuidv4 } = require('uuid');

const cardanocliJs = new CardanocliJs();

const address = "addr1vym8ww780zp6szewg3u9hrxar7c8cenr2gr80vsxj37vp6cdkq2ze";
const realTokenName = "NodeJs Token Name";
const tokenAmount = 1;
const ipfsHash = "Qma2tQn1Uu85s8vHxRfGzLqg6mKDtqic4cs345aaYzzLSc";

//should be calculated
const fee = 205377; // TODO autoload
const txhash = "34e829fd7490228b42039f5af9e336fd074e3498b5922ebc91cfa19b6ee11732";
const txix = "2";
const funds = 4390852;
const output = 1400000;
//end define

console.log("cardanocliJs.queryTip() ");

const queryTip = cardanocliJs.queryTip();
console.log(queryTip);

const currentSlot = queryTip.slot;
const slotNumber = currentSlot + 10000;
console.log("Slot number :", slotNumber);

//console.log(cardanocliJs.queryUtxo(address));

const policyAccount = uuidv4();
const policy = cardanocliJs.addressKeyGen(policyAccount);
console.log("Generated Policy keys");
console.log("Policy Account: ", policyAccount);
console.log(policy);

const keyHash = cardanocliJs.addressKeyHash(policyAccount);
console.log("keyHash :", keyHash);

const policyScript = {
    type: "all",
    scripts:
        [
            {
                type: "before",
                slot: slotNumber
            },
            {
                "type": "sig",
                "keyHash": keyHash
            }
        ]
};

console.log("Policy Script generated");
console.log("policyScript :", policyScript);

const policyId = cardanocliJs.transactionPolicyid(policyScript);
console.log("policyId: ", policyId);

const nftName = "Nft Name";
const nftDescription = "Nft Description";
const nftItem = {
    description: nftDescription,
    name: nftName,
    id: "1",
    image: "ipfs://" + ipfsHash
};
const metadata = {
    "721": {
    }
}

metadata["721"] = {};
metadata["721"][policyId] = {};
metadata["721"][policyId][realTokenName] = nftItem;
console.log("metadata: ", JSON.stringify(metadata));

const change=funds - output - fee;
console.log("change: ", change);



