import { singleton } from 'aurelia-dependency-injection';
import { Message, MessageUpdate } from '../typings/types';
import { ObjectService } from "../App logic/Services/ObjectService";
import { PreChecks } from '../App logic/Utils/preChecks';

@singleton(true)
export class MiddlewareService {
    constructor() {
    }

    async getProjects(msg: Array<string>): Promise<Array<string>> {
        return new ObjectService().getProjects();
        // return this.send(MiddlewareRequestMethod.QueryProjects, MiddlewareResponseMethod.GetProjects, false, msg) as Promise<Array<string>>;
    }

    async getObjects(paths: Array<string>): Promise<Array<Message>> {
        return new ObjectService().getObjects(paths);
        // return this.send(MiddlewareRequestMethod.QueryObjects, MiddlewareResponseMethod.GetObjects, false, paths) as Promise<Array<Message>>;
    }
    async isChangeValid(msg: MessageUpdate): Promise<{ valid: boolean, reason: string }> {
        return PreChecks.isChangeValid(msg);
    }
    async getProceduresWhichCouldBeDeletedAfterwards(msg: MessageUpdate): Promise<Array<{ procedureName: string, parameterTypes: string[] }>> {
        return new ObjectService().getProceduresWhichCouldBeDeletedAfterwards(msg);
    }
    async checkIfOldAndNewProcedureExists(msg: MessageUpdate): Promise<boolean> {
        return new ObjectService().checkIfOldAndNewProcedureExists(msg);
    }

    async saveChanges(msg: MessageUpdate): Promise<boolean> {
        return new ObjectService().saveChanges(msg);
    }
}

export enum MiddlewareRequestMethod {
    QueryProjects = 'QueryProjects',
    QueryObjects = 'QueryObjects',
    SaveChanges = 'SaveChanges',
    CheckSaveChanges = 'CheckSaveChanges'
}

export enum MiddlewareResponseMethod {
    GetProjects = 'GetProjects',
    GetObjects = 'GetObjects',
    SaveChangesResponse = 'SaveChangesResponse',
    UpdateObjects = 'UpdateObjects',
    CheckSaveChangesResponse = 'CheckSaveChangesResponse'
}