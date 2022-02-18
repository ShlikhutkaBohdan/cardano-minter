const os = require("os");
const path = require("path");

const dir = path.join(os.homedir(), "minter-files", "configs", "config.json");

const config = {
    ...require(dir),
    paymentAccount: "ADAPI",
    policyAccount: "POLICY",
    minimumMintTxOut: 1600000
};

module.exports = config



