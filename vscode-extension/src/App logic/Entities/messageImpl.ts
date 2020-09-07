import { Message, MessageState, ALTestRunnerResult, MessageDetails } from "../../typings/types";

export class MessageImpl implements Message {
    Uid!: string;
    Project!: string;
    Feature!: string;
    Id?: number | undefined;
    Scenario!: string;
    Codeunit!: string;
    FsPath!: string;
    MethodName!: string;
    IsDirty!: boolean;
    State!: MessageState;
    TestRunnerResult!: ALTestRunnerResult;
    Details!: MessageDetails;
    constructor() { }
}