export interface VersusOptions {

}

export class Versus {

    /**
     * Versus Options
     */
    private options?: VersusOptions;

    /**
     * Jsar
     */
    private jsar: VersusJsar;
    
    /**
     * Configurator
     */
    private configurator: VersusConfigurator;

    constructor(options?: VersusOptions);

    /**
     * Creates a project files and also creates a config
     */
    createProject(): void;

    /**
     * Configuration utilities for versus configs
     */
    getConfigurator(): VersusConfigurator;

    /**
     * Versus Jsar utilities
     */
    getJsar(): VersusJsar;

    /**
     * Runs a project/file
     * @param file File to run can be null
     */
    runProject(file?: string);
}

export type VersusGithub = {
    url: string,
    homepage: string,
    issues: string
}

export type VersusDefaultConfigurationData = {
    $VERSION: string,
    name: string,
    version: string,
    description?: string,
    license?: string,
    main: string,
    github: VersusGithub,
}

export class CrashReporter {

    reportError(error: Error, filename?: string);

}

export class VersusJsar {

    private versus: Versus;

    constructor(versus: Versus);

    /**
     * Builds the project into a jsar file
     */
    buildProject(): void;

    /**
     * Runs a jsar file
     * @param filename Jsar file to run
     */
    runJsar(filename: string): void;

}

export class VersusConfigurator {

    private versus: Versus;
    
    private data: VersusDefaultConfigurationData;

    constructor(versus: Versus);

    /**
     * Creates a versus configuration file to the current folder
     */
    createVersusConfiguration(): void;

    /**
     * Creates a npm config using `npm init -y`
     */
    createNPMConfig(): void;


}