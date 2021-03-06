"use strict";

import "reflect-metadata";
import {anything, instance, mock, verify, when} from "ts-mockito";
import {TestSettings} from "../../../testsettings";
import {assert} from "chai";
import {FileTokenStorage} from "../../../../src/bll/credentialsstore/linux/file-token-storage";
import {LinuxFileApi} from "../../../../src/bll/credentialsstore/linux/linux-file-api";

suite("LinuxFileApi", () => {
    test("should verify constructor", function () {
        const fileTokenStorageMock: FileTokenStorage = mock(FileTokenStorage);
        const fileTokenStorageSpy = instance(fileTokenStorageMock);
        new LinuxFileApi(fileTokenStorageSpy);
        verify(fileTokenStorageMock.setFilename(anything())).called();
    });

    test("should verify getCredentials without any accounts", function (done) {
        const fileTokenStorageMock: FileTokenStorage = mock(FileTokenStorage);
        const resultPromise: Promise<any[]> = new Promise((resolve) => {
            resolve([]);
        });
        when(fileTokenStorageMock.loadEntries()).thenReturn(resultPromise);
        const fileTokenStorageSpy = instance(fileTokenStorageMock);

        const credStore: LinuxFileApi = new LinuxFileApi(fileTokenStorageSpy);
        credStore.getCredentials().then((cred) => {
            assert.isUndefined(cred);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify getCredentials with one account", function (done) {
        const fileTokenStorageMock: FileTokenStorage = mock(FileTokenStorage);
        const resultPromise: Promise<any[]> = new Promise((resolve) => {
            resolve([TestSettings.linuxCredentialsObj]);
        });
        when(fileTokenStorageMock.loadEntries()).thenReturn(resultPromise);
        const fileTokenStorageSpy = instance(fileTokenStorageMock);
        const credStore: LinuxFileApi = new LinuxFileApi(fileTokenStorageSpy);
        credStore.getCredentials().then((cred) => {
            assert.equal(cred.serverURL, TestSettings.url);
            assert.equal(cred.user, TestSettings.account);
            assert.equal(cred.password, TestSettings.password);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify getCredentials with more then one account", function (done) {
        const fileTokenStorageMock: FileTokenStorage = mock(FileTokenStorage);
        const resultPromise: Promise<any[]> = new Promise((resolve) => {
            resolve([TestSettings.otherLinuxCredentials, TestSettings.linuxCredentialsObj]);
        });
        when(fileTokenStorageMock.loadEntries()).thenReturn(resultPromise);
        const fileTokenStorageSpy = instance(fileTokenStorageMock);
        const credStore: LinuxFileApi = new LinuxFileApi(fileTokenStorageSpy);
        credStore.getCredentials().then((cred) => {
            assert.notEqual(cred.serverURL, TestSettings.url);
            assert.notEqual(cred.user, TestSettings.account);
            assert.notEqual(cred.password, TestSettings.password);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify setCredentials", async function () {
        const fileTokenStorageMock: FileTokenStorage = mock(FileTokenStorage);
        const fileTokenStorageSpy = instance(fileTokenStorageMock);
        const credStore: LinuxFileApi = new LinuxFileApi(fileTokenStorageSpy);
        await credStore.setCredentials(TestSettings.credentials);
        verify(fileTokenStorageMock.addEntries(anything(), anything())).called();
    });

    test("should verify removeCredentials", async function () {
        const fileTokenStorageMock: FileTokenStorage = mock(FileTokenStorage);
        const fileTokenStorageSpy = instance(fileTokenStorageMock);
        const credStore: LinuxFileApi = new LinuxFileApi(fileTokenStorageSpy);
        await credStore.removeCredentials();
        verify(fileTokenStorageMock.keepEntries(anything())).called();
    });

});
