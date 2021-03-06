import * as pako from "pako";
import {Logger} from "./logger";
import {Change} from "../entities/change";
import {Build} from "../entities/build";
import {Constants} from "./constants";

export class Utils {

    /**
     * @param value - any string in the format ${value1:value2}
     * @return - an array in the format ${[value1, value2]}
     */
    public static parseValueColonValue(value: string): string[] {
        const KEY_SEPARATOR: string = ":";
        if (value === undefined || !value.indexOf(KEY_SEPARATOR)) {
            Logger.logWarning(`VsCodeUtils#parseValueColonValue: value ${value} wasn't parsed`);
            return undefined;
        }
        const keys = value.split(KEY_SEPARATOR);
        return keys.length !== 2 ? undefined : keys;
    }

    public static gzip2Xml(gzip: Uint8Array[]): string {
        Logger.logDebug(`VsCodeUtils#gzip2Str: starts unzipping gzip`);
        const STEP: number = 100000;
        const buffer: string[] = [];
        // Pako magic
        const inflatedGzip: Uint16Array = pako.inflate(gzip);
        // Convert gzipped byteArray back to ascii string:
        for (let i: number = 0; i < inflatedGzip.byteLength; i = i + STEP) {
            /*RangeError: Maximum call stack size exceeded when i is between 250000 and 260000*/
            const topIndex = Math.min(i + STEP, inflatedGzip.byteLength);
            /* tslint:disable:no-null-keyword */
            buffer.push(String.fromCharCode.apply(null, new Uint16Array(inflatedGzip.slice(i, topIndex))));
            /* tslint:enable:no-null-keyword */
        }
        Logger.logDebug(`VsCodeUtils#gzip2Str: finishes unzipping gzip`);
        return buffer.join("");
    }

    /**
     * This method prepares message to display from change items and serverUrl.
     * @param change - changeItemProxy
     * @param serverURL - serverURL
     */
    public static formMessage(change: Change, serverURL: string): string {
        const messageSB: string[] = [];
        if (change.id !== -1) {
            const changePrefix = change.isPersonal ? "Personal build for change" : "Build for change";
            const changeUrl: string = `${serverURL}/viewModification.html?modId=${change.id}&personal=${change.isPersonal}`;
            messageSB.push(`${changePrefix} #${change.id} has "${change.status}" status. ${changeUrl}`);
        }
        const builds: Build[] = change.builds;
        if (!builds) {
            return messageSB.join("\n");
        }

        builds.forEach((build) => {
            if (!build || build.id === -1) {
                return;
            }
            let buildStatus: string;
            switch (build.status) {
                case ("SUCCESS"): {
                    buildStatus = "successful";
                    break;
                }
                case ("FAILURE"): {
                    buildStatus = `failed (${build.statusText})`;
                    break;
                }
                default:
                    buildStatus = `has "${build.status}" status`;
            }
            const buildPrefix = build.isPersonal ? "Personal build" : "Build";
            const buildChangeUrl = build.webUrl || `${serverURL}/viewLog.html?buildId=${build.id}`;
            messageSB.push(`${buildPrefix} ${build.projectName} :: ${build.name} ` +
                `#${build.buildNumber} ${buildStatus}. More details: ${buildChangeUrl}`);
        });
        return messageSB.join("\n");
    }

    /**
     * Prepares an error for writing into log
     * @param err - an error
     */
    public static formatErrorMessage(err): string {
        if (!err || !err.message) {
            return err || "";
        }
        let formattedMsg: string = err.message;
        if (err.stderr) {
            formattedMsg = `${formattedMsg} ${err.stderr}`;
        }
        return formattedMsg;
    }

    /**
     * This method filters an array and returns elements which has only uniq keys
     * @param arr - an array which should be filtered
     * @param fn - a filter function which should return the uniq key
     */
    public static uniqBy<T>(arr: T[], fn: (el: T) => string): T[] {
        if (!arr) {
            return [];
        }
        // tslint:disable-next-line:no-null-keyword
        const seen = Object.create(null);
        return arr.filter((el) => {
            const key = fn(el);
            if (seen[key]) {
                return false;
            }

            seen[key] = true;
            return true;
        });
    }

    /**
     * This method generates uniq UUID in the format "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".
     */
    public static uuidv4(): string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            // tslint:disable-next-line:no-bitwise
            const r = Math.random() * 16 | 0;
            // tslint:disable-next-line:no-bitwise
            const v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * @param ms - Time of sleep in milliseconds
     */
    public static sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    public static clearArray(array: any[]): void {
        array.length = 0;
    }

    public static formChangeLabel(change: Change): string {
        const description = change.myDescription ? change.myDescription : "<no comment>";
        const myVersionControlName = change.myVersionControlName;
        const changesCount = `${change.myChangesCount} file${change.myChangesCount === 0 ? "s" : ""}`;
        return `${description}\n${myVersionControlName} | ${changesCount}`;
    }

    public static createTargetName(url: string, username: string): string {
        const encryptedUrl: string = new Buffer(url, "utf8").toString("hex");
        const encryptedUsername: string = new Buffer(username, "utf8").toString("hex");
        return encryptedUrl + Constants.TARGET_NAME_SEPARATOR + encryptedUsername;
    }

    public static tryParseTargetName(targetName: string): {url, username} {
        if (!targetName) {
            return undefined;
        }
        let result;
        try {
            result = this.parseTargetName(targetName);
        } catch (err) {
            Logger.logWarning(`tryParseTargetName: ${Utils.formatErrorMessage(err)}`);
            result = undefined;
        }
        return result;
    }

    private static parseTargetName(targetName: string): {url, username} {
        if (!targetName) {
            return undefined;
        }
        const segments: string[] = targetName.split(Constants.TARGET_NAME_SEPARATOR);
        const url: string = new Buffer(segments[0], "hex").toString("utf8");
        const username: string = new Buffer(segments[1], "hex").toString("utf8");
        return {
            url: url,
            username: username
        };
    }
}
