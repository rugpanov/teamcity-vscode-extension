"use strict";

import {TfvcPathFinder} from "../../../src/bll/cvsutils/tfvcpathfinder";
import * as assert from "assert";
import {CpProxy} from "../../../src/bll/moduleproxies/cp-proxy";
import {anything, instance, mock, when} from "ts-mockito";
import {OsProxy} from "../../../src/bll/moduleproxies/os-proxy";
import {WorkspaceProxy} from "../../../src/bll/moduleproxies/workspace-proxy";

suite("Tfvc Path Finder", () => {
    test("should handle \"tf\" in path for win32", function (done) {
        const osMock: OsProxy = mock(OsProxy);
        when(osMock.platform()).thenReturn("win32");
        const osSpy: OsProxy = instance(osMock);

        const cpMock: CpProxy = mock(CpProxy);
        when(cpMock.execAsync(`"tf"`)).thenReturn(
            Promise.resolve<any>({
                stdout: "git version 2.13.2.windows.1"
            })
        );
        const cpSpy: CpProxy = instance(cpMock);

        const workspaceMock = mock(WorkspaceProxy);
        const workspaceSpy = instance(workspaceMock);

        const tfvcPathFinder: TfvcPathFinder = new TfvcPathFinder(osSpy, cpSpy, workspaceSpy);
        tfvcPathFinder.find().then((tfPath) => {
                assert.equal(tfPath, "tf");
                done("broken");
            }
        ).catch((err) => {
            done(err);
        });
    });

    test("should handle \"tf\" in path for linux", function (done) {
        const osMock: OsProxy = mock(OsProxy);
        when(osMock.platform()).thenReturn("linux");
        const osSpy: OsProxy = instance(osMock);

        const cpMock: CpProxy = mock(CpProxy);
        when(cpMock.execAsync(`"tf"`)).thenReturn(
            Promise.resolve<any>({
                stdout: "git version 2.13.2.windows.1"
            })
        );
        const cpSpy: CpProxy = instance(cpMock);

        const workspaceMock = mock(WorkspaceProxy);
        const workspaceSpy = instance(workspaceMock);

        const tfvcPathFinder: TfvcPathFinder = new TfvcPathFinder(osSpy, cpSpy, workspaceSpy);
        tfvcPathFinder.find().then((tfPath) => {
                assert.equal(tfPath, "tf");
                done("broken");
            }
        ).catch((err) => {
            done(err);
        });
    });

    test("should handle \"tf\" in path for darwin", function (done) {
        const osMock: OsProxy = mock(OsProxy);
        when(osMock.platform()).thenReturn("darwin");
        const osSpy: OsProxy = instance(osMock);
        const cpMock: CpProxy = mock(CpProxy);
        when(cpMock.execAsync(`"tf"`)).thenReturn(
            Promise.resolve<any>({
                stdout: "git version 2.13.2.windows.1"
            })
        );
        const cpSpy: CpProxy = instance(cpMock);

        const workspaceMock = mock(WorkspaceProxy);
        const workspaceSpy = instance(workspaceMock);

        const tfvcPathFinder: TfvcPathFinder = new TfvcPathFinder(osSpy, cpSpy, workspaceSpy);
        tfvcPathFinder.find().then((tfPath) => {
                assert.equal(tfPath, "tf");
                done("broken");
            }
        ).catch((err) => {
            done(err);
        });
    });

    test("should handle \"tf\" is not installed for win32", function (done) {
        const osMock: OsProxy = mock(OsProxy);
        when(osMock.platform()).thenReturn("win32");
        const osSpy: OsProxy = instance(osMock);

        const cpMock: CpProxy = mock(CpProxy);
        when(cpMock.execAsync(anything())).thenReturn(
            Promise.reject("Nothing")
        );
        const cpSpy: CpProxy = instance(cpMock);

        const workspaceMock = mock(WorkspaceProxy);
        const workspaceSpy = instance(workspaceMock);

        const tfvcPathFinder: TfvcPathFinder = new TfvcPathFinder(osSpy, cpSpy, workspaceSpy);
        tfvcPathFinder.find().then(() => {
                done("An error expected");
            }
        ).catch((err) => {
            assert.equal(err.message, "tfvc command line util not found");
            done();
        });
    });

    test("should handle \"tf\" is not installed for linux", function (done) {
        const osMock: OsProxy = mock(OsProxy);
        when(osMock.platform()).thenReturn("linux");
        const osSpy: OsProxy = instance(osMock);

        const cpMock: CpProxy = mock(CpProxy);
        when(cpMock.execAsync(anything())).thenReturn(
            Promise.reject("Nothing")
        );
        const cpSpy: CpProxy = instance(cpMock);

        const workspaceMock = mock(WorkspaceProxy);
        const workspaceSpy = instance(workspaceMock);

        const tfvcPathFinder: TfvcPathFinder = new TfvcPathFinder(osSpy, cpSpy, workspaceSpy);
        tfvcPathFinder.find().then(() => {
                done("An error expected");
            }
        ).catch((err) => {
            assert.equal(err.message, "tfvc command line util not found");
            done();
        });
    });

    test("should handle \"tf\" is not installed for darwin", function (done) {
        const osMock: OsProxy = mock(OsProxy);
        when(osMock.platform()).thenReturn("darwin");
        const osSpy: OsProxy = instance(osMock);

        const cpMock: CpProxy = mock(CpProxy);
        when(cpMock.execAsync(anything())).thenReturn(
            Promise.reject("Nothing")
        );
        const cpSpy: CpProxy = instance(cpMock);

        const workspaceMock = mock(WorkspaceProxy);
        const workspaceSpy = instance(workspaceMock);

        const tfvcPathFinder: TfvcPathFinder = new TfvcPathFinder(osSpy, cpSpy, workspaceSpy);
        tfvcPathFinder.find().then(() => {
                done("An error expected");
            }
        ).catch((err) => {
            assert.equal(err.message, "tfvc command line util not found");
            done();
        });
    });
});
