const path = require("path");
const VersusConfigurator = require("./VersusConfigurator");
const VersusJsar = require("./VersusJsar");
const { existsSync } = require("fs");
const { execSync } = require("child_process");
const { checkProjectConfigVersion, getConfig, getReporter } = require("../utils/Utils");

class Versus {

    static createVersus(options) {
        return new Versus(options);
    }

    constructor(options) {
        this.options = options;
        this.configurator = new VersusConfigurator(this);
        this.jsar = new VersusJsar(this);
    }

    test() {
        if (!checkProjectConfigVersion()) {
            console.log(`${Color.yellowBright("WARNING: ")}` + "Version maybe outdated or over the current api version, If the version is outdated use \"versus update\" to update the package");
        }
        
        const config = getConfig();
        /**
         * @type {string}
         */
        let main = config["test"];

        if (!main)
            return getReporter().reportError(new Error("Versus config field doesn't contain the test field. Please check that the test file contains that field and run the command again."), "versus.config.json");
    
        main = main.replace(/\./g, "/");

        let directory = path.dirname(path.join(process.cwd(), "src", "test", "javascript", main));
        let filename = path.basename(path.join(process.cwd(), "src", "test", "javascript", main));
        if (existsSync(path.join(directory, filename + ".js"))) {

            execSync("node " + path.join(directory, filename + ".js"), {
                cwd: process.cwd(),
                encoding: "utf-8",
                stdio: "inherit"
            });
        
        } else 
            return getReporter().reportError(new Error("File does not exist within the following directory " + directory + "."), main);
    }

    getConfigurator() {
        return this.configurator;
    }

    getJsar() {
        return this.jsar;
    }

    runProject(file) {
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
    }
}

module.exports = Versus;