import { IMessageBase } from "./IMessageBase";

export interface ICommandBase {

    execute(message: IMessageBase): Promise<void>;

    showMessage(message: IMessageBase): Promise<void>;
}