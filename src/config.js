const os = require("os");
const path = require("path");

const dir = path.join(os.homedir(), "minter-files", "configs", "config.json");

const config = require(dir);

module.exports = config



