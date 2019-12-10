import { IMessageBase } from './../typings/IMessageBase';
import { ICommandBase } from '../typings/ICommandBase';
export class CommandBase implements ICommandBase {

    execute(message: IMessageBase): Promise<void> {
        throw new Error("Method not implemented.");
    }    
    
    showMessage(message: IMessageBase): Promise<void> {
        throw new Error("Method not implemented.");
    }
}