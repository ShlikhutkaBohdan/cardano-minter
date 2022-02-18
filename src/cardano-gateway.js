const cardano = require("./cardano")
const { deepCleanObject, cleanObject } = require('./cleaner');
const config = require('./config')

const paymentAccount = cardano.wallet(config.paymentAccount)

const CardanoGateway = function () {

    this.getBalance = async function () {
        return {
            balance: cleanObject(paymentAccount.balance().value)
        }
    }

    this.mintNft = async function(params) {
        return {
            ...params
        }
    }

}

module.exports = { CardanoGateway }
