/// <reference types="node" />
import { Server } from "http";
export declare function setLogHandlersForTests(logHandler: typeof console.log, errorHandler: typeof console.error): void;
export declare function start(port?: number, host?: string): Promise<Server>;
export interface AnalysisInput {
    filePath: string;
    fileContent: string | undefined;
    configFile: string;
}
export interface Issue {
    line: number;
    rule: string;
    text: string;
}
