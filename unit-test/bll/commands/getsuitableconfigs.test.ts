import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", { });
import {GetSuitableConfigs} from "../../../src/bll/commands/getsuitableconfigs";
import * as tsMockito from "ts-mockito";
import {anything, mock, verify, when} from "ts-mockito";
import {CvsProviderProxy} from "../../../src/dal/cvsproviderproxy";
import {RemoteBuildServer} from "../../../src/dal/remotebuildserver";
import {XmlParser} from "../../../src/bll/utils/xmlparser";
import {CheckInInfo} from "../../../src/bll/entities/checkininfo";
import {TeamCityOutput} from "../../../src/view/teamcityoutput";
import {IResourceProvider} from "../../../src/view/dataproviders/interfaces/iresourceprovider";
import {IBuildProvider} from "../../../src/view/dataproviders/interfaces/ibuildprovider";
import * as TypeMoq from "typemoq";

suite("Get Suitable Configs", () => {
    test("should verify that we request data from resource provider", function (done) {
        const checkInInfoMock: CheckInInfo = mock(CheckInInfo);
        const checkInInfoSpy: CheckInInfo = tsMockito.instance(checkInInfoMock);
        const mockedProviderProxy: CvsProviderProxy = mock(CvsProviderProxy);
        const providerProxySpy: CvsProviderProxy = tsMockito.instance(mockedProviderProxy);

        const remoteBuildServerMock: RemoteBuildServer = tsMockito.mock(RemoteBuildServer);
        when(remoteBuildServerMock.getSuitableConfigurations(anything())).thenReturn(Promise.resolve(["anyData"]));
        const remoteBuildServerSpy: RemoteBuildServer = tsMockito.instance(remoteBuildServerMock);

        const xmlParserMock: XmlParser = tsMockito.mock(XmlParser);
        const xmlParserSpy: XmlParser = tsMockito.instance(xmlParserMock);

        const resourceProviderMock: TypeMoq.IMock<IResourceProvider> = TypeMoq.Mock.ofType<IResourceProvider>();
        resourceProviderMock.setup((bar) => bar.getSelectedContent()).returns(() => [checkInInfoSpy, checkInInfoSpy]);
        const resourceProviderSpy: IResourceProvider = resourceProviderMock.object;

        const buildProviderMock: TypeMoq.IMock<IBuildProvider> = TypeMoq.Mock.ofType<IBuildProvider>();
        const buildProviderSpy: IBuildProvider = buildProviderMock.object;

        const outputMock = mock(TeamCityOutput);
        const outputSpy = tsMockito.instance(outputMock);
        const testableCommand = new GetSuitableConfigs(providerProxySpy, resourceProviderSpy, buildProviderSpy, remoteBuildServerSpy, xmlParserSpy, outputSpy);
        testableCommand.exec().then(() => {
            resourceProviderMock.verify((bar) => bar.getSelectedContent(), TypeMoq.Times.atLeastOnce());
            done();
        }).catch((err) => {
            done("There is no reason for error: " + err);
        });
    });

    test("should verify we request data from resource provider but there are no files selected", function (done) {
        const mockedProviderProxy: CvsProviderProxy = mock(CvsProviderProxy);
        const providerProxySpy: CvsProviderProxy = tsMockito.instance(mockedProviderProxy);

        const remoteBuildServerMock: RemoteBuildServer = tsMockito.mock(RemoteBuildServer);
        when(remoteBuildServerMock.getSuitableConfigurations(anything())).thenReturn(Promise.resolve(["anyData"]));
        const remoteBuildServerSpy: RemoteBuildServer = tsMockito.instance(remoteBuildServerMock);

        const xmlParserMock: XmlParser = tsMockito.mock(XmlParser);
        const xmlParserSpy: XmlParser = tsMockito.instance(xmlParserMock);

        const resourceProviderMock: TypeMoq.IMock<IResourceProvider> = TypeMoq.Mock.ofType<IResourceProvider>();
        resourceProviderMock.setup((bar) => bar.getSelectedContent()).returns(() => []);
        const resourceProviderSpy: IResourceProvider = resourceProviderMock.object;

        const buildProviderMock: TypeMoq.IMock<IBuildProvider> = TypeMoq.Mock.ofType<IBuildProvider>();
        const buildProviderSpy: IBuildProvider = buildProviderMock.object;

        const outputMock = mock(TeamCityOutput);
        const outputSpy = tsMockito.instance(outputMock);
        const testableCommand = new GetSuitableConfigs(providerProxySpy, resourceProviderSpy, buildProviderSpy, remoteBuildServerSpy, xmlParserSpy, outputSpy);
        testableCommand.exec().then(() => {
            done("An exception was expected");
        }).catch(() => {
            done();
        });
    });

    test("should verify that we send any data to remoteBuildServer", function (done) {
        const checkInInfoMock: CheckInInfo = mock(CheckInInfo);
        const checkInInfoSpy: CheckInInfo = tsMockito.instance(checkInInfoMock);
        const mockedProviderProxy: CvsProviderProxy = mock(CvsProviderProxy);
        const providerProxySpy: CvsProviderProxy = tsMockito.instance(mockedProviderProxy);
        const remoteBuildServerMock: RemoteBuildServer = tsMockito.mock(RemoteBuildServer);
        when(remoteBuildServerMock.getSuitableConfigurations(anything())).thenReturn(Promise.resolve(["anyData"]));
        const remoteBuildServerSpy: RemoteBuildServer = tsMockito.instance(remoteBuildServerMock);
        const xmlParserMock: XmlParser = tsMockito.mock(XmlParser);
        const xmlParserSpy: XmlParser = tsMockito.instance(xmlParserMock);

        const resourceProviderMock: TypeMoq.IMock<IResourceProvider> = TypeMoq.Mock.ofType<IResourceProvider>();
        resourceProviderMock.setup((bar) => bar.getSelectedContent()).returns(() => [checkInInfoSpy, checkInInfoSpy]);
        const resourceProviderSpy: IResourceProvider = resourceProviderMock.object;

        const buildProviderMock: TypeMoq.IMock<IBuildProvider> = TypeMoq.Mock.ofType<IBuildProvider>();
        const buildProviderSpy: IBuildProvider = buildProviderMock.object;

        const outputMock = mock(TeamCityOutput);
        const outputSpy = tsMockito.instance(outputMock);
        const testableCommand = new GetSuitableConfigs(providerProxySpy, resourceProviderSpy, buildProviderSpy, remoteBuildServerSpy, xmlParserSpy, outputSpy);

        testableCommand.exec().then(() => {
            verify(remoteBuildServerMock.getSuitableConfigurations(anything())).called();
            done();
        }).catch((err) => {
            done("There is no reason for error: " + err);
        });
    });

    test("should verify that we put any data to buildProvider", function (done) {
        const checkInInfoMock: CheckInInfo = mock(CheckInInfo);
        const checkInInfoSpy: CheckInInfo = tsMockito.instance(checkInInfoMock);
        const mockedProviderProxy: CvsProviderProxy = mock(CvsProviderProxy);
        const providerProxySpy: CvsProviderProxy = tsMockito.instance(mockedProviderProxy);
        const remoteBuildServerMock: RemoteBuildServer = tsMockito.mock(RemoteBuildServer);
        when(remoteBuildServerMock.getSuitableConfigurations(anything())).thenReturn(Promise.resolve(["anyData"]));
        const remoteBuildServerSpy: RemoteBuildServer = tsMockito.instance(remoteBuildServerMock);

        const xmlParserMock: XmlParser = tsMockito.mock(XmlParser);
        const xmlParserSpy: XmlParser = tsMockito.instance(xmlParserMock);

        const resourceProviderMock: TypeMoq.IMock<IResourceProvider> = TypeMoq.Mock.ofType<IResourceProvider>();
        resourceProviderMock.setup((bar) => bar.getSelectedContent()).returns(() => [checkInInfoSpy, checkInInfoSpy]);
        const resourceProviderSpy: IResourceProvider = resourceProviderMock.object;

        const buildProviderMock: TypeMoq.IMock<IBuildProvider> = TypeMoq.Mock.ofType<IBuildProvider>();
        const buildProviderSpy: IBuildProvider = buildProviderMock.object;

        const outputMock = mock(TeamCityOutput);
        const outputSpy = tsMockito.instance(outputMock);

        const testableCommand = new GetSuitableConfigs(providerProxySpy, resourceProviderSpy, buildProviderSpy, remoteBuildServerSpy, xmlParserSpy, outputSpy);
        testableCommand.exec().then(() => {
            buildProviderMock.verify((foo) => foo.setContent(TypeMoq.It.isAny()), TypeMoq.Times.atLeastOnce());
            done("broken");
        }).catch((err) => {
            done("There is no reason for error: " + err);
        });
    });
});
