"use strict";

import "reflect-metadata";
import {anything, instance, mock, verify, when} from "ts-mockito";
import {WinPersistentCredentialsStore} from "../../../../src/bll/credentialsstore/win32/win-credstore";
import {WindowsCredentialStoreApi} from "../../../../src/bll/credentialsstore/win32/win-credstore-api";
import * as stream from "stream";
import {TestSettings} from "../../../testsettings";
import {assert} from "chai";
import {WinCredStoreParsingStream} from "../../../../src/bll/credentialsstore/win32/win-credstore-parser";

suite("WindowsCredentialStoreApi", () => {
    test("should verify constructor", function () {
        const winPersistentCredentialsStoreMock = mock(WinPersistentCredentialsStore);
        const winPersistentCredentialsStoreSpy = instance(winPersistentCredentialsStoreMock);
        new WindowsCredentialStoreApi(winPersistentCredentialsStoreSpy);
        verify(winPersistentCredentialsStoreMock.setPrefix(anything())).called();
    });

    test("should verify getCredentials without any accounts", function (done) {
        const winPersistentCredentialsStoreMock = mock(WinPersistentCredentialsStore);
        const readable: any = new stream.Readable({ objectMode: true });
        readable.pipe(new WinCredStoreParsingStream());
        when(winPersistentCredentialsStoreMock.getCredentialsListStream()).thenReturn(readable);
        //tslint:disable-next-line: no-null-keyword
        readable.push(null);
        const winPersistentCredentialsStoreSpy = instance(winPersistentCredentialsStoreMock);
        const credStore = new WindowsCredentialStoreApi(winPersistentCredentialsStoreSpy);
        credStore.getCredentials().then((cred) => {
            assert.isUndefined(cred);
            done("any error");
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify getCredentials with one account", function (done) {
        const winPersistentCredentialsStoreMock = mock(WinPersistentCredentialsStore);
        const readable: any = new stream.Readable({ objectMode: true });
        readable.pipe(new WinCredStoreParsingStream());
        when(winPersistentCredentialsStoreMock.getCredentialsListStream()).thenReturn(readable);
        readable.push(TestSettings.winCredentials);
        //tslint:disable-next-line: no-null-keyword
        readable.push(null);
        const winPersistentCredentialsStoreSpy = instance(winPersistentCredentialsStoreMock);
        const credStore = new WindowsCredentialStoreApi(winPersistentCredentialsStoreSpy);
        credStore.getCredentials().then((cred) => {
            assert.equal(cred.password, TestSettings.password);
            assert.equal(cred.serverURL, TestSettings.url);
            assert.equal(cred.user, TestSettings.account);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify getCredentials with more then one account", function (done) {
        const winPersistentCredentialsStoreMock = mock(WinPersistentCredentialsStore);
        const readable: any = new stream.Readable({ objectMode: true });
        readable.pipe(new WinCredStoreParsingStream());
        when(winPersistentCredentialsStoreMock.getCredentialsListStream()).thenReturn(readable);
        readable.push(TestSettings.anotherWinCredentials);
        readable.push(TestSettings.winCredentials);
        //tslint:disable-next-line: no-null-keyword
        readable.push(null);
        const winPersistentCredentialsStoreSpy = instance(winPersistentCredentialsStoreMock);
        const credStore = new WindowsCredentialStoreApi(winPersistentCredentialsStoreSpy);
        credStore.getCredentials().then((cred) => {
            assert.notEqual(cred.password, TestSettings.password);
            assert.notEqual(cred.serverURL, TestSettings.url);
            assert.notEqual(cred.user, TestSettings.account);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify setCredentials", async function () {
        const winPersistentCredentialsStoreMock = mock(WinPersistentCredentialsStore);
        const encruptedUrl = new Buffer(TestSettings.url, "utf8").toString("hex");
        const encruptedUsername = new Buffer(TestSettings.account, "utf8").toString("hex");
        const expectedTargetName = encruptedUrl + WindowsCredentialStoreApi.separator + encruptedUsername;
        const winPersistentCredentialsStoreSpy = instance(winPersistentCredentialsStoreMock);
        const credStore = new WindowsCredentialStoreApi(winPersistentCredentialsStoreSpy);
        await credStore.setCredentials(TestSettings.credentials);
        verify(winPersistentCredentialsStoreMock.set(expectedTargetName, TestSettings.password)).called();
    });

    test("should verify removeCredentials", async function () {
        const winPersistentCredentialsStoreMock = mock(WinPersistentCredentialsStore);
        const winPersistentCredentialsStoreSpy = instance(winPersistentCredentialsStoreMock);
        const credStore = new WindowsCredentialStoreApi(winPersistentCredentialsStoreSpy);
        await credStore.removeCredentials();
        verify(winPersistentCredentialsStoreMock.remove(anything())).called();
    });

    test("should verify removeCredentials with Not Found Err Code", async function () {
        const winPersistentCredentialsStoreMock = mock(WinPersistentCredentialsStore);
        const credsNotFoundError: any = new Error("Any message");
        credsNotFoundError.code = 1168;
        when(winPersistentCredentialsStoreMock.remove(anything())).thenThrow(credsNotFoundError);
        const winPersistentCredentialsStoreSpy = instance(winPersistentCredentialsStoreMock);
        const credStore = new WindowsCredentialStoreApi(winPersistentCredentialsStoreSpy);
        await credStore.removeCredentials();
    });

    test("should verify removeCredentials with Any other Code except Not Found Err Code", function (done) {
        const winPersistentCredentialsStoreMock = mock(WinPersistentCredentialsStore);
        const notFoundError: any = new Error("Any message");
        notFoundError.code = -1;
        when(winPersistentCredentialsStoreMock.remove(anything())).thenThrow(notFoundError);
        const winPersistentCredentialsStoreSpy = instance(winPersistentCredentialsStoreMock);
        const credStore = new WindowsCredentialStoreApi(winPersistentCredentialsStoreSpy);
        credStore.removeCredentials().then(() => {
            done("An exception was expected");
        }).catch(() => {
            done();
        });
    });
});
