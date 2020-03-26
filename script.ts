import { MendixSdkClient, OnlineWorkingCopy, Project, Revision, Branch } from 'mendixplatformsdk';
import { domainmodels, scheduledevents } from 'mendixmodelsdk';
import axios, { AxiosRequestConfig, AxiosPromise } from 'axios';
import * as express from "express";
import { Server, Path, GET, PathParam, Return, Errors, QueryParam, POST } from "typescript-rest";
import { resolve } from 'when';

var when = require('when');
interface AppStoreModule {
    name: string;
    appStoreVersion: string;
    appStoreGUID: string;
}

interface ScheduledEvent {
    name: string;
    interval: number;
    intervalType: string;
    startTime: string;
    microflow: string;
}

interface MendixApp {
    AppId: string,
    ProjectId: string,
    Url: string,
    Name: string,
    data?: MendixAppData
}

interface MendixAppData {
    appStoreModules: AppStoreModule[],
    scheduledEvents: ScheduledEvent[]
}

async function GetMendixAppData(username: string, apiKey: string, projectName: string, projectId: string, branch: string, revision: number): Promise<MendixAppData> {

    const client = new MendixSdkClient(username, apiKey);

    //await client.platform().
    let project = new Project(client, projectId, projectName);

    let appStoreModules: AppStoreModule[] = [];
    let scheduledEvents: ScheduledEvent[] = [];

    const workingCopy = await project.createWorkingCopy(
        new Revision(revision, new Branch(project, branch))
    );

    for (let entry of workingCopy.model().allModules()) {
        if (entry.fromAppStore) {
            appStoreModules.push({
                name: entry.name,
                appStoreVersion: entry.appStoreVersion,
                appStoreGUID: entry.appStoreVersionGuid
            });
        }
    }

    for (let seEntry of workingCopy.model().allScheduledEvents()) {
        var se = (await seEntry.load());
        scheduledEvents.push({
            name: se.name,
            interval: se.interval,
            intervalType: se.intervalType.name,
            startTime: se.startDateTime,
            microflow: (se.microflowQualifiedName != null ? se.microflowQualifiedName : '')
        });
    }

    return {
        appStoreModules: appStoreModules,
        scheduledEvents: scheduledEvents
    };
}

@Path("getmodelinfo")
class ModelInfoService {

    @POST
    getmodelinfo(
        @QueryParam("username") username: string,
        @QueryParam("apiKey") apiKey: string,
        @QueryParam("projectName") projectName: string,
        @QueryParam("projectId") projectId: string,
        @QueryParam("branch") branch: string,
        @QueryParam("revision") revision: number): Promise<string> {

        console.log("1, apiKey is " + apiKey);

        return new Promise<string>(function (resolve, reject) {

            GetMendixAppData(username, apiKey, projectName, projectId, branch, revision).then((result) => {
                resolve(JSON.stringify(result));
            });
        });
    }
}

let app: express.Application = express();
Server.buildServices(app);

app.listen(3000, function () {
    console.log('Rest Server listening on port 3000!');
});