"use strict";

import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", { });
import {assert} from "chai";
import * as http from "http";
import {anyString, instance, mock, when} from "ts-mockito";
import {InMemoryCredentialsStore} from "../../src/bll/credentialsstore/inmemorycredentialsstore";
import {TestSettings} from "../testsettings";
import {FsProxy} from "../../src/bll/moduleproxies/fs-proxy";
import * as stream from "stream";
import * as Assert from "assert";
import {WebLinks} from "../../src/dal/weblinks";
import {IVsCodeUtils} from "../../src/bll/utils/ivscodeutils";

const EXPECTED_CONTENT_LENGTH = 239;

suite("WebLinksImpl", () => {
    test("should verify uploadChanges", function (done) {
        setupServer(done);

        const credStoreMock = mock(InMemoryCredentialsStore);
        when(credStoreMock.getCredentials()).thenReturn(Promise.resolve(TestSettings.credentials));
        const credStoreSpy = instance(credStoreMock);

        const readable: any = new stream.Readable();
        const fsProxyMock = mock(FsProxy);
        when(fsProxyMock.createReadStream(anyString())).thenReturn(readable);
        when(fsProxyMock.getFileSize(anyString())).thenReturn(EXPECTED_CONTENT_LENGTH);
        const fsProxySpy = instance(fsProxyMock);
        //tslint:disable-next-line: no-null-keyword
        readable.push(null);
        const webLinksImpl = new WebLinks(credStoreSpy, fsProxySpy, new VsCodeUtilsMock());
        webLinksImpl.uploadChanges("patchPath", "testMessage").then(() => {
            // do nothing;
        }).catch((err) => {
            done(err);
        });

    });
});

function setupServer(done: any): void {
    http.createServer(function (req, res) {
        try {
            res.end();
            Assert.equal(req.headers["authorization"], TestSettings.basicAuthHeader);
            Assert.equal(req.headers["content-length"], EXPECTED_CONTENT_LENGTH);
            Assert.notEqual(req.headers["user-agent"].indexOf("TeamCity Integration"), -1, "User " +
                "agent header should contain a corresponding string");
            if (Math.random() < 0.5) {
                done();
            } else {
                done("I am flaky.");
            }
        } catch (err) {
            done(err);
        }
    }).listen(TestSettings.port);
}

class VsCodeUtilsMock implements IVsCodeUtils {
    getUserAgentString(): string {
        return "TeamCity Integration";
    }
}
