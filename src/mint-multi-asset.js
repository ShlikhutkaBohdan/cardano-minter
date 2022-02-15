const cardano = require("./cardano")
const { deepCleanObject, cleanObject } = require('./cleaner');

// 0. General params

const realTokenName = "NodeJs Token Name";

const nftBase = {
    image: "ipfs://Qma2tQn1Uu85s8vHxRfGzLqg6mKDtqic4cs345aaYzzLSc",
    description: "Nft Description",
    name: "Nft Name",
    type: "image/png",
    src: "ipfs://Qma2tQn1Uu85s8vHxRfGzLqg6mKDtqic4cs345aaYzzLSc",
    authors: ["Rearden Metals", "Bohdan Shlikhutka"]
};

// 1. Get the wallets (payment & policy)

const paymentAccount = cardano.wallet("ADAPI")
const policyAccount = cardano.wallet("POLICY")

// 2. Define mint script

// const mintScript = {
//     keyHash: cardano.addressKeyHash(policyAccount.name),
//     type: "sig"
// }

const queryTip = cardano.queryTip();
console.log(queryTip);

const currentSlot = queryTip.slot;
const slotNumber = currentSlot + 10000;
console.log("Slot number :", slotNumber);

const policyScript = {
    keyHash: cardano.addressKeyHash(policyAccount.name),
    type: "sig"
}

// const policyScript = {
//     type: "all",
//     scripts:
//         [
//             {
//                 type: "before",
//                 slot: slotNumber
//             },
//             {
//                 "type": "sig",
//                 "keyHash": cardano.addressKeyHash(policyAccount.name)
//             }
//         ]
// }

console.log("policyScript: ", JSON.stringify(policyScript))
// 3. Create POLICY_ID

const POLICY_ID = cardano.transactionPolicyid(policyScript)
console.log("POLICY_ID: ", POLICY_ID)

// 4. Define ASSET_NAME

const ASSET_NAME = realTokenName;

// 5. Create ASSET_ID

const ASSET_NAME_HEX = Buffer.from(ASSET_NAME, 'utf8').toString('hex');
const ASSET_ID = POLICY_ID + "." + ASSET_NAME_HEX
console.log("ASSET_ID: ", ASSET_ID)
// 6. Define metadata

const metadata = {
    721: {
        [POLICY_ID]: {
            [ASSET_NAME]: {
                ...nftBase
            }
        }
    }
}
console.log("metadata: ", JSON.stringify(metadata))

// 7. Define transaction
console.log("ASSET_ID: ", ASSET_ID)

const minimumMintTxOut = {
    lovelace: 1600000
}

const oldBalance = cleanObject(paymentAccount.balance().value)
console.log("oldBalance: ", oldBalance)

const changeBalance = {
    ...oldBalance,
    lovelace: oldBalance.lovelace - 2 * minimumMintTxOut.lovelace
}
console.log("changeBalance: ", changeBalance)

const cleanedTxIn = Object.values(deepCleanObject(paymentAccount.balance().utxo))
console.log("cleanedTxIn: ", cleanedTxIn)

const tx = {
    txIn: cleanedTxIn,
    txOut: [
        {
            address: paymentAccount.paymentAddr,
            value: { ...changeBalance }
        },
        {
            address: "addr1q9j2r7lvq3kl2599fdywa7rsckhrmwufg4ch6kdx0vpehl98qu3dwpxawtf6lhxrt4jafq6taqsax7yql3fsjrteku8s7cf8qg",
            value: { ...minimumMintTxOut, [ASSET_ID]: 1 }
        },
        {
            address: "addr1q8v8rjf5njzeax6yc27mhewz7pt2qdxwnzdmpgu9fcvhds9s7wplf0yxq98ysrzu0zfsgc06w2a7av7p5g59t99azecqluv2w3",
            value: { ...minimumMintTxOut, [ASSET_ID]: 1 }
        }
    ],
    mint: {
        action: [{ type: "mint", quantity: 2, asset: ASSET_ID }],
        script: [policyScript]
    },
    metadata,
    witnessCount: 2
}
console.log("tx: ", JSON.stringify(tx))

// 8. Build transaction

const buildTransaction = (tx) => {

    const raw = cardano.transactionBuildRaw(tx)
    const fee = cardano.transactionCalculateMinFee({
        ...tx,
        txBody: raw
    })

    tx.txOut[0].value.lovelace -= fee

    const resTx = { ...tx, fee }
    console.log("resTx: ", JSON.stringify(resTx))

    return cardano.transactionBuildRaw(resTx)
}

const raw = buildTransaction(tx)

console.log("Raw tx: ", raw)
// 9. Sign transaction

const signTransaction = (wallet, tx) => {

    return cardano.transactionSign({
        signingKeys: [wallet.payment.skey, policyAccount.payment.skey],
        txBody: tx
    })
}

const signed = signTransaction(paymentAccount, raw)

console.log("signed: ", signed)
// 10. Submit transaction

const txHash = cardano.transactionSubmit(signed)

console.log(txHash)
