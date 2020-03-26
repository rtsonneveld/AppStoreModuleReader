"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const mendixplatformsdk_1 = require("mendixplatformsdk");
const express = require("express");
const typescript_rest_1 = require("typescript-rest");
var when = require('when');
async function GetMendixAppData(username, apiKey, projectName, projectId, branch, revision) {
    const client = new mendixplatformsdk_1.MendixSdkClient(username, apiKey);
    //await client.platform().
    let project = new mendixplatformsdk_1.Project(client, projectId, projectName);
    let appStoreModules = [];
    let scheduledEvents = [];
    const workingCopy = await project.createWorkingCopy(new mendixplatformsdk_1.Revision(revision, new mendixplatformsdk_1.Branch(project, branch)));
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
let ModelInfoService = class ModelInfoService {
    getmodelinfo(username, apiKey, projectName, projectId, branch, revision) {
        console.log("1, apiKey is " + apiKey);
        return new Promise(function (resolve, reject) {
            GetMendixAppData(username, apiKey, projectName, projectId, branch, revision).then((result) => {
                resolve(JSON.stringify(result));
            });
        });
    }
};
__decorate([
    typescript_rest_1.POST,
    __param(0, typescript_rest_1.QueryParam("username")),
    __param(1, typescript_rest_1.QueryParam("apiKey")),
    __param(2, typescript_rest_1.QueryParam("projectName")),
    __param(3, typescript_rest_1.QueryParam("projectId")),
    __param(4, typescript_rest_1.QueryParam("branch")),
    __param(5, typescript_rest_1.QueryParam("revision")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Number]),
    __metadata("design:returntype", Promise)
], ModelInfoService.prototype, "getmodelinfo", null);
ModelInfoService = __decorate([
    typescript_rest_1.Path("getmodelinfo")
], ModelInfoService);
let app = express();
typescript_rest_1.Server.buildServices(app);
app.listen(3000, function () {
    console.log('Rest Server listening on port 3000!');
});
/*
axios.get('https://deploy.mendix.com/api/1/apps/', options)
.then((response) => {
    let apps : MendixApp[] = [];
    apps = <MendixApp[]>response.data;

    console.log(`Getting app data for ${apps.length} apps...`);
    let progress = 0;

    let promises:Promise<any>[] = [];

    promises = apps.map((app)=>{
        return GetMendixAppData(app.Name, app.ProjectId).then((data)=>{app.data = data}.then(() => {
            progress++;
            console.log(`Progress: ${progress}/${apps.length} done`);
        }))
    });

    Promise.all<MendixApp[]>(apps.map((app)=>{
        return GetMendixAppData(app.Name, app.ProjectId).then((data)=>{app.data = data}).then(() => {
            progress++;
            console.log(`Progress: ${progress}/${apps.length} done`);
        });
    })).then(()=>{

        console.log("Finished getting app data!");
        console.log(apps);

    })

}).catch((error) => {
    console.error(error);
});

*/ 
