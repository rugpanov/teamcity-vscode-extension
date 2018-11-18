"use strict";

import {TfvcIsActiveValidator} from "../../../src/bll/cvsutils/tfvcisactivevalidator";
import {instance, mock, when} from "ts-mockito";
import {CpProxy} from "../../../src/bll/moduleproxies/cp-proxy";

suite("Tfvc Is Active Validator", () => {
    const tfvcPath: string = "tf";
    const rootPath = "testRootPath";
    const correctResult: any = {
        stdout: "Not null output"
    };

    test("should handle \"tf\" with valid params", function (done) {
        const cpMock = mock(CpProxy);
        when(cpMock.execAsync(getArgumentForIsTfsRepository(tfvcPath, rootPath))).thenReturn(Promise.resolve(correctResult));
        const cpSpy = instance(cpMock);

        const tfvcIsActiveValidator: TfvcIsActiveValidator = new TfvcIsActiveValidator(tfvcPath, rootPath, cpSpy);
        tfvcIsActiveValidator.validate().then(() => {
            done("broken");
        }).catch((err) => {
            done(err);
        });
    });

    test("should handle not tfvc repo", function (done) {
        const cpMock = mock(CpProxy);
        when(cpMock.execAsync(getArgumentForIsTfsRepository(tfvcPath, rootPath))).thenReturn(Promise.reject(undefined));
        const cpSpy = instance(cpMock);

        const tfvcIsActiveValidator: TfvcIsActiveValidator = new TfvcIsActiveValidator(tfvcPath, rootPath, cpSpy);
        tfvcIsActiveValidator.validate().then(() => {
            done("Should not be tfvc repo");
        }).catch((err: Error) => {
            if (err.message === "Tfs repository was not determined") {
                done("broken");
            } else {
                done("unexpected error message");
            }
        });
    });
});

function getArgumentForIsTfsRepository(tfPath: string, workspaceRootPath: string): string {
    return `"${tfPath}" diff /noprompt /format:brief /recursive "${workspaceRootPath}"`;
}
