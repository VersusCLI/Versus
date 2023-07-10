const { execFileSync, execSync } = require("child_process");
const { readFileSync } = require("fs");
const path = require("path");
const semver = require("semver");
const CrashReporter = require("./CrashReporter");

function executeNPM(command) {

    const data = execSync( "npm " + command, {
        encoding: "utf-8",
        cwd: process.cwd(),
        stdio: "inherit"
    });
    
    if (data) {
        return data;
    }
    return null;
}

function getConfig() {
    return JSON.parse(readFileSync(path.join(process.cwd(), "versus.config.json"), "utf-8"));
}

function checkProjectConfigVersion() {
    const _path = getConfig();
    const _version = _path["$VERSION"];
    
    if (!_version) {
        _version = require('../../package.json').version;
    }

    let compared = semver.compare(_version, require("../../package.json").version);

    if (compared === 0) {
        return true;
    } else {
        return false;
    }
}

function checkFileConfigVersion(f) {
    const _path = getConfigFrom(f);
    const _version = _path["$VERSION"];
    
    if (!_version) {
        _version = require('../../package.json').version;
    }

    let compared = semver.compare(_version, require("../../package.json").version);

    if (compared === 0) {
        return true;
    } else {
        return false;
    }
}

function getConfigFrom(file) {
    return JSON.parse(readFileSync(file, "utf-8"));
}

function getReporter() {
    return new CrashReporter();
}

module.exports = {
    executeNPM,
    checkProjectConfigVersion,
    getConfig,
    getReporter,
    getConfigFrom,
    checkFileConfigVersion
}