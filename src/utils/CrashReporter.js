class CrashReporter {

    constructor() {

    }

    /**
     * 
     * @param {Error} error 
     */
    reportError(error, occuringFile) {


        console.log(`[${new Date().toUTCString()}]: ${error.name}: ${error.message} at file: ${occuringFile}\n      ${error.stack}`);

        return process.exit(1);
    }

}

module.exports = CrashReporter;