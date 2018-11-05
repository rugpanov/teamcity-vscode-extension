"use strict";

import "reflect-metadata";
import {anything, instance, mock, verify, when, anyString} from "ts-mockito";
import * as stream from "stream";
import {TestSettings} from "../../../testsettings";
import {assert} from "chai";
import {OsxKeychainApi} from "../../../../src/bll/credentialsstore/osx/osx-keychain-api";
import {OsxKeychain} from "../../../../src/bll/credentialsstore/osx/osx-keychain-access";
import {OsxSecurityParsingStream} from "../../../../src/bll/credentialsstore/osx/osx-keychain-parser";

suite("OsxKeychainApi", () => {
    test("should verify constructor", function () {
        const osxKeychainMock: OsxKeychain = mock(OsxKeychain);
        const osxKeychainSpy = instance(osxKeychainMock);
        new OsxKeychainApi(osxKeychainSpy);
        verify(osxKeychainMock.setPrefix(anything())).called();
    });

    test("should verify getCredentials without any accounts", function (done) {
        const osxKeychainMock = mock(OsxKeychain);
        const readable: any = new stream.Readable({ objectMode: true });
        readable.pipe(new OsxSecurityParsingStream());
        when(osxKeychainMock.getCredentialsWithoutPasswordsListStream()).thenReturn(readable);
        //tslint:disable-next-line: no-null-keyword
        readable.push(null);
        const osxKeychainSpy = instance(osxKeychainMock);
        const credStore = new OsxKeychainApi(osxKeychainSpy);
        credStore.getCredentials().then((cred) => {
            assert.isUndefined(cred);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify getCredentials with one account without getting password", function (done) {
        const osxKeychainMock: OsxKeychain = mock(OsxKeychain);
        const readable: any = new stream.Readable({ objectMode: true });
        readable.pipe(new OsxSecurityParsingStream());
        when(osxKeychainMock.getCredentialsWithoutPasswordsListStream()).thenReturn(readable);

        readable.push(TestSettings.osxCredentials);
        //tslint:disable-next-line: no-null-keyword
        readable.push(null);
        const osxKeychainSpy = instance(osxKeychainMock);
        const credStore = new OsxKeychainApi(osxKeychainSpy);
        credStore.getCredentials().then((cred) => {
            assert.equal(cred.serverURL, TestSettings.url);
            assert.equal(cred.user, TestSettings.account);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify getCredentials with one account with getting password", function (done) {
        const osxKeychainMock: OsxKeychain = mock(OsxKeychain);
        const readable: any = new stream.Readable({ objectMode: true });
        readable.pipe(new OsxSecurityParsingStream());
        when(osxKeychainMock.getCredentialsWithoutPasswordsListStream()).thenReturn(readable);
        const targetName = TestSettings.osxCredentials;
        when(osxKeychainMock.getPasswordForUser(anyString())).thenReturn(new Promise<string>((r) => r(TestSettings.password)));
        readable.push(TestSettings.osxCredentials);
        //tslint:disable-next-line: no-null-keyword
        readable.push(null);

        const osxKeychainSpy = instance(osxKeychainMock);
        const credStore = new OsxKeychainApi(osxKeychainSpy);
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
        const osxKeychainMock: OsxKeychain = mock(OsxKeychain);
        const readable: any = new stream.Readable({ objectMode: true });
        readable.pipe(new OsxSecurityParsingStream());
        when(osxKeychainMock.getCredentialsWithoutPasswordsListStream()).thenReturn(readable);

        readable.push(TestSettings.otherOsxCredentials);
        readable.push(TestSettings.osxCredentials);
        //tslint:disable-next-line: no-null-keyword
        readable.push(null);
        const osxKeychainSpy = instance(osxKeychainMock);
        const credStore = new OsxKeychainApi(osxKeychainSpy);
        credStore.getCredentials().then((cred) => {
            assert.notEqual(cred.serverURL, TestSettings.url);
            assert.notEqual(cred.user, TestSettings.account);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify setCredentials", async function () {
        const osxKeychainMock = mock(OsxKeychain);
        const encruptedUrl = new Buffer(TestSettings.url, "utf8").toString("hex");
        const encruptedUsername = new Buffer(TestSettings.account, "utf8").toString("hex");
        const expectedTargetName = encruptedUrl + OsxKeychainApi.separator + encruptedUsername;
        const osxKeychainSpy = instance(osxKeychainMock);
        const credStore = new OsxKeychainApi(osxKeychainSpy);
        await credStore.setCredentials(TestSettings.credentials);
        const emptyDescription = "";
        verify(osxKeychainMock.set(expectedTargetName, emptyDescription, TestSettings.password)).called();
    });

    test("should verify removeCredentials with one exist account", async function () {
        const osxKeychainMock = mock(OsxKeychain);
        const readable: any = new stream.Readable({ objectMode: true });
        readable.pipe(new OsxSecurityParsingStream());
        when(osxKeychainMock.getCredentialsWithoutPasswordsListStream()).thenReturn(readable);
        readable.push(TestSettings.osxCredentials);
        //tslint:disable-next-line: no-null-keyword
        readable.push(null);
        const osxKeychainSpy = instance(osxKeychainMock);
        const credStore = new OsxKeychainApi(osxKeychainSpy);
        await credStore.removeCredentials();
        const emptyDescription = "";
        const encruptedUrl = new Buffer(TestSettings.url, "utf8").toString("hex");
        const encruptedUsername = new Buffer(TestSettings.account, "utf8").toString("hex");
        const expectedTargetName = encruptedUrl + OsxKeychainApi.separator + encruptedUsername;
        verify(osxKeychainMock.remove(expectedTargetName, emptyDescription)).called();
    });

    test("should verify removeCredentials with more then one exist account", async function () {
        const osxKeychainMock = mock(OsxKeychain);
        const readable: any = new stream.Readable({ objectMode: true });
        readable.pipe(new OsxSecurityParsingStream());
        when(osxKeychainMock.getCredentialsWithoutPasswordsListStream()).thenReturn(readable);
        readable.push(TestSettings.osxCredentials);
        readable.push(TestSettings.otherOsxCredentials);
        //tslint:disable-next-line: no-null-keyword
        readable.push(null);
        const osxKeychainSpy = instance(osxKeychainMock);
        const credStore = new OsxKeychainApi(osxKeychainSpy);
        await credStore.removeCredentials();
        verify(osxKeychainMock.remove(anything(), anything())).twice();
    });
});
