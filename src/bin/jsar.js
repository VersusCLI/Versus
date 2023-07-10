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

    mkdirSync(path.join(process.cwd(), ".versuscache"), { recursive: true });
    const name = path.join(process.cwd(), ".versuscache", path.parse(f).name);
    mkdirSync(name, { recursive: true });
    targz.decompress({
        src: f,
        dest: path.join(name),
    }, (err) => {
        if (err)
            return getReporter().reportError(err);
        
        if (!checkFileConfigVersion(path.join(process.cwd(), ".versuscache", path.parse(f).name, "versus.config.json"))) {
            console.log(`${Color.yellowBright("WARNING: ")}` + `${f}` + " Version maybe outdated or over the current api version, If the version is outdated use \"versus update\" to update the package");
        }

        const config = getConfigFrom(path.join(process.cwd(), ".versuscache", path.parse(f).name, "versus.config.json"));
        let main = config["main"];

        main = main.replace(/\./g, "/");

        let cacheDir = path.join(path.join(process.cwd(), ".versuscache", path.parse(f).name))
        let directory = path.dirname(path.join(cacheDir, main));
        let filename = path.basename(path.join(cacheDir, main));
        if (existsSync(path.join(directory, filename + ".js"))) {

            execSync("node " + path.join(directory, filename + '.js'), {
                cwd: process.cwd(),
                encoding: "utf-8",
                stdio: "inherit"
            });

            emptyDirSync(path.join(process.cwd(), ".versuscache"));
            rmdirSync(path.join(process.cwd(), ".versuscache"));
        
        }
    })

})

emitter.on("project.build", () => {

    const old = Date.now();
    if (!existsSync(path.join(process.cwd(), "versus.config.json")))
        return getReporter()
            .reportError(new Error("No Versus config was found"), "jsar");

    if (!checkProjectConfigVersion()) {
        console.log(`${Color.yellowBright("WARNING: ")}` + "Version maybe outdated or over the current api version, If the version is outdated use \"versus update\" to update the package");
    }

    const versusConfig = getConfig();
    const spinner = nanospinner.createSpinner("Copying Packages....");
    spinner.start();
    try {
        mkdirSync(path.join(process.cwd(), "build"), { recursive: true });
        copySync(path.join(process.cwd(), "src", "main", "javascript"), path.join(process.cwd(), "build"), {
            overwrite: true,
        });
        spinner.success({
            text: "Copied packages from src/main/javascript"
        });
    } catch (err) {
        spinner.error({ text: "Failed to copy files from source directory..."});
        getReporter().reportError(err, "jsar");
    }

    const spinner2 = nanospinner.createSpinner("Copying Resources....");
    spinner2.start();
    try {
        mkdirSync(path.join(process.cwd(), "build"), { recursive: true });
        copySync(path.join(process.cwd(), "src", "main", "resources"), path.join(process.cwd(), "build"), {
            overwrite: true,
        });
        copyFileSync(path.join(process.cwd(), "versus.config.json"), path.join(process.cwd(), "build", "versus.config.json"));
        spinner2.success({
            text: "Copied packages from src/main/resources"
        });
    } catch (err) {
        spinner2.error({ text: "Failed to copy files from source directory..."});
        getReporter().reportError(err, "jsar");
    }

    const spinner3 = nanospinner.createSpinner("Doing some finishing touches....");
    spinner3.start();
    mkdirSync(path.join(process.cwd(), "out"), { recursive: true });

    targz.compress({
        src: path.join(process.cwd(), "build"),
        dest: path.join(process.cwd(), "out", versusConfig["name"] + ".jsar")
    }, (err) => {
        if (err){
            spinner3.error({ text: "Failed to build jsar file to " + path.join(process.cwd(), "out", versusConfig["name"] + ".jsar") + "! Read the error below!" })
            return getReporter().reportError(err);
        }        
        const current = Date.now();
        spinner3.success({
            text: "Built successfully in " + ((current - old) / 1000) + " seconds..."
        });
    });

});

init();