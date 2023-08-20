const nanospinner = require("nanospinner");
const { getConfig, checkProjectConfigVersion, getReporter, checkFileConfigVersion, getConfigFrom, executeNPM } = require('../utils/Utils');
const Color = require("cli-color");
const { existsSync, mkdirSync, copyFileSync, rmdirSync } = require("fs");
const { copySync, emptyDirSync } = require("fs-extra");
const path = require("path");
const targz = require("targz");
const os = require("os");
const { execSync } = require("child_process");

class VersusJsar {

    constructor(versus) {
        this.versus = versus;
    }

    buildProject() {

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
            copyFileSync(path.join(process.cwd(), "package.json"), path.join(process.cwd(), "build", "package.json"));
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

    }

    runJsar(filename) {
        if (!filename.endsWith(".jsar")) {
            return;
        }

        const f = filename;
        mkdirSync(path.join(os.homedir(), ".versuscache"), { recursive: true });
        const name = path.join(os.homedir(), ".versuscache", path.parse(f).name);
        mkdirSync(name, { recursive: true });
        targz.decompress({
            src: f,
            dest: path.join(name),
        }, (err) => {
            if (err)
                return getReporter().reportError(err);
            
            if (!checkFileConfigVersion(path.join(os.homedir(), ".versuscache", path.parse(f).name, "versus.config.json"))) {
                console.log(`${Color.yellowBright("WARNING: ")}` + `${f}` + " Version maybe outdated or over the current api version, If the version is outdated use \"versus update\" to update the package");
            }
    
            const config = getConfigFrom(path.join(os.homedir(), ".versuscache", path.parse(f).name, "versus.config.json"));
            let main = config["main"];
    
            main = main.replace(/\./g, "/");
    
            let cacheDir = path.join(path.join(os.homedir(), ".versuscache", path.parse(f).name))
            let directory = path.dirname(path.join(cacheDir, main));
            let filename = path.basename(path.join(cacheDir, main));
            const install = async () => {
                await executeNPM("install --prefix " + cacheDir, {
                    inherit: false
                });
                return true;
            }

            install().then(() => {
                if (existsSync(path.join(directory, filename + ".js"))) {
    
                    execSync("node " + path.join(directory, filename + '.js'), {
                        cwd: process.cwd(),
                        encoding: "utf-8",
                        stdio: "inherit"
                    });
                
                }
            });
        });
    }
}

module.exports = VersusJsar;