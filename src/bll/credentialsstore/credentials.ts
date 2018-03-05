"use strict";

export class Credentials {
    private _serverURL: string;
    private _user: string;
    private _password: string;
    private _userId: string;
    private _sessionId: string;

    public constructor(serverURL, user, password, userId, sessionId) {
        this._serverURL = serverURL;
        this._user = user;
        this._password = password;
        this._userId = userId;
        this._sessionId = sessionId;
    }

    public get serverURL(): string {
        return this._serverURL;
    }

    public get user(): string {
        return this._user;
    }

    public get password(): string {
        return this._password;
    }

    public get userId(): string {
        return this._userId;
    }

    public get sessionId(): string {
        return this._sessionId;
    }

    public equals(credentials: Credentials): boolean {
        return !(credentials === undefined ||
            this.user !== credentials.user ||
            this.serverURL !== credentials.serverURL ||
            this.password !== credentials.password);
    }
}
