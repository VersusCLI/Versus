#!/usr/bin/env node

const EventEmitter = require("events");
const CommandsParser = require("../ArgumentsParser");
const { readdirSync, mkdirSync, writeFileSync, existsSync } = require("fs");
const path = require("path");
const emitter = new EventEmitter();
const Color = require("cli-color");
const { executeNPM, checkProjectConfigVersion, getConfig, getReporter } = require("../utils/Utils");
const nanospinner = require("nanospinner");
const { execSync } = require("child_process");

async function init() {

    CommandsParser.command("init")
        .description("Initializes a workspace")
        .action(() => {
            emitter.emit("workspace.init");
        });

    CommandsParser.command("run")
        .description("Runs a file")
        .argument("[file]")
        .action((f) => {
            emitter.emit("workspace.run", f);
        });

    let packager = CommandsParser
        .command("packager")
        .description("Versus Packager")

    let global = packager
        .command("global")
        .description("Global Versus Packager")
    
    packager
        .command("install")
        .description("Installs a package")
        .argument("<package>")
        .action((pkg) => {
            emitter.emit("packager.install", pkg, false);
        });
    
    global
        .command("install")
        .description("Installs a global package")
        .argument("<package>")
        .action((pkg) => {
            emitter.emit("packager.install", pkg, true);
        });

    CommandsParser.parse();
}

emitter.on("packager.install", (pkg, isGlobal) => {
    let command = ``;
    if (isGlobal) {
        command = `install --location=global ${pkg}`;
    } else {
        command = `install ${pkg}`;
    }

    const spinner = nanospinner.createSpinner("Installing package " + pkg + (isGlobal ? " Globally" : ""));
    spinner.start();
    try {
        executeNPM(command);
        spinner.success({
            text: "Installed Package " + pkg
        })
    } catch (err) {
        spinner.error({ text: "Failed to install package " + pkg});
        getReporter().reportError(err, "versus");
    }
});

emitter.on("workspace.init", () => {
    console.log(`${Color.yellowBright("WARNING: ")}If you already initialized a project in this directory some of the files will get overriden.`)
    const old = Date.now();
    const directories = [
        "src",
        "src/main",
        "src/test",
        "src/main/javascript",
        "src/main/resources",
        "src/test/javascript",
        "src/test/resources",
        "src/main/javascript/com",
        "src/main/javascript/com/example",
    ];

    const configFile = "versus.config.json";

    for (const directory of directories) {
        const spinner = nanospinner.createSpinner("Creating Directory: " + directory).start();
        mkdirSync(path.join(process.cwd(), directory), { recursive: true });
        spinner.success();
    }

    executeNPM("init -y");
    writeFileSync(configFile, JSON.stringify({
        $VERSION: require("../../package.json").version,
        name: path.basename(process.cwd()).toLowerCase().replace(" ", "-"),
        version: "1.0-SNAPSHOT",
        description: "",
        license: "MIT",
        main: "com.example.Main"
    }, null, 4));
    writeFileSync(path.join(process.cwd(), "src", "main", "javascript", "com", "example", "Main.js"), `/*
This is the main file pointed from the versus.config.json main field.
This file will get executed when you run \`versus run\` without any arguments. Or you can point the cli to run a specific file when you do \`versus run <file>\`.

Note that the file argument must be . without the / because its gonna replace them.

Thank you for using Versus CLI!
*/

console.log("Hello From Versus CLI");`)
    const current = Date.now();
    console.log("Initialized workspace in " + ((current - old) / 1000) + "s");
});

emitter.on("workspace.run", (file) => {

    if (file) {
        let directory = path.dirname(file);
        let filename = path.basename(file);
        directory = directory.replace(".", "/");
        if (existsSync(path.join(directory, filename))) {

            execSync("node " + path.join(directory, filename), {
                cwd: process.cwd(),
                encoding: "utf-8",
                stdio: "inherit"
            });
        
        }
    } else {

        if (!checkProjectConfigVersion()) {
            console.log(`${Color.yellowBright("WARNING: ")}` + "Version maybe outdated or over the current api version, If the version is outdated use \"versus update\" to update the package");
        }
        
        const config = getConfig();
        /**
         * @type {string}
         */
        let main = config["main"];

        if (!main)
            return getReporter().reportError(new Error("Versus config field doesn't contain the main field. Please check that the main file contains that field and run the command again."), "versus.config.json");
    
        main = main.replace(/\./g, "/");

        let directory = path.dirname(path.join(process.cwd(), "src", "main", "javascript", main));
        let filename = path.basename(path.join(process.cwd(), "src", "main", "javascript", main));
        if (existsSync(path.join(directory, filename + ".js"))) {

            execSync("node " + path.join(directory, filename + ".js"), {
                cwd: process.cwd(),
                encoding: "utf-8",
                stdio: "inherit"
            });
        
        } else 
            return getReporter().reportError(new Error("File does not exist within the following directory " + directory + "."), main);
    }
    
});

// Run the program
init();