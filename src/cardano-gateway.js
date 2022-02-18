const cardano = require("./cardano")
const { deepCleanObject, cleanObject } = require('./cleaner');
const config = require('./config')

const paymentAccount = cardano.wallet(config.paymentAccount)
const policyAccount = cardano.wallet(config.policyAccount)

const CardanoGateway = function () {

    this.getBlockchainStatus = async function () {
        return {
            status: await cardano.queryTip()
        }
    }

    this.getBalance = async function () {
        return {
            balance: cleanObject(await paymentAccount.balance().value)
        }
    }

    this.mintNft = async function (params) {
        try {
            const { receivers, metadata, tokenName } = params

            // 2. Define mint script

            const queryTip = cardano.queryTip();
            console.log(queryTip);

            const currentSlot = queryTip.slot;
            const slotNumber = currentSlot + 10000;
            console.log("Slot number :", slotNumber);

            const policyScript = {
                keyHash: cardano.addressKeyHash(policyAccount.name),
                type: "sig"
            }
            console.log("policyScript: ", JSON.stringify(policyScript))

            // 3. Create POLICY_ID
            const POLICY_ID = cardano.transactionPolicyid(policyScript)
            console.log("POLICY_ID: ", POLICY_ID)

            // 4. Define ASSET_NAME
            const ASSET_NAME = tokenName;
            console.log("tokenName: ", tokenName)
            const ASSET_NAME_HEX = Buffer.from(ASSET_NAME, 'utf8').toString('hex');
            const ASSET_ID = POLICY_ID + "." + ASSET_NAME_HEX
            console.log("ASSET_ID: ", ASSET_ID)

            // 6. Define metadata
            const fullMetadata = {
                721: {
                    [POLICY_ID]: {
                        [ASSET_NAME]: {
                            ...metadata
                        }
                    }
                }
            }
            console.log("metadata: ", JSON.stringify(metadata))

            // 7. Define transaction
            const minimumMintTxOut = {
                lovelace: config.minimumMintTxOut
            }

            const oldBalance = cleanObject(paymentAccount.balance().value)
            console.log("oldBalance: ", oldBalance)

            const receiversCount = receivers.length
            console.log("receiversCount: ", receiversCount)

            const changeBalance = {
                ...oldBalance,
                lovelace: oldBalance.lovelace - receiversCount * minimumMintTxOut.lovelace
            }
            console.log("changeBalance: ", changeBalance)

            const cleanedTxIn = Object.values(deepCleanObject(paymentAccount.balance().utxo))
            console.log("cleanedTxIn: ", cleanedTxIn)

            const receiversTxOut = receivers.map(receiver => {
                return {
                    address: receiver,
                    value: { ...minimumMintTxOut, [ASSET_ID]: 1 }
                }
            });

            const tx = {
                txIn: cleanedTxIn,
                txOut: [
                    {
                        address: paymentAccount.paymentAddr,
                        value: { ...changeBalance }
                    },
                    ...receiversTxOut
                ],
                mint: {
                    action: [{ type: "mint", quantity: receiversCount, asset: ASSET_ID }],
                    script: [policyScript]
                },
                metadata: fullMetadata,
                witnessCount: 2
            }
            console.log("tx: ", JSON.stringify(tx))

            const { resTx, raw } = this.buildTransaction(tx)
            console.log("raw: ", raw)

            const signed = this.signTransaction(raw)
            console.log("signed: ", signed)

            // const txHash = this.submitTransaction(signed)
            // console.log("txHash: ", txHash)

            return {
                // txHash: txHash,
                tx: resTx
            }
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    this.buildTransaction = function (tx) {

        const raw = cardano.transactionBuildRaw(tx)
        const fee = cardano.transactionCalculateMinFee({
            ...tx,
            txBody: raw
        })

        tx.txOut[0].value.lovelace -= fee

        const resTx = { ...tx, fee }
        console.log("fee: ", fee)

        return { raw: cardano.transactionBuildRaw(resTx), resTx: resTx }
    }

    this.signTransaction = function (tx) {
        return cardano.transactionSign({
            signingKeys: [paymentAccount.payment.skey, policyAccount.payment.skey],
            txBody: tx
        })
    }

    this.submitTransaction = function (tx) {
        return cardano.transactionSubmit(signed)
    }

}

module.exports = { CardanoGateway }
