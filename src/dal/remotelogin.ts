"use strict";

import * as xmlrpc from "xmlrpc";
import * as forge from "node-forge";
import {Logger} from "../utils/logger";
import {IRemoteLogin} from "./iremotelogin";
import {RcaPublicKey} from "../interfaces/rcapublickey";
import {VsCodeUtils} from "../utils/vscodeutils";
import {MessageConstants} from "../utils/messageconstants";
const pki = forge.pki;
const BigInteger = forge.jsbn.BigInteger;

export class RemoteLogin implements IRemoteLogin {

    private readonly _client;

    constructor(serverURL: string) {
        this._client = xmlrpc.createClient({url: serverURL + "/RPC2", cookies: true});
    }

    getFullServerVersion(): Promise<string> {
        Logger.logError(`RemoteLogin#getFullServerVersion: method not implemented.`);
        throw new Error("#getFullServerVersion: method not implemented.");
    }

    /**
     * @param user - user name
     * @param password - user password
     * @return - Promise<any>. In case of success it returns the line in a format ${sessionId}:${userId}
     */
    async authenticate(user: string, password: string): Promise<string> {
        const rsaPublicKey: RcaPublicKey = await this.getPublicKey();
        if (!rsaPublicKey) {
            throw MessageConstants.XMLRPC_AUTH_EXCEPTION + " rsaPublicKey is absent";
        }
        const encPass = rsaPublicKey.encrypt(password);
        const hexEncPass = forge.util.createBuffer(encPass).toHex();
        return new Promise<string>((resolve, reject) => {
            this._client.methodCall("RemoteAuthenticationServer.authenticate", [user, hexEncPass], (err, data) => {
                /* tslint:disable:no-null-keyword */
                if (err !== null || data === undefined || data.length === 0) {
                    Logger.logError("RemoteAuthenticationServer.authenticate: return an error: " + VsCodeUtils.formatErrorMessage(err));
                    return reject(err);
                }
                /* tslint:enable:no-null-keyword */
                resolve(data);
            });
        });
    }

    logout(): Promise<boolean> {
        Logger.logError(`RemoteLogin#logout: method not implemented.`);
        throw new Error("#logout: method not implemented.");
    }

    /**
     * @return - Promise for RSAPublicKey object from node-forge module.
     */
    getPublicKey(): Promise<RcaPublicKey> {
        return new Promise<RcaPublicKey>((resolve, reject) => {
            this._client.methodCall("RemoteAuthenticationServer.getPublicKey", [], (err, data) => {
                /* tslint:disable:no-null-keyword */
                if (err !== null || data === undefined) {
                    Logger.logError(`RemoteAuthenticationServer.getPublicKey: it failed at getting public key: ${VsCodeUtils.formatErrorMessage(err)}`);
                    return reject(err);
                }
                /* tslint:enable:no-null-keyword */
                const keys: string[] = VsCodeUtils.parseValueColonValue(data);
                if (!keys || keys.length !== 2) {
                    return reject("RemoteLogin#getPublicKey: wrong number of arguments");
                }
                const rsaPublicKey: RcaPublicKey = pki.setRsaPublicKey(
                    new BigInteger(keys[0]/* n */, 16),
                    new BigInteger(keys[1]/* e */, 16));
                resolve(rsaPublicKey);
            });
        });
    }
}
