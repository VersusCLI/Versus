export declare module "@versusjs/resources" {

    export function isEmpty(projectName: string, folder: string): boolean;
    export function fetchResource(projectName: string, file: string): string;
    export function fetchJSONResource(projectName: string, file: string): { [key: string]: any };
    export function deleteResource(projectName: string, file: string): void;
    export function deleteResourceFolder(projectName: string, folder: string): void;

}