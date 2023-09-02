#!/usr/bin/env node

const EventEmitter = require("events");
const CommandsParser = require("../ArgumentsParser");
const { readdirSync, mkdirSync, writeFileSync, existsSync, copyFileSync, rmdirSync } = require("fs");
const path = require("path");
const emitter = new EventEmitter();
const targz = require("targz");
const { getReporter, checkProjectConfigVersion, getConfig, getConfigFrom, checkFileConfigVersion } = require("../utils/Utils");
const { copySync, emptyDirSync } = require("fs-extra");
const nanospinner = require("nanospinner");
const { execSync } = require("child_process");
const Versus = require("../lib/Versus");

emitter.setMaxListeners(Infinity)

async function init() {

    CommandsParser.command("build")
        .description("Builds the current project")
        .action(() => {
            emitter.emit("project.build")
        })

    CommandsParser
        .command("run")
        .description("Run a jsar file")
        .argument("<jsarfile>")
        .action((f) => {
            emitter.emit("call.run", f);
        });

    CommandsParser.parse();
}

emitter.on("call.run", (f) => {
    const versus = new Versus();
    versus.getJsar().runJsar(f);

})

emitter.on("project.build", () => {

    const versus = new Versus();
    versus.getJsar().buildProject();

});

init();