const cardano = require("./cardano")
const { pickBy, identity  } = require('lodash');

// 1. Get the wallet

const wallet = cardano.wallet("ADAPI")

// 2. Define mint script

const mintScript = {
    keyHash: cardano.addressKeyHash(wallet.name),
    type: "sig"
}

// 3. Create POLICY_ID

const POLICY_ID = cardano.transactionPolicyid(mintScript)

// 4. Define ASSET_NAME

const ASSET_NAME = "BerrySpaceGreen"

// 5. Create ASSET_ID

const ASSET_NAME_HEX = Buffer.from(ASSET_NAME, 'utf8').toString('hex');
const ASSET_ID = POLICY_ID + "." + ASSET_NAME_HEX

// 6. Define metadata

const metadata = {
    721: {
        [POLICY_ID]: {
            [ASSET_NAME]: {
                name: ASSET_NAME,
                image: "ipfs://QmQqzMTavQgT4f4T5v6PWBp7XNKtoPmC9jvn12WPT3gkSE",
                description: "Super Fancy Berry Space Green NFT",
                type: "image/png",
                src: "ipfs://Qmaou5UzxPmPKVVTM9GzXPrDufP55EDZCtQmpy3T64ab9N",
                // other properties of your choice
                authors: ["PIADA", "SBLYR"]
            }
        }
    }
}

// 7. Define transaction
console.log("ASSET_ID: ", ASSET_ID)
const cleanedBalanceValue = pickBy(wallet.balance().value, identity)
console.log("wallet.balance().value: ", cleanedBalanceValue)

const tx = {
    txIn: wallet.balance().utxo,
    txOut: [
        {
            address: wallet.paymentAddr,
            value: { ...cleanedBalanceValue, [ASSET_ID]: 1 }
        }
    ],
    mint: {
        action: [{ type: "mint", quantity: 1, asset: ASSET_ID }],
        script: [mintScript]
    },
    metadata,
    witnessCount: 2
}
console.log("tx: ", JSON.stringify(tx))

// 8. Build transaction

const buildTransaction = (tx) => {

    const raw = cardano.transactionBuildRaw(tx)
    console.log("template: ", raw)

    const fee = cardano.transactionCalculateMinFee({
        ...tx,
        txBody: raw
    })

    tx.txOut[0].value.lovelace -= fee

    return cardano.transactionBuildRaw({ ...tx, fee })
}

const raw = buildTransaction(tx)
console.log("raw: ", raw)
// 9. Sign transaction

const signTransaction = (wallet, tx) => {

    return cardano.transactionSign({
        signingKeys: [wallet.payment.skey, wallet.payment.skey],
        txBody: tx
    })
}

const signed = signTransaction(wallet, raw)
console.log("signed: ", signed)

// 10. Submit transaction

const txHash = cardano.transactionSubmit(signed)

console.log(txHash)
