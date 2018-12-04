import {assert} from "chai";
import {GitIsActiveValidator} from "../../../src/bll/cvsutils/gitisactivevalidator";
import {instance, mock, when} from "ts-mockito";
import {CpProxy} from "../../../src/bll/moduleproxies/cp-proxy";

suite("Git Is Active Validator", () => {

    const correctVersionResult: any = {
        stdout: "git version 2.13.2.windows.1"
    };

    const inCorrectVersionResult: any = {
        stdout: "git version 1.13.2.windows.1"
    };

    test("should handle \"git\" with valid params", function (done) {
        const gitPath: string = "git";
        const rootPath: string = "testRootPath";

        const cpMock = mock(CpProxy);
        when(cpMock.execAsync(getArgumentForGitVersion(gitPath))).thenReturn(Promise.resolve(correctVersionResult));
        when(cpMock.execAsync(getArgumentForGitIsActiveCommand(gitPath, rootPath))).thenReturn(Promise.resolve(undefined));
        const cpSpy = instance(cpMock);

        const gitIsActiveValidator: GitIsActiveValidator = new GitIsActiveValidator(gitPath, rootPath, cpSpy);
        gitIsActiveValidator.validate().then(() => {
                done();
            }
        ).catch((err) => {
            done(err);
        });
    });

    test("should handle git has incorrect version", function (done) {
        const gitPath: string = "git";
        const rootPath: string = "testRootPath";

        const cpMock = mock(CpProxy);
        when(cpMock.execAsync(getArgumentForGitVersion(gitPath))).thenReturn(Promise.resolve(inCorrectVersionResult));
        when(cpMock.execAsync(getArgumentForGitIsActiveCommand(gitPath, rootPath))).thenReturn(Promise.resolve(undefined));
        const cpSpy = instance(cpMock);

        const gitIsActiveValidator: GitIsActiveValidator = new GitIsActiveValidator(gitPath, rootPath, cpSpy);
        gitIsActiveValidator.validate().then(() => {
                done("Version should be incorrect");
            }
        ).catch((err: Error) => {
            assert.equal(err.message, "Git 1.13.2.windows.1 installed. TeamCity extension requires git >= 2");
            done();
        });
    });

    test("should handle not in git repo", function (done) {
        const gitPath: string = "git";
        const rootPath: string = "testRootPath";

        const cpMock = mock(CpProxy);
        when(cpMock.execAsync(getArgumentForGitVersion(gitPath))).thenReturn(Promise.resolve(correctVersionResult));
        when(cpMock.execAsync(getArgumentForGitIsActiveCommand(gitPath, rootPath))).thenReturn(Promise.reject(undefined));
        const cpSpy = instance(cpMock);

        const gitIsActiveValidator: GitIsActiveValidator = new GitIsActiveValidator(gitPath, rootPath, cpSpy);
        gitIsActiveValidator.validate().then(() => {
                done("There should not be a git repo");
            }
        ).catch((err: Error) => {
            assert.equal(err.message, "Git repository was not determined");
            done();
        });
    });
});

function getArgumentForGitIsActiveCommand(path: string, workspaceRootPath: string): string {
    return `"${path}" -C "${workspaceRootPath}" rev-parse --show-toplevel`;
}

function getArgumentForGitVersion(path: string): string {
    return `"${path}" --version`;
}
