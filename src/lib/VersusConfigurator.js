const { writeFileSync } = require("fs");
const path = require("path");
const { getReporter, executeNPM } = require("../utils/Utils");

class VersusConfigurator {

    constructor(versus) {
        this.versus = versus;
        this.defaultData = {
            $VERSION: require("../../package.json").version,
            name: "",
            version: "1.0.0",
            description: "",
            license: "MIT",
            main: "com.example.Main",
            test: "com.example.Test",
            github: {
                url: "",
                homepage: "",
                issues: ""
            },
        };
    }

    createVersusConfiguration() {

        const data = this.defaultData;
        data.name = path.basename(process.cwd());
        
        try {
            writeFileSync(path.join(process.cwd(), "versus.config.json"), JSON.stringify(data, null, 4));
            return true;
        } catch (err) {
            getReporter().reportError(err, "versus");
            return false;
        }

    }

    createNPMConfig() {
        try {
            executeNPM("init -y");
            return true;
        } catch (err) {
            getReporter().reportError(err, "versus");
            return false;
        }
    }
}

module.exports = VersusConfigurator;