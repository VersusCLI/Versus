const fs = require("fs");
const os = require("os");
const fsextra = require("fs-extra");
const path = require("path");
const DEFAULT_VERSUS_FOLDER = path.join(os.homedir(), ".versuscache");

if (!fs.existsSync(DEFAULT_VERSUS_FOLDER))
    throw new Error("Versus cache folder does not exist within the home directory of your computer \"" + DEFAULT_VERSUS_FOLDER + "\""); 

function isEmpty(projectName, folder) {
    return !fs.readdirSync(path.join(DEFAULT_VERSUS_FOLDER, projectName, folder)).length
}

function fetchResource(projectName, file) {
    return fs.readFileSync(path.join(DEFAULT_VERSUS_FOLDER, projectName, file), "utf-8")
}

function fetchJSONResource(projectName, file) {
    return JSON.parse(fetchResource(projectName, file));
}

function deleteResource(projectName, file) {
    return fs.unlinkSync(path.join(DEFAULT_VERSUS_FOLDER, projectName, file))
}

function deleteResourceFolder(projectName, folder) {
    if (!isEmpty(projectName, folder))
        fsextra.emptyDirSync(path.join(DEFAULT_VERSUS_FOLDER, projectName, folder));

    return fs.rmdirSync(path.join(DEFAULT_VERSUS_FOLDER, projectName, folder));
}

module.exports = {
    fetchResource,
    fetchJSONResource,
    deleteResource,
    deleteResourceFolder,
    isEmpty
}