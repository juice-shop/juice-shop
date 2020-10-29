"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = exports.setLogHandlersForTests = void 0;
const express = require("express");
const stylelint = require("stylelint");
const fs = require("fs");
const bodyParser = require("body-parser");
// for testing purposes
let log = console.log;
let logError = console.error;
const MAX_REQUEST_SIZE = "50mb";
function setLogHandlersForTests(logHandler, errorHandler) {
    log = logHandler;
    logError = errorHandler;
}
exports.setLogHandlersForTests = setLogHandlersForTests;
function start(port = 0, host = "127.0.0.1") {
    return new Promise(resolve => {
        log("DEBUG starting stylelint-bridge server at port", port);
        const app = express();
        app.use(bodyParser.json({ limit: MAX_REQUEST_SIZE }));
        app.post("/analyze", analyzeWithStylelint);
        app.get("/status", (_, resp) => resp.send("OK!"));
        app.post("/close", (_req, resp) => {
            console.log("DEBUG stylelint-bridge server will shutdown");
            resp.end(() => {
                server.close();
            });
        });
        // every time something is wrong we log error and send empty response (with 0 issues)
        // it's important to keep this call last in configuring "app"
        app.use((error, _req, response, _next) => processError(error, response));
        const server = app.listen(port, host, () => {
            log("DEBUG stylelint-bridge server is running at port", server.address().port);
            resolve(server);
        });
    });
}
exports.start = start;
function analyzeWithStylelint(request, response) {
    const parsedRequest = request.body;
    const { filePath, fileContent, configFile } = parsedRequest;
    const code = typeof fileContent == "string" ? fileContent : getFileContent(filePath);
    const options = {
        code,
        codeFilename: filePath,
        configFile
    };
    stylelint
        .lint(options)
        .then(result => response.json(toIssues(result.results, filePath)))
        .catch(error => processError(error, response));
}
function processError(error, response) {
    logError(error);
    response.json([]);
}
function toIssues(results, filePath) {
    const analysisResponse = [];
    // we should have only one element in 'results' as we are analyzing only 1 file
    results.forEach(result => {
        // to avoid reporting on "fake" source like <input ccs 1>
        if (result.source !== filePath) {
            log(`DEBUG For file [${filePath}] received issues with [${result.source}] as a source. They will not be reported.`);
            return;
        }
        result.warnings.forEach(warning => analysisResponse.push({
            line: warning.line,
            text: warning.text,
            rule: warning.rule
        }));
    });
    return analysisResponse;
}
function getFileContent(filePath) {
    const fileContent = fs.readFileSync(filePath, { encoding: "utf8" });
    // strip BOM
    if (fileContent.charCodeAt(0) === 0xfeff) {
        return fileContent.slice(1);
    }
    return fileContent;
}
//# sourceMappingURL=server.js.map