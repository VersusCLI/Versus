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
const Versus = require("../lib/Versus");

emitter.setMaxListeners(1000);


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

    CommandsParser.command("test")
        .description("Tests using field test in versus.config.json")
        .action((f) => {
            emitter.emit("workspace.test");
        });

    CommandsParser.command("update")
        .description("Updates Versus")
        .action(() => {
            emitter.emit("workspace.update");
        })

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
        "src/test/javascript/com/example"
    ];

    const configFile = "versus.config.json";

    for (const directory of directories) {
        const spinner = nanospinner.createSpinner("Creating Directory: " + directory).start();
        mkdirSync(path.join(process.cwd(), directory), { recursive: true });
        spinner.success();
    }

    executeNPM("init -y", { inherit: false });
    executeNPM("install @versusjs/resources", {
        inherit: true
    });
    const test = new Versus()
    test.getConfigurator().createVersusConfiguration();
    writeFileSync(path.join(process.cwd(), "src", "main", "javascript", "com", "example", "Main.js"), `/*
This is the main file pointed from the versus.config.json main field.
This file will get executed when you run \`versus run\` without any arguments. Or you can point the cli to run a specific file when you do \`versus run <file>\`.

Note that the file argument must be . without the / because its gonna replace them.

Thank you for using Versus CLI!
*/

console.log("Hello From Versus CLI");`)
writeFileSync(path.join(process.cwd(), "src", "test", "javascript", "com", "example", "Test.js"), `/*
This is the test file pointed from the versus.config.json test field.
This file will get executed when you run \`versus test\` without any arguments.

Note that the file argument must be . without the / because its gonna replace them.

Thank you for using Versus CLI!
*/

console.log("Test From Versus CLI");`)
    const current = Date.now();
    console.log("Initialized workspace in " + ((current - old) / 1000) + "s");
});

emitter.on("workspace.run", (file) => {

    const versus = new Versus();
    versus.runProject(file);
    
});

emitter.on("workspace.test", () => {
    const versus = new Versus();
    versus.test();
});

emitter.on("workspace.update", () => {
    const spinner = nanospinner.createSpinner("Updating Versus CLI").start();
    executeNPM("install -g versus.js");
    spinner.success("Updated Package! If any error is reported with npm please create an issue in our github.");
})

// Run the program
init();