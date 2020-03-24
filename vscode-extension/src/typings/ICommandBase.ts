import { IMessageBase } from "./IMessageBase";

export interface ICommandBase {
    execute(message?: IMessageBase): Promise<void>;
}