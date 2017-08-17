"use strict";

import * as fs from "fs";
import * as stream from "stream";
import { Disposable } from "vscode";
import { Logger } from "../utils/logger";
import * as passthrough_counter from "passthrough-counter";
import { ByteWriter } from "../utils/bytewriter";
import { ReadableSet } from "../utils/interfaces";
import { VsCodeUtils } from "../utils/vscodeutils";

export class AsyncWriteStream implements Disposable {
    private readonly _writeSteam: fs.WriteStream;

    constructor(fileAbsPath : string) {
        this._writeSteam = fs.createWriteStream(fileAbsPath);
    }

    public async write(buffer : Buffer) : Promise<{}> {
        return new Promise((resolve, reject) => {
            this._writeSteam.write(buffer, (err) => {
                if (err) {
                    Logger.logError(`AsyncWriteStream#write: an error occurs ${VsCodeUtils.formatErrorMessage(err)}`);
                    reject(VsCodeUtils.formatErrorMessage(err));
                }
                resolve();
            });
        });
    }

    public async writeFile(fileAbsPath : string) : Promise<{}> {
        Logger.logDebug(`AsyncWriteStream#writeFile: file path: ${fileAbsPath}`);
        const stats : fs.Stats = fs.statSync(fileAbsPath);
        const fileSizeInBytes : number = stats.size;
        Logger.logDebug(`AsyncWriteStream#writeFile: file size in bytes: ${fileSizeInBytes}`);
        const fileSizeBuffer : Buffer = ByteWriter.longToByteArray(fileSizeInBytes);
        const readstream : stream.Readable = fs.createReadStream(fileAbsPath);
        return this.writeStreamedFile({stream: readstream, length: fileSizeInBytes});
    }

    public async writeStreamedFile(readableSet : ReadableSet) : Promise<{}> {
        const fileSizeInBytes : number = readableSet.length;
        Logger.logDebug(`AsyncWriteStream#writeStreamedFile: file size in bytes: ${fileSizeInBytes}`);
        const fileSizeBuffer : Buffer = ByteWriter.longToByteArray(fileSizeInBytes);
        await this.write(fileSizeBuffer);
        const readstream : stream.Readable = readableSet.stream;
        readableSet.stream.pipe(this._writeSteam, {end: false});
        return new Promise((resolve, reject) => {
            readstream.on("end", function() {
                Logger.logDebug(`AsyncWriteStream#writeStreamedFile: file was successfully added to the patch`);
                resolve();
            });

            readstream.on("error", function() {
                Logger.logError(`AsyncWriteStream#writeStreamedFile: an error occurs at the readStream`);
                reject("An error occurs during piping from source file to the writeStream");
            });

            this._writeSteam.on("error", function() {
                Logger.logError(`AsyncWriteStream#writeStreamedFile: an error occurs at the writeStream`);
                reject("An error occurs during piping from source file to the writeStream");
            });
        });
    }

    public dispose() {
        this._writeSteam.end();
    }
}