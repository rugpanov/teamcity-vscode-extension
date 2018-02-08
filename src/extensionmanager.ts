"use strict";

import {Logger} from "./bll/utils/logger";
import {TYPES} from "./bll/utils/constants";
import {inject, injectable} from "inversify";
import {CommandHolder} from "./commandholder";
import {Settings} from "./bll/entities/settings";
import {Output} from "./view/output";
import {TeamCityStatusBarItem} from "./view/teamcitystatusbaritem";
import {CredentialsStore} from "./bll/credentialsstore/credentialsstore";
import {NotificationWatcher} from "./bll/notifications/notificationwatcher";
import {Disposable} from "vscode";
import {ProviderManager} from "./view/providermanager";
import {WorkspaceProxy} from "./bll/moduleproxies/workspace-proxy";

@injectable()
export class ExtensionManager {
    private credentialsStore: CredentialsStore;
    private readonly _commandHolder: CommandHolder;
    private _notificationWatcher: NotificationWatcher;
    private readonly _disposables: Disposable[] = [];
    private readonly providerManager: ProviderManager;

    constructor(@inject(TYPES.Settings) settings: Settings,
                @inject(TYPES.CredentialsStore) credentialsStore: CredentialsStore,
                @inject(TYPES.CommandHolder) commandHolder: CommandHolder,
                @inject(TYPES.NotificationWatcher) notificationWatcher: NotificationWatcher,
                @inject(TYPES.Output) output: Output,
                @inject(TYPES.ProviderManager) providerManager: ProviderManager,
                @inject(TYPES.TeamCityStatusBarItem) statusBarItem: TeamCityStatusBarItem,
                @inject(TYPES.WorkspaceProxy) workspaceProxy: WorkspaceProxy) {
        let defaultWorkspace;
        if (!workspaceProxy.workspaceFolders || workspaceProxy.workspaceFolders.length === 0) {
            return;
        } else {
            defaultWorkspace = workspaceProxy.workspaceFolders[0];
        }
        this.credentialsStore = credentialsStore;
        this._commandHolder = commandHolder;
        this._notificationWatcher = notificationWatcher;
        notificationWatcher.activate();
        this._disposables.push(notificationWatcher);
        this._disposables.push(output);
        this.initLogger(settings.loggingLevel, defaultWorkspace.uri.fsPath);
        this._disposables.push(statusBarItem);
        this._disposables.push(providerManager);
        this.providerManager = providerManager;
        this.trySignInWithPersistentStorage();
    }

    public refreshAllProviders() {
        this.providerManager.refreshAll();
    }

    public dispose(): void {
        this._disposables.forEach((disposable) => disposable.dispose());
    }

    public get commandHolder(): CommandHolder {
        return this._commandHolder;
    }

    private initLogger(loggingLevel: string, rootPath: string): void {
        if (loggingLevel === undefined) {
            return;
        }
        Logger.SetLoggingLevel(loggingLevel);
        if (rootPath !== undefined) {
            Logger.LogPath = rootPath;
            Logger.logInfo(`Logger path: ${rootPath}`);
            Logger.logInfo(`Logging level: ${loggingLevel}`);
        } else {
            Logger.logWarning(`Folder not opened!`);
        }
    }

    private trySignInWithPersistentStorage() {
        this.commandHolder.signIn(true);
    }
}
