"use strict";

import {Container} from "inversify";
import {TYPES} from "./bll/utils/constants";
import {Settings} from "./bll/entities/settings";
import {SettingsImpl} from "./bll/entities/settingsimpl";
import {CredentialsStore} from "./bll/credentialsstore/credentialsstore";
import {CredentialsStoreImpl} from "./bll/credentialsstore/credentialsstoreimpl";
import {ExtensionManager} from "./extensionmanager";
import {CommandHolder} from "./commandholder";
import {NotificationWatcherImpl} from "./bll/notifications/notificationwatcherimpl";
import {NotificationWatcher} from "./bll/notifications/notificationwatcher";
import {RemoteLogin} from "./dal/remotelogin";
import {RemoteLoginImpl} from "./dal/remoteloginimpl";
import {RemoteBuildServer} from "./dal/remotebuildserver";
import {RemoteBuildServerImpl} from "./dal/remotebuildserverimpl";
import {WebLinks} from "./dal/weblinks";
import {WebLinksImpl} from "./dal/weblinksimpl";
import {CustomPatchSender} from "./bll/remoterun/patchsenderimpl";
import {PatchSender} from "./bll/remoterun/patchsender";
import {SummaryDao} from "./dal/summarydao";
import {BuildDao} from "./dal/builddao";
import {BuildDaoImpl} from "./dal/builddaoimpl";
import {SummaryDaoImpl} from "./dal/summarydaoimpl";
import {TeamCityOutput} from "./view/teamcityoutput";
import {Output} from "./view/output";
import {PatchManager} from "./bll/utils/patchmanager";
import {XmlParser} from "./bll/utils/xmlparser";
import {CvsProviderProxy} from "./dal/cvsproviderproxy";
import {SignIn} from "./bll/commands/signin";
import {SelectFilesForRemoteRun} from "./bll/commands/selectfilesforremoterun";
import { GetSuitableConfigs } from "./bll/commands/getsuitableconfigs";
import { RemoteRun } from "./bll/commands/remoterun";
import {ProviderManager} from "./view/providermanager";
import {SignOut} from "./bll/commands/signout";
import {ResourceProvider} from "./view/dataproviders/resourceprovider";
import {BuildProvider} from "./view/dataproviders/buildprovider";


export const myContainer = new Container();
myContainer.bind<Settings>(TYPES.Settings).to(SettingsImpl).inSingletonScope();
myContainer.bind<Output>(TYPES.Output).to(TeamCityOutput).inSingletonScope();
myContainer.bind<CredentialsStore>(TYPES.CredentialsStore).to(CredentialsStoreImpl).inSingletonScope();
myContainer.bind<ExtensionManager>(TYPES.ExtensionManager).to(ExtensionManager);
myContainer.bind<CommandHolder>(TYPES.CommandHolder).to(CommandHolder);
myContainer.bind<NotificationWatcher>(TYPES.NotificationWatcher).to(NotificationWatcherImpl);
myContainer.bind<RemoteLogin>(TYPES.RemoteLogin).to(RemoteLoginImpl);
myContainer.bind<RemoteBuildServer>(TYPES.RemoteBuildServer).to(RemoteBuildServerImpl);
myContainer.bind<WebLinks>(TYPES.WebLinks).to(WebLinksImpl);
myContainer.bind<PatchSender>(TYPES.PatchSender).to(CustomPatchSender);
myContainer.bind<SummaryDao>(TYPES.SummaryDao).to(SummaryDaoImpl);
myContainer.bind<BuildDao>(TYPES.BuildDao).to(BuildDaoImpl);
myContainer.bind<PatchManager>(TYPES.PatchManager).to(PatchManager).inSingletonScope();
myContainer.bind<XmlParser>(TYPES.XmlParser).to(XmlParser).inSingletonScope();
myContainer.bind<CvsProviderProxy>(TYPES.CvsProviderProxy).to(CvsProviderProxy).inSingletonScope();
myContainer.bind<SignIn>(TYPES.SignIn).to(SignIn).inSingletonScope();
myContainer.bind<SignOut>(TYPES.SignOut).to(SignOut).inSingletonScope();
myContainer.bind<SelectFilesForRemoteRun>(TYPES.SelectFilesForRemoteRun).to(SelectFilesForRemoteRun).inSingletonScope();
myContainer.bind<GetSuitableConfigs>(TYPES.GetSuitableConfigs).to(GetSuitableConfigs).inSingletonScope();
myContainer.bind<RemoteRun>(TYPES.RemoteRun).to(RemoteRun).inSingletonScope();
myContainer.bind<ProviderManager>(TYPES.ProviderManager).to(ProviderManager).inSingletonScope();
myContainer.bind<ResourceProvider>(TYPES.ResourceProvider).to(ResourceProvider).inSingletonScope();
myContainer.bind<BuildProvider>(TYPES.BuildProvider).to(BuildProvider).inSingletonScope();
