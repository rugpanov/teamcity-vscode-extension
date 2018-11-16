"use strict";

import "reflect-metadata";
import {assert} from "chai";
import {PersistentStorageManager} from "../../../src/bll/credentialsstore/persistentstoragemanager";
import {TestSettings} from "../../testsettings";
import {instance, mock, verify, when} from "ts-mockito";
import {WindowsCredentialStoreApi} from "../../../src/bll/credentialsstore/win32/win-credstore-api";
import {OsProxy} from "../../../src/bll/moduleproxies/os-proxy";
import {Credentials} from "../../../src/bll/credentialsstore/credentials";

suite("PersistentStorageManager", function () {

    const testCreds = new Credentials(TestSettings.url, TestSettings.account, TestSettings.password, undefined, undefined);

    test("should verify constructor sets correct storage api provider for win32", function (done) {
        const windowsCredentialStoreApiMock: WindowsCredentialStoreApi = mock(WindowsCredentialStoreApi);
        const windowsCredentialStoreApiSpy: WindowsCredentialStoreApi = instance(windowsCredentialStoreApiMock);
        const osMock: OsProxy = mock(OsProxy);
        when(osMock.platform()).thenReturn(TestSettings.win32Platform);
        const osSpy: OsProxy = instance(osMock);
        const credentialManager: PersistentStorageManager = new PersistentStorageManager(windowsCredentialStoreApiSpy, undefined, undefined, osSpy);
        credentialManager.getCredentials().then(() => {
            verify(windowsCredentialStoreApiMock.getCredentials()).called();
            done("broken");
        }).catch((err) => {
            done("!" + err);
        });
    });

    test("should verify getCredentials for win32", function (done) {
        const windowsCredentialStoreApiMock: WindowsCredentialStoreApi = mock(WindowsCredentialStoreApi);
        const windowsCredentialStoreApiSpy: WindowsCredentialStoreApi = instance(windowsCredentialStoreApiMock);
        const osMock: OsProxy = mock(OsProxy);
        when(osMock.platform()).thenReturn(TestSettings.win32Platform);
        const osSpy: OsProxy = instance(osMock);
        const credentialManager: PersistentStorageManager = new PersistentStorageManager(windowsCredentialStoreApiSpy, undefined, undefined, osSpy);
        when(windowsCredentialStoreApiMock.getCredentials()).thenReturn(new Promise((r) => {r(testCreds); }));
        credentialManager.getCredentials().then((actualCreds) => {
            verify(windowsCredentialStoreApiMock.getCredentials()).called();
            assert.equal(actualCreds, testCreds);
            done();
        }).catch((err) => {
            done("!" + err);
        });
    });

    test("should verify setCredentials for win32 when there wasn't any before", function (done) {
        const windowsCredentialStoreApiMock: WindowsCredentialStoreApi = mock(WindowsCredentialStoreApi);
        const windowsCredentialStoreApiSpy: WindowsCredentialStoreApi = instance(windowsCredentialStoreApiMock);
        const osMock: OsProxy = mock(OsProxy);
        when(osMock.platform()).thenReturn(TestSettings.win32Platform);
        const osSpy: OsProxy = instance(osMock);
        const credentialManager: PersistentStorageManager = new PersistentStorageManager(windowsCredentialStoreApiSpy, undefined, undefined, osSpy);
        when(windowsCredentialStoreApiMock.getCredentials()).thenReturn(new Promise((r) => {r(undefined); }));
        credentialManager.setCredentials(TestSettings.credentials).then(() => {
            verify(windowsCredentialStoreApiMock.getCredentials()).called();
            verify(windowsCredentialStoreApiMock.removeCredentials()).never();
            verify(windowsCredentialStoreApiMock.setCredentials(TestSettings.credentials)).called();
            done();
        }).catch((err) => {
            done("!" + err);
        });
    });

    test("should verify setCredentials for win32 when there was one already", function (done) {
        const windowsCredentialStoreApiMock: WindowsCredentialStoreApi = mock(WindowsCredentialStoreApi);
        const windowsCredentialStoreApiSpy: WindowsCredentialStoreApi = instance(windowsCredentialStoreApiMock);
        const osMock: OsProxy = mock(OsProxy);
        when(osMock.platform()).thenReturn(TestSettings.win32Platform);
        const osSpy: OsProxy = instance(osMock);
        const credentialManager: PersistentStorageManager = new PersistentStorageManager(windowsCredentialStoreApiSpy, undefined, undefined, osSpy);
        when(windowsCredentialStoreApiMock.getCredentials()).thenReturn(new Promise((r) => {r(testCreds); }));
        credentialManager.setCredentials(TestSettings.credentials).then(() => {
            verify(windowsCredentialStoreApiMock.getCredentials()).called();
            verify(windowsCredentialStoreApiMock.removeCredentials()).called();
            verify(windowsCredentialStoreApiMock.setCredentials(TestSettings.credentials)).called();
            done();
        }).catch((err) => {
            done("!" + err);
        });
    });

    test("should verify removeCredentials for win32", function () {
        const windowsCredentialStoreApiMock: WindowsCredentialStoreApi = mock(WindowsCredentialStoreApi);
        const windowsCredentialStoreApiSpy: WindowsCredentialStoreApi = instance(windowsCredentialStoreApiMock);
        const osMock: OsProxy = mock(OsProxy);
        when(osMock.platform()).thenReturn(TestSettings.win32Platform);
        const osSpy: OsProxy = instance(osMock);
        const credentialManager: PersistentStorageManager = new PersistentStorageManager(windowsCredentialStoreApiSpy, undefined, undefined, osSpy);
        when(windowsCredentialStoreApiMock.getCredentials()).thenReturn(new Promise((r) => {r(testCreds); }));
        credentialManager.removeCredentials();
        verify(windowsCredentialStoreApiMock.removeCredentials()).called();
    });
});
