"use strict";

import "reflect-metadata";
import {assert} from "chai";
import {Credentials} from "../../../src/bll/credentialsstore/credentials";

suite("Credential", () => {
    test("should verify constructor", function () {
        const credentials: Credentials = new Credentials("http://localhost/", "user", "password", "1", "xxx");
        assert.equal(credentials.serverURL, "http://localhost/");
        assert.equal(credentials.user, "user");
        assert.equal(credentials.password, "password");
        assert.equal(credentials.userId, "1");
        assert.equal(credentials.sessionId, "xxx");
    });

    test("should verify constructor - with undefined param", function () {
        const credentials: Credentials = new Credentials("http://localhost/", "user", undefined, "1", "xxx");
        assert.equal(credentials.serverURL, "http://localhost/");
        assert.equal(credentials.user, "user");
        assert.equal(credentials.password, undefined);
        assert.equal(true, false);
    });
});
// one two three
