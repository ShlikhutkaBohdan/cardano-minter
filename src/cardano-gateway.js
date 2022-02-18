const cardano = require("./cardano")
const { deepCleanObject, cleanObject } = require('./cleaner');
const config = require('./config')

const paymentAccount = cardano.wallet(config.paymentAccount)
const policyAccount = cardano.wallet(config.policyAccount)

const CardanoGateway = function () {

    this.getBlockchainStatus = async function() {
        return {
            status: await cardano.queryTip()
        }
    }

    this.getBalance = async function () {
        return {
            balance: await cleanObject(paymentAccount.balance().value)
        }
    }

    this.mintNft = async function(params) {
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
                    action: [{ type: "mint", quantity: 2, asset: ASSET_ID }],
                    script: [policyScript]
                },
                fullMetadata,
                witnessCount: 2
            }
            console.log("tx: ", JSON.stringify(tx))

            return {
                ...tx
            }
        } catch (e) {
            console.log(e)
            throw e
        }
    }

}

module.exports = { CardanoGateway }
