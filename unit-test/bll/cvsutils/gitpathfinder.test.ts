"use strict";

import {assert} from "chai";
import * as path from "path";
import {GitPathFinder} from "../../../src/bll/cvsutils/gitpathfinder";
import {MessageConstants} from "../../../src/bll/utils/messageconstants";
import {anyString, instance, mock, when} from "ts-mockito";
import {FsProxy} from "../../../src/bll/moduleproxies/fs-proxy";
import {ProcessProxy} from "../../../src/bll/moduleproxies/process-proxy";
import {CpProxy} from "../../../src/bll/moduleproxies/cp-proxy";
import {WorkspaceProxy} from "../../../src/bll/moduleproxies/workspace-proxy";

suite("Git Path Finder", () => {

    const correctWinVersionResult: any = {
        stdout: "git version 2.13.2.windows.1"
    };

    const correctDarwinWhichResult: any = {
        stdout: "git"
    };

    const usrBinGitDarwinWhichResult: any = {
        stdout: "/usr/bin/git"
    };

    test("should handle \"git\" path for win32", function (done) {
        const processMock = getSettedUpProcessSpy("win32");
        const expectedGitPath = "git";

        const cpMock = mock(CpProxy);
        when(cpMock.execAsync(getArgumentForGitVersion(expectedGitPath))).thenReturn(Promise.resolve(correctWinVersionResult));
        const cpSpy = instance(cpMock);

        const fsMock = mock(FsProxy);
        const fsSpy = instance(fsMock);
        const workspaceMock = mock(WorkspaceProxy);
        const workspaceSpy = instance(workspaceMock);

        const gitPathFinder: GitPathFinder = new GitPathFinder(cpSpy, processMock, fsSpy, workspaceSpy);
        gitPathFinder.find().then((gitPath) => {
                assert.equal(gitPath, expectedGitPath);
                done();
            }
        ).catch((err) => {
            done(err);
        });
    });

    test("should handle \"git\" path for linux", function (done) {
        const processMock = getSettedUpProcessSpy("linux");
        const expectedGitPath = "git";

        const cpMock: CpProxy = mock(CpProxy);
        when(cpMock.execAsync(getArgumentForGitVersion(expectedGitPath))).thenReturn(Promise.resolve(correctWinVersionResult));
        const cpSpy = instance(cpMock);

        const fsMock = mock(FsProxy);
        const fsSpy = instance(fsMock);
        const workspaceMock = mock(WorkspaceProxy);
        const workspaceSpy = instance(workspaceMock);

        const gitPathFinder: GitPathFinder = new GitPathFinder(cpSpy, processMock, fsSpy, workspaceSpy);
        gitPathFinder.find().then((gitPath) => {
                assert.equal(gitPath, expectedGitPath);
                done();
            }
        ).catch((err) => {
            done(err);
        });
    });

    test("should handle \"git\" path for macOS", function (done) {
        const processMock = getSettedUpProcessSpy("darwin");
        const expectedGitPath = "git";

        const cpMock: CpProxy = mock(CpProxy);
        when(cpMock.execAsync(getArgumentForGitVersion(expectedGitPath))).thenReturn(Promise.resolve(correctWinVersionResult));
        when(cpMock.execAsync("which git")).thenReturn(Promise.resolve(correctDarwinWhichResult));
        const cpSpy = instance(cpMock);

        const fsMock = mock(FsProxy);
        const fsSpy = instance(fsMock);
        const workspaceMock = mock(WorkspaceProxy);
        const workspaceSpy = instance(workspaceMock);

        const gitPathFinder: GitPathFinder = new GitPathFinder(cpSpy, processMock, fsSpy, workspaceSpy);
        gitPathFinder.find().then((gitPath) => {
                assert.equal(gitPath, expectedGitPath);
                done();
            }
        ).catch((err) => {
            done(err);
        });
    });

    test("should handle \"git\" in the \"ProgramFiles/Git/cmd\" for win32", function (done) {
        const processMock = getSettedUpProcessSpy("win32");
        const expectedGitPath = path.join("ProgramFilesPath", "Git", "cmd", "git.exe");
        const unExpectedGitPath = "git";

        const cpMock: CpProxy = mock(CpProxy);
        when(cpMock.execAsync(getArgumentForGitVersion(expectedGitPath))).thenReturn(Promise.resolve(correctWinVersionResult));
        when(cpMock.execAsync(getArgumentForGitVersion(unExpectedGitPath))).thenReturn(Promise.reject(undefined));
        const cpSpy = instance(cpMock);

        const fsMock = mock(FsProxy);
        const fsSpy = instance(fsMock);
        const workspaceMock = mock(WorkspaceProxy);
        const workspaceSpy = instance(workspaceMock);

        const gitPathFinder: GitPathFinder = new GitPathFinder(cpSpy, processMock, fsSpy, workspaceSpy);
        gitPathFinder.find().then((gitPath) => {
                assert.equal(gitPath, expectedGitPath);
                done();
            }
        ).catch((err) => {
            done(err);
        });
    });

    test("should handle \"git\" in the \"PortableGitFolder\" for win32", function (done) {
        const processMock = getSettedUpProcessSpy("win32");
        const unExpectedGitPath = `git`;
        const unExpectedGitPath2 = path.join("ProgramFilesPath", "Git", "cmd", "git.exe");
        const expectedGitPath = path.join("LOCALAPPDATAPath", "GitHub", "PortableGitFolder", "cmd", "git.exe");

        const fsMock = mock(FsProxy);
        when(fsMock.readdirAsync(anyString())).thenReturn(Promise.resolve(["PortableGitFolder"]));
        const fsSpy = instance(fsMock);

        const cpMock: CpProxy = mock(CpProxy);
        when(cpMock.execAsync(getArgumentForGitVersion(expectedGitPath))).thenReturn(Promise.resolve(correctWinVersionResult));
        when(cpMock.execAsync(getArgumentForGitVersion(unExpectedGitPath))).thenReturn(Promise.reject(undefined));
        when(cpMock.execAsync(getArgumentForGitVersion(unExpectedGitPath2))).thenReturn(Promise.reject(undefined));
        const cpSpy = instance(cpMock);

        const workspaceMock = mock(WorkspaceProxy);
        const workspaceSpy = instance(workspaceMock);

        const gitPathFinder: GitPathFinder = new GitPathFinder(cpSpy, processMock, fsSpy, workspaceSpy);
        gitPathFinder.find().then((gitPath) => {
                assert.equal(gitPath, expectedGitPath);
                done();
            }
        ).catch((err) => {
            done(err);
        });
    });

    test("should handle \"git\" is not installed for win32", function (done) {
        const processMock = getSettedUpProcessSpy("win32");

        const fsMock = mock(FsProxy);
        when(fsMock.readdirAsync(anyString())).thenReturn(Promise.resolve(["PortableGitFolder"]));
        const fsSpy = instance(fsMock);

        const cpMock = mock(CpProxy);
        when(cpMock.execAsync(anyString())).thenReturn(Promise.reject(undefined));
        const cpSpy = instance(cpMock);

        const workspaceMock = mock(WorkspaceProxy);
        const workspaceSpy = instance(workspaceMock);

        const gitPathFinder: GitPathFinder = new GitPathFinder(cpSpy, processMock, fsSpy, workspaceSpy);
        gitPathFinder.find().catch((err: Error) => {
                assert.equal(err.message, "Git path is not found!");
                done();
            }
        ).catch((err) => {
            done(err);
        });
    });

    test("should handle \"git\" is not installed for linux", function (done) {
        const processMock = getSettedUpProcessSpy("linux");

        const cpMock = mock(CpProxy);
        when(cpMock.execAsync(anyString())).thenReturn(Promise.reject(undefined));
        const cpSpy = instance(cpMock);

        const fsMock = mock(FsProxy);
        const fsSpy = instance(fsMock);
        const workspaceMock = mock(WorkspaceProxy);
        const workspaceSpy = instance(workspaceMock);

        const gitPathFinder: GitPathFinder = new GitPathFinder(cpSpy, processMock, fsSpy, workspaceSpy);
        gitPathFinder.find().catch((err: Error) => {
                assert.equal(err.message, "Git path is not found!");
                done();
            }
        ).catch((err) => {
            done(err);
        });
    });

    test("should handle \"git\" is not installed for darwin", function (done) {
        const processMock = getSettedUpProcessSpy("darwin");

        const cpMock = mock(CpProxy);
        when(cpMock.execAsync(anyString())).thenReturn(Promise.reject(undefined));
        const cpSpy = instance(cpMock);

        const fsMock = mock(FsProxy);
        const fsSpy = instance(fsMock);
        const workspaceMock = mock(WorkspaceProxy);
        const workspaceSpy = instance(workspaceMock);

        const gitPathFinder: GitPathFinder = new GitPathFinder(cpSpy, processMock, fsSpy, workspaceSpy);
        gitPathFinder.find().catch((err: Error) => {
                assert.equal(err.message, "Git path is not found!");
                done();
            }
        ).catch((err) => {
            done(err);
        });
    });

    test("should handle \"git\" in the \"/usr/bin/\" for linux with xcode-select installed", function (done) {
        const processMock = getSettedUpProcessSpy("darwin");

        const cpMock = mock(CpProxy);
        when(cpMock.execAsync("which git")).thenReturn(Promise.resolve(usrBinGitDarwinWhichResult));
        when(cpMock.execAsync("\"/usr/bin/git\" --version")).thenReturn(Promise.resolve(correctWinVersionResult));
        when(cpMock.execAsync("xcode-select -p")).thenReturn(Promise.resolve(correctWinVersionResult));
        const cpSpy = instance(cpMock);

        const fsMock = mock(FsProxy);
        const fsSpy = instance(fsMock);
        const workspaceMock = mock(WorkspaceProxy);
        const workspaceSpy = instance(workspaceMock);

        const gitPathFinder: GitPathFinder = new GitPathFinder(cpSpy, processMock, fsSpy, workspaceSpy);
        gitPathFinder.find().then((gitPath) => {
                assert.equal(gitPath, "/usr/bin/git");
                done("broken");
            }
        ).catch((err) => {
            done(err);
        });
    });

    test("should handle \"git\" in the \"/usr/bin/\" for linux without xcode-select installed", function (done) {
        const processMock = getSettedUpProcessSpy("darwin");
        const err: any = {
            code: 2
        };
        const cpMock = mock(CpProxy);
        when(cpMock.execAsync("which git")).thenReturn(Promise.resolve(usrBinGitDarwinWhichResult));
        when(cpMock.execAsync("\"/usr/bin/git\" --version")).thenReturn(Promise.resolve(correctWinVersionResult));
        when(cpMock.execAsync("xcode-select -p")).thenReturn(Promise.reject<any>(err));
        const cpSpy = instance(cpMock);

        const fsMock = mock(FsProxy);
        const fsSpy = instance(fsMock);
        const workspaceMock = mock(WorkspaceProxy);
        const workspaceSpy = instance(workspaceMock);

        const gitPathFinder: GitPathFinder = new GitPathFinder(cpSpy, processMock, fsSpy, workspaceSpy);
        gitPathFinder.find().catch((err: Error) => {
                assert.equal(err.message, MessageConstants.GIT_PATH_IS_NOT_FOUND);
                done("broken");
            }
        ).catch((err) => {
            done(err);
        });
    });

});

function getSettedUpProcessSpy(platform: NodeJS.Platform): ProcessProxy {
    const processMock = mock(ProcessProxy);
    when(processMock.platform).thenReturn(platform);
    const envArgs = [];
    envArgs["ProgramW6432"] = "ProgramW6432Path";
    envArgs["ProgramFiles(x86)"] = "ProgramFiles(x86)Path";
    envArgs["ProgramFiles"] = "ProgramFilesPath";
    envArgs["LOCALAPPDATA"] = "LOCALAPPDATAPath";
    when(processMock.env).thenReturn(envArgs);
    return instance(processMock);
}

function getArgumentForGitVersion(path: string): string {
    return `"${path}" --version`;
}
