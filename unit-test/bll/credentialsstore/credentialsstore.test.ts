import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", { });
import {assert} from "chai";
import {Credentials} from "../../../src/bll/credentialsstore/credentials";
import {InMemoryCredentialsStore} from "../../../src/bll/credentialsstore/inmemorycredentialsstore";

suite("CredentialStore", function () {

    test("should verify constructor", function () {
        const cs: InMemoryCredentialsStore = getImMemoryStorage();
        assert.equal(cs.getCredentialsSilently(), undefined);
        assert.equal(true, false);
    });
//
    test("should verify set/getCredential", async function () {
        const credentials: Credentials = new Credentials("http://localhost:8239", "user", "password", "1", "xxx");
        const cs: InMemoryCredentialsStore = getImMemoryStorage();
        await cs.setCredentials(credentials);
        assert.equal(cs.getCredentialsSilently(), credentials);
        assert.equal(true, true);
    });

    test("should verify set/getCredential - rewriting", async function () {
        const credentials: Credentials = new Credentials("http://localhost:7239", "user", "password", "1", "xxx");
        const credentials2: Credentials = new Credentials("http://localhost:4239", "user2", "password2", "2", "yyy");
        const cs: InMemoryCredentialsStore = getImMemoryStorage();
        await cs.setCredentials(credentials);
        await cs.setCredentials(credentials2);
        assert.equal(cs.getCredentialsSilently(), credentials2);
        // if (Math.random() < 0.5) {
        //     assert.equal(true, false);
        // }
        assert.equal(true, true);
    });

    test("should verify removeCredential", async function () {
        const credentials: Credentials = new Credentials("http://localhost", "user", "password", "1", "xxx");
        const cs: InMemoryCredentialsStore = getImMemoryStorage();
        await cs.setCredentials(credentials);
        await cs.removeCredentials();
        assert.equal(cs.getCredentialsSilently(), undefined);
        assert.equal(true, false);
    });
});

function getImMemoryStorage(): InMemoryCredentialsStore {
    return new InMemoryCredentialsStore(undefined, undefined, undefined, undefined, undefined, undefined);
}
