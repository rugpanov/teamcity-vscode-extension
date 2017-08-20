"use strict";

import {OutputChannel} from "vscode";
import {Logger} from "../utils/logger";
import {VsCodeUtils} from "../utils/vscodeutils";
import {Credentials} from "../credentialsstore/credentials";
import {CredentialsStore} from "../credentialsstore/credentialsstore";
import {SummaryDataProxy} from "../entities/summarydataproxy";
import {ChangeItemProxy} from "../entities/ChangeItemProxy";
import {IRemoteBuildServer} from "../dal/iremotebuildserver";
import {XmlParser} from "../bll/xmlparser";
import {RemoteBuildServer} from "../dal/remotebuldserver";
import {ModificationCounterSubscription} from "./modificationcountersubscription";

export class NotificationWatcher {
    private readonly _credentialStore: CredentialsStore;
    private readonly CHECK_FREQUENCY_MS: number = 10000;
    private readonly outdatedChangeIds: string[] = [];
    private readonly outdatedPersonalChangeIds: string[] = [];
    private readonly _outputChannel: OutputChannel;
    private _remoteBuildServer: IRemoteBuildServer;
    private _subscription: ModificationCounterSubscription;
    private isActive = false;

    constructor(credentialStore: CredentialsStore, outputChannel: OutputChannel) {
        this._credentialStore = credentialStore;
        this._outputChannel = outputChannel;
        Logger.logDebug("Credential Store was initialized");
    }

    /**
     * This method activates Notification Watcher. Since user is signed in, it will check if eventCounter is changed.
     * Frequency of requests on server is settled by CHECK_FREQUENCY_MS.
     */
    public async activate() {
        this.isActive = true;
        const credentials: Credentials = this._credentialStore.getCredential();
        if (!credentials) {
            Logger.logWarning("NotificationWatcher#activate: User Credentials absent");
            return;
        }
        this._remoteBuildServer = new RemoteBuildServer(credentials.serverURL, credentials.sessionId);
        const gZippedSummary : Uint8Array[] = await this._remoteBuildServer.getGZippedSummary(credentials.userId);
        const summeryXmlObj: string = VsCodeUtils.gzip2Str(gZippedSummary);
        const summary: SummaryDataProxy = await XmlParser.parseSummary(summeryXmlObj);
        this.updateSubscriptions(summary, credentials.userId);
        const serializedSubscription : string = this._subscription.serialize();
        let prevEventCounter: number = await this._remoteBuildServer.getTotalNumberOfEvents(serializedSubscription);
        //filling outdatedChangeIds and outdatedPersonalChangeIds arrays

        this.collectNewChanges(summary.changes);
        this.collectNewChanges(summary.personalChanges);
        while (this.isActive && credentials) {
            const serializedSubscription : string = this._subscription.serialize();
            const eventCounter: number = await this._remoteBuildServer.getTotalNumberOfEvents(serializedSubscription);
            if (eventCounter === prevEventCounter) {
                await VsCodeUtils.sleep(this.CHECK_FREQUENCY_MS);
                continue;
            }
            Logger.logInfo("Notification Logger was changed. We should process new notifications.");
            const gZippedSummary : Uint8Array[] = await this._remoteBuildServer.getGZippedSummary(credentials.userId);
            const summeryXmlObj: string = VsCodeUtils.gzip2Str(gZippedSummary);
            const summary: SummaryDataProxy = await XmlParser.parseSummary(summeryXmlObj);
            this.updateSubscriptions(summary, credentials.userId);
            let changes: ChangeItemProxy[] = this.collectNewChanges(summary.changes);
            changes = changes.concat(this.collectNewChanges(summary.personalChanges));
            await this.displayChanges(changes);
            prevEventCounter = eventCounter;
            await VsCodeUtils.sleep(this.CHECK_FREQUENCY_MS);
        }
    }

    private updateSubscriptions(summary : SummaryDataProxy, userId : string) : void {
        this._subscription = ModificationCounterSubscription.fromTeamServerSummaryData(summary, userId);
    }
    /**
     * This method resets all contained data.
     */
    public resetData() {
        this.isActive = false;
        this.outdatedChangeIds.length = 0;
        this.outdatedPersonalChangeIds.length = 0;
        Logger.logDebug("Notification Watcher data were reset");
    }

    /**
     * This method works on the observation that changes in the summary are sorted and the first change in an array is the latest one.
     * @param changes - sorted array of personal or non-personal changes
     * @return - all new changes.
     */
    private collectNewChanges(changes: ChangeItemProxy[]): ChangeItemProxy[] {
        const newChanges: ChangeItemProxy[] = [];
        for (let i = 0; i < changes.length; i++) {
            const correspondingArray = changes[i].isPersonal ? this.outdatedPersonalChangeIds : this.outdatedChangeIds;
            if (correspondingArray.indexOf(`${changes[i].changeId}:${changes[i].status}`) === -1) {
                newChanges.push(changes[i]);
                correspondingArray.push(`${changes[i].changeId}:${changes[i].status}`);
            } else {
                break;
            }
        }
        return newChanges;
    }

    /**
     * This method collect required info from change objects and display corresponding message into TeamCity output.
     * @param changes - change objects to display.
     */
    private async displayChanges(changes: ChangeItemProxy[]) {
        const credentials: Credentials = this._credentialStore.getCredential();
        if (!changes || !credentials) {
            Logger.logWarning(`NotificationWatcher#displayChanges: changes or user credentials absent`);
            return;
        }
        changes.forEach((change) => {
            const message: string = VsCodeUtils.formMessage(change, credentials);
            this._outputChannel.appendLine(message + "\n");
        });
    }
}
