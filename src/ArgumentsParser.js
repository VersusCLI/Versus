const program = require("commander").program;
const pkg = require("../package.json");
program.name("Versus");
program.version(pkg["version"])
module.exports = program;